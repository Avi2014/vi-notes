import { Router } from 'express';
import {
  register,
  login,
  getCurrentUser
} from '../controllers/authController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

/**
 * Authentication Routes
 * 
 * POST /auth/register - Register a new user
 * POST /auth/login - Login with email and password
 * GET /auth/me - Get current user (requires authentication)
 */

const router = Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes (require valid JWT)
router.get('/me', authMiddleware, getCurrentUser);

export default router;
