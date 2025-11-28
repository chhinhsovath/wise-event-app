import { useState } from 'react';
import { View } from 'react-native';
import { TextInput, Button, HelperText } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { authService } from '@/services/auth';

/**
 * Sign Up Form Component
 * Handles email/password registration using Appwrite
 * Note: Email verification can be sent after registration if needed
 */
export function SignUpForm() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onSignUp = async () => {
    // Validate inputs
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Create the user account with Appwrite
      await authService.signUp(email, password, name);

      // Optionally send email verification
      // await authService.sendEmailVerification();

      // Navigate to app on success
      router.replace('/(app)/(tabs)');
    } catch (err: any) {
      console.error('Sign up error:', err);

      const errorMessage = err.message || 'Sign up failed. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="w-full gap-4">
      {/* Full Name Input */}
      <TextInput
        label="Full Name"
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
        autoComplete="name"
        textContentType="name"
        mode="outlined"
        disabled={loading}
      />

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
        label="Password (min. 8 characters)"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
        autoComplete="password-new"
        textContentType="newPassword"
        mode="outlined"
        disabled={loading}
        right={<TextInput.Icon icon="eye" />}
      />

      {/* Confirm Password Input */}
      <TextInput
        label="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        autoCapitalize="none"
        mode="outlined"
        disabled={loading}
      />

      {/* Error Message */}
      {error ? (
        <HelperText type="error" visible={!!error}>
          {error}
        </HelperText>
      ) : null}

      {/* Sign Up Button */}
      <Button
        mode="contained"
        onPress={onSignUp}
        loading={loading}
        disabled={loading || !name || !email || !password || !confirmPassword}
        className="mt-2"
      >
        Create Account
      </Button>
    </View>
  );
}
