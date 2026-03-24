import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env.local file
const envPath = path.resolve(__dirname, '../.env.local');
console.log(`📁 Loading environment from: ${envPath}`);
dotenv.config({ path: envPath });

// Log JWT_SECRET for debugging
const jwtSecret = process.env.JWT_SECRET || 'your_jwt_secret_here';
console.log(`🔑 JWT_SECRET loaded: ${jwtSecret.substring(0, 20)}... (length: ${jwtSecret.length})`);

import app from './app.js';
import { connectDatabase } from './config/database.js';

/**
 * Server Entry Point
 * 
 * Starts the Express server and listens on the configured port.
 * Connects to MongoDB database on startup.
 */

const PORT = process.env.PORT || 5001;

/**
 * Initialize server
 * Connect to database, then start listening
 */
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDatabase();

    // Start Express server
    app.listen(PORT, () => {
      console.log(`\n🚀 Vi-Notes Backend Server`);
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`✓ Server running on http://localhost:${PORT}`);
      console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`✓ Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
      console.log(`✓ Database: Connected to MongoDB`);
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\nSIGINT received, shutting down gracefully...');
  process.exit(0);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\nSIGINT received, shutting down gracefully...');
  process.exit(0);
});
