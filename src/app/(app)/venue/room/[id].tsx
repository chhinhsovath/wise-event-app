import { View, ScrollView, Pressable } from 'react-native';
import { Text, Card, Chip, Button, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getRoomById, getFloorByRoom, mockSessions } from '@/lib/mockData';
import { MaterialCommunityIcons } from '@expo/vector-icons';

/**
 * Room Detail Screen
 * Shows comprehensive information about a venue room
 */
export default function RoomDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const room = getRoomById(id || '');
  const floor = room ? getFloorByRoom(room.id) : undefined;

  // Get sessions in this room
  const roomSessions = mockSessions.filter((session) => session.room === room?.name);

  if (!room) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center p-4">
          <MaterialCommunityIcons name="alert-circle" size={64} color="#9ca3af" />
          <Text className="text-lg text-gray-600 mt-4">Room not found</Text>
          <Button mode="contained" onPress={() => router.back()} className="mt-4">
            Go Back
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  // Room type colors
  const getRoomTypeColor = (type: string): string => {
    const colors: Record<string, string> = {
      'main-hall': '#3b82f6',
      'conference': '#8b5cf6',
      'workshop': '#10b981',
      'networking': '#f59e0b',
      'exhibition': '#ec4899',
      'breakout': '#6b7280',
    };
    return colors[type] || '#6b7280';
  };

  // Room type icon
  const getRoomTypeIcon = (type: string): string => {
    const icons: Record<string, string> = {
      'main-hall': 'theater',
      'conference': 'presentation',
      'workshop': 'toolbox',
      'networking': 'account-group',
      'exhibition': 'store',
      'breakout': 'sofa',
    };
    return icons[type] || 'door';
  };

  const handleSessionPress = (sessionId: string) => {
    router.push(`/(app)/session/${sessionId}` as any);
  };

  const handleBackToMap = () => {
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      {/* Header */}
      <View className="bg-white px-4 py-3 border-b border-gray-200">
        <View className="flex-row items-center">
          <Pressable onPress={handleBackToMap} className="mr-3">
            <MaterialCommunityIcons name="arrow-left" size={24} color="#000" />
          </Pressable>
          <View className="flex-1">
            <Text className="text-xl font-bold">{room.name}</Text>
            <Text className="text-sm text-gray-600">{floor?.name}</Text>
          </View>
        </View>
      </View>

      <ScrollView>
        {/* Room Header Card */}
        <Card className="m-4">
          <Card.Content>
            <View className="flex-row items-center mb-4">
              <View
                className="w-16 h-16 rounded-xl items-center justify-center"
                style={{ backgroundColor: getRoomTypeColor(room.type) + '20' }}
              >
                <MaterialCommunityIcons
                  name={getRoomTypeIcon(room.type) as any}
                  size={32}
                  color={getRoomTypeColor(room.type)}
                />
              </View>
              <View className="ml-4 flex-1">
                <Text className="text-2xl font-bold">{room.name}</Text>
                <Chip
                  mode="outlined"
                  textStyle={{ fontSize: 12 }}
                  style={{ alignSelf: 'flex-start', marginTop: 4 }}
                >
                  {room.type.replace('-', ' ').toUpperCase()}
                </Chip>
              </View>
            </View>

            {room.description && (
              <Text className="text-base text-gray-700 mb-4">{room.description}</Text>
            )}

            <Divider className="my-4" />

            {/* Key Details */}
            <View className="gap-3">
              <View className="flex-row items-center">
                <MaterialCommunityIcons name="map-marker" size={20} color="#6b7280" />
                <Text className="text-base text-gray-700 ml-2">
                  <Text className="font-semibold">Location:</Text> {floor?.name}
                </Text>
              </View>

              <View className="flex-row items-center">
                <MaterialCommunityIcons name="account-group" size={20} color="#6b7280" />
                <Text className="text-base text-gray-700 ml-2">
                  <Text className="font-semibold">Capacity:</Text> {room.capacity} people
                </Text>
              </View>

              <View className="flex-row items-center">
                <MaterialCommunityIcons name="crosshairs-gps" size={20} color="#6b7280" />
                <Text className="text-base text-gray-700 ml-2">
                  <Text className="font-semibold">Coordinates:</Text> {room.coordinates.x}%, {room.coordinates.y}%
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Amenities */}
        {room.amenities && room.amenities.length > 0 && (
          <Card className="mx-4 mb-4">
            <Card.Content>
              <View className="flex-row items-center mb-3">
                <MaterialCommunityIcons name="star-circle" size={24} color="#6366f1" />
                <Text className="text-lg font-semibold ml-2">Amenities</Text>
              </View>

              <View className="flex-row flex-wrap gap-2">
                {room.amenities.map((amenity, index) => (
                  <Chip
                    key={index}
                    mode="flat"
                    icon={() => <MaterialCommunityIcons name="check" size={16} color="#10b981" />}
                    textStyle={{ fontSize: 14 }}
                  >
                    {amenity}
                  </Chip>
                ))}
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Sessions in this room */}
        {roomSessions.length > 0 && (
          <Card className="mx-4 mb-4">
            <Card.Content>
              <View className="flex-row items-center mb-3">
                <MaterialCommunityIcons name="calendar-clock" size={24} color="#6366f1" />
                <Text className="text-lg font-semibold ml-2">
                  Sessions in this Room ({roomSessions.length})
                </Text>
              </View>

              <View className="gap-3">
                {roomSessions.map((session) => {
                  const startTime = new Date(session.startTime);
                  const endTime = new Date(session.endTime);

                  return (
                    <Pressable
                      key={session.$id}
                      onPress={() => handleSessionPress(session.$id)}
                    >
                      <View className="p-3 bg-gray-50 rounded-lg">
                        <View className="flex-row items-start justify-between mb-2">
                          <View className="flex-1">
                            <Text className="text-base font-semibold">{session.title}</Text>
                            {session.track && (
                              <Chip
                                mode="outlined"
                                compact
                                textStyle={{ fontSize: 10 }}
                                style={{ alignSelf: 'flex-start', marginTop: 4, height: 24 }}
                              >
                                {session.track}
                              </Chip>
                            )}
                          </View>
                        </View>

                        <View className="flex-row items-center">
                          <MaterialCommunityIcons name="clock-outline" size={14} color="#6b7280" />
                          <Text className="text-sm text-gray-600 ml-1">
                            {startTime.toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                            })}{' '}
                            -{' '}
                            {endTime.toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                            })}
                          </Text>
                        </View>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Quick Actions */}
        <Card className="mx-4 mb-4">
          <Card.Content>
            <Text className="text-lg font-semibold mb-3">Quick Actions</Text>

            <View className="gap-2">
              <Pressable
                onPress={handleBackToMap}
                className="flex-row items-center p-3 bg-gray-50 rounded-lg"
              >
                <MaterialCommunityIcons name="map" size={24} color="#6366f1" />
                <View className="ml-3 flex-1">
                  <Text className="font-medium">View on Map</Text>
                  <Text className="text-xs text-gray-600">
                    See location on floor plan
                  </Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={20} color="#9ca3af" />
              </Pressable>

              <Pressable
                onPress={() => router.push('/(app)/venue/info' as any)}
                className="flex-row items-center p-3 bg-gray-50 rounded-lg"
              >
                <MaterialCommunityIcons name="information" size={24} color="#6366f1" />
                <View className="ml-3 flex-1">
                  <Text className="font-medium">Venue Information</Text>
                  <Text className="text-xs text-gray-600">
                    Address, parking, amenities
                  </Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={20} color="#9ca3af" />
              </Pressable>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
