import { Schema, model } from 'mongoose';

/**
 * Writing Session Schema
 * 
 * Stores information about user writing sessions including:
 * - Session metadata (title, description, dates)
 * - Associated keystroke and paste events
 * - Writing statistics (word count, character count, etc.)
 */

export interface ISession {
  userId: string; // Reference to User
  sessionId: string; // Unique session identifier
  title: string; // User-given session name
  description?: string; // Optional session notes
  content: string; // Final writing content
  wordCount: number; // Calculated on save
  characterCount: number; // Calculated on save
  pasteCount: number; // Number of pastes detected
  keystrokeCount: number; // Number of keystrokes recorded
  startedAt: Date; // When session started
  endedAt?: Date; // When session ended/saved
  createdAt: Date;
  updatedAt: Date;
}

const sessionSchema = new Schema<ISession>(
  {
    userId: {
      type: String,
      required: true,
      index: true
    },
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      minlength: 1,
      maxlength: 200
    },
    description: {
      type: String,
      maxlength: 1000,
      default: ''
    },
    content: {
      type: String,
      required: true,
      maxlength: 10000000 // 10MB
    },
    wordCount: {
      type: Number,
      required: true,
      default: 0,
      min: 0
    },
    characterCount: {
      type: Number,
      required: true,
      default: 0,
      min: 0
    },
    pasteCount: {
      type: Number,
      default: 0,
      min: 0
    },
    keystrokeCount: {
      type: Number,
      default: 0,
      min: 0
    },
    startedAt: {
      type: Date,
      required: true,
      default: Date.now
    },
    endedAt: {
      type: Date
    }
  },
  { timestamps: true }
);

// Index for efficient queries by user and date
sessionSchema.index({ userId: 1, createdAt: -1 });
sessionSchema.index({ userId: 1, startedAt: -1 });

export default model<ISession>('Session', sessionSchema);
