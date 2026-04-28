import mongoose from 'mongoose';
import User from '@/models/User';
import Wallet from '@/models/Wallet';
import MiningSession from '@/models/MiningSession';
import Subscription from '@/models/Subscription';
import Plan from '@/models/Plan';
import Review from '@/models/Review';

const MONGODB_URI = process.env.MONGODB_URI;

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
    if (!MONGODB_URI) {
        throw new Error('Please define the MONGODB_URI environment variable');
    }

    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
            maxPoolSize: 5,
            minPoolSize: 1,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 30000,
            connectTimeoutMS: 5000,
            family: 4,
            retryWrites: true,
        };

        const start = Date.now();
        console.log('📡 Starting MongoDB connection attempt...');

        cached.promise = mongoose.connect(MONGODB_URI, opts)
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