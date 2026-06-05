const mongoose = require('mongoose');

const StudyPlanSchema = new mongoose.Schema({
  planId: { type: String, required: true, unique: true }, // e.g. 'blind75'
  name: { type: String, required: true },
  source: String,
  level: String, // Beginner, Intermediate, Advanced, All Levels, Company
  problemsCount: Number,
  topics: [String],
  duration: String,
  enrolledStr: String, // e.g. '450K'
  description: String,
  color: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('StudyPlan', StudyPlanSchema);
