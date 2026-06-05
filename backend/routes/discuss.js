const express = require('express');
const router = express.Router();
const Thread = require('../models/Thread');
const User = require('../models/User');

// 1. GET ALL THREADS
router.get('/', async (req, res) => {
    try {
        const threads = await Thread.find().sort({ createdAt: -1 }); // Newest first
        res.json(threads);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch threads" });
    }
});

// 2. CREATE A NEW THREAD
router.post('/', async (req, res) => {
    const { title, content, tags, userId } = req.body;
    try {
        const user = await User.findById(userId);
        const authorName = user ? user.username : "Anonymous Developer";

        const newThread = new Thread({ title, content, tags, author: authorName });
        await newThread.save();
        res.json(newThread);
    } catch (err) {
        res.status(500).json({ error: "Failed to create thread" });
    }
});

// 3. ADD A REPLY
router.post('/:id/reply', async (req, res) => {
    const { text, userId } = req.body;
    try {
        const user = await User.findById(userId);
        const authorName = user ? user.username : "Anonymous";

        const thread = await Thread.findById(req.params.id);
        thread.replies.push({ author: authorName, text });
        await thread.save();
        
        res.json(thread);
    } catch (err) {
        res.status(500).json({ error: "Failed to add reply" });
    }
});

// 4. UPVOTE A THREAD
router.post('/:id/upvote', async (req, res) => {
    try {
        const thread = await Thread.findById(req.params.id);
        thread.upvotes += 1;
        await thread.save();
        res.json(thread);
    } catch (err) {
        res.status(500).json({ error: "Failed to upvote" });
    }
});

module.exports = router;