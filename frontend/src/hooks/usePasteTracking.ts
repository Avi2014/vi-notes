import { useCallback, useRef, useEffect } from 'react';
import { PasteEventData, submitPasteEvents } from '../services/pasteService';

/**
 * Paste Tracking Hook
 * 
 * Captures paste events and their metadata (length, multiline status)
 * Buffers events and submits in batches to reduce API calls
 * 
 * Privacy-first: Only metadata is captured, never the pasted content
 */

const BATCH_SIZE = 20; // Submit after 20 paste events
const BATCH_TIMEOUT = 10000; // Or after 10 seconds

export const usePasteTracking = (sessionId?: string) => {
  const eventsBuffer = useRef<PasteEventData[]>([]);
  const batchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isEnabledRef = useRef(true);

  /**
   * Submit buffered paste events to backend
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
      await submitPasteEvents(sessionId, eventsCopy);
    } catch (error) {
      console.error('Failed to submit paste events:', error);
      // Re-add events to buffer on failure (with limit to prevent overflow)
      if (eventsBuffer.current.length < 200) {
        eventsBuffer.current = [...eventsCopy, ...eventsBuffer.current].slice(0, 200);
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
   * Handle paste event
   */
  const handlePaste = useCallback((event: ClipboardEvent) => {
    if (!isEnabledRef.current) return;

    const pastedText = event.clipboardData?.getData('text') || '';

    if (pastedText.length === 0) return;

    // Create paste event
    const pasteEvent: PasteEventData = {
      pastedLength: pastedText.length,
      isMultiline: pastedText.includes('\n'),
      timestamp: Date.now()
    };

    // Add to buffer
    eventsBuffer.current.push(pasteEvent);

    // Check if we should submit
    if (eventsBuffer.current.length >= BATCH_SIZE) {
      submitBatch();
    } else {
      scheduleBatchSubmission();
    }
  }, [submitBatch, scheduleBatchSubmission]);

  /**
   * Attach paste listener to an element
   */
  const attachListener = useCallback((element: HTMLElement | null) => {
    if (!element) return;

    element.addEventListener('paste', handlePaste as EventListener);

    // Cleanup function
    return () => {
      element.removeEventListener('paste', handlePaste as EventListener);
    };
  }, [handlePaste]);

  /**
   * Enable/disable paste tracking
   */
  const setEnabled = useCallback((enabled: boolean) => {
    isEnabledRef.current = enabled;
  }, []);

  /**
   * Get current buffer size
   */
  const getBufferSize = useCallback(() => {
    return eventsBuffer.current.length;
  }, []);

  /**
   * Cleanup on unmount - submit remaining events
   */
  useEffect(() => {
    return () => {
      if (batchTimeoutRef.current) {
        clearTimeout(batchTimeoutRef.current);
      }

      // Submit remaining events
      if (eventsBuffer.current.length > 0) {
        submitBatch();
      }
    };
  }, [submitBatch]);

  return {
    attachListener,
    submitBatch,
    setEnabled,
    getBufferSize
  };
};
