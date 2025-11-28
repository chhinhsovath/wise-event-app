import { View, ActivityIndicator } from 'react-native';
import { Text } from 'react-native-paper';

/**
 * SSO Callback Screen
 * Shown during OAuth redirect process
 */
export default function SSOCallback() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <ActivityIndicator size="large" color="#3b82f6" />
      <Text className="mt-4 text-gray-600">
        Completing authentication...
      </Text>
    </View>
  );
}
