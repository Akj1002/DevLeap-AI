const express = require('express');
const router = express.Router();
const SystemDesign = require('../models/SystemDesign');

// GET all public designs
router.get('/', async (req, res) => {
    try {
        const designs = await SystemDesign.find({ isPublic: true }).sort({ createdAt: -1 });
        res.json(designs);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch designs" });
    }
});

// POST new design
router.post('/', async (req, res) => {
    try {
        const newDesign = new SystemDesign(req.body);
        const savedDesign = await newDesign.save();
        res.json(savedDesign);
    } catch (err) {
        res.status(500).json({ error: "Failed to save design" });
    }
});

// Seed sample designs
router.post('/seed/bulk', async (req, res) => {
    try {
        await SystemDesign.deleteMany({});
        const seedData = [
            {
                title: 'WhatsApp Clone Architecture',
                authorName: 'Alex System',
                problemDescription: 'Design a scalable chat application supporting 1B+ users.',
                components: [
                    { id: 'c1', type: 'client', x: 100, y: 150, label: 'Mobile Client' },
                    { id: 'c2', type: 'lb', x: 300, y: 150, label: 'Load Balancer' },
                    { id: 'c3', type: 'server', x: 500, y: 100, label: 'Chat Server (WebSocket)' },
                    { id: 'c4', type: 'db', x: 700, y: 150, label: 'Cassandra DB' },
                ],
                connections: [
                    { id: 'e1', source: 'c1', target: 'c2', label: 'HTTPS' },
                    { id: 'e2', source: 'c2', target: 'c3', label: 'WSS' },
                    { id: 'e3', source: 'c3', target: 'c4', label: 'TCP' },
                ],
                likes: 124
            },
            {
                title: 'Uber Backend Design',
                authorName: 'Sarah Tech',
                problemDescription: 'Matching riders with drivers in real-time with low latency.',
                components: [
                    { id: 'c1', type: 'client', x: 100, y: 150, label: 'Rider App' },
                    { id: 'c2', type: 'client', x: 100, y: 250, label: 'Driver App' },
                    { id: 'c3', type: 'server', x: 400, y: 200, label: 'Matching Service' },
                    { id: 'c4', type: 'cache', x: 600, y: 100, label: 'Redis (Geospatial)' },
                    { id: 'c5', type: 'db', x: 600, y: 300, label: 'PostgreSQL' }
                ],
                connections: [
                    { id: 'e1', source: 'c1', target: 'c3', label: 'Request Ride' },
                    { id: 'e2', source: 'c2', target: 'c3', label: 'Location Ping' },
                    { id: 'e3', source: 'c3', target: 'c4', label: 'Find Nearby' },
                    { id: 'e4', source: 'c3', target: 'c5', label: 'Trip Data' },
                ],
                likes: 89
            }
        ];
        const created = await SystemDesign.insertMany(seedData);
        res.json({ message: 'Seeded successfully', count: created.length });
    } catch (err) {
        res.status(500).json({ error: "Failed to seed" });
    }
});

module.exports = router;
