import { Router, Response } from "express";
import PasteEvent from "../models/PasteEvent";
import {
  authMiddleware,
  AuthenticatedRequest,
} from "../middleware/authMiddleware";

/**
 * Paste Event Routes
 *
 * POST /api/pastes - Submit batch of paste events (protected)
 * GET /api/pastes/stats - Get paste statistics (protected)
 */

const router = Router();

/**
 * POST /api/pastes
 *
 * Submit a batch of paste events
 * Protected route - requires JWT authentication
 *
 * Request body:
 * {
 *   "sessionId": "session-123456-abc",
 *   "events": [
 *     {
 *       "pastedLength": 150,
 *       "isMultiline": true,
 *       "timestamp": 1711270800000
 *     }
 *   ]
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "insertedCount": 1,
 *     "message": "Paste events submitted successfully"
 *   }
 * }
 */
router.post(
  "/",
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { sessionId, events } = req.body;
      const userId = req.user?.userId;

      // Validation
      if (!userId) {
        res.status(401).json({
          success: false,
          error: "User not authenticated",
          timestamp: new Date().toISOString(),
        });
        return;
      }

      if (!Array.isArray(events) || events.length === 0) {
        res.status(400).json({
          success: false,
          error: "Events array is required and must not be empty",
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Validate and transform events
      const validatedEvents = events
        .map((event: any) => {
          // Validate pastedLength
          if (
            typeof event.pastedLength !== "number" ||
            event.pastedLength < 1 ||
            event.pastedLength > 1000000
          ) {
            throw new Error(
              "Invalid pastedLength: must be between 1 and 1,000,000",
            );
          }

          // Validate isMultiline
          if (typeof event.isMultiline !== "boolean") {
            throw new Error("isMultiline must be a boolean");
          }

          // Validate timestamp
          if (typeof event.timestamp !== "number" || event.timestamp <= 0) {
            throw new Error("Invalid timestamp");
          }

          return {
            userId,
            sessionId,
            pastedLength: event.pastedLength,
            isMultiline: event.isMultiline,
            timestamp: event.timestamp,
          };
        })
        .filter((event) => event !== null);

      if (validatedEvents.length === 0) {
        res.status(400).json({
          success: false,
          error: "No valid events to submit",
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Insert events in batch
      const result = await PasteEvent.insertMany(validatedEvents);

      res.status(201).json({
        success: true,
        data: {
          insertedCount: result.length,
          message: `${result.length} paste events submitted successfully`,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error("Paste submission error:", error);
      res.status(400).json({
        success: false,
        error: error.message || "Failed to submit paste events",
        timestamp: new Date().toISOString(),
      });
    }
  },
);

/**
 * GET /api/pastes/stats
 *
 * Get paste statistics for the authenticated user
 * Protected route - requires JWT authentication
 *
 * Query parameters:
 * - days: Number of days to look back (default: 7)
 *
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "totalPasteCount": 25,
 *     "averagePasteLength": 245,
 *     "multilinePasteCount": 15,
 *     "pastesByDay": { "2026-03-24": 5, "2026-03-23": 3, ... },
 *     "dateRange": { "from": "2026-03-17", "to": "2026-03-24" }
 *   }
 * }
 */
router.get(
  "/stats",
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      const daysBack = Math.min(parseInt(req.query.days as string) || 7, 90); // Max 90 days

      if (!userId) {
        res.status(401).json({
          success: false,
          error: "User not authenticated",
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Calculate date range
      const endDate = new Date();
      const startDate = new Date(
        endDate.getTime() - daysBack * 24 * 60 * 60 * 1000,
      );

      // Get paste events for user in date range
      const events = await PasteEvent.find({
        userId,
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
      }).sort({ createdAt: 1 });

      // Calculate statistics
      const totalPasteCount = events.length;
      const totalLength = events.reduce((sum, e) => sum + e.pastedLength, 0);
      const averagePasteLength =
        totalPasteCount > 0 ? Math.round(totalLength / totalPasteCount) : 0;
      const multilinePasteCount = events.filter((e) => e.isMultiline).length;

      // Group by day
      const pastesByDay: Record<string, number> = {};
      events.forEach((event) => {
        const dateKey = event.createdAt.toISOString().split("T")[0];
        pastesByDay[dateKey] = (pastesByDay[dateKey] || 0) + 1;
      });

      res.status(200).json({
        success: true,
        data: {
          totalPasteCount,
          averagePasteLength,
          multilinePasteCount,
          pastesByDay,
          dateRange: {
            from: startDate.toISOString().split("T")[0],
            to: endDate.toISOString().split("T")[0],
          },
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error("Paste stats error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to retrieve paste statistics",
        timestamp: new Date().toISOString(),
      });
    }
  },
);

export default router;
