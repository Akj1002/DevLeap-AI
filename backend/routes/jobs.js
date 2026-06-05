const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const User = require('../models/User');

// 1. GET ALL JOBS (with filtering, searching, pagination)
router.get('/', async (req, res) => {
  try {
    const { search, type, experience, remote, skills, page = 1, limit = 20, sort = 'newest' } = req.query;
    const query = { active: true };

    if (search) {
      query.$text = { $search: search };
    }
    if (type) query.type = type;
    if (experience) query.experience = experience;
    if (remote === 'true') query.remote = true;
    if (skills) {
      const skillArr = skills.split(',').map(s => s.trim());
      query.skills = { $in: skillArr };
    }

    const sortMap = {
      newest: { featured: -1, createdAt: -1 },
      salary: { salaryMax: -1 },
      popular: { 'applications': -1, views: -1 }
    };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const jobs = await Job.find(query)
      .sort(sortMap[sort] || sortMap.newest)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-applications.email -applications.coverLetter');

    const total = await Job.countDocuments(query);

    res.json({
      jobs,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit))
    });
  } catch (err) {
    console.error('GET /jobs error:', err);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

// 2. GET SINGLE JOB (increments views)
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    );
    if (!job) return res.status(404).json({ error: 'Job not found' });
    res.json(job);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch job' });
  }
});

// 3. POST A NEW JOB
router.post('/', async (req, res) => {
  try {
    const job = new Job(req.body);
    await job.save();
    res.status(201).json(job);
  } catch (err) {
    console.error('POST /jobs error:', err);
    res.status(500).json({ error: 'Failed to create job' });
  }
});

// 4. APPLY TO A JOB
router.post('/:id/apply', async (req, res) => {
  try {
    const { userId, username, email, coverLetter } = req.body;
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found' });

    // Check if already applied
    const alreadyApplied = job.applications.some(a => a.email === email);
    if (alreadyApplied) {
      return res.status(400).json({ error: 'You have already applied to this job' });
    }

    job.applications.push({ userId, username, email, coverLetter });
    await job.save();
    res.json({ message: 'Application submitted successfully!', applicationCount: job.applications.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit application' });
  }
});

// 5. SAVE / UNSAVE JOB
router.post('/:id/save', async (req, res) => {
  try {
    const { userId } = req.body;
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found' });

    const isSaved = job.savedBy.includes(userId);
    if (isSaved) {
      job.savedBy.pull(userId);
    } else {
      job.savedBy.push(userId);
    }
    await job.save();
    res.json({ saved: !isSaved, savedCount: job.savedBy.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save job' });
  }
});

// 6. GET JOB STATS (for dashboard widgets)
router.get('/stats/overview', async (req, res) => {
  try {
    const totalJobs = await Job.countDocuments({ active: true });
    const remoteJobs = await Job.countDocuments({ active: true, remote: true });
    const newThisWeek = await Job.countDocuments({
      active: true,
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });
    const byType = await Job.aggregate([
      { $match: { active: true } },
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);
    const byExperience = await Job.aggregate([
      { $match: { active: true } },
      { $group: { _id: '$experience', count: { $sum: 1 } } }
    ]);
    const topSkills = await Job.aggregate([
      { $match: { active: true } },
      { $unwind: '$skills' },
      { $group: { _id: '$skills', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    res.json({ totalJobs, remoteJobs, newThisWeek, byType, byExperience, topSkills });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// 7. GET SAVED JOBS FOR A USER
router.get('/user/:userId/saved', async (req, res) => {
  try {
    const jobs = await Job.find({ savedBy: req.params.userId, active: true })
      .sort({ createdAt: -1 })
      .select('-applications');
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch saved jobs' });
  }
});

// 8. GET APPLIED JOBS FOR A USER
router.get('/user/:userId/applied', async (req, res) => {
  try {
    const jobs = await Job.find({ 'applications.userId': req.params.userId, active: true })
      .sort({ createdAt: -1 })
      .select('title company location type applications.$');
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch applied jobs' });
  }
});

// 9. UPDATE APPLICATION STATUS (recruiter endpoint)
router.patch('/:id/applications/:appId/status', async (req, res) => {
  try {
    const { status } = req.body;
    const job = await Job.findById(req.params.id);
    const application = job.applications.id(req.params.appId);
    if (!application) return res.status(404).json({ error: 'Application not found' });
    application.status = status;
    await job.save();
    res.json({ message: 'Status updated', application });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// 10. SEED SAMPLE JOBS (dev only)
router.post('/seed/bulk', async (req, res) => {
  try {
    const sampleJobs = [
      {
        title: 'Senior Full Stack Engineer', company: 'Google', location: 'Mountain View, CA', type: 'Full-time',
        experience: 'Senior', salaryMin: 180000, salaryMax: 280000, remote: true,
        description: 'Join Google\'s core infrastructure team. You will work on highly scalable systems that serve billions of users worldwide.',
        requirements: ['7+ years experience', 'Proficiency in Go/Python', 'Experience with distributed systems'],
        skills: ['Go', 'Python', 'Kubernetes', 'Distributed Systems', 'React'],
        benefits: ['Health insurance', 'Equity', 'Free meals', '401k matching'],
        featured: true, tags: ['backend', 'infrastructure', 'faang']
      },
      {
        title: 'Software Engineer II', company: 'Meta', location: 'Menlo Park, CA', type: 'Full-time',
        experience: 'Mid', salaryMin: 150000, salaryMax: 220000, remote: true,
        description: 'Build the future of social connection. Work on products used by 3+ billion people.',
        requirements: ['3-5 years experience', 'Strong C++/Python skills', 'BS in CS or equivalent'],
        skills: ['C++', 'Python', 'React', 'GraphQL', 'Hack'],
        benefits: ['RSUs', 'Meta hardware', 'Fitness reimbursement', 'Childcare'],
        featured: true, tags: ['backend', 'mobile', 'faang']
      },
      {
        title: 'Frontend Engineer', company: 'Stripe', location: 'San Francisco, CA', type: 'Full-time',
        experience: 'Mid', salaryMin: 140000, salaryMax: 200000, remote: true,
        description: 'Build beautiful, high-performance payment experiences for millions of developers.',
        requirements: ['3+ years with React', 'Expertise in TypeScript', 'Eye for design'],
        skills: ['React', 'TypeScript', 'GraphQL', 'CSS-in-JS', 'Node.js'],
        benefits: ['Top-tier equity', 'Remote first', 'Learning budget', 'Home office stipend'],
        tags: ['frontend', 'fintech', 'typescript']
      },
      {
        title: 'ML Engineer', company: 'OpenAI', location: 'San Francisco, CA', type: 'Full-time',
        experience: 'Senior', salaryMin: 200000, salaryMax: 350000, remote: false,
        description: 'Push the boundaries of what AI can do. Work on cutting-edge language and multimodal models.',
        requirements: ['PhD or MS in ML/CS', 'PyTorch expertise', 'Publication record preferred'],
        skills: ['Python', 'PyTorch', 'CUDA', 'Transformers', 'Distributed Training'],
        benefits: ['Competitive equity', 'Research budget', 'Conference travel', 'Top health coverage'],
        featured: true, tags: ['ml', 'ai', 'research']
      },
      {
        title: 'Backend Engineer (Golang)', company: 'Uber', location: 'Chicago, IL', type: 'Full-time',
        experience: 'Mid', salaryMin: 130000, salaryMax: 190000, remote: true,
        description: 'Scale Uber\'s matching and pricing systems. Handle millions of real-time requests per second.',
        requirements: ['Experience with Go', 'Database design expertise', 'Knowledge of microservices'],
        skills: ['Go', 'gRPC', 'Kafka', 'PostgreSQL', 'Redis'],
        benefits: ['Uber credit', 'Annual bonus', 'Stock options', 'Flexible PTO'],
        tags: ['backend', 'golang', 'microservices']
      },
      {
        title: 'iOS Engineer', company: 'Apple', location: 'Cupertino, CA', type: 'Full-time',
        experience: 'Senior', salaryMin: 160000, salaryMax: 240000, remote: false,
        description: 'Create exceptional experiences for billions of Apple device users worldwide.',
        requirements: ['Swift/Objective-C mastery', '5+ years iOS development', 'Understanding of HIG'],
        skills: ['Swift', 'SwiftUI', 'UIKit', 'Combine', 'CoreData'],
        benefits: ['Apple products', 'Top benefits', 'On-campus amenities', 'ESPP'],
        tags: ['ios', 'mobile', 'faang']
      },
      {
        title: 'DevOps / SRE', company: 'Netflix', location: 'Los Gatos, CA', type: 'Full-time',
        experience: 'Senior', salaryMin: 170000, salaryMax: 270000, remote: true,
        description: 'Maintain 99.99% uptime for 250M subscribers. Build the next generation of streaming infrastructure.',
        requirements: ['SRE or DevOps experience', 'Terraform/Kubernetes proficiency', 'On-call experience'],
        skills: ['Terraform', 'Kubernetes', 'AWS', 'Spinnaker', 'Java'],
        benefits: ['Unlimited PTO', 'Freedom & responsibility culture', 'Top-tier salary', 'Netflix subscription'],
        tags: ['devops', 'cloud', 'sre']
      },
      {
        title: 'Software Engineering Intern', company: 'Airbnb', location: 'Remote', type: 'Internship',
        experience: 'Entry', salaryMin: 45, salaryMax: 60, currency: 'USD', remote: true,
        description: 'Work alongside world-class engineers on products that help people belong anywhere.',
        requirements: ['Currently enrolled in CS/CE program', 'Strong coding fundamentals', 'Any OOP language'],
        skills: ['Java', 'React', 'Ruby on Rails', 'MySQL', 'GraphQL'],
        benefits: ['Housing stipend', 'Travel credit', 'Return offer potential', 'Mentorship'],
        tags: ['internship', 'entry-level', 'travel']
      }
    ];
    await Job.deleteMany({});
    const created = await Job.insertMany(sampleJobs);
    res.json({ message: `Seeded ${created.length} jobs`, jobs: created });
  } catch (err) {
    console.error('Seed error:', err);
    res.status(500).json({ error: 'Failed to seed jobs' });
  }
});

module.exports = router;
