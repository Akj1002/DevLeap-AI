const express = require('express');
const router = express.Router();
const Experience = require('../models/Experience');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// 1. GET ALL EXPERIENCES
router.get('/', async (req, res) => {
  try {
    const { company, outcome, level, sort = 'newest', page = 1, limit = 15, search } = req.query;
    const query = {};
    if (company && company !== 'all') query.company = new RegExp(company, 'i');
    if (outcome && outcome !== 'all') query.outcome = outcome;
    if (level && level !== 'all') query.level = level;
    if (search) query.$or = [
      { company: { $regex: search, $options: 'i' } },
      { role: { $regex: search, $options: 'i' } },
      { 'questions.question': { $regex: search, $options: 'i' } }
    ];
    const sortMap = { newest: { createdAt: -1 }, popular: { upvoteCount: -1 }, salary: { salaryOffered: -1 } };
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const experiences = await Experience.find(query).sort(sortMap[sort] || sortMap.newest).skip(skip).limit(parseInt(limit)).select('-comments');
    const total = await Experience.countDocuments(query);
    res.json({ experiences, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) { res.status(500).json({ error: 'Failed to fetch experiences' }); }
});

// 2. GET SINGLE EXPERIENCE
router.get('/:id', async (req, res) => {
  try {
    const exp = await Experience.findById(req.params.id);
    if (!exp) return res.status(404).json({ error: 'Not found' });
    res.json(exp);
  } catch (err) { res.status(500).json({ error: 'Failed to fetch experience' }); }
});

// 3. POST NEW EXPERIENCE
router.post('/', async (req, res) => {
  try {
    const exp = new Experience(req.body);
    await exp.save();
    res.status(201).json(exp);
  } catch (err) { res.status(500).json({ error: 'Failed to create experience' }); }
});

// 4. UPVOTE
router.post('/:id/upvote', async (req, res) => {
  try {
    const { userId } = req.body;
    const exp = await Experience.findById(req.params.id);
    const alreadyUpvoted = exp.upvotes.includes(userId);
    if (alreadyUpvoted) { exp.upvotes.pull(userId); exp.upvoteCount = Math.max(0, exp.upvoteCount - 1); }
    else { exp.upvotes.push(userId); exp.upvoteCount += 1; }
    await exp.save();
    res.json({ upvoted: !alreadyUpvoted, upvoteCount: exp.upvoteCount });
  } catch (err) { res.status(500).json({ error: 'Failed to upvote' }); }
});

// 5. ADD COMMENT
router.post('/:id/comment', async (req, res) => {
  try {
    const { authorId, authorName, text } = req.body;
    const exp = await Experience.findById(req.params.id);
    exp.comments.push({ authorId, authorName, text });
    await exp.save();
    res.json({ comment: exp.comments[exp.comments.length - 1] });
  } catch (err) { res.status(500).json({ error: 'Failed to add comment' }); }
});

// 6. UPVOTE A QUESTION
router.post('/:id/questions/:qIdx/upvote', async (req, res) => {
  try {
    const exp = await Experience.findById(req.params.id);
    const question = exp.questions[parseInt(req.params.qIdx)];
    if (question) { question.upvotes += 1; await exp.save(); }
    res.json({ upvotes: question?.upvotes });
  } catch (err) { res.status(500).json({ error: 'Failed to upvote question' }); }
});

// 7. GET COMPANY STATS
router.get('/stats/companies', async (req, res) => {
  try {
    const stats = await Experience.aggregate([
      { $group: { _id: '$company', count: { $sum: 1 }, offerRate: { $avg: { $cond: [{ $eq: ['$outcome', 'Offer'] }, 1, 0] } }, avgDifficulty: { $avg: '$difficulty' }, avgSalary: { $avg: '$salaryOffered' } } },
      { $sort: { count: -1 } }, { $limit: 20 }
    ]);
    res.json(stats);
  } catch (err) { res.status(500).json({ error: 'Failed to fetch company stats' }); }
});

// 8. GET OVERVIEW STATS
router.get('/stats/overview', async (req, res) => {
  try {
    const total = await Experience.countDocuments();
    const outcomes = await Experience.aggregate([{ $group: { _id: '$outcome', count: { $sum: 1 } } }]);
    const topCompanies = await Experience.aggregate([{ $group: { _id: '$company', count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 8 }]);
    const avgDifficulty = await Experience.aggregate([{ $group: { _id: null, avg: { $avg: '$difficulty' } } }]);
    res.json({ total, outcomes, topCompanies, avgDifficulty: avgDifficulty[0]?.avg?.toFixed(1) || 0 });
  } catch (err) { res.status(500).json({ error: 'Failed to fetch stats' }); }
});

// 9. AI: EXTRACT QUESTIONS FROM EXPERIENCE
router.post('/:id/extract-questions', async (req, res) => {
  try {
    const exp = await Experience.findById(req.params.id);
    if (!exp) return res.status(404).json({ error: 'Not found' });
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `Extract technical interview questions from this experience at ${exp.company} for ${exp.role}. Process description: ${exp.process || 'N/A'}. Existing questions: ${(exp.questions || []).map(q => q.question).join(', ')}. Return a JSON array of objects: [{question, category, difficulty}]. Max 5 questions. Return only valid JSON.`;
    const result = await model.generateContent(prompt);
    let text = result.response.text().trim().replace(/```json/g, '').replace(/```/g, '').trim();
    const questions = JSON.parse(text);
    res.json({ questions });
  } catch (err) { res.status(500).json({ error: 'AI extraction failed' }); }
});

// 10. MARK AS HELPFUL
router.post('/:id/helpful', async (req, res) => {
  try {
    const exp = await Experience.findByIdAndUpdate(req.params.id, { $inc: { helpful: 1 } }, { new: true });
    res.json({ helpful: exp.helpful });
  } catch (err) { res.status(500).json({ error: 'Failed' }); }
});

// 11. SEED EXPERIENCES
router.post('/seed/bulk', async (req, res) => {
  try {
    const samples = [
      { company: 'Google', role: 'Software Engineer L4', level: 'Mid', outcome: 'Offer', difficulty: 4, rounds: 5, duration: '6 weeks', salaryOffered: 220000, process: '1 recruiter screen, 2 technical phone screens, 4 onsite rounds (2 coding, 1 system design, 1 behavioral). All Leetcode-style.', questions: [{ round: 'Coding 1', question: 'Given a list of intervals, find the minimum number of arrows to burst all balloons', category: 'Greedy', difficulty: 'Medium', upvotes: 45 }, { round: 'Coding 2', question: 'LRU Cache implementation with O(1) get and put', category: 'Design', difficulty: 'Medium', upvotes: 67 }, { round: 'System Design', question: 'Design Google Docs with real-time collaboration', category: 'System Design', difficulty: 'Hard', upvotes: 89 }], tips: ['Practice Leetcode Medium daily for 3 months', 'Study system design patterns - read DDIA', 'Prepare strong behavioral stories using STAR method'], authorName: 'TechHirePro', anonymous: false, verified: true, upvoteCount: 234, tags: ['faang', 'l4', 'hard', 'system-design'], interviewMonth: 'March', interviewYear: 2026 },
      { company: 'Meta', role: 'SWE E5', level: 'Senior', outcome: 'Offer', difficulty: 4, rounds: 5, duration: '4 weeks', salaryOffered: 280000, process: 'Meta focuses heavily on product sense and Leetcode. They care a lot about collaboration signals in behavioral rounds.', questions: [{ round: 'Coding', question: 'Find all permutations of a string with duplicates', category: 'Backtracking', difficulty: 'Medium', upvotes: 38 }, { round: 'System Design', question: 'Design Instagram Stories feature at scale', category: 'System Design', difficulty: 'Hard', upvotes: 72 }, { round: 'Behavioral', question: 'Tell me about a time you disagreed with your manager', category: 'Behavioral', difficulty: 'Easy', upvotes: 21 }], tips: ['Focus on coding speed - Metas graders are timing you', 'Be very explicit about tradeoffs in system design', 'Show that you can collaborate and push back diplomatically'], authorName: 'MetaVet2026', upvoteCount: 189, tags: ['faang', 'meta', 'senior'], interviewYear: 2026 },
      { company: 'Stripe', role: 'Software Engineer', level: 'Mid', outcome: 'Offer', difficulty: 3, rounds: 4, duration: '3 weeks', salaryOffered: 190000, process: 'Stripe has a unique interview: they give you real Stripe codebase tasks. Very practical, no leetcode grinding required.', questions: [{ round: 'Technical', question: 'Debug a failing test in a payment processing module (real codebase)', category: 'Debugging', difficulty: 'Medium', upvotes: 55 }, { round: 'Design', question: 'Extend our API to support multi-currency transactions', category: 'API Design', difficulty: 'Medium', upvotes: 43 }], tips: ['Read Stripes engineering blog before the interview', 'Practice debugging unfamiliar codebases', 'Think about edge cases in financial systems'], authorName: 'StripeEngineer', upvoteCount: 156, tags: ['fintech', 'stripe', 'practical'], interviewYear: 2026 },
      { company: 'Airbnb', role: 'Frontend Engineer', level: 'Mid', outcome: 'Rejected', difficulty: 3, rounds: 4, duration: '5 weeks', process: 'Good culture fit interviews. They care a lot about product thinking and design sensibility in addition to coding.', questions: [{ round: 'Coding', question: 'Implement a responsive image gallery with lazy loading', category: 'Frontend', difficulty: 'Medium', upvotes: 29 }, { round: 'System Design', question: 'Design the Airbnb search page architecture', category: 'Frontend Architecture', difficulty: 'Hard', upvotes: 41 }], tips: ['Study React performance optimization patterns', 'Prepare for product design questions', 'Show genuine passion for the product'], authorName: 'FrontendDev99', anonymous: true, upvoteCount: 78, tags: ['frontend', 'airbnb', 'product'], interviewYear: 2025 },
      { company: 'OpenAI', role: 'ML Engineer', level: 'Senior', outcome: 'Offer', difficulty: 5, rounds: 6, duration: '8 weeks', salaryOffered: 350000, process: 'Very research-focused. Expect deep ML theory, paper discussions, and practical ML coding. Much harder than typical SWE interviews.', questions: [{ round: 'ML Theory', question: 'Explain the attention mechanism in transformers and derive the gradient', category: 'ML Theory', difficulty: 'Hard', upvotes: 112 }, { round: 'Coding', question: 'Implement backpropagation for a small neural network from scratch', category: 'ML Implementation', difficulty: 'Hard', upvotes: 94 }, { round: 'Research', question: 'Read this paper in 30 minutes and present improvements', category: 'Research', difficulty: 'Hard', upvotes: 87 }], tips: ['Have multiple ML papers you can discuss in depth', 'Practice implementing neural nets from scratch in numpy', 'Be ready to mathematically derive gradients on the whiteboard'], authorName: 'MLResearcher', upvoteCount: 412, tags: ['ml', 'ai', 'openai', 'research', 'hard'], interviewYear: 2026 },
    ];
    await Experience.deleteMany({});
    const created = await Experience.insertMany(samples);
    res.json({ message: `Seeded ${created.length} experiences` });
  } catch (err) { res.status(500).json({ error: 'Failed to seed experiences' }); }
});

module.exports = router;
