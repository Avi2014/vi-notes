import { useCallback, useRef, useEffect } from 'react';
import { KeystrokeEventData, submitKeystrokeEvents } from '../services/keystrokeService';

/**
 * Keystroke Tracking Hook
 * 
 * Captures keystroke events with timing information (not key content)
 * Buffers events and submits in batches to reduce API calls
 * 
 * Privacy-first: Only keyCode and timing are captured, never character content
 */

const BATCH_SIZE = 50; // Submit after 50 events
const BATCH_TIMEOUT = 10000; // Or after 10 seconds

export const useKeystrokeTracking = (sessionId?: string) => {
  const eventsBuffer = useRef<KeystrokeEventData[]>([]);
  const lastKeystrokeRef = useRef<number>(Date.now());
  const batchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isEnabledRef = useRef(true);

  /**
   * Submit buffered keystroke events to backend
   */
  const submitBatch = useCallback(async () => {
    if (eventsBuffer.current.length === 0) return;

    // Check if user is authenticated - don't submit if no token
    const token = localStorage.getItem('authToken');
    if (!token) {
      eventsBuffer.current = []; // Clear buffer
      return;
    }

    const eventsCopy = [...eventsBuffer.current];
    eventsBuffer.current = [];

    try {
      await submitKeystrokeEvents(sessionId, eventsCopy);
    } catch (error) {
      console.error('Failed to submit keystroke events:', error);
      // Re-add events to buffer on failure (with limit to prevent overflow)
      if (eventsBuffer.current.length < 500) {
        eventsBuffer.current = [...eventsCopy, ...eventsBuffer.current].slice(0, 500);
      }
    }
  }, [sessionId]);

  /**
   * Schedule batch submission
   */
  const scheduleBatchSubmission = useCallback(() => {
    if (batchTimeoutRef.current) {
      clearTimeout(batchTimeoutRef.current);
    }

    batchTimeoutRef.current = setTimeout(() => {
      submitBatch();
    }, BATCH_TIMEOUT);
  }, [submitBatch]);

  /**
   * Handle keydown event
   */
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!isEnabledRef.current) return;

    const now = Date.now();
    const interKeystrokeInterval = now - lastKeystrokeRef.current;
    lastKeystrokeRef.current = now;

    // Record keystroke event (keyCode only, never character)
    const keystrokeEvent: KeystrokeEventData = {
      keyCode: event.keyCode,
      timestamp: now,
      interKeystrokeInterval,
      keyType: 'keydown'
    };

    eventsBuffer.current.push(keystrokeEvent);

    // Submit if buffer is full
    if (eventsBuffer.current.length >= BATCH_SIZE) {
      submitBatch();
    } else {
      scheduleBatchSubmission();
    }
  }, [submitBatch, scheduleBatchSubmission]);

  /**
   * Attach keystroke listener to element
   */
  const attachListener = useCallback((element: HTMLElement | null) => {
    if (!element) return;

    element.addEventListener('keydown', handleKeyDown);

    return () => {
      element.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  /**
   * Enable/disable keystroke tracking
   */
  const setEnabled = useCallback((enabled: boolean) => {
    isEnabledRef.current = enabled;

    if (!enabled && eventsBuffer.current.length > 0) {
      // Submit remaining events when disabling
      submitBatch();
    }
  }, [submitBatch]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (batchTimeoutRef.current) {
        clearTimeout(batchTimeoutRef.current);
      }
      // Submit any remaining events
      if (eventsBuffer.current.length > 0) {
        submitBatch();
      }
    };
  }, [submitBatch]);

  return {
    attachListener,
    setEnabled,
    submitBatch,
    getBufferSize: () => eventsBuffer.current.length
  };
};
