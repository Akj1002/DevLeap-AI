const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Question = require('../models/Question');
const Thread = require('../models/Thread');

// 1. GET /api/admin/metrics - System telemetry
router.get('/metrics', async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalQuestions = await Question.countDocuments();
        const totalThreads = await Thread.countDocuments();
        
        // Calculate solved count stats
        const users = await User.find({}, 'solvedProblems interviewReports');
        let totalSolvedProblems = 0;
        let totalInterviews = 0;
        
        users.forEach(u => {
            totalSolvedProblems += (u.solvedProblems ? u.solvedProblems.length : 0);
            totalInterviews += (u.interviewReports ? u.interviewReports.length : 0);
        });

        // Compute simulated Gemini cost
        const geminiTokens = (totalSolvedProblems * 4200) + (totalInterviews * 18500);
        const estimatedCost = (geminiTokens * 0.00000015).toFixed(4); // $0.15 per million input tokens

        res.json({
            usersCount: totalUsers,
            questionsCount: totalQuestions,
            threadsCount: totalThreads,
            solvedCount: totalSolvedProblems,
            interviewsCount: totalInterviews,
            geminiTokensUsed: geminiTokens,
            geminiCostUSD: estimatedCost,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch platform metrics: " + error.message });
    }
});

// 2. POST /api/admin/questions - Create custom coding problem
router.post('/questions', async (req, res) => {
    try {
        const { title, difficulty, category, description, topics, starterCode, testCases } = req.body;
        
        if (!title || !description) {
            return res.status(400).json({ error: "Title and description are required" });
        }

        // Generate a random numeric questionId
        const count = await Question.countDocuments();
        const questionId = String(1000 + count + 1);

        // Build starter code map
        const finalStarterCode = starterCode || {
            'Python 3': `class Solution:\n    def solve(self, input_val: str) -> str:\n        # Write your code here\n        pass`,
            'JavaScript': `var solve = function(input_val) {\n    // Write your code here\n};`,
            'C++': `class Solution {\npublic:\n    string solve(string input_val) {\n        // Write your code here\n    }\n};`,
            'Java': `class Solution {\n    public String solve(String input_val) {\n        // Write your code here\n    }\n}`
        };

        // Build formatted test cases
        const finalTestCases = testCases && testCases.length > 0 ? testCases : [
            { input: "1 2\n", expectedOutput: "3\n", isHidden: false }
        ];

        // Format topics as array
        const finalTopics = Array.isArray(topics) ? topics : (topics ? topics.split(',').map(t => t.trim().toLowerCase()) : ['algorithms']);

        const newQuestion = new Question({
            questionId,
            title,
            difficulty: difficulty || 'Medium',
            category: category || 'Algorithms',
            description,
            topics: finalTopics,
            starterCode: finalStarterCode,
            testCases: finalTestCases,
            examples: [
                {
                    input: finalTestCases[0].input,
                    output: finalTestCases[0].expectedOutput,
                    explanation: "Automatically generated example test case."
                }
            ],
            constraints: ["Time complexity: O(N)", "Space complexity: O(1)"]
        });

        await newQuestion.save();
        res.status(201).json({ message: "Coding problem created successfully!", question: newQuestion });
    } catch (error) {
        res.status(500).json({ error: "Failed to create question: " + error.message });
    }
});

// 3. PUT /api/admin/users/role - Update user roles
router.put('/users/role', async (req, res) => {
    try {
        const { userId, role } = req.body;
        
        if (!userId || !role) {
            return res.status(400).json({ error: "User ID and role are required" });
        }

        if (!['user', 'admin', 'moderator'].includes(role)) {
            return res.status(400).json({ error: "Invalid role value" });
        }

        const updatedUser = await User.findByIdAndUpdate(userId, { role }, { new: true });
        
        if (!updatedUser) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json({ message: `User role successfully updated to ${role}`, user: updatedUser });
    } catch (error) {
        res.status(500).json({ error: "Failed to update role: " + error.message });
    }
});

// 4. GET /api/admin/users - List users for management
router.get('/users', async (req, res) => {
    try {
        const users = await User.find({}, 'username email role createdAt lastActive solvedProblems');
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch users: " + error.message });
    }
});

module.exports = router;
