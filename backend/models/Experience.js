const mongoose = require('mongoose');

const experienceSchema = new mongoose.Schema({
  company: { type: String, required: true, trim: true },
  role: { type: String, required: true },
  level: { type: String, enum: ['Intern', 'Entry', 'Mid', 'Senior', 'Staff', 'Principal'], default: 'Entry' },
  outcome: { type: String, enum: ['Offer', 'Rejected', 'Withdrew', 'Ghost', 'Pending'], default: 'Offer' },
  difficulty: { type: Number, min: 1, max: 5, default: 3 },
  rounds: { type: Number, default: 4 },
  duration: { type: String, default: '4 weeks' },
  salaryOffered: { type: Number, default: 0 },
  questions: [{
    round: String,
    question: String,
    category: String,
    difficulty: String,
    upvotes: { type: Number, default: 0 }
  }],
  tips: [{ type: String }],
  process: { type: String },
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  authorName: { type: String, default: 'Anonymous' },
  anonymous: { type: Boolean, default: false },
  verified: { type: Boolean, default: false },
  upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  upvoteCount: { type: Number, default: 0 },
  comments: [{
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    authorName: String,
    text: String,
    createdAt: { type: Date, default: Date.now }
  }],
  tags: [{ type: String }],
  interviewMonth: { type: String },
  interviewYear: { type: Number, default: new Date().getFullYear() },
  helpful: { type: Number, default: 0 },
}, { timestamps: true });

experienceSchema.index({ company: 1, createdAt: -1 });
experienceSchema.index({ upvoteCount: -1 });

module.exports = mongoose.model('Experience', experienceSchema);
