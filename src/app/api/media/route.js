export const runtime = 'edge';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import MediaContent from '@/models/MediaContent';

export async function GET() {
  try {
    await connectDB();
    const media = await MediaContent.find({ isActive: true })
      .sort({ order: 1, createdAt: -1 })
      .lean();

    return NextResponse.json({ media });
  } catch (error) {
    console.error('Failed to fetch media:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
