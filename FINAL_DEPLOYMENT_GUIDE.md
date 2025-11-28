# WISE Event App - Final Deployment Guide 🚀

**Version**: 1.0.0
**Last Updated**: November 28, 2025
**Status**: Ready for Production Deployment

---

## 📋 Table of Contents

1. [Quick Start Checklist](#quick-start-checklist)
2. [Appwrite Setup](#appwrite-setup)
3. [Database Collections](#database-collections)
4. [Environment Configuration](#environment-configuration)
5. [Data Migration](#data-migration)
6. [Real-Time Integration](#real-time-integration)
7. [Testing Guide](#testing-guide)
8. [Deployment Steps](#deployment-steps)
9. [Post-Launch Monitoring](#post-launch-monitoring)

---

## 🎯 Quick Start Checklist

### Prerequisites
- [ ] Appwrite project created
- [ ] Clerk project configured
- [ ] Node.js 18+ installed
- [ ] Expo CLI installed
- [ ] iOS Simulator / Android Emulator / Physical device

### 30-Minute Setup
- [ ] Create Appwrite collections (15 min)
- [ ] Configure indexes and permissions (10 min)
- [ ] Test basic CRUD operations (5 min)

### 2-Hour Integration
- [ ] Replace mock data with services (1 hour)
- [ ] Test all features (30 min)
- [ ] Fix any bugs (30 min)

### Production Ready
- [ ] Performance testing
- [ ] Security audit
- [ ] Analytics setup
- [ ] App store submission

---

## 🗄️ Appwrite Setup

### Step 1: Create Appwrite Database

1. Go to [Appwrite Console](https://cloud.appwrite.io/)
2. Select your project: `WISE-PP`
3. Navigate to **Databases** → **Create Database**
4. Name: `main`
5. Database ID: `main` (must match `.env`)

### Step 2: Create Collections

Run these steps for **each** collection below:

#### Collection 1: Users
```bash
Collection Name: users
Collection ID: users
```

**Attributes**:
```typescript
clerkUserId: string (required, size: 255)
email: string (required, email, size: 255)
fullName: string (required, size: 255)
avatar: string (optional, URL, size: 500)
title: string (optional, size: 255)
organization: string (optional, size: 255)
bio: string (optional, size: 2000)
interests: string[] (optional, array)
socialLinks: object (optional)
role: enum['attendee', 'speaker', 'organizer', 'admin'] (required, default: 'attendee')
isPublic: boolean (required, default: true)
notificationSettings: object (optional)
points: number (required, default: 0)
badges: string[] (optional, array)
pushTokens: string[] (optional, array)
clerkOrgId: string (optional, size: 255)
ssoProvider: string (optional, size: 100)
```

**Indexes**:
```
clerkUserId (unique key)
email (unique key)
role (key)
```

**Permissions**:
```
Read: Anyone (for public profiles)
Create: Users
Update: users (own profile only via attribute-level permissions)
Delete: Admins
```

#### Collection 2: Sessions
```bash
Collection Name: sessions
Collection ID: sessions
```

**Attributes**:
```typescript
eventId: string (required, size: 100)
title: string (required, size: 500)
description: string (optional, size: 5000)
type: enum['keynote', 'panel', 'workshop', 'networking', 'breakout', 'exhibition'] (required)
track: string (optional, size: 255)
startTime: datetime (required)
endTime: datetime (required)
room: string (required, size: 255)
floor: string (optional, size: 100)
speakerIds: string[] (optional, array)
capacity: number (optional)
currentAttendees: number (required, default: 0)
materials: string[] (optional, array)
livestreamUrl: string (optional, URL, size: 500)
recordingUrl: string (optional, URL, size: 500)
tags: string[] (optional, array)
isFeatured: boolean (required, default: false)
status: enum['scheduled', 'live', 'completed', 'cancelled'] (required, default: 'scheduled')
```

**Indexes**:
```
eventId (key)
type (key)
track (key)
startTime (ordered)
status (key)
```

**Permissions**:
```
Read: Anyone
Create: Organizers, Admins
Update: Organizers, Admins
Delete: Admins
```

#### Collection 3: Bookmarks
```bash
Collection Name: bookmarks
Collection ID: bookmarks
```

**Attributes**:
```typescript
clerkUserId: string (required, size: 255)
sessionId: string (required, size: 100)
reminderTime: number (optional)
notes: string (optional, size: 1000)
```

**Indexes**:
```
clerkUserId (key)
sessionId (key)
userId_session (unique: clerkUserId + sessionId)
```

**Permissions**:
```
Read: users (own bookmarks only)
Create: users
Update: users (own bookmarks only)
Delete: users (own bookmarks only)
```

#### Collection 4: Connections
```bash
Collection Name: connections
Collection ID: connections
```

**Attributes**:
```typescript
requesterId: string (required, size: 255)
recipientId: string (required, size: 255)
status: enum['pending', 'accepted', 'declined'] (required, default: 'pending')
message: string (optional, size: 500)
```

**Indexes**:
```
requesterId (key)
recipientId (key)
status (key)
requester_recipient (unique: requesterId + recipientId)
```

**Permissions**:
```
Read: users (if requesterId or recipientId matches)
Create: users
Update: users (if requesterId or recipientId matches)
Delete: users (if requesterId or recipientId matches)
```

#### Collection 5: Notifications
```bash
Collection Name: notifications
Collection ID: notifications
```

**Attributes**:
```typescript
clerkUserId: string (required, size: 255)
type: enum['session_reminder', 'message', 'connection', 'announcement', 'schedule_change'] (required)
title: string (required, size: 255)
body: string (required, size: 1000)
data: object (optional)
isRead: boolean (required, default: false)
```

**Indexes**:
```
clerkUserId (key)
isRead (key)
type (key)
```

**Permissions**:
```
Read: users (own notifications only)
Create: users, admins
Update: users (own notifications only)
Delete: users (own notifications only)
```

#### Collection 6: CheckIns
```bash
Collection Name: checkins
Collection ID: checkins
```

**Attributes**:
```typescript
clerkUserId: string (required, size: 255)
sessionId: string (required, size: 100)
checkInTime: datetime (required)
checkOutTime: datetime (optional)
method: enum['qr', 'nfc', 'geofence', 'manual'] (required, default: 'qr')
location: object (optional) // { latitude: number, longitude: number }
```

**Indexes**:
```
clerkUserId (key)
sessionId (key)
checkInTime (ordered)
```

**Permissions**:
```
Read: users (own check-ins), organizers (session check-ins), admins
Create: users
Update: users (own check-ins only - for check-out)
Delete: admins
```

#### Collection 7: Polls
```bash
Collection Name: polls
Collection ID: polls
```

**Attributes**:
```typescript
sessionId: string (required, size: 100)
question: string (required, size: 500)
options: object[] (required) // [{ id, text, votes }]
status: enum['draft', 'active', 'closed'] (required, default: 'draft')
allowMultiple: boolean (required, default: false)
showResults: boolean (required, default: true)
totalVotes: number (required, default: 0)
createdBy: string (required, size: 255)
endTime: datetime (optional)
```

**Indexes**:
```
sessionId (key)
status (key)
createdBy (key)
```

**Permissions**:
```
Read: Anyone (during session)
Create: speakers, organizers, admins
Update: creator only (via createdBy)
Delete: creator, admins
```

#### Collection 8: Poll Votes
```bash
Collection Name: poll_votes
Collection ID: poll_votes
```

**Attributes**:
```typescript
pollId: string (required, size: 100)
clerkUserId: string (required, size: 255)
optionIds: string[] (required, array)
```

**Indexes**:
```
pollId (key)
userId_poll (unique: clerkUserId + pollId)
```

**Permissions**:
```
Read: poll creator, admins
Create: users
Update: none (votes are immutable)
Delete: users (own vote only - for changing vote)
```

#### Collection 9: Questions
```bash
Collection Name: questions
Collection ID: questions
```

**Attributes**:
```typescript
sessionId: string (required, size: 100)
clerkUserId: string (required, size: 255)
content: string (required, size: 1000)
upvotes: number (required, default: 0)
upvotedBy: string[] (required, array, default: [])
isAnswered: boolean (required, default: false)
answer: string (optional, size: 2000)
answeredBy: string (optional, size: 255)
answeredAt: datetime (optional)
status: enum['pending', 'approved', 'answered', 'hidden'] (required, default: 'pending')
```

**Indexes**:
```
sessionId (key)
status (key)
upvotes (ordered desc)
```

**Permissions**:
```
Read: users (approved questions), moderators/admins (all)
Create: users
Update: moderators/speakers (for answering/approving), users (own question)
Delete: moderators, users (own question)
```

---

## 🔧 Environment Configuration

### Update `.env` File

```bash
# Appwrite Configuration
EXPO_PUBLIC_APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
EXPO_PUBLIC_APPWRITE_PROJECT_ID=692933ae0021e97f1214
EXPO_PUBLIC_APPWRITE_DATABASE_ID=main
EXPO_PUBLIC_APPWRITE_PROJECT_NAME=WISE-PP

# Clerk Configuration
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key_here

# Optional: Analytics
EXPO_PUBLIC_ANALYTICS_ID=your_analytics_id

# Optional: Sentry (Error Tracking)
SENTRY_DSN=your_sentry_dsn
```

### Verify Configuration

```bash
# Test Appwrite connection
npm run test:appwrite

# Test Clerk authentication
npm run test:auth
```

---

## 📊 Data Migration

### Step 1: Create Test Data

**Create Test Event**:
```typescript
import { databases } from '@/services/appwrite';

const testEvent = await databases.createDocument(
  'main',
  'events',
  'unique()',
  {
    title: 'WISE 2024 Conference',
    description: 'World Innovation Summit for Education',
    startDate: '2024-12-01T09:00:00Z',
    endDate: '2024-12-03T18:00:00Z',
    venue: 'WISE Convention Center',
    timezone: 'America/New_York',
    status: 'published',
  }
);
```

**Create Test Sessions** (migrate from mockData):
```typescript
import { mockSessions } from '@/lib/mockData';
import { SessionsService } from '@/services';

for (const session of mockSessions.slice(0, 5)) {
  await SessionsService.createSession({
    eventId: testEvent.$id,
    title: session.title,
    description: session.description,
    type: session.type,
    track: session.track,
    startTime: session.startTime,
    endTime: session.endTime,
    room: session.room,
    floor: session.floor,
    capacity: session.capacity,
    currentAttendees: 0,
    speakerIds: session.speakerIds,
    status: 'scheduled',
    isFeatured: session.isFeatured,
    tags: session.tags,
  });
}
```

### Step 2: Replace Mock Data

**Before** (using mock data):
```typescript
import { mockSessions } from '@/lib/mockData';

const sessions = mockSessions;
```

**After** (using Appwrite):
```typescript
import { SessionsService } from '@/services';

const sessions = await SessionsService.getSessionsByEvent(eventId);
```

### Step 3: Update All Screens

**Screens to update**:
1. `src/app/(app)/(tabs)/index.tsx` - Home/Schedule
2. `src/app/(app)/session/[id].tsx` - Session Details
3. `src/app/(app)/(tabs)/agenda.tsx` - My Agenda
4. `src/app/(app)/network/directory.tsx` - Attendee Directory
5. And all other screens using mock data

---

## ⚡ Real-Time Integration

### Create Real-Time Hook

**`src/hooks/useRealtime.ts`**:
```typescript
import { useEffect } from 'react';
import { client } from '@/services';

export function useRealtimeCollection(
  collectionId: string,
  onUpdate: () => void
) {
  useEffect(() => {
    const unsubscribe = client.subscribe(
      `databases.main.collections.${collectionId}.documents`,
      (response) => {
        console.log('Real-time update:', response);
        onUpdate();
      }
    );

    return () => {
      unsubscribe();
    };
  }, [collectionId, onUpdate]);
}
```

### Use in Components

```typescript
import { useRealtimeCollection } from '@/hooks/useRealtime';

export default function LivePoll() {
  const [poll, setPoll] = useState<Poll>();

  // Reload poll when it updates
  useRealtimeCollection('polls', loadPoll);

  const loadPoll = async () => {
    const data = await PollsService.getPollById(pollId);
    setPoll(data);
  };

  return (
    // Poll UI with live updates
  );
}
```

---

## 🧪 Testing Guide

### Manual Testing Checklist

**Authentication**:
- [ ] Sign up with email
- [ ] Sign in with OAuth (Google, Apple)
- [ ] Sign out
- [ ] Session persistence

**Sessions**:
- [ ] Browse schedule
- [ ] Filter by type/track
- [ ] Search sessions
- [ ] View session details
- [ ] Bookmark session
- [ ] Remove bookmark

**Notifications**:
- [ ] Request permission
- [ ] Receive session reminder
- [ ] Tap notification → navigate
- [ ] Mark as read
- [ ] Delete notification

**Check-ins**:
- [ ] Scan QR code
- [ ] Check in successfully
- [ ] View attendance history
- [ ] Check out

**Polls**:
- [ ] View active poll
- [ ] Submit vote
- [ ] See results
- [ ] Try to vote twice (should fail)

**Q&A**:
- [ ] Submit question
- [ ] Upvote question
- [ ] Remove upvote
- [ ] View answered questions

### Automated Testing

**Run Tests**:
```bash
npm run test

# Specific test suites
npm run test:services
npm run test:components
npm run test:e2e
```

**Test Coverage**:
```bash
npm run test:coverage
```

---

## 🚀 Deployment Steps

### Step 1: Build for Production

**iOS**:
```bash
# Create production build
eas build --platform ios --profile production

# Submit to App Store
eas submit --platform ios
```

**Android**:
```bash
# Create production build
eas build --platform android --profile production

# Submit to Play Store
eas submit --platform android
```

### Step 2: Configure App Stores

**App Store Connect**:
1. Create app record
2. Upload screenshots
3. Write app description
4. Set pricing
5. Submit for review

**Google Play Console**:
1. Create app
2. Upload screenshots
3. Complete store listing
4. Set pricing & distribution
5. Submit for review

### Step 3: Production Environment

**Appwrite**:
- [ ] Verify production database
- [ ] Check permissions
- [ ] Enable logging
- [ ] Set up backups

**Clerk**:
- [ ] Production instance
- [ ] Social providers configured
- [ ] User limits set

**Analytics**:
- [ ] Google Analytics
- [ ] Mixpanel
- [ ] Sentry error tracking

---

## 📈 Post-Launch Monitoring

### Metrics to Track

**Usage**:
- Daily active users (DAU)
- Session engagement
- Feature adoption rates
- Screen time per session

**Performance**:
- App crashes
- API response times
- Database query performance
- Network errors

**Business**:
- Event registrations
- Session attendance
- Networking connections made
- Poll participation

### Monitoring Tools

**Sentry** - Error Tracking:
```bash
npm install @sentry/react-native
```

**Analytics**:
```typescript
import Analytics from '@/lib/analytics';

// Track events
Analytics.track('session_viewed', { sessionId });
Analytics.track('poll_voted', { pollId, optionId });
```

### User Feedback

**In-App Feedback**:
- Feedback button in profile
- Bug report form
- Feature request form

**App Store Reviews**:
- Monitor reviews daily
- Respond to issues
- Address bugs quickly

---

## 🎯 Success Metrics

### Week 1 Goals

- [ ] 100+ downloads
- [ ] 50+ active users
- [ ] < 1% crash rate
- [ ] 4.0+ star rating

### Month 1 Goals

- [ ] 500+ downloads
- [ ] 200+ daily active users
- [ ] 80% feature adoption
- [ ] 10,000+ sessions viewed

### Key Performance Indicators

**Engagement**:
- Average sessions per user: 5+
- Session duration: 10+ minutes
- Return rate: 60%+

**Technical**:
- App launch time: < 2 seconds
- API response time: < 500ms
- Crash-free rate: 99.5%+

**Features**:
- Bookmark rate: 40%+
- Check-in rate: 70%+
- Q&A participation: 25%+
- Poll participation: 50%+

---

## 🔒 Security Checklist

- [ ] All API keys in environment variables
- [ ] Appwrite permissions properly configured
- [ ] User data encrypted
- [ ] HTTPS only
- [ ] OAuth properly configured
- [ ] Input validation on all forms
- [ ] SQL injection prevention (N/A - using Appwrite)
- [ ] XSS prevention
- [ ] Rate limiting on API calls

---

## 📚 Additional Resources

**Documentation**:
- [Appwrite Docs](https://appwrite.io/docs)
- [Expo Docs](https://docs.expo.dev/)
- [Clerk Docs](https://clerk.com/docs)
- [React Native Paper](https://callstack.github.io/react-native-paper/)

**Support**:
- GitHub Issues: Create issues for bugs
- Discord: Join community discussions
- Email: support@wiseeventapp.com

---

## ✅ Final Checklist

Before launching:

**Technical**:
- [ ] All collections created
- [ ] Permissions configured
- [ ] Environment variables set
- [ ] Error handling in place
- [ ] Loading states implemented
- [ ] Real-time updates working

**Content**:
- [ ] Test data created
- [ ] Mock data migrated
- [ ] Images uploaded
- [ ] Content reviewed

**Quality**:
- [ ] Manual testing complete
- [ ] Automated tests passing
- [ ] Performance optimized
- [ ] Accessibility checked

**Legal**:
- [ ] Privacy policy
- [ ] Terms of service
- [ ] GDPR compliance
- [ ] CCPA compliance

**Launch**:
- [ ] App Store submission
- [ ] Play Store submission
- [ ] Marketing materials ready
- [ ] Support team ready

---

**You're ready to launch! 🚀**

*For questions or support, refer to the comprehensive documentation files or create an issue on GitHub.*
