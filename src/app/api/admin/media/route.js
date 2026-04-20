import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { requireAdmin } from '@/lib/auth';
import MediaContent from '@/models/MediaContent';

export async function GET() {
  try {
    await requireAdmin();
    await connectDB();
    const media = await MediaContent.find().sort({ order: 1, createdAt: -1 }).lean();
    return NextResponse.json({ media });
  } catch (error) {
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    );
  }
}

export async function POST(request) {
  try {
    await requireAdmin();
    await connectDB();
    const { id, title, url, type, isFeatured, order, isActive, isVertical, thumbnailUrl } = await request.json();

    if (!title || !url || !type) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // If this item is being set as featured, unset any other featured items
    if (isFeatured) {
      await MediaContent.updateMany({ isFeatured: true }, { isFeatured: false });
    }

    if (id) {
      const updatedMedia = await MediaContent.findByIdAndUpdate(
        id,
        { title, url, type, isFeatured, order, isActive, isVertical, thumbnailUrl },
        { new: true }
      );
      return NextResponse.json({ message: 'Media updated', media: updatedMedia });
    } else {
      const newMedia = await MediaContent.create({
        title,
        url,
        type,
        isFeatured,
        order,
        isActive,
        isVertical,
        thumbnailUrl,
      });
      return NextResponse.json({ message: 'Media created', media: newMedia }, { status: 201 });
    }
  } catch (error) {
    console.error('Admin Media Error:', error);
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ message: 'ID is required' }, { status: 400 });
    }

    await connectDB();
    await MediaContent.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Media deleted' });
  } catch (error) {
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    );
  }
}
