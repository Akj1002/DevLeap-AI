const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  studentName: String,
  scheduledAt: Date,
  duration: { type: Number, default: 60 }, // minutes
  topic: String,
  status: { type: String, enum: ['pending', 'confirmed', 'completed', 'cancelled'], default: 'pending' },
  meetingLink: String,
  notes: String,
  rating: { type: Number, min: 1, max: 5 },
  feedback: String,
  bookedAt: { type: Date, default: Date.now }
});

const reviewSchema = new mongoose.Schema({
  reviewerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewerName: String,
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: String,
  createdAt: { type: Date, default: Date.now }
});

const mentorSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  name: { type: String, required: true },
  avatar: String,
  title: { type: String, required: true },
  company: String,
  expertise: [{ type: String }],
  skills: [{ type: String }],
  bio: { type: String, maxlength: 1000 },
  hourlyRate: { type: Number, default: 0 },
  currency: { type: String, default: 'USD' },
  available: { type: Boolean, default: true },
  totalSessions: { type: Number, default: 0 },
  totalStudents: { type: Number, default: 0 },
  avgRating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  reviews: [reviewSchema],
  sessions: [sessionSchema],
  availability: {
    monday: [{ start: String, end: String }],
    tuesday: [{ start: String, end: String }],
    wednesday: [{ start: String, end: String }],
    thursday: [{ start: String, end: String }],
    friday: [{ start: String, end: String }],
    saturday: [{ start: String, end: String }],
    sunday: [{ start: String, end: String }]
  },
  languages: [{ type: String }],
  linkedinUrl: String,
  githubUrl: String,
  twitterUrl: String,
  verified: { type: Boolean, default: false },
  featured: { type: Boolean, default: false }
}, { timestamps: true });

mentorSchema.index({ expertise: 1, avgRating: -1 });
mentorSchema.index({ available: 1, featured: -1 });

module.exports = mongoose.model('Mentor', mentorSchema);
