const express = require('express');
const router = express.Router();
const StudyPlan = require('../models/StudyPlan');
const User = require('../models/User');

// GET all study plans
router.get('/', async (req, res) => {
    try {
        const plans = await StudyPlan.find();
        res.json(plans);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch study plans" });
    }
});

// POST study plan progress
router.post('/:id/progress', async (req, res) => {
    const { userId, progressPct } = req.body;
    try {
        if (userId) {
            const user = await User.findById(userId);
            if (user) {
                user.studyPlanProgress.set(req.params.id, progressPct);
                await user.save();
            }
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "Failed to save progress" });
    }
});

module.exports = router;
