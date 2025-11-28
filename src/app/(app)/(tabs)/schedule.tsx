import { useState, useEffect } from 'react';
import { View, FlatList, RefreshControl } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SessionCard } from '@/components/session/SessionCard';
import { SessionFilters } from '@/components/session/SessionFilters';
import { SessionsService } from '@/services';
import { Session } from '@/types';
import { useBookmarks } from '@/hooks/useBookmarks';

/**
 * Schedule Screen
 * Displays full event schedule with filtering (Appwrite integrated)
 */
export default function Schedule() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<{
    type?: string;
    track?: string;
    date?: string;
    searchQuery?: string;
  }>({});
  const { toggleBookmark, isBookmarked } = useBookmarks();

  // Default event ID - in production, get from context or navigation
  const EVENT_ID = 'event-1';

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [sessions, filters]);

  const loadSessions = async () => {
    try {
      setLoading(true);
      setError(null);

      const allSessions = await SessionsService.getSessionsByEvent(EVENT_ID);
      setSessions(allSessions);
    } catch (err: any) {
      console.error('Error loading sessions:', err);
      setError(err.message || 'Failed to load sessions');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...sessions];

    // Apply type filter
    if (filters.type) {
      filtered = filtered.filter((s) => s.type === filters.type);
    }

    // Apply track filter
    if (filters.track) {
      filtered = filtered.filter((s) => s.track === filters.track);
    }

    // Apply date filter
    if (filters.date) {
      filtered = filtered.filter((s) => {
        const sessionDate = new Date(s.startTime).toDateString();
        return sessionDate === new Date(filters.date!).toDateString();
      });
    }

    // Apply search query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.title.toLowerCase().includes(query) ||
          s.description?.toLowerCase().includes(query) ||
          s.tags?.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    setFilteredSessions(filtered);
  };

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadSessions();
  };

  const renderSession = ({ item }: { item: Session }) => (
    <SessionCard
      session={item}
      onBookmark={toggleBookmark}
      isBookmarked={isBookmarked(item.$id)}
    />
  );

  const renderEmpty = () => {
    if (loading) {
      return null;
    }

    return (
      <View className="flex-1 items-center justify-center p-8">
        <MaterialCommunityIcons name="calendar-blank" size={64} color="#d1d5db" />
        <Text className="text-lg text-gray-600 text-center mt-4">
          No sessions found matching your filters
        </Text>
        <Text className="text-sm text-gray-500 text-center mt-2">
          Try adjusting your search or filters
        </Text>
      </View>
    );
  };

  // Loading state
  if (loading && !refreshing) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="bg-white px-4 py-3 border-b border-gray-200">
          <Text className="text-2xl font-bold">Event Schedule</Text>
          <Text className="text-sm text-gray-600">Loading...</Text>
        </View>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#6366f1" />
          <Text className="mt-4 text-gray-600">Loading sessions...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error && sessions.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="bg-white px-4 py-3 border-b border-gray-200">
          <Text className="text-2xl font-bold">Event Schedule</Text>
        </View>
        <View className="flex-1 items-center justify-center p-4">
          <MaterialCommunityIcons name="alert-circle" size={64} color="#ef4444" />
          <Text className="mt-4 text-lg font-semibold text-gray-900">Error Loading Sessions</Text>
          <Text className="mt-2 text-center text-gray-600">{error}</Text>
          <Text className="mt-4 px-6 py-3 bg-primary rounded-lg text-white" onPress={loadSessions}>
            Retry
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      {/* Header */}
      <View className="bg-white px-4 py-3 border-b border-gray-200">
        <Text className="text-2xl font-bold">Event Schedule</Text>
        <Text className="text-sm text-gray-600">
          {sessions.length} session{sessions.length !== 1 ? 's' : ''} available
        </Text>
      </View>

      {/* Filters */}
      <SessionFilters onFilterChange={handleFilterChange} />

      {/* Session List */}
      <FlatList
        data={filteredSessions}
        renderItem={renderSession}
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
