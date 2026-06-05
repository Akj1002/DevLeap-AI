const mongoose = require('mongoose');

const nodeSchema = new mongoose.Schema({
  id: String,
  title: String,
  description: String,
  xpReward: Number,
  dependsOn: [String],
  resources: [{
    title: String,
    url: String,
    type: String
  }]
});

const RoadmapSchema = new mongoose.Schema({
  title: String,
  category: String,
  description: String,
  nodes: [nodeSchema],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Roadmap', RoadmapSchema);
