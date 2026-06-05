const express = require('express');
const router = express.Router();
const Guild = require('../models/Guild');

// GET all guilds
router.get('/', async (req, res) => {
    try {
        const guilds = await Guild.find().sort({ totalXP: -1 });
        res.json(guilds);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch guilds" });
    }
});

// Seed sample guilds
router.post('/seed/bulk', async (req, res) => {
    try {
        await Guild.deleteMany({});
        const seedData = [
            {
                name: 'React Ninjas',
                description: 'We build fast, scalable, and beautiful UI. Join if you love React!',
                emblem: '⚛️',
                totalXP: 145000,
                level: 12,
                quests: [
                    { title: 'Solve 100 Frontend DSA', target: 100, progress: 85, xpReward: 5000, isCompleted: false },
                    { title: 'Win 10 Code Races', target: 10, progress: 10, xpReward: 2000, isCompleted: true }
                ]
            },
            {
                name: 'Rustaceans',
                description: 'Memory safety without garbage collection. Hardcore systems programming.',
                emblem: '🦀',
                totalXP: 180000,
                level: 15,
                quests: [
                    { title: 'Complete Systems Roadmap', target: 50, progress: 20, xpReward: 10000, isCompleted: false }
                ]
            },
            {
                name: 'Data Wizards',
                description: 'Data Science, Machine Learning, and AI enthusiasts.',
                emblem: '📊',
                totalXP: 95000,
                level: 8,
                quests: [
                    { title: 'Build 5 ML Models', target: 5, progress: 4, xpReward: 3000, isCompleted: false }
                ]
            }
        ];
        const created = await Guild.insertMany(seedData);
        res.json({ message: 'Seeded successfully', count: created.length });
    } catch (err) {
        res.status(500).json({ error: "Failed to seed guilds" });
    }
});

module.exports = router;
