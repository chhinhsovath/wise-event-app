import { useState, useEffect, useRef } from 'react';
import { useUser } from '@clerk/clerk-expo';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  registerForPushNotificationsAsync,
  addNotificationReceivedListener,
  addNotificationResponseReceivedListener,
  scheduleSessionReminders,
  setBadgeCount,
  DefaultNotificationSettings,
  NotificationSettings,
} from '@/lib/notifications';
import { NotificationsService } from '@/services';
import { Notification } from '@/types';

/**
 * Custom hook for managing notifications
 * Handles permission, listeners, badge count, and notification data
 */
export function useNotifications() {
  const { user } = useUser();
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [settings, setSettings] = useState<NotificationSettings>(DefaultNotificationSettings);
  const [loading, setLoading] = useState(true);

  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  // Initialize notifications on mount
  useEffect(() => {
    initializeNotifications();
    loadSettings();
    setupListeners();

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  // Load notifications when user changes
  useEffect(() => {
    if (user) {
      loadNotifications();
      loadUnreadCount();
    }
  }, [user]);

  // Update badge count when unread count changes
  useEffect(() => {
    setBadgeCount(unreadCount);
  }, [unreadCount]);

  const initializeNotifications = async () => {
    const token = await registerForPushNotificationsAsync();
    setPushToken(token);
  };

  const loadSettings = async () => {
    try {
      const saved = await AsyncStorage.getItem('notificationSettings');
      if (saved) {
        setSettings(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  };

  const loadNotifications = async () => {
    if (!user) return;

    try {
      const data = await NotificationsService.getUserNotifications(user.id, 50);
      setNotifications(data);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    if (!user) return;

    try {
      const count = await NotificationsService.getUnreadCount(user.id);
      setUnreadCount(count);
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  const setupListeners = () => {
    // Listener for notifications received while app is foregrounded
    notificationListener.current = addNotificationReceivedListener((notification) => {
      console.log('Notification received:', notification);
      loadNotifications();
      loadUnreadCount();
    });

    // Listener for when user taps on notification
    responseListener.current = addNotificationResponseReceivedListener((response) => {
      console.log('Notification response:', response);
      // Handle navigation based on notification data
      const data = response.notification.request.content.data;
      handleNotificationNavigation(data);
    });
  };

  const handleNotificationNavigation = (data: any) => {
    // This would be implemented in the component using the hook
    // or you could use a navigation ref here
    console.log('Navigate based on notification data:', data);
  };

  const scheduleSessionReminder = async (
    sessionId: string,
    sessionTitle: string,
    startTime: Date
  ) => {
    if (!settings.sessionReminders) return;

    try {
      await scheduleSessionReminders(
        sessionId,
        sessionTitle,
        startTime,
        settings.reminderTimes
      );
    } catch (error) {
      console.error('Error scheduling session reminder:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await NotificationsService.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n.$id === notificationId ? { ...n, isRead: true } : n))
      );
      loadUnreadCount();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;

    try {
      await NotificationsService.markAllAsRead(user.id);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      await NotificationsService.deleteNotification(notificationId);
      setNotifications((prev) => prev.filter((n) => n.$id !== notificationId));
      loadUnreadCount();
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const sendTestNotification = async () => {
    if (!user) return;

    try {
      await NotificationsService.createNotification(
        user.id,
        'announcement',
        'Test Notification',
        'This is a test notification from the WISE Event App',
        { test: true }
      );
      loadNotifications();
      loadUnreadCount();
    } catch (error) {
      console.error('Error sending test notification:', error);
    }
  };

  return {
    pushToken,
    notifications,
    unreadCount,
    settings,
    loading,
    loadNotifications,
    loadUnreadCount,
    scheduleSessionReminder,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    sendTestNotification,
  };
}
