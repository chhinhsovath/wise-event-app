import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-expo';
import { UsersService } from '@/services';
import { UserProfile } from '@/types';

/**
 * Hook for managing user profile data from Appwrite
 * Syncs with Clerk authentication and provides update functionality
 */
export function useUserProfile() {
  const { user } = useUser();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Try to get existing profile from Appwrite
      let userProfile = await UsersService.getUserByClerkId(user.id);

      // If not found, create profile from Clerk data
      if (!userProfile) {
        console.log('[useUserProfile] Profile not found, syncing from Clerk...');
        userProfile = await UsersService.syncUserFromClerk(user.id);
      }

      setProfile(userProfile);
    } catch (err: any) {
      console.error('[useUserProfile] Error loading profile:', err);
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user || !profile) {
      throw new Error('No user or profile available');
    }

    try {
      const updated = await UsersService.updateUserProfile(user.id, updates);
      setProfile(updated);
      return updated;
    } catch (err: any) {
      console.error('[useUserProfile] Error updating profile:', err);
      throw err;
    }
  };

  return {
    profile,
    loading,
    error,
    updateProfile,
    refreshProfile: loadProfile,
  };
}
