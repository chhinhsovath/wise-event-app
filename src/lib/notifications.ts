import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

/**
 * Notification Utility Library
 * Handles push notification setup, scheduling, and management
 */

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Request notification permissions
 * @returns Push token if successful, null if denied
 */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  let token: string | null = null;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#6366F1',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('Failed to get push token for push notification!');
      return null;
    }

    try {
      const projectId = Constants.expoConfig?.extra?.eas?.projectId ||
                        Constants.easConfig?.projectId;

      if (!projectId) {
        console.warn('Project ID not found. Push notifications may not work.');
      }

      token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
      console.log('Push token:', token);
    } catch (error) {
      console.error('Error getting push token:', error);
    }
  } else {
    console.warn('Must use physical device for Push Notifications');
  }

  return token;
}

/**
 * Schedule a notification for a specific time
 */
export async function scheduleNotification(
  title: string,
  body: string,
  data: any,
  trigger: Date | number
): Promise<string> {
  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
      sound: true,
      priority: Notifications.AndroidNotificationPriority.HIGH,
    },
    trigger: typeof trigger === 'number'
      ? { seconds: trigger }
      : { date: trigger },
  });

  return notificationId;
}

/**
 * Schedule session reminder notifications
 */
export async function scheduleSessionReminder(
  sessionId: string,
  sessionTitle: string,
  startTime: Date,
  reminderMinutes: number
): Promise<string | null> {
  const reminderTime = new Date(startTime.getTime() - reminderMinutes * 60 * 1000);
  const now = new Date();

  // Don't schedule if reminder time is in the past
  if (reminderTime <= now) {
    console.log('Reminder time is in the past, skipping');
    return null;
  }

  return await scheduleNotification(
    `Session Starting in ${reminderMinutes} Minutes`,
    sessionTitle,
    {
      type: 'session_reminder',
      sessionId,
      reminderMinutes,
    },
    reminderTime
  );
}

/**
 * Schedule multiple reminders for a session (30min, 15min, 5min)
 */
export async function scheduleSessionReminders(
  sessionId: string,
  sessionTitle: string,
  startTime: Date,
  enabledReminders: number[] = [30, 15, 5]
): Promise<string[]> {
  const notificationIds: string[] = [];

  for (const minutes of enabledReminders) {
    const id = await scheduleSessionReminder(sessionId, sessionTitle, startTime, minutes);
    if (id) {
      notificationIds.push(id);
    }
  }

  return notificationIds;
}

/**
 * Cancel a scheduled notification
 */
export async function cancelNotification(notificationId: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * Get all scheduled notifications
 */
export async function getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
  return await Notifications.getAllScheduledNotificationsAsync();
}

/**
 * Send a local notification immediately
 */
export async function sendLocalNotification(
  title: string,
  body: string,
  data?: any
): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: data || {},
      sound: true,
    },
    trigger: null, // Send immediately
  });
}

/**
 * Notification type helpers
 */
export const NotificationTypes = {
  SESSION_REMINDER: 'session_reminder',
  MESSAGE: 'message',
  CONNECTION_REQUEST: 'connection_request',
  CONNECTION_ACCEPTED: 'connection_accepted',
  ANNOUNCEMENT: 'announcement',
  SCHEDULE_CHANGE: 'schedule_change',
} as const;

/**
 * Format notification for display
 */
export function formatNotificationTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return date.toLocaleDateString();
}

/**
 * Notification badge management
 */
export async function setBadgeCount(count: number): Promise<void> {
  await Notifications.setBadgeCountAsync(count);
}

export async function getBadgeCount(): Promise<number> {
  return await Notifications.getBadgeCountAsync();
}

export async function clearBadge(): Promise<void> {
  await Notifications.setBadgeCountAsync(0);
}

/**
 * Notification listeners
 */
export function addNotificationReceivedListener(
  listener: (notification: Notifications.Notification) => void
): Notifications.Subscription {
  return Notifications.addNotificationReceivedListener(listener);
}

export function addNotificationResponseReceivedListener(
  listener: (response: Notifications.NotificationResponse) => void
): Notifications.Subscription {
  return Notifications.addNotificationResponseReceivedListener(listener);
}

/**
 * Check if notifications are enabled
 */
export async function areNotificationsEnabled(): Promise<boolean> {
  const { status } = await Notifications.getPermissionsAsync();
  return status === 'granted';
}

/**
 * Default notification settings
 */
export const DefaultNotificationSettings = {
  sessionReminders: true,
  reminderTimes: [30, 15, 5], // minutes before session
  newMessages: true,
  connectionRequests: true,
  announcements: true,
  scheduleChanges: true,
};

export type NotificationSettings = typeof DefaultNotificationSettings;
