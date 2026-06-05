const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    username: { 
        type: String, 
        required: [true, 'Username is required'],
        unique: true,
        trim: true,
        minlength: [3, 'Username must be at least 3 characters'],
        maxlength: [30, 'Username must not exceed 30 characters'],
        match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores']
    },
    email: { 
        type: String, 
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email address']
    },
    password: { 
        type: String, 
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters'],
        select: false
    },
    profilePicture: { 
        type: String, 
        default: 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'
    },
    bio: { 
        type: String, 
        default: '',
        maxlength: [500, 'Bio must not exceed 500 characters']
    },
    company: {
        type: String,
        default: '',
        maxlength: [100, 'Company name must not exceed 100 characters']
    },
    role: { 
        type: String, 
        enum: ['user', 'admin', 'moderator'], 
        default: 'user'
    },
    solvedProblems: [{
        questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
        language: { type: String, required: true },
        solvedAt: { type: Date, default: Date.now },
        timeSpent: Number,
        attempts: { type: Number, default: 1 }
    }],
    interviewReports: [{
        date: { type: Date, default: Date.now },
        company: String,
        score: { type: Number, min: 0, max: 100 },
        feedback: String,
        questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
        transcript: [{ role: String, message: String }],
        duration: Number
    }],
    totalAttempts: { type: Number, default: 0 },
    streakDays: { type: Number, default: 0 },
    lastActive: { type: Date, default: Date.now },
    badges: [{ type: String }],
    experience: { type: Number, default: 0 },
    leaderboardScore: { type: Number, default: 0, index: true },
    isActive: { type: Boolean, default: true },
    lastPasswordChange: { type: Date, default: Date.now },
    twoFactorEnabled: { type: Boolean, default: false },
    roadmapProgress: { type: Map, of: mongoose.Schema.Types.Mixed, default: {} },
    studyPlanProgress: { type: Map, of: Number, default: {} },
    registeredContests: [{ type: String }]
}, { 
    timestamps: true,
    indexes: [
        { email: 1 },
        { username: 1 },
        { leaderboardScore: -1 },
        { createdAt: -1 },
        { lastActive: -1 }
    ]
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Compare password method
userSchema.methods.comparePassword = async function(password) {
    return bcrypt.compare(password, this.password);
};

// Remove password from response
userSchema.methods.toJSON = function() {
    const user = this.toObject();
    delete user.password;
    return user;
};

module.exports = mongoose.model('User', userSchema);