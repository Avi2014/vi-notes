import { Schema, model } from 'mongoose';

/**
 * Paste Event Schema
 * 
 * Stores anonymized paste event data for authenticity verification.
 * Captures metadata about pasted content without storing the content itself.
 */

export interface IPasteEvent {
  userId: string;
  sessionId?: string;
  pastedLength: number; // Length of pasted text (characters)
  timestamp: number; // Unix timestamp (ms)
  isMultiline: boolean; // Whether paste contains newlines
  createdAt: Date;
}

const pasteEventSchema = new Schema<IPasteEvent>(
  {
    userId: {
      type: String,
      required: true,
      index: true
    },
    sessionId: {
      type: String,
      index: true
    },
    pastedLength: {
      type: Number,
      required: true,
      min: 1,
      max: 1000000 // 1MB max paste
    },
    isMultiline: {
      type: Boolean,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expire: 2592000 // 30 days in seconds (TTL index)
    }
  },
  { timestamps: false }
);

// Compound index for efficient queries
pasteEventSchema.index({ userId: 1, createdAt: -1 });

const PasteEvent = model<IPasteEvent>('PasteEvent', pasteEventSchema);

export default PasteEvent;
