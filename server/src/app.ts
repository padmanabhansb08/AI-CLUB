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
import { authenticate } from './middleware/auth';
import { dashboardController } from './controllers/dashboardController';
import { catalogController } from './controllers/catalogController';
import { pool } from './db';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { config } from './config';

const app = express();

// Security Middleware
app.use(helmet());

// Flexible CORS for development
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
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin) || config.NODE_ENV === 'development') {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '1mb' }));

// Structured Request Logging (timestamp, HTTP method, path, status, duration)
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const timestamp = new Date().toISOString();
    // Do not log health checks in test environment
    if (config.NODE_ENV !== 'test') {
      console.log(`[${timestamp}] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
    }
  });
  next();
});

// Standardized Health Check
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    return res.status(200).json({
      success: true,
      data: { status: 'ok', database: 'connected' },
      message: 'AI CLUB API is healthy',
    });
  } catch (error) {
    return res.status(503).json({
      success: false,
      data: { status: 'error', database: 'disconnected' },
      error: {
        code: 'SERVICE_UNAVAILABLE',
        message: 'Database connection failed',
        details: {},
      },
    });
  }
});

// Routes
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
app.use('/api', publicRoutes);

// 404 handling middleware
app.use(notFoundHandler);

// Error handling middleware
app.use(errorHandler);

export default app;
