const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  username: String,
  email: String,
  coverLetter: String,
  resumeUrl: String,
  status: { type: String, enum: ['applied', 'shortlisted', 'rejected', 'offer'], default: 'applied' },
  appliedAt: { type: Date, default: Date.now }
});

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  company: { type: String, required: true, trim: true },
  companyLogo: { type: String, default: '' },
  location: { type: String, required: true },
  type: { type: String, enum: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'], default: 'Full-time' },
  experience: { type: String, enum: ['Entry', 'Mid', 'Senior', 'Lead', 'Principal'], default: 'Entry' },
  salaryMin: { type: Number, default: 0 },
  salaryMax: { type: Number, default: 0 },
  currency: { type: String, default: 'USD' },
  description: { type: String, required: true },
  requirements: [{ type: String }],
  skills: [{ type: String }],
  benefits: [{ type: String }],
  remote: { type: Boolean, default: false },
  featured: { type: Boolean, default: false },
  active: { type: Boolean, default: true },
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  applications: [applicationSchema],
  savedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  views: { type: Number, default: 0 },
  deadline: { type: Date },
  tags: [{ type: String }]
}, { timestamps: true });

jobSchema.index({ title: 'text', company: 'text', description: 'text', skills: 'text' });
jobSchema.index({ createdAt: -1 });
jobSchema.index({ featured: -1, createdAt: -1 });

module.exports = mongoose.model('Job', jobSchema);
