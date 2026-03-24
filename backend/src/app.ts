import express, { Express } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes.js';
import keystrokeRoutes from './routes/keystroke.routes.js';

dotenv.config();

/**
 * Express Application Setup
 * 
 * Initializes the Vi-Notes backend server with:
 * - CORS enabled for frontend communication
 * - JSON body parsing
 * - Authentication routes
 * - Error handling middleware
 */

const app: Express = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

/**
 * Routes
 */

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    message: 'Vi-Notes backend is running',
    timestamp: new Date().toISOString()
  });
});

// Authentication routes
// POST   /api/auth/register - Register new user
// POST   /api/auth/login    - Login user
// GET    /api/auth/me       - Get current user (protected)
app.use('/api/auth', authRoutes);

// Keystroke tracking routes
// POST   /api/keystrokes         - Submit keystroke events (protected)
// GET    /api/keystrokes/stats   - Get keystroke statistics (protected)
app.use('/api/keystrokes', keystrokeRoutes);

/**
 * Error handling middleware
 */
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error',
    timestamp: new Date().toISOString()
  });
});

/**
 * 404 Handler
 */
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    timestamp: new Date().toISOString()
  });
});

export default app;
