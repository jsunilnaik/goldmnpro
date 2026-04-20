import { NextResponse } from 'next/server';
import { unlink } from 'node:fs/promises';
import { join } from 'node:path';
import connectDB from '@/lib/mongodb';
import { requireAuth } from '@/lib/auth';
import Review from '@/models/Review';

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const user = await requireAuth();
    if (user.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    await connectDB();
    const review = await Review.findById(id);

    if (!review) {
      return NextResponse.json({ message: 'Review not found' }, { status: 404 });
    }

    // Delete screenshot if it's local
    if (review.screenshotUrl && review.screenshotUrl.startsWith('/uploads/')) {
      // Skip filesystem operations on Cloudflare
      if (!(process.env.NEXT_RUNTIME === 'edge' || process.env.CF_PAGES === '1')) {
        try {
          const filePath = join(process.cwd(), 'public', review.screenshotUrl);
          await unlink(filePath);
        } catch (e) {
          console.warn('Failed to delete review screenshot file:', e);
        }
      }
    }

    await Review.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Review deleted successfully' });

  } catch (error) {
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    );
  }
}
