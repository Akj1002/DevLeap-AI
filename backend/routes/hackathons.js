const express = require('express');
const router = express.Router();
const Hackathon = require('../models/Hackathon');
const User = require('../models/User');

// 1. GET ALL HACKATHONS (with filters)
router.get('/', async (req, res) => {
  try {
    const { status, online, search, sort = 'featured', page = 1, limit = 12 } = req.query;
    const query = {};
    if (status && status !== 'all') query.status = status;
    if (online === 'true') query.online = true;
    if (search) query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { theme: { $regex: search, $options: 'i' } },
      { organizer: { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search, 'i')] } }
    ];

    const sortMap = {
      featured: { featured: -1, startDate: 1 },
      newest: { createdAt: -1 },
      prize: { prizePool: -1 },
      soonest: { startDate: 1 }
    };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const hackathons = await Hackathon.find(query)
      .sort(sortMap[sort] || sortMap.featured)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-teams.members -submissions -announcements.content -rules -resources');

    const total = await Hackathon.countDocuments(query);
    res.json({ hackathons, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch hackathons' });
  }
});

// 2. GET SINGLE HACKATHON
router.get('/:id', async (req, res) => {
  try {
    const hackathon = await Hackathon.findById(req.params.id);
    if (!hackathon) return res.status(404).json({ error: 'Hackathon not found' });
    res.json(hackathon);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch hackathon' });
  }
});

// 3. REGISTER FOR HACKATHON
router.post('/:id/register', async (req, res) => {
  try {
    const { userId } = req.body;
    const hackathon = await Hackathon.findById(req.params.id);
    if (!hackathon) return res.status(404).json({ error: 'Hackathon not found' });
    if (hackathon.registeredUsers.includes(userId)) {
      return res.status(400).json({ error: 'Already registered' });
    }
    if (hackathon.registeredCount >= hackathon.totalSlots) {
      return res.status(400).json({ error: 'Hackathon is full' });
    }
    hackathon.registeredUsers.push(userId);
    hackathon.registeredCount += 1;
    await hackathon.save();
    res.json({ message: 'Registered successfully!', registeredCount: hackathon.registeredCount });
  } catch (err) {
    res.status(500).json({ error: 'Failed to register' });
  }
});

// 4. CREATE / JOIN A TEAM
router.post('/:id/teams', async (req, res) => {
  try {
    const { userId, username, teamName, skills, projectIdea, maxSize } = req.body;
    const hackathon = await Hackathon.findById(req.params.id);
    if (!hackathon) return res.status(404).json({ error: 'Hackathon not found' });

    const team = {
      name: teamName,
      leaderId: userId, leaderName: username,
      members: [{ userId, username, joinedAt: new Date() }],
      maxSize: maxSize || hackathon.maxTeamSize,
      lookingForMembers: true,
      skills: skills || [], projectIdea
    };
    hackathon.teams.push(team);
    await hackathon.save();
    const savedTeam = hackathon.teams[hackathon.teams.length - 1];
    res.status(201).json({ message: 'Team created!', team: savedTeam });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create team' });
  }
});

// 5. JOIN EXISTING TEAM
router.post('/:id/teams/:teamId/join', async (req, res) => {
  try {
    const { userId, username } = req.body;
    const hackathon = await Hackathon.findById(req.params.id);
    const team = hackathon.teams.id(req.params.teamId);
    if (!team) return res.status(404).json({ error: 'Team not found' });
    if (team.members.length >= team.maxSize) return res.status(400).json({ error: 'Team is full' });
    if (team.members.some(m => m.userId?.toString() === userId)) {
      return res.status(400).json({ error: 'Already in this team' });
    }
    team.members.push({ userId, username, joinedAt: new Date() });
    if (team.members.length >= team.maxSize) team.lookingForMembers = false;
    await hackathon.save();
    res.json({ message: 'Joined team!', team });
  } catch (err) {
    res.status(500).json({ error: 'Failed to join team' });
  }
});

// 6. SUBMIT PROJECT
router.post('/:id/submit', async (req, res) => {
  try {
    const { teamId, teamName, projectName, description, demoUrl, repoUrl } = req.body;
    const hackathon = await Hackathon.findById(req.params.id);
    if (!hackathon) return res.status(404).json({ error: 'Hackathon not found' });

    // Check if team already submitted
    const existing = hackathon.submissions.find(s => s.teamId?.toString() === teamId);
    if (existing) {
      existing.projectName = projectName;
      existing.description = description;
      existing.demoUrl = demoUrl;
      existing.repoUrl = repoUrl;
      existing.submittedAt = new Date();
    } else {
      hackathon.submissions.push({ teamId, teamName, projectName, description, demoUrl, repoUrl });
    }
    await hackathon.save();
    res.json({ message: 'Project submitted!', submissionCount: hackathon.submissions.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit project' });
  }
});

// 7. VOTE FOR A SUBMISSION (public voting)
router.post('/:id/submissions/:subId/vote', async (req, res) => {
  try {
    const { userId } = req.body;
    const hackathon = await Hackathon.findById(req.params.id);
    const submission = hackathon.submissions.id(req.params.subId);
    if (!submission) return res.status(404).json({ error: 'Submission not found' });
    if (submission.voterIds.includes(userId)) {
      return res.status(400).json({ error: 'Already voted' });
    }
    submission.voterIds.push(userId);
    submission.votes += 1;
    await hackathon.save();
    res.json({ votes: submission.votes });
  } catch (err) {
    res.status(500).json({ error: 'Failed to vote' });
  }
});

// 8. ADD ANNOUNCEMENT (admin/organizer)
router.post('/:id/announcements', async (req, res) => {
  try {
    const { title, content } = req.body;
    const hackathon = await Hackathon.findById(req.params.id);
    hackathon.announcements.push({ title, content, postedAt: new Date() });
    await hackathon.save();
    res.json({ message: 'Announcement posted!', announcement: hackathon.announcements[hackathon.announcements.length - 1] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to post announcement' });
  }
});

// 9. GET LEADERBOARD FOR A HACKATHON
router.get('/:id/leaderboard', async (req, res) => {
  try {
    const hackathon = await Hackathon.findById(req.params.id).select('submissions title');
    if (!hackathon) return res.status(404).json({ error: 'Hackathon not found' });
    const sorted = [...hackathon.submissions]
      .sort((a, b) => (b.finalScore || b.votes) - (a.finalScore || a.votes))
      .map((s, i) => ({ ...s.toObject(), rank: i + 1 }));
    res.json({ title: hackathon.title, leaderboard: sorted });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// 10. JUDGE A SUBMISSION
router.post('/:id/submissions/:subId/judge', async (req, res) => {
  try {
    const { judgeId, judgeName, innovation, execution, impact, presentation } = req.body;
    const total = Math.round((innovation + execution + impact + presentation) / 4 * 10) / 10;
    const hackathon = await Hackathon.findById(req.params.id);
    const submission = hackathon.submissions.id(req.params.subId);
    submission.scores.push({ judgeId, judgeName, innovation, execution, impact, presentation, total });
    const avgScore = submission.scores.reduce((s, sc) => s + sc.total, 0) / submission.scores.length;
    submission.finalScore = Math.round(avgScore * 10) / 10;
    await hackathon.save();
    res.json({ message: 'Score recorded', finalScore: submission.finalScore });
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit scores' });
  }
});

// 11. SEED HACKATHONS
router.post('/seed/bulk', async (req, res) => {
  try {
    const now = new Date();
    const samples = [
      {
        title: 'AI for Good Hackathon 2026', tagline: 'Build AI solutions that matter',
        description: 'A 48-hour hackathon focused on leveraging AI to solve real-world social problems.',
        theme: 'Artificial Intelligence', organizer: 'DevLeap AI', organizerLogo: '🤖',
        startDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 9 * 24 * 60 * 60 * 1000),
        registrationDeadline: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
        prizePool: 50000, prizes: [
          { place: '1st', amount: 25000, description: 'Grand Prize + Mentorship' },
          { place: '2nd', amount: 15000, description: 'Runner Up' },
          { place: '3rd', amount: 10000, description: 'Third Place' }
        ],
        tags: ['ai', 'social-good', 'machine-learning'],
        status: 'upcoming', featured: true, online: true, totalSlots: 1000, registeredCount: 347,
        judges: [{ name: 'Dr. Sarah Chen', company: 'Google DeepMind', avatar: '' }],
        sponsors: [{ name: 'Google', logo: '', tier: 'Platinum' }, { name: 'Microsoft', logo: '', tier: 'Gold' }],
        rules: ['Teams of 1-4 people', 'All code must be written during the hackathon', 'Open source projects preferred'],
        announcements: [{ title: 'Registration is open!', content: 'We are excited to announce that registration is now open. Early bird submissions get bonus points.' }]
      },
      {
        title: 'Web3 & Blockchain Sprint', tagline: 'Decentralize the future',
        description: 'Build the next generation of decentralized applications. Smart contracts, DeFi, NFTs, DAOs — all welcome.',
        theme: 'Web3 & Blockchain', organizer: 'CryptoBuilders', organizerLogo: '⛓️',
        startDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 17 * 24 * 60 * 60 * 1000),
        registrationDeadline: new Date(now.getTime() + 12 * 24 * 60 * 60 * 1000),
        prizePool: 100000, prizes: [
          { place: '1st', amount: 50000, description: 'Grand Prize' },
          { place: '2nd', amount: 30000, description: 'Runner Up' },
          { place: '3rd', amount: 20000, description: 'Third Place' }
        ],
        tags: ['web3', 'blockchain', 'defi', 'smart-contracts'],
        status: 'upcoming', online: true, totalSlots: 500, registeredCount: 212,
        judges: [{ name: 'Vitalik B.', company: 'Ethereum', avatar: '' }],
        sponsors: [{ name: 'Ethereum Foundation', logo: '', tier: 'Platinum' }]
      },
      {
        title: 'Open Source Hacktoberfest Sprint', tagline: 'Contribute, collaborate, celebrate',
        description: 'A month-long celebration of open source. Find issues, submit PRs, and win prizes.',
        theme: 'Open Source', organizer: 'GitHub Community',
        startDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 25 * 24 * 60 * 60 * 1000),
        prizePool: 20000,
        tags: ['open-source', 'github', 'collaboration'],
        status: 'active', online: true, totalSlots: 5000, registeredCount: 1847, featured: true,
        announcements: [
          { title: 'Day 5 Update', content: 'Over 1800 hackers registered! Top contributors will be featured on the leaderboard.' }
        ]
      }
    ];
    await Hackathon.deleteMany({});
    const created = await Hackathon.insertMany(samples);
    res.json({ message: `Seeded ${created.length} hackathons` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to seed hackathons' });
  }
});

module.exports = router;
