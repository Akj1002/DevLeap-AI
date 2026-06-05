const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  teamId: { type: mongoose.Schema.Types.ObjectId },
  teamName: String,
  projectName: String,
  description: String,
  demoUrl: String,
  repoUrl: String,
  submittedAt: { type: Date, default: Date.now },
  votes: { type: Number, default: 0 },
  voterIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  scores: [{
    judgeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    judgeName: String,
    innovation: Number,
    execution: Number,
    impact: Number,
    presentation: Number,
    total: Number
  }],
  finalScore: { type: Number, default: 0 },
  rank: Number
});

const teamSchema = new mongoose.Schema({
  name: String,
  leaderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  leaderName: String,
  members: [{ userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, username: String, joinedAt: Date }],
  maxSize: { type: Number, default: 4 },
  lookingForMembers: { type: Boolean, default: true },
  skills: [String],
  projectIdea: String
});

const hackathonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  tagline: String,
  description: String,
  theme: String,
  organizer: String,
  organizerLogo: String,
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  registrationDeadline: Date,
  prizePool: { type: Number, default: 0 },
  prizes: [{ place: String, amount: Number, description: String }],
  maxTeamSize: { type: Number, default: 4 },
  minTeamSize: { type: Number, default: 1 },
  totalSlots: { type: Number, default: 500 },
  registeredCount: { type: Number, default: 0 },
  registeredUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  teams: [teamSchema],
  submissions: [submissionSchema],
  judges: [{ name: String, company: String, avatar: String }],
  sponsors: [{ name: String, logo: String, tier: String }],
  tags: [String],
  status: { type: String, enum: ['upcoming', 'active', 'judging', 'completed'], default: 'upcoming' },
  featured: { type: Boolean, default: false },
  online: { type: Boolean, default: true },
  location: String,
  rules: [String],
  resources: [{ title: String, url: String, type: String }],
  announcements: [{ title: String, content: String, postedAt: { type: Date, default: Date.now } }]
}, { timestamps: true });

hackathonSchema.index({ startDate: 1, status: 1 });
hackathonSchema.index({ featured: -1, startDate: 1 });

module.exports = mongoose.model('Hackathon', hackathonSchema);
