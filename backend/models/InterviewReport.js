const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  questionId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Question',
    required: [true, 'Question ID is required'],
    index: true
  },
  date: { 
    type: Date, 
    default: Date.now,
    index: true
  },
  company: {
    type: String,
    trim: true,
    maxlength: [100, 'Company name must not exceed 100 characters']
  },
  finalScore: { 
    type: Number,
    required: [true, 'Score is required'],
    min: [0, 'Score must be at least 0'],
    max: [100, 'Score must not exceed 100']
  },
  codeCorrectness: {
    type: Number,
    min: 0,
    max: 100
  },
  codeQuality: {
    type: Number,
    min: 0,
    max: 100
  },
  communication: {
    type: Number,
    min: 0,
    max: 100
  },
  problemSolving: {
    type: Number,
    min: 0,
    max: 100
  },
  timeComplexity: { 
    type: String,
    enum: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)', 'O(n²)', 'O(n³)', 'O(2^n)', 'O(n!)', 'Unknown'],
    default: 'Unknown'
  },
  spaceComplexity: { 
    type: String,
    enum: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)', 'O(n!)', 'Unknown'],
    default: 'Unknown'
  },
  aiFeedback: { 
    type: String,
    maxlength: [2000, 'Feedback must not exceed 2000 characters']
  },
  improvementAreas: [String],
  strengths: [String],
  transcript: [{
    role: {
      type: String,
      enum: ['user', 'ai'],
      required: true
    },
    message: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  duration: {
    type: Number,
    description: 'Interview duration in seconds'
  },
  codeSubmitted: {
    language: String,
    code: String,
    testsPassed: Number,
    totalTests: Number
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  tags: [String]
}, {
  timestamps: true,
  indexes: [
    { userId: 1, date: -1 },
    { questionId: 1 },
    { finalScore: -1 },
    { date: -1 },
    { company: 1 }
  ]
});

module.exports = mongoose.model('InterviewReport', reportSchema);