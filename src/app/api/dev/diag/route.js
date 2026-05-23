import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

export async function GET() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ message: 'Only available in dev mode' }, { status: 403 });
  }
  const info = {
    env: {
      MONGODB_URI: process.env.MONGODB_URI ? 'SET (length: ' + process.env.MONGODB_URI.length + ')' : 'MISSING',
      JWT_SECRET: process.env.JWT_SECRET ? 'SET' : 'MISSING',
      NODE_ENV: process.env.NODE_ENV,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    },
    mongoose: {
      readyState: mongoose.connection.readyState,
      states: {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting',
      },
    },
    time: new Date().toISOString(),
  };

  try {
    if (process.env.MONGODB_URI) {
      // Try a very quick ping without the full connectDB wrapper
      const start = Date.now();
      await mongoose.connect(process.env.MONGODB_URI, { 
        serverSelectionTimeoutMS: 2000,
        connectTimeoutMS: 2000 
      });
      info.ping = {
        success: true,
        duration: Date.now() - start,
      };
    }
  } catch (err) {
    info.ping = {
      success: false,
      error: err.message,
    };
  }

  return NextResponse.json(info);
}
