import { View, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SignInForm } from '@/components/auth/SignInForm';
import { SSOButtons } from '@/components/auth/SSOButtons';

/**
 * Sign In Screen
 * Provides email/password and SSO authentication options
 */
export default function SignIn() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerClassName="flex-grow justify-center p-6"
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View className="mb-8">
            <Text className="text-3xl font-bold mb-2">Welcome to WISE</Text>
            <Text className="text-gray-600">
              Sign in to access the event
            </Text>
          </View>

          {/* Sign In Form */}
          <SignInForm />

          {/* SSO Options */}
          <SSOButtons />

          {/* Sign Up Link */}
          <View className="mt-6">
            <Link href="/(auth)/sign-up" asChild>
              <Button mode="text">
                Don't have an account? Sign up
              </Button>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
