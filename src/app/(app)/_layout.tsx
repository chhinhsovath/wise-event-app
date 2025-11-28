import { useAuth } from '@clerk/clerk-expo';
import { Redirect, Stack } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { Text } from 'react-native-paper';
import { useUserSync } from '@/hooks/useUserSync';

/**
 * Protected app layout
 * Requires authentication via Clerk
 * Automatically syncs user to Appwrite
 */
export default function AppLayout() {
  const { isSignedIn, isLoaded } = useAuth();
  const { synced, error } = useUserSync();

  // Show loading while checking auth state
  if (!isLoaded) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="mt-4 text-gray-600">Loading...</Text>
      </View>
    );
  }

  // Redirect to sign-in if not authenticated
  if (!isSignedIn) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  // Show sync status (optional - can be removed for production)
  if (isSignedIn && !synced && !error) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="mt-4 text-gray-600">Syncing profile...</Text>
      </View>
    );
  }

  // Show error if sync failed (gracefully continue to app)
  if (error) {
    console.warn('[AppLayout] User sync error:', error);
    // Continue to app anyway - sync will retry on next launch
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="session/[id]" />
      <Stack.Screen name="speaker/[id]" />
      <Stack.Screen name="attendee/[id]" />
      <Stack.Screen name="chat/[conversationId]" />
    </Stack>
  );
}
