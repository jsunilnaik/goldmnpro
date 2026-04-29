import mongoose from 'mongoose';

// Models are registered in individual routes where needed
// This keeps the core lightweight for serverless isolates

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

    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
            maxPoolSize: 1, 
            minPoolSize: 0,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            connectTimeoutMS: 5000,
            retryWrites: false, 
            retryReads: true,
        };

        console.log('📡 Attempting MongoDB connection...');
        const start = Date.now();

        // Hard timeout for connection promise to prevent worker hang
        const connectionPromise = mongoose.connect(MONGODB_URI, opts);
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('MongoDB connection timeout after 5s')), 5000)
        );

        cached.promise = Promise.race([connectionPromise, timeoutPromise])
            .then((mongoose) => {
                console.log(`✅ MongoDB connected successfully in ${Date.now() - start}ms`);
                return mongoose;
            })
            .catch((err) => {
                cached.promise = null;
                console.error('❌ MongoDB connection failed:', err.message);
                throw err;
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