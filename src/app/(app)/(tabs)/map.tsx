import { useState } from 'react';
import { View, ScrollView, Pressable, Dimensions } from 'react-native';
import { Text, Card, Chip, SegmentedButtons, IconButton, Searchbar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { mockVenue, getRoomsByFloor, searchRooms } from '@/lib/mockData';
import { VenueRoom } from '@/types';
import { MaterialCommunityIcons } from '@expo/vector-icons';

/**
 * Venue Map Screen
 * Interactive venue navigation with floor plans
 */
export default function Map() {
  const router = useRouter();
  const [selectedFloor, setSelectedFloor] = useState('ground');
  const [searchQuery, setSearchQuery] = useState('');
  const [view, setView] = useState<'map' | 'list'>('map');

  // Get current floor data
  const currentFloor = mockVenue.floors.find((f) => f.id === selectedFloor);
  const rooms = searchQuery
    ? searchRooms(searchQuery).filter((r) => r.floor === currentFloor?.name)
    : getRoomsByFloor(selectedFloor);

  // Floor buttons for segmented control
  const floorButtons = mockVenue.floors.map((floor) => ({
    value: floor.id,
    label: floor.name,
  }));

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

  const handleRoomPress = (room: VenueRoom) => {
    router.push(`/(app)/venue/room/${room.id}` as any);
  };

  const handleVenueInfo = () => {
    router.push('/(app)/venue/info' as any);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      {/* Header */}
      <View className="bg-white px-4 py-3 border-b border-gray-200">
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-2xl font-bold">Venue Map</Text>
            <Text className="text-sm text-gray-600">{mockVenue.name}</Text>
          </View>
          <IconButton icon="information" onPress={handleVenueInfo} />
        </View>
      </View>

      {/* Search */}
      <View className="px-4 py-3 bg-white border-b border-gray-200">
        <Searchbar
          placeholder="Search rooms..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          elevation={0}
          style={{ backgroundColor: '#f3f4f6' }}
        />
      </View>

      {/* Floor Selector */}
      <View className="px-4 py-3 bg-white border-b border-gray-200">
        <SegmentedButtons
          value={selectedFloor}
          onValueChange={setSelectedFloor}
          buttons={floorButtons}
          density="small"
        />
      </View>

      {/* View Toggle */}
      <View className="px-4 py-2 bg-white border-b border-gray-200 flex-row justify-end">
        <View className="flex-row">
          <Pressable
            onPress={() => setView('map')}
            className={`px-4 py-2 rounded-l-lg ${view === 'map' ? 'bg-primary-100' : 'bg-gray-100'}`}
          >
            <MaterialCommunityIcons
              name="map"
              size={20}
              color={view === 'map' ? '#6366f1' : '#6b7280'}
            />
          </Pressable>
          <Pressable
            onPress={() => setView('list')}
            className={`px-4 py-2 rounded-r-lg ${view === 'list' ? 'bg-primary-100' : 'bg-gray-100'}`}
          >
            <MaterialCommunityIcons
              name="format-list-bulleted"
              size={20}
              color={view === 'list' ? '#6366f1' : '#6b7280'}
            />
          </Pressable>
        </View>
      </View>

      <ScrollView>
        {view === 'map' ? (
          /* Map View - Simple floor plan with room markers */
          <View className="p-4">
            <Card className="mb-4">
              <Card.Content>
                {/* Floor Plan Container */}
                <View className="relative bg-gray-100 rounded-lg" style={{ height: 400 }}>
                  {/* Floor Plan Placeholder */}
                  <View className="absolute inset-0 items-center justify-center">
                    <MaterialCommunityIcons name="floor-plan" size={80} color="#d1d5db" />
                    <Text className="text-gray-400 mt-2">{currentFloor?.name}</Text>
                  </View>

                  {/* Room Markers */}
                  {rooms.map((room) => (
                    <Pressable
                      key={room.id}
                      onPress={() => handleRoomPress(room)}
                      style={{
                        position: 'absolute',
                        left: `${room.coordinates.x}%`,
                        top: `${room.coordinates.y}%`,
                        transform: [{ translateX: -20 }, { translateY: -20 }],
                      }}
                      className="items-center"
                    >
                      <View
                        className="w-10 h-10 rounded-full items-center justify-center shadow-lg"
                        style={{ backgroundColor: getRoomTypeColor(room.type) }}
                      >
                        <MaterialCommunityIcons
                          name={getRoomTypeIcon(room.type) as any}
                          size={20}
                          color="white"
                        />
                      </View>
                      <View className="bg-white px-2 py-1 rounded mt-1 shadow">
                        <Text className="text-xs font-medium">{room.name}</Text>
                      </View>
                    </Pressable>
                  ))}
                </View>

                {/* Legend */}
                <View className="mt-4">
                  <Text className="text-sm font-semibold mb-2">Room Types</Text>
                  <View className="flex-row flex-wrap gap-2">
                    {['main-hall', 'conference', 'workshop', 'networking', 'breakout'].map((type) => (
                      <View key={type} className="flex-row items-center">
                        <View
                          className="w-3 h-3 rounded-full mr-1"
                          style={{ backgroundColor: getRoomTypeColor(type) }}
                        />
                        <Text className="text-xs text-gray-600 capitalize">
                          {type.replace('-', ' ')}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              </Card.Content>
            </Card>

            {/* Quick Actions */}
            <Card>
              <Card.Content>
                <Text className="text-base font-semibold mb-3">Quick Access</Text>
                <View className="gap-2">
                  <Pressable
                    onPress={handleVenueInfo}
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
          </View>
        ) : (
          /* List View - Room cards */
          <View className="p-4">
            <Text className="text-sm text-gray-600 mb-3">
              {rooms.length} room{rooms.length !== 1 ? 's' : ''} on {currentFloor?.name}
            </Text>

            {rooms.map((room) => (
              <Pressable key={room.id} onPress={() => handleRoomPress(room)}>
                <Card className="mb-3">
                  <Card.Content>
                    <View className="flex-row items-start">
                      <View
                        className="w-12 h-12 rounded-lg items-center justify-center"
                        style={{ backgroundColor: getRoomTypeColor(room.type) + '20' }}
                      >
                        <MaterialCommunityIcons
                          name={getRoomTypeIcon(room.type) as any}
                          size={24}
                          color={getRoomTypeColor(room.type)}
                        />
                      </View>

                      <View className="ml-3 flex-1">
                        <Text className="text-base font-semibold">{room.name}</Text>
                        <Text className="text-sm text-gray-600 mb-2">{room.floor}</Text>

                        <View className="flex-row items-center mb-2">
                          <MaterialCommunityIcons name="account-group" size={14} color="#6b7280" />
                          <Text className="text-xs text-gray-600 ml-1">
                            Capacity: {room.capacity}
                          </Text>
                          <View className="ml-3">
                            <Chip
                              mode="outlined"
                              compact
                              textStyle={{ fontSize: 10 }}
                              style={{ height: 24 }}
                            >
                              {room.type.replace('-', ' ')}
                            </Chip>
                          </View>
                        </View>

                        {room.amenities && room.amenities.length > 0 && (
                          <View className="flex-row flex-wrap gap-1">
                            {room.amenities.slice(0, 3).map((amenity, index) => (
                              <Chip
                                key={index}
                                mode="flat"
                                compact
                                textStyle={{ fontSize: 10 }}
                                style={{ height: 20 }}
                              >
                                {amenity}
                              </Chip>
                            ))}
                            {room.amenities.length > 3 && (
                              <Chip
                                mode="flat"
                                compact
                                textStyle={{ fontSize: 10 }}
                                style={{ height: 20 }}
                              >
                                +{room.amenities.length - 3}
                              </Chip>
                            )}
                          </View>
                        )}
                      </View>

                      <MaterialCommunityIcons name="chevron-right" size={20} color="#9ca3af" />
                    </View>
                  </Card.Content>
                </Card>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
