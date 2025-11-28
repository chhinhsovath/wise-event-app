import { Stack } from 'expo-router';

/**
 * Layout for authentication screens
 * All screens here are public (no auth required)
 */
export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#fff' },
      }}
    >
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="sign-up" />
      <Stack.Screen name="sso-callback" />
      <Stack.Screen name="forgot-password" />
    </Stack>
  );
}
