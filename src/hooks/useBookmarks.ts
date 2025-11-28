import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-expo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BookmarksService, SessionsService } from '@/services';
import { Session } from '@/types';
import {
  scheduleSessionReminders,
  DefaultNotificationSettings,
  NotificationSettings,
} from '@/lib/notifications';

/**
 * Bookmarks Hook
 * Manages session bookmarks with Appwrite integration and notification scheduling
 */

const SETTINGS_KEY = 'notificationSettings';

export function useBookmarks() {
  const { user } = useUser();
  const [bookmarkedSessions, setBookmarkedSessions] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // Load bookmarks from Appwrite on mount
  useEffect(() => {
    loadBookmarks();
  }, [user?.id]);

  const loadBookmarks = async () => {
    if (!user) {
      setLoading(false);
      setBookmarkedSessions(new Set());
      return;
    }

    try {
      setLoading(true);
      const bookmarks = await BookmarksService.getUserBookmarks(user.id);
      const sessionIds = new Set(bookmarks.map((b) => b.sessionId));
      setBookmarkedSessions(sessionIds);
    } catch (error) {
      console.error('[Bookmarks] Error loading bookmarks:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleBookmark = async (sessionId: string, sessionTitle?: string, startTime?: Date) => {
    if (!user) {
      console.warn('[Bookmarks] User not signed in');
      return;
    }

    const isAdding = !bookmarkedSessions.has(sessionId);

    try {
      // Call Appwrite service to toggle bookmark
      await BookmarksService.toggleBookmark(user.id, sessionId);

      // Update local state optimistically
      setBookmarkedSessions((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(sessionId)) {
          newSet.delete(sessionId);
        } else {
          newSet.add(sessionId);
        }
        return newSet;
      });

      // Schedule notifications when bookmarking a session
      if (isAdding && sessionTitle && startTime) {
        try {
          const settings = await loadNotificationSettings();
          if (settings.sessionReminders) {
            await scheduleSessionReminders(
              sessionId,
              sessionTitle,
              startTime,
              settings.reminderTimes
            );
            console.log(`[Bookmarks] Notifications scheduled for "${sessionTitle}"`);
          }
        } catch (error) {
          console.error('[Bookmarks] Error scheduling notifications:', error);
        }
      }
    } catch (error: any) {
      console.error('[Bookmarks] Error toggling bookmark:', error);
      throw error;
    }
  };

  const loadNotificationSettings = async (): Promise<NotificationSettings> => {
    try {
      const saved = await AsyncStorage.getItem(SETTINGS_KEY);
      return saved ? JSON.parse(saved) : DefaultNotificationSettings;
    } catch (error) {
      console.error('Error loading notification settings:', error);
      return DefaultNotificationSettings;
    }
  };

  const isBookmarked = (sessionId: string): boolean => {
    return bookmarkedSessions.has(sessionId);
  };

  const getBookmarkedSessions = (): string[] => {
    return Array.from(bookmarkedSessions);
  };

  const getBookmarkedSessionsData = async (): Promise<Session[]> => {
    if (!user) {
      return [];
    }

    try {
      const bookmarks = await BookmarksService.getUserBookmarks(user.id);
      const sessionIds = bookmarks.map((b) => b.sessionId);

      // Get full session data for each bookmark
      const sessions = await Promise.all(
        sessionIds.map((id) => SessionsService.getSessionById(id))
      );

      return sessions.filter((s) => s !== null) as Session[];
    } catch (error) {
      console.error('[Bookmarks] Error getting bookmarked sessions data:', error);
      return [];
    }
  };

  const clearAllBookmarks = async () => {
    if (!user) {
      return;
    }

    try {
      const bookmarks = await BookmarksService.getUserBookmarks(user.id);

      // Delete all bookmarks
      await Promise.all(
        bookmarks.map((bookmark) => BookmarksService.deleteBookmark(bookmark.$id))
      );

      setBookmarkedSessions(new Set());
    } catch (error) {
      console.error('[Bookmarks] Error clearing bookmarks:', error);
      throw error;
    }
  };

  return {
    bookmarkedSessions: Array.from(bookmarkedSessions),
    isBookmarked,
    toggleBookmark,
    getBookmarkedSessions,
    getBookmarkedSessionsData,
    clearAllBookmarks,
    refreshBookmarks: loadBookmarks,
    loading,
  };
}
