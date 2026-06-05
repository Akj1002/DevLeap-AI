const express = require('express');
const router = express.Router();
const { PeerSession, PeerProfile } = require('../models/PeerInterview');
const crypto = require('crypto');

// 1. GET PEER PROFILES (for matching)
router.get('/profiles', async (req, res) => {
  try {
    const { experience, lookingFor, language, online } = req.query;
    const query = {};
    if (experience && experience !== 'all') query.experience = experience;
    if (lookingFor && lookingFor !== 'all') query.lookingFor = { $in: [lookingFor, 'Both'] };
    if (language) query.preferredLanguages = { $in: [language] };
    if (online === 'true') query.online = true;
    const profiles = await PeerProfile.find(query).sort({ avgRating: -1, totalSessions: -1 }).limit(20);
    res.json(profiles);
  } catch (err) { res.status(500).json({ error: 'Failed to fetch profiles' }); }
});

// 2. GET / CREATE MY PROFILE
router.get('/profile/:userId', async (req, res) => {
  try {
    let profile = await PeerProfile.findOne({ userId: req.params.userId });
    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    res.json(profile);
  } catch (err) { res.status(500).json({ error: 'Failed to fetch profile' }); }
});

router.post('/profile', async (req, res) => {
  try {
    const existing = await PeerProfile.findOne({ userId: req.body.userId });
    if (existing) { Object.assign(existing, req.body); await existing.save(); return res.json(existing); }
    const profile = new PeerProfile(req.body);
    await profile.save();
    res.status(201).json(profile);
  } catch (err) { res.status(500).json({ error: 'Failed to create profile' }); }
});

// 3. UPDATE ONLINE STATUS
router.patch('/profile/:userId/online', async (req, res) => {
  try {
    const profile = await PeerProfile.findOneAndUpdate({ userId: req.params.userId }, { online: req.body.online, lastSeen: new Date() }, { new: true });
    res.json({ online: profile?.online });
  } catch (err) { res.status(500).json({ error: 'Failed to update status' }); }
});

// 4. CREATE SESSION REQUEST
router.post('/sessions', async (req, res) => {
  try {
    const meetingLink = `https://meet.devleap.ai/peer-${crypto.randomBytes(4).toString('hex')}`;
    const session = new PeerSession({ ...req.body, meetingLink, status: 'pending' });
    await session.save();
    res.status(201).json(session);
  } catch (err) { res.status(500).json({ error: 'Failed to create session' }); }
});

// 5. GET MY SESSIONS
router.get('/sessions/user/:userId', async (req, res) => {
  try {
    const sessions = await PeerSession.find({ $or: [{ requesterId: req.params.userId }, { partnerId: req.params.userId }] }).sort({ scheduledAt: -1 });
    res.json(sessions);
  } catch (err) { res.status(500).json({ error: 'Failed to fetch sessions' }); }
});

// 6. CONFIRM SESSION
router.patch('/sessions/:id/confirm', async (req, res) => {
  try {
    const session = await PeerSession.findByIdAndUpdate(req.params.id, { status: 'confirmed' }, { new: true });
    res.json(session);
  } catch (err) { res.status(500).json({ error: 'Failed to confirm' }); }
});

// 7. CANCEL SESSION
router.patch('/sessions/:id/cancel', async (req, res) => {
  try {
    const session = await PeerSession.findByIdAndUpdate(req.params.id, { status: 'cancelled' }, { new: true });
    res.json(session);
  } catch (err) { res.status(500).json({ error: 'Failed to cancel' }); }
});

// 8. SUBMIT FEEDBACK
router.post('/sessions/:id/feedback', async (req, res) => {
  try {
    const { fromUser, userId, rating, communication, problemSolving, comment } = req.body;
    const session = await PeerSession.findById(req.params.id);
    const feedbackKey = fromUser === 'requester' ? 'fromRequester' : 'fromPartner';
    session.feedback[feedbackKey] = { rating, communication, problemSolving, comment, submittedAt: new Date() };
    session.status = 'completed';
    await session.save();

    // Update partner profile stats
    const partnerId = fromUser === 'requester' ? session.partnerId : session.requesterId;
    const profile = await PeerProfile.findOne({ userId: partnerId });
    if (profile) {
      profile.totalSessions += 1;
      const totalRating = (profile.avgRating * profile.reviewCount) + rating;
      profile.reviewCount += 1;
      profile.avgRating = Math.round((totalRating / profile.reviewCount) * 10) / 10;
      await profile.save();
    }
    res.json(session);
  } catch (err) { res.status(500).json({ error: 'Failed to submit feedback' }); }
});

// 9. QUICK MATCH (find available partner)
router.post('/quick-match', async (req, res) => {
  try {
    const { userId, difficulty, topic } = req.body;
    const profile = await PeerProfile.findOne({ online: true, userId: { $ne: userId } }).sort({ avgRating: -1 });
    if (!profile) return res.status(404).json({ error: 'No partners available right now. Try again in a few minutes.' });
    const meetingLink = `https://meet.devleap.ai/peer-${crypto.randomBytes(4).toString('hex')}`;
    res.json({ partner: profile, meetingLink, message: 'Match found!' });
  } catch (err) { res.status(500).json({ error: 'Quick match failed' }); }
});

// 10. SEED PROFILES
router.post('/seed/bulk', async (req, res) => {
  try {
    await PeerProfile.deleteMany({});
    const profiles = [
      { userId: new require('mongoose').Types.ObjectId(), username: 'codemaster_alex', experience: 'Advanced', skills: ['System Design', 'Algorithms', 'Python'], preferredLanguages: ['Python', 'JavaScript'], lookingFor: 'Both', totalSessions: 47, avgRating: 4.9, reviewCount: 41, bio: 'Ex-Google SWE, love helping others prep for FAANG. Specializes in system design and hard LeetCode.', online: true },
      { userId: new require('mongoose').Types.ObjectId(), username: 'priya_dev', experience: 'Intermediate', skills: ['Frontend', 'React', 'TypeScript'], preferredLanguages: ['JavaScript', 'TypeScript'], lookingFor: 'Practice', totalSessions: 23, avgRating: 4.7, reviewCount: 19, bio: 'Full-stack developer practicing for senior roles. Great at frontend systems and behavioral interviews.', online: true },
      { userId: new require('mongoose').Types.ObjectId(), username: 'ml_jordan', experience: 'Advanced', skills: ['ML', 'Python', 'Algorithms'], preferredLanguages: ['Python'], lookingFor: 'Mock Interview', totalSessions: 61, avgRating: 4.8, reviewCount: 55, bio: 'ML engineer at Anthropic. Can conduct rigorous ML system design and coding interviews.', online: false },
      { userId: new require('mongoose').Types.ObjectId(), username: 'beginner_sam', experience: 'Beginner', skills: ['Arrays', 'Strings', 'Java'], preferredLanguages: ['Java', 'Python'], lookingFor: 'Practice', totalSessions: 8, avgRating: 4.5, reviewCount: 6, bio: 'CS student practicing for first internship interviews. Looking for supportive practice partners.', online: true },
    ];
    const created = await PeerProfile.insertMany(profiles);
    res.json({ message: `Seeded ${created.length} peer profiles` });
  } catch (err) { res.status(500).json({ error: 'Failed to seed' }); }
});

module.exports = router;
