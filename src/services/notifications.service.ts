import { databases } from './appwrite';
import { Query } from 'react-native-appwrite';
import { Notification } from '@/types';
import {
  scheduleSessionReminders,
  cancelNotification,
  sendLocalNotification,
  NotificationTypes,
} from '@/lib/notifications';

/**
 * Notifications Service
 * Manages notification data in Appwrite and integrates with push notifications
 */
export class NotificationsService {
  private static dbId = 'main';
  private static collectionId = 'notifications';

  /**
   * Get all notifications for a user
   */
  static async getUserNotifications(
    clerkUserId: string,
    limit: number = 50
  ): Promise<Notification[]> {
    try {
      const response = await databases.listDocuments(
        this.dbId,
        this.collectionId,
        [
          Query.equal('clerkUserId', clerkUserId),
          Query.orderDesc('$createdAt'),
          Query.limit(limit),
        ]
      );

      return response.documents as unknown as Notification[];
    } catch (error) {
      console.error('[NotificationsService] Error fetching notifications:', error);
      throw error;
    }
  }

  /**
   * Get unread notifications for a user
   */
  static async getUnreadNotifications(clerkUserId: string): Promise<Notification[]> {
    try {
      const response = await databases.listDocuments(
        this.dbId,
        this.collectionId,
        [
          Query.equal('clerkUserId', clerkUserId),
          Query.equal('isRead', false),
          Query.orderDesc('$createdAt'),
          Query.limit(100),
        ]
      );

      return response.documents as unknown as Notification[];
    } catch (error) {
      console.error('[NotificationsService] Error fetching unread notifications:', error);
      throw error;
    }
  }

  /**
   * Get unread notification count
   */
  static async getUnreadCount(clerkUserId: string): Promise<number> {
    try {
      const notifications = await this.getUnreadNotifications(clerkUserId);
      return notifications.length;
    } catch (error) {
      console.error('[NotificationsService] Error fetching unread count:', error);
      return 0;
    }
  }

  /**
   * Create a notification
   */
  static async createNotification(
    clerkUserId: string,
    type: string,
    title: string,
    body: string,
    data?: Record<string, any>
  ): Promise<Notification> {
    try {
      const response = await databases.createDocument(
        this.dbId,
        this.collectionId,
        'unique()',
        {
          clerkUserId,
          type,
          title,
          body,
          data: data || {},
          isRead: false,
        }
      );

      // Also send local push notification
      await sendLocalNotification(title, body, { ...data, type });

      return response as unknown as Notification;
    } catch (error) {
      console.error('[NotificationsService] Error creating notification:', error);
      throw error;
    }
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId: string): Promise<Notification> {
    try {
      const response = await databases.updateDocument(
        this.dbId,
        this.collectionId,
        notificationId,
        {
          isRead: true,
        }
      );

      return response as unknown as Notification;
    } catch (error) {
      console.error('[NotificationsService] Error marking notification as read:', error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  static async markAllAsRead(clerkUserId: string): Promise<void> {
    try {
      const unreadNotifications = await this.getUnreadNotifications(clerkUserId);

      // Mark each unread notification as read
      await Promise.all(
        unreadNotifications.map((notification) =>
          this.markAsRead(notification.$id)
        )
      );
    } catch (error) {
      console.error('[NotificationsService] Error marking all as read:', error);
      throw error;
    }
  }

  /**
   * Delete a notification
   */
  static async deleteNotification(notificationId: string): Promise<void> {
    try {
      await databases.deleteDocument(this.dbId, this.collectionId, notificationId);
    } catch (error) {
      console.error('[NotificationsService] Error deleting notification:', error);
      throw error;
    }
  }

  /**
   * Delete all notifications for a user
   */
  static async deleteAllNotifications(clerkUserId: string): Promise<void> {
    try {
      const notifications = await this.getUserNotifications(clerkUserId, 1000);

      await Promise.all(
        notifications.map((notification) =>
          this.deleteNotification(notification.$id)
        )
      );
    } catch (error) {
      console.error('[NotificationsService] Error deleting all notifications:', error);
      throw error;
    }
  }

  /**
   * Get notifications by type
   */
  static async getNotificationsByType(
    clerkUserId: string,
    type: string,
    limit: number = 50
  ): Promise<Notification[]> {
    try {
      const response = await databases.listDocuments(
        this.dbId,
        this.collectionId,
        [
          Query.equal('clerkUserId', clerkUserId),
          Query.equal('type', type),
          Query.orderDesc('$createdAt'),
          Query.limit(limit),
        ]
      );

      return response.documents as unknown as Notification[];
    } catch (error) {
      console.error('[NotificationsService] Error fetching notifications by type:', error);
      throw error;
    }
  }

  /**
   * Notification type-specific helpers
   */

  // Session reminder notification
  static async createSessionReminderNotification(
    clerkUserId: string,
    sessionId: string,
    sessionTitle: string,
    startTime: Date
  ): Promise<Notification> {
    return this.createNotification(
      clerkUserId,
      NotificationTypes.SESSION_REMINDER,
      'Session Reminder',
      `"${sessionTitle}" starts soon`,
      { sessionId, startTime: startTime.toISOString() }
    );
  }

  // New message notification
  static async createMessageNotification(
    clerkUserId: string,
    senderName: string,
    conversationId: string,
    messagePreview: string
  ): Promise<Notification> {
    return this.createNotification(
      clerkUserId,
      NotificationTypes.MESSAGE,
      `New message from ${senderName}`,
      messagePreview,
      { conversationId }
    );
  }

  // Connection request notification
  static async createConnectionRequestNotification(
    clerkUserId: string,
    requesterName: string,
    connectionId: string
  ): Promise<Notification> {
    return this.createNotification(
      clerkUserId,
      NotificationTypes.CONNECTION_REQUEST,
      'New Connection Request',
      `${requesterName} wants to connect with you`,
      { connectionId }
    );
  }

  // Connection accepted notification
  static async createConnectionAcceptedNotification(
    clerkUserId: string,
    accepterName: string,
    connectionId: string
  ): Promise<Notification> {
    return this.createNotification(
      clerkUserId,
      NotificationTypes.CONNECTION_ACCEPTED,
      'Connection Accepted',
      `${accepterName} accepted your connection request`,
      { connectionId }
    );
  }

  // Announcement notification
  static async createAnnouncementNotification(
    clerkUserId: string,
    title: string,
    body: string,
    announcementId?: string
  ): Promise<Notification> {
    return this.createNotification(
      clerkUserId,
      NotificationTypes.ANNOUNCEMENT,
      title,
      body,
      { announcementId }
    );
  }

  // Schedule change notification
  static async createScheduleChangeNotification(
    clerkUserId: string,
    sessionId: string,
    sessionTitle: string,
    changeType: 'time' | 'location' | 'cancelled',
    changeDetails: string
  ): Promise<Notification> {
    const titles = {
      time: 'Session Time Changed',
      location: 'Session Location Changed',
      cancelled: 'Session Cancelled',
    };

    return this.createNotification(
      clerkUserId,
      NotificationTypes.SCHEDULE_CHANGE,
      titles[changeType],
      `"${sessionTitle}": ${changeDetails}`,
      { sessionId, changeType }
    );
  }
}
