const express = require('express');
const router = express.Router();
const Bounty = require('../models/Bounty');

// GET all bounties
router.get('/', async (req, res) => {
    try {
        const bounties = await Bounty.find().sort({ createdAt: -1 });
        res.json(bounties);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch bounties" });
    }
});

// Seed sample bounties
router.post('/seed/bulk', async (req, res) => {
    try {
        await Bounty.deleteMany({});
        const seedData = [
            {
                title: 'Fix React Hydration Error',
                description: 'Our Next.js app has a hydration mismatch on the landing page affecting SEO. Need a quick fix.',
                rewardAmount: 150,
                tags: ['React', 'Next.js', 'Frontend'],
                status: 'Open',
                postedBy: 'Acme Startup',
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            },
            {
                title: 'Implement Stripe Webhooks',
                description: 'Need someone to build secure Stripe webhook handlers for our Express backend. Must handle subscription events.',
                rewardAmount: 300,
                tags: ['Node.js', 'Stripe', 'Backend'],
                status: 'Open',
                postedBy: 'SaaS Builder',
                dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
            },
            {
                title: 'Smart Contract Audit',
                description: 'Review our ERC20 token contract for vulnerabilities before mainnet launch.',
                rewardAmount: 500,
                tags: ['Web3', 'Solidity', 'Security'],
                status: 'In Progress',
                postedBy: 'DeFi Protocol',
                dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
            }
        ];
        const created = await Bounty.insertMany(seedData);
        res.json({ message: 'Seeded successfully', count: created.length });
    } catch (err) {
        res.status(500).json({ error: "Failed to seed bounties" });
    }
});

module.exports = router;
