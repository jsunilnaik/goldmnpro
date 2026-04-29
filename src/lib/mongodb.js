import mongoose from 'mongoose';

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





// Use globalThis to maintain a cached connection across hot reloads and edge invocations
let cached = globalThis.mongoose;

if (!cached) {
  cached = globalThis.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable');
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      // Optional: Add timeouts so frozen edge workers don't hang forever
      serverSelectionTimeoutMS: 5000, 
      socketTimeoutMS: 45000,
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