import { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-expo';
import { databases, client } from '@/services/appwrite';
import { APPWRITE_DATABASE_ID, COLLECTIONS } from '@/lib/constants';
import { ID, Query } from 'react-native-appwrite';

/**
 * User Sync Hook
 * Automatically syncs Clerk user to Appwrite database
 * This is CRITICAL for the Clerk + Appwrite hybrid architecture
 */
export function useUserSync() {
  const { user, isSignedIn } = useUser();
  const [synced, setSynced] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isSignedIn && user && !synced) {
      syncUserToAppwrite();
    }
  }, [isSignedIn, user, synced]);

  const syncUserToAppwrite = async () => {
    if (!user) return;

    try {
      console.log('[UserSync] Starting sync for user:', user.id);

      // Check if user already exists in Appwrite
      const existingUsers = await databases.listDocuments(
        APPWRITE_DATABASE_ID,
        COLLECTIONS.USERS,
        [Query.equal('clerkUserId', user.id)]
      );

      if (existingUsers.documents.length > 0) {
        // User exists, update profile
        console.log('[UserSync] User exists, updating...', existingUsers.documents[0].$id);

        await databases.updateDocument(
          APPWRITE_DATABASE_ID,
          COLLECTIONS.USERS,
          existingUsers.documents[0].$id,
          {
            email: user.primaryEmailAddress?.emailAddress || '',
            fullName: user.fullName || '',
            avatar: user.imageUrl || '',
            updatedAt: new Date().toISOString(),
          }
        );

        console.log('[UserSync] User updated successfully');
      } else {
        // User doesn't exist, create new profile
        console.log('[UserSync] Creating new user profile...');

        await databases.createDocument(
          APPWRITE_DATABASE_ID,
          COLLECTIONS.USERS,
          ID.unique(),
          {
            clerkUserId: user.id,
            email: user.primaryEmailAddress?.emailAddress || '',
            fullName: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
            avatar: user.imageUrl || '',
            role: 'attendee', // Default role
            isPublic: true,
            points: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
        );

        console.log('[UserSync] User created successfully');
      }

      setSynced(true);
      setError(null);
    } catch (err: any) {
      console.error('[UserSync] Sync error:', err);

      // If error is 404 (collection doesn't exist), provide helpful message
      if (err.code === 404) {
        setError('Database not configured. Please set up Appwrite collections.');
      } else if (err.code === 401) {
        setError('Database authentication failed. Check Appwrite configuration.');
      } else {
        setError('Failed to sync user profile');
      }
    }
  };

  return {
    synced,
    error,
    retry: () => {
      setSynced(false);
      setError(null);
    },
  };
}
