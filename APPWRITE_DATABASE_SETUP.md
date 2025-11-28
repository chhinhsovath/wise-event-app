# Appwrite Database Setup Guide

**Project**: WISE Event App
**Appwrite Project ID**: 692933ae0021e97f1214
**Endpoint**: https://fra.cloud.appwrite.io/v1
**Database ID**: main

---

## 🚀 Quick Setup

You can set up the database in two ways:

### Option 1: Using Appwrite Console (Recommended for First Time)
1. Go to https://cloud.appwrite.io/console
2. Select your project: WISE-PP (692933ae0021e97f1214)
3. Create database named "main"
4. Follow the schema definitions below to create collections

### Option 2: Using Appwrite CLI (Advanced)
```bash
# Install Appwrite CLI
npm install -g appwrite-cli

# Login to your account
appwrite login

# Set project
appwrite client --endpoint https://fra.cloud.appwrite.io/v1 --projectId 692933ae0021e97f1214

# Create database
appwrite databases create --databaseId main --name "WISE Event Database"

# Create collections (see scripts below)
```

---

## 📊 Database Schema

### Database: `main`

Collections to create:

1. **users** - User profiles synced from Clerk
2. **events** - Event information
3. **sessions** - Event sessions
4. **speakers** - Speaker profiles
5. **bookmarks** - User session bookmarks
6. **connections** - User connections/networking
7. **messages** - Chat messages
8. **conversations** - Conversation metadata

---

## Collection 1: Users

**Collection ID**: `users`
**Name**: User Profiles

### Attributes:

| Key | Type | Size | Required | Array | Default |
|-----|------|------|----------|-------|---------|
| clerkUserId | string | 255 | Yes | No | - |
| email | string | 320 | Yes | No | - |
| fullName | string | 255 | Yes | No | - |
| avatar | url | 2000 | No | No | - |
| title | string | 255 | No | No | - |
| organization | string | 255 | No | No | - |
| bio | string | 5000 | No | No | - |
| interests | string | 100 | No | Yes | - |
| role | enum | - | Yes | No | attendee |
| isPublic | boolean | - | Yes | No | true |
| points | integer | - | Yes | No | 0 |
| badges | string | 100 | No | Yes | - |

**Enum for role**: `attendee`, `speaker`, `organizer`, `admin`

### Indexes:

| Key | Type | Attributes |
|-----|------|------------|
| clerkUserId | unique | clerkUserId (ASC) |
| email | unique | email (ASC) |
| role | key | role (ASC) |
| isPublic | key | isPublic (ASC) |

### Permissions:

**Document Security**: Enabled

**Permissions**:
- `read("any")` - Anyone can read public profiles
- `create("users")` - Any authenticated user can create
- `update("user:[USER_ID]")` - Users can update their own profile
- `delete("user:[USER_ID]")` - Users can delete their own profile

### CLI Command:
```bash
appwrite databases createCollection \
  --databaseId main \
  --collectionId users \
  --name "User Profiles" \
  --permissions 'read("any")' 'create("users")' \
  --documentSecurity true
```

---

## Collection 2: Events

**Collection ID**: `events`
**Name**: Events

### Attributes:

| Key | Type | Size | Required | Array | Default |
|-----|------|------|----------|-------|---------|
| title | string | 255 | Yes | No | - |
| description | string | 10000 | Yes | No | - |
| startDate | datetime | - | Yes | No | - |
| endDate | datetime | - | Yes | No | - |
| venue | string | 500 | Yes | No | - |
| venueAddress | string | 1000 | No | No | - |
| timezone | string | 50 | Yes | No | UTC |
| bannerImage | url | 2000 | No | No | - |
| status | enum | - | Yes | No | draft |

**Enum for status**: `draft`, `published`, `ongoing`, `completed`

### Indexes:

| Key | Type | Attributes |
|-----|------|------------|
| status | key | status (ASC) |
| startDate | key | startDate (DESC) |

### Permissions:

- `read("any")` - Anyone can read events
- `create("role:admin")` - Only admins can create events
- `update("role:admin")` - Only admins can update events
- `delete("role:admin")` - Only admins can delete events

---

## Collection 3: Sessions

**Collection ID**: `sessions`
**Name**: Event Sessions

### Attributes:

| Key | Type | Size | Required | Array | Default |
|-----|------|------|----------|-------|---------|
| eventId | string | 255 | Yes | No | - |
| title | string | 500 | Yes | No | - |
| description | string | 10000 | No | No | - |
| type | enum | - | Yes | No | keynote |
| track | string | 255 | No | No | - |
| startTime | datetime | - | Yes | No | - |
| endTime | datetime | - | Yes | No | - |
| room | string | 255 | Yes | No | - |
| floor | string | 100 | No | No | - |
| speakerIds | string | 255 | No | Yes | - |
| capacity | integer | - | No | No | 0 |
| currentAttendees | integer | - | Yes | No | 0 |
| tags | string | 100 | No | Yes | - |
| isFeatured | boolean | - | Yes | No | false |
| status | enum | - | Yes | No | scheduled |

**Enum for type**: `keynote`, `panel`, `workshop`, `networking`, `breakout`, `exhibition`

**Enum for status**: `scheduled`, `live`, `completed`, `cancelled`

### Indexes:

| Key | Type | Attributes |
|-----|------|------------|
| eventId | key | eventId (ASC) |
| type | key | type (ASC) |
| startTime | key | startTime (ASC) |
| isFeatured | key | isFeatured (DESC) |
| status | key | status (ASC) |

### Permissions:

- `read("any")` - Anyone can read sessions
- `create("role:organizer")` - Organizers can create sessions
- `update("role:organizer")` - Organizers can update sessions
- `delete("role:admin")` - Only admins can delete sessions

---

## Collection 4: Speakers

**Collection ID**: `speakers`
**Name**: Speakers

### Attributes:

| Key | Type | Size | Required | Array | Default |
|-----|------|------|----------|-------|---------|
| clerkUserId | string | 255 | No | No | - |
| name | string | 255 | Yes | No | - |
| photo | url | 2000 | No | No | - |
| title | string | 255 | Yes | No | - |
| organization | string | 255 | Yes | No | - |
| bio | string | 5000 | No | No | - |
| expertise | string | 100 | No | Yes | - |
| isFeatured | boolean | - | Yes | No | false |
| sortOrder | integer | - | Yes | No | 0 |

### Indexes:

| Key | Type | Attributes |
|-----|------|------------|
| isFeatured | key | isFeatured (DESC) |
| sortOrder | key | sortOrder (ASC) |
| clerkUserId | key | clerkUserId (ASC) |

### Permissions:

- `read("any")` - Anyone can read speakers
- `create("role:organizer")` - Organizers can create speakers
- `update("role:organizer")` - Organizers can update speakers

---

## Collection 5: Bookmarks

**Collection ID**: `bookmarks`
**Name**: Session Bookmarks

### Attributes:

| Key | Type | Size | Required | Array | Default |
|-----|------|------|----------|-------|---------|
| clerkUserId | string | 255 | Yes | No | - |
| sessionId | string | 255 | Yes | No | - |
| reminderTime | integer | - | No | No | 15 |
| notes | string | 2000 | No | No | - |

### Indexes:

| Key | Type | Attributes |
|-----|------|------------|
| userId_session | unique | clerkUserId (ASC), sessionId (ASC) |
| clerkUserId | key | clerkUserId (ASC) |
| sessionId | key | sessionId (ASC) |

### Permissions:

- `read("user:[USER_ID]")` - Users can only read their own bookmarks
- `create("users")` - Any authenticated user can create bookmarks
- `update("user:[USER_ID]")` - Users can update their own bookmarks
- `delete("user:[USER_ID]")` - Users can delete their own bookmarks

---

## Collection 6: Connections

**Collection ID**: `connections`
**Name**: User Connections

### Attributes:

| Key | Type | Size | Required | Array | Default |
|-----|------|------|----------|-------|---------|
| requesterId | string | 255 | Yes | No | - |
| recipientId | string | 255 | Yes | No | - |
| status | enum | - | Yes | No | pending |
| message | string | 500 | No | No | - |

**Enum for status**: `pending`, `accepted`, `declined`

### Indexes:

| Key | Type | Attributes |
|-----|------|------------|
| requesterId | key | requesterId (ASC) |
| recipientId | key | recipientId (ASC) |
| status | key | status (ASC) |
| connection | unique | requesterId (ASC), recipientId (ASC) |

### Permissions:

- `read("user:[USER_ID]")` - Users can read connections involving them
- `create("users")` - Any authenticated user can create connections
- `update("user:[USER_ID]")` - Users can update connections they're part of
- `delete("user:[USER_ID]")` - Users can delete connections they're part of

---

## Collection 7: Messages

**Collection ID**: `messages`
**Name**: Chat Messages

### Attributes:

| Key | Type | Size | Required | Array | Default |
|-----|------|------|----------|-------|---------|
| conversationId | string | 255 | Yes | No | - |
| senderId | string | 255 | Yes | No | - |
| recipientId | string | 255 | Yes | No | - |
| content | string | 5000 | Yes | No | - |
| type | enum | - | Yes | No | text |
| isRead | boolean | - | Yes | No | false |

**Enum for type**: `text`, `image`, `file`

### Indexes:

| Key | Type | Attributes |
|-----|------|------------|
| conversationId | key | conversationId (ASC) |
| senderId | key | senderId (ASC) |
| recipientId | key | recipientId (ASC) |
| createdAt | key | $createdAt (DESC) |

### Permissions:

- `read("user:[USER_ID]")` - Users can read messages they sent or received
- `create("users")` - Any authenticated user can create messages
- `update("user:[USER_ID]")` - Users can update their own messages (e.g., mark as read)

---

## Collection 8: Conversations

**Collection ID**: `conversations`
**Name**: Conversations

### Attributes:

| Key | Type | Size | Required | Array | Default |
|-----|------|------|----------|-------|---------|
| participantIds | string | 255 | Yes | Yes | - |
| lastMessageId | string | 255 | No | No | - |
| lastMessageTime | datetime | - | No | No | - |
| unreadCount | integer | - | Yes | No | 0 |

### Indexes:

| Key | Type | Attributes |
|-----|------|------------|
| participants | key | participantIds (ASC) |
| lastMessageTime | key | lastMessageTime (DESC) |

### Permissions:

- `read("user:[USER_ID]")` - Users can read conversations they're part of
- `create("users")` - Any authenticated user can create conversations
- `update("user:[USER_ID]")` - Users can update conversations they're part of

---

## 🔐 Security Rules Summary

### User Profiles
- ✅ Public profiles readable by anyone
- ✅ Users control their own data
- ✅ Clerk userId as unique identifier

### Sessions & Speakers
- ✅ Public content readable by all
- ✅ Organizers manage content
- ✅ Admins have full control

### Bookmarks
- ✅ Private to each user
- ✅ Users can only see/modify their own bookmarks
- ✅ Unique constraint prevents duplicate bookmarks

### Connections & Messages
- ✅ Users can only access their own connections/messages
- ✅ Privacy by default
- ✅ Unique constraints prevent duplicate connections

---

## 📝 Setup Checklist

### Before Creating Collections:

- [ ] Appwrite project created (692933ae0021e97f1214)
- [ ] Database "main" created
- [ ] API key generated (if using CLI)

### Create Collections in Order:

- [ ] 1. Users
- [ ] 2. Events
- [ ] 3. Sessions
- [ ] 4. Speakers
- [ ] 5. Bookmarks
- [ ] 6. Connections
- [ ] 7. Messages
- [ ] 8. Conversations

### For Each Collection:

- [ ] Create collection with correct ID
- [ ] Add all attributes with correct types
- [ ] Create all indexes
- [ ] Set permissions correctly
- [ ] Enable document security

### After Setup:

- [ ] Test creating a user profile
- [ ] Test creating a session
- [ ] Test creating a bookmark
- [ ] Test connection request
- [ ] Verify permissions work correctly

---

## 🧪 Testing the Database

### Test User Creation:

```javascript
import { databases } from '@/services/appwrite';

const user = await databases.createDocument(
  'main',
  'users',
  ID.unique(),
  {
    clerkUserId: 'clerk_test_123',
    email: 'test@example.com',
    fullName: 'Test User',
    role: 'attendee',
    isPublic: true,
    points: 0
  }
);
```

### Test Session Query:

```javascript
import { Query } from 'react-native-appwrite';

const sessions = await databases.listDocuments(
  'main',
  'sessions',
  [
    Query.equal('eventId', 'event-123'),
    Query.equal('status', 'scheduled'),
    Query.orderAsc('startTime')
  ]
);
```

### Test Bookmark Creation:

```javascript
const bookmark = await databases.createDocument(
  'main',
  'bookmarks',
  ID.unique(),
  {
    clerkUserId: user.clerkUserId,
    sessionId: 'session-123',
    reminderTime: 15
  }
);
```

---

## 🔄 Migration from Mock Data

Once collections are set up, you'll need to:

1. **Seed Initial Data**:
   - Create an event
   - Add sessions from mockData
   - Add speakers from mockData

2. **Update App Code**:
   - Replace mock data imports with Appwrite queries
   - Update hooks to use Appwrite
   - Add real-time subscriptions

3. **Test Thoroughly**:
   - Verify all CRUD operations work
   - Test permissions are correct
   - Ensure real-time updates work

---

## 📚 Useful Resources

- [Appwrite Databases Docs](https://appwrite.io/docs/products/databases)
- [Appwrite Security](https://appwrite.io/docs/products/databases/permissions)
- [Appwrite Realtime](https://appwrite.io/docs/apis/realtime)
- [React Native SDK](https://appwrite.io/docs/sdks#client)

---

## 🆘 Troubleshooting

### Can't Create Collection
- Check database ID is "main"
- Verify you have proper permissions
- Try via Console instead of CLI

### Permissions Not Working
- Ensure document security is enabled
- Check permission syntax (e.g., `user:[USER_ID]` vs `users`)
- Verify user is authenticated with Clerk

### Queries Returning Empty
- Check collection has data
- Verify query syntax (use Query helpers)
- Check permissions allow reading

---

**Next**: After database setup, proceed to integrate Appwrite into the app code using the service layer pattern.
