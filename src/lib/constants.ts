/**
 * App-wide constants and configuration
 */

// Clerk Configuration
export const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY || '';

// Appwrite Configuration
export const APPWRITE_ENDPOINT = process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
export const APPWRITE_PROJECT_ID = process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID || '';
export const APPWRITE_DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID || '';

// Validation
if (!CLERK_PUBLISHABLE_KEY) {
  console.warn('⚠️ EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY is not set');
}

if (!APPWRITE_PROJECT_ID) {
  console.warn('⚠️ EXPO_PUBLIC_APPWRITE_PROJECT_ID is not set');
}

// App Configuration
export const APP_NAME = 'WISE Event App';
export const APP_VERSION = '1.0.0';

// Storage Buckets
export const STORAGE_BUCKETS = {
  AVATARS: 'avatars',
  SPEAKER_PHOTOS: 'speaker-photos',
  SESSION_MATERIALS: 'session-materials',
  EVENT_MEDIA: 'event-media',
  CHAT_ATTACHMENTS: 'chat-attachments',
} as const;

// Collections
export const COLLECTIONS = {
  USERS: 'users',
  EVENTS: 'events',
  SESSIONS: 'sessions',
  SPEAKERS: 'speakers',
  BOOKMARKS: 'bookmarks',
  CONNECTIONS: 'connections',
  MESSAGES: 'messages',
  CONVERSATIONS: 'conversations',
  MEETING_REQUESTS: 'meeting_requests',
  CHECK_INS: 'check_ins',
  NOTIFICATIONS: 'notifications',
  FEEDBACK: 'feedback',
  POLLS: 'polls',
  POLL_RESPONSES: 'poll_responses',
  QUESTIONS: 'questions',
  EXHIBITORS: 'exhibitors',
  SPONSORS: 'sponsors',
  NEWS: 'news',
  FOLLOWS: 'follows',
  BLOCKS: 'blocks',
  ORGANIZATIONS: 'organizations',
} as const;

// Session Types
export const SESSION_TYPES = {
  KEYNOTE: 'keynote',
  PANEL: 'panel',
  WORKSHOP: 'workshop',
  NETWORKING: 'networking',
  BREAKOUT: 'breakout',
  EXHIBITION: 'exhibition',
} as const;

// Connection Status
export const CONNECTION_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  DECLINED: 'declined',
} as const;

// Notification Types
export const NOTIFICATION_TYPES = {
  SESSION_REMINDER: 'session_reminder',
  MESSAGE: 'message',
  CONNECTION: 'connection',
  ANNOUNCEMENT: 'announcement',
  SCHEDULE_CHANGE: 'schedule_change',
} as const;
