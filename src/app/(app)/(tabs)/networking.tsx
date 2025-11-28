import { useState, useEffect } from 'react';
import { View, FlatList, Image, Pressable, RefreshControl } from 'react-native';
import { Text, Searchbar, Chip, Card, Badge, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { UsersService } from '@/services';
import { UserProfile } from '@/types';
import { MaterialCommunityIcons } from '@expo/vector-icons';

/**
 * Networking / Attendee Directory Screen
 * Browse and connect with other event attendees (Appwrite integrated)
 */
export default function Networking() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [attendees, setAttendees] = useState<UserProfile[]>([]);
  const [filteredAttendees, setFilteredAttendees] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Default event ID
  const EVENT_ID = 'event-1';

  useEffect(() => {
    loadAttendees();
  }, []);

  useEffect(() => {
    applySearch();
  }, [attendees, searchQuery]);

  const loadAttendees = async () => {
    try {
      setLoading(true);
      setError(null);

      const users = await UsersService.getEventAttendees(EVENT_ID);
      setAttendees(users);
    } catch (err: any) {
      console.error('Error loading attendees:', err);
      setError(err.message || 'Failed to load attendees');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const applySearch = () => {
    if (!searchQuery.trim()) {
      setFilteredAttendees(attendees);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = attendees.filter(
      (user) =>
        user.fullName.toLowerCase().includes(query) ||
        user.organization?.toLowerCase().includes(query) ||
        user.title?.toLowerCase().includes(query) ||
        user.interests?.some((interest) => interest.toLowerCase().includes(query))
    );

    setFilteredAttendees(filtered);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadAttendees();
  };

  const handleAttendeePress = (attendee: UserProfile) => {
    router.push(`/(app)/attendee/${attendee.$id}` as any);
  };

  const renderAttendee = ({ item }: { item: UserProfile }) => (
    <Pressable onPress={() => handleAttendeePress(item)}>
      <Card className="mb-3">
        <Card.Content>
          <View className="flex-row items-start">
            {/* Avatar */}
            {item.avatar ? (
              <Image
                source={{ uri: item.avatar }}
                className="w-16 h-16 rounded-full"
                resizeMode="cover"
              />
            ) : (
              <View className="w-16 h-16 rounded-full bg-primary-100 items-center justify-center">
                <Text className="text-2xl text-primary-600">
                  {item.fullName.charAt(0)}
                </Text>
              </View>
            )}

            {/* Info */}
            <View className="ml-3 flex-1">
              <View className="flex-row items-center justify-between mb-1">
                <Text className="text-base font-semibold flex-1">
                  {item.fullName}
                </Text>
                {item.badges && item.badges.length > 0 && (
                  <Badge size={20}>{item.badges.length}</Badge>
                )}
              </View>

              <Text className="text-sm text-gray-600 mb-1">
                {item.title}
              </Text>

              {item.organization && (
                <View className="flex-row items-center mb-2">
                  <MaterialCommunityIcons
                    name="office-building"
                    size={14}
                    color="#6b7280"
                  />
                  <Text className="text-sm text-gray-500 ml-1">
                    {item.organization}
                  </Text>
                </View>
              )}

              {/* Interests */}
              {item.interests && item.interests.length > 0 && (
                <View className="flex-row flex-wrap gap-1 mt-1">
                  {item.interests.slice(0, 3).map((interest, index) => (
                    <Chip
                      key={index}
                      mode="outlined"
                      compact
                      textStyle={{ fontSize: 11 }}
                    >
                      {interest}
                    </Chip>
                  ))}
                  {item.interests.length > 3 && (
                    <Chip mode="outlined" compact textStyle={{ fontSize: 11 }}>
                      +{item.interests.length - 3}
                    </Chip>
                  )}
                </View>
              )}
            </View>

            {/* Chevron */}
            <View className="justify-center ml-2">
              <MaterialCommunityIcons
                name="chevron-right"
                size={24}
                color="#9ca3af"
              />
            </View>
          </View>
        </Card.Content>
      </Card>
    </Pressable>
  );

  const renderEmpty = () => {
    if (loading) {
      return null;
    }

    return (
      <View className="flex-1 items-center justify-center p-8 mt-20">
        <MaterialCommunityIcons name="account-search" size={80} color="#d1d5db" />
        <Text className="text-2xl font-bold mb-2 text-center mt-4">
          {searchQuery ? 'No Attendees Found' : 'No Attendees Yet'}
        </Text>
        <Text className="text-base text-gray-600 text-center">
          {searchQuery
            ? 'Try adjusting your search query'
            : 'Attendees will appear here once they join the event'}
        </Text>
      </View>
    );
  };

  // Loading state
  if (loading && !refreshing) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="bg-white px-4 py-3 border-b border-gray-200">
          <Text className="text-2xl font-bold">Networking</Text>
          <Text className="text-sm text-gray-600">Loading...</Text>
        </View>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#6366f1" />
          <Text className="mt-4 text-gray-600">Loading attendees...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error && attendees.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="bg-white px-4 py-3 border-b border-gray-200">
          <Text className="text-2xl font-bold">Networking</Text>
        </View>
        <View className="flex-1 items-center justify-center p-4">
          <MaterialCommunityIcons name="alert-circle" size={64} color="#ef4444" />
          <Text className="mt-4 text-lg font-semibold text-gray-900">Error Loading Attendees</Text>
          <Text className="mt-2 text-center text-gray-600">{error}</Text>
          <Pressable
            onPress={loadAttendees}
            className="mt-4 px-6 py-3 bg-primary rounded-lg"
          >
            <Text className="text-white font-semibold">Retry</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      {/* Header */}
      <View className="bg-white px-4 py-3 border-b border-gray-200">
        <Text className="text-2xl font-bold">Networking</Text>
        <Text className="text-sm text-gray-600">
          {filteredAttendees.length} attendee{filteredAttendees.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* Search */}
      <View className="px-4 py-3 bg-white border-b border-gray-200">
        <Searchbar
          placeholder="Search by name, organization, or interests..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          elevation={0}
          style={{ backgroundColor: '#f3f4f6' }}
        />
      </View>

      {/* Attendee List */}
      <FlatList
        data={filteredAttendees}
        renderItem={renderAttendee}
        keyExtractor={(item) => item.$id}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      />
    </SafeAreaView>
  );
}
