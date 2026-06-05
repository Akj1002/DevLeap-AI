const express = require('express');
const router = express.Router();
const { CodeRace, RaceResult } = require('../models/CodeRace');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const crypto = require('crypto');

// 1. GET OPEN ROOMS
router.get('/rooms', async (req, res) => {
  try {
    const { difficulty, status = 'waiting' } = req.query;
    const query = { status, isPublic: true };
    if (difficulty && difficulty !== 'all') query.difficulty = difficulty;
    const rooms = await CodeRace.find(query).sort({ createdAt: -1 }).limit(20);
    res.json(rooms);
  } catch (err) { res.status(500).json({ error: 'Failed to fetch rooms' }); }
});

// 2. GET ROOM BY CODE
router.get('/room/:roomCode', async (req, res) => {
  try {
    const room = await CodeRace.findOne({ roomCode: req.params.roomCode });
    if (!room) return res.status(404).json({ error: 'Room not found' });
    res.json(room);
  } catch (err) { res.status(500).json({ error: 'Failed to fetch room' }); }
});

// 3. CREATE ROOM
router.post('/rooms', async (req, res) => {
  try {
    const roomCode = crypto.randomBytes(3).toString('hex').toUpperCase();
    const race = new CodeRace({ ...req.body, roomCode, status: 'waiting' });
    await race.save();
    res.status(201).json(race);
  } catch (err) { res.status(500).json({ error: 'Failed to create room' }); }
});

// 4. JOIN ROOM
router.post('/room/:roomCode/join', async (req, res) => {
  try {
    const { userId, username, avatar } = req.body;
    const room = await CodeRace.findOne({ roomCode: req.params.roomCode });
    if (!room) return res.status(404).json({ error: 'Room not found' });
    if (room.status !== 'waiting') return res.status(400).json({ error: 'Race already in progress or finished' });
    if (room.participants.find(p => p.userId?.toString() === userId)) return res.json(room);
    if (room.participants.length >= room.maxParticipants) return res.status(400).json({ error: 'Room is full' });
    room.participants.push({ userId, username, avatar, status: 'waiting' });
    await room.save();
    res.json(room);
  } catch (err) { res.status(500).json({ error: 'Failed to join room' }); }
});

// 5. START RACE
router.post('/room/:roomCode/start', async (req, res) => {
  try {
    const room = await CodeRace.findOne({ roomCode: req.params.roomCode });
    if (!room) return res.status(404).json({ error: 'Room not found' });
    room.status = 'active'; room.startedAt = new Date();
    room.participants.forEach(p => p.status = 'coding');
    await room.save();
    res.json(room);
  } catch (err) { res.status(500).json({ error: 'Failed to start race' }); }
});

// 6. SUBMIT SOLUTION
router.post('/room/:roomCode/submit', async (req, res) => {
  try {
    const { userId, code, language } = req.body;
    const room = await CodeRace.findOne({ roomCode: req.params.roomCode });
    if (!room) return res.status(404).json({ error: 'Room not found' });
    const participant = room.participants.find(p => p.userId?.toString() === userId || p.username === req.body.username);
    if (!participant) return res.status(404).json({ error: 'Participant not found' });
    const timeTaken = Math.floor((Date.now() - new Date(room.startedAt).getTime()) / 1000);
    const solvedCount = room.participants.filter(p => p.status === 'solved').length;
    participant.status = 'solved';
    participant.finishedAt = new Date();
    participant.timeTaken = timeTaken;
    participant.code = code;
    participant.language = language;
    participant.rank = solvedCount + 1;

    // Update RaceResult
    let result = await RaceResult.findOne({ userId });
    if (!result) result = new RaceResult({ userId, username: participant.username });
    result.totalRaces += 1;
    if (participant.rank === 1) { result.wins += 1; result.eloRating += 25; }
    else { result.eloRating = Math.max(800, result.eloRating - 10); }
    result.avgTime = result.totalRaces === 1 ? timeTaken : Math.round((result.avgTime + timeTaken) / 2);
    await result.save();

    // Finish race if all solved or timer expired
    const allSolved = room.participants.every(p => p.status === 'solved' || p.status === 'failed');
    if (allSolved) { room.status = 'finished'; room.finishedAt = new Date(); }
    await room.save();
    res.json({ rank: participant.rank, timeTaken, room });
  } catch (err) { res.status(500).json({ error: 'Failed to submit solution' }); }
});

// 7. POLL ROOM STATE (for non-websocket clients)
router.get('/room/:roomCode/state', async (req, res) => {
  try {
    const room = await CodeRace.findOne({ roomCode: req.params.roomCode }).select('-participants.code');
    if (!room) return res.status(404).json({ error: 'Room not found' });
    res.json(room);
  } catch (err) { res.status(500).json({ error: 'Failed to fetch state' }); }
});

// 8. GET GLOBAL LEADERBOARD
router.get('/leaderboard', async (req, res) => {
  try {
    const leaderboard = await RaceResult.find().sort({ wins: -1, eloRating: -1 }).limit(100);
    const ranked = leaderboard.map((r, i) => ({ ...r.toObject(), rank: i + 1 }));
    res.json(ranked);
  } catch (err) { res.status(500).json({ error: 'Failed to fetch leaderboard' }); }
});

// 9. AI: GENERATE RACE PROBLEM
router.post('/generate-problem', async (req, res) => {
  try {
    const { difficulty = 'Medium', topic = 'Arrays' } = req.body;
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `Create a ${difficulty} coding race problem about ${topic}. Return JSON: { title, description, starterCode: { javascript, python }, testCases: [{input, expectedOutput}] (3 cases), timeLimit (seconds, 60-300) }. Problem should be solvable in 5-15 minutes. Return only valid JSON.`;
    const result = await model.generateContent(prompt);
    let text = result.response.text().trim().replace(/```json/g, '').replace(/```/g, '').trim();
    const problem = JSON.parse(text);
    res.json(problem);
  } catch (err) { res.status(500).json({ error: 'Failed to generate problem' }); }
});

// 10. SEED RACES
router.post('/seed/problems', async (req, res) => {
  try {
    await CodeRace.deleteMany({ status: 'waiting', isPublic: true });
    const problems = [
      { title: 'Two Sum Race', problem: 'Given an array of integers nums and an integer target, return indices of the two numbers that add up to target. You may assume exactly one solution exists.', starterCode: new Map([['javascript', 'function twoSum(nums, target) {\n  // Your code here\n}\n'], ['python', 'def two_sum(nums, target):\n    # Your code here\n    pass\n']]), testCases: [{ input: 'nums = [2,7,11,15], target = 9', expectedOutput: '[0,1]' }, { input: 'nums = [3,2,4], target = 6', expectedOutput: '[1,2]' }], difficulty: 'Easy', timeLimit: 90, tags: ['arrays', 'hash-table'], maxParticipants: 4, isPublic: true },
      { title: 'Valid Parentheses Race', problem: 'Given a string s containing just "(" ")" "{" "}" "[" "]", determine if the input string is valid. An input string is valid if: open brackets are closed by the same type, in the correct order, and every close bracket has a corresponding open bracket.', starterCode: new Map([['javascript', 'function isValid(s) {\n  // Your code here\n}\n'], ['python', 'def is_valid(s):\n    # Your code here\n    pass\n']]), testCases: [{ input: 's = "()"', expectedOutput: 'true' }, { input: 's = "()[]{}"', expectedOutput: 'true' }, { input: 's = "(]"', expectedOutput: 'false' }], difficulty: 'Easy', timeLimit: 120, tags: ['stack', 'strings'], maxParticipants: 4, isPublic: true },
      { title: 'Longest Substring Without Repeating', problem: 'Given a string s, find the length of the longest substring without repeating characters.', starterCode: new Map([['javascript', 'function lengthOfLongestSubstring(s) {\n  // Your code here\n}\n'], ['python', 'def length_of_longest_substring(s):\n    # Your code here\n    pass\n']]), testCases: [{ input: 's = "abcabcbb"', expectedOutput: '3' }, { input: 's = "bbbbb"', expectedOutput: '1' }], difficulty: 'Medium', timeLimit: 180, tags: ['sliding-window', 'hash-map'], maxParticipants: 4, isPublic: true },
    ];
    const created = await CodeRace.insertMany(problems.map(p => ({ ...p, status: 'waiting' })));
    res.json({ message: `Seeded ${created.length} race problems` });
  } catch (err) { res.status(500).json({ error: 'Failed to seed problems' }); }
});

module.exports = router;
