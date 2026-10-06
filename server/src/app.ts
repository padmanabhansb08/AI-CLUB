import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

import authRoutes from './routes/authRoutes';
import adminRoutes from './routes/adminRoutes';
import studentRoutes from './routes/studentRoutes';
import memberRoutes from './routes/memberRoutes';
import publicRoutes from './routes/publicRoutes';
import eventRoutes from './routes/eventRoutes';
import projectRoutes from './routes/projectRoutes';
import teamRoutes from './routes/teamRoutes';
import courseRoutes from './routes/courseRoutes';
import moduleRoutes from './routes/moduleRoutes';
import lessonRoutes from './routes/lessonRoutes';
import { router as announcementRoutes } from './routes/announcementRoutes';
import { router as directoryRoutes } from './routes/directoryRoutes';
import achievementRoutes from './routes/achievementRoutes';
import notificationRoutes from './routes/notificationRoutes';
import aiRoutes from './routes/aiRoutes';
import assessmentRoutes from './routes/assessmentRoutes';
import applicationRoutes from './routes/applicationRoutes';
import { authenticate } from './middleware/auth';
import { dashboardController } from './controllers/dashboardController';
import { catalogController } from './controllers/catalogController';
import { pool } from './db';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { requestId } from './middleware/requestId';
import { apiLimiter } from './middleware/rateLimiter';
import { config } from './config';

const app = express();

// 1. Request ID Correlation (Must run first for full lifecycle tracing)
app.use(requestId);

// 2. Hardened Security Headers (OWASP Recommended Content-Security-Policy & HSTS)
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
        imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
        connectSrc: ["'self'", 'http://localhost:5000', 'http://127.0.0.1:5000', config.CORS_ORIGIN],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"],
        upgradeInsecureRequests: config.NODE_ENV === 'production' ? [] : null,
      },
    },
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    hsts: config.NODE_ENV === 'production' ? { maxAge: 31536000, includeSubDomains: true } : false,
  })
);

// 3. Strict Environment-Aware CORS
const allowedOrigins = [
  config.CORS_ORIGIN,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser requests (e.g. curl, test runners, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin) || config.NODE_ENV === 'development') {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

// 4. Input Limits & Parser
app.use(express.json({ limit: '1mb' }));

// 5. Global API Rate Limiter (Bypassed during automated test suites)
app.use(apiLimiter);

// 6. Structured Request Logging with Correlation ID
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const timestamp = new Date().toISOString();
    if (config.NODE_ENV !== 'test') {
      console.log(
        `[${timestamp}] [${req.id || 'no-id'}] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`
      );
    }
  });
  next();
});

// 7. Liveness Probe (GET /health & GET /api/health)
app.get(['/health', '/api/health'], (req, res) => {
  return res.status(200).json({
    success: true,
    data: {
      status: 'ok',
      service: 'ai-club-api',
      database: 'connected',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    },
    message: 'AI CLUB API is healthy',
  });
});

// 8. Readiness Probe (GET /ready & GET /api/ready - verifies DB connection pool)
app.get(['/ready', '/api/ready'], async (req, res) => {
  try {
    await pool.query('SELECT 1');
    return res.status(200).json({
      success: true,
      data: {
        status: 'ready',
        database: 'connected',
        timestamp: new Date().toISOString(),
      },
      message: 'AI CLUB API is ready to accept traffic',
    });
  } catch (error: any) {
    return res.status(503).json({
      success: false,
      data: {
        status: 'not_ready',
        database: 'disconnected',
      },
      error: {
        code: 'SERVICE_UNAVAILABLE',
        message: 'Database connection failed',
        requestId: req.id,
        details: {},
      },
    });
  }
});

// 9. Domain API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/me', studentRoutes);
app.use('/api/members', memberRoutes);
app.get('/api/dashboard', authenticate, dashboardController.getDashboard);
app.get('/api/skills', catalogController.getSkills);
app.get('/api/interests', catalogController.getInterests);
app.use('/api/announcements', announcementRoutes);
app.use('/api/directory', directoryRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api', publicRoutes);

// 10. Fallthrough 404 Handler
app.use(notFoundHandler);

// 11. Centralized Production Error Handler
app.use(errorHandler);

export default app;
