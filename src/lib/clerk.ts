import * as SecureStore from 'expo-secure-store';

/**
 * Clerk token cache implementation using Expo SecureStore
 * This ensures tokens are stored securely on the device
 */
export const tokenCache = {
  async getToken(key: string) {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (err) {
      console.error('Error getting token:', err);
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      return await SecureStore.setItemAsync(key, value);
    } catch (err) {
      console.error('Error saving token:', err);
    }
  },
  async clearToken(key: string) {
    try {
      return await SecureStore.deleteItemAsync(key);
    } catch (err) {
      console.error('Error clearing token:', err);
    }
  },
};
