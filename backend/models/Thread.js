const mongoose = require('mongoose');

const threadSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: [true, 'Title is required'],
        trim: true,
        minlength: [5, 'Title must be at least 5 characters'],
        maxlength: [200, 'Title must not exceed 200 characters'],
        index: true
    },
    content: { 
        type: String, 
        required: [true, 'Content is required'],
        minlength: [10, 'Content must be at least 10 characters'],
        maxlength: [5000, 'Content must not exceed 5000 characters']
    },
    author: { 
        type: String,
        required: [true, 'Author is required'],
        index: true
    },
    tags: [{
        type: String,
        lowercase: true,
        trim: true
    }],
    upvotes: { 
        type: Number, 
        default: 0,
        min: 0
    },
    views: {
        type: Number,
        default: 0
    },
    replies: [{
        author: {
            type: String,
            required: true
        },
        text: { 
            type: String,
            required: true,
            minlength: [5, 'Reply must be at least 5 characters'],
            maxlength: [2000, 'Reply must not exceed 2000 characters']
        },
        upvotes: {
            type: Number,
            default: 0
        },
        createdAt: { 
            type: Date, 
            default: Date.now,
            index: true
        }
    }],
    isResolved: {
        type: Boolean,
        default: false,
        index: true
    },
    isPinned: {
        type: Boolean,
        default: false
    },
    category: {
        type: String,
        enum: ['Discussion', 'Question', 'Suggestion', 'Bug Report', 'DSA & Algorithms', 'System Design', 'Interview Experiences', 'Career Advice', 'Hot Takes', 'Resources'],
        default: 'Discussion',
        index: true
    }
}, { 
    timestamps: true,
    indexes: [
        { title: 1 },
        { author: 1 },
        { createdAt: -1 },
        { upvotes: -1 },
        { isResolved: 1 },
        { category: 1 }
    ]
});

// Index for text search
threadSchema.index({ title: 'text', content: 'text' });

module.exports = mongoose.model('Thread', threadSchema);