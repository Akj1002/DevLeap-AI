const express = require('express');
const router = express.Router();
const Contest = require('../models/Contest');
const User = require('../models/User');

// GET all contests
router.get('/', async (req, res) => {
    try {
        const contests = await Contest.find();
        res.json(contests);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch contests" });
    }
});

// POST register for a contest
router.post('/:id/register', async (req, res) => {
    const { userId } = req.body;
    try {
        if (userId) {
            const user = await User.findById(userId);
            if (user && !user.registeredContests.includes(req.params.id)) {
                user.registeredContests.push(req.params.id);
                await user.save();
            }
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "Failed to register for contest" });
    }
});

// POST unregister from a contest
router.post('/:id/unregister', async (req, res) => {
    const { userId } = req.body;
    try {
        if (userId) {
            const user = await User.findById(userId);
            if (user) {
                user.registeredContests = user.registeredContests.filter(id => id !== req.params.id);
                await user.save();
            }
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "Failed to unregister from contest" });
    }
});

module.exports = router;
