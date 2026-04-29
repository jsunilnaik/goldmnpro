import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import MediaContent from '@/models/MediaContent';
import { handleApiError } from '@/lib/api-error';

export async function GET() {
  try {
    await connectDB();
    const media = await MediaContent.find({ isActive: true })
      .sort({ order: 1, createdAt: -1 })
      .lean();

    return NextResponse.json({ media });
  } catch (error) {
    return handleApiError(error, 'Media GET Error');
  }
}
