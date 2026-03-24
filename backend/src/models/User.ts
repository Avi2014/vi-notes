import mongoose, { Schema, Document } from 'mongoose';
import bcryptjs from 'bcryptjs';

/**
 * User Document Interface
 * Defines the shape of a user in the database
 */
export interface IUser extends Document {
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
  // Method to verify password
  comparePassword(password: string): Promise<boolean>;
}

/**
 * User Schema
 * Defines the structure of user documents in MongoDB
 */
const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email'
      ]
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false // Don't return passwordHash by default in queries
    }
  },
  { timestamps: true }
);

/**
 * Pre-save middleware: Hash password before saving if modified
 */
userSchema.pre('save', async function (next) {
  // Only hash if password is new or has been modified
  if (!this.isModified('passwordHash')) {
    return next();
  }

  try {
    // Generate salt and hash password (10 rounds)
    const salt = await bcryptjs.genSalt(10);
    this.passwordHash = await bcryptjs.hash(this.passwordHash, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

/**
 * Instance method: Compare password for login
 * @param password - Plain text password to compare
 * @returns Promise<boolean> - True if password matches
 */
userSchema.methods.comparePassword = async function (
  password: string
): Promise<boolean> {
  return await bcryptjs.compare(password, this.passwordHash);
};

/**
 * User Model
 * Represents a user in the Vi-Notes system
 */
const User = mongoose.model<IUser>('User', userSchema);

export default User;
