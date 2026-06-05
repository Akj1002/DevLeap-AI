/**
 * Production Constants & Configuration
 */

module.exports = {
  // Server Configuration
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Database
  MONGO_URI: process.env.MONGO_URI,
  DB_NAME: 'devleap_db',
  
  // Authentication
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRE: '7d',
  JWT_REFRESH_EXPIRE: '30d',
  SALT_ROUNDS: 10,
  
  // Security
  MAX_UPLOAD_SIZE: '10mb',
  REQUEST_TIMEOUT: 30000,
  
  // Rate Limiting
  RATE_LIMIT: {
    AUTH: { windowMs: 15 * 60 * 1000, max: 5 }, // 5 requests per 15 min
    API: { windowMs: 15 * 60 * 1000, max: 100 },
    CODE_EXECUTION: { windowMs: 60 * 1000, max: 10 }, // 10 per minute
  },
  
  // Pagination
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  
  // Email
  EMAIL_CONFIG: {
    from: process.env.EMAIL_USER || 'noreply@devleap.ai',
    service: 'gmail',
  },
  
  // Google
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  
  // Gemini AI
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  
  // Frontend
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  
  // Cache (Redis)
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  CACHE_TTL: {
    QUESTIONS: 3600, // 1 hour
    USER_PROFILE: 1800, // 30 min
    LEADERBOARD: 300, // 5 min
  },
  
  // Features
  ENABLE_MOCK_INTERVIEW: true,
  ENABLE_AI_HINTS: true,
  ENABLE_DISCUSSION: true,
};
