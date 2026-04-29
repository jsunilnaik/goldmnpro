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

// PRE-CONNECT: Initiate connection as soon as the module is loaded
// This reduces latency on the first request by starting the handshake early.
const MONGODB_URI = getEnv('MONGODB_URI');
if (MONGODB_URI && !cached.promise) {
  const opts = {
    bufferCommands: true,
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    connectTimeoutMS: 10000,
    waitQueueTimeoutMS: 5000,
    heartbeatFrequencyMS: 10000,
    retryWrites: true,
    retryReads: true,
  };
  cached.promise = mongoose.connect(MONGODB_URI, opts).then((m) => {
    cached.conn = m;
    return m;
  }).catch(err => {
    cached.promise = null;
    throw err;
  });
}

async function connectDB() {
  if (!MONGODB_URI) {
    throw new Error('Database connection failed: MONGODB_URI is missing');
  }

  if (cached.conn || mongoose.connection.readyState === 1) {
    return cached.conn || mongoose.connection;
  }

  if (cached.promise) {
    return await cached.promise;
  }

  // Fallback for cases where pre-connect didn't run
  // (e.g. if MONGODB_URI was somehow missing at load but present now)
  const opts = {
    bufferCommands: true,
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    connectTimeoutMS: 10000,
    waitQueueTimeoutMS: 5000,
    heartbeatFrequencyMS: 10000,
    retryWrites: true,
    retryReads: true,
  };

  cached.promise = mongoose.connect(MONGODB_URI, opts).then((m) => {
    cached.conn = m;
    return m;
  });

  return await cached.promise;
}

export default connectDB;