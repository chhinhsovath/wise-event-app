import { ID, Query } from 'react-native-appwrite';
import { databases } from './appwrite';
import { APPWRITE_DATABASE_ID, COLLECTIONS } from '@/lib/constants';
import { Connection } from '@/types';

/**
 * Connections Service
 * Handles all connection/networking operations with Appwrite
 */

export class ConnectionsService {
  private static dbId = APPWRITE_DATABASE_ID;
  private static collectionId = COLLECTIONS.CONNECTIONS;

  /**
   * Get all connections for a user (sent or received)
   */
  static async getUserConnections(clerkUserId: string): Promise<Connection[]> {
    try {
      const response = await databases.listDocuments(
        this.dbId,
        this.collectionId,
        [
          Query.or([
            Query.equal('requesterId', clerkUserId),
            Query.equal('recipientId', clerkUserId),
          ]),
          Query.orderDesc('$createdAt'),
          Query.limit(1000),
        ]
      );

      return response.documents as unknown as Connection[];
    } catch (error) {
      console.error('[ConnectionsService] Error fetching user connections:', error);
      throw error;
    }
  }

  /**
   * Get accepted connections only
   */
  static async getAcceptedConnections(clerkUserId: string): Promise<Connection[]> {
    try {
      const response = await databases.listDocuments(
        this.dbId,
        this.collectionId,
        [
          Query.or([
            Query.equal('requesterId', clerkUserId),
            Query.equal('recipientId', clerkUserId),
          ]),
          Query.equal('status', 'accepted'),
          Query.orderDesc('$createdAt'),
          Query.limit(1000),
        ]
      );

      return response.documents as unknown as Connection[];
    } catch (error) {
      console.error('[ConnectionsService] Error fetching accepted connections:', error);
      throw error;
    }
  }

  /**
   * Get pending requests received by user
   */
  static async getPendingRequests(clerkUserId: string): Promise<Connection[]> {
    try {
      const response = await databases.listDocuments(
        this.dbId,
        this.collectionId,
        [
          Query.equal('recipientId', clerkUserId),
          Query.equal('status', 'pending'),
          Query.orderDesc('$createdAt'),
          Query.limit(100),
        ]
      );

      return response.documents as unknown as Connection[];
    } catch (error) {
      console.error('[ConnectionsService] Error fetching pending requests:', error);
      throw error;
    }
  }

  /**
   * Get pending requests sent by user
   */
  static async getSentRequests(clerkUserId: string): Promise<Connection[]> {
    try {
      const response = await databases.listDocuments(
        this.dbId,
        this.collectionId,
        [
          Query.equal('requesterId', clerkUserId),
          Query.equal('status', 'pending'),
          Query.orderDesc('$createdAt'),
          Query.limit(100),
        ]
      );

      return response.documents as unknown as Connection[];
    } catch (error) {
      console.error('[ConnectionsService] Error fetching sent requests:', error);
      throw error;
    }
  }

  /**
   * Check if connection exists between two users
   */
  static async getConnectionBetweenUsers(
    userId1: string,
    userId2: string
  ): Promise<Connection | null> {
    try {
      const response = await databases.listDocuments(
        this.dbId,
        this.collectionId,
        [
          Query.or([
            Query.and([
              Query.equal('requesterId', userId1),
              Query.equal('recipientId', userId2),
            ]),
            Query.and([
              Query.equal('requesterId', userId2),
              Query.equal('recipientId', userId1),
            ]),
          ]),
          Query.limit(1),
        ]
      );

      return response.documents.length > 0
        ? (response.documents[0] as unknown as Connection)
        : null;
    } catch (error) {
      console.error(
        '[ConnectionsService] Error checking connection between users:',
        error
      );
      return null;
    }
  }

  /**
   * Check if two users are connected
   */
  static async areUsersConnected(
    userId1: string,
    userId2: string
  ): Promise<boolean> {
    try {
      const connection = await this.getConnectionBetweenUsers(userId1, userId2);
      return connection?.status === 'accepted';
    } catch (error) {
      console.error('[ConnectionsService] Error checking if users connected:', error);
      return false;
    }
  }

  /**
   * Send connection request
   */
  static async sendConnectionRequest(
    requesterId: string,
    recipientId: string,
    message?: string
  ): Promise<Connection> {
    try {
      // Check if connection already exists
      const existing = await this.getConnectionBetweenUsers(requesterId, recipientId);
      if (existing) {
        console.log('[ConnectionsService] Connection already exists');
        return existing;
      }

      const response = await databases.createDocument(
        this.dbId,
        this.collectionId,
        ID.unique(),
        {
          requesterId,
          recipientId,
          status: 'pending',
          message: message || '',
        }
      );

      return response as unknown as Connection;
    } catch (error) {
      console.error('[ConnectionsService] Error sending connection request:', error);
      throw error;
    }
  }

  /**
   * Accept connection request
   */
  static async acceptConnection(connectionId: string): Promise<Connection> {
    try {
      const response = await databases.updateDocument(
        this.dbId,
        this.collectionId,
        connectionId,
        {
          status: 'accepted',
        }
      );

      return response as unknown as Connection;
    } catch (error) {
      console.error('[ConnectionsService] Error accepting connection:', error);
      throw error;
    }
  }

  /**
   * Decline connection request
   */
  static async declineConnection(connectionId: string): Promise<Connection> {
    try {
      const response = await databases.updateDocument(
        this.dbId,
        this.collectionId,
        connectionId,
        {
          status: 'declined',
        }
      );

      return response as unknown as Connection;
    } catch (error) {
      console.error('[ConnectionsService] Error declining connection:', error);
      throw error;
    }
  }

  /**
   * Remove connection (unfriend)
   */
  static async removeConnection(connectionId: string): Promise<void> {
    try {
      await databases.deleteDocument(this.dbId, this.collectionId, connectionId);
    } catch (error) {
      console.error('[ConnectionsService] Error removing connection:', error);
      throw error;
    }
  }

  /**
   * Remove connection by user IDs
   */
  static async removeConnectionByUsers(
    userId1: string,
    userId2: string
  ): Promise<void> {
    try {
      const connection = await this.getConnectionBetweenUsers(userId1, userId2);
      if (connection) {
        await this.removeConnection(connection.$id);
      }
    } catch (error) {
      console.error('[ConnectionsService] Error removing connection by users:', error);
      throw error;
    }
  }

  /**
   * Get connection count for a user
   */
  static async getConnectionCount(clerkUserId: string): Promise<number> {
    try {
      const response = await databases.listDocuments(
        this.dbId,
        this.collectionId,
        [
          Query.or([
            Query.equal('requesterId', clerkUserId),
            Query.equal('recipientId', clerkUserId),
          ]),
          Query.equal('status', 'accepted'),
          Query.limit(1),
        ]
      );

      return response.total;
    } catch (error) {
      console.error('[ConnectionsService] Error fetching connection count:', error);
      return 0;
    }
  }

  /**
   * Get pending requests count
   */
  static async getPendingRequestsCount(clerkUserId: string): Promise<number> {
    try {
      const response = await databases.listDocuments(
        this.dbId,
        this.collectionId,
        [
          Query.equal('recipientId', clerkUserId),
          Query.equal('status', 'pending'),
          Query.limit(1),
        ]
      );

      return response.total;
    } catch (error) {
      console.error(
        '[ConnectionsService] Error fetching pending requests count:',
        error
      );
      return 0;
    }
  }
}
