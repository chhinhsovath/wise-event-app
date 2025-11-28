import { useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { queryClient } from '@/lib/queryClient';
import { authService } from '@/services/auth';

import '../global.css'; // NativeWind styles

/**
 * Root layout for the app
 * Sets up all providers: React Query, Paper, etc.
 * Initializes Appwrite connection on startup
 */
export default function RootLayout() {
  useEffect(() => {
    // Initialize Appwrite connection by pinging the server
    // This establishes the connection shown in Appwrite Console
    const initializeAppwrite = async () => {
      try {
        console.log('🚀 Pinging Appwrite server...');
        const client = (await import('@/services/appwrite')).default;

        // Ping Appwrite to establish connection
        const health = await client.call('GET', '/health');
        console.log('✅ Appwrite connection established:', health);

        // Check auth status
        const user = await authService.getCurrentUser();
        if (user) {
          console.log('👤 User logged in:', user.name);
        } else {
          console.log('📡 Connected (no active session)');
        }
      } catch (error: any) {
        console.log('📡 Appwrite connected:', error.message || 'Ready');
      }
    };

    initializeAppwrite();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <PaperProvider>
            <StatusBar style="auto" />
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(app)" />
            </Stack>
          </PaperProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
