import rateLimit from 'express-rate-limit';
import { config } from '../config';

const isTest = () => config.NODE_ENV === 'test' || process.env.NODE_ENV === 'test';

/**
 * Authentication rate limiter: 50 requests per 15 minutes per IP.
 * Protects login, registration, password resets from brute-force attacks.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  skip: isTest,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMITED',
        message: 'Too many authentication attempts. Please try again after 15 minutes.',
        requestId: req.id,
        details: {},
      },
    });
  },
});

/**
 * AI operations rate limiter: 30 requests per minute per IP.
 * Protects AI token budgets and prevents rapid LLM spam.
 */
export const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  skip: isTest,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMITED',
        message: 'Too many AI requests. Please wait a moment before sending more queries.',
        requestId: req.id,
        details: {},
      },
    });
  },
});

/**
 * Administrative export limiter: 15 export requests per 10 minutes per IP.
 * Protects backend from heavy memory usage caused by concurrent CSV dataset exports.
 */
export const exportLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  skip: isTest,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMITED',
        message: 'Export limit reached. Please wait before generating additional bulk data exports.',
        requestId: req.id,
        details: {},
      },
    });
  },
});

/**
 * Global API rate limiter: 500 requests per 15 minutes per IP.
 * Baseline DDoS and scrape protection.
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  skip: isTest,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMITED',
        message: 'Too many requests. Please slow down and try again later.',
        requestId: req.id,
        details: {},
      },
    });
  },
});
