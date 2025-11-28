import { useAuth } from '@/hooks/useAuth';
import { Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';

/**
 * Entry point of the app
 * Redirects to appropriate screen based on auth state
 */
export default function Index() {
  const { isAuthenticated: isSignedIn, loading } = useAuth();

  // Show loading while checking auth state
  if (loading) {
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
