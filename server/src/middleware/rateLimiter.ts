import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 20 requests per windowMs
  message: {
    error: {
      code: 'RATE_LIMITED',
      message: 'Too many requests from this IP, please try again after 15 minutes'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
});
