# Seed Data Guide - WISE Event App

**Last Updated**: November 28, 2025
**Purpose**: Populate Appwrite with test data for development and testing
**Estimated Time**: 30 minutes

---

## 📋 Overview

This guide provides sample data to populate your Appwrite database for testing the WISE Event App. Use this data to test all features before production deployment.

---

## 🎯 Sample Data Structure

### Test Event

```json
{
  "$id": "event-1",
  "name": "WISE Tech Conference 2025",
  "description": "Annual technology conference bringing together industry leaders, innovators, and enthusiasts for three days of learning, networking, and collaboration.",
  "startDate": "2025-12-01T09:00:00.000Z",
  "endDate": "2025-12-03T18:00:00.000Z",
  "location": "San Francisco Convention Center",
  "imageUrl": "https://images.unsplash.com/photo-1540575467063-178a50c2df87",
  "status": "published",
  "organizerId": "org-001"
}
```

---

## 📅 Sample Sessions

### Session 1: Opening Keynote
```json
{
  "$id": "session-001",
  "eventId": "event-1",
  "title": "The Future of AI: Trends and Predictions",
  "description": "Join us for an inspiring keynote exploring the latest trends in artificial intelligence and their impact on various industries.",
  "type": "keynote",
  "track": "AI & Machine Learning",
  "startTime": "2025-12-01T09:00:00.000Z",
  "endTime": "2025-12-01T10:30:00.000Z",
  "room": "Main Ballroom",
  "capacity": 500,
  "speakerIds": ["speaker-001", "speaker-002"],
  "tags": ["AI", "Machine Learning", "Future Tech"],
  "level": "intermediate"
}
```

### Session 2: Workshop
```json
{
  "$id": "session-002",
  "eventId": "event-1",
  "title": "Building Scalable Mobile Apps with React Native",
  "description": "Hands-on workshop covering best practices for building production-ready mobile applications with React Native and Expo.",
  "type": "workshop",
  "track": "Mobile Development",
  "startTime": "2025-12-01T11:00:00.000Z",
  "endTime": "2025-12-01T13:00:00.000Z",
  "room": "Room A",
  "capacity": 50,
  "speakerIds": ["speaker-003"],
  "tags": ["React Native", "Mobile", "Expo"],
  "level": "intermediate"
}
```

### Session 3: Panel Discussion
```json
{
  "$id": "session-003",
  "eventId": "event-1",
  "title": "The Ethics of AI: A Panel Discussion",
  "description": "Industry leaders discuss the ethical implications of artificial intelligence and responsible AI development.",
  "type": "panel",
  "track": "AI & Machine Learning",
  "startTime": "2025-12-01T14:00:00.000Z",
  "endTime": "2025-12-01T15:30:00.000Z",
  "room": "Main Ballroom",
  "capacity": 300,
  "speakerIds": ["speaker-004", "speaker-005", "speaker-006"],
  "tags": ["AI", "Ethics", "Discussion"],
  "level": "beginner"
}
```

### Session 4: Networking Break
```json
{
  "$id": "session-004",
  "eventId": "event-1",
  "title": "Afternoon Networking Break",
  "description": "Connect with fellow attendees, speakers, and sponsors over coffee and refreshments.",
  "type": "networking",
  "track": null,
  "startTime": "2025-12-01T15:30:00.000Z",
  "endTime": "2025-12-01T16:00:00.000Z",
  "room": "Exhibition Hall",
  "capacity": null,
  "speakerIds": [],
  "tags": ["Networking"],
  "level": null
}
```

### Session 5: Technical Workshop
```json
{
  "$id": "session-005",
  "eventId": "event-1",
  "title": "Getting Started with Appwrite",
  "description": "Learn how to build modern applications with Appwrite Backend-as-a-Service platform.",
  "type": "workshop",
  "track": "Backend Development",
  "startTime": "2025-12-01T16:00:00.000Z",
  "endTime": "2025-12-01T18:00:00.000Z",
  "room": "Room B",
  "capacity": 40,
  "speakerIds": ["speaker-007"],
  "tags": ["Appwrite", "Backend", "BaaS"],
  "level": "beginner"
}
```

---

## 👥 Sample Users (Test Accounts)

### User 1: Event Organizer
```json
{
  "$id": "user-001",
  "clerkUserId": "clerk_test_organizer_001",
  "email": "organizer@wisetech.com",
  "fullName": "Sarah Johnson",
  "avatar": "https://i.pravatar.cc/150?u=sarah",
  "title": "Conference Director",
  "organization": "WISE Tech",
  "bio": "Passionate about bringing people together to share knowledge and innovation.",
  "interests": ["Event Management", "Technology", "Networking"],
  "role": "organizer",
  "isPublic": true,
  "badges": ["Organizer", "Speaker"]
}
```

### User 2: Keynote Speaker
```json
{
  "$id": "user-002",
  "clerkUserId": "clerk_test_speaker_001",
  "email": "speaker@ailab.com",
  "fullName": "Dr. Michael Chen",
  "avatar": "https://i.pravatar.cc/150?u=michael",
  "title": "Chief AI Scientist",
  "organization": "AI Research Lab",
  "bio": "Leading researcher in artificial intelligence with 15+ years of experience.",
  "interests": ["Artificial Intelligence", "Machine Learning", "Research"],
  "role": "speaker",
  "isPublic": true,
  "badges": ["Speaker", "AI Expert"]
}
```

### User 3: Regular Attendee
```json
{
  "$id": "user-003",
  "clerkUserId": "clerk_test_attendee_001",
  "email": "attendee@techcompany.com",
  "fullName": "Emily Rodriguez",
  "avatar": "https://i.pravatar.cc/150?u=emily",
  "title": "Software Engineer",
  "organization": "TechCorp",
  "bio": "Full-stack developer interested in learning new technologies.",
  "interests": ["React Native", "Mobile Development", "UI/UX"],
  "role": "attendee",
  "isPublic": true,
  "badges": ["First Timer"]
}
```

### User 4: Workshop Instructor
```json
{
  "$id": "user-004",
  "clerkUserId": "clerk_test_speaker_002",
  "email": "instructor@devacademy.com",
  "fullName": "James Wilson",
  "avatar": "https://i.pravatar.cc/150?u=james",
  "title": "Senior Mobile Developer",
  "organization": "Dev Academy",
  "bio": "Mobile development expert with a passion for teaching.",
  "interests": ["Mobile Development", "React Native", "Teaching"],
  "role": "speaker",
  "isPublic": true,
  "badges": ["Instructor", "Mobile Expert"]
}
```

### User 5: Networking Enthusiast
```json
{
  "$id": "user-005",
  "clerkUserId": "clerk_test_attendee_002",
  "email": "networker@startup.io",
  "fullName": "Alex Kim",
  "avatar": "https://i.pravatar.cc/150?u=alex",
  "title": "Product Manager",
  "organization": "StartupX",
  "bio": "Always looking to connect with innovators and entrepreneurs.",
  "interests": ["Product Management", "Startups", "Networking"],
  "role": "attendee",
  "isPublic": true,
  "badges": ["Networking Pro"]
}
```

---

## 📊 Sample Polls

### Poll 1: Session Feedback
```json
{
  "$id": "poll-001",
  "sessionId": "session-001",
  "question": "How would you rate this keynote?",
  "options": "[{\"id\":\"opt1\",\"text\":\"Excellent\",\"votes\":42},{\"id\":\"opt2\",\"text\":\"Good\",\"votes\":28},{\"id\":\"opt3\",\"text\":\"Fair\",\"votes\":5},{\"id\":\"opt4\",\"text\":\"Poor\",\"votes\":1}]",
  "allowMultiple": false,
  "status": "active",
  "createdBy": "user-001"
}
```

### Poll 2: Technology Interest
```json
{
  "$id": "poll-002",
  "sessionId": "session-002",
  "question": "Which mobile platforms are you developing for? (Select all that apply)",
  "options": "[{\"id\":\"opt1\",\"text\":\"iOS\",\"votes\":35},{\"id\":\"opt2\",\"text\":\"Android\",\"votes\":38},{\"id\":\"opt3\",\"text\":\"Cross-platform\",\"votes\":42},{\"id\":\"opt4\",\"text\":\"Web mobile\",\"votes\":18}]",
  "allowMultiple": true,
  "status": "active",
  "createdBy": "user-004"
}
```

---

## ❓ Sample Questions (Q&A)

### Question 1
```json
{
  "$id": "question-001",
  "sessionId": "session-001",
  "clerkUserId": "clerk_test_attendee_001",
  "question": "What are the most important considerations when implementing AI in production systems?",
  "status": "approved",
  "upvotes": 15,
  "upvotedBy": ["clerk_test_attendee_002", "clerk_test_attendee_003"],
  "isAnswered": true,
  "answer": "The most critical considerations include data quality, model monitoring, bias detection, and having rollback strategies. Always start with small-scale deployments and gradually expand.",
  "answeredBy": "clerk_test_speaker_001",
  "answeredAt": "2025-12-01T10:15:00.000Z"
}
```

### Question 2
```json
{
  "$id": "question-002",
  "sessionId": "session-002",
  "clerkUserId": "clerk_test_attendee_003",
  "question": "What's the best way to handle offline functionality in React Native apps?",
  "status": "approved",
  "upvotes": 8,
  "upvotedBy": ["clerk_test_attendee_001"],
  "isAnswered": false,
  "answer": null,
  "answeredBy": null,
  "answeredAt": null
}
```

---

## 🔔 Sample Notifications

### Notification 1: Session Reminder
```json
{
  "$id": "notif-001",
  "clerkUserId": "clerk_test_attendee_001",
  "type": "session_reminder",
  "title": "Session Starting Soon",
  "body": "The Future of AI: Trends and Predictions starts in 15 minutes in Main Ballroom",
  "isRead": false,
  "data": "{\"sessionId\":\"session-001\",\"startTime\":\"2025-12-01T09:00:00.000Z\"}"
}
```

### Notification 2: Connection Request
```json
{
  "$id": "notif-002",
  "clerkUserId": "clerk_test_attendee_001",
  "type": "connection_request",
  "title": "New Connection Request",
  "body": "Alex Kim wants to connect with you",
  "isRead": false,
  "data": "{\"connectionId\":\"conn-001\",\"fromUserId\":\"clerk_test_attendee_002\"}"
}
```

---

## 🤝 Sample Connections

### Connection 1: Accepted
```json
{
  "$id": "conn-001",
  "user1Id": "clerk_test_attendee_001",
  "user2Id": "clerk_test_attendee_002",
  "status": "accepted",
  "message": "Hi! I'd love to connect and discuss mobile development."
}
```

### Connection 2: Pending
```json
{
  "$id": "conn-002",
  "user1Id": "clerk_test_attendee_002",
  "user2Id": "clerk_test_speaker_001",
  "status": "pending",
  "message": "Great keynote! Would love to stay in touch."
}
```

---

## 📝 Sample Bookmarks

```json
[
  {
    "$id": "bookmark-001",
    "clerkUserId": "clerk_test_attendee_001",
    "sessionId": "session-001",
    "notes": "Don't miss this! Want to learn about AI trends."
  },
  {
    "$id": "bookmark-002",
    "clerkUserId": "clerk_test_attendee_001",
    "sessionId": "session-002",
    "notes": "React Native workshop - bring laptop"
  },
  {
    "$id": "bookmark-003",
    "clerkUserId": "clerk_test_attendee_002",
    "sessionId": "session-003",
    "notes": "Ethics panel discussion"
  }
]
```

---

## ✅ Sample Check-ins

```json
[
  {
    "$id": "checkin-001",
    "clerkUserId": "clerk_test_attendee_001",
    "sessionId": "session-001",
    "checkInTime": "2025-12-01T08:55:00.000Z",
    "checkOutTime": "2025-12-01T10:30:00.000Z",
    "method": "qr",
    "location": "{\"latitude\":37.7749,\"longitude\":-122.4194}"
  },
  {
    "$id": "checkin-002",
    "clerkUserId": "clerk_test_attendee_002",
    "sessionId": "session-001",
    "checkInTime": "2025-12-01T08:58:00.000Z",
    "checkOutTime": null,
    "method": "qr",
    "location": "{\"latitude\":37.7749,\"longitude\":-122.4194}"
  },
  {
    "$id": "checkin-003",
    "clerkUserId": "clerk_test_attendee_001",
    "sessionId": "session-002",
    "checkInTime": "2025-12-01T11:02:00.000Z",
    "checkOutTime": null,
    "method": "manual",
    "location": null
  }
]
```

---

## 🚀 Automated Seeding Script

Create a Node.js script to seed data automatically:

```javascript
// seed-data.js
const sdk = require('node-appwrite');

const client = new sdk.Client();
const databases = new sdk.Databases(client);

client
  .setEndpoint('YOUR_APPWRITE_ENDPOINT')
  .setProject('YOUR_PROJECT_ID')
  .setKey('YOUR_API_KEY');

const DATABASE_ID = 'main';

async function seedData() {
  console.log('🌱 Starting database seeding...');

  try {
    // Seed event
    await databases.createDocument(DATABASE_ID, 'events', 'event-1', {
      name: 'WISE Tech Conference 2025',
      description: 'Annual technology conference...',
      startDate: '2025-12-01T09:00:00.000Z',
      endDate: '2025-12-03T18:00:00.000Z',
      location: 'San Francisco Convention Center',
      status: 'published',
      organizerId: 'org-001'
    });
    console.log('✅ Event created');

    // Seed sessions
    const sessions = [
      // Add session objects here
    ];

    for (const session of sessions) {
      await databases.createDocument(DATABASE_ID, 'sessions', session.$id, session);
    }
    console.log(`✅ Created ${sessions.length} sessions`);

    // Seed users, polls, questions, etc.
    // ...

    console.log('🎉 Database seeding complete!');
  } catch (error) {
    console.error('❌ Error seeding data:', error);
  }
}

seedData();
```

**Run the script**:
```bash
npm install node-appwrite
node seed-data.js
```

---

## 🧪 Testing with Seed Data

After seeding, test these scenarios:

**Schedule & Bookmarks**:
- [ ] View schedule with 5 sessions
- [ ] Bookmark 2 sessions
- [ ] View My Agenda
- [ ] Unbookmark a session

**Networking**:
- [ ] View 5 attendee profiles
- [ ] Send connection request
- [ ] Accept connection request
- [ ] Send direct message

**Polls & Q&A**:
- [ ] View polls with vote counts
- [ ] Submit a vote
- [ ] View questions sorted by upvotes
- [ ] Upvote a question

**Check-ins**:
- [ ] Generate QR code for a session
- [ ] Check in to session
- [ ] View attendance list with 2+ attendees

**Realtime**:
- [ ] Open polls on two devices
- [ ] Vote on one device
- [ ] See update on second device instantly

---

## 📚 Additional Test Data

For load testing, consider:
- **100+ users** - Test directory search and filtering
- **50+ sessions** - Test schedule filtering and performance
- **1000+ check-ins** - Test attendance aggregation
- **500+ questions** - Test Q&A sorting and pagination

---

**Seed Data Ready!** Your test environment is now populated. 🎉

Next steps:
1. Test all features with seed data
2. Verify realtime updates work
3. Check permissions and access control
4. Deploy to production
