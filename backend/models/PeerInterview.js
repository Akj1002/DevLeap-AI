const mongoose = require('mongoose');

const peerSessionSchema = new mongoose.Schema({
  requesterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  requesterName: String,
  partnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  partnerName: String,
  scheduledAt: Date,
  duration: { type: Number, default: 60 },
  role: { type: String, enum: ['interviewer', 'interviewee', 'both'], default: 'both' },
  topic: String,
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
  status: { type: String, enum: ['pending', 'confirmed', 'completed', 'cancelled', 'no-show'], default: 'pending' },
  meetingLink: String,
  notes: String,
  feedback: {
    fromRequester: {
      rating: Number,
      communication: Number,
      problemSolving: Number,
      comment: String,
      submittedAt: Date
    },
    fromPartner: {
      rating: Number,
      communication: Number,
      problemSolving: Number,
      comment: String,
      submittedAt: Date
    }
  },
  codeShared: String,
  language: { type: String, default: 'javascript' }
}, { timestamps: true });

const peerProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true },
  username: String,
  avatar: String,
  experience: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Intermediate' },
  skills: [String],
  preferredLanguages: [String],
  availability: [{ day: String, startTime: String, endTime: String }],
  lookingFor: { type: String, enum: ['Practice', 'Mock Interview', 'Both'], default: 'Both' },
  totalSessions: { type: Number, default: 0 },
  avgRating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  bio: String,
  online: { type: Boolean, default: false },
  lastSeen: { type: Date, default: Date.now },
  noShowCount: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = {
  PeerSession: mongoose.model('PeerSession', peerSessionSchema),
  PeerProfile: mongoose.model('PeerProfile', peerProfileSchema)
};
