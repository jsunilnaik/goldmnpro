import mongoose from "mongoose";

// Use globalThis to maintain a cached connection across hot reloads and edge invocations
let cached = globalThis.mongoose;

if (!cached) {
  cached = globalThis.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    throw new Error("Please define the MONGODB_URI environment variable");
  }

  // DNS FIX for Atlas SRV records (Node.js environments only)
  if (typeof process !== "undefined" && process.versions?.node && process.env.USE_GOOGLE_DNS === 'true') {
    try {
      const dns = await import("dns");
      if (dns && typeof dns.setServers === "function") {
        console.log("[MongoDB] Forcing Google DNS (8.8.8.8)...");
        dns.setServers(["8.8.8.8", "8.8.4.4"]);
      }
    } catch (e) {
      console.warn("[MongoDB] Failed to set Google DNS, falling back to system DNS.");
    }
  }

  if (cached.conn) {
    // Only return if fully connected. Cloudflare Edge isolates can sleep and wake up with dead sockets.
    if (cached.conn.connection.readyState === 1) {
      return cached.conn;
    }
    // If disconnected, connecting, or disconnecting (stale state), force a reconnect
    console.warn(
      `[MongoDB] Stale connection (readyState: ${cached.conn.connection.readyState}), reconnecting...`,
    );
    cached.conn = null;
    cached.promise = null;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      // Add timeouts so frozen edge workers don't hang forever
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      // Serverless optimizations to prevent connection exhaustion
      maxPoolSize: 1,
      minPoolSize: 0,
      maxIdleTimeMS: 10000,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;
