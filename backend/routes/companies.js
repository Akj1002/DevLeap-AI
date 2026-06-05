const express = require('express');
const router = express.Router();
const Company = require('../models/Company');

// GET all companies
router.get('/', async (req, res) => {
    try {
        const companies = await Company.find();
        res.json(companies);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch companies" });
    }
});

router.post('/seed/bulk', async (req, res) => {
    try {
        await Company.deleteMany({});
        const staticCompanies = [
            { name: 'Google', tier: 'Tier 1', domain: 'AI/ML', avgComp: 280, wlbRating: 4.4, interviewDifficulty: 'Hard', description: 'Alphabet Inc. specializes in internet-related services and products, widely considered one of the Big Five companies in the U.S.', headquarters: 'Mountain View, CA' },
            { name: 'Meta', tier: 'Tier 1', domain: 'SaaS', avgComp: 310, wlbRating: 3.8, interviewDifficulty: 'Hard', description: 'Social technology company that builds applications and technologies that help people connect, find communities, and grow businesses.', headquarters: 'Menlo Park, CA' },
            { name: 'Stripe', tier: 'Tier 1', domain: 'Fintech', avgComp: 340, wlbRating: 3.5, interviewDifficulty: 'Very Hard', description: 'Financial infrastructure platform for the internet. Millions of companies use Stripe to accept payments and manage their businesses online.', headquarters: 'San Francisco, CA (Remote)' },
            { name: 'Airbnb', tier: 'Tier 1', domain: 'E-commerce', avgComp: 290, wlbRating: 4.2, interviewDifficulty: 'Hard', description: 'Online marketplace for lodging, primarily homestays for vacation rentals, and tourism activities.', headquarters: 'San Francisco, CA (Remote)' },
            { name: 'Uber', tier: 'Tier 2', domain: 'E-commerce', avgComp: 260, wlbRating: 3.6, interviewDifficulty: 'Hard', description: 'Mobility as a service provider, allowing users to book a car and driver to transport them in a way similar to a taxi.', headquarters: 'San Francisco, CA' },
            { name: 'Coinbase', tier: 'Tier 2', domain: 'Crypto', avgComp: 275, wlbRating: 3.9, interviewDifficulty: 'Hard', description: 'Secure online platform for buying, selling, transferring, and storing digital currency.', headquarters: 'Remote' },
            { name: 'OpenAI', tier: 'Startup', domain: 'AI/ML', avgComp: 500, wlbRating: 3.0, interviewDifficulty: 'Very Hard', description: 'AI research and deployment company dedicated to ensuring that artificial general intelligence benefits all of humanity.', headquarters: 'San Francisco, CA' },
            { name: 'Duolingo', tier: 'Tier 2', domain: 'Edtech', avgComp: 220, wlbRating: 4.6, interviewDifficulty: 'Medium', description: 'Language-learning website and mobile app, as well as a digital language-proficiency assessment exam.', headquarters: 'Pittsburgh, PA' },
        ];
        const created = await Company.insertMany(staticCompanies);
        res.json({ message: 'Companies seeded successfully', count: created.length });
    } catch (err) {
        res.status(500).json({ error: "Failed to seed companies" });
    }
});

module.exports = router;
