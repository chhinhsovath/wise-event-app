import { useState, useEffect } from 'react';
import { View, ScrollView, RefreshControl } from 'react-native';
import { Text, Button, Divider, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SessionCard } from '@/components/session/SessionCard';
import { useBookmarks } from '@/hooks/useBookmarks';
import { format, parseISO } from 'date-fns';
import { Session } from '@/types';

/**
 * My Agenda Screen
 * Displays all bookmarked sessions grouped by date (Appwrite integrated)
 */
export default function MyAgenda() {
  const router = useRouter();
  const {
    toggleBookmark,
    isBookmarked,
    clearAllBookmarks,
    getBookmarkedSessionsData,
    loading: bookmarksLoading,
  } = useBookmarks();

  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadBookmarkedSessions();
  }, []);

  const loadBookmarkedSessions = async () => {
    try {
      setLoading(true);
      const bookmarkedSessions = await getBookmarkedSessionsData();
      const sorted = bookmarkedSessions.sort(
        (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      );
      setSessions(sorted);
    } catch (error) {
      console.error('Error loading bookmarked sessions:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadBookmarkedSessions();
  };

  // Group sessions by date
  const groupedSessions = sessions.reduce((groups, session) => {
    const date = format(parseISO(session.startTime), 'yyyy-MM-dd');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(session);
    return groups;
  }, {} as Record<string, Session[]>);

  const dateGroups = Object.entries(groupedSessions).sort(
    ([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime()
  );

  const handleClearAll = async () => {
    try {
      await clearAllBookmarks();
      setSessions([]);
    } catch (error) {
      console.error('Error clearing bookmarks:', error);
    }
  };

  const renderEmpty = () => (
    <View className="flex-1 items-center justify-center p-8 mt-20">
      <MaterialCommunityIcons name="bookmark-outline" size={80} color="#d1d5db" />
      <Text className="text-2xl font-bold mb-2 text-center mt-4">
        No Bookmarked Sessions
      </Text>
      <Text className="text-base text-gray-600 text-center mb-6">
        Start building your agenda by bookmarking sessions you want to attend
      </Text>
      <Button
        mode="contained"
        icon="calendar"
        onPress={() => router.push('/(app)/(tabs)/schedule')}
      >
        Browse Sessions
      </Button>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <Stack.Screen
        options={{
          title: 'My Agenda',
          headerShown: true,
          headerBackTitle: 'Back',
        }}
      />

      {loading && !refreshing ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#6366f1" />
          <Text className="mt-4 text-gray-600">Loading your agenda...</Text>
        </View>
      ) : sessions.length === 0 ? (
        renderEmpty()
      ) : (
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          <View className="p-6">
            {/* Header */}
            <View className="flex-row justify-between items-center mb-4">
              <View>
                <Text className="text-2xl font-bold">My Agenda</Text>
                <Text className="text-sm text-gray-600">
                  {sessions.length} {sessions.length === 1 ? 'session' : 'sessions'} saved
                </Text>
              </View>
              {sessions.length > 0 && (
                <Button
                  mode="text"
                  icon="delete-outline"
                  textColor="#ef4444"
                  onPress={handleClearAll}
                >
                  Clear All
                </Button>
              )}
            </View>

            {/* Grouped Sessions */}
            {dateGroups.map(([date, sessions], groupIndex) => (
              <View key={date} className="mb-6">
                {/* Date Header */}
                <View className="mb-3">
                  <Text className="text-lg font-bold text-primary-700">
                    {format(parseISO(sessions[0].startTime), 'EEEE, MMMM d, yyyy')}
                  </Text>
                  <Divider className="mt-2" />
                </View>

                {/* Sessions for this date */}
                {sessions.map((session) => (
                  <SessionCard
                    key={session.$id}
                    session={session}
                    onBookmark={toggleBookmark}
                    isBookmarked={isBookmarked(session.$id)}
                  />
                ))}
              </View>
            ))}

            {/* Export to Calendar (Future Feature) */}
            <View className="mt-4 mb-8">
              <Button
                mode="outlined"
                icon="calendar-export"
                onPress={() => {
                  // TODO: Implement calendar export
                  console.log('[My Agenda] Export to calendar - Coming soon!');
                }}
              >
                Export to Calendar
              </Button>
            </View>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
