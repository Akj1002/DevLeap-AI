const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Question = require('../models/Question');

// Get user statistics and progress
router.get('/stats/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).populate('solvedProblems.questionId');
        if (!user) return res.status(404).json({ error: "User not found" });

        const problemsByDifficulty = {
            Easy: 0,
            Medium: 0,
            Hard: 0
        };

        user.solvedProblems.forEach(problem => {
            if (problem.questionId && problem.questionId.difficulty) {
                problemsByDifficulty[problem.questionId.difficulty]++;
            }
        });

        res.json({ 
            username: user.username,
            totalSolved: user.solvedProblems.length,
            totalAttempts: user.totalAttempts,
            streakDays: user.streakDays,
            experience: user.experience,
            badges: user.badges,
            problemsByDifficulty,
            lastActive: user.lastActive,
            profilePicture: user.profilePicture,
            bio: user.bio
        });
    } catch (error) { 
        res.status(500).json({ error: "Failed to fetch statistics" });
    }
});

// Update user profile
router.put('/profile/:userId', async (req, res) => {
    try {
        const { bio, profilePicture } = req.body;
        const updated = await User.findByIdAndUpdate(
            req.params.userId, 
            { bio, profilePicture, lastActive: new Date() }, 
            { new: true }
        );
        res.json(updated);
    } catch (error) { 
        res.status(500).json({ error: "Update failed" }); 
    }
});

// Get user's solved problems with details
router.get('/problems/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).populate('solvedProblems.questionId');
        if (!user) return res.status(404).json({ error: "User not found" });
        
        res.json(user.solvedProblems);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch solved problems" });
    }
});

// Log daily streak
router.post('/streak/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) return res.status(404).json({ error: "User not found" });
        
        user.lastActive = new Date();
        user.streakDays += 1;
        await user.save();
        
        res.json({ streakDays: user.streakDays });
    } catch (error) {
        res.status(500).json({ error: "Failed to update streak" });
    }
});

module.exports = router;