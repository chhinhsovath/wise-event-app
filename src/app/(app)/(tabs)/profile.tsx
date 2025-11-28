import { useState } from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { useUser, useAuth } from '@clerk/clerk-expo';
import { Button, Avatar, Card, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useUserProfile } from '@/hooks/useUserProfile';

/**
 * User Profile Screen
 * Shows user info and app settings with Appwrite integration
 */
export default function Profile() {
  const { user } = useUser();
  const { signOut } = useAuth();
  const { profile, loading, error, refreshProfile } = useUserProfile();
  const [refreshing, setRefreshing] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/(auth)/sign-in');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshProfile();
    setRefreshing(false);
  };

  // Loading state
  if (loading && !refreshing) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#6366f1" />
          <Text className="mt-4 text-gray-600">Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error && !profile) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center p-4">
          <MaterialCommunityIcons name="alert-circle" size={64} color="#ef4444" />
          <Text className="mt-4 text-lg font-semibold text-gray-900">Error Loading Profile</Text>
          <Text className="mt-2 text-center text-gray-600">{error}</Text>
          <Button mode="contained" onPress={refreshProfile} className="mt-4">
            Retry
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      <View className="p-6">
        {/* Profile Header */}
        <Card className="mb-6">
          <Card.Content className="items-center py-8">
            <Avatar.Image
              size={80}
              source={{ uri: profile?.avatar || user?.imageUrl }}
              style={{ marginBottom: 16 }}
            />
            <Text className="text-2xl font-bold mb-1">
              {profile?.fullName || user?.fullName || 'User'}
            </Text>
            <Text className="text-gray-600">
              {profile?.email || user?.primaryEmailAddress?.emailAddress}
            </Text>
            {profile?.role && (
              <Text className="text-sm text-primary font-semibold mt-2 capitalize">
                {profile.role}
              </Text>
            )}
            {profile?.organization && (
              <Text className="text-sm text-gray-500 mt-1">
                {profile.organization}
              </Text>
            )}
          </Card.Content>
        </Card>

        {/* Menu Items */}
        <View className="gap-3 mb-6">
          <Button
            mode="outlined"
            icon="bookmark"
            onPress={() => router.push('/(app)/(tabs)/agenda')}
          >
            My Bookmarks
          </Button>
          <Button
            mode="outlined"
            icon="account-group"
            onPress={() => router.push('/(app)/network/connections')}
          >
            My Connections
          </Button>
          <Button
            mode="outlined"
            icon="bell"
            onPress={() => router.push('/(app)/notifications')}
          >
            Notifications
          </Button>
          <Button
            mode="outlined"
            icon="cog"
            onPress={() => router.push('/(app)/settings/notifications')}
          >
            Settings
          </Button>
        </View>

        {/* Sign Out */}
        <Button
          mode="contained"
          onPress={handleSignOut}
          buttonColor="#ef4444"
        >
          Sign Out
        </Button>
      </View>
    </ScrollView>
  );
}
