import { View, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SignUpForm } from '@/components/auth/SignUpForm';
import { SSOButtons } from '@/components/auth/SSOButtons';

/**
 * Sign Up Screen
 * Provides email/password registration and SSO options
 */
export default function SignUp() {
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
            <Text className="text-3xl font-bold mb-2">Create Account</Text>
            <Text className="text-gray-600">
              Join the WISE community
            </Text>
          </View>

          {/* Sign Up Form */}
          <SignUpForm />

          {/* SSO Options */}
          <SSOButtons />

          {/* Sign In Link */}
          <View className="mt-6">
            <Link href="/(auth)/sign-in" asChild>
              <Button mode="text">
                Already have an account? Sign in
              </Button>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
