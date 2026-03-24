import { Router, Response } from 'express';
import KeystrokeEvent from '../models/KeystrokeEvent.js';
import { authMiddleware, AuthenticatedRequest } from '../middleware/authMiddleware.js';

/**
 * Keystroke Routes
 * 
 * POST /api/keystrokes - Submit batch of keystroke events (protected)
 * GET /api/keystrokes/stats - Get keystroke statistics (protected)
 */

const router = Router();

/**
 * POST /api/keystrokes
 * 
 * Submit a batch of keystroke events
 * Protected route - requires JWT authentication
 * 
 * Request body:
 * {
 *   "sessionId": "session-uuid",
 *   "events": [
 *     {
 *       "keyCode": 65,
 *       "timestamp": 1704067200000,
 *       "interKeystrokeInterval": 125,
 *       "keyType": "keydown"
 *     },
 *     ...
 *   ]
 * }
 */
router.post('/', authMiddleware, async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { sessionId, events } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
      return;
    }

    if (!events || !Array.isArray(events) || events.length === 0) {
      res.status(400).json({
        success: false,
        error: 'Events array is required and must not be empty'
      });
      return;
    }

    // Validate events
    const validEvents = events.filter((event) => {
      return (
        typeof event.keyCode === 'number' &&
        typeof event.timestamp === 'number' &&
        typeof event.interKeystrokeInterval === 'number' &&
        (event.keyType === 'keydown' || event.keyType === 'keyup') &&
        event.keyCode >= 0 &&
        event.keyCode <= 255 &&
        event.interKeystrokeInterval >= 0 &&
        event.interKeystrokeInterval <= 60000
      );
    });

    if (validEvents.length === 0) {
      res.status(400).json({
        success: false,
        error: 'No valid keystroke events provided'
      });
      return;
    }

    // Create documents with userId
    const keystrokeDocuments = validEvents.map((event) => ({
      ...event,
      userId,
      sessionId: sessionId || undefined
    }));

    // Insert all events
    const savedEvents = await KeystrokeEvent.insertMany(keystrokeDocuments);

    res.status(201).json({
      success: true,
      data: {
        message: `${savedEvents.length} keystroke events recorded`,
        count: savedEvents.length,
        sessionId: sessionId || undefined
      }
    });
  } catch (error: any) {
    console.error('Error recording keystroke events:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to record keystroke events'
    });
  }
});

/**
 * GET /api/keystrokes/stats
 * 
 * Get keystroke statistics for current user
 * Protected route - requires JWT authentication
 */
router.get('/stats', authMiddleware, async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
      return;
    }

    // Get statistics
    const totalEvents = await KeystrokeEvent.countDocuments({ userId });
    const lastEvent = await KeystrokeEvent.findOne({ userId })
      .sort({ createdAt: -1 });

    // Calculate average inter-keystroke interval
    const events = await KeystrokeEvent.find({ userId }).select('interKeystrokeInterval');
    const avgInterval = events.length > 0
      ? events.reduce((sum, e) => sum + e.interKeystrokeInterval, 0) / events.length
      : 0;

    res.status(200).json({
      success: true,
      data: {
        totalEvents,
        averageInterKeystrokeInterval: Math.round(avgInterval),
        lastEventTime: lastEvent?.createdAt || null
      }
    });
  } catch (error: any) {
    console.error('Error retrieving keystroke stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve keystroke statistics'
    });
  }
});

export default router;
