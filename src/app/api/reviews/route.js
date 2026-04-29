import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { requireAuth } from '@/lib/auth';
import Review from '@/models/Review';
import { handleApiError } from '@/lib/api-error';

export async function GET() {
  try {
    await connectDB();
    const reviews = await Review.find().sort({ date: -1 }).lean();
    return NextResponse.json({ reviews });
  } catch (error) {
    return handleApiError(error, 'Reviews GET Error');
  }
}

export async function POST(request) {
  try {
    const user = await requireAuth();
    if (user.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    await connectDB();
    const { title, description, screenshotUrl } = await request.json();

    if (!title || !description || !screenshotUrl) {
      return NextResponse.json({ message: 'All fields are required' }, { status: 400 });
    }

    const review = await Review.create({
      title,
      description,
      screenshotUrl,
    });

    return NextResponse.json({
      message: 'Review created successfully',
      review
    }, { status: 201 });

  } catch (error) {
    return handleApiError(error, 'Reviews POST Error');
  }
}
