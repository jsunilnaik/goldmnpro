import mongoose from 'mongoose';

// Per-isolate cache for Cloudflare Workers
let cachedPromise = null;

async function connectDB() {
    const MONGODB_URI = process.env.MONGODB_URI;

    if (!MONGODB_URI) {
        console.error('❌ MONGODB_URI is missing!');
        throw new Error('MONGODB_URI_MISSING');
    }

    // If already connected, return the connection
    if (mongoose.connection.readyState >= 1) {
        return mongoose.connection;
    }

    if (!cachedPromise) {
        const opts = {
            bufferCommands: false,
            maxPoolSize: 1,
            minPoolSize: 0,
            serverSelectionTimeoutMS: 8000,
            socketTimeoutMS: 45000,
            connectTimeoutMS: 8000,
            retryWrites: false,
            retryReads: true,
        };

        cachedPromise = mongoose.connect(MONGODB_URI, opts)
            .then((m) => {
                return m;
            })
            .catch((err) => {
                cachedPromise = null;
                throw err;
            });
    }

    try {
        await cachedPromise;
        return mongoose.connection;
    } catch (e) {
        cachedPromise = null;
        throw e;
    }
}

export default connectDB;