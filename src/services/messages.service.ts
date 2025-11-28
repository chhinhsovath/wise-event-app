import { ID, Query } from 'react-native-appwrite';
import { databases } from './appwrite';
import { APPWRITE_DATABASE_ID, COLLECTIONS } from '@/lib/constants';
import { Message } from '@/types';

/**
 * Messages Service
 * Handles all messaging/chat operations with Appwrite
 */

export class MessagesService {
  private static dbId = APPWRITE_DATABASE_ID;
  private static collectionId = COLLECTIONS.MESSAGES;

  /**
   * Get messages for a conversation
   */
  static async getConversationMessages(
    conversationId: string,
    limit = 50
  ): Promise<Message[]> {
    try {
      const response = await databases.listDocuments(
        this.dbId,
        this.collectionId,
        [
          Query.equal('conversationId', conversationId),
          Query.orderDesc('$createdAt'),
          Query.limit(limit),
        ]
      );

      // Reverse to show oldest first
      return response.documents.reverse() as unknown as Message[];
    } catch (error) {
      console.error('[MessagesService] Error fetching messages:', error);
      throw error;
    }
  }

  /**
   * Send a message
   */
  static async sendMessage(
    conversationId: string,
    senderId: string,
    recipientId: string,
    content: string,
    type: 'text' | 'image' | 'file' = 'text'
  ): Promise<Message> {
    try {
      const response = await databases.createDocument(
        this.dbId,
        this.collectionId,
        ID.unique(),
        {
          conversationId,
          senderId,
          recipientId,
          content,
          type,
          isRead: false,
        }
      );

      return response as unknown as Message;
    } catch (error) {
      console.error('[MessagesService] Error sending message:', error);
      throw error;
    }
  }

  /**
   * Mark message as read
   */
  static async markMessageAsRead(messageId: string): Promise<Message> {
    try {
      const response = await databases.updateDocument(
        this.dbId,
        this.collectionId,
        messageId,
        {
          isRead: true,
        }
      );

      return response as unknown as Message;
    } catch (error) {
      console.error('[MessagesService] Error marking message as read:', error);
      throw error;
    }
  }

  /**
   * Mark all messages in conversation as read
   */
  static async markConversationAsRead(
    conversationId: string,
    userId: string
  ): Promise<void> {
    try {
      // Get unread messages
      const response = await databases.listDocuments(
        this.dbId,
        this.collectionId,
        [
          Query.equal('conversationId', conversationId),
          Query.equal('recipientId', userId),
          Query.equal('isRead', false),
          Query.limit(1000),
        ]
      );

      // Mark all as read
      await Promise.all(
        response.documents.map((message) => this.markMessageAsRead(message.$id))
      );
    } catch (error) {
      console.error('[MessagesService] Error marking conversation as read:', error);
      throw error;
    }
  }

  /**
   * Get unread message count for a conversation
   */
  static async getUnreadCount(
    conversationId: string,
    userId: string
  ): Promise<number> {
    try {
      const response = await databases.listDocuments(
        this.dbId,
        this.collectionId,
        [
          Query.equal('conversationId', conversationId),
          Query.equal('recipientId', userId),
          Query.equal('isRead', false),
          Query.limit(1),
        ]
      );

      return response.total;
    } catch (error) {
      console.error('[MessagesService] Error fetching unread count:', error);
      return 0;
    }
  }

  /**
   * Get total unread messages for a user
   */
  static async getTotalUnreadCount(userId: string): Promise<number> {
    try {
      const response = await databases.listDocuments(
        this.dbId,
        this.collectionId,
        [
          Query.equal('recipientId', userId),
          Query.equal('isRead', false),
          Query.limit(1),
        ]
      );

      return response.total;
    } catch (error) {
      console.error('[MessagesService] Error fetching total unread count:', error);
      return 0;
    }
  }

  /**
   * Delete a message
   */
  static async deleteMessage(messageId: string): Promise<void> {
    try {
      await databases.deleteDocument(this.dbId, this.collectionId, messageId);
    } catch (error) {
      console.error('[MessagesService] Error deleting message:', error);
      throw error;
    }
  }

  /**
   * Delete all messages in a conversation
   */
  static async deleteConversationMessages(conversationId: string): Promise<void> {
    try {
      const messages = await this.getConversationMessages(conversationId, 1000);

      await Promise.all(
        messages.map((message) => this.deleteMessage(message.$id))
      );
    } catch (error) {
      console.error('[MessagesService] Error deleting conversation messages:', error);
      throw error;
    }
  }

  /**
   * Search messages in a conversation
   */
  static async searchMessagesInConversation(
    conversationId: string,
    query: string
  ): Promise<Message[]> {
    try {
      // Note: Client-side filtering for now
      const messages = await this.getConversationMessages(conversationId, 1000);

      const lowerQuery = query.toLowerCase();
      return messages.filter((message) =>
        message.content.toLowerCase().includes(lowerQuery)
      );
    } catch (error) {
      console.error('[MessagesService] Error searching messages:', error);
      throw error;
    }
  }

  /**
   * Get latest message in conversation
   */
  static async getLatestMessage(conversationId: string): Promise<Message | null> {
    try {
      const response = await databases.listDocuments(
        this.dbId,
        this.collectionId,
        [
          Query.equal('conversationId', conversationId),
          Query.orderDesc('$createdAt'),
          Query.limit(1),
        ]
      );

      return response.documents.length > 0
        ? (response.documents[0] as unknown as Message)
        : null;
    } catch (error) {
      console.error('[MessagesService] Error fetching latest message:', error);
      return null;
    }
  }
}
