import { ID, Query } from 'react-native-appwrite';
import { databases } from './appwrite';
import { APPWRITE_DATABASE_ID, COLLECTIONS } from '@/lib/constants';
import { Bookmark } from '@/types';

/**
 * Bookmarks Service
 * Handles all bookmark-related Appwrite operations
 */

export class BookmarksService {
  private static dbId = APPWRITE_DATABASE_ID;
  private static collectionId = COLLECTIONS.BOOKMARKS;

  /**
   * Get all bookmarks for a user
   */
  static async getUserBookmarks(clerkUserId: string): Promise<Bookmark[]> {
    try {
      const response = await databases.listDocuments(
        this.dbId,
        this.collectionId,
        [
          Query.equal('clerkUserId', clerkUserId),
          Query.orderDesc('$createdAt'),
          Query.limit(1000),
        ]
      );

      return response.documents as unknown as Bookmark[];
    } catch (error) {
      console.error('[BookmarksService] Error fetching bookmarks:', error);
      throw error;
    }
  }

  /**
   * Get bookmark IDs for a user (for quick lookup)
   */
  static async getUserBookmarkIds(clerkUserId: string): Promise<string[]> {
    try {
      const bookmarks = await this.getUserBookmarks(clerkUserId);
      return bookmarks.map((bookmark) => bookmark.sessionId);
    } catch (error) {
      console.error('[BookmarksService] Error fetching bookmark IDs:', error);
      throw error;
    }
  }

  /**
   * Check if a session is bookmarked
   */
  static async isSessionBookmarked(
    clerkUserId: string,
    sessionId: string
  ): Promise<boolean> {
    try {
      const response = await databases.listDocuments(
        this.dbId,
        this.collectionId,
        [
          Query.equal('clerkUserId', clerkUserId),
          Query.equal('sessionId', sessionId),
          Query.limit(1),
        ]
      );

      return response.documents.length > 0;
    } catch (error) {
      console.error('[BookmarksService] Error checking bookmark:', error);
      return false;
    }
  }

  /**
   * Get a specific bookmark
   */
  static async getBookmark(
    clerkUserId: string,
    sessionId: string
  ): Promise<Bookmark | null> {
    try {
      const response = await databases.listDocuments(
        this.dbId,
        this.collectionId,
        [
          Query.equal('clerkUserId', clerkUserId),
          Query.equal('sessionId', sessionId),
          Query.limit(1),
        ]
      );

      return response.documents.length > 0
        ? (response.documents[0] as unknown as Bookmark)
        : null;
    } catch (error) {
      console.error('[BookmarksService] Error fetching bookmark:', error);
      return null;
    }
  }

  /**
   * Create a bookmark
   */
  static async createBookmark(
    clerkUserId: string,
    sessionId: string,
    reminderTime?: number,
    notes?: string
  ): Promise<Bookmark> {
    try {
      // Check if bookmark already exists
      const existing = await this.getBookmark(clerkUserId, sessionId);
      if (existing) {
        console.log('[BookmarksService] Bookmark already exists');
        return existing;
      }

      const response = await databases.createDocument(
        this.dbId,
        this.collectionId,
        ID.unique(),
        {
          clerkUserId,
          sessionId,
          reminderTime: reminderTime || 15,
          notes: notes || '',
        }
      );

      return response as unknown as Bookmark;
    } catch (error) {
      console.error('[BookmarksService] Error creating bookmark:', error);
      throw error;
    }
  }

  /**
   * Update bookmark (notes, reminder time)
   */
  static async updateBookmark(
    bookmarkId: string,
    updates: Partial<Bookmark>
  ): Promise<Bookmark> {
    try {
      const response = await databases.updateDocument(
        this.dbId,
        this.collectionId,
        bookmarkId,
        updates
      );

      return response as unknown as Bookmark;
    } catch (error) {
      console.error('[BookmarksService] Error updating bookmark:', error);
      throw error;
    }
  }

  /**
   * Delete a bookmark
   */
  static async deleteBookmark(bookmarkId: string): Promise<void> {
    try {
      await databases.deleteDocument(this.dbId, this.collectionId, bookmarkId);
    } catch (error) {
      console.error('[BookmarksService] Error deleting bookmark:', error);
      throw error;
    }
  }

  /**
   * Delete bookmark by session ID
   */
  static async deleteBookmarkBySession(
    clerkUserId: string,
    sessionId: string
  ): Promise<void> {
    try {
      const bookmark = await this.getBookmark(clerkUserId, sessionId);
      if (bookmark) {
        await this.deleteBookmark(bookmark.$id);
      }
    } catch (error) {
      console.error('[BookmarksService] Error deleting bookmark by session:', error);
      throw error;
    }
  }

  /**
   * Toggle bookmark (add if not exists, remove if exists)
   */
  static async toggleBookmark(
    clerkUserId: string,
    sessionId: string
  ): Promise<'added' | 'removed'> {
    try {
      const bookmark = await this.getBookmark(clerkUserId, sessionId);

      if (bookmark) {
        // Remove bookmark
        await this.deleteBookmark(bookmark.$id);
        return 'removed';
      } else {
        // Add bookmark
        await this.createBookmark(clerkUserId, sessionId);
        return 'added';
      }
    } catch (error) {
      console.error('[BookmarksService] Error toggling bookmark:', error);
      throw error;
    }
  }

  /**
   * Clear all bookmarks for a user
   */
  static async clearAllBookmarks(clerkUserId: string): Promise<void> {
    try {
      const bookmarks = await this.getUserBookmarks(clerkUserId);

      // Delete all bookmarks
      await Promise.all(
        bookmarks.map((bookmark) => this.deleteBookmark(bookmark.$id))
      );
    } catch (error) {
      console.error('[BookmarksService] Error clearing bookmarks:', error);
      throw error;
    }
  }

  /**
   * Get bookmarks count for a user
   */
  static async getBookmarksCount(clerkUserId: string): Promise<number> {
    try {
      const response = await databases.listDocuments(
        this.dbId,
        this.collectionId,
        [Query.equal('clerkUserId', clerkUserId), Query.limit(1)]
      );

      return response.total;
    } catch (error) {
      console.error('[BookmarksService] Error fetching bookmarks count:', error);
      return 0;
    }
  }
}
