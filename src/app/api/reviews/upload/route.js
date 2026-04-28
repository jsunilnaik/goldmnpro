import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import connectDB from '@/lib/mongodb';
import { requireAuth } from '@/lib/auth';

export async function POST(request) {
  try {
    const user = await requireAuth();
    if (user.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    // Check for Cloudflare/Edge runtime (No filesystem access)
    if (process.env.NEXT_RUNTIME === 'edge' || process.env.CF_PAGES === '1') {
      return NextResponse.json({ 
        message: 'Local file storage is not available in the cloud environment. Please configure Cloudflare R2 or similar storage provider.' 
      }, { status: 501 });
    }

    await connectDB();

    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ message: 'No file uploaded' }, { status: 400 });
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ message: 'Invalid file type' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const filename = `review-${Date.now()}.${file.name.split('.').pop() || 'png'}`;
    const publicPath = join(process.cwd(), 'public', 'uploads');
    const filePath = join(publicPath, filename);

    // Ensure uploads directory exists
    try {
      await mkdir(publicPath, { recursive: true });
    } catch (e) {
      // Ignore if directory exists
    }

    // Save new file
    await writeFile(filePath, buffer);

    const screenshotUrl = `/uploads/${filename}`;
    return NextResponse.json({
      message: 'Screenshot uploaded successfully',
      screenshotUrl
    });

  } catch (error) {
    console.error('Review upload error:', error);
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
