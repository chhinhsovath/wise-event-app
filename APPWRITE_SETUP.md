# Appwrite Database Setup Guide

This guide walks you through setting up the Appwrite database schema for the WISE Event App.

## Prerequisites

- Appwrite Cloud account (https://cloud.appwrite.io) or self-hosted instance
- Project created in Appwrite

## Step 1: Create Database

1. Log in to your Appwrite Console
2. Select your project
3. Go to **Databases** in the left sidebar
4. Click **Create Database**
5. Name it: `wise-event-db`
6. Click **Create**
7. **Copy the Database ID** → You'll need this for `.env`

## Step 2: Create Collections

For each collection below, follow these steps:
1. Click **Create Collection**
2. Enter the collection ID and name
3. Click **Create**
4. Add attributes as specified
5. Set permissions

### Collection 1: `users`

**Purpose**: Extended user profiles (synced from Clerk)

**Collection ID**: `users`

**Attributes**:
```
clerkUserId     | String  | Size: 255 | Required: Yes | Unique: Yes
email           | String  | Size: 255 | Required: Yes
fullName        | String  | Size: 255 | Required: Yes
avatar          | String  | Size: 500 | Required: No
title           | String  | Size: 255 | Required: No
organization    | String  | Size: 255 | Required: No
bio             | String  | Size: 2000 | Required: No
interests       | String  | Size: 1000 | Required: No  | Array: Yes
socialLinks     | String  | Size: 1000 | Required: No
role            | Enum    | Elements: attendee,speaker,organizer,admin | Default: attendee
isPublic        | Boolean | Default: true
notificationSettings | String | Size: 1000 | Required: No
points          | Integer | Min: 0 | Default: 0
badges          | String  | Size: 500 | Required: No | Array: Yes
pushTokens      | String  | Size: 500 | Required: No | Array: Yes
clerkOrgId      | String  | Size: 255 | Required: No
ssoProvider     | String  | Size: 100 | Required: No
createdAt       | DateTime | Required: Yes
updatedAt       | DateTime | Required: Yes
```

**Indexes**:
- `clerkUserId_unique` → Key: clerkUserId | Type: Unique
- `email_key` → Key: email | Type: Key
- `role_key` → Key: role | Type: Key
- `fullName_fulltext` → Key: fullName | Type: Fulltext

**Permissions**:
- Read: Any
- Create: Users (for user sync)
- Update: Users (own documents only)
- Delete: None

---

### Collection 2: `events`

**Purpose**: Main events/conferences

**Collection ID**: `events`

**Attributes**:
```
title           | String  | Size: 255 | Required: Yes
description     | String  | Size: 5000 | Required: Yes
startDate       | DateTime | Required: Yes
endDate         | DateTime | Required: Yes
venue           | String  | Size: 500 | Required: Yes
venueAddress    | String  | Size: 500 | Required: No
venueCoordinates| String  | Size: 255 | Required: No
timezone        | String  | Size: 100 | Required: Yes
bannerImage     | String  | Size: 500 | Required: No
status          | Enum    | Elements: draft,published,ongoing,completed | Default: draft
settings        | String  | Size: 2000 | Required: No
clerkOrgId      | String  | Size: 255 | Required: No
```

**Indexes**:
- `startDate_key` → Key: startDate | Type: Key
- `status_key` → Key: status | Type: Key

**Permissions**:
- Read: Any
- Create: Role: organizer
- Update: Role: organizer, Role: admin
- Delete: Role: admin

---

### Collection 3: `sessions`

**Purpose**: Event sessions/talks

**Collection ID**: `sessions`

**Attributes**:
```
eventId         | String  | Size: 255 | Required: Yes
title           | String  | Size: 500 | Required: Yes
description     | String  | Size: 2000 | Required: No
type            | Enum    | Elements: keynote,panel,workshop,networking,breakout,exhibition
track           | String  | Size: 255 | Required: No
startTime       | DateTime | Required: Yes
endTime         | DateTime | Required: Yes
room            | String  | Size: 255 | Required: Yes
floor           | String  | Size: 100 | Required: No
speakerIds      | String  | Size: 500 | Required: No | Array: Yes
capacity        | Integer | Min: 0 | Required: No
currentAttendees| Integer | Min: 0 | Default: 0
materials       | String  | Size: 500 | Required: No | Array: Yes
livestreamUrl   | String  | Size: 500 | Required: No
recordingUrl    | String  | Size: 500 | Required: No
tags            | String  | Size: 500 | Required: No | Array: Yes
isFeatured      | Boolean | Default: false
status          | Enum    | Elements: scheduled,live,completed,cancelled | Default: scheduled
```

**Indexes**:
- `eventId_key` → Key: eventId | Type: Key
- `startTime_key` → Key: startTime | Type: Key
- `type_key` → Key: type | Type: Key
- `title_fulltext` → Key: title | Type: Fulltext

**Permissions**:
- Read: Any
- Create: Role: organizer
- Update: Role: organizer, Role: admin
- Delete: Role: admin

---

### Collection 4: `speakers`

**Purpose**: Speaker profiles

**Collection ID**: `speakers`

**Attributes**:
```
clerkUserId     | String  | Size: 255 | Required: No
name            | String  | Size: 255 | Required: Yes
photo           | String  | Size: 500 | Required: No
title           | String  | Size: 255 | Required: Yes
organization    | String  | Size: 255 | Required: Yes
bio             | String  | Size: 2000 | Required: No
expertise       | String  | Size: 500 | Required: No | Array: Yes
socialLinks     | String  | Size: 1000 | Required: No
isFeatured      | Boolean | Default: false
sortOrder       | Integer | Min: 0 | Default: 0
```

**Indexes**:
- `name_fulltext` → Key: name | Type: Fulltext
- `isFeatured_key` → Key: isFeatured | Type: Key

**Permissions**:
- Read: Any
- Create: Role: organizer
- Update: Role: organizer, Role: admin
- Delete: Role: admin

---

### Collection 5: `bookmarks`

**Purpose**: User session bookmarks

**Collection ID**: `bookmarks`

**Attributes**:
```
clerkUserId     | String  | Size: 255 | Required: Yes
sessionId       | String  | Size: 255 | Required: Yes
reminderTime    | Integer | Min: 0 | Required: No
notes           | String  | Size: 1000 | Required: No
createdAt       | DateTime | Required: Yes
```

**Indexes**:
- `clerkUserId_sessionId_unique` → Keys: clerkUserId, sessionId | Type: Unique
- `clerkUserId_key` → Key: clerkUserId | Type: Key

**Permissions**:
- Read: Users (own documents only)
- Create: Users
- Update: Users (own documents only)
- Delete: Users (own documents only)

---

### Collection 6: `connections`

**Purpose**: User connections/networking

**Collection ID**: `connections`

**Attributes**:
```
requesterId     | String  | Size: 255 | Required: Yes
recipientId     | String  | Size: 255 | Required: Yes
status          | Enum    | Elements: pending,accepted,declined | Default: pending
message         | String  | Size: 500 | Required: No
createdAt       | DateTime | Required: Yes
updatedAt       | DateTime | Required: Yes
```

**Indexes**:
- `requesterId_key` → Key: requesterId | Type: Key
- `recipientId_key` → Key: recipientId | Type: Key
- `status_key` → Key: status | Type: Key

**Permissions**:
- Read: Users (where requesterId = user OR recipientId = user)
- Create: Users
- Update: Users (where recipientId = user)
- Delete: Users (where requesterId = user)

---

## Step 3: Create Storage Buckets

1. Go to **Storage** in the left sidebar
2. For each bucket below, click **Create Bucket**

### Bucket 1: avatars
- **Bucket ID**: `avatars`
- **Max File Size**: 5 MB
- **Allowed Extensions**: jpg, jpeg, png, webp
- **Permissions**:
  - Read: Any
  - Create: Users
  - Update: Users
  - Delete: Users

### Bucket 2: session-materials
- **Bucket ID**: `session-materials`
- **Max File Size**: 50 MB
- **Allowed Extensions**: pdf, ppt, pptx, doc, docx
- **Permissions**:
  - Read: Users
  - Create: Role: organizer
  - Update: Role: organizer
  - Delete: Role: admin

---

## Step 4: Configure Environment Variables

Update your `.env` file:

```env
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx

EXPO_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
EXPO_PUBLIC_APPWRITE_PROJECT_ID=your-project-id-here
EXPO_PUBLIC_APPWRITE_DATABASE_ID=wise-event-db-id-here
```

---

## Step 5: Test User Sync

1. Start your Expo app: `npm start`
2. Sign up with a test account
3. Check Appwrite Console → Databases → wise-event-db → users collection
4. You should see the new user document synced from Clerk

---

## Optional: Additional Collections

For full feature parity, you can also create these collections:

- `messages` - Direct messages
- `notifications` - In-app notifications
- `check_ins` - Session attendance
- `feedback` - Session ratings
- `polls` - Live polls
- `questions` - Q&A questions

Refer to `PRD/complete_doc.json` for complete schema specifications.

---

## Troubleshooting

### Error: "Collection not found (404)"
- Verify collection ID matches exactly (case-sensitive)
- Check database ID is correct in `.env`

### Error: "Unauthorized (401)"
- Check Appwrite project ID
- Verify API endpoint URL

### User Sync Fails
- Check collection permissions allow "Create" for Users
- Verify all required fields are present
- Check Appwrite console logs for specific errors

### Common Permission Issues
- Users can only read their own bookmarks
- Only organizers can create events/sessions
- Only admins can delete content

---

## Next Steps

Once database is set up:
1. Test authentication flow
2. Create sample event data
3. Test session booking
4. Enable real-time features

For help, see `QUICK_START.md` and `CLAUDE.md`.
