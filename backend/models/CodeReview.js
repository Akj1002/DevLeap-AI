const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  author: String,
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  text: { type: String, required: true },
  lineNumber: Number,
  codeSnippet: String,
  upvotes: { type: Number, default: 0 },
  resolved: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const codeReviewSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  code: { type: String, required: true },
  language: { type: String, default: 'javascript' },
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  authorName: String,
  tags: [{ type: String }],
  comments: [commentSchema],
  aiReview: {
    summary: String,
    issues: [{ severity: String, line: Number, message: String, suggestion: String }],
    score: Number,
    generatedAt: Date
  },
  upvotes: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  status: { type: String, enum: ['open', 'resolved', 'closed'], default: 'open' },
  solved: { type: Boolean, default: false },
  complexity: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Intermediate' }
}, { timestamps: true });

codeReviewSchema.index({ createdAt: -1 });
codeReviewSchema.index({ language: 1, createdAt: -1 });

module.exports = mongoose.model('CodeReview', codeReviewSchema);
