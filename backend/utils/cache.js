/**
 * Redis Cache Manager
 * Handles caching for frequently accessed data
 */

const redis = require('redis');
const logger = require('../config/logger');
const constants = require('../config/constants');

let client = null;
let isConnected = false;

// Initialize Redis Client
const initializeRedis = async () => {
  try {
    client = redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      socket: {
        reconnectStrategy: (retries) => Math.min(retries * 50, 500),
      },
    });

    client.on('error', (err) => {
      logger.error('Redis Client Error', { error: err.message });
      isConnected = false;
    });

    client.on('connect', () => {
      logger.info('✅ Redis Connected Successfully');
      isConnected = true;
    });

    await client.connect();
    return true;
  } catch (error) {
    logger.warn('Redis connection failed, caching disabled', { error: error.message });
    return false;
  }
};

// Cache Get
const get = async (key) => {
  if (!isConnected || !client) return null;
  
  try {
    const cached = await client.get(key);
    if (cached) {
      logger.debug('Cache hit', { key });
      return JSON.parse(cached);
    }
    return null;
  } catch (error) {
    logger.warn('Cache get error', { key, error: error.message });
    return null;
  }
};

// Cache Set
const set = async (key, value, ttl = 3600) => {
  if (!isConnected || !client) return false;
  
  try {
    await client.setEx(key, ttl, JSON.stringify(value));
    logger.debug('Cache set', { key, ttl });
    return true;
  } catch (error) {
    logger.warn('Cache set error', { key, error: error.message });
    return false;
  }
};

// Cache Delete
const del = async (key) => {
  if (!isConnected || !client) return false;
  
  try {
    await client.del(key);
    logger.debug('Cache delete', { key });
    return true;
  } catch (error) {
    logger.warn('Cache delete error', { key, error: error.message });
    return false;
  }
};

// Cache Delete Pattern
const delPattern = async (pattern) => {
  if (!isConnected || !client) return false;
  
  try {
    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await client.del(keys);
      logger.debug('Cache delete pattern', { pattern, count: keys.length });
    }
    return true;
  } catch (error) {
    logger.warn('Cache delete pattern error', { pattern, error: error.message });
    return false;
  }
};

// Cache Clear All
const flushAll = async () => {
  if (!isConnected || !client) return false;
  
  try {
    await client.flushDb();
    logger.info('Cache flushed');
    return true;
  } catch (error) {
    logger.warn('Cache flush error', { error: error.message });
    return false;
  }
};

// Cache Get or Set (with function)
const getOrSet = async (key, fn, ttl = 3600) => {
  // Try to get from cache
  const cached = await get(key);
  if (cached) return cached;

  // If not in cache, execute function
  try {
    const result = await fn();
    await set(key, result, ttl);
    return result;
  } catch (error) {
    logger.error('Cache getOrSet error', { key, error: error.message });
    throw error;
  }
};

// Cache Keys
const getCacheKeys = {
  question: (id) => `question:${id}`,
  questions: (page, limit) => `questions:page:${page}:limit:${limit}`,
  userProfile: (userId) => `user:profile:${userId}`,
  leaderboard: (page, limit) => `leaderboard:page:${page}:limit:${limit}`,
  userStats: (userId) => `user:stats:${userId}`,
  thread: (id) => `thread:${id}`,
  threads: (page, limit) => `threads:page:${page}:limit:${limit}`,
};

// Invalidation helpers
const invalidateUserCache = async (userId) => {
  await del(getCacheKeys.userProfile(userId));
  await del(getCacheKeys.userStats(userId));
  await delPattern(`user:*:${userId}:*`);
};

const invalidateQuestionCache = async (questionId) => {
  await del(getCacheKeys.question(questionId));
  await delPattern('questions:*');
};

const invalidateLeaderboardCache = async () => {
  await delPattern('leaderboard:*');
};

module.exports = {
  initializeRedis,
  get,
  set,
  del,
  delPattern,
  flushAll,
  getOrSet,
  getCacheKeys,
  invalidateUserCache,
  invalidateQuestionCache,
  invalidateLeaderboardCache,
  isConnected: () => isConnected,
};
