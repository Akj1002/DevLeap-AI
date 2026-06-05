const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  techStack: [{ type: String }],
  tags: [{ type: String }],
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  authorName: { type: String, required: true },
  authorAvatar: { type: String, default: '' },
  repoUrl: { type: String, default: '' },
  liveUrl: { type: String, default: '' },
  imageUrl: { type: String, default: '' },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  likeCount: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [{
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    authorName: String,
    text: String,
    createdAt: { type: Date, default: Date.now },
    likes: { type: Number, default: 0 }
  }],
  featured: { type: Boolean, default: false },
  status: { type: String, enum: ['active', 'archived', 'wip'], default: 'active' },
  githubStars: { type: Number, default: 0 },
  forks: { type: Number, default: 0 },
  category: { type: String, enum: ['web', 'mobile', 'ai/ml', 'devtools', 'game', 'open-source', 'other'], default: 'web' },
}, { timestamps: true });

projectSchema.index({ likeCount: -1, createdAt: -1 });
projectSchema.index({ featured: -1, createdAt: -1 });
projectSchema.index({ techStack: 1 });

module.exports = mongoose.model('Project', projectSchema);
