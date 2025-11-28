import { Client, Account, Databases, Storage, Realtime } from 'react-native-appwrite'

const APPWRITE_ENDPOINT = process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT || ''
const APPWRITE_PROJECT_ID = process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID || ''

if (!APPWRITE_ENDPOINT || !APPWRITE_PROJECT_ID) {
  throw new Error(
    'Missing Appwrite configuration. Please check your .env file.'
  )
}

/**
 * Appwrite client configuration
 * Appwrite handles ALL backend services:
 * - Authentication (Email/Password, OAuth, Magic URL, Phone/SMS)
 * - Database (NoSQL document database)
 * - Storage (File storage)
 * - Realtime (WebSocket subscriptions)
 */

// Initialize Appwrite Client
const client = new Client()
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID)

// Initialize Appwrite services
export const account = new Account(client)
export const databases = new Databases(client)
export const storage = new Storage(client)
export const realtime = new Realtime(client)

export default client
