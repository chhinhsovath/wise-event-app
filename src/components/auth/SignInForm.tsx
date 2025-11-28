import { useState } from 'react';
import { View } from 'react-native';
import { TextInput, Button, HelperText } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { authService } from '@/services/auth';

/**
 * Sign In Form Component
 * Handles email/password sign-in using Appwrite
 */
export function SignInForm() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onSignIn = async () => {
    // Validate inputs
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Attempt to sign in with Appwrite
      await authService.signIn(email, password);

      // Navigate to app on success
      router.replace('/(app)/(tabs)');
    } catch (err: any) {
      console.error('Sign in error:', err);

      // Handle Appwrite errors
      const errorMessage = err.message || 'Sign in failed. Please check your credentials.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="w-full gap-4">
      {/* Email Input */}
      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
        textContentType="emailAddress"
        mode="outlined"
        disabled={loading}
      />

      {/* Password Input */}
      <TextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
        autoComplete="password"
        textContentType="password"
        mode="outlined"
        disabled={loading}
      />

      {/* Error Message */}
      {error ? (
        <HelperText type="error" visible={!!error}>
          {error}
        </HelperText>
      ) : null}

      {/* Sign In Button */}
      <Button
        mode="contained"
        onPress={onSignIn}
        loading={loading}
        disabled={loading || !email || !password}
        className="mt-2"
      >
        Sign In
      </Button>

      {/* Forgot Password Link */}
      <Button
        mode="text"
        onPress={() => router.push('/(auth)/forgot-password')}
        disabled={loading}
      >
        Forgot Password?
      </Button>
    </View>
  );
}
