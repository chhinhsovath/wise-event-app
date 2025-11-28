import { View, ScrollView, Image, Pressable, Share, Alert } from 'react-native';
import { Text, Button, Chip, Divider, Avatar, ActivityIndicator } from 'react-native-paper';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { SessionsService } from '@/services';
import { Session } from '@/types';
import { useState, useEffect } from 'react';
import { useBookmarks } from '@/hooks/useBookmarks';

/**
 * Session Details Screen
 * Displays comprehensive information about a session (Appwrite integrated)
 */
export default function SessionDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { toggleBookmark, isBookmarked: checkBookmarked } = useBookmarks();

  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSession();
  }, [id]);

  const loadSession = async () => {
    try {
      setLoading(true);
      setError(null);

      const sessionData = await SessionsService.getSessionById(id as string);
      setSession(sessionData);
    } catch (err: any) {
      console.error('Error loading session:', err);
      setError(err.message || 'Failed to load session');
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <>
        <Stack.Screen
          options={{
            headerShown: true,
            headerTitle: 'Loading...',
            headerBackTitle: 'Back',
          }}
        />
        <SafeAreaView className="flex-1 items-center justify-center bg-white">
          <ActivityIndicator size="large" color="#6366f1" />
          <Text className="mt-4 text-gray-600">Loading session...</Text>
        </SafeAreaView>
      </>
    );
  }

  // Error state
  if (error || !session) {
    return (
      <>
        <Stack.Screen
          options={{
            headerShown: true,
            headerTitle: 'Error',
            headerBackTitle: 'Back',
          }}
        />
        <SafeAreaView className="flex-1 items-center justify-center bg-white p-4">
          <MaterialCommunityIcons name="alert-circle" size={64} color="#ef4444" />
          <Text className="mt-4 text-lg font-semibold text-gray-900">
            {error || 'Session not found'}
          </Text>
          <Button onPress={() => router.back()} mode="outlined" className="mt-4">
            Go Back
          </Button>
          {error && (
            <Button onPress={loadSession} mode="contained" className="mt-2">
              Retry
            </Button>
          )}
        </SafeAreaView>
      </>
    );
  }

  const isBookmarked = checkBookmarked(id as string);

  // For now, speakers will be empty until we implement speaker loading
  // TODO: Load speakers from session.speakerIds
  const speakers: any[] = [];
  const startTime = format(new Date(session.startTime), 'h:mm a');
  const endTime = format(new Date(session.endTime), 'h:mm a');
  const date = format(new Date(session.startTime), 'EEEE, MMMM dd, yyyy');
  const duration = Math.round(
    (new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) /
      (1000 * 60)
  );

  const capacityPercent = session.capacity
    ? Math.round((session.currentAttendees / session.capacity) * 100)
    : 0;

  const handleBookmark = () => {
    toggleBookmark(id as string);
  };

  const handleShare = async () => {
    try {
      const speakerNames = speakers.map((s) => s.name).join(', ');
      const shareMessage = `📅 ${session.title}

🗓️ ${date}
⏰ ${startTime} - ${endTime} (${duration} min)
📍 ${session.room}${session.floor ? ` • ${session.floor}` : ''}
${speakers.length > 0 ? `\n👤 ${speakerNames}` : ''}

${session.description}

Join me at WISE 2024!`;

      const result = await Share.share({
        message: shareMessage,
        title: session.title,
      });

      if (result.action === Share.sharedAction) {
        console.log('[Session] Shared successfully');
      }
    } catch (error) {
      console.error('[Session] Error sharing:', error);
      Alert.alert('Error', 'Failed to share session');
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: '',
          headerBackTitle: 'Back',
        }}
      />
      <SafeAreaView className="flex-1 bg-white" edges={['bottom']}>
        <ScrollView>
          {/* Header Section */}
          <View className="px-4 pt-4 pb-6 bg-primary-50">
            <Text className="text-2xl font-bold mb-3">{session.title}</Text>

            {/* Session Type and Featured */}
            <View className="flex-row items-center gap-2 mb-3">
              <Chip mode="flat" textStyle={{ fontSize: 12 }}>
                {session.type.toUpperCase()}
              </Chip>
              {session.isFeatured && (
                <View className="flex-row items-center">
                  <Ionicons name="star" size={16} color="#f59e0b" />
                  <Text className="text-xs text-amber-600 ml-1">Featured</Text>
                </View>
              )}
            </View>

            {/* Time and Date */}
            <View className="flex-row items-center mb-2">
              <Ionicons name="calendar-outline" size={20} color="#6b7280" />
              <Text className="text-sm text-gray-700 ml-2">{date}</Text>
            </View>

            <View className="flex-row items-center mb-2">
              <Ionicons name="time-outline" size={20} color="#6b7280" />
              <Text className="text-sm text-gray-700 ml-2">
                {startTime} - {endTime} ({duration} min)
              </Text>
            </View>

            {/* Location */}
            <View className="flex-row items-center">
              <Ionicons name="location-outline" size={20} color="#6b7280" />
              <Text className="text-sm text-gray-700 ml-2">
                {session.room}
                {session.floor && ` • ${session.floor}`}
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View className="px-4 py-4 flex-row gap-3">
            <Button
              mode={isBookmarked ? 'contained' : 'outlined'}
              icon={isBookmarked ? 'bookmark' : 'bookmark-outline'}
              onPress={handleBookmark}
              className="flex-1"
            >
              {isBookmarked ? 'Bookmarked' : 'Bookmark'}
            </Button>
            <Button mode="outlined" icon="share-variant" onPress={handleShare}>
              Share
            </Button>
          </View>

          <Divider />

          {/* Description */}
          <View className="px-4 py-6">
            <Text className="text-lg font-semibold mb-3">About This Session</Text>
            <Text className="text-gray-700 leading-6">{session.description}</Text>
          </View>

          {/* Capacity */}
          {session.capacity && (
            <>
              <Divider />
              <View className="px-4 py-6">
                <Text className="text-lg font-semibold mb-3">Capacity</Text>
                <View className="flex-row items-center justify-between mb-2">
                  <View className="flex-row items-center">
                    <Ionicons name="people" size={20} color="#6b7280" />
                    <Text className="text-gray-700 ml-2">
                      {session.currentAttendees} / {session.capacity} attendees
                    </Text>
                  </View>
                  <Text className="text-sm text-gray-600">{capacityPercent}%</Text>
                </View>
                {/* Progress Bar */}
                <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <View
                    className="h-full bg-primary-500"
                    style={{ width: `${Math.min(capacityPercent, 100)}%` }}
                  />
                </View>
                {capacityPercent >= 100 && (
                  <Text className="text-sm text-red-600 mt-2">
                    This session is at full capacity
                  </Text>
                )}
              </View>
            </>
          )}

          {/* Speakers */}
          {speakers.length > 0 && (
            <>
              <Divider />
              <View className="px-4 py-6">
                <Text className="text-lg font-semibold mb-4">
                  Speaker{speakers.length > 1 ? 's' : ''}
                </Text>
                {speakers.map((speaker) => (
                  <Pressable
                    key={speaker.$id}
                    onPress={() => router.push(`/(app)/speaker/${speaker.$id}`)}
                    className="flex-row mb-4 bg-gray-50 p-3 rounded-lg active:bg-gray-100"
                  >
                    <Avatar.Image
                      size={60}
                      source={{ uri: speaker.photo || 'https://via.placeholder.com/60' }}
                    />
                    <View className="ml-3 flex-1 justify-center">
                      <Text className="font-semibold text-base">{speaker.name}</Text>
                      <Text className="text-sm text-gray-600">{speaker.title}</Text>
                      <Text className="text-sm text-gray-600">{speaker.organization}</Text>
                    </View>
                    <View className="justify-center">
                      <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                    </View>
                  </Pressable>
                ))}
              </View>
            </>
          )}

          {/* Track */}
          {session.track && (
            <>
              <Divider />
              <View className="px-4 py-6">
                <Text className="text-lg font-semibold mb-2">Track</Text>
                <Chip icon="bookmark">{session.track}</Chip>
              </View>
            </>
          )}

          {/* Tags */}
          {session.tags && session.tags.length > 0 && (
            <>
              <Divider />
              <View className="px-4 py-6">
                <Text className="text-lg font-semibold mb-3">Topics</Text>
                <View className="flex-row flex-wrap gap-2">
                  {session.tags.map((tag) => (
                    <Chip key={tag} mode="outlined" compact>
                      {tag}
                    </Chip>
                  ))}
                </View>
              </View>
            </>
          )}

          {/* Bottom Padding */}
          <View className="h-8" />
        </ScrollView>
      </SafeAreaView>
    </>
  );
}
