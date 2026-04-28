import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Notification from '@/models/Notification';
import { requireAuth } from '@/lib/auth';
import { handleApiError } from '@/lib/api-error';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const user = await requireAuth();
    await dbConnect();
    
    // Fetch user's notifications
    const notifications = await Notification.find({ user: user._id })
      .sort({ createdAt: -1 })
      .limit(50); // Get latest 50

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return NextResponse.json({ notifications, unreadCount });
  } catch (error) {
    return handleApiError(error, 'Fetch notifications error');
  }
}

export async function PUT(request) {
  try {
    const user = await requireAuth();
    await dbConnect();
    
    // Mark all as read
    await Notification.updateMany(
      { user: user._id, isRead: false },
      { $set: { isRead: true } }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error, 'Update notifications error');
  }
}
