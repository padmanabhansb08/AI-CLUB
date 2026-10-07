import app from './app';
import { config } from './config';
import { pool } from './db';

const PORT = config.PORT;

const server = app.listen(PORT, () => {
  console.log(`AI CLUB API Server running on port ${PORT} [NODE_ENV=${config.NODE_ENV}]`);
});

let isShuttingDown = false;

const gracefulShutdown = (signal: string) => {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log(`[Lifecycle] Received ${signal}. Initiating graceful shutdown...`);

  // Stop accepting new HTTP requests
  server.close(async () => {
    console.log('[Lifecycle] HTTP server stopped accepting connections. Active requests drained.');
    try {
      await pool.end();
      console.log('[Lifecycle] PostgreSQL connection pool terminated cleanly.');
      process.exit(0);
    } catch (err) {
      console.error('[Lifecycle] Error closing database connection pool:', err);
      process.exit(1);
    }
  });

  // Enforce a hard 10-second timeout to prevent lingering zombie processes
  setTimeout(() => {
    console.error('[Lifecycle] Graceful shutdown timed out after 10s. Forcing exit.');
    process.exit(1);
  }, 10000).unref();
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason: any) => {
  console.error('[Lifecycle] Unhandled Rejection at Promise:', reason);
});

process.on('uncaughtException', (error: Error) => {
  console.error('[Lifecycle] Uncaught Exception:', error);
  gracefulShutdown('uncaughtException');
});
