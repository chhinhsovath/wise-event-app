import { useState } from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button, HelperText } from 'react-native-paper';
import { useSignIn } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

/**
 * Forgot Password Screen
 * Handles password reset flow using Clerk
 */
export default function ForgotPassword() {
  const { signIn, isLoaded } = useSignIn();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onRequestCode = async () => {
    if (!isLoaded || !email) return;

    setLoading(true);
    setError('');

    try {
      await signIn.create({
        strategy: 'reset_password_email_code',
        identifier: email,
      });

      setCodeSent(true);
    } catch (err: any) {
      console.error('Password reset error:', err);
      if (err.errors) {
        setError(err.errors[0]?.message || 'Failed to send reset code');
      } else {
        setError('An error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const onResetPassword = async () => {
    if (!isLoaded || !code || !newPassword) return;

    setLoading(true);
    setError('');

    try {
      const result = await signIn.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code,
        password: newPassword,
      });

      if (result.status === 'complete') {
        router.replace('/(auth)/sign-in');
      }
    } catch (err: any) {
      console.error('Reset password error:', err);
      if (err.errors) {
        setError(err.errors[0]?.message || 'Failed to reset password');
      } else {
        setError('An error occurred');
      }
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
              {codeSent
                ? 'Enter the code sent to your email'
                : 'Enter your email to receive a reset code'}
            </Text>
          </View>

          {!codeSent ? (
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
                onPress={onRequestCode}
                loading={loading}
                disabled={loading || !email}
              >
                Send Reset Code
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
              <TextInput
                label="Reset Code"
                value={code}
                onChangeText={setCode}
                keyboardType="number-pad"
                mode="outlined"
                disabled={loading}
              />

              <TextInput
                label="New Password"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
                autoCapitalize="none"
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
                onPress={onResetPassword}
                loading={loading}
                disabled={loading || !code || !newPassword}
              >
                Reset Password
              </Button>

              <Button
                mode="text"
                onPress={onRequestCode}
                disabled={loading}
              >
                Resend Code
              </Button>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
