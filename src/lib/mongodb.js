import mongoose from 'mongoose';

/**
 * PRODUCTION-READY DATABASE CONNECTION
 * Optimized for Cloudflare Workers & Next.js
 */

// Safe retrieval of environment variables
const getEnv = (key) => {
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key];
  }
  return undefined;
};

// DNS FIX for Atlas SRV records (Node.js environments only)
if (typeof process !== 'undefined' && process.versions?.node) {
  try {
    // Dynamic import to avoid bundler issues in Edge
    import('dns').then(dns => {
      if (dns && typeof dns.setServers === 'function') {
        dns.setServers(['8.8.8.8', '8.8.4.4']);
      }
    }).catch(() => {});
  } catch (e) {
    // Ignore errors in non-node environments
  }
}

// Global cache for connection persistence using a safe globalThis reference
if (!globalThis.mongoose) {
  globalThis.mongoose = { conn: null, promise: null };
}
let cached = globalThis.mongoose;

async function connectDB() {
  const MONGODB_URI = getEnv('MONGODB_URI');

  if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI is missing from process.env');
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
    serverSelectionTimeoutMS: 10000, // Reduced to 10s to prevent Cloudflare from killing the worker
    socketTimeoutMS: 45000,
    connectTimeoutMS: 10000,
    waitQueueTimeoutMS: 5000,
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