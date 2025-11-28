import { useState, useEffect } from 'react';
import { View, ScrollView, RefreshControl, Pressable } from 'react-native';
import { Text, Card, Chip } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { CheckInsService } from '@/services';
import { CheckIn } from '@/types';
import { mockSessions } from '@/lib/mockData';

/**
 * User Attendance History Screen
 * Shows user's personal check-in history
 */
export default function AttendanceHistory() {
  const router = useRouter();
  const { user } = useAuth();
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [totalAttendance, setTotalAttendance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadHistory();
  }, [user]);

  const loadHistory = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const [history, total] = await Promise.all([
        CheckInsService.getAttendanceHistory(user.id),
        CheckInsService.getUserTotalAttendance(user.id),
      ]);
      setCheckIns(history);
      setTotalAttendance(total);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadHistory();
  };

  const handleSessionPress = (sessionId: string) => {
    router.push(`/(app)/session/${sessionId}` as any);
  };

  const formatDate = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
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
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  // Group check-ins by date
  const groupedCheckIns = checkIns.reduce((acc, checkIn) => {
    const date = formatDate(checkIn.checkInTime);
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(checkIn);
    return acc;
  }, {} as Record<string, CheckIn[]>);

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      {/* Header */}
      <View className="bg-white px-4 py-3 border-b border-gray-200">
        <View className="flex-row items-center">
          <Pressable onPress={() => router.back()} className="mr-3">
            <MaterialCommunityIcons name="arrow-left" size={24} color="#000" />
          </Pressable>
          <View className="flex-1">
            <Text className="text-xl font-bold">My Attendance</Text>
            <Text className="text-sm text-gray-600">Check-in history</Text>
          </View>
        </View>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Stats */}
        <Card className="m-4">
          <Card.Content>
            <View className="flex-row items-center justify-around">
              <View className="items-center">
                <Text className="text-3xl font-bold text-primary">{totalAttendance}</Text>
                <Text className="text-sm text-gray-600 mt-1">Sessions Attended</Text>
              </View>
              <View className="w-px h-12 bg-gray-200" />
              <View className="items-center">
                <Text className="text-3xl font-bold text-green-600">
                  {checkIns.length}
                </Text>
                <Text className="text-sm text-gray-600 mt-1">Total Check-ins</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {loading ? (
          <View className="items-center justify-center p-8">
            <MaterialCommunityIcons name="loading" size={48} color="#d1d5db" />
            <Text className="text-gray-500 mt-4">Loading history...</Text>
          </View>
        ) : checkIns.length === 0 ? (
          <View className="items-center justify-center p-8">
            <MaterialCommunityIcons name="calendar-blank" size={64} color="#d1d5db" />
            <Text className="text-lg text-gray-600 mt-4">No Attendance Yet</Text>
            <Text className="text-sm text-gray-500 mt-2 text-center">
              Check in to sessions using the QR scanner to see your history here
            </Text>
          </View>
        ) : (
          <View className="px-4">
            {Object.entries(groupedCheckIns).map(([date, dateCheckIns]) => (
              <View key={date} className="mb-4">
                <Text className="text-sm font-semibold text-gray-700 mb-2">{date}</Text>

                {dateCheckIns.map((checkIn) => {
                  const session = mockSessions.find((s) => s.$id === checkIn.sessionId);

                  return (
                    <Pressable
                      key={checkIn.$id}
                      onPress={() => session && handleSessionPress(session.$id)}
                    >
                      <Card className="mb-3">
                        <Card.Content>
                          <View className="flex-row items-start">
                            <View className="w-12 h-12 rounded-xl bg-primary-100 items-center justify-center">
                              <MaterialCommunityIcons
                                name="checkbox-marked-circle"
                                size={24}
                                color="#6366f1"
                              />
                            </View>

                            <View className="ml-3 flex-1">
                              <Text className="text-base font-semibold mb-1">
                                {session?.title || 'Unknown Session'}
                              </Text>

                              {session && (
                                <View className="flex-row items-center mb-2">
                                  <Chip
                                    mode="outlined"
                                    compact
                                    textStyle={{ fontSize: 10 }}
                                    style={{ height: 20 }}
                                  >
                                    {session.type}
                                  </Chip>
                                  {session.track && (
                                    <Chip
                                      mode="outlined"
                                      compact
                                      textStyle={{ fontSize: 10 }}
                                      style={{ height: 20, marginLeft: 4 }}
                                    >
                                      {session.track}
                                    </Chip>
                                  )}
                                </View>
                              )}

                              <View className="flex-row items-center gap-3 flex-wrap">
                                <View className="flex-row items-center">
                                  <MaterialCommunityIcons
                                    name="clock-check-outline"
                                    size={14}
                                    color="#6b7280"
                                  />
                                  <Text className="text-xs text-gray-600 ml-1">
                                    {formatTime(checkIn.checkInTime)}
                                  </Text>
                                </View>

                                <View className="flex-row items-center">
                                  <MaterialCommunityIcons
                                    name="timer-outline"
                                    size={14}
                                    color="#6b7280"
                                  />
                                  <Text className="text-xs text-gray-600 ml-1">
                                    {formatDuration(checkIn)}
                                  </Text>
                                </View>

                                <View className="flex-row items-center">
                                  <MaterialCommunityIcons
                                    name="qrcode-scan"
                                    size={14}
                                    color="#6b7280"
                                  />
                                  <Text className="text-xs text-gray-600 ml-1">
                                    {checkIn.method.toUpperCase()}
                                  </Text>
                                </View>

                                {session && (
                                  <View className="flex-row items-center">
                                    <MaterialCommunityIcons
                                      name="map-marker"
                                      size={14}
                                      color="#6b7280"
                                    />
                                    <Text className="text-xs text-gray-600 ml-1">
                                      {session.room}
                                    </Text>
                                  </View>
                                )}
                              </View>
                            </View>

                            <MaterialCommunityIcons
                              name="chevron-right"
                              size={20}
                              color="#9ca3af"
                            />
                          </View>
                        </Card.Content>
                      </Card>
                    </Pressable>
                  );
                })}
              </View>
            ))}
          </View>
        )}

        {/* Bottom Spacing */}
        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
