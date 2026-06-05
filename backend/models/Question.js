const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    questionId: { 
        type: String, 
        unique: true,
        sparse: true
    },
    title: { 
        type: String, 
        required: [true, 'Title is required'],
        trim: true,
        minlength: [5, 'Title must be at least 5 characters'],
        maxlength: [200, 'Title must not exceed 200 characters'],
        index: true
    },
    titleSlug: { 
        type: String,
        unique: true,
        lowercase: true,
        index: true
    },
    difficulty: { 
        type: String,
        enum: ['Easy', 'Medium', 'Hard'],
        default: 'Medium',
        index: true
    },
    category: { 
        type: String,
        index: true,
        default: 'Algorithms'
    },
    description: { 
        type: String,
        required: [true, 'Description is required'],
        minlength: [10, 'Description must be at least 10 characters']
    },
    topics: [{
        type: String,
        trim: true,
        lowercase: true,
        index: true
    }],
    examples: [{
        input: String,
        output: String,
        explanation: String
    }],
    constraints: [String],
    hints: [String],
    acceptanceRate: {
        type: Number,
        min: 0,
        max: 100
    },
    attempts: {
        type: Number,
        default: 0
    },
    solved: {
        type: Number,
        default: 0
    },
    testCases: [{
        input: String,
        expectedOutput: String,
        isHidden: { type: Boolean, default: false }
    }],
    solution: {
        approach: String,
        complexity: {
            time: String,
            space: String
        },
        code: String
    },
    isPremium: {
        type: Boolean,
        default: false
    },
    editorial: {
        content: String,
        author: String,
        links: [String]
    },
    relatedQuestions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question'
    }],
    company: [String],
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    totalRatings: {
        type: Number,
        default: 0
    }
}, { 
    timestamps: true,
    indexes: [
        { title: 1 },
        { titleSlug: 1 },
        { difficulty: 1 },
        { category: 1 },
        { topics: 1 },
        { createdAt: -1 },
        { rating: -1 }
    ]
});

// Pre-save middleware to generate slug
questionSchema.pre('save', function(next) {
    if (this.isModified('title')) {
        this.titleSlug = this.title
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-');
    }
    next();
});

// Index for text search
questionSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Question', questionSchema);