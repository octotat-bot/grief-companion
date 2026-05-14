// db.js — MongoDB Atlas compatible connection
// Replaces the local MongoDB connection configuration.
//
// Key differences from local MongoDB:
// 1. serverSelectionTimeoutMS is 10000 (was 5000) — Atlas needs more time on first connect
// 2. Added socketTimeoutMS — prevents hanging on slow network
// 3. Connection string comes from MONGODB_URI env var — never hardcoded
// 4. Detailed connection event logging so you can see Atlas connect in terminal

require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('FATAL: MONGODB_URI is not set in environment variables.');
  console.error('Add it to backend/.env — see .env.example for the format.');
  process.exit(1); // Hard stop — app cannot run without a database URI
}

// Log which database we are connecting to (mask password for security)
const maskedURI = MONGODB_URI.replace(/:([^@]+)@/, ':****@');
console.log('Connecting to MongoDB:', maskedURI);

let isConnected = false;

async function connectDB() {
  if (isConnected) return;

  try {
    const conn = await mongoose.connect(MONGODB_URI, {
      // Atlas-specific options
      serverSelectionTimeoutMS: 10000,  // Wait up to 10s to find a server
      socketTimeoutMS:          45000,  // Close sockets after 45s of inactivity
      maxPoolSize:              10,      // Max 10 concurrent connections
      retryWrites:              true,    // Automatically retry failed writes
    });

    isConnected = true;

    console.log('✓ MongoDB Atlas connected');
    console.log('  Host:', conn.connection.host);
    console.log('  Database:', conn.connection.name);

  } catch (err) {
    console.error('✗ MongoDB Atlas connection failed:', err.message);
    console.error('');
    console.error('Common causes:');
    console.error('  1. Wrong username or password in connection string');
    console.error('  2. IP address not whitelisted in Atlas Network Access');
    console.error('  3. Cluster name is incorrect');
    console.error('  4. No internet connection');
    console.error('');
    console.error('Fix: Go to MongoDB Atlas → Network Access → Add your current IP');
    console.error('  Or add 0.0.0.0/0 to allow all IPs (fine for development)');

    // Do NOT crash the app — generation still works without MongoDB
    // Only history/save features will be unavailable
    console.warn('App starting in degraded mode — history features disabled.');
  }

  // ── Connection event listeners ──
  mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB Atlas disconnected. Attempting to reconnect...');
    isConnected = false;
  });

  mongoose.connection.on('reconnected', () => {
    console.log('✓ MongoDB Atlas reconnected.');
    isConnected = true;
  });

  mongoose.connection.on('error', (err) => {
    console.error('MongoDB Atlas error:', err.message);
    isConnected = false;
  });
}

function getConnectionStatus() {
  return isConnected && mongoose.connection.readyState === 1;
}

module.exports = { connectDB, getConnectionStatus };
