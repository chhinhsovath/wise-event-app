# Appwrite Integration Guide

**Status**: Services Ready, Database Setup Required
**Next Step**: Create Appwrite database collections, then integrate services

---

## 📋 Prerequisites

Before integrating Appwrite into your app:

- [ ] Appwrite project created (692933ae0021e97f1214)
- [ ] Database "main" created in Appwrite console
- [ ] All 8 collections created (see APPWRITE_DATABASE_SETUP.md)
- [ ] Environment variables configured (.env file)
- [ ] Clerk authentication working

---

## 🎯 Integration Strategy

We'll migrate from mock data to Appwrite in this order:

1. ✅ **Service Layer Created** - All services ready
2. **Database Setup** - Create collections in Appwrite
3. **Seed Data** - Add initial sessions/speakers
4. **Integrate Services** - Replace mock data imports
5. **Real-time** - Add subscriptions
6. **Testing** - Verify all features work

---

## 🚀 Step-by-Step Integration

### Step 1: Database Setup (Required First!)

Follow `APPWRITE_DATABASE_SETUP.md` to create all collections in Appwrite Console:

1. Go to https://cloud.appwrite.io/console
2. Select WISE-PP project
3. Create database "main"
4. Create all 8 collections with attributes and indexes

**Important**: Do NOT proceed until collections are created!

---

### Step 2: Seed Initial Data

Create a seed script to populate initial data:

```typescript
// scripts/seedData.ts
import { SessionsService, UsersService } from '@/services';
import { mockSessions, mockSpeakers } from '@/lib/mockData';

async function seedDatabase() {
  console.log('Starting database seed...');

  try {
    // 1. Create event (if not exists)
    // 2. Create speakers
    // 3. Create sessions
    // 4. Verify data

    console.log('Seed completed successfully!');
  } catch (error) {
    console.error('Seed failed:', error);
  }
}

seedDatabase();
```

---

### Step 3: Migrate Sessions

#### Before (Mock Data):

```typescript
// src/app/(app)/(tabs)/schedule.tsx
import { mockSessions, filterSessions } from '@/lib/mockData';

export default function Schedule() {
  const filteredSessions = filterSessions(mockSessions, filters);
  // ...
}
```

#### After (Appwrite):

```typescript
// src/app/(app)/(tabs)/schedule.tsx
import { SessionsService } from '@/services';
import { useQuery } from '@tanstack/react-query';

export default function Schedule() {
  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['sessions', 'event-1'],
    queryFn: () => SessionsService.getSessionsByEvent('event-1'),
  });

  // Client-side filtering (or use specific service methods)
  const filteredSessions = filterSessionsClientSide(sessions, filters);
  // ...
}
```

---

### Step 4: Migrate Bookmarks

#### Update useBookmarks Hook:

```typescript
// src/hooks/useBookmarks.ts
import { BookmarksService } from '@/services';
import { useUser } from '@clerk/clerk-expo';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useBookmarks() {
  const { user } = useUser();
  const queryClient = useQueryClient();

  // Fetch bookmarks
  const { data: bookmarks = [] } = useQuery({
    queryKey: ['bookmarks', user?.id],
    queryFn: () => BookmarksService.getUserBookmarks(user!.id),
    enabled: !!user,
  });

  // Toggle bookmark mutation
  const toggleMutation = useMutation({
    mutationFn: (sessionId: string) =>
      BookmarksService.toggleBookmark(user!.id, sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks', user?.id] });
    },
  });

  return {
    bookmarkedSessions: bookmarks.map((b) => b.sessionId),
    isBookmarked: (sessionId: string) =>
      bookmarks.some((b) => b.sessionId === sessionId),
    toggleBookmark: toggleMutation.mutate,
    loading: toggleMutation.isPending,
  };
}
```

---

### Step 5: Migrate Users/Networking

#### Update Networking Screen:

```typescript
// src/app/(app)/(tabs)/networking.tsx
import { UsersService } from '@/services';
import { useQuery } from '@tanstack/react-query';

export default function Networking() {
  const [searchQuery, setSearchQuery] = useState('');

  const { data: attendees = [], isLoading } = useQuery({
    queryKey: ['attendees', searchQuery],
    queryFn: () => UsersService.searchUsers(searchQuery),
  });

  // ...
}
```

---

### Step 6: Migrate Connections

#### Update useConnections Hook:

```typescript
// src/hooks/useConnections.ts
import { ConnectionsService } from '@/services';
import { useUser } from '@clerk/clerk-expo';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useConnections() {
  const { user } = useUser();
  const queryClient = useQueryClient();

  // Fetch connections
  const { data: connections = [] } = useQuery({
    queryKey: ['connections', user?.id],
    queryFn: () => ConnectionsService.getAcceptedConnections(user!.id),
    enabled: !!user,
  });

  // Fetch pending requests
  const { data: pendingRequests = [] } = useQuery({
    queryKey: ['connections', 'pending', user?.id],
    queryFn: () => ConnectionsService.getPendingRequests(user!.id),
    enabled: !!user,
  });

  // Send connection mutation
  const sendRequestMutation = useMutation({
    mutationFn: ({ recipientId, message }: { recipientId: string; message?: string }) =>
      ConnectionsService.sendConnectionRequest(user!.id, recipientId, message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connections'] });
    },
  });

  // Accept connection mutation
  const acceptMutation = useMutation({
    mutationFn: (connectionId: string) =>
      ConnectionsService.acceptConnection(connectionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connections'] });
    },
  });

  return {
    connections,
    pendingRequests,
    sendConnectionRequest: sendRequestMutation.mutate,
    acceptConnection: acceptMutation.mutate,
    // ...
  };
}
```

---

### Step 7: Add Real-time Subscriptions

#### For New Messages:

```typescript
// src/app/(app)/chat/[conversationId].tsx
import { client } from '@/services/appwrite';
import { useEffect } from 'react';

export default function Chat() {
  const { conversationId } = useLocalSearchParams();

  useEffect(() => {
    // Subscribe to new messages in this conversation
    const unsubscribe = client.subscribe(
      `databases.main.collections.messages.documents`,
      (response) => {
        if (response.events.includes('databases.*.collections.*.documents.*.create')) {
          const newMessage = response.payload;
          if (newMessage.conversationId === conversationId) {
            // Add new message to UI
            queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
          }
        }
      }
    );

    return () => {
      unsubscribe();
    };
  }, [conversationId]);

  // ...
}
```

#### For Connection Requests:

```typescript
// src/hooks/useConnections.ts
useEffect(() => {
  if (!user) return;

  const unsubscribe = client.subscribe(
    `databases.main.collections.connections.documents`,
    (response) => {
      // Invalidate queries when connections change
      queryClient.invalidateQueries({ queryKey: ['connections'] });
    }
  );

  return () => unsubscribe();
}, [user]);
```

---

## 📝 Migration Checklist

### Phase 1: Database Setup

- [ ] All 8 collections created in Appwrite
- [ ] All attributes added correctly
- [ ] All indexes created
- [ ] Permissions configured
- [ ] Test queries work (use Appwrite Console)

### Phase 2: Data Seeding

- [ ] Event created
- [ ] Sessions migrated from mockData
- [ ] Speakers migrated from mockData
- [ ] Verify data appears in Appwrite Console

### Phase 3: Code Integration

- [ ] Sessions screen uses SessionsService
- [ ] Session details uses SessionsService
- [ ] Bookmarks hook uses BookmarksService
- [ ] Networking screen uses UsersService
- [ ] Connections hook uses ConnectionsService
- [ ] Chat screen uses MessagesService

### Phase 4: Real-time

- [ ] Message subscriptions added
- [ ] Connection request subscriptions added
- [ ] Bookmark sync subscriptions added
- [ ] Test real-time updates work

### Phase 5: Testing

- [ ] All screens load data correctly
- [ ] CRUD operations work (Create, Read, Update, Delete)
- [ ] Permissions prevent unauthorized access
- [ ] Real-time updates work
- [ ] Performance is acceptable

---

## 🔧 Common Issues & Solutions

### Issue: "Collection not found"

**Solution**: Verify collection ID matches exactly in constants.ts:

```typescript
export const COLLECTIONS = {
  SESSIONS: 'sessions', // Must match Appwrite collection ID
  // ...
};
```

### Issue: "Permission denied"

**Solution**: Check permissions in Appwrite Console:

- For bookmarks: `read("user:[USER_ID]")`, `create("users")`
- For sessions: `read("any")`
- Ensure document security is enabled

### Issue: "Queries returning empty"

**Solution**:

1. Verify data exists in Appwrite Console
2. Check query syntax (use Query helpers from SDK)
3. Verify permissions allow reading
4. Check filters aren't too restrictive

### Issue: "Real-time not working"

**Solution**:

1. Verify subscription channel syntax
2. Check Appwrite project allows realtime
3. Ensure unsubscribe is called on cleanup
4. Verify event names match

---

## 🎯 Best Practices

### 1. Use React Query

```typescript
// ✅ Good - Automatic caching, loading states, refetching
const { data, isLoading, error } = useQuery({
  queryKey: ['sessions'],
  queryFn: () => SessionsService.getSessionsByEvent('event-1'),
});

// ❌ Bad - Manual state management, no caching
const [sessions, setSessions] = useState([]);
useEffect(() => {
  SessionsService.getSessionsByEvent('event-1').then(setSessions);
}, []);
```

### 2. Invalidate Queries After Mutations

```typescript
// ✅ Good - UI updates automatically
const mutation = useMutation({
  mutationFn: BookmarksService.toggleBookmark,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
  },
});

// ❌ Bad - Stale data in UI
const mutation = useMutation({
  mutationFn: BookmarksService.toggleBookmark,
  // No invalidation - UI won't update!
});
```

### 3. Handle Loading States

```typescript
// ✅ Good - Show loading indicator
if (isLoading) return <ActivityIndicator />;
if (error) return <Text>Error: {error.message}</Text>;
return <SessionList sessions={data} />;

// ❌ Bad - No loading feedback
return <SessionList sessions={data || []} />;
```

### 4. Optimize with Query Keys

```typescript
// ✅ Good - Granular cache control
queryKey: ['sessions', 'event-1', filters];

// ❌ Bad - All sessions share one cache
queryKey: ['sessions'];
```

---

## 📊 Performance Considerations

### Client-side vs Server-side Filtering

**Client-side** (Current):

```typescript
const allSessions = await SessionsService.getSessionsByEvent('event-1');
const filtered = allSessions.filter((s) => s.type === 'workshop');
```

**Pros**: Instant filtering, works offline
**Cons**: Downloads all data, slow for large datasets

**Server-side** (Better for production):

```typescript
const filtered = await SessionsService.getSessionsByType('event-1', 'workshop');
```

**Pros**: Less data transfer, faster for large datasets
**Cons**: Network required for each filter

### Pagination

For large lists, implement pagination:

```typescript
const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
  queryKey: ['sessions'],
  queryFn: ({ pageParam = 0 }) =>
    SessionsService.getSessionsByEvent('event-1', pageParam),
  getNextPageParam: (lastPage, pages) => {
    // Return next page number or undefined if no more pages
  },
});
```

---

## 🔐 Security Reminders

1. **Never expose API keys** - Use environment variables
2. **Use Clerk userId** - Always pass `user.id` from Clerk
3. **Validate permissions** - Appwrite enforces on server
4. **Sanitize inputs** - Prevent injection attacks
5. **Rate limiting** - Appwrite has built-in protection

---

## 🆘 Troubleshooting Commands

### Check if services work:

```typescript
// In app console or temporary component
import { SessionsService } from '@/services';

// Test fetching sessions
SessionsService.getSessionsByEvent('event-1')
  .then((sessions) => console.log('Sessions:', sessions))
  .catch((error) => console.error('Error:', error));
```

### Verify Appwrite connection:

```typescript
import { client } from '@/services/appwrite';

client
  .health()
  .then(() => console.log('✅ Appwrite connected'))
  .catch((error) => console.error('❌ Appwrite error:', error));
```

---

## ✅ Success Criteria

You'll know integration is complete when:

- [ ] All screens load data from Appwrite (not mock data)
- [ ] Creating/updating/deleting works
- [ ] Real-time updates appear instantly
- [ ] Permissions work correctly (users can't see private data)
- [ ] Performance is good (< 2s initial load)
- [ ] No errors in console
- [ ] App works offline (cached data)

---

**Next**: After database setup, start with Session integration (easiest), then Bookmarks, then Networking features.

**Estimated Time**: 2-3 hours total for full migration
