import Notification from '@/models/Notification';
import connectDB from './mongodb';

/**
 * Creates a system notification for a user.
 * @param {string} userId - ID of the user to notify
 * @param {object} data - { title, message, type, actionUrl }
 */
export async function createNotification(userId, { title, message, type = 'system', actionUrl = null }) {
  try {
    await connectDB();
    
    const notification = await Notification.create({
      user: userId,
      title,
      message,
      type,
      actionUrl
    });
    
    console.log(`🔔 Notification created for user ${userId}: ${title}`);
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    // Don't throw, just log. Notifications should not break the main flow.
    return null;
  }
}
