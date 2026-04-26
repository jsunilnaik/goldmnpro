export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { writeFile, mkdir, unlink } from 'node:fs/promises';
import { join } from 'node:path';
import connectDB from '@/lib/mongodb';
import { requireAuth } from '@/lib/auth';
import User from '@/models/User';

export async function POST(request) {
  try {
    const user = await requireAuth();

    // Check for Cloudflare/Edge runtime (No filesystem access)
    if (process.env.NEXT_RUNTIME === 'edge' || process.env.CF_PAGES === '1') {
      return NextResponse.json({ 
        message: 'Local file storage is not available in the cloud environment. Please configure Cloudflare R2 or similar storage provider.' 
      }, { status: 501 });
    }

    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ message: 'No file uploaded' }, { status: 400 });
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ message: 'Invalid file type. Only JPG, PNG, and WebP are allowed' }, { status: 400 });
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ message: 'File too large. Maximum size is 5MB' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename
    const fileExtension = file.name.split('.').pop() || 'png';
    const filename = `avatar-${user._id}-${Date.now()}.${fileExtension}`;
    const publicPath = join(process.cwd(), 'public', 'uploads');
    const filePath = join(publicPath, filename);

    // Ensure uploads directory exists
    try {
      await mkdir(publicPath, { recursive: true });
    } catch (e) {
      // Ignore if directory exists
    }

    // Delete old avatar if it's local
    const dbUser = await User.findById(user._id);
    if (dbUser.avatar && dbUser.avatar.startsWith('/uploads/')) {
      try {
        const oldPath = join(process.cwd(), 'public', dbUser.avatar);
        await unlink(oldPath);
      } catch (e) {
        console.warn('Failed to delete old avatar file:', e);
      }
    }

    // Save new file
    await writeFile(filePath, buffer);

    // Update database
    const avatarUrl = `/uploads/${filename}`;
    dbUser.avatar = avatarUrl;
    await dbUser.save();

    return NextResponse.json({
      message: 'Profile picture updated successfully',
      avatarUrl
    });

  } catch (error) {
    console.error('Avatar upload error:', error);
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
