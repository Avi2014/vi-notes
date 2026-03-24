import { Router, Response } from 'express';
import Session from '../models/Session.js';
import KeystrokeEvent from '../models/KeystrokeEvent.js';
import PasteEvent from '../models/PasteEvent.js';
import { authMiddleware, AuthenticatedRequest } from '../middleware/authMiddleware.js';

/**
 * Session Management Routes
 * 
 * POST   /api/sessions              - Create new session (protected)
 * GET    /api/sessions              - List all sessions for user (protected)
 * GET    /api/sessions/:sessionId   - Get session details (protected)
 * PUT    /api/sessions/:sessionId   - Update session (protected)
 * DELETE /api/sessions/:sessionId   - Delete session (protected)
 * GET    /api/sessions/:sessionId/stats - Get session statistics (protected)
 */

const router = Router();

/**
 * POST /api/sessions
 * 
 * Create a new writing session
 * 
 * Request body:
 * {
 *   "sessionId": "session-123456-abc",
 *   "title": "My First Article",
 *   "description": "An interesting piece about technology",
 *   "content": "Lorem ipsum dolor sit amet...",
 *   "pasteCount": 3,
 *   "keystrokeCount": 2500
 * }
 */
router.post(
  '/',
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { sessionId, title, description, content, pasteCount, keystrokeCount } = req.body;
      const userId = req.user?.userId;

      // Validation
      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
        return;
      }

      if (!sessionId || !title || content === undefined) {
        res.status(400).json({
          success: false,
          error: 'sessionId, title, and content are required'
        });
        return;
      }

      if (title.length > 200) {
        res.status(400).json({
          success: false,
          error: 'Title must be 200 characters or less'
        });
        return;
      }

      // Calculate statistics
      const trimmedContent = content.trim();
      const characterCount = trimmedContent.length;
      const wordCount = trimmedContent
        .split(/\s+/)
        .filter((word: string) => word.length > 0).length;

      // Create session
      const newSession = new Session({
        userId,
        sessionId,
        title,
        description: description || '',
        content,
        wordCount,
        characterCount,
        pasteCount: pasteCount || 0,
        keystrokeCount: keystrokeCount || 0,
        startedAt: new Date(),
        endedAt: new Date()
      });

      await newSession.save();

      res.status(201).json({
        success: true,
        data: {
          id: newSession._id,
          sessionId: newSession.sessionId,
          title: newSession.title,
          wordCount: newSession.wordCount,
          characterCount: newSession.characterCount,
          createdAt: newSession.createdAt
        },
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      console.error('Session creation error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to create session'
      });
    }
  }
);

/**
 * GET /api/sessions
 * 
 * Get all sessions for authenticated user
 * 
 * Query parameters:
 * - skip: Number of sessions to skip (for pagination)
 * - limit: Maximum sessions to return (default: 20, max: 100)
 * - search: Search in session title or description
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "sessions": [
 *       {
 *         "id": "...",
 *         "sessionId": "session-123",
 *         "title": "My Article",
 *         "description": "...",
 *         "wordCount": 1250,
 *         "characterCount": 7500,
 *         "pasteCount": 2,
 *         "keystrokeCount": 2500,
 *         "createdAt": "2026-03-24T12:00:00Z"
 *       }
 *     ],
 *     "total": 42,
 *     "skip": 0,
 *     "limit": 20
 *   }
 * }
 */
router.get(
  '/',
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      const skip = Math.max(0, parseInt(req.query.skip as string) || 0);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
      const search = (req.query.search as string) || '';

      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
        return;
      }

      // Build query
      const query: any = { userId };
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }

      // Get total count
      const total = await Session.countDocuments(query);

      // Get sessions
      const sessions = await Session.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('sessionId title description wordCount characterCount pasteCount keystrokeCount createdAt');

      res.json({
        success: true,
        data: {
          sessions: sessions.map((session) => ({
            id: session._id,
            sessionId: session.sessionId,
            title: session.title,
            description: session.description,
            wordCount: session.wordCount,
            characterCount: session.characterCount,
            pasteCount: session.pasteCount,
            keystrokeCount: session.keystrokeCount,
            createdAt: session.createdAt
          })),
          total,
          skip,
          limit
        },
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      console.error('Failed to fetch sessions:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch sessions'
      });
    }
  }
);

/**
 * GET /api/sessions/:sessionId
 * 
 * Get detailed information about a specific session
 */
router.get(
  '/:sessionId',
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      const { sessionId } = req.params;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
        return;
      }

      const session = await Session.findOne({ sessionId, userId });

      if (!session) {
        res.status(404).json({
          success: false,
          error: 'Session not found'
        });
        return;
      }

      res.json({
        success: true,
        data: {
          id: session._id,
          sessionId: session.sessionId,
          title: session.title,
          description: session.description,
          content: session.content,
          wordCount: session.wordCount,
          characterCount: session.characterCount,
          pasteCount: session.pasteCount,
          keystrokeCount: session.keystrokeCount,
          startedAt: session.startedAt,
          endedAt: session.endedAt,
          createdAt: session.createdAt
        },
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      console.error('Session fetch error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch session'
      });
    }
  }
);

/**
 * PUT /api/sessions/:sessionId
 * 
 * Update a session (title, description, content)
 */
router.put(
  '/:sessionId',
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      const { sessionId } = req.params;
      const { title, description, content } = req.body;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
        return;
      }

      const session = await Session.findOne({ sessionId, userId });

      if (!session) {
        res.status(404).json({
          success: false,
          error: 'Session not found'
        });
        return;
      }

      // Update fields
      if (title !== undefined) {
        if (title.length > 200) {
          res.status(400).json({
            success: false,
            error: 'Title must be 200 characters or less'
          });
          return;
        }
        session.title = title;
      }

      if (description !== undefined) {
        session.description = description;
      }

      if (content !== undefined) {
        session.content = content;
        // Recalculate statistics
        const trimmed = content.trim();
        session.characterCount = trimmed.length;
        session.wordCount = trimmed
          .split(/\s+/)
          .filter((word: string) => word.length > 0).length;
      }

      await session.save();

      res.json({
        success: true,
        data: {
          id: session._id,
          sessionId: session.sessionId,
          title: session.title,
          wordCount: session.wordCount,
          characterCount: session.characterCount
        },
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      console.error('Session update error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update session'
      });
    }
  }
);

/**
 * DELETE /api/sessions/:sessionId
 * 
 * Delete a session and cascade delete related keystroke/paste events
 */
router.delete(
  '/:sessionId',
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      const { sessionId } = req.params;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
        return;
      }

      const session = await Session.findOne({ sessionId, userId });

      if (!session) {
        res.status(404).json({
          success: false,
          error: 'Session not found'
        });
        return;
      }

      // Delete cascade - remove related events
      await KeystrokeEvent.deleteMany({ sessionId });
      await PasteEvent.deleteMany({ sessionId });

      // Delete session
      await Session.deleteOne({ _id: session._id });

      res.json({
        success: true,
        data: {
          message: 'Session deleted successfully',
          sessionId: sessionId
        },
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      console.error('Session deletion error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete session'
      });
    }
  }
);

/**
 * GET /api/sessions/:sessionId/stats
 * 
 * Get detailed statistics for a session including keystroke/paste breakdown
 */
router.get(
  '/:sessionId/stats',
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      const { sessionId } = req.params;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
        return;
      }

      const session = await Session.findOne({ sessionId, userId });

      if (!session) {
        res.status(404).json({
          success: false,
          error: 'Session not found'
        });
        return;
      }

      // Get keystroke events for this session
      const keystrokeEvents = await KeystrokeEvent.find({ sessionId, userId });
      const pasteEvents = await PasteEvent.find({ sessionId, userId });

      // Calculate keystroke statistics
      const interKeystrokeIntervals = keystrokeEvents
        .filter((e) => e.interKeystrokeInterval > 0)
        .map((e) => e.interKeystrokeInterval);
      const avgInterKeystrokeInterval =
        interKeystrokeIntervals.length > 0
          ? Math.round(
              interKeystrokeIntervals.reduce((a, b) => a + b, 0) /
                interKeystrokeIntervals.length
            )
          : 0;

      // Calculate paste statistics
      const totalPastedChars = pasteEvents.reduce((sum, e) => sum + e.pastedLength, 0);
      const avgPasteLength =
        pasteEvents.length > 0 ? Math.round(totalPastedChars / pasteEvents.length) : 0;

      res.json({
        success: true,
        data: {
          sessionId: session.sessionId,
          title: session.title,
          content: {
            wordCount: session.wordCount,
            characterCount: session.characterCount,
            duration:
              session.endedAt && session.startedAt
                ? Math.floor((session.endedAt.getTime() - session.startedAt.getTime()) / 1000) + 's'
                : 'N/A'
          },
          keystrokes: {
            total: keystrokeEvents.length,
            avgInterval: avgInterKeystrokeInterval + 'ms',
            eventCount: keystrokeEvents.length
          },
          pastes: {
            total: pasteEvents.length,
            totalChars: totalPastedChars,
            avgLength: avgPasteLength,
            multilineCount: pasteEvents.filter((e) => e.isMultiline).length
          }
        },
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      console.error('Session stats error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch session statistics'
      });
    }
  }
);

export default router;
