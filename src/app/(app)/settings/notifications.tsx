import { useState, useEffect } from 'react';
import { View, ScrollView, Pressable, Alert } from 'react-native';
import { Text, Card, Switch, Button, Chip, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  registerForPushNotificationsAsync,
  areNotificationsEnabled,
  DefaultNotificationSettings,
  NotificationSettings,
} from '@/lib/notifications';

/**
 * Notification Preferences Screen
 * Allows users to customize their notification settings
 */
export default function NotificationPreferences() {
  const router = useRouter();
  const [settings, setSettings] = useState<NotificationSettings>(DefaultNotificationSettings);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pushToken, setPushToken] = useState<string | null>(null);

  // Load settings from AsyncStorage
  useEffect(() => {
    loadSettings();
    checkPermissions();
  }, []);

  const loadSettings = async () => {
    try {
      const saved = await AsyncStorage.getItem('notificationSettings');
      if (saved) {
        setSettings(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (newSettings: NotificationSettings) => {
    try {
      await AsyncStorage.setItem('notificationSettings', JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Error saving notification settings:', error);
    }
  };

  const checkPermissions = async () => {
    const enabled = await areNotificationsEnabled();
    setPermissionGranted(enabled);
  };

  const requestPermissions = async () => {
    const token = await registerForPushNotificationsAsync();
    if (token) {
      setPushToken(token);
      setPermissionGranted(true);
      Alert.alert('Success', 'Push notifications enabled!');
    } else {
      Alert.alert(
        'Permission Denied',
        'Please enable notifications in your device settings to receive alerts.'
      );
    }
  };

  const toggleSetting = (key: keyof NotificationSettings) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    saveSettings(newSettings);
  };

  const toggleReminderTime = (minutes: number) => {
    const currentTimes = settings.reminderTimes;
    const newTimes = currentTimes.includes(minutes)
      ? currentTimes.filter((t) => t !== minutes)
      : [...currentTimes, minutes].sort((a, b) => b - a);

    saveSettings({ ...settings, reminderTimes: newTimes });
  };

  const resetToDefaults = () => {
    Alert.alert(
      'Reset to Defaults',
      'Are you sure you want to reset all notification settings to default?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => saveSettings(DefaultNotificationSettings),
        },
      ]
    );
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
            <Text className="text-xl font-bold">Notification Settings</Text>
            <Text className="text-sm text-gray-600">Manage your alerts and reminders</Text>
          </View>
        </View>
      </View>

      <ScrollView>
        {/* Permission Status */}
        <Card className="m-4">
          <Card.Content>
            <View className="flex-row items-center">
              <View
                className="w-12 h-12 rounded-full items-center justify-center"
                style={{
                  backgroundColor: permissionGranted ? '#d1fae5' : '#fee2e2',
                }}
              >
                <MaterialCommunityIcons
                  name={permissionGranted ? 'bell-check' : 'bell-off'}
                  size={24}
                  color={permissionGranted ? '#10b981' : '#ef4444'}
                />
              </View>
              <View className="ml-3 flex-1">
                <Text className="font-semibold">
                  {permissionGranted ? 'Notifications Enabled' : 'Notifications Disabled'}
                </Text>
                <Text className="text-sm text-gray-600">
                  {permissionGranted
                    ? 'You will receive push notifications'
                    : 'Enable to receive alerts'}
                </Text>
              </View>
            </View>

            {!permissionGranted && (
              <Button
                mode="contained"
                onPress={requestPermissions}
                className="mt-4"
                icon="bell-ring"
              >
                Enable Notifications
              </Button>
            )}

            {pushToken && (
              <View className="mt-3 p-2 bg-gray-50 rounded">
                <Text className="text-xs text-gray-500">Push Token Active</Text>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Session Reminders */}
        <Card className="mx-4 mb-4">
          <Card.Content>
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center flex-1">
                <MaterialCommunityIcons name="calendar-alert" size={24} color="#6366f1" />
                <View className="ml-3 flex-1">
                  <Text className="font-semibold">Session Reminders</Text>
                  <Text className="text-sm text-gray-600">
                    Get notified before sessions start
                  </Text>
                </View>
              </View>
              <Switch
                value={settings.sessionReminders}
                onValueChange={() => toggleSetting('sessionReminders')}
                disabled={!permissionGranted}
              />
            </View>

            {settings.sessionReminders && (
              <>
                <Divider className="my-3" />
                <Text className="text-sm font-semibold mb-2">Reminder Times</Text>
                <View className="flex-row flex-wrap gap-2">
                  {[30, 15, 10, 5].map((minutes) => (
                    <Pressable
                      key={minutes}
                      onPress={() => toggleReminderTime(minutes)}
                      disabled={!permissionGranted}
                    >
                      <Chip
                        selected={settings.reminderTimes.includes(minutes)}
                        mode={settings.reminderTimes.includes(minutes) ? 'flat' : 'outlined'}
                        icon={
                          settings.reminderTimes.includes(minutes)
                            ? () => <MaterialCommunityIcons name="check" size={16} color="#6366f1" />
                            : undefined
                        }
                      >
                        {minutes} min before
                      </Chip>
                    </Pressable>
                  ))}
                </View>
              </>
            )}
          </Card.Content>
        </Card>

        {/* New Messages */}
        <Card className="mx-4 mb-4">
          <Card.Content>
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <MaterialCommunityIcons name="message-alert" size={24} color="#6366f1" />
                <View className="ml-3 flex-1">
                  <Text className="font-semibold">New Messages</Text>
                  <Text className="text-sm text-gray-600">
                    Notify when you receive messages
                  </Text>
                </View>
              </View>
              <Switch
                value={settings.newMessages}
                onValueChange={() => toggleSetting('newMessages')}
                disabled={!permissionGranted}
              />
            </View>
          </Card.Content>
        </Card>

        {/* Connection Requests */}
        <Card className="mx-4 mb-4">
          <Card.Content>
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <MaterialCommunityIcons name="account-multiple-plus" size={24} color="#6366f1" />
                <View className="ml-3 flex-1">
                  <Text className="font-semibold">Connection Requests</Text>
                  <Text className="text-sm text-gray-600">
                    Notify about new connection requests
                  </Text>
                </View>
              </View>
              <Switch
                value={settings.connectionRequests}
                onValueChange={() => toggleSetting('connectionRequests')}
                disabled={!permissionGranted}
              />
            </View>
          </Card.Content>
        </Card>

        {/* Announcements */}
        <Card className="mx-4 mb-4">
          <Card.Content>
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <MaterialCommunityIcons name="bullhorn" size={24} color="#6366f1" />
                <View className="ml-3 flex-1">
                  <Text className="font-semibold">Announcements</Text>
                  <Text className="text-sm text-gray-600">
                    Receive event announcements
                  </Text>
                </View>
              </View>
              <Switch
                value={settings.announcements}
                onValueChange={() => toggleSetting('announcements')}
                disabled={!permissionGranted}
              />
            </View>
          </Card.Content>
        </Card>

        {/* Schedule Changes */}
        <Card className="mx-4 mb-4">
          <Card.Content>
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <MaterialCommunityIcons name="calendar-sync" size={24} color="#6366f1" />
                <View className="ml-3 flex-1">
                  <Text className="font-semibold">Schedule Changes</Text>
                  <Text className="text-sm text-gray-600">
                    Alert on session time/location changes
                  </Text>
                </View>
              </View>
              <Switch
                value={settings.scheduleChanges}
                onValueChange={() => toggleSetting('scheduleChanges')}
                disabled={!permissionGranted}
              />
            </View>
          </Card.Content>
        </Card>

        {/* Actions */}
        <Card className="mx-4 mb-4">
          <Card.Content>
            <Text className="text-base font-semibold mb-3">Actions</Text>

            <Button
              mode="outlined"
              icon="restore"
              onPress={resetToDefaults}
              className="mb-2"
            >
              Reset to Defaults
            </Button>

            <Divider className="my-3" />

            <View className="p-3 bg-blue-50 rounded-lg">
              <View className="flex-row items-start">
                <MaterialCommunityIcons name="information" size={20} color="#3b82f6" className="mt-0.5" />
                <Text className="text-sm text-gray-700 ml-2 flex-1">
                  Notifications help you stay updated with session times, messages, and important announcements.
                  You can manage individual notification types above.
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
