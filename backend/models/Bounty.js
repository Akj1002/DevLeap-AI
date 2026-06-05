const mongoose = require('mongoose');

const BountySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  rewardAmount: { type: Number, required: true }, // in USD
  tags: [String],
  status: { type: String, enum: ['Open', 'In Progress', 'Under Review', 'Paid'], default: 'Open' },
  postedBy: { type: String, required: true }, // Company or individual name
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  dueDate: { type: Date },
  createdAt: { type: Date, default: Date.now },
  applicants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

module.exports = mongoose.model('Bounty', BountySchema);
