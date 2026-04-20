import mongoose from 'mongoose';
import dns from 'dns';
import User from '@/models/User';
import Wallet from '@/models/Wallet';
import MiningSession from '@/models/MiningSession';
import Subscription from '@/models/Subscription';
import Plan from '@/models/Plan';
import Review from '@/models/Review';

// If USE_GOOGLE_DNS is set, override the default DNS servers for this process.
if (process.env.USE_GOOGLE_DNS === 'true') {
    dns.setServers(['8.8.8.8', '8.8.4.4']);
}

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable');
}

/**
 * Manually resolves a mongodb+srv URI to a standard mongodb:// URI
 * This bypasses issues where the driver's native SRV resolver fails but manual DNS works.
 */
async function resolveSrvToStandardUri(srvUri) {
    if (!srvUri.startsWith('mongodb+srv://')) return srvUri;

    try {
        const url = new URL(srvUri.replace('mongodb+srv', 'http'));
        const srvHostname = `_mongodb._tcp.${url.hostname}`;
        
        console.log(`🔍 Manually resolving SRV: ${srvHostname}`);
        
        const addresses = await new Promise((resolve, reject) => {
            dns.resolveSrv(srvHostname, (err, addr) => {
                if (err) reject(err);
                else resolve(addr);
            });
        });

        if (!addresses || addresses.length === 0) {
            throw new Error('No SRV addresses found');
        }

        const nodes = addresses.map(a => `${a.name}:${a.port}`).join(',');
        const auth = url.username && url.password ? `${url.username}:${url.password}@` : '';
        const search = url.search || '';
        const pathname = url.pathname || '/';
        
        // Construct standard URI with SSL and AuthSource which are often required for Atlas clusters.
        const standardUri = `mongodb://${auth}${nodes}${pathname}${search}${search ? '&' : '?'}ssl=true&authSource=admin&directConnection=false&retryWrites=true`;
        console.log('✅ Manually constructed standard URI for connection fallback');
        return standardUri;
    } catch (error) {
        console.error('❌ Manual SRV resolution failed:', error.message);
        return srvUri; // Return original and hope the driver can handle it
    }
}

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
            maxPoolSize: 20,
            minPoolSize: 5,
            serverSelectionTimeoutMS: 8000, // Slightly longer for the initial attempt
            socketTimeoutMS: 45000,
            connectTimeoutMS: 10000,
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
            .catch(async (err) => {
                // Fallback logic for SRV DNS issues
                if (MONGODB_URI.startsWith('mongodb+srv://') && 
                   (err.message.includes('querySrv') || err.message.includes('ECONNREFUSED') || err.message.includes('ENOTFOUND'))) {
                    
                    console.warn('⚠️ Standard SRV connection failed. Attempting manual DNS fallback...');
                    const fallbackUri = await resolveSrvToStandardUri(MONGODB_URI);
                    
                    if (fallbackUri !== MONGODB_URI) {
                        return mongoose.connect(fallbackUri, opts).then((mongoose) => {
                            console.log(`✅ Connected using Manual DNS Fallback in ${Date.now() - start}ms`);
                            return mongoose;
                        });
                    }
                }
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