const express = require('express');
const router = express.Router();
const Habit = require('../models/Habit');

const LEVEL_TITLES = ['Novice Coder', 'Apprentice Dev', 'Junior Engineer', 'Mid-level Dev', 'Senior Engineer', 'Staff Engineer', 'Principal Dev', 'Distinguished Engineer', 'Fellow', 'Legendary Hacker'];
const XP_PER_LEVEL = (level) => 100 * Math.pow(1.5, level - 1);

const DAILY_QUESTS = [
  { id: 'solve_1', title: 'First Blood', description: 'Solve 1 coding problem today', xpReward: 50, coinReward: 10, type: 'daily', target: 1 },
  { id: 'solve_3', title: 'Hat Trick', description: 'Solve 3 problems today', xpReward: 120, coinReward: 25, type: 'daily', target: 3 },
  { id: 'streak_7', title: 'Week Warrior', description: 'Maintain 7-day streak', xpReward: 300, coinReward: 75, type: 'weekly', target: 7 },
  { id: 'checkin', title: 'Show Up', description: 'Check in today', xpReward: 25, coinReward: 5, type: 'daily', target: 1 },
  { id: 'focus_25', title: 'Deep Work', description: 'Complete a 25-min focus session', xpReward: 75, coinReward: 15, type: 'daily', target: 1 },
];

// 1. GET PROFILE
router.get('/:userId', async (req, res) => {
  try {
    let habit = await Habit.findOne({ userId: req.params.userId });
    if (!habit) {
      habit = new Habit({ userId: req.params.userId, username: req.query.username || 'Developer' });
      // Seed daily quests
      const today = new Date(); today.setHours(23, 59, 59, 999);
      habit.quests = DAILY_QUESTS.map(q => ({ ...q, completed: false, progress: 0, expiresAt: today }));
      await habit.save();
    }
    // Refresh daily quests if expired
    const now = new Date();
    const allExpired = habit.quests.every(q => q.type === 'daily' && new Date(q.expiresAt) < now);
    if (allExpired || habit.quests.length === 0) {
      const tomorrow = new Date(); tomorrow.setHours(23, 59, 59, 999);
      habit.quests = DAILY_QUESTS.map(q => ({ ...q, completed: false, progress: 0, expiresAt: tomorrow }));
      await habit.save();
    }
    res.json(habit);
  } catch (err) { res.status(500).json({ error: 'Failed to fetch habit profile' }); }
});

// 2. DAILY CHECK-IN
router.post('/:userId/checkin', async (req, res) => {
  try {
    const { mood, tasksCompleted } = req.body;
    let habit = await Habit.findOne({ userId: req.params.userId });
    if (!habit) return res.status(404).json({ error: 'Profile not found' });

    const now = new Date();
    const lastCI = habit.lastCheckIn ? new Date(habit.lastCheckIn) : null;
    const isToday = lastCI && lastCI.toDateString() === now.toDateString();
    if (isToday) return res.status(400).json({ error: 'Already checked in today!' });

    const yesterday = new Date(now); yesterday.setDate(yesterday.getDate() - 1);
    const isConsecutive = lastCI && lastCI.toDateString() === yesterday.toDateString();

    if (isConsecutive) habit.streakDays += 1;
    else habit.streakDays = 1;

    if (habit.streakDays > habit.longestStreak) habit.longestStreak = habit.streakDays;

    const xpEarned = 25 + (habit.streakDays * 5);
    habit.xp += xpEarned;
    habit.coins += 5 + Math.floor(habit.streakDays / 7);
    habit.totalCheckIns += 1;
    habit.lastCheckIn = now;

    // Level up check
    while (habit.xp >= XP_PER_LEVEL(habit.level)) {
      habit.xp -= XP_PER_LEVEL(habit.level);
      habit.level += 1;
      habit.title = LEVEL_TITLES[Math.min(habit.level - 1, LEVEL_TITLES.length - 1)];
    }
    habit.xpToNextLevel = XP_PER_LEVEL(habit.level);

    // Mark check-in quest
    const ciQuest = habit.quests.find(q => q.id === 'checkin');
    if (ciQuest && !ciQuest.completed) { ciQuest.progress = 1; ciQuest.completed = true; habit.xp += ciQuest.xpReward; habit.coins += ciQuest.coinReward; }

    // Award streak badges
    if (habit.streakDays === 7 && !habit.badges.find(b => b.name === '7-Day Streak')) {
      habit.badges.push({ name: '7-Day Streak', icon: '🔥', earnedAt: now, description: '7 consecutive days of coding!' });
    }
    if (habit.streakDays === 30 && !habit.badges.find(b => b.name === '30-Day Streak')) {
      habit.badges.push({ name: '30-Day Streak', icon: '⚡', earnedAt: now, description: '30 days streak! Incredible!' });
    }

    habit.checkInHistory.push({ date: now, xpEarned, tasksCompleted: tasksCompleted || [], mood });
    await habit.save();
    res.json({ message: 'Check-in successful!', xpEarned, streakDays: habit.streakDays, level: habit.level, xp: habit.xp, coins: habit.coins, leveled: false });
  } catch (err) { res.status(500).json({ error: 'Check-in failed' }); }
});

// 3. COMPLETE A QUEST
router.post('/:userId/quests/:questId/complete', async (req, res) => {
  try {
    const habit = await Habit.findOne({ userId: req.params.userId });
    if (!habit) return res.status(404).json({ error: 'Profile not found' });
    const quest = habit.quests.find(q => q.id === req.params.questId);
    if (!quest) return res.status(404).json({ error: 'Quest not found' });
    if (quest.completed) return res.status(400).json({ error: 'Quest already completed' });
    quest.completed = true; quest.progress = quest.target;
    habit.xp += quest.xpReward; habit.coins += quest.coinReward;
    while (habit.xp >= XP_PER_LEVEL(habit.level)) { habit.xp -= XP_PER_LEVEL(habit.level); habit.level += 1; }
    habit.xpToNextLevel = XP_PER_LEVEL(habit.level);
    await habit.save();
    res.json({ message: 'Quest completed!', xpEarned: quest.xpReward, coinsEarned: quest.coinReward, newXp: habit.xp, newLevel: habit.level });
  } catch (err) { res.status(500).json({ error: 'Failed to complete quest' }); }
});

// 4. ADD GOAL
router.post('/:userId/goals', async (req, res) => {
  try {
    const habit = await Habit.findOne({ userId: req.params.userId });
    if (!habit) return res.status(404).json({ error: 'Profile not found' });
    habit.goals.push(req.body);
    await habit.save();
    res.json({ goal: habit.goals[habit.goals.length - 1] });
  } catch (err) { res.status(500).json({ error: 'Failed to add goal' }); }
});

// 5. UPDATE GOAL PROGRESS
router.patch('/:userId/goals/:goalId', async (req, res) => {
  try {
    const habit = await Habit.findOne({ userId: req.params.userId });
    const goal = habit.goals.id(req.params.goalId);
    if (!goal) return res.status(404).json({ error: 'Goal not found' });
    Object.assign(goal, req.body);
    if (goal.progress >= goal.target) goal.completed = true;
    await habit.save();
    res.json(goal);
  } catch (err) { res.status(500).json({ error: 'Failed to update goal' }); }
});

// 6. LOG FOCUS SESSION
router.post('/:userId/focus', async (req, res) => {
  try {
    const { duration, topic, completed } = req.body;
    const habit = await Habit.findOne({ userId: req.params.userId });
    if (!habit) return res.status(404).json({ error: 'Profile not found' });
    habit.focusSessions.push({ startedAt: new Date(), duration, topic, completed });
    if (completed) { habit.xp += Math.floor(duration / 5) * 10; habit.coins += Math.floor(duration / 25); }
    // Mark focus quest
    const fq = habit.quests.find(q => q.id === 'focus_25' && !q.completed);
    if (fq && completed && duration >= 25) { fq.completed = true; habit.xp += fq.xpReward; habit.coins += fq.coinReward; }
    await habit.save();
    res.json({ message: 'Focus session logged!', xp: habit.xp });
  } catch (err) { res.status(500).json({ error: 'Failed to log focus session' }); }
});

// 7. GET GLOBAL LEADERBOARD
router.get('/leaderboard/global', async (req, res) => {
  try {
    const top = await Habit.find().sort({ level: -1, xp: -1 }).limit(50).select('username level xp title streakDays badges totalCheckIns');
    res.json(top);
  } catch (err) { res.status(500).json({ error: 'Failed to fetch leaderboard' }); }
});

// 8. GET STREAK CALENDAR
router.get('/:userId/calendar', async (req, res) => {
  try {
    const habit = await Habit.findOne({ userId: req.params.userId }).select('checkInHistory streakDays');
    if (!habit) return res.json({ checkIns: [], streakDays: 0 });
    const checkIns = habit.checkInHistory.slice(-90).map(c => new Date(c.date).toISOString().split('T')[0]);
    res.json({ checkIns, streakDays: habit.streakDays });
  } catch (err) { res.status(500).json({ error: 'Failed to fetch calendar' }); }
});

module.exports = router;
