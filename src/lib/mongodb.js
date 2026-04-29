import mongoose from 'mongoose';
import dns from 'dns';

// Force Google DNS to resolve MongoDB SRV records (prevents ECONNREFUSED on some networks)
if (dns && typeof dns.setServers === 'function') {
  try {
    dns.setServers(['8.8.8.8', '8.8.4.4']);
  } catch (e) {
    console.warn('⚠️ Failed to set DNS servers:', e.message);
  }
}

// Use global for caching in development to prevent multiple connections during HMR
let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
    const MONGODB_URI = process.env.MONGODB_URI;

    if (!MONGODB_URI) {
        console.error('❌ MONGODB_URI is missing!');
        throw new Error('MONGODB_URI_MISSING');
    }

    // If already connected, return the connection
    if (cached.conn || mongoose.connection.readyState === 1) {
        if (!cached.conn) cached.conn = mongoose.connection;
        return cached.conn;
    }

    // If a connection is already being established, wait for it
    if (cached.promise) {
        console.log('⌛ DB connection already in progress, waiting...');
        try {
            cached.conn = await cached.promise;
            return cached.conn;
        } catch (e) {
            cached.promise = null; // Reset on failure
            throw e;
        }
    }

    // If we reach here, no connection and no promise exists
    const opts = {
        bufferCommands: true, // Set to true to avoid the "initial connection" errors
        maxPoolSize: 10,
        minPoolSize: 0,
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        connectTimeoutMS: 10000,
        retryWrites: false,
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
        
        // Final safety check
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