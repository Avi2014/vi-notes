import { Response } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import User from '../models/User.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';

/**
 * Auth Controller
 * 
 * Handles user registration, login, and authentication operations
 */

/**
 * Get JWT Secret (lazy evaluation - read from env when needed)
 */
const getJWTSecret = (): string => {
  const secret = process.env.JWT_SECRET || 'your_jwt_secret_here';
  if (!process.env.JWT_SECRET) {
    console.warn(`⚠️ JWT_SECRET not set in environment! Using default.`);
  }
  return secret;
};

const JWT_EXPIRE: string = (process.env.JWT_EXPIRE || '7d') as string;

/**
 * Generate JWT Token
 * @param userId - MongoDB user ID
 * @param email - User email
 * @returns JWT token string
 */
const generateToken = (userId: string, email: string): string => {
  const tokenPayload = { userId, email };
  const tokenOptions: SignOptions = { expiresIn: JWT_EXPIRE as any };
  const secret = getJWTSecret();
  
  return jwt.sign(
    tokenPayload,
    secret,
    tokenOptions
  );
};

/**
 * User Registration
 * 
 * POST /auth/register
 * 
 * Request body:
 * {
 *   "email": "user@example.com",
 *   "password": "securePassword123"
 * }
 */
export const register = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      res.status(400).json({
        success: false,
        error: 'Email and password are required',
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Validate email format
    if (!email.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)) {
      res.status(400).json({
        success: false,
        error: 'Invalid email format',
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Validate password length
    if (password.length < 6) {
      res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters',
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      res.status(409).json({
        success: false,
        error: 'Email already registered',
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Create new user
    const newUser = new User({
      email: email.toLowerCase(),
      passwordHash: password
    });

    // Save user (password will be hashed by pre-save middleware)
    await newUser.save();

    // Generate token
    const token = generateToken(newUser._id.toString(), newUser.email);

    // Return success response
    res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: newUser._id,
          email: newUser.email
        }
      },
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Registration failed',
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * User Login
 * 
 * POST /auth/login
 * 
 * Request body:
 * {
 *   "email": "user@example.com",
 *   "password": "securePassword123"
 * }
 */
export const login = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      res.status(400).json({
        success: false,
        error: 'Email and password are required',
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Find user by email and select passwordHash (it's hidden by default)
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      '+passwordHash'
    );

    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Invalid email or password',
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Compare password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        error: 'Invalid email or password',
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Generate token
    const token = generateToken(user._id.toString(), user.email);

    // Return success response
    res.status(200).json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          email: user.email
        }
      },
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Login failed',
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Get Current User
 * 
 * GET /auth/me
 * Requires: Valid JWT token in Authorization header
 */
export const getCurrentUser = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Not authenticated',
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Fetch fresh user data from database
    const user = await User.findById(req.user.userId);

    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found',
        timestamp: new Date().toISOString()
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          createdAt: user.createdAt
        }
      },
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get user',
      timestamp: new Date().toISOString()
    });
  }
};
