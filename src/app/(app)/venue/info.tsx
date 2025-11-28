import { View, ScrollView, Pressable, Linking } from 'react-native';
import { Text, Card, Chip, Button, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { mockVenue } from '@/lib/mockData';
import { MaterialCommunityIcons } from '@expo/vector-icons';

/**
 * Venue Information Screen
 * Displays comprehensive venue details, amenities, and practical information
 */
export default function VenueInfo() {
  const router = useRouter();

  const handleOpenMap = () => {
    if (mockVenue.coordinates) {
      const url = `https://maps.google.com/?q=${mockVenue.coordinates.latitude},${mockVenue.coordinates.longitude}`;
      Linking.openURL(url);
    }
  };

  const handleCallEmergency = () => {
    if (mockVenue.emergencyInfo?.contact) {
      Linking.openURL(`tel:${mockVenue.emergencyInfo.contact}`);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      {/* Header */}
      <View className="bg-white px-4 py-3 border-b border-gray-200">
        <View className="flex-row items-center">
          <Pressable onPress={() => router.back()} className="mr-3">
            <MaterialCommunityIcons name="arrow-left" size={24} color="#000" />
          </Pressable>
          <View className="flex-1">
            <Text className="text-xl font-bold">Venue Information</Text>
            <Text className="text-sm text-gray-600">{mockVenue.name}</Text>
          </View>
        </View>
      </View>

      <ScrollView>
        {/* Venue Overview */}
        <Card className="m-4">
          <Card.Content>
            <View className="flex-row items-start mb-4">
              <View
                className="w-16 h-16 rounded-xl items-center justify-center bg-primary-100"
              >
                <MaterialCommunityIcons name="office-building" size={32} color="#6366f1" />
              </View>
              <View className="ml-4 flex-1">
                <Text className="text-2xl font-bold mb-1">{mockVenue.name}</Text>
                <Text className="text-base text-gray-700">{mockVenue.address}</Text>
              </View>
            </View>

            <Divider className="my-4" />

            {/* Quick Actions */}
            <View className="gap-2">
              {mockVenue.coordinates && (
                <Button
                  mode="contained"
                  icon="map-marker"
                  onPress={handleOpenMap}
                  className="rounded-lg"
                >
                  Open in Maps
                </Button>
              )}

              <Button
                mode="outlined"
                icon="floor-plan"
                onPress={() => router.push('/(app)/(tabs)/map' as any)}
                className="rounded-lg"
              >
                View Floor Plan
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* Floors Overview */}
        <Card className="mx-4 mb-4">
          <Card.Content>
            <View className="flex-row items-center mb-3">
              <MaterialCommunityIcons name="stairs" size={24} color="#6366f1" />
              <Text className="text-lg font-semibold ml-2">Floors</Text>
            </View>

            <View className="gap-2">
              {mockVenue.floors.map((floor) => (
                <View
                  key={floor.id}
                  className="flex-row items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <View>
                    <Text className="font-semibold">{floor.name}</Text>
                    <Text className="text-sm text-gray-600">
                      {floor.rooms.length} room{floor.rooms.length !== 1 ? 's' : ''}
                    </Text>
                  </View>
                  <Chip mode="outlined" compact textStyle={{ fontSize: 12 }}>
                    Level {floor.level}
                  </Chip>
                </View>
              ))}
            </View>
          </Card.Content>
        </Card>

        {/* Parking */}
        {mockVenue.parking && (
          <Card className="mx-4 mb-4">
            <Card.Content>
              <View className="flex-row items-center mb-3">
                <MaterialCommunityIcons name="parking" size={24} color="#6366f1" />
                <Text className="text-lg font-semibold ml-2">Parking</Text>
                {mockVenue.parking.available && (
                  <Chip
                    mode="flat"
                    compact
                    icon={() => <MaterialCommunityIcons name="check" size={14} color="#10b981" />}
                    textStyle={{ fontSize: 12, color: '#10b981' }}
                    style={{ marginLeft: 8, backgroundColor: '#d1fae5' }}
                  >
                    Available
                  </Chip>
                )}
              </View>

              <View className="gap-2">
                <View className="flex-row items-start">
                  <MaterialCommunityIcons name="car" size={18} color="#6b7280" className="mt-1" />
                  <View className="ml-2 flex-1">
                    <Text className="text-sm font-semibold text-gray-700">Type</Text>
                    <Text className="text-sm text-gray-600">{mockVenue.parking.type}</Text>
                  </View>
                </View>

                <View className="flex-row items-start">
                  <MaterialCommunityIcons name="information" size={18} color="#6b7280" className="mt-1" />
                  <View className="ml-2 flex-1">
                    <Text className="text-sm font-semibold text-gray-700">Details</Text>
                    <Text className="text-sm text-gray-600">{mockVenue.parking.description}</Text>
                  </View>
                </View>
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Public Transit */}
        {mockVenue.transit && mockVenue.transit.length > 0 && (
          <Card className="mx-4 mb-4">
            <Card.Content>
              <View className="flex-row items-center mb-3">
                <MaterialCommunityIcons name="bus" size={24} color="#6366f1" />
                <Text className="text-lg font-semibold ml-2">Public Transit</Text>
              </View>

              <View className="gap-2">
                {mockVenue.transit.map((option, index) => (
                  <View key={index} className="flex-row items-start p-2 bg-gray-50 rounded-lg">
                    <MaterialCommunityIcons name="map-marker-path" size={16} color="#6b7280" className="mt-0.5" />
                    <Text className="text-sm text-gray-700 ml-2 flex-1">{option}</Text>
                  </View>
                ))}
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Amenities */}
        {mockVenue.amenities && mockVenue.amenities.length > 0 && (
          <Card className="mx-4 mb-4">
            <Card.Content>
              <View className="flex-row items-center mb-3">
                <MaterialCommunityIcons name="star-circle" size={24} color="#6366f1" />
                <Text className="text-lg font-semibold ml-2">Amenities</Text>
              </View>

              <View className="flex-row flex-wrap gap-2">
                {mockVenue.amenities.map((amenity, index) => (
                  <Chip
                    key={index}
                    mode="outlined"
                    icon={() => <MaterialCommunityIcons name="check-circle" size={16} color="#10b981" />}
                    textStyle={{ fontSize: 13 }}
                  >
                    {amenity}
                  </Chip>
                ))}
              </View>
            </Card.Content>
          </Card>
        )}

        {/* WiFi */}
        {mockVenue.wifi && (
          <Card className="mx-4 mb-4">
            <Card.Content>
              <View className="flex-row items-center mb-3">
                <MaterialCommunityIcons name="wifi" size={24} color="#6366f1" />
                <Text className="text-lg font-semibold ml-2">WiFi Access</Text>
              </View>

              <View className="p-4 bg-primary-50 rounded-lg">
                <View className="flex-row items-center mb-2">
                  <Text className="text-sm font-semibold text-gray-700">Network:</Text>
                  <Text className="text-sm text-gray-900 ml-2">{mockVenue.wifi.network}</Text>
                </View>

                {mockVenue.wifi.password && (
                  <View className="flex-row items-center">
                    <Text className="text-sm font-semibold text-gray-700">Password:</Text>
                    <Text className="text-sm text-gray-900 ml-2">{mockVenue.wifi.password}</Text>
                  </View>
                )}
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Emergency Information */}
        {mockVenue.emergencyInfo && (
          <Card className="mx-4 mb-4" style={{ borderColor: '#ef4444', borderWidth: 1 }}>
            <Card.Content>
              <View className="flex-row items-center mb-3">
                <MaterialCommunityIcons name="alert-circle" size={24} color="#ef4444" />
                <Text className="text-lg font-semibold ml-2" style={{ color: '#ef4444' }}>
                  Emergency Information
                </Text>
              </View>

              <View className="gap-3">
                {mockVenue.emergencyInfo.exits && mockVenue.emergencyInfo.exits.length > 0 && (
                  <View>
                    <Text className="text-sm font-semibold text-gray-700 mb-2">Emergency Exits</Text>
                    {mockVenue.emergencyInfo.exits.map((exit, index) => (
                      <View key={index} className="flex-row items-start mb-1">
                        <MaterialCommunityIcons name="exit-run" size={16} color="#6b7280" className="mt-0.5" />
                        <Text className="text-sm text-gray-600 ml-2">{exit}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {mockVenue.emergencyInfo.meetingPoint && (
                  <View>
                    <Text className="text-sm font-semibold text-gray-700 mb-1">Assembly Point</Text>
                    <View className="flex-row items-start">
                      <MaterialCommunityIcons name="account-group" size={16} color="#6b7280" className="mt-0.5" />
                      <Text className="text-sm text-gray-600 ml-2">
                        {mockVenue.emergencyInfo.meetingPoint}
                      </Text>
                    </View>
                  </View>
                )}

                {mockVenue.emergencyInfo.contact && (
                  <View>
                    <Text className="text-sm font-semibold text-gray-700 mb-2">Emergency Contact</Text>
                    <Button
                      mode="contained"
                      icon="phone"
                      onPress={handleCallEmergency}
                      className="rounded-lg"
                      buttonColor="#ef4444"
                    >
                      Call {mockVenue.emergencyInfo.contact}
                    </Button>
                  </View>
                )}
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Bottom Spacing */}
        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
