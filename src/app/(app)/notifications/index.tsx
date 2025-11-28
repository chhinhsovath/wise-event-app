import { useState, useEffect } from 'react';
import { View, ScrollView, Pressable, RefreshControl } from 'react-native';
import { Text, Card, Button, Chip, SegmentedButtons, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { NotificationsService } from '@/services';
import { Notification } from '@/types';
import { formatNotificationTime, clearBadge } from '@/lib/notifications';

/**
 * Notifications Center Screen
 * View and manage all user notifications
 */
export default function NotificationsCenter() {
  const router = useRouter();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadNotifications();
    clearBadge(); // Clear badge when viewing notifications
  }, [filter]);

  const loadNotifications = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const data =
        filter === 'unread'
          ? await NotificationsService.getUnreadNotifications(user.id)
          : await NotificationsService.getUserNotifications(user.id);
      setNotifications(data);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadNotifications();
  };

  const handleNotificationPress = async (notification: Notification) => {
    // Mark as read
    if (!notification.isRead) {
      try {
        await NotificationsService.markAsRead(notification.$id);
        setNotifications((prev) =>
          prev.map((n) => (n.$id === notification.$id ? { ...n, isRead: true } : n))
        );
      } catch (error) {
        console.error('Error marking as read:', error);
      }
    }

    // Navigate based on notification type
    const { type, data } = notification;

    switch (type) {
      case 'session_reminder':
        if (data?.sessionId) {
          router.push(`/(app)/session/${data.sessionId}` as any);
        }
        break;
      case 'message':
        if (data?.conversationId) {
          router.push(`/(app)/chat/${data.conversationId}` as any);
        }
        break;
      case 'connection_request':
      case 'connection_accepted':
        router.push('/(app)/network/connections' as any);
        break;
      case 'schedule_change':
        if (data?.sessionId) {
          router.push(`/(app)/session/${data.sessionId}` as any);
        }
        break;
      default:
        break;
    }
  };

  const handleMarkAllRead = async () => {
    if (!user) return;

    try {
      await NotificationsService.markAllAsRead(user.id);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await NotificationsService.deleteNotification(notificationId);
      setNotifications((prev) => prev.filter((n) => n.$id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getNotificationIcon = (type: string): string => {
    const icons: Record<string, string> = {
      session_reminder: 'calendar-alert',
      message: 'message-alert',
      connection_request: 'account-multiple-plus',
      connection_accepted: 'account-check',
      announcement: 'bullhorn',
      schedule_change: 'calendar-sync',
    };
    return icons[type] || 'bell';
  };

  const getNotificationColor = (type: string): string => {
    const colors: Record<string, string> = {
      session_reminder: '#3b82f6',
      message: '#10b981',
      connection_request: '#f59e0b',
      connection_accepted: '#10b981',
      announcement: '#ef4444',
      schedule_change: '#f59e0b',
    };
    return colors[type] || '#6b7280';
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      {/* Header */}
      <View className="bg-white px-4 py-3 border-b border-gray-200">
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-2xl font-bold">Notifications</Text>
            {unreadCount > 0 && (
              <Text className="text-sm text-gray-600">{unreadCount} unread</Text>
            )}
          </View>
          <IconButton
            icon="cog"
            onPress={() => router.push('/(app)/settings/notifications' as any)}
          />
        </View>
      </View>

      {/* Filter Tabs */}
      <View className="px-4 py-3 bg-white border-b border-gray-200">
        <View className="flex-row items-center justify-between">
          <SegmentedButtons
            value={filter}
            onValueChange={(value) => setFilter(value as 'all' | 'unread')}
            buttons={[
              { value: 'all', label: 'All' },
              { value: 'unread', label: `Unread (${unreadCount})` },
            ]}
            density="small"
            style={{ flex: 1 }}
          />
          {unreadCount > 0 && (
            <Button
              mode="text"
              onPress={handleMarkAllRead}
              compact
              className="ml-2"
            >
              Mark all read
            </Button>
          )}
        </View>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {loading && notifications.length === 0 ? (
          <View className="items-center justify-center p-8">
            <MaterialCommunityIcons name="bell-outline" size={64} color="#d1d5db" />
            <Text className="text-gray-500 mt-4">Loading notifications...</Text>
          </View>
        ) : notifications.length === 0 ? (
          <View className="items-center justify-center p-8">
            <MaterialCommunityIcons name="bell-off-outline" size={64} color="#d1d5db" />
            <Text className="text-gray-500 mt-4">
              {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
            </Text>
            <Text className="text-sm text-gray-400 mt-2 text-center">
              You'll see session reminders, messages, and updates here
            </Text>
          </View>
        ) : (
          <View className="p-4 gap-3">
            {notifications.map((notification) => {
              const iconName = getNotificationIcon(notification.type);
              const iconColor = getNotificationColor(notification.type);

              return (
                <Pressable
                  key={notification.$id}
                  onPress={() => handleNotificationPress(notification)}
                >
                  <Card
                    className={notification.isRead ? 'opacity-60' : ''}
                    style={!notification.isRead ? { borderLeftWidth: 4, borderLeftColor: iconColor } : {}}
                  >
                    <Card.Content>
                      <View className="flex-row items-start">
                        <View
                          className="w-10 h-10 rounded-full items-center justify-center"
                          style={{ backgroundColor: iconColor + '20' }}
                        >
                          <MaterialCommunityIcons
                            name={iconName as any}
                            size={20}
                            color={iconColor}
                          />
                        </View>

                        <View className="ml-3 flex-1">
                          <View className="flex-row items-start justify-between mb-1">
                            <Text className={`text-base ${!notification.isRead ? 'font-bold' : 'font-medium'} flex-1`}>
                              {notification.title}
                            </Text>
                            <IconButton
                              icon="close"
                              size={16}
                              onPress={() => handleDeleteNotification(notification.$id)}
                            />
                          </View>

                          <Text className="text-sm text-gray-700 mb-2">
                            {notification.body}
                          </Text>

                          <View className="flex-row items-center justify-between">
                            <Text className="text-xs text-gray-500">
                              {formatNotificationTime(new Date(notification.$createdAt))}
                            </Text>
                            {!notification.isRead && (
                              <Chip
                                mode="flat"
                                compact
                                textStyle={{ fontSize: 10 }}
                                style={{ height: 20, backgroundColor: iconColor + '20' }}
                              >
                                New
                              </Chip>
                            )}
                          </View>
                        </View>
                      </View>
                    </Card.Content>
                  </Card>
                </Pressable>
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
