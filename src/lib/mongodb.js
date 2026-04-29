import mongoose from 'mongoose';
import User from '@/models/User';
import Wallet from '@/models/Wallet';
import MiningSession from '@/models/MiningSession';
import Subscription from '@/models/Subscription';
import Plan from '@/models/Plan';
import Review from '@/models/Review';
import Transaction from '@/models/Transaction';
import Broadcast from '@/models/Broadcast';
import Location from '@/models/Location';
import Notification from '@/models/Notification';

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
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
            maxPoolSize: 1, // Reduced for serverless
            minPoolSize: 0,
            serverSelectionTimeoutMS: 8000,
            socketTimeoutMS: 45000,
            connectTimeoutMS: 10000,
            retryWrites: false, // Changed from true
            retryReads: true,
        };

        console.log('📡 Attempting MongoDB connection...');
        const start = Date.now();

        // Hard timeout for connection promise to prevent worker hang
        const connectionPromise = mongoose.connect(MONGODB_URI, opts);
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('MongoDB connection timeout after 10s')), 10000)
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
        console.error('❌ MongoDB connection error:', e.message);
        throw new Error(`Database connection failed: ${e.message}`);
    }

    return cached.conn;
}

export default connectDB;