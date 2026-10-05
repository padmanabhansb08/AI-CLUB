import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

import authRoutes from './routes/authRoutes';
import adminRoutes from './routes/adminRoutes';
import studentRoutes from './routes/studentRoutes';
import publicRoutes from './routes/publicRoutes';
import { router as announcementRoutes } from './routes/announcementRoutes';
import { router as directoryRoutes } from './routes/directoryRoutes';
import { pool } from './db';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

import { config } from './config';

const app = express();

// Security Middleware
app.use(helmet());
app.use(cors({ origin: config.CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: '1mb' }));

// Health Check
app.get('/api/health', async (req, res) => {
  try {
    // Test DB connection
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    console.error('Database connection failed:', error);
    res.status(503).json({ status: 'error', database: 'disconnected' });
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/me', studentRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/members', directoryRoutes);
app.use('/api', publicRoutes);

// 404 handling middleware
app.use(notFoundHandler);

// Error handling middleware
app.use(errorHandler);

export default app;
