import { useState } from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button, HelperText } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authService } from '@/services/auth';

/**
 * Forgot Password Screen
 * Handles password reset flow using Appwrite
 *
 * Flow:
 * 1. User enters email
 * 2. Recovery email is sent with a deep link
 * 3. User clicks link in email (handled by reset-password screen)
 */
export default function ForgotPassword() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onSendRecoveryEmail = async () => {
    if (loading || !email) return;

    setLoading(true);
    setError('');

    try {
      await authService.sendPasswordRecovery(email);
      setEmailSent(true);
    } catch (err: any) {
      console.error('Password recovery error:', err);
      setError(err.message || 'Failed to send recovery email');
    } finally {
      setLoading(false);
    }
  };

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
            <Text className="text-3xl font-bold mb-2">Reset Password</Text>
            <Text className="text-gray-600">
              {emailSent
                ? 'Check your email for a password reset link'
                : 'Enter your email to receive a password reset link'}
            </Text>
          </View>

          {!emailSent ? (
            <View className="w-full gap-4">
              <TextInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                mode="outlined"
                disabled={loading}
              />

              {error ? (
                <HelperText type="error" visible={!!error}>
                  {error}
                </HelperText>
              ) : null}

              <Button
                mode="contained"
                onPress={onSendRecoveryEmail}
                loading={loading}
                disabled={loading || !email}
              >
                Send Recovery Link
              </Button>

              <Button
                mode="text"
                onPress={() => router.back()}
                disabled={loading}
              >
                Back to Sign In
              </Button>
            </View>
          ) : (
            <View className="w-full gap-4">
              <View className="bg-green-50 p-4 rounded-lg mb-4">
                <Text className="text-green-800 font-semibold mb-2">
                  Recovery Email Sent!
                </Text>
                <Text className="text-green-700">
                  We've sent a password reset link to {email}. Click the link in the email to reset your password.
                </Text>
              </View>

              <Button
                mode="text"
                onPress={() => router.replace('/(auth)/sign-in')}
              >
                Back to Sign In
              </Button>

              <Button
                mode="text"
                onPress={onSendRecoveryEmail}
                loading={loading}
                disabled={loading}
              >
                Resend Email
              </Button>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
