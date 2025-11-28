/**
 * Common TypeScript types for the WISE Event App
 */

// Clerk User Type (extended from Clerk)
export interface ClerkUser {
  id: string;
  firstName: string | null;
  lastName: string | null;
  fullName: string | null;
  imageUrl: string;
  primaryEmailAddress: {
    emailAddress: string;
  } | null;
}

// Appwrite Document Base
export interface AppwriteDocument {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  $permissions: string[];
}

// User Profile (synced from Clerk to Appwrite)
export interface UserProfile extends AppwriteDocument {
  clerkUserId: string;
  email: string;
  fullName: string;
  avatar?: string;
  title?: string;
  organization?: string;
  bio?: string;
  interests?: string[];
  socialLinks?: Record<string, string>;
  role: 'attendee' | 'speaker' | 'organizer' | 'admin';
  isPublic: boolean;
  notificationSettings?: Record<string, boolean>;
  points: number;
  badges?: string[];
  pushTokens?: string[];
  clerkOrgId?: string;
  ssoProvider?: string;
}

// Event
export interface Event extends AppwriteDocument {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  venue: string;
  venueAddress?: string;
  venueCoordinates?: {
    latitude: number;
    longitude: number;
  };
  timezone: string;
  bannerImage?: string;
  status: 'draft' | 'published' | 'ongoing' | 'completed';
  settings?: Record<string, any>;
  clerkOrgId?: string;
}

// Session
export interface Session extends AppwriteDocument {
  eventId: string;
  title: string;
  description?: string;
  type: 'keynote' | 'panel' | 'workshop' | 'networking' | 'breakout' | 'exhibition';
  track?: string;
  startTime: string;
  endTime: string;
  room: string;
  floor?: string;
  speakerIds?: string[];
  capacity?: number;
  currentAttendees: number;
  materials?: string[]; // Storage file IDs
  livestreamUrl?: string;
  recordingUrl?: string;
  tags?: string[];
  isFeatured: boolean;
  status: 'scheduled' | 'live' | 'completed' | 'cancelled';
}

// Speaker
export interface Speaker extends AppwriteDocument {
  clerkUserId?: string;
  name: string;
  photo?: string;
  title: string;
  organization: string;
  bio?: string;
  expertise?: string[];
  socialLinks?: Record<string, string>;
  isFeatured: boolean;
  sortOrder: number;
}

// Bookmark
export interface Bookmark extends AppwriteDocument {
  clerkUserId: string;
  sessionId: string;
  reminderTime?: number; // Minutes before session
  notes?: string;
}

// Connection
export interface Connection extends AppwriteDocument {
  requesterId: string; // Clerk user ID
  recipientId: string; // Clerk user ID
  status: 'pending' | 'accepted' | 'declined';
  message?: string;
}

// Message
export interface Message extends AppwriteDocument {
  conversationId: string;
  senderId: string; // Clerk user ID
  recipientId: string; // Clerk user ID
  content: string;
  type: 'text' | 'image' | 'file';
  attachmentId?: string;
  isRead: boolean;
}

// Notification
export interface Notification extends AppwriteDocument {
  clerkUserId: string;
  type: 'session_reminder' | 'message' | 'connection' | 'announcement' | 'schedule_change';
  title: string;
  body: string;
  data?: Record<string, any>;
  isRead: boolean;
}

// Check-in
export interface CheckIn extends AppwriteDocument {
  clerkUserId: string;
  sessionId: string;
  checkInTime: string;
  checkOutTime?: string;
  method: 'qr' | 'nfc' | 'geofence' | 'manual';
  location?: {
    latitude: number;
    longitude: number;
  };
}

// Venue & Map Types
export interface VenueRoom {
  id: string;
  name: string;
  floor: string;
  capacity: number;
  type: 'conference' | 'workshop' | 'exhibition' | 'networking' | 'main-hall' | 'breakout';
  coordinates: {
    x: number; // X position on floor plan (percentage)
    y: number; // Y position on floor plan (percentage)
  };
  amenities?: string[];
  description?: string;
}

export interface VenueFloor {
  id: string;
  name: string;
  level: number;
  rooms: VenueRoom[];
  floorPlanImage?: string;
}

export interface VenueInfo {
  name: string;
  address: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  floors: VenueFloor[];
  parking?: {
    available: boolean;
    type: string;
    description: string;
  };
  transit?: string[];
  amenities?: string[];
  wifi?: {
    network: string;
    password?: string;
  };
  emergencyInfo?: {
    exits: string[];
    meetingPoint: string;
    contact: string;
  };
}

// Poll Types
export interface PollOption {
  id: string;
  text: string;
  votes: number;
}

export interface Poll extends AppwriteDocument {
  sessionId: string;
  question: string;
  options: PollOption[];
  status: 'draft' | 'active' | 'closed';
  allowMultiple: boolean;
  showResults: boolean;
  totalVotes: number;
  createdBy: string; // Clerk user ID
  endTime?: string;
}

export interface PollVote extends AppwriteDocument {
  pollId: string;
  clerkUserId: string;
  optionIds: string[]; // Array to support multiple choice
}

// Q&A Types
export interface Question extends AppwriteDocument {
  sessionId: string;
  clerkUserId: string;
  content: string;
  upvotes: number;
  upvotedBy: string[]; // Array of user IDs who upvoted
  isAnswered: boolean;
  answer?: string;
  answeredBy?: string; // Speaker/moderator user ID
  answeredAt?: string;
  status: 'pending' | 'approved' | 'answered' | 'hidden';
}

// Navigation Param Types (for Expo Router)
export type RootStackParamList = {
  '/(auth)/sign-in': undefined;
  '/(auth)/sign-up': undefined;
  '/(app)/(tabs)': undefined;
  '/(app)/session/[id]': { id: string };
  '/(app)/speaker/[id]': { id: string };
  '/(app)/attendee/[id]': { id: string };
  '/(app)/chat/[conversationId]': { conversationId: string };
  '/(app)/venue/room/[id]': { id: string };
};
