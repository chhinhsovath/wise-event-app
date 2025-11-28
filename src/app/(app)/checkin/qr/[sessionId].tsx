import { View, ScrollView, Pressable, Share } from 'react-native';
import { Text, Card, Button, Chip } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { CheckInsService, SessionsService } from '@/services';
import { Session } from '@/types';

/**
 * Session QR Code Display Screen
 * Shows QR code for session check-in (organizer/speaker view)
 */
export default function SessionQRCode() {
  const router = useRouter();
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const [session, setSession] = useState<Session | null>(null);
  const [attendanceCount, setAttendanceCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSession();
  }, [sessionId]);

  useEffect(() => {
    if (session) {
      loadAttendanceCount();
      // Refresh count every 10 seconds
      const interval = setInterval(loadAttendanceCount, 10000);
      return () => clearInterval(interval);
    }
  }, [session]);

  const loadSession = async () => {
    try {
      setLoading(true);
      setError(null);
      if (sessionId) {
        const sessionData = await SessionsService.getSessionById(sessionId);
        setSession(sessionData);
      }
    } catch (err: any) {
      console.error('Error loading session:', err);
      setError(err.message || 'Failed to load session');
    } finally {
      setLoading(false);
    }
  };

  const loadAttendanceCount = async () => {
    try {
      if (sessionId) {
        const count = await CheckInsService.getSessionAttendanceCount(sessionId);
        setAttendanceCount(count);
      }
    } catch (error) {
      console.error('Error loading attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShareQR = async () => {
    try {
      await Share.share({
        message: `Check in to "${session?.title}" - Scan the QR code at the session entrance`,
        title: 'Session Check-in',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleViewAttendance = () => {
    router.push(`/(app)/checkin/attendance/${sessionId}` as any);
  };

  // Loading state
  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center p-4">
          <MaterialCommunityIcons name="loading" size={64} color="#6366f1" />
          <Text className="text-lg text-gray-600 mt-4">Loading session...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error || !session) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center p-4">
          <MaterialCommunityIcons name="alert-circle" size={64} color="#ef4444" />
          <Text className="text-lg text-gray-900 font-semibold mt-4">
            {error ? 'Error Loading Session' : 'Session Not Found'}
          </Text>
          {error && (
            <Text className="text-sm text-gray-600 mt-2 text-center">{error}</Text>
          )}
          <Button mode="contained" onPress={() => router.back()} className="mt-4">
            Go Back
          </Button>
          {error && (
            <Button mode="outlined" onPress={loadSession} className="mt-2">
              Retry
            </Button>
          )}
        </View>
      </SafeAreaView>
    );
  }

  const qrData = CheckInsService.generateQRData(session.$id);
  const startTime = new Date(session.startTime);
  const capacityPercent = session.capacity
    ? Math.round((attendanceCount / session.capacity) * 100)
    : 0;

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      {/* Header */}
      <View className="bg-white px-4 py-3 border-b border-gray-200">
        <View className="flex-row items-center">
          <Pressable onPress={() => router.back()} className="mr-3">
            <MaterialCommunityIcons name="arrow-left" size={24} color="#000" />
          </Pressable>
          <View className="flex-1">
            <Text className="text-xl font-bold">Session QR Code</Text>
            <Text className="text-sm text-gray-600">Check-in Portal</Text>
          </View>
        </View>
      </View>

      <ScrollView>
        {/* Session Info */}
        <Card className="m-4">
          <Card.Content>
            <Text className="text-lg font-bold mb-1">{session.title}</Text>
            <View className="flex-row items-center mt-2">
              <MaterialCommunityIcons name="clock-outline" size={16} color="#6b7280" />
              <Text className="text-sm text-gray-600 ml-1">
                {startTime.toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </Text>
              <MaterialCommunityIcons name="map-marker" size={16} color="#6b7280" className="ml-3" />
              <Text className="text-sm text-gray-600 ml-1">{session.room}</Text>
            </View>
          </Card.Content>
        </Card>

        {/* QR Code */}
        <Card className="mx-4 mb-4">
          <Card.Content>
            <View className="items-center py-6">
              <View className="bg-white p-6 rounded-2xl shadow-lg">
                <QRCode
                  value={qrData}
                  size={220}
                  backgroundColor="white"
                  color="black"
                />
              </View>

              <Text className="text-center text-sm text-gray-600 mt-4 px-4">
                Attendees scan this code to check in to the session
              </Text>

              <View className="flex-row gap-2 mt-4">
                <Chip icon="qrcode-scan" mode="outlined">
                  QR Check-in
                </Chip>
                <Chip icon="refresh" mode="outlined">
                  Auto-refresh
                </Chip>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Attendance Stats */}
        <Card className="mx-4 mb-4">
          <Card.Content>
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-lg font-semibold">Live Attendance</Text>
              <Chip
                icon="account-group"
                mode="flat"
                style={{ backgroundColor: '#dbeafe' }}
                textStyle={{ color: '#1e40af' }}
              >
                {attendanceCount} / {session.capacity || '∞'}
              </Chip>
            </View>

            {/* Capacity Bar */}
            {session.capacity && (
              <>
                <View className="bg-gray-200 h-3 rounded-full overflow-hidden mb-2">
                  <View
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min(capacityPercent, 100)}%`,
                      backgroundColor:
                        capacityPercent > 90
                          ? '#ef4444'
                          : capacityPercent > 70
                          ? '#f59e0b'
                          : '#10b981',
                    }}
                  />
                </View>
                <Text className="text-sm text-gray-600 text-center">
                  {capacityPercent}% Capacity
                </Text>
              </>
            )}

            <View className="flex-row items-center justify-center mt-4">
              <MaterialCommunityIcons name="information-outline" size={16} color="#6b7280" />
              <Text className="text-xs text-gray-500 ml-1">
                Updates every 10 seconds
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Actions */}
        <Card className="mx-4 mb-4">
          <Card.Content>
            <Text className="text-base font-semibold mb-3">Actions</Text>

            <Button
              mode="contained"
              icon="account-multiple"
              onPress={handleViewAttendance}
              className="mb-2"
            >
              View Full Attendance List
            </Button>

            <Button
              mode="outlined"
              icon="share-variant"
              onPress={handleShareQR}
              className="mb-2"
            >
              Share QR Code
            </Button>

            <Button
              mode="outlined"
              icon="refresh"
              onPress={loadAttendanceCount}
              loading={loading}
            >
              Refresh Count
            </Button>
          </Card.Content>
        </Card>

        {/* Instructions */}
        <Card className="mx-4 mb-4">
          <Card.Content>
            <View className="flex-row items-start">
              <MaterialCommunityIcons name="information" size={20} color="#3b82f6" className="mt-0.5" />
              <View className="ml-3 flex-1">
                <Text className="font-semibold mb-2">For Session Staff</Text>
                <Text className="text-sm text-gray-700 mb-1">
                  • Display this QR code at the session entrance
                </Text>
                <Text className="text-sm text-gray-700 mb-1">
                  • Attendees open the app and tap "Scan QR Code"
                </Text>
                <Text className="text-sm text-gray-700 mb-1">
                  • Check-in happens automatically upon scanning
                </Text>
                <Text className="text-sm text-gray-700">
                  • Monitor attendance in real-time above
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Bottom Spacing */}
        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
