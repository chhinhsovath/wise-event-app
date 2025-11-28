import { ID, Query } from 'react-native-appwrite';
import { databases } from './appwrite';
import { APPWRITE_DATABASE_ID, COLLECTIONS } from '@/lib/constants';
import { Session } from '@/types';

/**
 * Sessions Service
 * Handles all session-related Appwrite operations
 */

export class SessionsService {
  private static dbId = APPWRITE_DATABASE_ID;
  private static collectionId = COLLECTIONS.SESSIONS;

  /**
   * Get all sessions for an event
   */
  static async getSessionsByEvent(eventId: string): Promise<Session[]> {
    try {
      const response = await databases.listDocuments(
        this.dbId,
        this.collectionId,
        [Query.equal('eventId', eventId), Query.orderAsc('startTime'), Query.limit(1000)]
      );

      return response.documents as unknown as Session[];
    } catch (error) {
      console.error('[SessionsService] Error fetching sessions:', error);
      throw error;
    }
  }

  /**
   * Get a single session by ID
   */
  static async getSessionById(sessionId: string): Promise<Session> {
    try {
      const response = await databases.getDocument(
        this.dbId,
        this.collectionId,
        sessionId
      );

      return response as unknown as Session;
    } catch (error) {
      console.error('[SessionsService] Error fetching session:', error);
      throw error;
    }
  }

  /**
   * Get featured sessions
   */
  static async getFeaturedSessions(eventId: string, limit = 10): Promise<Session[]> {
    try {
      const response = await databases.listDocuments(
        this.dbId,
        this.collectionId,
        [
          Query.equal('eventId', eventId),
          Query.equal('isFeatured', true),
          Query.orderAsc('startTime'),
          Query.limit(limit),
        ]
      );

      return response.documents as unknown as Session[];
    } catch (error) {
      console.error('[SessionsService] Error fetching featured sessions:', error);
      throw error;
    }
  }

  /**
   * Search sessions by title, description, or tags
   */
  static async searchSessions(
    eventId: string,
    query: string
  ): Promise<Session[]> {
    try {
      // Note: Appwrite doesn't have full-text search yet, so we fetch all and filter client-side
      // In production, you might want to use Algolia or implement server-side search
      const response = await databases.listDocuments(
        this.dbId,
        this.collectionId,
        [Query.equal('eventId', eventId), Query.limit(1000)]
      );

      const lowerQuery = query.toLowerCase();
      const filtered = response.documents.filter(
        (session: any) =>
          session.title.toLowerCase().includes(lowerQuery) ||
          session.description?.toLowerCase().includes(lowerQuery) ||
          session.tags?.some((tag: string) => tag.toLowerCase().includes(lowerQuery))
      );

      return filtered as unknown as Session[];
    } catch (error) {
      console.error('[SessionsService] Error searching sessions:', error);
      throw error;
    }
  }

  /**
   * Filter sessions by type
   */
  static async getSessionsByType(
    eventId: string,
    type: string
  ): Promise<Session[]> {
    try {
      const response = await databases.listDocuments(
        this.dbId,
        this.collectionId,
        [
          Query.equal('eventId', eventId),
          Query.equal('type', type),
          Query.orderAsc('startTime'),
          Query.limit(1000),
        ]
      );

      return response.documents as unknown as Session[];
    } catch (error) {
      console.error('[SessionsService] Error fetching sessions by type:', error);
      throw error;
    }
  }

  /**
   * Filter sessions by track
   */
  static async getSessionsByTrack(
    eventId: string,
    track: string
  ): Promise<Session[]> {
    try {
      const response = await databases.listDocuments(
        this.dbId,
        this.collectionId,
        [
          Query.equal('eventId', eventId),
          Query.equal('track', track),
          Query.orderAsc('startTime'),
          Query.limit(1000),
        ]
      );

      return response.documents as unknown as Session[];
    } catch (error) {
      console.error('[SessionsService] Error fetching sessions by track:', error);
      throw error;
    }
  }

  /**
   * Get sessions by speaker
   */
  static async getSessionsBySpeaker(
    eventId: string,
    speakerId: string
  ): Promise<Session[]> {
    try {
      const response = await databases.listDocuments(
        this.dbId,
        this.collectionId,
        [
          Query.equal('eventId', eventId),
          Query.search('speakerIds', speakerId),
          Query.orderAsc('startTime'),
          Query.limit(1000),
        ]
      );

      return response.documents as unknown as Session[];
    } catch (error) {
      console.error('[SessionsService] Error fetching sessions by speaker:', error);
      throw error;
    }
  }

  /**
   * Get upcoming sessions (next 24 hours)
   */
  static async getUpcomingSessions(
    eventId: string,
    limit = 10
  ): Promise<Session[]> {
    try {
      const now = new Date().toISOString();
      const next24Hours = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

      const response = await databases.listDocuments(
        this.dbId,
        this.collectionId,
        [
          Query.equal('eventId', eventId),
          Query.greaterThan('startTime', now),
          Query.lessThan('startTime', next24Hours),
          Query.orderAsc('startTime'),
          Query.limit(limit),
        ]
      );

      return response.documents as unknown as Session[];
    } catch (error) {
      console.error('[SessionsService] Error fetching upcoming sessions:', error);
      throw error;
    }
  }

  /**
   * Create a new session (admin/organizer only)
   */
  static async createSession(sessionData: Partial<Session>): Promise<Session> {
    try {
      const response = await databases.createDocument(
        this.dbId,
        this.collectionId,
        ID.unique(),
        {
          ...sessionData,
          currentAttendees: sessionData.currentAttendees || 0,
          isFeatured: sessionData.isFeatured || false,
          status: sessionData.status || 'scheduled',
        }
      );

      return response as unknown as Session;
    } catch (error) {
      console.error('[SessionsService] Error creating session:', error);
      throw error;
    }
  }

  /**
   * Update a session (admin/organizer only)
   */
  static async updateSession(
    sessionId: string,
    sessionData: Partial<Session>
  ): Promise<Session> {
    try {
      const response = await databases.updateDocument(
        this.dbId,
        this.collectionId,
        sessionId,
        sessionData
      );

      return response as unknown as Session;
    } catch (error) {
      console.error('[SessionsService] Error updating session:', error);
      throw error;
    }
  }

  /**
   * Delete a session (admin only)
   */
  static async deleteSession(sessionId: string): Promise<void> {
    try {
      await databases.deleteDocument(this.dbId, this.collectionId, sessionId);
    } catch (error) {
      console.error('[SessionsService] Error deleting session:', error);
      throw error;
    }
  }

  /**
   * Increment attendee count for a session
   */
  static async incrementAttendees(sessionId: string): Promise<Session> {
    try {
      const session = await this.getSessionById(sessionId);
      return await this.updateSession(sessionId, {
        currentAttendees: session.currentAttendees + 1,
      });
    } catch (error) {
      console.error('[SessionsService] Error incrementing attendees:', error);
      throw error;
    }
  }

  /**
   * Decrement attendee count for a session
   */
  static async decrementAttendees(sessionId: string): Promise<Session> {
    try {
      const session = await this.getSessionById(sessionId);
      return await this.updateSession(sessionId, {
        currentAttendees: Math.max(0, session.currentAttendees - 1),
      });
    } catch (error) {
      console.error('[SessionsService] Error decrementing attendees:', error);
      throw error;
    }
  }
}
