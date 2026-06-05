const express = require('express');
const router = express.Router();
const Roadmap = require('../models/Roadmap');

// GET all roadmaps
router.get('/', async (req, res) => {
    try {
        const roadmaps = await Roadmap.find();
        res.json(roadmaps);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch roadmaps" });
    }
});

router.post('/seed/bulk', async (req, res) => {
    try {
        await Roadmap.deleteMany({});
        const seedData = [
            {
              title: 'Frontend Developer', category: 'Frontend', description: 'Step-by-step guide to becoming a modern frontend developer in 2026.',
              nodes: [
                { id: 'n1', title: 'Internet Fundamentals', description: 'How does the internet work? HTTP/DNS.', xpReward: 50, dependsOn: [], resources: [{ title: 'MDN Web Docs', url: '#', type: 'Article' }] },
                { id: 'n2', title: 'HTML & CSS', description: 'Semantic HTML, Flexbox, Grid.', xpReward: 100, dependsOn: ['n1'], resources: [{ title: 'CSS Tricks', url: '#', type: 'Video' }] },
                { id: 'n3', title: 'JavaScript Basics', description: 'Variables, functions, DOM manipulation.', xpReward: 150, dependsOn: ['n2'], resources: [{ title: 'JS Info', url: '#', type: 'Course' }] },
                { id: 'n4', title: 'React.js', description: 'Components, Hooks, State.', xpReward: 200, dependsOn: ['n3'], resources: [{ title: 'React Docs', url: '#', type: 'Documentation' }] },
                { id: 'n5', title: 'State Management', description: 'Redux, Zustand, Context API.', xpReward: 150, dependsOn: ['n4'], resources: [{ title: 'Zustand Guide', url: '#', type: 'Article' }] },
              ]
            },
            {
              title: 'Backend Developer', category: 'Backend', description: 'Master server-side programming, databases, and APIs.',
              nodes: [
                { id: 'b1', title: 'Internet & OS', description: 'Threads, concurrency, memory.', xpReward: 100, dependsOn: [], resources: [] },
                { id: 'b2', title: 'Relational DBs', description: 'PostgreSQL, normalization, joins.', xpReward: 150, dependsOn: ['b1'], resources: [] },
                { id: 'b3', title: 'NoSQL DBs', description: 'MongoDB, Redis.', xpReward: 150, dependsOn: ['b1'], resources: [] },
                { id: 'b4', title: 'APIs (REST/GraphQL)', description: 'Designing robust APIs.', xpReward: 200, dependsOn: ['b2', 'b3'], resources: [] },
              ]
            }
        ];
        const created = await Roadmap.insertMany(seedData);
        res.json({ message: 'Roadmaps seeded successfully', count: created.length });
    } catch (err) {
        res.status(500).json({ error: "Failed to seed roadmaps" });
    }
});

module.exports = router;
