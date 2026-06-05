const express = require('express');
const router = express.Router();
const User = require('../models/User');
const nodemailer = require('nodemailer');
const { OAuth2Client } = require('google-auth-library');

// 🔐 GOOGLE OAUTH SETUP
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// 📧 NODEMAILER SETUP
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendWelcomeEmail = async (email, name) => {
    try {
        await transporter.sendMail({
            from: `"DevLeap AI" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Welcome to DevLeap! 🚀",
            html: `<h2>Welcome to the platform, ${name}!</h2><p>You are now ready to track your DSA progress and crush your tech interviews with DevAI.</p>`
        });
        console.log(`✉️ Welcome email sent to ${email}`);
    } catch (err) {
        console.error("❌ Email failed to send:", err);
    }
};

// 🟢 DEBUG ROUTE: To verify the file is connected to server.js
router.get('/ping', (req, res) => {
    res.json({ message: "✅ USERS ROUTER IS ALIVE AND CONNECTED!" });
});

// 1. STANDARD INIT / REGISTER (With Email Trigger)
router.post('/init', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const targetEmail = email || "candidate@devleap.com";
        let user = await User.findOne({ email: targetEmail });
        
        if (user) {
            if (username && user.username !== username) {
                user.username = username;
                await user.save();
            }
            return res.json({ message: "User found", user });
        }

        const newUser = new User({
            username: username || "Developer",
            email: targetEmail,
            password: password || "securepassword123" 
        });
        
        await newUser.save();
        sendWelcomeEmail(newUser.email, newUser.username); // 🌟 Trigger email
        res.json({ message: "User created successfully!", user: newUser });
    } catch (err) {
        console.error("❌ BACKEND AUTH ERROR:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// 🌟 2. GOOGLE OAUTH LOGIN (With Email Trigger)
router.post('/google', async (req, res) => {
    const { credential } = req.body;
    try {
        // Verify the token with Google
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const { email, name } = payload;

        let user = await User.findOne({ email });
        
        if (user) {
            return res.json({ message: "Google Login successful", user });
        }

        // Create new user automatically if they don't exist
        const newUser = new User({
            username: name,
            email: email,
            password: "google_oauth_placeholder_password" 
        });
        
        await newUser.save();
        sendWelcomeEmail(email, name); // 🌟 Trigger email
        res.json({ message: "Google Account created successfully!", user: newUser });

    } catch (err) {
        console.error("❌ Google Auth Error:", err);
        res.status(401).json({ error: "Invalid Google Token" });
    }
});

// 3. SAVE PROGRESS: Updates user profile when code is Accepted
router.post('/solve', async (req, res) => {
    const { userId, questionId, language } = req.body;
    try {
        const mongoose = require('mongoose');
        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ error: "Invalid User ID format." });
        }
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: "User not found" });

        const alreadySolved = user.solvedProblems.find(p => p.questionId.toString() === questionId);
        if (!alreadySolved) {
            user.solvedProblems.push({ questionId, language });
            await user.save();
            return res.json({ message: "New progress saved!", totalSolved: user.solvedProblems.length });
        }
        res.json({ message: "Problem was already solved previously.", totalSolved: user.solvedProblems.length });
    } catch (err) {
        console.error("❌ Progress Save Error:", err);
        res.status(500).json({ error: "Could not save progress to database." });
    }
});

// 🏆 4. GET LEADERBOARD
router.get('/leaderboard', async (req, res) => {
    try {
        const leaderboard = await User.aggregate([
            { $project: { username: 1, solvedCount: { $size: "$solvedProblems" }, lastActive: "$updatedAt", streakDays: 1, avatar: 1 } },
            { $sort: { solvedCount: -1, lastActive: -1 } },
            { $limit: 100 }
        ]);
        res.json(leaderboard);
    } catch (err) {
        console.error("❌ Leaderboard Error:", err);
        res.status(500).json({ error: "Failed to fetch leaderboard data." });
    }
});

// 5. FETCH PROGRESS (Includes Interview Reports for Profile Page)
router.get('/:id/progress', async (req, res) => {
    try {
        const mongoose = require('mongoose');
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ error: "Invalid User ID format." });
        }
        const user = await User.findById(req.params.id).populate('solvedProblems.questionId');
        if (!user) return res.status(404).json({ error: "User not found" });
        res.json({ 
            username: user.username, 
            handle: '@' + user.username.toLowerCase(),
            email: user.email || '',
            role: user.role || 'user',
            badges: user.badges || [],
            totalSolved: user.solvedProblems.length, 
            history: user.solvedProblems,
            interviewReports: user.interviewReports || [],
            bio: user.bio || 'Tech enthusiast | Developer',
            profilePicture: user.profilePicture || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default',
            company: user.company || '',
            streakDays: user.streakDays || 0,
            leaderboardScore: user.leaderboardScore || 0,
            totalAttempts: user.totalAttempts || 0,
            joinedDate: user.createdAt,
            github: user.username,
            linkedin: user.username,
            twitter: user.username
        });
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch analytics." });
    }
});

// 🌟 6. SAVE AI INTERVIEW REPORT
router.post('/:id/interview-report', async (req, res) => {
    try {
        const mongoose = require('mongoose');
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ error: "Invalid User ID format." });
        }
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ error: "User not found" });

        user.interviewReports.push(req.body);
        await user.save();
        
        res.json({ message: "Report saved successfully!" });
    } catch (err) {
        console.error("❌ Failed to save report:", err);
        res.status(500).json({ error: "Failed to save report" });
    }
});

// 7. UPGRADE USER TO PREMIUM
router.post('/upgrade', async (req, res) => {
    const { userId } = req.body;
    try {
        const mongoose = require('mongoose');
        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ error: "Invalid User ID format." });
        }
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: "User not found" });

        // Add Premium Pro badge if not already added
        if (!user.badges.includes("Premium Pro")) {
            user.badges.push("Premium Pro");
        }
        
        await user.save();
        res.json({ message: "Subscription upgraded successfully!", user });
    } catch (err) {
        console.error("❌ Upgrade Error:", err);
        res.status(500).json({ error: "Failed to upgrade subscription" });
    }
});

module.exports = router;