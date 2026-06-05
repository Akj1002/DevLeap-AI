/**
 * Security Middleware Configuration
 * Includes CORS, Rate Limiting, Security Headers, etc.
 */

const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const xss = require('xss');
const constants = require('../config/constants');
const logger = require('../config/logger');

/**
 * CORS Configuration for production
 */
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      constants.FRONTEND_URL,
      'http://localhost:3000',
      'http://localhost:5000',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5000'
    ];

    if (!origin || allowedOrigins.includes(origin) || (origin && (origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')))) {
      callback(null, true);
    } else {
      logger.error('CORS policy violation', { origin: origin });
      callback(new Error('CORS policy violation'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 3600,
};

/**
 * Helmet Security Headers
 */
const helmetOptions = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
});

/**
 * Rate Limiters
 */
const generalLimiter = rateLimit({
  windowMs: constants.RATE_LIMIT.API.windowMs,
  max: constants.RATE_LIMIT.API.max,
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'development',
  handler: (req, res) => {
    logger.warn('Rate limit exceeded', { path: req.path, ip: req.ip });
    res.status(429).json({
      success: false,
      error: { message: 'Too many requests, please try again later' },
    });
  },
});

const authLimiter = rateLimit({
  windowMs: constants.RATE_LIMIT.AUTH.windowMs,
  max: constants.RATE_LIMIT.AUTH.max,
  skipSuccessfulRequests: true,
  message: 'Too many login attempts, please try again later',
  handler: (req, res) => {
    logger.warn('Auth rate limit exceeded', { email: req.body.email, ip: req.ip });
    res.status(429).json({
      success: false,
      error: { message: 'Too many login attempts, please try again later' },
    });
  },
});

const codeExecutionLimiter = rateLimit({
  windowMs: constants.RATE_LIMIT.CODE_EXECUTION.windowMs,
  max: constants.RATE_LIMIT.CODE_EXECUTION.max,
  message: 'Code execution limit exceeded',
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: { message: 'Code execution limit exceeded' },
    });
  },
});

/**
 * Input Sanitization Middleware
 */
const sanitizeInputs = (req, res, next) => {
  const sanitize = (obj) => {
    for (let key in obj) {
      if (typeof obj[key] === 'string') {
        obj[key] = xss(obj[key], {
          whiteList: {}, // No HTML allowed
          stripIgnoredTag: true,
        });
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitize(obj[key]);
      }
    }
  };

  sanitize(req.body);
  sanitize(req.query);
  next();
};

/**
 * Request Logging Middleware
 */
const requestLogger = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const level = res.statusCode >= 400 ? 'warn' : 'info';
    
    logger[level]('HTTP Request', {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userId: req.userId || 'anonymous',
    });
  });

  next();
};

/**
 * API Response Wrapper
 */
const apiResponse = (req, res, next) => {
  res.success = (data, message = 'Success', statusCode = 200) => {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  };

  res.error = (message, statusCode = 400, details = null) => {
    return res.status(statusCode).json({
      success: false,
      message,
      ...(details && { details }),
    });
  };

  next();
};

module.exports = {
  corsOptions,
  helmetOptions,
  generalLimiter,
  authLimiter,
  codeExecutionLimiter,
  sanitizeInputs,
  requestLogger,
  apiResponse,
};
