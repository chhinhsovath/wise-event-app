import { ID, Query } from 'react-native-appwrite';
import { databases } from './appwrite';
import { APPWRITE_DATABASE_ID, COLLECTIONS } from '@/lib/constants';
import { UserProfile } from '@/types';

/**
 * Users Service
 * Handles all user profile operations with Appwrite
 */

export class UsersService {
  private static dbId = APPWRITE_DATABASE_ID;
  private static collectionId = COLLECTIONS.USERS;

  /**
   * Get user by authenticated user ID
   */
  static async getUserById(userId: string): Promise<UserProfile | null> {
    try {
      const response = await databases.listDocuments(
        this.dbId,
        this.collectionId,
        [Query.equal('userId', userId), Query.limit(1)]
      );

      return response.documents.length > 0
        ? (response.documents[0] as unknown as UserProfile)
        : null;
    } catch (error) {
      console.error('[UsersService] Error fetching user by user ID:', error);
      return null;
    }
  }

  /**
   * Get user by document ID
   */
  static async getUserById(userId: string): Promise<UserProfile> {
    try {
      const response = await databases.getDocument(
        this.dbId,
        this.collectionId,
        userId
      );

      return response as unknown as UserProfile;
    } catch (error) {
      console.error('[UsersService] Error fetching user:', error);
      throw error;
    }
  }

  /**
   * Create or update user profile (from auth sync)
   */
  static async upsertUser(userData: {
    userId: string;
    email: string;
    fullName: string;
    avatar?: string;
    firstName?: string;
    lastName?: string;
  }): Promise<UserProfile> {
    try {
      // Check if user exists
      const existingUser = await this.getUserById(userData.userId);

      if (existingUser) {
        // Update existing user
        const response = await databases.updateDocument(
          this.dbId,
          this.collectionId,
          existingUser.$id,
          {
            email: userData.email,
            fullName: userData.fullName,
            avatar: userData.avatar || existingUser.avatar,
          }
        );

        return response as unknown as UserProfile;
      } else {
        // Create new user
        const response = await databases.createDocument(
          this.dbId,
          this.collectionId,
          ID.unique(),
          {
            userId: userData.userId,
            email: userData.email,
            fullName: userData.fullName,
            avatar: userData.avatar || '',
            role: 'attendee',
            isPublic: true,
            points: 0,
          }
        );

        return response as unknown as UserProfile;
      }
    } catch (error) {
      console.error('[UsersService] Error upserting user:', error);
      throw error;
    }
  }

  /**
   * Update user profile
   */
  static async updateUser(
    userId: string,
    updates: Partial<UserProfile>
  ): Promise<UserProfile> {
    try {
      const response = await databases.updateDocument(
        this.dbId,
        this.collectionId,
        userId,
        updates
      );

      return response as unknown as UserProfile;
    } catch (error) {
      console.error('[UsersService] Error updating user:', error);
      throw error;
    }
  }

  /**
   * Search users (attendee directory)
   */
  static async searchUsers(query: string, limit = 50): Promise<UserProfile[]> {
    try {
      // Note: Client-side filtering for now since Appwrite doesn't support full-text search
      // In production, consider using Algolia or implementing server-side search
      const response = await databases.listDocuments(
        this.dbId,
        this.collectionId,
        [Query.equal('isPublic', true), Query.limit(1000)]
      );

      if (!query) {
        return response.documents.slice(0, limit) as unknown as UserProfile[];
      }

      const lowerQuery = query.toLowerCase();
      const filtered = response.documents.filter(
        (user: any) =>
          user.fullName.toLowerCase().includes(lowerQuery) ||
          user.organization?.toLowerCase().includes(lowerQuery) ||
          user.title?.toLowerCase().includes(lowerQuery) ||
          user.interests?.some((interest: string) =>
            interest.toLowerCase().includes(lowerQuery)
          )
      );

      return filtered.slice(0, limit) as unknown as UserProfile[];
    } catch (error) {
      console.error('[UsersService] Error searching users:', error);
      throw error;
    }
  }

  /**
   * Get all public attendees
   */
  static async getAllAttendees(limit = 100): Promise<UserProfile[]> {
    try {
      const response = await databases.listDocuments(
        this.dbId,
        this.collectionId,
        [
          Query.equal('isPublic', true),
          Query.equal('role', 'attendee'),
          Query.limit(limit),
        ]
      );

      return response.documents as unknown as UserProfile[];
    } catch (error) {
      console.error('[UsersService] Error fetching attendees:', error);
      throw error;
    }
  }

  /**
   * Get users by role
   */
  static async getUsersByRole(
    role: 'attendee' | 'speaker' | 'organizer' | 'admin',
    limit = 100
  ): Promise<UserProfile[]> {
    try {
      const response = await databases.listDocuments(
        this.dbId,
        this.collectionId,
        [Query.equal('role', role), Query.limit(limit)]
      );

      return response.documents as unknown as UserProfile[];
    } catch (error) {
      console.error('[UsersService] Error fetching users by role:', error);
      throw error;
    }
  }

  /**
   * Get featured speakers
   */
  static async getFeaturedSpeakers(limit = 10): Promise<UserProfile[]> {
    try {
      const response = await databases.listDocuments(
        this.dbId,
        this.collectionId,
        [
          Query.equal('role', 'speaker'),
          Query.equal('isPublic', true),
          Query.limit(limit),
        ]
      );

      return response.documents as unknown as UserProfile[];
    } catch (error) {
      console.error('[UsersService] Error fetching featured speakers:', error);
      throw error;
    }
  }

  /**
   * Add points to user
   */
  static async addPoints(userId: string, points: number): Promise<UserProfile> {
    try {
      const user = await this.getUserById(userId);
      return await this.updateUser(userId, {
        points: user.points + points,
      });
    } catch (error) {
      console.error('[UsersService] Error adding points:', error);
      throw error;
    }
  }

  /**
   * Add badge to user
   */
  static async addBadge(userId: string, badge: string): Promise<UserProfile> {
    try {
      const user = await this.getUserById(userId);
      const currentBadges = user.badges || [];

      if (!currentBadges.includes(badge)) {
        return await this.updateUser(userId, {
          badges: [...currentBadges, badge],
        });
      }

      return user;
    } catch (error) {
      console.error('[UsersService] Error adding badge:', error);
      throw error;
    }
  }

  /**
   * Sync user from auth (create if doesn't exist)
   * Wrapper for upsertUser with authenticated user ID as parameter
   */
  static async syncUser(userId: string): Promise<UserProfile> {
    try {
      // In real implementation, you would fetch authenticated user data here
      // For now, we'll create a basic profile
      return await this.upsertUser({
        userId,
        email: `${userId}@temp.com`, // Should be fetched from auth
        fullName: 'User', // Should be fetched from auth
      });
    } catch (error) {
      console.error('[UsersService] Error syncing user from auth:', error);
      throw error;
    }
  }

  /**
   * Update user profile by authenticated user ID
   */
  static async updateUserProfile(
    userId: string,
    updates: Partial<UserProfile>
  ): Promise<UserProfile> {
    try {
      // Get user document ID from user ID
      const user = await this.getUserById(userId);

      if (!user) {
        throw new Error('User not found');
      }

      // Update using document ID
      return await this.updateUser(user.$id, updates);
    } catch (error) {
      console.error('[UsersService] Error updating user profile:', error);
      throw error;
    }
  }

  /**
   * Get event attendees (users registered for an event)
   * For now, returns all public attendees
   * TODO: Add event-specific registration tracking
   */
  static async getEventAttendees(eventId: string, limit = 100): Promise<UserProfile[]> {
    try {
      // For now, return all public attendees
      // In production, filter by event registration
      return await this.getAllAttendees(limit);
    } catch (error) {
      console.error('[UsersService] Error fetching event attendees:', error);
      throw error;
    }
  }

  /**
   * Delete user
   */
  static async deleteUser(userId: string): Promise<void> {
    try {
      await databases.deleteDocument(this.dbId, this.collectionId, userId);
    } catch (error) {
      console.error('[UsersService] Error deleting user:', error);
      throw error;
    }
  }
}
