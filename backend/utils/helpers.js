/**
 * Utility Helper Functions
 */

const nodemailer = require('nodemailer');
const logger = require('../config/logger');
const constants = require('../config/constants');

/**
 * Send Email via Nodemailer
 */
const sendEmail = async (to, subject, html) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: constants.EMAIL_CONFIG.from,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info('Email sent successfully', { to, messageId: info.messageId });
    return info;
  } catch (error) {
    logger.error('Failed to send email', { to, error: error.message });
    throw error;
  }
};

/**
 * Pagination Helper
 */
const getPaginationParams = (req) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(constants.MAX_PAGE_SIZE, parseInt(req.query.limit) || constants.DEFAULT_PAGE_SIZE);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

/**
 * Async Handler Wrapper
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Generate Pagination Metadata
 */
const getPaginationMeta = (page, limit, total) => {
  return {
    page,
    limit,
    total,
    pages: Math.ceil(total / limit),
    hasNextPage: page < Math.ceil(total / limit),
    hasPrevPage: page > 1,
  };
};

/**
 * Sanitize User Object (remove sensitive data)
 */
const sanitizeUser = (user) => {
  const userObj = user.toObject ? user.toObject() : user;
  delete userObj.password;
  delete userObj.__v;
  return userObj;
};

/**
 * Generate JWT Token
 */
const generateToken = (userId, role = 'user') => {
  const jwt = require('jsonwebtoken');
  return jwt.sign({ id: userId, role }, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn: constants.JWT_EXPIRE,
  });
};

/**
 * Validate MongoDB ObjectId
 */
const isValidObjectId = (id) => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

/**
 * Calculate leaderboard ranking
 */
const calculateRank = (score) => {
  if (score >= 3000) return 'S+ Tier';
  if (score >= 2500) return 'S Tier';
  if (score >= 2000) return 'A Tier';
  if (score >= 1500) return 'B Tier';
  if (score >= 1000) return 'C Tier';
  if (score >= 500) return 'D Tier';
  return 'E Tier';
};

module.exports = {
  sendEmail,
  getPaginationParams,
  asyncHandler,
  getPaginationMeta,
  sanitizeUser,
  generateToken,
  isValidObjectId,
  calculateRank,
};
