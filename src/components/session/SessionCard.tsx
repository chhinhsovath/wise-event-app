import { View, Pressable } from 'react-native';
import { Card, Text, Chip, IconButton } from 'react-native-paper';
import { Session } from '@/types';
import { format } from 'date-fns';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface SessionCardProps {
  session: Session;
  onBookmark?: (sessionId: string) => void;
  isBookmarked?: boolean;
}

/**
 * Session Card Component
 * Displays session information in a card format
 */
export function SessionCard({ session, onBookmark, isBookmarked = false }: SessionCardProps) {
  const router = useRouter();

  const handlePress = () => {
    router.push(`/(app)/session/${session.$id}`);
  };

  const handleBookmark = () => {
    if (onBookmark) {
      onBookmark(session.$id);
    }
  };

  // Format time
  const startTime = format(new Date(session.startTime), 'h:mm a');
  const endTime = format(new Date(session.endTime), 'h:mm a');
  const date = format(new Date(session.startTime), 'MMM dd');

  // Get session type color
  const getTypeColor = (type: string): string => {
    const colors: Record<string, string> = {
      keynote: '#3b82f6',
      panel: '#8b5cf6',
      workshop: '#10b981',
      networking: '#f59e0b',
      breakout: '#ef4444',
      exhibition: '#06b6d4',
    };
    return colors[type] || '#6b7280';
  };

  // Calculate capacity percentage
  const capacityPercent = session.capacity
    ? Math.round((session.currentAttendees / session.capacity) * 100)
    : 0;

  const isNearCapacity = capacityPercent >= 80;
  const isFull = capacityPercent >= 100;

  return (
    <Card className="mb-3" mode="outlined">
      <Pressable onPress={handlePress}>
        <Card.Content>
          {/* Header with time and bookmark */}
          <View className="flex-row justify-between items-start mb-2">
            <View className="flex-1">
              <Text className="text-sm text-gray-600">
                {date} • {startTime} - {endTime}
              </Text>
            </View>
            <IconButton
              icon={isBookmarked ? 'bookmark' : 'bookmark-outline'}
              size={20}
              iconColor={isBookmarked ? '#3b82f6' : '#6b7280'}
              onPress={handleBookmark}
            />
          </View>

          {/* Title */}
          <Text className="text-lg font-semibold mb-2">
            {session.title}
          </Text>

          {/* Session type chip */}
          <View className="flex-row items-center mb-3">
            <Chip
              mode="outlined"
              textStyle={{ fontSize: 11, color: getTypeColor(session.type) }}
              style={{
                borderColor: getTypeColor(session.type),
                height: 24,
                marginRight: 8,
              }}
            >
              {session.type.toUpperCase()}
            </Chip>
            {session.isFeatured && (
              <Ionicons name="star" size={16} color="#f59e0b" />
            )}
          </View>

          {/* Location */}
          <View className="flex-row items-center mb-2">
            <Ionicons name="location-outline" size={16} color="#6b7280" />
            <Text className="text-sm text-gray-600 ml-1">
              {session.room}{session.floor && ` • ${session.floor}`}
            </Text>
          </View>

          {/* Capacity indicator */}
          {session.capacity && (
            <View className="flex-row items-center">
              <Ionicons
                name="people-outline"
                size={16}
                color={isFull ? '#ef4444' : isNearCapacity ? '#f59e0b' : '#6b7280'}
              />
              <Text
                className="text-sm ml-1"
                style={{
                  color: isFull ? '#ef4444' : isNearCapacity ? '#f59e0b' : '#6b7280',
                }}
              >
                {session.currentAttendees} / {session.capacity}
                {isFull ? ' (Full)' : isNearCapacity ? ' (Almost Full)' : ''}
              </Text>
            </View>
          )}

          {/* Track tag */}
          {session.track && (
            <View className="mt-2">
              <Text className="text-xs text-gray-500">
                Track: {session.track}
              </Text>
            </View>
          )}
        </Card.Content>
      </Pressable>
    </Card>
  );
}
