import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

/**
 * Extended Express Request with user object
 * Populated by authMiddleware after JWT verification
 */
export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

/**
 * JWT Payload Interface
 */
interface JWTPayload {
  userId: string;
  email: string;
}

/**
 * Authentication Middleware
 * 
 * Verifies JWT token from Authorization header
 * Attaches user info to request object if valid
 * 
 * Usage: app.use(authMiddleware) or app.get('/protected', authMiddleware, handler)
 * 
 * Header format: Authorization: Bearer <token>
 */
export const authMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.warn(`❌ Auth Middleware - Invalid or missing Authorization header`);
      res.status(401).json({
        success: false,
        error: 'No token provided or invalid format',
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Extract token (remove 'Bearer ' prefix)
    const token = authHeader.slice(7);

    // Verify token with JWT secret
    const jwtSecret = process.env.JWT_SECRET || 'your_jwt_secret_here';
    
    const decoded = jwt.verify(
      token,
      jwtSecret
    ) as JWTPayload;

    // Attach user info to request
    req.user = {
      userId: decoded.userId,
      email: decoded.email
    };

    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      console.warn(`❌ Auth Middleware - Token expired`);
      res.status(401).json({
        success: false,
        error: 'Token expired',
        timestamp: new Date().toISOString()
      });
      return;
    }

    if (error.name === 'JsonWebTokenError') {
      console.warn(`❌ Auth Middleware - Invalid token: ${error.message}`);
      res.status(401).json({
        success: false,
        error: 'Invalid token',
        timestamp: new Date().toISOString()
      });
      return;
    }

    console.error(`❌ Auth Middleware - Unexpected error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Authentication error',
      timestamp: new Date().toISOString()
    });
  }
};
