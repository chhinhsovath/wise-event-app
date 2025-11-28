# Appwrite Setup Guide - WISE Event App

**Last Updated**: November 28, 2025
**Purpose**: Complete guide to setting up Appwrite backend for WISE Event App
**Status**: Ready for production deployment

---

## 📋 Overview

This guide provides step-by-step instructions to set up your Appwrite instance for the WISE Event App. The app uses Appwrite for:
- User profile storage
- Session and event data
- Bookmarks and attendance
- Networking connections
- Real-time updates
- Polls and Q&A

**Estimated Setup Time**: 45-60 minutes

---

## 🔧 Prerequisites

Before starting, ensure you have:
- ✅ Appwrite instance running (Cloud or Self-hosted)
- ✅ Appwrite Console access
- ✅ Project created in Appwrite
- ✅ Project ID and API endpoint ready

---

## 📊 Database Structure

### Database: `main`

Create a database named `main` in your Appwrite project.

**Collections to Create**: 9 collections
1. `users` - User profiles
2. `events` - Events
3. `sessions` - Event sessions
4. `bookmarks` - Session bookmarks
5. `connections` - User connections
6. `messages` - Direct messages
7. `notifications` - Push notifications
8. `checkins` - Session attendance
9. `polls` - Session polls
10. `poll_votes` - Poll votes
11. `questions` - Q&A questions

---

## 🗂️ Collection Schemas

### 1. Collection: `users`

**Purpose**: Store user profiles synced from Clerk

**Attributes**:
```json
{
  "clerkUserId": {
    "type": "string",
    "size": 255,
    "required": true,
    "array": false
  },
  "email": {
    "type": "email",
    "required": true,
    "array": false
  },
  "fullName": {
    "type": "string",
    "size": 255,
    "required": true,
    "array": false
  },
  "avatar": {
    "type": "url",
    "required": false,
    "array": false
  },
  "title": {
    "type": "string",
    "size": 255,
    "required": false,
    "array": false
  },
  "organization": {
    "type": "string",
    "size": 255,
    "required": false,
    "array": false
  },
  "bio": {
    "type": "string",
    "size": 1000,
    "required": false,
    "array": false
  },
  "interests": {
    "type": "string",
    "size": 100,
    "required": false,
    "array": true
  },
  "role": {
    "type": "enum",
    "elements": ["attendee", "speaker", "organizer", "admin"],
    "required": true,
    "default": "attendee",
    "array": false
  },
  "isPublic": {
    "type": "boolean",
    "required": true,
    "default": true,
    "array": false
  },
  "badges": {
    "type": "string",
    "size": 50,
    "required": false,
    "array": true
  }
}
```

**Indexes**:
- `clerkUserId` (key, unique)
- `email` (key, unique)
- `role` (key)
- `isPublic` (key)

**Permissions**:
- Read: `users` (authenticated users can read public profiles)
- Create: `users` (authenticated users can create their profile)
- Update: `user:[USER_ID]` (users can update their own profile)
- Delete: `user:[USER_ID]` (users can delete their own profile)

---

### 2. Collection: `events`

**Purpose**: Store events

**Attributes**:
```json
{
  "name": {
    "type": "string",
    "size": 255,
    "required": true,
    "array": false
  },
  "description": {
    "type": "string",
    "size": 5000,
    "required": false,
    "array": false
  },
  "startDate": {
    "type": "datetime",
    "required": true,
    "array": false
  },
  "endDate": {
    "type": "datetime",
    "required": true,
    "array": false
  },
  "location": {
    "type": "string",
    "size": 500,
    "required": false,
    "array": false
  },
  "imageUrl": {
    "type": "url",
    "required": false,
    "array": false
  },
  "status": {
    "type": "enum",
    "elements": ["draft", "published", "ongoing", "completed"],
    "required": true,
    "default": "draft",
    "array": false
  },
  "organizerId": {
    "type": "string",
    "size": 255,
    "required": true,
    "array": false
  }
}
```

**Indexes**:
- `status` (key)
- `startDate` (key)
- `organizerId` (key)

**Permissions**:
- Read: `any` (public can view published events)
- Create: `users` (authenticated users can create events)
- Update: Custom (organizers and admins can update)
- Delete: Custom (organizers and admins can delete)

---

### 3. Collection: `sessions`

**Purpose**: Store event sessions

**Attributes**:
```json
{
  "eventId": {
    "type": "string",
    "size": 255,
    "required": true,
    "array": false
  },
  "title": {
    "type": "string",
    "size": 255,
    "required": true,
    "array": false
  },
  "description": {
    "type": "string",
    "size": 5000,
    "required": false,
    "array": false
  },
  "type": {
    "type": "enum",
    "elements": ["keynote", "workshop", "panel", "networking", "breakout"],
    "required": true,
    "array": false
  },
  "track": {
    "type": "string",
    "size": 100,
    "required": false,
    "array": false
  },
  "startTime": {
    "type": "datetime",
    "required": true,
    "array": false
  },
  "endTime": {
    "type": "datetime",
    "required": true,
    "array": false
  },
  "room": {
    "type": "string",
    "size": 100,
    "required": false,
    "array": false
  },
  "capacity": {
    "type": "integer",
    "required": false,
    "min": 0,
    "array": false
  },
  "speakerIds": {
    "type": "string",
    "size": 255,
    "required": false,
    "array": true
  },
  "tags": {
    "type": "string",
    "size": 50,
    "required": false,
    "array": true
  },
  "level": {
    "type": "enum",
    "elements": ["beginner", "intermediate", "advanced"],
    "required": false,
    "array": false
  }
}
```

**Indexes**:
- `eventId` (key)
- `type` (key)
- `track` (key)
- `startTime` (key)
- `tags` (fulltext)

**Permissions**:
- Read: `any` (public can view sessions)
- Create: Custom (organizers and admins can create)
- Update: Custom (organizers and admins can update)
- Delete: Custom (organizers and admins can delete)

---

### 4. Collection: `bookmarks`

**Purpose**: Store user session bookmarks

**Attributes**:
```json
{
  "clerkUserId": {
    "type": "string",
    "size": 255,
    "required": true,
    "array": false
  },
  "sessionId": {
    "type": "string",
    "size": 255,
    "required": true,
    "array": false
  },
  "notes": {
    "type": "string",
    "size": 1000,
    "required": false,
    "array": false
  }
}
```

**Indexes**:
- `clerkUserId` (key)
- `sessionId` (key)
- Compound: `clerkUserId + sessionId` (unique)

**Permissions**:
- Read: `user:[USER_ID]` (users can read their own bookmarks)
- Create: `user:[USER_ID]` (users can create their bookmarks)
- Update: `user:[USER_ID]` (users can update their bookmarks)
- Delete: `user:[USER_ID]` (users can delete their bookmarks)

---

### 5. Collection: `connections`

**Purpose**: Store user connections

**Attributes**:
```json
{
  "user1Id": {
    "type": "string",
    "size": 255,
    "required": true,
    "array": false,
    "note": "Requester's clerkUserId"
  },
  "user2Id": {
    "type": "string",
    "size": 255,
    "required": true,
    "array": false,
    "note": "Recipient's clerkUserId"
  },
  "status": {
    "type": "enum",
    "elements": ["pending", "accepted", "declined"],
    "required": true,
    "default": "pending",
    "array": false
  },
  "message": {
    "type": "string",
    "size": 500,
    "required": false,
    "array": false
  }
}
```

**Indexes**:
- `user1Id` (key)
- `user2Id` (key)
- `status` (key)

**Permissions**:
- Read: Custom (users can read connections they're part of)
- Create: `users` (authenticated users can create connections)
- Update: Custom (recipient can update status)
- Delete: Custom (either party can delete)

---

### 6. Collection: `messages`

**Purpose**: Store direct messages between users

**Attributes**:
```json
{
  "senderId": {
    "type": "string",
    "size": 255,
    "required": true,
    "array": false
  },
  "recipientId": {
    "type": "string",
    "size": 255,
    "required": true,
    "array": false
  },
  "content": {
    "type": "string",
    "size": 5000,
    "required": true,
    "array": false
  },
  "isRead": {
    "type": "boolean",
    "required": true,
    "default": false,
    "array": false
  },
  "readAt": {
    "type": "datetime",
    "required": false,
    "array": false
  }
}
```

**Indexes**:
- `senderId` (key)
- `recipientId` (key)
- `isRead` (key)

**Permissions**:
- Read: Custom (sender and recipient can read)
- Create: `users` (authenticated users can send messages)
- Update: Custom (recipient can mark as read)
- Delete: Custom (sender can delete)

---

### 7. Collection: `notifications`

**Purpose**: Store push notifications

**Attributes**:
```json
{
  "clerkUserId": {
    "type": "string",
    "size": 255,
    "required": true,
    "array": false
  },
  "type": {
    "type": "enum",
    "elements": [
      "session_reminder",
      "message",
      "connection_request",
      "connection_accepted",
      "announcement",
      "schedule_change"
    ],
    "required": true,
    "array": false
  },
  "title": {
    "type": "string",
    "size": 255,
    "required": true,
    "array": false
  },
  "body": {
    "type": "string",
    "size": 1000,
    "required": true,
    "array": false
  },
  "isRead": {
    "type": "boolean",
    "required": true,
    "default": false,
    "array": false
  },
  "data": {
    "type": "string",
    "size": 1000,
    "required": false,
    "array": false,
    "note": "JSON string with additional data"
  }
}
```

**Indexes**:
- `clerkUserId` (key)
- `type` (key)
- `isRead` (key)

**Permissions**:
- Read: `user:[USER_ID]` (users can read their notifications)
- Create: Custom (system can create notifications)
- Update: `user:[USER_ID]` (users can mark as read)
- Delete: `user:[USER_ID]` (users can delete their notifications)

---

### 8. Collection: `checkins`

**Purpose**: Store session check-ins

**Attributes**:
```json
{
  "clerkUserId": {
    "type": "string",
    "size": 255,
    "required": true,
    "array": false
  },
  "sessionId": {
    "type": "string",
    "size": 255,
    "required": true,
    "array": false
  },
  "checkInTime": {
    "type": "datetime",
    "required": true,
    "array": false
  },
  "checkOutTime": {
    "type": "datetime",
    "required": false,
    "array": false
  },
  "method": {
    "type": "enum",
    "elements": ["qr", "nfc", "geofence", "manual"],
    "required": true,
    "array": false
  },
  "location": {
    "type": "string",
    "size": 500,
    "required": false,
    "array": false,
    "note": "JSON string with lat/lng"
  }
}
```

**Indexes**:
- `clerkUserId` (key)
- `sessionId` (key)
- `checkInTime` (key)
- `method` (key)

**Permissions**:
- Read: Custom (organizers can read, users can read their own)
- Create: `users` (authenticated users can check in)
- Update: Custom (system can update check-out time)
- Delete: Custom (admins can delete)

---

### 9. Collection: `polls`

**Purpose**: Store session polls

**Attributes**:
```json
{
  "sessionId": {
    "type": "string",
    "size": 255,
    "required": true,
    "array": false
  },
  "question": {
    "type": "string",
    "size": 500,
    "required": true,
    "array": false
  },
  "options": {
    "type": "string",
    "size": 5000,
    "required": true,
    "array": false,
    "note": "JSON string with poll options"
  },
  "allowMultiple": {
    "type": "boolean",
    "required": true,
    "default": false,
    "array": false
  },
  "status": {
    "type": "enum",
    "elements": ["active", "closed"],
    "required": true,
    "default": "active",
    "array": false
  },
  "createdBy": {
    "type": "string",
    "size": 255,
    "required": true,
    "array": false
  }
}
```

**Indexes**:
- `sessionId` (key)
- `status` (key)
- `createdBy` (key)

**Permissions**:
- Read: `any` (public can view polls)
- Create: Custom (organizers and speakers can create)
- Update: Custom (creator can update)
- Delete: Custom (creator and admins can delete)

---

### 10. Collection: `poll_votes`

**Purpose**: Store poll votes

**Attributes**:
```json
{
  "pollId": {
    "type": "string",
    "size": 255,
    "required": true,
    "array": false
  },
  "clerkUserId": {
    "type": "string",
    "size": 255,
    "required": true,
    "array": false
  },
  "optionIds": {
    "type": "string",
    "size": 100,
    "required": true,
    "array": true
  }
}
```

**Indexes**:
- `pollId` (key)
- `clerkUserId` (key)
- Compound: `pollId + clerkUserId` (unique)

**Permissions**:
- Read: Custom (for counting, organizers can read)
- Create: `users` (authenticated users can vote)
- Update: `user:[USER_ID]` (users can change their vote)
- Delete: `user:[USER_ID]` (users can delete their vote)

---

### 11. Collection: `questions`

**Purpose**: Store Q&A questions

**Attributes**:
```json
{
  "sessionId": {
    "type": "string",
    "size": 255,
    "required": true,
    "array": false
  },
  "clerkUserId": {
    "type": "string",
    "size": 255,
    "required": true,
    "array": false
  },
  "question": {
    "type": "string",
    "size": 1000,
    "required": true,
    "array": false
  },
  "status": {
    "type": "enum",
    "elements": ["pending", "approved", "rejected"],
    "required": true,
    "default": "pending",
    "array": false
  },
  "upvotes": {
    "type": "integer",
    "required": true,
    "default": 0,
    "array": false
  },
  "upvotedBy": {
    "type": "string",
    "size": 255,
    "required": false,
    "array": true
  },
  "isAnswered": {
    "type": "boolean",
    "required": true,
    "default": false,
    "array": false
  },
  "answer": {
    "type": "string",
    "size": 2000,
    "required": false,
    "array": false
  },
  "answeredBy": {
    "type": "string",
    "size": 255,
    "required": false,
    "array": false
  },
  "answeredAt": {
    "type": "datetime",
    "required": false,
    "array": false
  }
}
```

**Indexes**:
- `sessionId` (key)
- `clerkUserId` (key)
- `status` (key)
- `upvotes` (key, descending)
- `isAnswered` (key)

**Permissions**:
- Read: `any` (public can view approved questions)
- Create: `users` (authenticated users can submit questions)
- Update: Custom (moderators can approve/answer)
- Delete: Custom (creator and moderators can delete)

---

## 🔐 Realtime Configuration

Enable Realtime for these collections:
- ✅ `polls` - For live vote updates
- ✅ `poll_votes` - For vote count changes
- ✅ `questions` - For new questions and upvotes
- ✅ `checkins` - For live attendance updates
- ✅ `messages` - For instant message delivery
- ✅ `notifications` - For real-time notifications

**How to Enable**:
1. Go to Appwrite Console → Database → Collection
2. Click Settings tab
3. Enable "Realtime" toggle
4. Save changes

---

## 🚀 Quick Setup Script

Create a file `setup-appwrite.js` to automate collection creation:

```javascript
const sdk = require('node-appwrite');

const client = new sdk.Client();
const databases = new sdk.Databases(client);

client
  .setEndpoint('YOUR_APPWRITE_ENDPOINT')
  .setProject('YOUR_PROJECT_ID')
  .setKey('YOUR_API_KEY');

async function setupDatabase() {
  // Create database
  await databases.create('main', 'WISE Event App Database');

  // Create collections
  // Add collection creation code here...

  console.log('✅ Appwrite setup complete!');
}

setupDatabase().catch(console.error);
```

---

## 🧪 Testing Checklist

After setup, test these operations:

**User Profiles**:
- [ ] Create user profile from Clerk
- [ ] Update profile information
- [ ] View public profiles

**Sessions & Bookmarks**:
- [ ] Create events and sessions
- [ ] Bookmark a session
- [ ] View My Agenda

**Networking**:
- [ ] Send connection request
- [ ] Accept connection
- [ ] Send direct message

**Check-ins**:
- [ ] Generate session QR code
- [ ] Scan QR code to check in
- [ ] View attendance list

**Polls & Q&A**:
- [ ] Create a poll
- [ ] Vote on poll
- [ ] Submit question
- [ ] Upvote question

**Realtime**:
- [ ] Open polls on two devices
- [ ] Vote on one, see update on other
- [ ] Verify real-time connection

---

## 📚 Additional Resources

- **Appwrite Documentation**: https://appwrite.io/docs
- **React Native SDK**: https://appwrite.io/docs/sdks#client
- **Realtime Guide**: https://appwrite.io/docs/realtime
- **Permissions Guide**: https://appwrite.io/docs/permissions

---

**Setup Complete!** Your Appwrite backend is now ready for the WISE Event App. 🎉

Next steps:
1. Seed test data (see `SEED_DATA_GUIDE.md`)
2. Update app configuration with your Appwrite credentials
3. Test all features end-to-end
4. Deploy to production
