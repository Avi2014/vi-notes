import express, { Express } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Express Application Setup
 * 
 * Initializes the Vi-Notes backend server with:
 * - CORS enabled for frontend communication
 * - JSON/URL-encoded body parsing
 * - Basic middleware setup
 * 
 * Additional routes will be added in subsequent features:
 * - Feature #2: Authentication routes
 * - Feature #3: Keystroke tracking routes
 * - Feature #4: Paste detection routes
 * - Feature #5: Session persistence routes
 */

const app: Express = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Vi-Notes backend is running',
    timestamp: new Date().toISOString()
  });
});

// Basic API response middleware for consistency
app.use((req, res, next) => {
  // Add response wrapper if needed
  next();
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error',
    timestamp: new Date().toISOString()
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    timestamp: new Date().toISOString()
  });
});

export default app;
