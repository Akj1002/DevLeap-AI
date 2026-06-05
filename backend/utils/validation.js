/**
 * Utility functions for validation and response handling
 */

// Validate email format
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Validate password strength
const validatePassword = (password) => {
    if (password.length < 6) {
        return { valid: false, message: "Password must be at least 6 characters" };
    }
    if (!/[A-Z]/.test(password)) {
        return { valid: false, message: "Password must contain at least one uppercase letter" };
    }
    if (!/[0-9]/.test(password)) {
        return { valid: false, message: "Password must contain at least one number" };
    }
    return { valid: true };
};

// Validate username
const validateUsername = (username) => {
    if (!username || username.trim().length < 3) {
        return { valid: false, message: "Username must be at least 3 characters" };
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        return { valid: false, message: "Username can only contain letters, numbers, and underscores" };
    }
    return { valid: true };
};

// Standard success response
const successResponse = (data, message = "Success") => {
    return {
        success: true,
        message,
        data
    };
};

// Standard error response
const errorResponse = (message, status = 500) => {
    return {
        success: false,
        message,
        status
    };
};

// Pagination helper
const getPaginationParams = (req) => {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 10);
    const skip = (page - 1) * limit;
    return { page, limit, skip };
};

// Safe async wrapper for route handlers
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// Joi Validation Schemas
const Joi = require('joi');

const authSchemas = {
  signup: Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
  }),
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
};

const questionSchemas = {
  query: Joi.object({
    difficulty: Joi.string().valid('Easy', 'Medium', 'Hard'),
    topic: Joi.string(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    search: Joi.string().max(200),
  }),
};

const codeSchemas = {
  execute: Joi.object({
    code: Joi.string().required(),
    language: Joi.string().valid('python', 'javascript', 'java', 'cpp').required(),
    input: Joi.string().allow(''),
    timeout: Joi.number().integer().min(1).max(30).default(5),
  }),
};

module.exports = {
    validateEmail,
    validatePassword,
    validateUsername,
    successResponse,
    errorResponse,
    getPaginationParams,
    asyncHandler,
    authSchemas,
    questionSchemas,
    codeSchemas,
};
