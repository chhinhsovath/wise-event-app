import { useState, useEffect } from 'react';
import { View, ScrollView, Pressable, RefreshControl } from 'react-native';
import { Text, Card, Chip, SegmentedButtons, Searchbar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { CheckInsService, SessionsService, UsersService } from '@/services';
import { CheckIn, Session, UserProfile } from '@/types';
import { useRealtimeCheckIns } from '@/hooks/useRealtimeCollection';

/**
 * Session Attendance List Screen
 * Shows all attendees who checked in to a session
 */
export default function SessionAttendance() {
  const router = useRouter();
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const [session, setSession] = useState<Session | null>(null);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [users, setUsers] = useState<Map<string, UserProfile>>(new Map());
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [sessionId]);

  // Realtime updates for check-ins
  useRealtimeCheckIns(
    sessionId || '',
    (payload) => {
      console.log('[Attendance] Realtime update:', payload);
      // Reload attendance data when check-ins are created or updated
      loadData();
    },
    !!sessionId // Only enable if sessionId exists
  );

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!sessionId) return;

      // Load session and check-ins in parallel
      const [sessionData, checkInsData] = await Promise.all([
        SessionsService.getSessionById(sessionId),
        CheckInsService.getSessionCheckIns(sessionId),
      ]);

      setSession(sessionData);
      setCheckIns(checkInsData);

      // Load user profiles for all attendees
      const userIds = [...new Set(checkInsData.map(c => c.clerkUserId))];
      const usersMap = new Map<string, UserProfile>();

      await Promise.all(
        userIds.map(async (userId) => {
          try {
            const user = await UsersService.getUserByClerkId(userId);
            if (user) {
              usersMap.set(userId, user);
            }
          } catch (err) {
            console.error(`Error loading user ${userId}:`, err);
          }
        })
      );

      setUsers(usersMap);
    } catch (err: any) {
      console.error('Error loading attendance data:', err);
      setError(err.message || 'Failed to load attendance');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  // Filter check-ins
  const filteredCheckIns = checkIns.filter((checkIn) => {
    // Filter by status
    if (filter === 'active' && checkIn.checkOutTime) return false;
    if (filter === 'completed' && !checkIn.checkOutTime) return false;

    // Filter by search query
    if (searchQuery) {
      const user = users.get(checkIn.clerkUserId);
      const name = user?.fullName.toLowerCase() || '';
      const query = searchQuery.toLowerCase();
      return name.includes(query);
    }

    return true;
  });

  // Calculate stats
  const totalCheckIns = checkIns.length;
  const activeCheckIns = checkIns.filter((c) => !c.checkOutTime).length;
  const completedCheckIns = checkIns.filter((c) => c.checkOutTime).length;

  // Get method breakdown
  const methodCounts = checkIns.reduce((acc, checkIn) => {
    acc[checkIn.method] = (acc[checkIn.method] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const getMethodIcon = (method: string): string => {
    const icons: Record<string, string> = {
      qr: 'qrcode-scan',
      nfc: 'nfc-variant',
      geofence: 'map-marker-radius',
      manual: 'hand-pointing-right',
    };
    return icons[method] || 'checkbox-marked-circle';
  };

  const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const formatDuration = (checkIn: CheckIn): string => {
    const duration = CheckInsService.calculateDuration(checkIn);
    if (duration === 0) return 'Active';

    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  // Loading state
  if (loading && !refreshing) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center p-4">
          <MaterialCommunityIcons name="loading" size={64} color="#6366f1" />
          <Text className="text-lg text-gray-600 mt-4">Loading attendance...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error && !session) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center p-4">
          <MaterialCommunityIcons name="alert-circle" size={64} color="#ef4444" />
          <Text className="text-lg text-gray-900 font-semibold mt-4">Error Loading Attendance</Text>
          <Text className="text-sm text-gray-600 mt-2 text-center">{error}</Text>
          <View className="flex-row gap-2 mt-4">
            <Button mode="contained" onPress={loadData}>
              Retry
            </Button>
            <Button mode="outlined" onPress={() => router.back()}>
              Go Back
            </Button>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      {/* Header */}
      <View className="bg-white px-4 py-3 border-b border-gray-200">
        <View className="flex-row items-center">
          <Pressable onPress={() => router.back()} className="mr-3">
            <MaterialCommunityIcons name="arrow-left" size={24} color="#000" />
          </Pressable>
          <View className="flex-1">
            <Text className="text-xl font-bold">Attendance</Text>
            <Text className="text-sm text-gray-600" numberOfLines={1}>
              {session?.title || 'Session'}
            </Text>
          </View>
        </View>
      </View>

      {/* Search */}
      <View className="px-4 py-3 bg-white border-b border-gray-200">
        <Searchbar
          placeholder="Search attendees..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          elevation={0}
          style={{ backgroundColor: '#f3f4f6' }}
        />
      </View>

      {/* Stats Cards */}
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View className="flex-row p-4 gap-2">
          <Card className="flex-1">
            <Card.Content className="items-center py-3">
              <Text className="text-2xl font-bold text-primary">{totalCheckIns}</Text>
              <Text className="text-xs text-gray-600">Total</Text>
            </Card.Content>
          </Card>
          <Card className="flex-1">
            <Card.Content className="items-center py-3">
              <Text className="text-2xl font-bold text-green-600">{activeCheckIns}</Text>
              <Text className="text-xs text-gray-600">Active</Text>
            </Card.Content>
          </Card>
          <Card className="flex-1">
            <Card.Content className="items-center py-3">
              <Text className="text-2xl font-bold text-gray-600">{completedCheckIns}</Text>
              <Text className="text-xs text-gray-600">Left</Text>
            </Card.Content>
          </Card>
        </View>

        {/* Method Breakdown */}
        {totalCheckIns > 0 && (
          <Card className="mx-4 mb-4">
            <Card.Content>
              <Text className="text-base font-semibold mb-3">Check-in Methods</Text>
              <View className="flex-row flex-wrap gap-2">
                {Object.entries(methodCounts).map(([method, count]) => (
                  <Chip
                    key={method}
                    icon={() => (
                      <MaterialCommunityIcons
                        name={getMethodIcon(method) as any}
                        size={16}
                        color="#6366f1"
                      />
                    )}
                    mode="outlined"
                  >
                    {method.toUpperCase()}: {count}
                  </Chip>
                ))}
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Filter */}
        <View className="px-4 mb-4">
          <SegmentedButtons
            value={filter}
            onValueChange={(value) => setFilter(value as typeof filter)}
            buttons={[
              { value: 'all', label: `All (${totalCheckIns})` },
              { value: 'active', label: `Active (${activeCheckIns})` },
              { value: 'completed', label: `Left (${completedCheckIns})` },
            ]}
            density="small"
          />
        </View>

        {/* Attendee List */}
        {loading ? (
          <View className="items-center justify-center p-8">
            <MaterialCommunityIcons name="loading" size={48} color="#d1d5db" />
            <Text className="text-gray-500 mt-4">Loading attendance...</Text>
          </View>
        ) : filteredCheckIns.length === 0 ? (
          <View className="items-center justify-center p-8">
            <MaterialCommunityIcons name="account-off-outline" size={64} color="#d1d5db" />
            <Text className="text-gray-500 mt-4">
              {searchQuery ? 'No attendees match your search' : 'No attendees yet'}
            </Text>
          </View>
        ) : (
          <View className="px-4 gap-3">
            {filteredCheckIns.map((checkIn) => {
              const user = users.get(checkIn.clerkUserId);
              const isActive = !checkIn.checkOutTime;

              return (
                <Card key={checkIn.$id}>
                  <Card.Content>
                    <View className="flex-row items-start">
                      <View
                        className="w-12 h-12 rounded-full items-center justify-center"
                        style={{
                          backgroundColor: isActive ? '#dbeafe' : '#f3f4f6',
                        }}
                      >
                        <MaterialCommunityIcons
                          name="account"
                          size={24}
                          color={isActive ? '#3b82f6' : '#9ca3af'}
                        />
                      </View>

                      <View className="ml-3 flex-1">
                        <View className="flex-row items-center justify-between mb-1">
                          <Text className="text-base font-semibold flex-1">
                            {user?.fullName || 'Unknown User'}
                          </Text>
                          {isActive && (
                            <Chip
                              mode="flat"
                              compact
                              textStyle={{ fontSize: 10 }}
                              style={{ height: 20, backgroundColor: '#dcfce7' }}
                            >
                              Active
                            </Chip>
                          )}
                        </View>

                        {user && (
                          <Text className="text-sm text-gray-600 mb-2">
                            {user.title || 'Attendee'} • {user.organization || 'N/A'}
                          </Text>
                        )}

                        <View className="flex-row items-center gap-3">
                          <View className="flex-row items-center">
                            <MaterialCommunityIcons
                              name="clock-check-outline"
                              size={14}
                              color="#6b7280"
                            />
                            <Text className="text-xs text-gray-600 ml-1">
                              In: {formatTime(checkIn.checkInTime)}
                            </Text>
                          </View>

                          {checkIn.checkOutTime && (
                            <View className="flex-row items-center">
                              <MaterialCommunityIcons
                                name="clock-outline"
                                size={14}
                                color="#6b7280"
                              />
                              <Text className="text-xs text-gray-600 ml-1">
                                Out: {formatTime(checkIn.checkOutTime)}
                              </Text>
                            </View>
                          )}

                          <View className="flex-row items-center">
                            <MaterialCommunityIcons
                              name={getMethodIcon(checkIn.method) as any}
                              size={14}
                              color="#6b7280"
                            />
                            <Text className="text-xs text-gray-600 ml-1">
                              {formatDuration(checkIn)}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  </Card.Content>
                </Card>
              );
            })}
          </View>
        )}

        {/* Bottom Spacing */}
        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
