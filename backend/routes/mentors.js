const express = require('express');
const router = express.Router();
const Mentor = require('../models/Mentor');
const User = require('../models/User');

// 1. GET ALL MENTORS (with filters)
router.get('/', async (req, res) => {
  try {
    const { expertise, available, search, sort = 'featured', page = 1, limit = 12 } = req.query;
    const query = {};
    if (expertise) query.expertise = { $in: expertise.split(',') };
    if (available === 'true') query.available = true;
    if (search) query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { title: { $regex: search, $options: 'i' } },
      { company: { $regex: search, $options: 'i' } },
      { expertise: { $regex: search, $options: 'i' } }
    ];

    const sortMap = {
      featured: { featured: -1, avgRating: -1 },
      rating: { avgRating: -1, reviewCount: -1 },
      sessions: { totalSessions: -1 },
      price_low: { hourlyRate: 1 },
      price_high: { hourlyRate: -1 }
    };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const mentors = await Mentor.find(query)
      .sort(sortMap[sort] || sortMap.featured)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-sessions');

    const total = await Mentor.countDocuments(query);
    res.json({ mentors, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch mentors' });
  }
});

// 2. GET SINGLE MENTOR
router.get('/:id', async (req, res) => {
  try {
    const mentor = await Mentor.findById(req.params.id);
    if (!mentor) return res.status(404).json({ error: 'Mentor not found' });
    res.json(mentor);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch mentor' });
  }
});

// 3. REGISTER AS MENTOR
router.post('/register', async (req, res) => {
  try {
    const existing = await Mentor.findOne({ userId: req.body.userId });
    if (existing) return res.status(400).json({ error: 'You are already registered as a mentor' });
    const mentor = new Mentor(req.body);
    await mentor.save();
    res.status(201).json(mentor);
  } catch (err) {
    res.status(500).json({ error: 'Failed to register as mentor' });
  }
});

// 4. BOOK A SESSION
router.post('/:id/book', async (req, res) => {
  try {
    const { studentId, studentName, scheduledAt, duration, topic } = req.body;
    const mentor = await Mentor.findById(req.params.id);
    if (!mentor) return res.status(404).json({ error: 'Mentor not found' });
    if (!mentor.available) return res.status(400).json({ error: 'Mentor is not available' });

    const session = {
      studentId, studentName, scheduledAt: new Date(scheduledAt),
      duration: duration || 60, topic,
      status: 'pending',
      meetingLink: `https://meet.devleap.ai/${mentor._id}-${Date.now()}`
    };
    mentor.sessions.push(session);
    mentor.totalSessions += 1;
    await mentor.save();
    res.status(201).json({ message: 'Session booked!', session, meetingLink: session.meetingLink });
  } catch (err) {
    res.status(500).json({ error: 'Failed to book session' });
  }
});

// 5. CONFIRM / CANCEL SESSION
router.patch('/:mentorId/sessions/:sessionId', async (req, res) => {
  try {
    const { status } = req.body;
    const mentor = await Mentor.findById(req.params.mentorId);
    const session = mentor.sessions.id(req.params.sessionId);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    session.status = status;
    await mentor.save();
    res.json({ message: `Session ${status}`, session });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update session' });
  }
});

// 6. SUBMIT A REVIEW
router.post('/:id/review', async (req, res) => {
  try {
    const { reviewerId, reviewerName, rating, comment } = req.body;
    const mentor = await Mentor.findById(req.params.id);
    if (!mentor) return res.status(404).json({ error: 'Mentor not found' });

    mentor.reviews.push({ reviewerId, reviewerName, rating, comment });
    // Recalculate avg rating
    const totalRating = mentor.reviews.reduce((sum, r) => sum + r.rating, 0);
    mentor.avgRating = Math.round((totalRating / mentor.reviews.length) * 10) / 10;
    mentor.reviewCount = mentor.reviews.length;
    await mentor.save();
    res.json({ message: 'Review submitted!', avgRating: mentor.avgRating, reviewCount: mentor.reviewCount });
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit review' });
  }
});

// 7. GET MENTOR STATS
router.get('/stats/overview', async (req, res) => {
  try {
    const total = await Mentor.countDocuments();
    const available = await Mentor.countDocuments({ available: true });
    const topRated = await Mentor.find({ available: true }).sort({ avgRating: -1 }).limit(5).select('name title company avgRating avatar');
    const expertiseCount = await Mentor.aggregate([
      { $unwind: '$expertise' },
      { $group: { _id: '$expertise', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    res.json({ total, available, topRated, expertiseCount });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch mentor stats' });
  }
});

// 8. UPDATE MENTOR AVAILABILITY
router.patch('/:id/availability', async (req, res) => {
  try {
    const mentor = await Mentor.findByIdAndUpdate(
      req.params.id,
      { $set: { available: req.body.available, availability: req.body.slots } },
      { new: true }
    );
    res.json(mentor);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update availability' });
  }
});

// 9. GET SESSIONS FOR A STUDENT
router.get('/student/:userId/sessions', async (req, res) => {
  try {
    const sessions = await Mentor.aggregate([
      { $unwind: '$sessions' },
      { $match: { 'sessions.studentId': req.params.userId } },
      { $project: { name: 1, avatar: 1, title: 1, company: 1, session: '$sessions' } }
    ]);
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

// 10. SEED MENTORS
router.post('/seed/bulk', async (req, res) => {
  try {
    const sampleMentors = [
      {
        userId: new (require('mongoose').Types.ObjectId)(), name: 'Sarah Chen', title: 'Staff Engineer',
        company: 'Google', expertise: ['System Design', 'Backend', 'Career'], skills: ['Go', 'Python', 'Kubernetes'],
        bio: '10+ years at Google. Helped 200+ engineers land FAANG offers. Specialized in system design and backend scaling.',
        hourlyRate: 150, avgRating: 4.9, reviewCount: 134, totalSessions: 412, available: true, featured: true, verified: true,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah'
      },
      {
        userId: new (require('mongoose').Types.ObjectId)(), name: 'Marcus Johnson', title: 'Senior SWE',
        company: 'Meta', expertise: ['Frontend', 'React', 'JavaScript'], skills: ['React', 'TypeScript', 'Node.js'],
        bio: 'Former Meta & Netflix engineer. Passionate about building great UX. Coached 100+ developers in frontend mastery.',
        hourlyRate: 120, avgRating: 4.8, reviewCount: 89, totalSessions: 276, available: true, featured: true, verified: true,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=marcus'
      },
      {
        userId: new (require('mongoose').Types.ObjectId)(), name: 'Priya Sharma', title: 'ML Engineer',
        company: 'OpenAI', expertise: ['Machine Learning', 'Python', 'Deep Learning'], skills: ['Python', 'PyTorch', 'TensorFlow'],
        bio: 'ML researcher turned engineer. Published 5 papers. Can guide you from beginner to ML practitioner.',
        hourlyRate: 200, avgRating: 4.9, reviewCount: 67, totalSessions: 198, available: true, featured: true, verified: true,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=priya'
      },
      {
        userId: new (require('mongoose').Types.ObjectId)(), name: 'Alex Rivera', title: 'DevOps Lead',
        company: 'Netflix', expertise: ['DevOps', 'Cloud', 'Kubernetes'], skills: ['AWS', 'Terraform', 'Docker'],
        bio: 'Building infrastructure at Netflix scale. Expert in cloud architecture and SRE practices.',
        hourlyRate: 130, avgRating: 4.7, reviewCount: 45, totalSessions: 132, available: true, verified: true,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex'
      },
      {
        userId: new (require('mongoose').Types.ObjectId)(), name: 'Jordan Kim', title: 'Product Engineer',
        company: 'Stripe', expertise: ['Full Stack', 'Product', 'Startups'], skills: ['React', 'Node.js', 'PostgreSQL'],
        bio: 'Helped grow Stripe from 200 to 8000+ employees. Now helping engineers build product-minded skills.',
        hourlyRate: 110, avgRating: 4.6, reviewCount: 78, totalSessions: 220, available: true,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jordan'
      },
      {
        userId: new (require('mongoose').Types.ObjectId)(), name: 'Amara Okafor', title: 'iOS Lead',
        company: 'Apple', expertise: ['iOS', 'Swift', 'Mobile'], skills: ['Swift', 'SwiftUI', 'Objective-C'],
        bio: 'Built features for iOS apps with 500M+ users. Expert in performance, animations and App Store optimization.',
        hourlyRate: 145, avgRating: 4.8, reviewCount: 56, totalSessions: 167, available: false, verified: true,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=amara'
      }
    ];
    await Mentor.deleteMany({});
    const created = await Mentor.insertMany(sampleMentors);
    res.json({ message: `Seeded ${created.length} mentors`, mentors: created });
  } catch (err) {
    console.error('Seed error:', err);
    res.status(500).json({ error: 'Failed to seed mentors' });
  }
});

module.exports = router;
