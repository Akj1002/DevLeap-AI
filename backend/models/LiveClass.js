const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  instructor: { type: String, required: true },
  instructorAvatar: String,
  instructorTitle: String,
  category: { type: String, enum: ['DSA', 'System Design', 'Frontend', 'Backend', 'ML/AI', 'DevOps', 'Career'], default: 'DSA' },
  level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Intermediate' },
  price: { type: Number, default: 0 },
  currency: { type: String, default: 'USD' },
  thumbnail: String,
  duration: String,
  totalLessons: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  enrolledCount: { type: Number, default: 0 },
  enrolledUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  schedule: [{
    date: Date,
    title: String,
    description: String,
    durationMinutes: Number,
    liveUrl: String,
    recordingUrl: String,
    isLive: { type: Boolean, default: false }
  }],
  curriculum: [{
    week: Number,
    title: String,
    topics: [String]
  }],
  tags: [String],
  featured: { type: Boolean, default: false },
  active: { type: Boolean, default: true },
  startDate: Date,
  endDate: Date,
  reviews: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    username: String,
    rating: Number,
    comment: String,
    createdAt: { type: Date, default: Date.now }
  }],
  qna: [{
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    authorName: String,
    question: String,
    answer: String,
    upvotes: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
  }],
  announcements: [{
    title: String, content: String, postedAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

classSchema.index({ category: 1, rating: -1 });
classSchema.index({ featured: -1, enrolledCount: -1 });

module.exports = mongoose.model('LiveClass', classSchema);
