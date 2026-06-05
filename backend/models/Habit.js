const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  username: String,
  level: { type: Number, default: 1 },
  xp: { type: Number, default: 0 },
  xpToNextLevel: { type: Number, default: 100 },
  streakDays: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  lastCheckIn: { type: Date, default: null },
  totalCheckIns: { type: Number, default: 0 },
  coins: { type: Number, default: 0 },
  avatarSkin: { type: String, default: 'default' },
  badges: [{ name: String, icon: String, earnedAt: Date, description: String }],
  quests: [{
    id: String,
    title: String,
    description: String,
    xpReward: Number,
    coinReward: Number,
    type: { type: String, enum: ['daily', 'weekly', 'milestone'] },
    completed: { type: Boolean, default: false },
    progress: { type: Number, default: 0 },
    target: Number,
    expiresAt: Date
  }],
  goals: [{
    title: String,
    description: String,
    targetDate: Date,
    category: String,
    completed: { type: Boolean, default: false },
    progress: { type: Number, default: 0 },
    target: Number
  }],
  checkInHistory: [{
    date: { type: Date, default: Date.now },
    xpEarned: Number,
    tasksCompleted: [String],
    mood: String
  }],
  focusSessions: [{
    startedAt: Date,
    duration: Number,
    topic: String,
    completed: Boolean
  }],
  title: { type: String, default: 'Novice Coder' },
  clan: { type: String, default: null },
}, { timestamps: true });

module.exports = mongoose.model('Habit', habitSchema);
