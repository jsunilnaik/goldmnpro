import mongoose from 'mongoose';

/**
 * PRODUCTION-READY DATABASE CONNECTION
 * Optimized for Cloudflare Workers & Next.js
 */

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ CRITICAL: MONGODB_URI is not defined in environment variables');
}

// Global cache for connection persistence
let cached = globalThis.mongoose;

if (!cached) {
  cached = globalThis.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (!MONGODB_URI) {
    throw new Error('Database connection failed: MONGODB_URI is missing');
  }

  // Use existing connection if available
  if (cached.conn || mongoose.connection.readyState === 1) {
    if (!cached.conn) cached.conn = mongoose.connection;
    return cached.conn;
  }

  // If a connection is already being established, wait for it
  if (cached.promise) {
    try {
      cached.conn = await cached.promise;
      return cached.conn;
    } catch (e) {
      cached.promise = null;
      throw e;
    }
  }

  // Connection options optimized for Serverless/Edge
  const opts = {
    bufferCommands: true,
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 30000, // Increased to 30s for cold starts
    socketTimeoutMS: 45000,
    connectTimeoutMS: 30000,
    heartbeatFrequencyMS: 10000,
    retryWrites: true,
    retryReads: true,
  };

  console.log('🔌 Connecting to MongoDB Atlas...');
  cached.promise = mongoose.connect(MONGODB_URI, opts)
    .then((m) => {
      console.log('✅ MongoDB Connected Successfully');
      return m;
    })
    .catch((err) => {
      console.error('❌ MongoDB Connection Error:', err.message);
      cached.promise = null;
      throw err;
    });

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (e) {
    cached.promise = null;
    throw e;
  }
}

export default connectDB;