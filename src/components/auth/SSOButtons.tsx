import { View, Alert } from 'react-native';
import { Button, Text, Divider } from 'react-native-paper';
import * as WebBrowser from 'expo-web-browser';
import { useRouter } from 'expo-router';
import { authService } from '@/services/auth';

// This is required for OAuth to work properly
WebBrowser.maybeCompleteAuthSession();

/**
 * SSO Buttons Component (now OAuthButtons)
 * Provides social OAuth login options using Appwrite
 * Configure OAuth providers in Appwrite Console under Auth → OAuth2
 */
export function SSOButtons() {
  const router = useRouter();

  const handleOAuth = async (provider: 'google' | 'apple' | 'linkedin' | 'facebook') => {
    try {
      switch (provider) {
        case 'google':
          await authService.signInWithGoogle();
          break;
        case 'apple':
          await authService.signInWithApple();
          break;
        case 'linkedin':
          await authService.signInWithLinkedIn();
          break;
        case 'facebook':
          await authService.signInWithFacebook();
          break;
      }
      // OAuth redirect will handle navigation after successful authentication
    } catch (err: any) {
      console.error(`${provider} OAuth error:`, err);
      Alert.alert(
        'Authentication Error',
        `Failed to sign in with ${provider}. Please try again.`
      );
    }
  };

  return (
    <View className="w-full gap-3">
      {/* Divider */}
      <View className="flex-row items-center my-2">
        <Divider className="flex-1" />
        <Text className="mx-4 text-gray-500">Or continue with</Text>
        <Divider className="flex-1" />
      </View>

      {/* Google OAuth */}
      <Button
        mode="outlined"
        icon="google"
        onPress={() => handleOAuth('google')}
        className="border-gray-300"
      >
        Continue with Google
      </Button>

      {/* Apple OAuth */}
      <Button
        mode="outlined"
        icon="apple"
        onPress={() => handleOAuth('apple')}
        className="border-gray-300"
      >
        Continue with Apple
      </Button>

      {/* LinkedIn OAuth */}
      <Button
        mode="outlined"
        icon="linkedin"
        onPress={() => handleOAuth('linkedin')}
        className="border-gray-300"
      >
        Continue with LinkedIn
      </Button>

      {/* Note about configuration */}
      <Text className="text-xs text-gray-500 text-center mt-2">
        Configure OAuth providers in Appwrite Console
      </Text>
    </View>
  );
}
