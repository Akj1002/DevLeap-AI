const mongoose = require('mongoose');

const CompanySchema = new mongoose.Schema({
  name: String,
  tier: String,
  domain: String,
  avgComp: Number,
  wlbRating: Number,
  interviewDifficulty: String,
  description: String,
  headquarters: String,
  logo: String,
  growthRating: Number,
  techStack: [String],
  perks: [String],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Company', CompanySchema);
