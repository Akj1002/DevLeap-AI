const mongoose = require('mongoose');

const ContestSchema = new mongoose.Schema({
  contestId: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  organizer: String,
  date: String,
  time: String, // mostly for upcoming
  duration: String,
  difficulty: String, // mostly for upcoming
  problemsCount: Number,
  registeredCount: Number, // mostly for upcoming
  daysUntil: Number, // mostly for upcoming
  color: String,
  link: String, // URL for external contest platforms
  isPast: { type: Boolean, default: false },
  // Past contest specific fields
  rank: Number,
  score: Number,
  solvedCount: Number,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Contest', ContestSchema);
