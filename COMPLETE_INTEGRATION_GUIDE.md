# Complete Integration Guide - WISE Event App

**Last Updated**: November 28, 2025
**Purpose**: Step-by-step guide to integrate all features with Appwrite backend
**Estimated Time**: 8-12 hours for complete migration

---

## 📋 Overview

This guide walks through integrating all WISE Event App features with the Appwrite backend, migrating from mock data to live data, and enabling real-time updates.

### What You'll Accomplish

- ✅ Connect all 16+ screens to Appwrite services
- ✅ Replace mock data with live database queries
- ✅ Enable real-time subscriptions for live updates
- ✅ Test all CRUD operations end-to-end
- ✅ Implement offline-first patterns
- ✅ Add loading and error states

---

## 🔧 Prerequisites

Before starting integration, ensure you have:

1. **Appwrite Setup Complete**
   - ✅ All 13 collections created (see FINAL_DEPLOYMENT_GUIDE.md)
   - ✅ Indexes configured
   - ✅ Permissions set correctly
   - ✅ Environment variables configured

2. **Services Ready**
   - ✅ All 9 services implemented in `src/services/`
   - ✅ Types defined in `src/types/index.ts`
   - ✅ Appwrite client configured in `src/lib/appwrite.ts`

3. **Test Data**
   - ✅ At least one event created
   - ✅ Sample sessions, speakers, attendees
   - ✅ Test user accounts

---

## 📊 Integration Strategy

### Phase-by-Phase Approach

We'll integrate in this order (lowest to highest risk):

1. **User Profile** (Phase 1) - 30 minutes
2. **Sessions & Bookmarks** (Phase 2) - 2 hours
3. **Networking** (Phase 3) - 2 hours
4. **Notifications** (Phase 4) - 1 hour
5. **QR Check-in** (Phase 5) - 1.5 hours
6. **Polls & Q&A** (Phase 6) - 2 hours
7. **Real-time Updates** (Phase 7) - 2 hours

---

## 🚀 Phase 1: User Profile Integration (30 min)

### Files to Modify

- `src/app/(app)/(tabs)/profile.tsx`
- `src/hooks/useUserProfile.ts` (create new)

### Step 1: Create User Profile Hook

**Create**: `src/hooks/useUserProfile.ts`

```typescript
import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-expo';
import { UsersService } from '@/services';
import { UserProfile } from '@/types';

export function useUserProfile() {
  const { user } = useUser();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Try to get existing profile
      let userProfile = await UsersService.getUserByClerkId(user.id);

      // If not found, create profile from Clerk data
      if (!userProfile) {
        userProfile = await UsersService.syncUserFromClerk(user.id);
      }

      setProfile(userProfile);
    } catch (err: any) {
      console.error('Error loading profile:', err);
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user || !profile) return;

    try {
      const updated = await UsersService.updateUserProfile(user.id, updates);
      setProfile(updated);
      return updated;
    } catch (err: any) {
      console.error('Error updating profile:', err);
      throw err;
    }
  };

  return {
    profile,
    loading,
    error,
    updateProfile,
    refreshProfile: loadProfile,
  };
}
```

### Step 2: Update Profile Screen

**Edit**: `src/app/(app)/(tabs)/profile.tsx`

```typescript
// Replace mock data imports with:
import { useUserProfile } from '@/hooks/useUserProfile';

export default function ProfileScreen() {
  const { user, signOut } = useUser();
  const { profile, loading, error, updateProfile, refreshProfile } = useUserProfile();

  // Remove mock data
  // const userProfile = mockAttendees.find(...);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshProfile();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center">
          <MaterialCommunityIcons name="loading" size={48} color="#6366f1" />
          <Text className="mt-4 text-gray-600">Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center p-4">
          <MaterialCommunityIcons name="alert-circle" size={64} color="#ef4444" />
          <Text className="mt-4 text-lg font-semibold text-gray-900">Error Loading Profile</Text>
          <Text className="mt-2 text-center text-gray-600">{error}</Text>
          <Button mode="contained" onPress={refreshProfile} className="mt-4">
            Retry
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      {/* Use profile instead of userProfile */}
      <Text className="text-2xl font-bold">{profile?.name || user?.fullName}</Text>
      <Text className="text-gray-600">{profile?.email || user?.primaryEmailAddress?.emailAddress}</Text>

      {/* Rest of UI remains the same, just replace data source */}
    </ScrollView>
  );
}
```

### Test Phase 1

- [ ] Profile loads on app open
- [ ] Refresh works
- [ ] Error state displays if Appwrite is down
- [ ] Profile data matches Clerk user data

---

## 📅 Phase 2: Sessions & Bookmarks Integration (2 hours)

### Files to Modify

- `src/app/(app)/(tabs)/schedule.tsx`
- `src/app/(app)/session/[id]/index.tsx`
- `src/hooks/useBookmarks.ts`

### Step 1: Update Schedule Screen

**Edit**: `src/app/(app)/(tabs)/schedule.tsx`

```typescript
import { SessionsService } from '@/services';
import { Session } from '@/types';

export default function ScheduleScreen() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get sessions for default event (or selected event)
      const eventId = 'event-1'; // TODO: Get from event selector
      const allSessions = await SessionsService.getSessionsByEvent(eventId);

      setSessions(allSessions);
    } catch (err: any) {
      console.error('Error loading sessions:', err);
      setError(err.message || 'Failed to load sessions');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadSessions();
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      loadSessions();
      return;
    }

    try {
      setLoading(true);
      const eventId = 'event-1';
      const results = await SessionsService.searchSessions(eventId, query.trim());
      setSessions(results);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Rest of component remains similar, but uses real data
}
```

### Step 2: Update Session Detail Screen

**Edit**: `src/app/(app)/session/[id]/index.tsx`

```typescript
import { SessionsService } from '@/services';

export default function SessionDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSession();
  }, [id]);

  const loadSession = async () => {
    try {
      setLoading(true);
      const sessionData = await SessionsService.getSessionById(id!);
      setSession(sessionData);
    } catch (err) {
      console.error('Error loading session:', err);
      alert('Failed to load session');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  // Rest remains similar
}
```

### Step 3: Update Bookmarks Hook

**Edit**: `src/hooks/useBookmarks.ts`

```typescript
import { BookmarksService, SessionsService } from '@/services';

export function useBookmarks() {
  const { user } = useUser();
  const [bookmarkedSessions, setBookmarkedSessions] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookmarks();
  }, [user]);

  const loadBookmarks = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const bookmarks = await BookmarksService.getUserBookmarks(user.id);
      const sessionIds = new Set(bookmarks.map((b) => b.sessionId));
      setBookmarkedSessions(sessionIds);
    } catch (err) {
      console.error('Error loading bookmarks:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleBookmark = async (sessionId: string) => {
    if (!user) {
      alert('Please sign in to bookmark sessions');
      return;
    }

    try {
      await BookmarksService.toggleBookmark(user.id, sessionId);

      // Update local state
      setBookmarkedSessions((prev) => {
        const next = new Set(prev);
        if (next.has(sessionId)) {
          next.delete(sessionId);
        } else {
          next.add(sessionId);
        }
        return next;
      });

      // Reload to get updated session with notification scheduling
      await loadBookmarks();
    } catch (err: any) {
      console.error('Error toggling bookmark:', err);
      alert(err.message || 'Failed to update bookmark');
    }
  };

  const getBookmarkedSessions = async () => {
    if (!user) return [];

    try {
      const bookmarks = await BookmarksService.getUserBookmarks(user.id);
      const sessionIds = bookmarks.map((b) => b.sessionId);

      // Get full session data
      const sessions = await Promise.all(
        sessionIds.map((id) => SessionsService.getSessionById(id))
      );

      return sessions.filter(Boolean);
    } catch (err) {
      console.error('Error getting bookmarked sessions:', err);
      return [];
    }
  };

  return {
    bookmarkedSessions,
    loading,
    toggleBookmark,
    getBookmarkedSessions,
    refreshBookmarks: loadBookmarks,
  };
}
```

### Test Phase 2

- [ ] Sessions load from database
- [ ] Search works correctly
- [ ] Bookmarking creates database record
- [ ] Unbookmarking deletes record
- [ ] My Agenda tab shows bookmarked sessions
- [ ] Session details display correctly

---

## 🤝 Phase 3: Networking Integration (2 hours)

### Files to Modify

- `src/app/(app)/(tabs)/network.tsx`
- `src/app/(app)/network/[id].tsx`
- `src/app/(app)/network/connections.tsx`
- `src/app/(app)/network/messages/[userId].tsx`
- `src/hooks/useConnections.ts`

### Step 1: Update Network Directory

**Edit**: `src/app/(app)/(tabs)/network.tsx`

```typescript
import { UsersService } from '@/services';

export default function NetworkScreen() {
  const [attendees, setAttendees] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAttendees();
  }, []);

  const loadAttendees = async () => {
    try {
      setLoading(true);
      const eventId = 'event-1'; // TODO: Get from context
      const users = await UsersService.getEventAttendees(eventId);
      setAttendees(users);
    } catch (err) {
      console.error('Error loading attendees:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      loadAttendees();
      return;
    }

    try {
      const eventId = 'event-1';
      const results = await UsersService.searchUsers(eventId, query.trim());
      setAttendees(results);
    } catch (err) {
      console.error('Search error:', err);
    }
  };

  // Rest remains similar
}
```

### Step 2: Update Connections Hook

**Edit**: `src/hooks/useConnections.ts`

```typescript
import { ConnectionsService } from '@/services';

export function useConnections() {
  const { user } = useUser();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConnections();
  }, [user]);

  const loadConnections = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const [accepted, pending] = await Promise.all([
        ConnectionsService.getUserConnections(user.id),
        ConnectionsService.getPendingRequests(user.id),
      ]);

      setConnections(accepted);
      setPendingRequests(pending);
    } catch (err) {
      console.error('Error loading connections:', err);
    } finally {
      setLoading(false);
    }
  };

  const sendRequest = async (targetUserId: string) => {
    if (!user) return;

    try {
      await ConnectionsService.sendConnectionRequest(user.id, targetUserId);
      await loadConnections();
    } catch (err: any) {
      console.error('Error sending request:', err);
      throw err;
    }
  };

  const acceptRequest = async (connectionId: string) => {
    try {
      await ConnectionsService.acceptConnectionRequest(connectionId);
      await loadConnections();
    } catch (err: any) {
      console.error('Error accepting request:', err);
      throw err;
    }
  };

  const declineRequest = async (connectionId: string) => {
    try {
      await ConnectionsService.declineConnectionRequest(connectionId);
      await loadConnections();
    } catch (err: any) {
      console.error('Error declining request:', err);
      throw err;
    }
  };

  const isConnected = (userId: string): boolean => {
    return connections.some(
      (c) => c.user1Id === userId || c.user2Id === userId
    );
  };

  return {
    connections,
    pendingRequests,
    loading,
    sendRequest,
    acceptRequest,
    declineRequest,
    isConnected,
    refreshConnections: loadConnections,
  };
}
```

### Step 3: Update Messages Screen

**Edit**: `src/app/(app)/network/messages/[userId].tsx`

```typescript
import { MessagesService, UsersService } from '@/services';

export default function MessagesScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const { user } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [otherUser, setOtherUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConversation();
  }, [userId]);

  const loadConversation = async () => {
    if (!user || !userId) return;

    try {
      setLoading(true);

      const [conversationMessages, otherUserProfile] = await Promise.all([
        MessagesService.getConversation(user.id, userId),
        UsersService.getUserByClerkId(userId),
      ]);

      setMessages(conversationMessages);
      setOtherUser(otherUserProfile);

      // Mark as read
      await MessagesService.markConversationAsRead(user.id, userId);
    } catch (err) {
      console.error('Error loading conversation:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!user || !messageText.trim()) return;

    try {
      setSending(true);
      await MessagesService.sendMessage(user.id, userId!, messageText.trim());
      setMessageText('');
      await loadConversation();
    } catch (err) {
      console.error('Error sending message:', err);
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  // Rest remains similar
}
```

### Test Phase 3

- [ ] Attendee directory loads
- [ ] Connection requests send successfully
- [ ] Requests appear in pending list
- [ ] Accept/decline works
- [ ] Messages send and receive
- [ ] Conversation history loads

---

## 🔔 Phase 4: Notifications Integration (1 hour)

### Files to Modify

- `src/app/(app)/notifications/index.tsx`

### Update Notifications Center

**Edit**: `src/app/(app)/notifications/index.tsx`

```typescript
import { NotificationsService } from '@/services';

export default function NotificationsCenter() {
  const { user } = useUser();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, [user]);

  const loadNotifications = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const userNotifications = await NotificationsService.getUserNotifications(user.id);
      setNotifications(userNotifications);

      // Mark all as read
      const unreadIds = userNotifications
        .filter((n) => !n.isRead)
        .map((n) => n.$id);

      if (unreadIds.length > 0) {
        await NotificationsService.markMultipleAsRead(unreadIds);
      }
    } catch (err) {
      console.error('Error loading notifications:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      await NotificationsService.deleteNotification(notificationId);
      setNotifications((prev) => prev.filter((n) => n.$id !== notificationId));
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  const handleClearAll = async () => {
    if (!user) return;

    try {
      await NotificationsService.clearAllNotifications(user.id);
      setNotifications([]);
    } catch (err) {
      console.error('Error clearing notifications:', err);
      alert('Failed to clear notifications');
    }
  };

  // Rest remains similar
}
```

### Test Phase 4

- [ ] Notifications load from database
- [ ] Badge count updates
- [ ] Mark as read works
- [ ] Delete notification works
- [ ] Clear all works

---

## 📱 Phase 5: QR Check-in Integration (1.5 hours)

### Files to Modify

- `src/app/(app)/checkin/scanner.tsx`
- `src/app/(app)/checkin/qr/[sessionId].tsx`
- `src/app/(app)/checkin/attendance/[sessionId].tsx`
- `src/app/(app)/checkin/history.tsx`

### Step 1: Update QR Scanner

**Edit**: `src/app/(app)/checkin/scanner.tsx`

```typescript
import { CheckInsService, SessionsService } from '@/services';

export default function QRScanner() {
  const { user } = useUser();
  const router = useRouter();

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    setScanned(true);

    try {
      // Parse QR data
      const qrData = CheckInsService.parseQRData(data);

      if (!user) {
        alert('Please sign in to check in');
        router.replace('/(auth)/sign-in');
        return;
      }

      // Get session details
      const session = await SessionsService.getSessionById(qrData.sessionId);

      // Check in user
      await CheckInsService.checkInUser(user.id, qrData.sessionId);

      alert(`Checked in to: ${session.title}`);
      router.back();
    } catch (err: any) {
      console.error('Check-in error:', err);
      alert(err.message || 'Invalid QR code or check-in failed');
      setScanned(false);
    }
  };

  // Rest remains similar
}
```

### Step 2: Update QR Code Display

**Edit**: `src/app/(app)/checkin/qr/[sessionId].tsx`

```typescript
import { CheckInsService, SessionsService } from '@/services';

export default function SessionQRCode() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const [session, setSession] = useState<Session | null>(null);
  const [attendeeCount, setAttendeeCount] = useState(0);
  const [qrData, setQrData] = useState('');

  useEffect(() => {
    loadSession();
    const interval = setInterval(loadAttendeeCount, 10000); // Update every 10s
    return () => clearInterval(interval);
  }, [sessionId]);

  const loadSession = async () => {
    try {
      setLoading(true);
      const sessionData = await SessionsService.getSessionById(sessionId!);
      setSession(sessionData);

      // Generate QR data
      const qr = CheckInsService.generateQRData(sessionId!, sessionData.eventId);
      setQrData(qr);

      await loadAttendeeCount();
    } catch (err) {
      console.error('Error loading session:', err);
      alert('Failed to load session');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const loadAttendeeCount = async () => {
    try {
      const count = await CheckInsService.getSessionAttendeeCount(sessionId!);
      setAttendeeCount(count);
    } catch (err) {
      console.error('Error loading count:', err);
    }
  };

  // Rest remains similar
}
```

### Step 3: Update Attendance List

**Edit**: `src/app/(app)/checkin/attendance/[sessionId].tsx`

```typescript
import { CheckInsService, UsersService } from '@/services';

export default function AttendanceList() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [attendees, setAttendees] = useState<Record<string, UserProfile>>({});

  useEffect(() => {
    loadAttendance();
  }, [sessionId]);

  const loadAttendance = async () => {
    try {
      setLoading(true);

      // Get all check-ins for session
      const sessionCheckIns = await CheckInsService.getSessionCheckIns(sessionId!);
      setCheckIns(sessionCheckIns);

      // Get attendee details
      const userIds = sessionCheckIns.map((c) => c.clerkUserId);
      const uniqueUserIds = Array.from(new Set(userIds));

      const users = await Promise.all(
        uniqueUserIds.map((id) => UsersService.getUserByClerkId(id))
      );

      const usersMap: Record<string, UserProfile> = {};
      users.forEach((user) => {
        if (user) usersMap[user.clerkUserId] = user;
      });
      setAttendees(usersMap);
    } catch (err) {
      console.error('Error loading attendance:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Rest remains similar
}
```

### Test Phase 5

- [ ] QR code generates correctly
- [ ] Scanner reads QR and checks in user
- [ ] Duplicate check-in prevention works
- [ ] Attendance list loads
- [ ] User history shows check-ins
- [ ] Check-out functionality works

---

## 📊 Phase 6: Polls & Q&A Integration (2 hours)

### Files Already Using Services

Good news! The polls and Q&A screens were built to use services from the start:

- ✅ `src/app/(app)/session/[id]/polls.tsx` - Already integrated
- ✅ `src/app/(app)/session/[id]/qa.tsx` - Already integrated

### What You Need to Do

**Just verify they work with real data:**

1. **Create Test Poll**:
```typescript
// In Appwrite console or via API
const poll = await PollsService.createPoll(
  'session-1',
  'speaker-user-id',
  'What topic interests you most?',
  ['AI in Education', 'Data Privacy', 'Future of Learning', 'EdTech Tools'],
  false, // Single choice
  true   // Show results
);
await PollsService.activatePoll(poll.$id);
```

2. **Create Test Question**:
```typescript
const question = await QuestionsService.submitQuestion(
  'session-1',
  'user-id',
  'How can we implement AI ethically in classrooms?'
);
await QuestionsService.approveQuestion(question.$id);
```

3. **Test UI**:
- [ ] Poll displays in session
- [ ] Voting works
- [ ] Results calculate correctly
- [ ] Question submission works
- [ ] Upvoting works
- [ ] Filtering works (all/answered/unanswered)

---

## 🔄 Phase 7: Real-time Updates (2 hours)

### Add Real-time Subscriptions

**Create**: `src/hooks/useRealtimeCollection.ts`

```typescript
import { useEffect, useState } from 'react';
import { Models } from 'react-native-appwrite';
import { client } from '@/lib/appwrite';

type RealtimeEvent<T> = {
  events: string[];
  payload: Models.Document;
};

export function useRealtimeCollection<T>(
  databaseId: string,
  collectionId: string,
  queries: string[] = []
) {
  const [documents, setDocuments] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Subscribe to collection changes
    const unsubscribe = client.subscribe(
      `databases.${databaseId}.collections.${collectionId}.documents`,
      (response: RealtimeEvent<T>) => {
        console.log('Realtime update:', response);

        const event = response.events[0];
        const payload = response.payload as unknown as T;

        if (event.includes('create')) {
          setDocuments((prev) => [...prev, payload]);
        } else if (event.includes('update')) {
          setDocuments((prev) =>
            prev.map((doc: any) =>
              doc.$id === (payload as any).$id ? payload : doc
            )
          );
        } else if (event.includes('delete')) {
          setDocuments((prev) =>
            prev.filter((doc: any) => doc.$id !== (payload as any).$id)
          );
        }
      }
    );

    setLoading(false);

    return () => {
      unsubscribe();
    };
  }, [databaseId, collectionId]);

  return { documents, loading };
}
```

### Add to Key Screens

**Example: Real-time Poll Results**

```typescript
// In src/app/(app)/session/[id]/polls.tsx
import { useRealtimeCollection } from '@/hooks/useRealtimeCollection';

export default function SessionPolls() {
  // Existing code...

  // Add real-time subscription for polls
  const { documents: realtimePolls } = useRealtimeCollection<Poll>(
    'main',
    'polls',
    [Query.equal('sessionId', sessionId)]
  );

  useEffect(() => {
    if (realtimePolls.length > 0) {
      setPolls(realtimePolls);
    }
  }, [realtimePolls]);

  // Rest of component...
}
```

### Add Real-time to These Screens

1. **Polls** - Live vote counts
2. **Q&A** - New questions, upvote changes
3. **Messages** - New messages
4. **Attendance** - Live check-in counts
5. **Notifications** - New notifications

### Test Real-time

- [ ] Create poll on one device, appears on another
- [ ] Vote updates appear immediately
- [ ] New message appears without refresh
- [ ] Check-in count updates live

---

## 🧪 Complete Testing Checklist

### User Flow Tests

**Attendee Journey**:
- [ ] Sign in with Clerk
- [ ] Profile loads correctly
- [ ] Browse sessions
- [ ] Search sessions
- [ ] Bookmark session
- [ ] View My Agenda
- [ ] View session details
- [ ] Join session (check-in via QR)
- [ ] Vote in poll
- [ ] Submit question
- [ ] Upvote question
- [ ] View answer
- [ ] Browse attendees
- [ ] Send connection request
- [ ] Accept connection
- [ ] Send message
- [ ] Receive message
- [ ] View notifications
- [ ] Update profile

**Speaker Journey**:
- [ ] Create poll
- [ ] Activate poll
- [ ] View live results
- [ ] Close poll
- [ ] View session QR code
- [ ] Monitor attendance
- [ ] View pending questions
- [ ] Approve questions
- [ ] Answer questions
- [ ] Hide spam questions

**Organizer Journey**:
- [ ] Create event
- [ ] Create sessions
- [ ] Add speakers
- [ ] Monitor attendance across sessions
- [ ] View analytics

### Error Handling Tests

- [ ] Network error handling (turn off WiFi)
- [ ] Invalid data handling
- [ ] Permission denied scenarios
- [ ] Duplicate action prevention
- [ ] Offline functionality

### Performance Tests

- [ ] Load 100+ sessions
- [ ] Search with 1000+ users
- [ ] Real-time with 50+ concurrent users
- [ ] Message history with 500+ messages
- [ ] Poll with 200+ votes

---

## 📈 Performance Optimization

### 1. Implement Pagination

```typescript
// Example: Paginated sessions
const [lastDocument, setLastDocument] = useState<string | null>(null);
const PAGE_SIZE = 20;

const loadMoreSessions = async () => {
  const queries = [
    Query.equal('eventId', eventId),
    Query.orderDesc('$createdAt'),
    Query.limit(PAGE_SIZE),
  ];

  if (lastDocument) {
    queries.push(Query.cursorAfter(lastDocument));
  }

  const response = await databases.listDocuments('main', 'sessions', queries);

  setSessions((prev) => [...prev, ...response.documents as unknown as Session[]]);
  setLastDocument(response.documents[response.documents.length - 1]?.$id || null);
};
```

### 2. Add Caching

```typescript
// Example: Cache user profiles
const userCache = new Map<string, UserProfile>();

const getUserCached = async (userId: string): Promise<UserProfile> => {
  if (userCache.has(userId)) {
    return userCache.get(userId)!;
  }

  const user = await UsersService.getUserByClerkId(userId);
  userCache.set(userId, user);
  return user;
};
```

### 3. Optimize Images

- Use expo-image with caching
- Resize images on upload
- Use thumbnails for lists

---

## 🔒 Security Checklist

- [ ] Permissions configured correctly in Appwrite
- [ ] Users can only edit their own data
- [ ] Speakers can only manage their sessions
- [ ] Organizers have full access
- [ ] API keys not exposed in client code
- [ ] Environment variables secured

---

## 🎉 Launch Checklist

**Before Production**:
- [ ] All mock data removed
- [ ] All services integrated
- [ ] Real-time subscriptions working
- [ ] Error handling complete
- [ ] Loading states implemented
- [ ] Performance optimized
- [ ] Security reviewed
- [ ] Testing complete
- [ ] Analytics configured
- [ ] Monitoring setup (Sentry)

**Production Deploy**:
- [ ] Environment variables set
- [ ] Appwrite project in production mode
- [ ] Database indexes created
- [ ] Build production app (iOS + Android)
- [ ] Test on real devices
- [ ] Submit to app stores

---

## 📚 Additional Resources

### Documentation
- Appwrite Docs: https://appwrite.io/docs
- Expo Docs: https://docs.expo.dev
- React Native Paper: https://reactnativepaper.com

### Project Docs
- FINAL_DEPLOYMENT_GUIDE.md - Database setup
- APPWRITE_INTEGRATION_GUIDE.md - Service patterns
- PROJECT_COMPLETE_SUMMARY.md - Feature overview

### Support
- GitHub Issues: [Your repo]
- Appwrite Discord: https://appwrite.io/discord
- Expo Discord: https://chat.expo.dev

---

**Ready to integrate! Follow this guide phase by phase for a smooth migration to production.** 🚀
