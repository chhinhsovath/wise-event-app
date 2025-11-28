import { useAuth } from '@clerk/clerk-expo';
import { Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';

/**
 * Entry point of the app
 * Redirects to appropriate screen based on auth state
 */
export default function Index() {
  const { isSignedIn, isLoaded } = useAuth();

  // Show loading while checking auth state
  if (!isLoaded) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  // Redirect based on auth state
  if (isSignedIn) {
    return <Redirect href="/(app)/(tabs)" />;
  }

  return <Redirect href="/(auth)/sign-in" />;
}
