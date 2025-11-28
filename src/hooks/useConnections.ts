import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-expo';
import { Connection } from '@/types';
import { ConnectionsService, NotificationsService } from '@/services';

/**
 * Connections Hook
 * Manages user connections and connection requests with Appwrite integration
 */

export function useConnections() {
  const { user } = useUser();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);

  // Load connections from Appwrite on mount
  useEffect(() => {
    loadConnections();
  }, [user?.id]);

  const loadConnections = async () => {
    if (!user) {
      setLoading(false);
      setConnections([]);
      setPendingRequests([]);
      return;
    }

    try {
      setLoading(true);

      const [accepted, pending] = await Promise.all([
        ConnectionsService.getUserConnections(user.id),
        ConnectionsService.getPendingRequests(user.id),
      ]);

      setConnections(accepted);
      setPendingRequests(pending);
    } catch (error) {
      console.error('[Connections] Error loading connections:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendConnectionRequest = async (recipientId: string, recipientName?: string, message?: string) => {
    if (!user) {
      console.warn('[Connections] User not authenticated');
      throw new Error('User not authenticated');
    }

    try {
      // Create connection in Appwrite
      await ConnectionsService.sendConnectionRequest(user.id, recipientId, message);

      // Send notification to recipient
      try {
        const requesterName = user.fullName || user.firstName || 'Someone';
        await NotificationsService.createConnectionRequestNotification(
          recipientId,
          requesterName,
          ''  // Connection ID not needed for notification
        );
        console.log('[Connections] Sent connection request notification');
      } catch (error) {
        console.error('[Connections] Error sending notification:', error);
      }

      // Reload connections
      await loadConnections();
    } catch (error: any) {
      console.error('[Connections] Error sending connection request:', error);
      throw error;
    }
  };

  const acceptConnection = async (connectionId: string) => {
    if (!user) return;

    try {
      // Accept in Appwrite
      await ConnectionsService.acceptConnectionRequest(connectionId);

      // Find the connection to get requester ID
      const connection = pendingRequests.find((conn) => conn.$id === connectionId);

      // Send notification to requester
      if (connection) {
        try {
          const accepterName = user.fullName || user.firstName || 'Someone';
          await NotificationsService.createConnectionAcceptedNotification(
            connection.user1Id,  // Requester ID
            accepterName,
            connectionId
          );
          console.log('[Connections] Sent connection accepted notification');
        } catch (error) {
          console.error('[Connections] Error sending notification:', error);
        }
      }

      // Reload connections
      await loadConnections();
    } catch (error: any) {
      console.error('[Connections] Error accepting connection:', error);
      throw error;
    }
  };

  const declineConnection = async (connectionId: string) => {
    try {
      await ConnectionsService.declineConnectionRequest(connectionId);
      await loadConnections();
    } catch (error: any) {
      console.error('[Connections] Error declining connection:', error);
      throw error;
    }
  };

  const removeConnection = async (connectionId: string) => {
    try {
      await ConnectionsService.removeConnection(connectionId);
      await loadConnections();
    } catch (error: any) {
      console.error('[Connections] Error removing connection:', error);
      throw error;
    }
  };

  // Check if connected to a user
  const isConnected = (userId: string): boolean => {
    if (!user) return false;
    return connections.some(
      (conn) =>
        (conn.user1Id === userId || conn.user2Id === userId) &&
        conn.status === 'accepted'
    );
  };

  // Check if there's a pending request
  const hasPendingRequest = (userId: string): boolean => {
    if (!user) return false;
    return pendingRequests.some(
      (conn) =>
        conn.user1Id === userId || conn.user2Id === userId
    );
  };

  return {
    connections,
    pendingRequests,
    sendConnectionRequest,
    acceptConnection,
    declineConnection,
    removeConnection,
    isConnected,
    hasPendingRequest,
    refreshConnections: loadConnections,
    loading,
  };
}
