# Quick Start Guide

## Initial Setup (First Time Only)

### 1. Set Up Clerk Authentication

1. Go to https://dashboard.clerk.com and create an account
2. Create a new application: **WISE Event App**
3. In the dashboard:
   - Copy your **Publishable Key** (starts with `pk_test_`)
   - Go to **Configure** → **Paths** and set:
     - Sign-in URL: `/(auth)/sign-in`
     - Sign-up URL: `/(auth)/sign-up`
     - After sign-in URL: `/(app)/(tabs)`
     - After sign-up URL: `/(app)/(tabs)`
4. Enable authentication methods:
   - **Email/Password**: User & Authentication → Email, Phone, Username → Enable Email
   - **Social OAuth**: User & Authentication → Social Connections → Enable Google, Apple, etc.
   - **Enterprise SSO** (optional): User & Authentication → Enterprise Connections

### 2. Set Up Appwrite Backend

1. Go to https://cloud.appwrite.io and create an account
2. Create a new project: **WISE Event App**
3. Create a database: **wise-event-db**
4. Create collections (refer to PRD/complete_doc.json for complete schema):
   - `users` - Extended user profiles
   - `events` - Events/conferences
   - `sessions` - Event sessions
   - `speakers` - Speaker profiles
   - `bookmarks` - User session bookmarks
   - `connections` - User connections
   - `messages` - Direct messages
   - And more... (see complete schema in PRD)
5. Create storage buckets:
   - `avatars` - User profile photos
   - `speaker-photos` - Speaker images
   - `session-materials` - Presentation files
   - `event-media` - Event photos/videos
   - `chat-attachments` - Message attachments
6. Copy your:
   - Project ID
   - Database ID

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```env
# Clerk Authentication
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx_YOUR_KEY_HERE

# Appwrite Configuration
EXPO_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
EXPO_PUBLIC_APPWRITE_PROJECT_ID=your-project-id-here
EXPO_PUBLIC_APPWRITE_DATABASE_ID=your-database-id-here
```

### 4. Set Up Clerk Webhook (User Sync)

This ensures Clerk users are automatically synced to Appwrite:

1. In Appwrite, create a new Function:
   - Name: **Clerk Webhook Handler**
   - Runtime: Node.js 18
   - Trigger: HTTP
2. Deploy the webhook handler code (see Appwrite Functions in PRD)
3. Get the function URL from Appwrite
4. In Clerk Dashboard:
   - Go to **Webhooks** → **Add Endpoint**
   - URL: Your Appwrite function URL
   - Events to listen for:
     - `user.created`
     - `user.updated`
     - `user.deleted`
     - `organization.created`
     - `organizationMembership.created`
5. Copy the webhook secret and add to Appwrite function environment variables

## Running the App

### Start Development Server

```bash
npm start
```

This opens the Expo DevTools. From here you can:
- Press `i` for iOS Simulator
- Press `a` for Android Emulator
- Scan QR code with Expo Go app on your phone

### Run on Specific Platform

```bash
# iOS (requires Mac with Xcode)
npm run ios

# Android (requires Android Studio)
npm run android

# Web
npm run web
```

## Testing the App

### 1. Test Authentication Flow

1. Launch the app → Should show Sign In screen
2. Click "Sign Up" and create a test account
3. Verify:
   - Clerk creates the user
   - Webhook syncs user to Appwrite `users` collection
   - App redirects to home screen after sign-in

### 2. Test SSO (Optional)

1. Enable Google OAuth in Clerk Dashboard
2. In Sign In screen, click "Continue with Google"
3. Complete OAuth flow
4. Verify user is created and synced

### 3. Test Navigation

1. After sign-in, verify all tabs work:
   - Home (Dashboard)
   - Schedule
   - Networking
   - Map
   - Profile
2. In Profile tab, test Sign Out

## Next Steps - Feature Implementation

### Implement Sign In/Sign Up Forms

1. Create `src/components/auth/SignInForm.tsx`
2. Use Clerk's `useSignIn()` hook
3. Add social OAuth buttons using `useOAuth()`
4. Replace placeholder in `src/app/(auth)/sign-in.tsx`

### Implement User Sync Hook

1. Create `src/hooks/useUserSync.ts`
2. Use Clerk's `useUser()` hook
3. Sync user to Appwrite on mount
4. Call in root `_layout.tsx`

### Build Schedule Feature

1. Create Appwrite collection for sessions
2. Create `src/hooks/useSessions.ts` with TanStack Query
3. Build `src/components/session/SessionCard.tsx`
4. Implement filtering in `src/app/(app)/(tabs)/schedule.tsx`

### Build Networking Feature

1. Create connections collection in Appwrite
2. Create `src/hooks/useConnections.ts`
3. Build attendee directory
4. Implement connection requests

## Troubleshooting

### "Clerk Publishable Key not found"
- Verify `.env` file exists in root directory
- Verify key starts with `pk_test_` or `pk_live_`
- Restart Expo dev server after adding `.env`

### "Failed to connect to Appwrite"
- Verify Appwrite project ID is correct
- Verify endpoint is `https://cloud.appwrite.io/v1`
- Check internet connection

### "User not found in Appwrite"
- Verify webhook is set up correctly
- Check Appwrite function logs
- Manually create user in Appwrite for testing

### App crashes on startup
- Clear Metro bundler cache: `npx expo start -c`
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check for TypeScript errors: `npx tsc --noEmit`

## Resources

- [Clerk Expo Quickstart](https://clerk.com/docs/quickstarts/expo)
- [Appwrite React Native Guide](https://appwrite.io/docs/quick-starts/react-native)
- [Expo Router Documentation](https://docs.expo.dev/router/introduction/)
- [NativeWind Documentation](https://www.nativewind.dev/)
- [React Native Paper Components](https://reactnativepaper.com/)

## Development Workflow

1. **Always read CLAUDE.md** before implementing features
2. Use the PRD (PRD/complete_doc.json) as the source of truth
3. Follow the Clerk + Appwrite hybrid architecture
4. Test on both iOS and Android
5. Use TypeScript strictly - no `any` types
6. Write reusable components
7. Use TanStack Query for all server data
8. Always sync Clerk users to Appwrite

Happy coding! 🚀
