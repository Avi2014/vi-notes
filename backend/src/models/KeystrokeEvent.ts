import { Schema, model } from 'mongoose';

/**
 * Keystroke Event Schema
 * 
 * Stores anonymized keystroke data for authenticity verification.
 * Only captures timing and key codes, NEVER character content.
 */

export interface IKeystrokeEvent {
  userId: string;
  sessionId?: string;
  keyCode: number; // ASCII key code (not character)
  timestamp: number; // Unix timestamp (ms)
  interKeystrokeInterval: number; // Time since last keystroke (ms)
  keyType: 'keydown' | 'keyup';
  createdAt: Date;
}

const keystrokeEventSchema = new Schema<IKeystrokeEvent>(
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
    keyCode: {
      type: Number,
      required: true,
      min: 0,
      max: 255
    },
    timestamp: {
      type: Number,
      required: true
    },
    interKeystrokeInterval: {
      type: Number,
      required: true,
      min: 0,
      max: 60000 // Max 60 seconds between keystrokes
    },
    keyType: {
      type: String,
      enum: ['keydown', 'keyup'],
      required: true
    },
    createdAt: {
      type: Date,
      default: () => new Date(),
      expires: 2592000 // Auto-delete after 30 days
    }
  },
  { timestamps: false }
);

// Index for efficient queries
keystrokeEventSchema.index({ userId: 1, createdAt: -1 });
keystrokeEventSchema.index({ sessionId: 1, createdAt: -1 });

const KeystrokeEvent = model<IKeystrokeEvent>('KeystrokeEvent', keystrokeEventSchema);

export default KeystrokeEvent;
