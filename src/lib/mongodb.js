import mongoose from 'mongoose';

/**
 * DATABASE CONNECTION MANAGER
 * 
 * This module handles database connectivity across different environments:
 * 1. Node.js (Development) - Uses global caching for HMR stability and DNS fixes for Atlas.
 * 2. Cloudflare Workers (Production) - Uses edge-compatible logic and optimized timeouts.
 */

// Global cache to prevent multiple connections during dev HMR and optimize worker warm starts
let cached = globalThis.mongoose;

if (!cached) {
  cached = globalThis.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI is missing!');
    throw new Error('MONGODB_URI_MISSING');
  }

  // 1. DNS FIX (Node.js environments only)
  // This resolves querySrv ECONNREFUSED issues on local networks
  if (typeof process !== 'undefined' && process.release?.name === 'node') {
    try {
      const dns = await import('dns');
      if (dns && typeof dns.setServers === 'function') {
        dns.setServers(['8.8.8.8', '8.8.4.4']);
      }
    } catch (e) {
      // dns module not available or failed (expected in some environments)
    }
  }

  // 2. CONNECTION CACHING
  if (cached.conn || mongoose.connection.readyState === 1) {
    if (!cached.conn) cached.conn = mongoose.connection;
    return cached.conn;
  }

  // 3. PENDING CONNECTION HANDLING
  if (cached.promise) {
    console.log('⌛ DB connection in progress, waiting...');
    try {
      cached.conn = await cached.promise;
      return cached.conn;
    } catch (e) {
      cached.promise = null; // Reset on failure
      throw e;
    }
  }

  // 4. NEW CONNECTION INITIATION
  const opts = {
    bufferCommands: true, // Allow Mongoose to buffer during the brief connection window
    maxPoolSize: 10,
    minPoolSize: 0,
    serverSelectionTimeoutMS: 15000,
    socketTimeoutMS: 45000,
    connectTimeoutMS: 15000,
    retryWrites: true, // Enabled for production stability
    retryReads: true,
  };

  console.log('🔌 Initiating new DB connection...');
  cached.promise = mongoose.connect(MONGODB_URI, opts)
    .then((m) => {
      console.log('✅ DB connection established');
      return m;
    })
    .catch((err) => {
      console.error('❌ DB connection failed:', err.message);
      cached.promise = null;
      throw err;
    });

  try {
    await cached.promise;
    cached.conn = mongoose.connection;
    
    // Safety check for serverless environments
    if (cached.conn.readyState !== 1) {
      console.warn('⚠️ DB connection resolved but readyState is', cached.conn.readyState);
    }
    
    return cached.conn;
  } catch (e) {
    cached.promise = null;
    throw e;
  }
}

export default connectDB;