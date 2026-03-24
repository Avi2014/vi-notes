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
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your_jwt_secret_here'
    ) as JWTPayload;

    // Attach user info to request
    req.user = {
      userId: decoded.userId,
      email: decoded.email
    };

    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      res.status(401).json({
        success: false,
        error: 'Token expired',
        timestamp: new Date().toISOString()
      });
      return;
    }

    if (error.name === 'JsonWebTokenError') {
      res.status(401).json({
        success: false,
        error: 'Invalid token',
        timestamp: new Date().toISOString()
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: 'Authentication error',
      timestamp: new Date().toISOString()
    });
  }
};
