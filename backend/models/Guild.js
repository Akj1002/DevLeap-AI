const mongoose = require('mongoose');

const GuildSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: String,
  emblem: String, // Emoji or URL
  totalXP: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  members: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: { type: String, enum: ['Leader', 'Officer', 'Member'], default: 'Member' },
    joinedAt: { type: Date, default: Date.now }
  }],
  quests: [{
    title: String,
    target: Number,
    progress: { type: Number, default: 0 },
    xpReward: Number,
    isCompleted: { type: Boolean, default: false }
  }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Guild', GuildSchema);
