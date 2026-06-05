const mongoose = require('mongoose');

const codeRaceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  problem: { type: String, required: true },
  starterCode: { type: Map, of: String, default: {} },
  testCases: [{
    input: String,
    expectedOutput: String,
    hidden: { type: Boolean, default: false }
  }],
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
  timeLimit: { type: Number, default: 60 },
  tags: [String],
  participants: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    username: String,
    avatar: String,
    status: { type: String, enum: ['waiting', 'coding', 'solved', 'failed'], default: 'waiting' },
    finishedAt: Date,
    timeTaken: Number,
    code: String,
    language: String,
    rank: Number
  }],
  status: { type: String, enum: ['waiting', 'active', 'finished'], default: 'waiting' },
  startedAt: Date,
  finishedAt: Date,
  maxParticipants: { type: Number, default: 4 },
  isPublic: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  roomCode: { type: String, unique: true, sparse: true },
  spectators: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

// Race result leaderboard
const raceResultSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  username: String,
  totalRaces: { type: Number, default: 0 },
  wins: { type: Number, default: 0 },
  avgTime: { type: Number, default: 0 },
  eloRating: { type: Number, default: 1000 },
  rank: Number
}, { timestamps: true });

module.exports = {
  CodeRace: mongoose.model('CodeRace', codeRaceSchema),
  RaceResult: mongoose.model('RaceResult', raceResultSchema)
};
