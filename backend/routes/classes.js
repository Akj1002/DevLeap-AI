const express = require('express');
const router = express.Router();
const LiveClass = require('../models/LiveClass');

// 1. GET ALL CLASSES
router.get('/', async (req, res) => {
  try {
    const { category, level, sort = 'featured', page = 1, limit = 12, search } = req.query;
    const query = { active: true };
    if (category && category !== 'all') query.category = category;
    if (level && level !== 'all') query.level = level;
    if (search) query.$or = [{ title: { $regex: search, $options: 'i' } }, { instructor: { $regex: search, $options: 'i' } }];
    const sortMap = { featured: { featured: -1, enrolledCount: -1 }, newest: { createdAt: -1 }, rating: { rating: -1 }, popular: { enrolledCount: -1 } };
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const classes = await LiveClass.find(query).sort(sortMap[sort] || sortMap.featured).skip(skip).limit(parseInt(limit)).select('-qna -reviews -schedule.liveUrl');
    const total = await LiveClass.countDocuments(query);
    res.json({ classes, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) { res.status(500).json({ error: 'Failed to fetch classes' }); }
});

// 2. GET SINGLE CLASS
router.get('/:id', async (req, res) => {
  try {
    const cls = await LiveClass.findById(req.params.id);
    if (!cls) return res.status(404).json({ error: 'Class not found' });
    res.json(cls);
  } catch (err) { res.status(500).json({ error: 'Failed to fetch class' }); }
});

// 3. ENROLL
router.post('/:id/enroll', async (req, res) => {
  try {
    const { userId } = req.body;
    const cls = await LiveClass.findById(req.params.id);
    if (!cls) return res.status(404).json({ error: 'Class not found' });
    if (cls.enrolledUsers.includes(userId)) return res.status(400).json({ error: 'Already enrolled' });
    cls.enrolledUsers.push(userId);
    cls.enrolledCount += 1;
    await cls.save();
    res.json({ message: 'Enrolled successfully!', enrolledCount: cls.enrolledCount });
  } catch (err) { res.status(500).json({ error: 'Failed to enroll' }); }
});

// 4. UNENROLL
router.post('/:id/unenroll', async (req, res) => {
  try {
    const { userId } = req.body;
    const cls = await LiveClass.findById(req.params.id);
    cls.enrolledUsers.pull(userId);
    cls.enrolledCount = Math.max(0, cls.enrolledCount - 1);
    await cls.save();
    res.json({ message: 'Unenrolled', enrolledCount: cls.enrolledCount });
  } catch (err) { res.status(500).json({ error: 'Failed to unenroll' }); }
});

// 5. ASK A QUESTION (Q&A)
router.post('/:id/qna', async (req, res) => {
  try {
    const { authorId, authorName, question } = req.body;
    const cls = await LiveClass.findById(req.params.id);
    cls.qna.push({ authorId, authorName, question, answer: '', upvotes: 0 });
    await cls.save();
    res.json({ qna: cls.qna[cls.qna.length - 1] });
  } catch (err) { res.status(500).json({ error: 'Failed to add question' }); }
});

// 6. ANSWER A QUESTION
router.patch('/:id/qna/:qnaId', async (req, res) => {
  try {
    const cls = await LiveClass.findById(req.params.id);
    const q = cls.qna.id(req.params.qnaId);
    if (!q) return res.status(404).json({ error: 'Question not found' });
    q.answer = req.body.answer;
    await cls.save();
    res.json(q);
  } catch (err) { res.status(500).json({ error: 'Failed to answer' }); }
});

// 7. UPVOTE Q&A QUESTION
router.post('/:id/qna/:qnaId/upvote', async (req, res) => {
  try {
    const cls = await LiveClass.findById(req.params.id);
    const q = cls.qna.id(req.params.qnaId);
    q.upvotes += 1; await cls.save();
    res.json({ upvotes: q.upvotes });
  } catch (err) { res.status(500).json({ error: 'Failed to upvote' }); }
});

// 8. SUBMIT REVIEW
router.post('/:id/review', async (req, res) => {
  try {
    const { userId, username, rating, comment } = req.body;
    const cls = await LiveClass.findById(req.params.id);
    cls.reviews.push({ userId, username, rating, comment });
    const totalRating = cls.reviews.reduce((s, r) => s + r.rating, 0);
    cls.rating = Math.round((totalRating / cls.reviews.length) * 10) / 10;
    cls.reviewCount = cls.reviews.length;
    await cls.save();
    res.json({ rating: cls.rating, reviewCount: cls.reviewCount });
  } catch (err) { res.status(500).json({ error: 'Failed to submit review' }); }
});

// 9. GET ENROLLED CLASSES FOR USER
router.get('/user/:userId/enrolled', async (req, res) => {
  try {
    const classes = await LiveClass.find({ enrolledUsers: req.params.userId }).select('-qna -reviews');
    res.json(classes);
  } catch (err) { res.status(500).json({ error: 'Failed to fetch enrolled classes' }); }
});

// 10. STATS
router.get('/meta/stats', async (req, res) => {
  try {
    const total = await LiveClass.countDocuments({ active: true });
    const totalEnrolled = await LiveClass.aggregate([{ $group: { _id: null, total: { $sum: '$enrolledCount' } } }]);
    const byCategory = await LiveClass.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }, { $sort: { count: -1 } }]);
    res.json({ total, totalEnrolled: totalEnrolled[0]?.total || 0, byCategory });
  } catch (err) { res.status(500).json({ error: 'Failed to fetch stats' }); }
});

// 11. SEED CLASSES
router.post('/seed/bulk', async (req, res) => {
  try {
    const now = new Date();
    const samples = [
      { title: 'DSA Mastery Bootcamp', description: 'Complete data structures and algorithms course with 200+ problems solved live.', instructor: 'Sarah Chen', instructorTitle: 'Staff Engineer @ Google', instructorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah', category: 'DSA', level: 'Intermediate', price: 199, duration: '12 weeks', totalLessons: 48, rating: 4.9, reviewCount: 234, enrolledCount: 1847, featured: true, tags: ['leetcode', 'algorithms', 'faang'], startDate: new Date(now.getTime() + 7 * 86400000), curriculum: [{ week: 1, title: 'Arrays & Strings', topics: ['Two Pointers', 'Sliding Window', 'Prefix Sum'] }, { week: 2, title: 'Hash Maps & Sets', topics: ['Frequency Maps', 'Two Sum Patterns', 'Anagram Problems'] }], schedule: [{ date: new Date(now.getTime() + 7 * 86400000), title: 'Kickoff + Arrays Deep Dive', durationMinutes: 120, isLive: true, liveUrl: 'https://meet.devleap.ai/dsa-class' }], announcements: [{ title: 'Early Bird Discount!', content: 'Sign up this week for 20% off. Use code EARLYBIRD.' }] },
      { title: 'System Design for FAANG', description: 'Master large-scale system design. Covers distributed systems, databases, caching, CDNs, and everything needed for senior-level interviews.', instructor: 'Marcus Johnson', instructorTitle: 'Senior SWE @ Meta', instructorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=marcus', category: 'System Design', level: 'Advanced', price: 249, duration: '8 weeks', totalLessons: 32, rating: 4.8, reviewCount: 156, enrolledCount: 1203, featured: true, tags: ['system-design', 'distributed-systems', 'senior'], startDate: new Date(now.getTime() + 14 * 86400000), curriculum: [{ week: 1, title: 'Fundamentals', topics: ['CAP Theorem', 'Consistency Patterns', 'Availability Patterns'] }, { week: 2, title: 'Data Storage', topics: ['SQL vs NoSQL', 'Sharding', 'Replication'] }] },
      { title: 'React & Next.js Mastery', description: 'Build production-grade React applications. Covers hooks, context, SSR, performance optimization, and modern patterns.', instructor: 'Priya Sharma', instructorTitle: 'Frontend Engineer @ Vercel', instructorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=priya', category: 'Frontend', level: 'Intermediate', price: 0, duration: '6 weeks', totalLessons: 24, rating: 4.7, reviewCount: 89, enrolledCount: 3412, featured: false, tags: ['react', 'nextjs', 'frontend', 'free'] },
      { title: 'ML Engineering in Production', description: 'From model training to deployment. FastAPI, Docker, Kubernetes, model monitoring, and MLOps best practices.', instructor: 'Alex Rivera', instructorTitle: 'ML Engineer @ OpenAI', instructorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex', category: 'ML/AI', level: 'Advanced', price: 299, duration: '10 weeks', totalLessons: 40, rating: 4.9, reviewCount: 67, enrolledCount: 789, featured: true, tags: ['mlops', 'production', 'ai'] },
      { title: 'Behavioral Interview Mastery', description: 'Crack the behavioral round at any FAANG company. STAR method, 50+ questions, mock interviews, and personalized feedback.', instructor: 'Jordan Kim', instructorTitle: 'Career Coach @ DevLeap', instructorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jordan', category: 'Career', level: 'Beginner', price: 49, duration: '3 weeks', totalLessons: 12, rating: 4.6, reviewCount: 178, enrolledCount: 2341, tags: ['behavioral', 'career', 'interview'] },
    ];
    await LiveClass.deleteMany({});
    const created = await LiveClass.insertMany(samples);
    res.json({ message: `Seeded ${created.length} classes` });
  } catch (err) { res.status(500).json({ error: 'Failed to seed classes' }); }
});

module.exports = router;
