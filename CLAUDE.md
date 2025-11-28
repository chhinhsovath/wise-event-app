# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

WISE Event Management App - A comprehensive React Native mobile application for educational summits, conferences, and large-scale events, inspired by WISE Qatar (World Innovation Summit for Education).

**Tech Stack:**
- Frontend: React Native 0.76+ with Expo SDK 52+, TypeScript, Expo Router v4
- Backend: Appwrite Cloud (Authentication, Database, Storage, Realtime, Functions)
- State: Zustand (global), TanStack Query (server state), React Hook Form + Zod (forms)
- UI: React Native Paper / NativeWind (Tailwind CSS)

## Architecture: Appwrite All-in-One

**IMPORTANT - Unified Backend:**
Appwrite handles ALL backend services in this project:
1. **Authentication** - Email/password, OAuth (Google, Apple, LinkedIn, etc.), Magic URL, Phone/SMS
2. **Database** - NoSQL document database with powerful queries
3. **Storage** - File storage for images, documents, etc.
4. **Realtime** - WebSocket subscriptions for live updates
5. **Functions** - Serverless backend logic
6. **Teams** - Organization/group management

**User flow:**
- User signs up/in via Appwrite Auth
- Session managed by Appwrite SDK
- User data stored in Appwrite Database
- All operations use Appwrite user ID ($id)

## Development Commands

```bash
# Install dependencies
npm install
# OR
yarn install

# Start development server
npx expo start

# Start with specific platforms
npx expo start --ios
npx expo start --android
npx expo start --web

# Run on devices
npx expo run:ios
npx expo run:android

# Type checking
npx tsc --noEmit

# Linting
npx eslint . --ext .ts,.tsx

# Testing
npm test
npm run test:watch
npm run test:coverage

# Build with EAS
npm run build:dev:ios
npm run build:dev:android
npm run build:preview:ios
npm run build:preview:android
npm run build:prod:ios
npm run build:prod:android
npm run build:all

# Submit to stores
npm run submit:ios
npm run submit:android
```

## Project Structure

```
src/
├── app/                          # Expo Router file-based routing
│   ├── _layout.tsx              # Root layout with AppwriteProvider
│   ├── (auth)/                  # Public auth routes
│   │   ├── sign-in.tsx          # Email/password + OAuth sign-in
│   │   ├── sign-up.tsx          # User registration
│   │   ├── oauth-callback.tsx   # OAuth callback handler
│   │   ├── magic-link.tsx       # Passwordless authentication
│   │   └── forgot-password.tsx  # Password recovery
│   └── (app)/                   # Protected app routes (requires auth)
│       ├── _layout.tsx          # Protected layout with auth check
│       ├── (tabs)/              # Bottom tab navigation
│       │   ├── index.tsx        # Home/Dashboard
│       │   ├── schedule.tsx     # Event schedule
│       │   ├── networking.tsx   # Networking hub
│       │   ├── map.tsx          # Venue map
│       │   └── profile.tsx      # User profile
│       ├── session/[id].tsx     # Session details
│       ├── speaker/[id].tsx     # Speaker profile
│       ├── chat/[conversationId].tsx
│       └── my-agenda.tsx
├── components/
│   ├── auth/                    # Appwrite authentication components
│   │   ├── SignInForm.tsx       # Email/password + OAuth
│   │   ├── SignUpForm.tsx       # Registration form
│   │   ├── OAuthButtons.tsx     # Social login buttons
│   │   ├── MagicLinkForm.tsx    # Passwordless login
│   │   └── ProtectedRoute.tsx   # Route guard
│   ├── ui/                      # Reusable UI components
│   ├── session/                 # Session-related components
│   ├── networking/              # Networking features
│   └── map/                     # Venue map components
├── services/
│   ├── appwrite.ts              # Appwrite client setup
│   ├── auth.ts                  # Authentication operations
│   ├── database.ts              # Database operations
│   ├── storage.ts               # File storage
│   ├── realtime.ts              # Realtime subscriptions
│   └── notifications.ts         # Push notifications
├── hooks/
│   ├── useAuth.ts               # Appwrite auth wrapper
│   ├── useUser.ts               # Current user data
│   ├── useSessions.ts           # TanStack Query hooks
│   ├── useBookmarks.ts
│   ├── useConnections.ts
│   ├── useMessages.ts
│   └── useRealtime.ts
├── stores/
│   ├── authStore.ts             # Zustand for auth state
│   ├── uiStore.ts               # UI state
│   └── offlineStore.ts          # Offline queue
├── lib/
│   ├── constants.ts
│   ├── utils.ts
│   ├── validators.ts            # Zod schemas
│   ├── queryClient.ts           # React Query config
│   └── i18n.ts                  # i18next setup
└── types/
    ├── appwrite.ts              # Appwrite document types
    └── navigation.ts            # Expo Router params
```

## Key Implementation Patterns

### 1. Appwrite Client Setup

**services/appwrite.ts:**
```typescript
import { Client, Account, Databases, Storage, Realtime } from 'react-native-appwrite'

const client = new Client()
  .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!)

export const account = new Account(client)
export const databases = new Databases(client)
export const storage = new Storage(client)
export const realtime = new Realtime(client)

export default client
```

### 2. Authentication Service

**services/auth.ts:**
```typescript
import { ID } from 'react-native-appwrite'
import { account } from './appwrite'

export const authService = {
  // Email/Password
  async signUp(email: string, password: string, name: string) {
    const user = await account.create(ID.unique(), email, password, name)
    await account.createEmailSession(email, password)
    return user
  },

  async signIn(email: string, password: string) {
    return await account.createEmailSession(email, password)
  },

  async signOut() {
    return await account.deleteSession('current')
  },

  // OAuth
  async signInWithGoogle() {
    return await account.createOAuth2Session('google',
      'yourapp://oauth-callback',
      'yourapp://oauth-callback'
    )
  },

  async signInWithApple() {
    return await account.createOAuth2Session('apple',
      'yourapp://oauth-callback',
      'yourapp://oauth-callback'
    )
  },

  // Magic URL (Passwordless)
  async sendMagicLink(email: string) {
    return await account.createMagicURLSession(ID.unique(), email,
      'yourapp://magic-link'
    )
  },

  async confirmMagicLink(userId: string, secret: string) {
    return await account.updateMagicURLSession(userId, secret)
  },

  // Current user
  async getCurrentUser() {
    try {
      return await account.get()
    } catch {
      return null
    }
  },

  // Password recovery
  async sendPasswordRecovery(email: string) {
    return await account.createRecovery(email, 'yourapp://reset-password')
  },

  async confirmPasswordRecovery(userId: string, secret: string, password: string) {
    return await account.updateRecovery(userId, secret, password, password)
  }
}
```

### 3. Protected Routes Pattern

**app/(app)/_layout.tsx:**
```typescript
import { useEffect, useState } from 'react'
import { Redirect } from 'expo-router'
import { authService } from '@/services/auth'

export default function AppLayout() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    const currentUser = await authService.getCurrentUser()
    setUser(currentUser)
    setLoading(false)
  }

  if (loading) return <LoadingScreen />
  if (!user) return <Redirect href="/sign-in" />

  return <Stack />
}
```

### 4. OAuth Implementation

**components/auth/OAuthButtons.tsx:**
```typescript
import { authService } from '@/services/auth'
import * as WebBrowser from 'expo-web-browser'
import * as Linking from 'expo-linking'

WebBrowser.maybeCompleteAuthSession()

export function OAuthButtons() {
  const handleGoogleAuth = async () => {
    try {
      await authService.signInWithGoogle()
      // OAuth flow will redirect to yourapp://oauth-callback
    } catch (error) {
      console.error('Google auth failed:', error)
    }
  }

  const handleAppleAuth = async () => {
    try {
      await authService.signInWithApple()
    } catch (error) {
      console.error('Apple auth failed:', error)
    }
  }

  return (
    <View>
      <Button onPress={handleGoogleAuth}>Continue with Google</Button>
      <Button onPress={handleAppleAuth}>Continue with Apple</Button>
    </View>
  )
}
```

### 5. Database Operations

**Always use Appwrite user $id for user-related queries:**

```typescript
import { databases } from '@/services/appwrite'
import { Query } from 'react-native-appwrite'

const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!

// ✅ Correct - Using Appwrite user $id
const user = await authService.getCurrentUser()
const bookmarks = await databases.listDocuments(
  DATABASE_ID,
  'bookmarks',
  [Query.equal('userId', user.$id)]
)

// Create with user reference
await databases.createDocument(
  DATABASE_ID,
  'bookmarks',
  ID.unique(),
  {
    userId: user.$id,
    sessionId: sessionId,
    createdAt: new Date().toISOString()
  }
)
```

### 6. Realtime Subscriptions

```typescript
import { client } from '@/services/appwrite'

const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!

const unsubscribe = client.subscribe(
  `databases.${DATABASE_ID}.collections.messages.documents`,
  (response) => {
    if (response.events.includes('databases.*.collections.*.documents.*.create')) {
      const message = response.payload
      if (message.recipientId === currentUserId) {
        // Show notification
      }
    }
  }
)

// Cleanup
return () => unsubscribe()
```

### 7. File Storage

```typescript
import { storage } from '@/services/appwrite'
import { ID } from 'react-native-appwrite'

const BUCKET_ID = 'profile-pictures'

// Upload file
async function uploadProfilePicture(file: File) {
  const result = await storage.createFile(
    BUCKET_ID,
    ID.unique(),
    file
  )

  // Get file URL
  const fileUrl = storage.getFileView(BUCKET_ID, result.$id)
  return fileUrl
}

// Delete file
async function deleteFile(fileId: string) {
  await storage.deleteFile(BUCKET_ID, fileId)
}
```

## Database Schema Key Points

**Primary User Identifier:** Always use Appwrite's `$id` field for user references.

**Key Collections:**
- `users` - Extended user profiles (synced from Appwrite Auth)
- `events` - Main events/conferences
- `sessions` - Event sessions/talks
- `speakers` - Speaker profiles
- `bookmarks` - User session bookmarks (references user.$id)
- `connections` - User networking connections
- `messages` - Direct messages (references user.$id)
- `check_ins` - Session attendance records
- `notifications` - In-app notifications
- `teams` - Event teams/organizations

**Document Structure Example:**
```typescript
// Bookmark document
{
  $id: "unique-doc-id",
  userId: "user-$id-from-auth",
  sessionId: "session-doc-id",
  createdAt: "2025-11-28T10:00:00.000Z",
  $createdAt: "2025-11-28T10:00:00.000Z",
  $updatedAt: "2025-11-28T10:00:00.000Z"
}
```

## Environment Variables

**App (.env):**
```
EXPO_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
EXPO_PUBLIC_APPWRITE_PROJECT_ID=your-project-id
EXPO_PUBLIC_APPWRITE_DATABASE_ID=your-database-id
```

**Appwrite OAuth Configuration:**
Configure OAuth providers in Appwrite Console:
1. Go to Auth → Settings → OAuth2 Providers
2. Enable Google, Apple, LinkedIn, Facebook, etc.
3. Add redirect URLs: `yourapp://oauth-callback`
4. Set up credentials from each provider

**App Scheme Configuration (app.json):**
```json
{
  "expo": {
    "scheme": "wise-event-app",
    "ios": {
      "bundleIdentifier": "com.wiseevent.app"
    },
    "android": {
      "package": "com.wiseevent.app"
    }
  }
}
```

## Important Conventions

1. **Authentication:** Appwrite Account SDK handles ALL authentication
2. **User Identity:** Always use `user.$id` as the primary identifier
3. **OAuth Setup:** Configure providers in Appwrite Console, not in code
4. **Session Management:** Appwrite SDK manages sessions automatically
5. **Token Security:** Appwrite handles tokens internally
6. **Navigation:** Use Expo Router file-based routing
7. **State Management:**
   - Global auth state → Zustand
   - Server data → TanStack Query
   - Forms → React Hook Form + Zod
8. **Offline Support:** Cache data in MMKV, queue mutations for sync
9. **Realtime:** Use subscriptions for live features (messages, notifications)
10. **Testing:** Use Appwrite's test users and mock data

## Authentication Features

The app supports:
- ✅ Email/Password authentication
- ✅ Social OAuth (Google, Apple, LinkedIn, Facebook, GitHub, etc.)
- ✅ Magic URL (passwordless email links)
- ✅ Phone authentication (SMS OTP)
- ✅ Anonymous sessions
- ✅ Password recovery
- ✅ Email verification
- ✅ Session management across devices
- ✅ Multi-factor authentication (via custom implementation)
- ✅ Team/organization support

## Security Checklist

- ✅ Appwrite handles all authentication securely
- ✅ Use Appwrite Permissions for document-level security
- ✅ Implement proper database permissions
- ✅ Validate all input with Zod schemas
- ✅ Rate limit Appwrite Functions
- ✅ Enable email verification
- ✅ Use HTTPS for all API calls (handled by Appwrite)
- ✅ Regular dependency updates
- ✅ Secure file uploads (validate file types/sizes)

## Common Issues

**Issue:** "User not authenticated" error
- **Cause:** Session expired or user not logged in
- **Fix:** Check auth state and redirect to sign-in

**Issue:** OAuth redirects not working
- **Cause:** Missing WebBrowser.maybeCompleteAuthSession()
- **Fix:** Add at top of OAuth component

**Issue:** Realtime not updating
- **Cause:** Subscription channel mismatch
- **Fix:** Verify collection name and document ID in subscription string

**Issue:** "Unauthorized" when accessing documents
- **Cause:** Incorrect document permissions
- **Fix:** Update permissions in Appwrite Console or use proper user ID

**Issue:** File upload fails
- **Cause:** Bucket permissions or file size limits
- **Fix:** Check bucket settings in Appwrite Console

## Performance Optimization

1. **Lazy load components** with React.lazy()
2. **Cache queries** with TanStack Query (staleTime, cacheTime)
3. **Optimize images** before upload (resize, compress)
4. **Use pagination** for long lists (Query.limit(), Query.offset())
5. **Minimize realtime subscriptions** (subscribe only to needed channels)
6. **Use Appwrite Functions** for heavy computations
7. **Enable offline mode** with MMKV persistence
8. **Debounce search** inputs
9. **Virtual lists** for long scrollable content
10. **Code splitting** with dynamic imports

## Documentation References

- Appwrite React Native: https://appwrite.io/docs/quick-starts/react-native
- Appwrite Auth: https://appwrite.io/docs/products/auth
- Appwrite Databases: https://appwrite.io/docs/products/databases
- Appwrite Storage: https://appwrite.io/docs/products/storage
- Appwrite Realtime: https://appwrite.io/docs/products/realtime
- Expo Router: https://docs.expo.dev/router/introduction/
- TanStack Query: https://tanstack.com/query/latest
