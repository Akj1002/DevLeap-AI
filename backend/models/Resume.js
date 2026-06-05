const mongoose = require('mongoose');

const BulletPointSchema = new mongoose.Schema({
  text: { type: String, required: true },
  isAiEnhanced: { type: Boolean, default: false },
});

const ExperienceSchema = new mongoose.Schema({
  id: { type: String, required: true },
  jobTitle: { type: String, default: '' },
  company: { type: String, default: '' },
  location: { type: String, default: '' },
  startDate: { type: String, default: '' },
  endDate: { type: String, default: '' },
  current: { type: Boolean, default: false },
  bullets: { type: [BulletPointSchema], default: [] },
});

const EducationSchema = new mongoose.Schema({
  id: { type: String, required: true },
  degree: { type: String, default: '' },
  institution: { type: String, default: '' },
  location: { type: String, default: '' },
  startDate: { type: String, default: '' },
  endDate: { type: String, default: '' },
  gpa: { type: String, default: '' },
  honors: { type: String, default: '' },
});

const ProjectSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, default: '' },
  techStack: { type: String, default: '' },
  link: { type: String, default: '' },
  bullets: { type: [BulletPointSchema], default: [] },
});

const ResumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    personalInfo: {
      fullName: { type: String, default: '' },
      email: { type: String, default: '' },
      phone: { type: String, default: '' },
      location: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      github: { type: String, default: '' },
      portfolio: { type: String, default: '' },
    },
    summary: { type: String, default: '' },
    experience: { type: [ExperienceSchema], default: [] },
    education: { type: [EducationSchema], default: [] },
    projects: { type: [ProjectSchema], default: [] },
    skills: {
      technical: { type: String, default: '' },
      languages: { type: String, default: '' },
      frameworks: { type: String, default: '' },
      tools: { type: String, default: '' },
      soft: { type: String, default: '' },
    },
    certifications: { type: [String], default: [] },
    atsScore: { type: Number, default: 0 },
    lastAtsAnalysis: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Resume', ResumeSchema);
