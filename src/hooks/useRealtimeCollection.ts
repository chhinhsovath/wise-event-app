import { useEffect, useState, useCallback } from 'react';
import { client } from '@/services/appwrite';

/**
 * Realtime Collection Hook
 * Subscribes to Appwrite realtime updates for a collection
 *
 * Usage:
 * const { subscribe, unsubscribe } = useRealtimeCollection(
 *   'main',
 *   'polls',
 *   (payload) => {
 *     console.log('Realtime update:', payload);
 *     // Handle create, update, delete events
 *   }
 * );
 */

type RealtimeEvent = 'create' | 'update' | 'delete';

interface RealtimePayload {
  events: string[];
  channels: string[];
  timestamp: string;
  payload: any;
}

interface UseRealtimeCollectionOptions {
  enabled?: boolean; // Default: true
  events?: RealtimeEvent[]; // Default: ['create', 'update', 'delete']
  documentId?: string; // Optional: Subscribe to specific document
}

export function useRealtimeCollection(
  databaseId: string,
  collectionId: string,
  onUpdate: (payload: RealtimePayload) => void,
  options: UseRealtimeCollectionOptions = {}
) {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    enabled = true,
    events = ['create', 'update', 'delete'],
    documentId,
  } = options;

  const subscribe = useCallback(() => {
    if (!enabled) return;

    try {
      // Build channel string
      let channel = `databases.${databaseId}.collections.${collectionId}.documents`;

      if (documentId) {
        channel = `${channel}.${documentId}`;
      }

      console.log('[Realtime] Subscribing to:', channel);

      // Subscribe to realtime updates
      const unsubscribe = client.subscribe(channel, (response: any) => {
        const eventType = getEventType(response.events);

        // Filter by requested event types
        if (eventType && events.includes(eventType)) {
          console.log('[Realtime] Event received:', eventType, response);
          onUpdate(response);
        }
      });

      setIsSubscribed(true);
      setError(null);

      return unsubscribe;
    } catch (err: any) {
      console.error('[Realtime] Subscription error:', err);
      setError(err.message || 'Failed to subscribe to realtime updates');
      setIsSubscribed(false);
    }
  }, [databaseId, collectionId, documentId, enabled, events, onUpdate]);

  const unsubscribe = useCallback(() => {
    console.log('[Realtime] Unsubscribing from collection:', collectionId);
    setIsSubscribed(false);
  }, [collectionId]);

  useEffect(() => {
    if (!enabled) return;

    const unsubscribeFn = subscribe();

    return () => {
      if (unsubscribeFn) {
        unsubscribeFn();
      }
      unsubscribe();
    };
  }, [subscribe, unsubscribe, enabled]);

  return {
    isSubscribed,
    error,
    subscribe,
    unsubscribe,
  };
}

/**
 * Extract event type from Appwrite event strings
 */
function getEventType(events: string[]): RealtimeEvent | null {
  for (const event of events) {
    if (event.includes('.create')) return 'create';
    if (event.includes('.update')) return 'update';
    if (event.includes('.delete')) return 'delete';
  }
  return null;
}

/**
 * Hook for subscribing to specific document updates
 */
export function useRealtimeDocument(
  databaseId: string,
  collectionId: string,
  documentId: string,
  onUpdate: (payload: RealtimePayload) => void,
  options: Omit<UseRealtimeCollectionOptions, 'documentId'> = {}
) {
  return useRealtimeCollection(databaseId, collectionId, onUpdate, {
    ...options,
    documentId,
  });
}

/**
 * Hook for polls realtime updates
 */
export function useRealtimePolls(
  sessionId: string,
  onUpdate: (payload: RealtimePayload) => void,
  enabled: boolean = true
) {
  return useRealtimeCollection('main', 'polls', onUpdate, {
    enabled,
    events: ['create', 'update', 'delete'],
  });
}

/**
 * Hook for questions (Q&A) realtime updates
 */
export function useRealtimeQuestions(
  sessionId: string,
  onUpdate: (payload: RealtimePayload) => void,
  enabled: boolean = true
) {
  return useRealtimeCollection('main', 'questions', onUpdate, {
    enabled,
    events: ['create', 'update', 'delete'],
  });
}

/**
 * Hook for check-ins realtime updates
 */
export function useRealtimeCheckIns(
  sessionId: string,
  onUpdate: (payload: RealtimePayload) => void,
  enabled: boolean = true
) {
  return useRealtimeCollection('main', 'checkins', onUpdate, {
    enabled,
    events: ['create', 'update'],
  });
}

/**
 * Hook for messages realtime updates
 */
export function useRealtimeMessages(
  conversationId: string,
  onUpdate: (payload: RealtimePayload) => void,
  enabled: boolean = true
) {
  return useRealtimeDocument('main', 'messages', conversationId, onUpdate, {
    enabled,
    events: ['create'],
  });
}
