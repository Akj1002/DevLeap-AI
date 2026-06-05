const express = require('express');
const router = express.Router();
const Project = require('../models/Project');

// 1. GET ALL PROJECTS (feed with filters)
router.get('/', async (req, res) => {
  try {
    const { category, tech, sort = 'newest', search, page = 1, limit = 16 } = req.query;
    const query = { status: 'active' };
    if (category && category !== 'all') query.category = category;
    if (tech) query.techStack = { $in: tech.split(',').map(t => t.trim()) };
    if (search) query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search, 'i')] } }
    ];
    const sortMap = {
      newest: { createdAt: -1 },
      popular: { likeCount: -1, views: -1 },
      featured: { featured: -1, likeCount: -1 }
    };
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const projects = await Project.find(query).sort(sortMap[sort] || sortMap.newest).skip(skip).limit(parseInt(limit)).select('-comments');
    const total = await Project.countDocuments(query);
    res.json({ projects, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) { res.status(500).json({ error: 'Failed to fetch projects' }); }
});

// 2. GET SINGLE PROJECT
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }, { new: true });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json(project);
  } catch (err) { res.status(500).json({ error: 'Failed to fetch project' }); }
});

// 3. CREATE PROJECT
router.post('/', async (req, res) => {
  try {
    const project = new Project(req.body);
    await project.save();
    res.status(201).json(project);
  } catch (err) { res.status(500).json({ error: 'Failed to create project' }); }
});

// 4. LIKE / UNLIKE
router.post('/:id/like', async (req, res) => {
  try {
    const { userId } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Not found' });
    const liked = project.likes.includes(userId);
    if (liked) { project.likes.pull(userId); project.likeCount = Math.max(0, project.likeCount - 1); }
    else { project.likes.push(userId); project.likeCount += 1; }
    await project.save();
    res.json({ liked: !liked, likeCount: project.likeCount });
  } catch (err) { res.status(500).json({ error: 'Failed to like' }); }
});

// 5. BOOKMARK / UNBOOKMARK
router.post('/:id/bookmark', async (req, res) => {
  try {
    const { userId } = req.body;
    const project = await Project.findById(req.params.id);
    const bookmarked = project.bookmarks.includes(userId);
    if (bookmarked) project.bookmarks.pull(userId); else project.bookmarks.push(userId);
    await project.save();
    res.json({ bookmarked: !bookmarked });
  } catch (err) { res.status(500).json({ error: 'Failed to bookmark' }); }
});

// 6. ADD COMMENT
router.post('/:id/comment', async (req, res) => {
  try {
    const { authorId, authorName, text } = req.body;
    const project = await Project.findById(req.params.id);
    project.comments.push({ authorId, authorName, text });
    await project.save();
    res.json({ comment: project.comments[project.comments.length - 1], count: project.comments.length });
  } catch (err) { res.status(500).json({ error: 'Failed to add comment' }); }
});

// 7. GET TRENDING TAGS
router.get('/meta/trending-tags', async (req, res) => {
  try {
    const tags = await Project.aggregate([
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } }, { $limit: 12 }
    ]);
    const techs = await Project.aggregate([
      { $unwind: '$techStack' },
      { $group: { _id: '$techStack', count: { $sum: 1 } } },
      { $sort: { count: -1 } }, { $limit: 10 }
    ]);
    res.json({ tags, techs });
  } catch (err) { res.status(500).json({ error: 'Failed to fetch tags' }); }
});

// 8. STATS
router.get('/meta/stats', async (req, res) => {
  try {
    const total = await Project.countDocuments({ status: 'active' });
    const totalLikes = await Project.aggregate([{ $group: { _id: null, total: { $sum: '$likeCount' } } }]);
    const byCategory = await Project.aggregate([{ $match: { status: 'active' } }, { $group: { _id: '$category', count: { $sum: 1 } } }, { $sort: { count: -1 } }]);
    res.json({ total, totalLikes: totalLikes[0]?.total || 0, byCategory });
  } catch (err) { res.status(500).json({ error: 'Failed to fetch stats' }); }
});

// 9. GET USER PROJECTS
router.get('/user/:userId', async (req, res) => {
  try {
    const projects = await Project.find({ authorId: req.params.userId }).sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) { res.status(500).json({ error: 'Failed to fetch user projects' }); }
});

// 10. UPDATE PROJECT
router.patch('/:id', async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    res.json(project);
  } catch (err) { res.status(500).json({ error: 'Failed to update project' }); }
});

// 11. DELETE PROJECT
router.delete('/:id', async (req, res) => {
  try {
    await Project.findByIdAndUpdate(req.params.id, { status: 'archived' });
    res.json({ message: 'Project archived' });
  } catch (err) { res.status(500).json({ error: 'Failed to delete project' }); }
});

// 12. SEED PROJECTS
router.post('/seed/bulk', async (req, res) => {
  try {
    const samples = [
      { title: 'DevLeap AI Clone', description: 'A full-stack coding interview platform with AI assistance, real-time code execution, and personalized learning paths.', techStack: ['React', 'Node.js', 'MongoDB', 'Gemini AI'], tags: ['fullstack', 'ai', 'education'], authorName: 'Sarah Chen', category: 'web', likeCount: 234, views: 1847, featured: true, repoUrl: 'https://github.com/example/devleap', liveUrl: 'https://devleap.ai', githubStars: 512 },
      { title: 'GPU Accelerated Ray Tracer', description: 'A real-time ray tracer built from scratch using WebGL2 compute shaders. Supports global illumination, soft shadows, and refraction.', techStack: ['WebGL2', 'GLSL', 'JavaScript', 'TypeScript'], tags: ['graphics', 'gpu', 'webgl', 'raytracing'], authorName: 'Marcus Johnson', category: 'web', likeCount: 189, views: 2341, repoUrl: 'https://github.com/example/raytracer', githubStars: 876 },
      { title: 'AI Code Reviewer', description: 'Browser extension that reviews your code in real-time using GPT-4. Spots bugs, suggests improvements and explains complex code snippets.', techStack: ['React', 'TypeScript', 'OpenAI API', 'Chrome API'], tags: ['ai', 'devtools', 'extension', 'productivity'], authorName: 'Priya Sharma', category: 'devtools', likeCount: 312, views: 4123, featured: true, repoUrl: 'https://github.com/example/ai-reviewer', githubStars: 1204 },
      { title: 'Terminal Portfolio', description: 'An interactive portfolio that looks and feels like a terminal. Supports actual shell commands and displays projects in ASCII art.', techStack: ['React', 'Xterm.js', 'CSS Animations'], tags: ['portfolio', 'terminal', 'creative', 'ux'], authorName: 'Alex Rivera', category: 'web', likeCount: 445, views: 6789, featured: true, repoUrl: 'https://github.com/example/terminal-portfolio', liveUrl: 'https://alexrivera.dev' },
      { title: 'Real-time Collaborative Whiteboard', description: 'Like Figma but for engineers. Infinite canvas, real-time cursor sync via WebSockets, shape library, and export to SVG/PNG.', techStack: ['React', 'Socket.io', 'Canvas API', 'Node.js', 'Redis'], tags: ['realtime', 'collaboration', 'canvas'], authorName: 'Jordan Kim', category: 'web', likeCount: 278, views: 3456, repoUrl: 'https://github.com/example/whiteboard' },
      { title: 'Rust-based HTTP Server', description: 'A zero-dependency, asynchronous HTTP/1.1 server written in Rust. Benchmarks at 500k req/sec. Implements chunked transfer encoding and keep-alive.', techStack: ['Rust', 'Tokio', 'Hyper'], tags: ['rust', 'performance', 'backend', 'systems'], authorName: 'Amara Okafor', category: 'open-source', likeCount: 567, views: 8901, githubStars: 2341, featured: true },
      { title: 'Mobile DSA Flashcards', description: 'React Native app with 500+ algorithm flashcards, spaced repetition, progress tracking, and offline support.', techStack: ['React Native', 'Expo', 'AsyncStorage', 'SQLite'], tags: ['mobile', 'dsa', 'education', 'learning'], authorName: 'Kevin Patel', category: 'mobile', likeCount: 134, views: 2012, repoUrl: 'https://github.com/example/dsa-cards' },
      { title: 'Neural Network Visualizer', description: 'Interactive 3D visualization of neural network training. Watch gradients flow, neurons activate, and decision boundaries form in real time.', techStack: ['Three.js', 'TensorFlow.js', 'D3.js', 'React'], tags: ['ml', 'visualization', '3d', 'education'], authorName: 'Lisa Wang', category: 'ai/ml', likeCount: 398, views: 5670, featured: true, repoUrl: 'https://github.com/example/nn-viz' },
    ];
    await Project.deleteMany({});
    const created = await Project.insertMany(samples);
    res.json({ message: `Seeded ${created.length} projects` });
  } catch (err) { res.status(500).json({ error: 'Failed to seed projects' }); }
});

module.exports = router;
