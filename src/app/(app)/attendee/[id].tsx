import { View, ScrollView, Image, Pressable, Linking } from 'react-native';
import { Text, Button, Chip, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { getAttendeeById, hasConnectionRequest, mockSessions } from '@/lib/mockData';
import { useUser } from '@clerk/clerk-expo';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';

/**
 * Attendee Profile Screen
 * Shows attendee details, interests, and allows connecting
 */
export default function AttendeeProfile() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useUser();
  const [connectionStatus, setConnectionStatus] = useState<'none' | 'pending' | 'connected'>('none');

  // Get attendee data
  const attendee = getAttendeeById(id);

  // Check if already connected
  const existingConnection = user ? hasConnectionRequest(user.id, id) : undefined;
  const actualStatus = existingConnection
    ? existingConnection.status === 'accepted'
      ? 'connected'
      : 'pending'
    : connectionStatus;

  // Get sessions this attendee might be interested in (demo - could be bookmarks in real app)
  const attendeeSessions = mockSessions.slice(0, 2); // Demo: showing first 2 sessions

  if (!attendee) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
        <Stack.Screen
          options={{
            title: 'Attendee Not Found',
            headerShown: true,
            headerBackTitle: 'Back',
          }}
        />
        <View className="flex-1 items-center justify-center p-6">
          <Text className="text-lg text-gray-600 text-center">
            Attendee not found
          </Text>
          <Button mode="contained" onPress={() => router.back()} className="mt-4">
            Go Back
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  const handleConnect = () => {
    // TODO: Implement actual connection request
    setConnectionStatus('pending');
    console.log('[Attendee] Sending connection request to:', attendee.fullName);
  };

  const handleMessage = () => {
    // TODO: Navigate to chat screen
    console.log('[Attendee] Open chat with:', attendee.fullName);
    router.push(`/(app)/chat/demo-conversation-${attendee.$id}` as any);
  };

  const handleSocialLink = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      }
    } catch (error) {
      console.error('[Attendee] Error opening URL:', error);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <Stack.Screen
        options={{
          title: attendee.fullName,
          headerShown: true,
          headerBackTitle: 'Back',
        }}
      />

      <ScrollView>
        <View className="bg-white">
          {/* Profile Header */}
          <View className="items-center p-6">
            {/* Avatar */}
            {attendee.avatar ? (
              <Image
                source={{ uri: attendee.avatar }}
                className="w-32 h-32 rounded-full mb-4"
                resizeMode="cover"
              />
            ) : (
              <View className="w-32 h-32 rounded-full bg-primary-100 items-center justify-center mb-4">
                <Text className="text-4xl text-primary-600">
                  {attendee.fullName.charAt(0)}
                </Text>
              </View>
            )}

            {/* Name & Title */}
            <Text className="text-2xl font-bold text-center mb-1">
              {attendee.fullName}
            </Text>
            <Text className="text-base text-gray-600 text-center">
              {attendee.title}
            </Text>
            {attendee.organization && (
              <Text className="text-base text-gray-500 text-center mt-1">
                {attendee.organization}
              </Text>
            )}

            {/* Badges */}
            {attendee.badges && attendee.badges.length > 0 && (
              <View className="flex-row flex-wrap gap-2 mt-3 justify-center">
                {attendee.badges.map((badge, index) => (
                  <Chip key={index} icon="medal" mode="flat">
                    {badge}
                  </Chip>
                ))}
              </View>
            )}

            {/* Action Buttons */}
            <View className="flex-row gap-3 mt-4 w-full">
              {actualStatus === 'none' && (
                <Button
                  mode="contained"
                  icon="account-plus"
                  onPress={handleConnect}
                  className="flex-1"
                >
                  Connect
                </Button>
              )}
              {actualStatus === 'pending' && (
                <Button mode="outlined" icon="clock-outline" className="flex-1" disabled>
                  Request Pending
                </Button>
              )}
              {actualStatus === 'connected' && (
                <>
                  <Button mode="contained" icon="message" onPress={handleMessage} className="flex-1">
                    Message
                  </Button>
                  <Button mode="outlined" icon="account-check" disabled>
                    Connected
                  </Button>
                </>
              )}
            </View>
          </View>

          <Divider />

          {/* Bio Section */}
          {attendee.bio && (
            <View className="p-6">
              <Text className="text-lg font-bold mb-3">About</Text>
              <Text className="text-base text-gray-700 leading-6">
                {attendee.bio}
              </Text>
            </View>
          )}

          {/* Interests Section */}
          {attendee.interests && attendee.interests.length > 0 && (
            <>
              <Divider />
              <View className="p-6">
                <Text className="text-lg font-bold mb-3">Interests</Text>
                <View className="flex-row flex-wrap gap-2">
                  {attendee.interests.map((interest, index) => (
                    <Chip key={index} mode="outlined" icon="tag">
                      {interest}
                    </Chip>
                  ))}
                </View>
              </View>
            </>
          )}

          {/* Social Links Section */}
          {attendee.socialLinks && Object.keys(attendee.socialLinks).length > 0 && (
            <>
              <Divider />
              <View className="p-6">
                <Text className="text-lg font-bold mb-3">Connect</Text>
                <View className="flex-row flex-wrap gap-3">
                  {attendee.socialLinks.twitter && (
                    <Pressable
                      onPress={() => handleSocialLink(attendee.socialLinks!.twitter!)}
                      className="flex-row items-center bg-blue-50 px-4 py-2 rounded-lg"
                    >
                      <MaterialCommunityIcons
                        name="twitter"
                        size={20}
                        color="#1DA1F2"
                      />
                      <Text className="ml-2 text-blue-600 font-medium">Twitter</Text>
                    </Pressable>
                  )}
                  {attendee.socialLinks.linkedin && (
                    <Pressable
                      onPress={() => handleSocialLink(attendee.socialLinks!.linkedin!)}
                      className="flex-row items-center bg-blue-50 px-4 py-2 rounded-lg"
                    >
                      <MaterialCommunityIcons
                        name="linkedin"
                        size={20}
                        color="#0A66C2"
                      />
                      <Text className="ml-2 text-blue-600 font-medium">LinkedIn</Text>
                    </Pressable>
                  )}
                  {attendee.socialLinks.website && (
                    <Pressable
                      onPress={() => handleSocialLink(attendee.socialLinks!.website!)}
                      className="flex-row items-center bg-gray-50 px-4 py-2 rounded-lg"
                    >
                      <MaterialCommunityIcons
                        name="web"
                        size={20}
                        color="#6b7280"
                      />
                      <Text className="ml-2 text-gray-600 font-medium">Website</Text>
                    </Pressable>
                  )}
                </View>
              </View>
            </>
          )}

          {/* Shared Interests or Sessions (Future) */}
          {attendeeSessions.length > 0 && (
            <>
              <Divider />
              <View className="p-6">
                <Text className="text-lg font-bold mb-3">May Be Attending</Text>
                <Text className="text-sm text-gray-600 mb-3">
                  Sessions you might both be interested in
                </Text>
                {attendeeSessions.map((session) => (
                  <Chip
                    key={session.$id}
                    mode="outlined"
                    className="mb-2"
                    onPress={() => router.push(`/(app)/session/${session.$id}` as any)}
                  >
                    {session.title}
                  </Chip>
                ))}
              </View>
            </>
          )}
        </View>

        {/* Bottom Padding */}
        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
