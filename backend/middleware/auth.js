const jwt = require('jsonwebtoken');
const logger = require('../config/logger');
const { AuthenticationError, AuthorizationError } = require('./errorHandler');

/**
 * Middleware to verify JWT tokens
 * Usage: router.get('/protected', verifyToken, handler)
 */
const verifyToken = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next(new AuthenticationError('No token provided or invalid format'));
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        
        // Attach user info to request
        req.userId = decoded.id;
        req.userRole = decoded.role || 'user';
        
        next();
    } catch (error) {
        logger.warn('Token verification failed', { error: error.message });
        
        if (error.name === 'TokenExpiredError') {
            return next(new AuthenticationError('Token expired'));
        }
        next(new AuthenticationError('Invalid token'));
    }
};

/**
 * Middleware to check if user is admin
 * Usage: router.delete('/admin', verifyToken, requireAdmin, handler)
 */
const requireAdmin = (req, res, next) => {
    if (req.userRole !== 'admin') {
        logger.warn('Unauthorized admin access attempt', { userId: req.userId });
        return next(new AuthorizationError('Admin access required'));
    }
    next();
};

/**
 * Optional token verification (doesn't fail if no token)
 */
const optionalToken = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
            req.userId = decoded.id;
            req.userRole = decoded.role || 'user';
        }
    } catch (error) {
        // Silent fail - user will be treated as anonymous
    }
    next();
};

module.exports = { verifyToken, requireAdmin, optionalToken };
