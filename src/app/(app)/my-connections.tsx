import { View, ScrollView, FlatList, Image, Pressable } from 'react-native';
import { Text, Button, Card, Chip, Divider, SegmentedButtons } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { useConnections } from '@/hooks/useConnections';
import { getAttendeeById } from '@/lib/mockData';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Connection } from '@/types';

/**
 * My Connections Screen
 * Shows all connections and pending requests
 */
export default function MyConnections() {
  const router = useRouter();
  const {
    connections,
    pendingRequests,
    sentRequests,
    acceptConnection,
    declineConnection,
    removeConnection,
  } = useConnections();

  const [activeTab, setActiveTab] = useState<'connections' | 'requests' | 'sent'>('connections');

  const renderConnectionCard = (connection: Connection, showActions = false) => {
    // Determine which user to display
    const otherUserId =
      connection.requesterId === 'current-user' // TODO: Replace with actual user ID
        ? connection.recipientId
        : connection.requesterId;

    const attendee = getAttendeeById(otherUserId);

    if (!attendee) return null;

    return (
      <Card key={connection.$id} className="mb-3">
        <Card.Content>
          <View className="flex-row items-start">
            {/* Avatar */}
            {attendee.avatar ? (
              <Image
                source={{ uri: attendee.avatar }}
                className="w-16 h-16 rounded-full"
                resizeMode="cover"
              />
            ) : (
              <View className="w-16 h-16 rounded-full bg-primary-100 items-center justify-center">
                <Text className="text-2xl text-primary-600">
                  {attendee.fullName.charAt(0)}
                </Text>
              </View>
            )}

            {/* Info */}
            <View className="ml-3 flex-1">
              <Pressable onPress={() => router.push(`/(app)/attendee/${attendee.$id}` as any)}>
                <Text className="text-base font-semibold">{attendee.fullName}</Text>
                <Text className="text-sm text-gray-600 mb-1">{attendee.title}</Text>
                {attendee.organization && (
                  <View className="flex-row items-center mb-2">
                    <MaterialCommunityIcons
                      name="office-building"
                      size={14}
                      color="#6b7280"
                    />
                    <Text className="text-sm text-gray-500 ml-1">
                      {attendee.organization}
                    </Text>
                  </View>
                )}
              </Pressable>

              {/* Connection Message */}
              {connection.message && (
                <View className="bg-gray-50 p-2 rounded mt-2">
                  <Text className="text-sm text-gray-700 italic">
                    "{connection.message}"
                  </Text>
                </View>
              )}

              {/* Actions */}
              {showActions && (
                <View className="flex-row gap-2 mt-3">
                  <Button
                    mode="contained"
                    compact
                    onPress={() => acceptConnection(connection.$id)}
                    style={{ flex: 1 }}
                  >
                    Accept
                  </Button>
                  <Button
                    mode="outlined"
                    compact
                    onPress={() => declineConnection(connection.$id)}
                    style={{ flex: 1 }}
                  >
                    Decline
                  </Button>
                </View>
              )}
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const renderEmpty = (type: 'connections' | 'requests' | 'sent') => {
    const messages = {
      connections: {
        emoji: '🤝',
        title: 'No Connections Yet',
        subtitle: 'Start connecting with attendees to build your network',
        action: 'Browse Attendees',
        route: '/(app)/(tabs)/networking',
      },
      requests: {
        emoji: '📬',
        title: 'No Pending Requests',
        subtitle: 'You have no connection requests at the moment',
        action: null,
        route: null,
      },
      sent: {
        emoji: '📤',
        title: 'No Sent Requests',
        subtitle: 'You haven\'t sent any connection requests yet',
        action: 'Browse Attendees',
        route: '/(app)/(tabs)/networking',
      },
    };

    const message = messages[type];

    return (
      <View className="flex-1 items-center justify-center p-8 mt-20">
        <Text className="text-6xl mb-4">{message.emoji}</Text>
        <Text className="text-2xl font-bold mb-2 text-center">
          {message.title}
        </Text>
        <Text className="text-base text-gray-600 text-center mb-6">
          {message.subtitle}
        </Text>
        {message.action && message.route && (
          <Button
            mode="contained"
            icon="account-group"
            onPress={() => router.push(message.route as any)}
          >
            {message.action}
          </Button>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <Stack.Screen
        options={{
          title: 'My Connections',
          headerShown: true,
          headerBackTitle: 'Back',
        }}
      />

      {/* Header */}
      <View className="bg-white px-4 py-3 border-b border-gray-200">
        <Text className="text-2xl font-bold">My Connections</Text>
        <Text className="text-sm text-gray-600">
          {connections.length} connection{connections.length !== 1 ? 's' : ''}
          {pendingRequests.length > 0 && ` • ${pendingRequests.length} pending`}
        </Text>
      </View>

      {/* Tabs */}
      <View className="px-4 py-3 bg-white border-b border-gray-200">
        <SegmentedButtons
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as any)}
          buttons={[
            {
              value: 'connections',
              label: `Connections (${connections.length})`,
            },
            {
              value: 'requests',
              label: `Requests (${pendingRequests.length})`,
              showSelectedCheck: pendingRequests.length > 0,
            },
            {
              value: 'sent',
              label: `Sent (${sentRequests.length})`,
            },
          ]}
          density="small"
        />
      </View>

      {/* Content */}
      <ScrollView className="flex-1">
        <View className="p-4">
          {/* Connections Tab */}
          {activeTab === 'connections' && (
            <>
              {connections.length === 0 ? (
                renderEmpty('connections')
              ) : (
                connections.map((connection) => renderConnectionCard(connection))
              )}
            </>
          )}

          {/* Pending Requests Tab */}
          {activeTab === 'requests' && (
            <>
              {pendingRequests.length === 0 ? (
                renderEmpty('requests')
              ) : (
                pendingRequests.map((connection) => renderConnectionCard(connection, true))
              )}
            </>
          )}

          {/* Sent Requests Tab */}
          {activeTab === 'sent' && (
            <>
              {sentRequests.length === 0 ? (
                renderEmpty('sent')
              ) : (
                sentRequests.map((connection) => (
                  <Card key={connection.$id} className="mb-3">
                    <Card.Content>
                      {renderConnectionCard(connection)}
                      <Button
                        mode="text"
                        icon="close"
                        onPress={() => removeConnection(connection.$id)}
                        textColor="#ef4444"
                      >
                        Cancel Request
                      </Button>
                    </Card.Content>
                  </Card>
                ))
              )}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
