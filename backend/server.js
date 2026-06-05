const express = require('express');
const mongoose = require('mongoose');
const compression = require('compression');
require('dotenv').config();

// Import Configuration
const logger = require('./config/logger');
const constants = require('./config/constants');

// Import Middleware
const {
  corsOptions,
  helmetOptions,
  generalLimiter,
  sanitizeInputs,
  requestLogger,
  apiResponse,
} = require('./middleware/security');
const { globalErrorHandler } = require('./middleware/errorHandler');

// Import Routes
const aiRoutes = require('./routes/ai');
const questionRoutes = require('./routes/questions');
const executeRoutes = require('./routes/execute');
const userRoutes = require('./routes/users');
const discussRoutes = require('./routes/discuss');
const trackerRoutes = require('./routes/tracker');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const resumeRoutes = require('./routes/resume');
const roadmapsRoutes = require('./routes/roadmaps');
const studyPlansRoutes = require('./routes/studyplans');
const contestsRoutes = require('./routes/contests');
const companiesRoutes = require('./routes/companies');
const jobsRoutes = require('./routes/jobs');
const mentorsRoutes = require('./routes/mentors');
const codeReviewsRoutes = require('./routes/codereviews');
const hackathonsRoutes = require('./routes/hackathons');
const projectsRoutes = require('./routes/projects');
const habitsRoutes = require('./routes/habits');
const experiencesRoutes = require('./routes/experiences');
const classesRoutes = require('./routes/classes');
const coderaceRoutes = require('./routes/coderace');
const peerInterviewsRoutes = require('./routes/peerinterviews');
const aiPairRoutes = require('./routes/aipair');
const systemDesignsRoutes = require('./routes/systemdesigns');
const bountiesRoutes = require('./routes/bounties');
const guildsRoutes = require('./routes/guilds');

// ==========================================
// 1. INITIALIZE EXPRESS APP
// ==========================================
const app = express();

// ==========================================
// 2. PRODUCTION MIDDLEWARE
// ==========================================

// Security Headers
app.use(helmetOptions);

// CORS Configuration
const cors = require('cors');
app.use(cors(corsOptions));

// Compression
app.use(compression());

// Body Parser
app.use(express.json({ limit: constants.MAX_UPLOAD_SIZE }));
app.use(express.urlencoded({ limit: constants.MAX_UPLOAD_SIZE, extended: true }));

// Input Sanitization
app.use(sanitizeInputs);

// Request Logging
app.use(requestLogger);

// API Response Wrapper
app.use(apiResponse);

// Rate Limiting
app.use('/api/', generalLimiter);

// ==========================================
// 3. HEALTH CHECK & METRICS
// ==========================================
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    env: process.env.NODE_ENV,
  });
});

app.get('/metrics', (req, res) => {
  res.json({
    memory: process.memoryUsage(),
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// ==========================================
// 4. API ROUTES
// ==========================================
app.use('/api/ai', aiRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/code', executeRoutes);
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/discuss', discussRoutes);
app.use('/api/tracker', trackerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/roadmaps', roadmapsRoutes);
app.use('/api/study-plans', studyPlansRoutes);
app.use('/api/contests', contestsRoutes);
app.use('/api/companies', companiesRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/mentors', mentorsRoutes);
app.use('/api/code-reviews', codeReviewsRoutes);
app.use('/api/hackathons', hackathonsRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/habits', habitsRoutes);
app.use('/api/experiences', experiencesRoutes);
app.use('/api/classes', classesRoutes);
app.use('/api/race', coderaceRoutes);
app.use('/api/peer', peerInterviewsRoutes);
app.use('/api/ai-pair', aiPairRoutes);
app.use('/api/system-designs', systemDesignsRoutes);
app.use('/api/bounties', bountiesRoutes);
app.use('/api/guilds', guildsRoutes);


// ==========================================
// 5. 404 HANDLER
// ==========================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl,
  });
});

// ==========================================
// 6. GLOBAL ERROR HANDLER
// ==========================================
app.use(globalErrorHandler);

// ==========================================
// 7. DATABASE CONNECTION & SERVER START
// ==========================================
const PORT = constants.PORT;

const startServer = async () => {
  try {
    // Validate environment variables
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI environment variable is not set');
    }
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET environment variable is not set');
    }

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      maxPoolSize: 10,
      minPoolSize: 5,
      socketTimeoutMS: 45000,
    });

    logger.info('✅ MongoDB Connected Successfully');

    // Start Server
    app.listen(PORT, () => {
      logger.info(`🚀 Server running on http://localhost:${PORT}`);
      logger.info(`📡 Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    logger.error('❌ Server Start Error', { error: error.message });
    process.exit(1);
  }
};

// Handle Graceful Shutdown
process.on('SIGINT', async () => {
  logger.info('Shutting down gracefully...');
  await mongoose.connection.close();
  process.exit(0);
});

process.on('unhandledRejection', (error) => {
  logger.error('Unhandled Promise Rejection', { error: error.message, stack: error.stack });
  process.exit(1);
});

// Start the server
startServer();