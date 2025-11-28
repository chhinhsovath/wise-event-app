import { View, ScrollView, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import { useAuth } from '@/hooks/useAuth';
import { Card, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { SessionCard } from '@/components/session/SessionCard';
import { mockSessions } from '@/lib/mockData';
import { useBookmarks } from '@/hooks/useBookmarks';
import { format, isAfter, isBefore, addHours } from 'date-fns';

/**
 * Home/Dashboard Screen
 * Shows event overview, upcoming sessions, and quick actions
 */
export default function Home() {
  const { user } = useAuth();
  const router = useRouter();
  const { bookmarkedSessions, toggleBookmark, isBookmarked } = useBookmarks();

  // Get upcoming sessions (next 24 hours)
  const now = new Date();
  const next24Hours = addHours(now, 24);
  const upcomingSessions = mockSessions
    .filter((session) => {
      const sessionStart = new Date(session.startTime);
      return isAfter(sessionStart, now) && isBefore(sessionStart, next24Hours);
    })
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    .slice(0, 3); // Show top 3

  // Get bookmarked sessions
  const bookmarkedSessionsList = mockSessions.filter((session) =>
    bookmarkedSessions.includes(session.$id)
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <ScrollView>
        <View className="p-6">
          {/* Welcome Section */}
          <View className="mb-6">
            <Text className="text-3xl font-bold mb-2">
              Welcome back, {user?.firstName || 'Guest'}!
            </Text>
            <Text className="text-gray-600">
              WISE 2024 • December 1-3
            </Text>
          </View>

          {/* Quick Stats */}
          <View className="flex-row gap-3 mb-6">
            <Card className="flex-1">
              <Pressable onPress={() => router.push('/(app)/my-agenda')}>
                <Card.Content className="items-center py-4">
                  <Text className="text-2xl font-bold text-primary-600">
                    {bookmarkedSessions.length}
                  </Text>
                  <Text className="text-sm text-gray-600">Bookmarks</Text>
                </Card.Content>
              </Pressable>
            </Card>
            <Card className="flex-1">
              <Pressable onPress={() => router.push('/(app)/(tabs)/schedule')}>
                <Card.Content className="items-center py-4">
                  <Text className="text-2xl font-bold text-primary-600">
                    {mockSessions.length}
                  </Text>
                  <Text className="text-sm text-gray-600">Sessions</Text>
                </Card.Content>
              </Pressable>
            </Card>
          </View>

          {/* Upcoming Sessions */}
          {upcomingSessions.length > 0 && (
            <>
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-xl font-bold">Upcoming Soon</Text>
                <Button
                  mode="text"
                  compact
                  onPress={() => router.push('/(app)/(tabs)/schedule')}
                >
                  View All
                </Button>
              </View>
              {upcomingSessions.map((session) => (
                <SessionCard
                  key={session.$id}
                  session={session}
                  onBookmark={toggleBookmark}
                  isBookmarked={isBookmarked(session.$id)}
                />
              ))}
            </>
          )}

          {/* My Bookmarks Section */}
          {bookmarkedSessionsList.length > 0 && (
            <>
              <View className="flex-row justify-between items-center mb-3 mt-6">
                <Text className="text-xl font-bold">My Bookmarks</Text>
                <Button
                  mode="text"
                  compact
                  onPress={() => router.push('/(app)/my-agenda')}
                >
                  View All
                </Button>
              </View>
              {bookmarkedSessionsList.slice(0, 2).map((session) => (
                <SessionCard
                  key={session.$id}
                  session={session}
                  onBookmark={toggleBookmark}
                  isBookmarked={true}
                />
              ))}
            </>
          )}

          {/* Quick Actions */}
          <Text className="text-xl font-bold mb-3 mt-6">Quick Actions</Text>
          <View className="gap-3 mb-6">
            <Button
              mode="contained"
              icon="calendar"
              onPress={() => router.push('/(app)/(tabs)/schedule')}
            >
              Browse All Sessions
            </Button>
            <Button
              mode="outlined"
              icon="bookmark"
              onPress={() => router.push('/(app)/my-agenda')}
            >
              My Agenda
            </Button>
            <Button
              mode="outlined"
              icon="map"
              onPress={() => router.push('/(app)/(tabs)/map')}
            >
              Venue Map
            </Button>
            <Button
              mode="outlined"
              icon="account-group"
              onPress={() => router.push('/(app)/(tabs)/networking')}
            >
              Network with Attendees
            </Button>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
