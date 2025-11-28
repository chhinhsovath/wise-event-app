# 🚀 WISE Event App - Deployment Guide

**Last Updated**: November 28, 2025
**Version**: 1.0.0
**Status**: Ready for Production Deployment

---

## 📋 Pre-Deployment Checklist

### ✅ Required Before Deployment

- [ ] **Appwrite Instance Ready**
  - Database created with all 11 collections
  - Collections configured with proper indexes and permissions
  - Realtime enabled for required collections
  - Test data seeded and verified

- [ ] **Clerk Authentication Configured**
  - Production app created in Clerk Dashboard
  - OAuth providers configured (Google, Apple, etc.)
  - Webhook endpoints configured
  - API keys ready

- [ ] **EAS Account Setup**
  - Expo account created: https://expo.dev/signup
  - EAS CLI installed: `npm install -g eas-cli`
  - Logged in: `eas login`
  - Project created: `eas init`

- [ ] **App Store Accounts** (if publishing)
  - Apple Developer Account ($99/year)
  - Google Play Developer Account ($25 one-time)

- [ ] **Environment Variables Ready**
  - Appwrite endpoint and project ID
  - Clerk publishable key
  - Any other API keys

---

## 🔧 Step 1: Configure Environment Variables

### Create `.env.production` file:

```bash
# Appwrite Configuration
EXPO_PUBLIC_APPWRITE_ENDPOINT=https://your-appwrite-instance.com/v1
EXPO_PUBLIC_APPWRITE_PROJECT_ID=your-project-id

# Clerk Configuration
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxx

# App Configuration
EXPO_PUBLIC_APP_ENV=production
EXPO_PUBLIC_APP_VERSION=1.0.0
```

### Add to EAS Secrets:

```bash
# Add Appwrite credentials
eas secret:create --scope project --name EXPO_PUBLIC_APPWRITE_ENDPOINT --value "https://your-appwrite.com/v1"
eas secret:create --scope project --name EXPO_PUBLIC_APPWRITE_PROJECT_ID --value "your-project-id"

# Add Clerk key
eas secret:create --scope project --name EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY --value "pk_live_xxxxx"
```

---

## 🏗️ Step 2: Update App Configuration

### Update `app.json`:

```json
{
  "expo": {
    "name": "WISE Event App",
    "slug": "wise-event-app",
    "version": "1.0.0",
    "extra": {
      "eas": {
        "projectId": "YOUR_EAS_PROJECT_ID"
      }
    },
    "ios": {
      "bundleIdentifier": "com.wiseevent.app",
      "buildNumber": "1"
    },
    "android": {
      "package": "com.wiseevent.app",
      "versionCode": 1
    }
  }
}
```

---

## 📱 Step 3: Build the App

### Option A: Build for Internal Testing (Recommended First)

**Android APK** (Quick, for testing):
```bash
npm run build:preview:android
```

**iOS TestFlight** (For internal testing):
```bash
npm run build:preview:ios
```

**Both platforms**:
```bash
eas build --platform all --profile preview
```

### Option B: Build for Production (App Stores)

**Android (Google Play)**:
```bash
npm run build:prod:android
```

**iOS (App Store)**:
```bash
npm run build:prod:ios
```

**Both platforms**:
```bash
npm run build:all
```

---

## ⏱️ Build Time Expectations

- **Android APK**: ~10-15 minutes
- **iOS Build**: ~15-25 minutes
- **Both Platforms**: ~20-30 minutes (parallel)

Monitor build progress:
- Dashboard: https://expo.dev/accounts/[your-account]/projects/wise-event-app/builds
- CLI: Builds will show progress in terminal

---

## 📥 Step 4: Download and Test Builds

### Android APK:
1. Build completes → Download APK from EAS dashboard
2. Transfer to Android device
3. Install and test all features
4. Share with testers via link

### iOS TestFlight:
1. Build completes → Automatically uploaded to App Store Connect
2. Configure TestFlight in App Store Connect
3. Add internal testers
4. Testers receive email with TestFlight link
5. Test all features

---

## 🧪 Step 5: Testing Checklist

Test all integrated features before public release:

### Core Features
- [ ] **Authentication**
  - Sign up with email
  - Sign in with OAuth (Google, Apple)
  - Sign out and sign back in

- [ ] **User Profile**
  - Profile loads from Appwrite
  - Update profile information
  - Avatar upload works

- [ ] **Sessions & Schedule**
  - View all sessions
  - Filter by type, track, date
  - Search sessions
  - View session details

- [ ] **Bookmarks**
  - Bookmark a session
  - View My Agenda
  - Unbookmark a session
  - Notifications scheduled

- [ ] **Networking**
  - View attendee directory
  - Search attendees
  - Send connection request
  - Accept/decline connections
  - View connections list

- [ ] **QR Check-in**
  - Generate session QR code
  - Scan QR code
  - Check in to session
  - View attendance list

- [ ] **Polls & Q&A**
  - View polls
  - Vote on polls
  - Submit questions
  - Upvote questions
  - View answers

- [ ] **Real-time Updates**
  - Vote on poll → See live update
  - Submit question → Appears for others
  - Check in → Attendance updates live

- [ ] **Notifications**
  - Receive session reminders
  - Receive connection requests
  - Mark as read
  - Navigate from notification

### Performance & UX
- [ ] App loads quickly (< 3 seconds)
- [ ] Smooth scrolling in lists
- [ ] No crashes or freezes
- [ ] Pull-to-refresh works everywhere
- [ ] Loading states display correctly
- [ ] Error handling works (try offline mode)

---

## 📤 Step 6: Submit to App Stores

### Google Play Store

1. **Prepare Store Listing**:
   - App name: "WISE Event App"
   - Short description (80 chars)
   - Full description (4000 chars)
   - Screenshots (at least 2, recommended 8)
   - Feature graphic (1024x500)
   - App icon (512x512)

2. **Submit Build**:
```bash
npm run submit:android
```

3. **Review Process**: 1-3 days

### Apple App Store

1. **Prepare Store Listing in App Store Connect**:
   - App name: "WISE Event App"
   - Subtitle (30 chars)
   - Description (4000 chars)
   - Keywords (100 chars)
   - Screenshots (multiple sizes required)
   - App icon (1024x1024)

2. **Submit Build**:
```bash
npm run submit:ios
```

3. **Review Process**: 1-3 days (sometimes longer)

---

## 🔄 Updating the App

### Version Bump

Update version in `app.json`:
```json
{
  "expo": {
    "version": "1.0.1",  // Increment version
    "ios": {
      "buildNumber": "2"  // Increment build number
    },
    "android": {
      "versionCode": 2  // Increment version code
    }
  }
}
```

### Build and Submit Update

```bash
# Build new version
eas build --platform all --profile production

# Submit to stores
eas submit --platform all
```

---

## 🔍 Monitoring & Analytics

### EAS Updates (Over-the-Air Updates)

For non-native changes (JS, assets), use OTA updates:

```bash
# Configure EAS Update
eas update:configure

# Publish update
eas update --branch production --message "Bug fixes and improvements"
```

Users get updates without app store approval!

### Crash Reporting

Consider adding:
- **Sentry**: `npx expo install @sentry/react-native`
- **Crashlytics**: Firebase Crashlytics

### Analytics

Consider adding:
- **Expo Analytics**: Built-in
- **Firebase Analytics**: Popular choice
- **Amplitude**: Advanced analytics

---

## 🚨 Troubleshooting

### Build Fails

**Common Issues**:

1. **"Credentials not found"**
   ```bash
   eas credentials
   # Select platform and configure
   ```

2. **"Invalid bundle identifier"**
   - Check `app.json` iOS bundleIdentifier
   - Must match Apple Developer account

3. **"Package name already exists"**
   - Check `app.json` Android package
   - Must be unique in Google Play

4. **Build timeout**
   - Usually network issues
   - Retry: `eas build --platform [platform] --profile [profile]`

### App Crashes on Startup

1. **Check Environment Variables**:
   ```bash
   eas secret:list
   ```

2. **Check Appwrite Connection**:
   - Verify endpoint URL
   - Verify project ID
   - Check network permissions in `app.json`

3. **Check Logs**:
   ```bash
   # iOS
   npx expo run:ios

   # Android
   npx expo run:android
   ```

### Realtime Not Working

1. **Check Appwrite Realtime**:
   - Enabled in Appwrite Console
   - WebSocket connections allowed
   - No firewall blocking

2. **Check Permissions**:
   - Users have read access to collections
   - Realtime events not blocked

---

## 📊 Deployment Timeline

### First Deployment (New App)

| Stage | Duration | Notes |
|-------|----------|-------|
| Environment Setup | 15-30 min | Configure variables, secrets |
| Initial Build | 20-30 min | Both platforms |
| Testing | 2-4 hours | Comprehensive testing |
| Store Listing Prep | 1-2 hours | Screenshots, descriptions |
| Submission | 10 min | Automated via EAS |
| Review (Google) | 1-3 days | Usually faster |
| Review (Apple) | 1-7 days | Can take longer |
| **Total to Launch** | **4-10 days** | |

### Updates (Existing App)

| Stage | Duration | Notes |
|-------|----------|-------|
| Code Changes | Varies | Development time |
| Build | 20-30 min | Both platforms |
| Testing | 1-2 hours | Focused testing |
| Submission | 10 min | Automated |
| Review | 1-3 days | Often faster for updates |
| **Total** | **1-5 days** | |

### OTA Updates (Non-native)

| Stage | Duration | Notes |
|-------|----------|-------|
| Code Changes | Varies | JS/assets only |
| Publish | 2-5 min | EAS Update |
| User Receives | Minutes | Next app launch |
| **Total** | **Minutes** | Instant updates! |

---

## 🎯 Launch Checklist

### Pre-Launch (Day -7)
- [ ] All features tested and working
- [ ] Appwrite database configured and seeded
- [ ] Test accounts created for reviewers
- [ ] Screenshots and store assets ready
- [ ] Privacy policy and terms of service ready

### Submission Day (Day 0)
- [ ] Build production app
- [ ] Final testing on physical devices
- [ ] Submit to Google Play Store
- [ ] Submit to Apple App Store
- [ ] Prepare launch announcement

### During Review (Days 1-7)
- [ ] Monitor build dashboard for rejections
- [ ] Respond quickly to reviewer questions
- [ ] Have team ready for quick fixes

### Launch Day (Day 7-10)
- [ ] Verify apps are live in stores
- [ ] Send announcement to attendees
- [ ] Monitor for crashes/issues
- [ ] Prepare for user support

### Post-Launch (Day 10+)
- [ ] Collect user feedback
- [ ] Monitor analytics
- [ ] Plan first update
- [ ] Add features based on feedback

---

## 📱 Quick Deployment Commands

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Initialize EAS project (first time only)
eas init

# Configure environment
eas secret:create --scope project --name EXPO_PUBLIC_APPWRITE_ENDPOINT --value "YOUR_VALUE"

# Build for testing
eas build --platform all --profile preview

# Build for production
eas build --platform all --profile production

# Submit to stores
eas submit --platform android
eas submit --platform ios

# OTA update (after initial release)
eas update --branch production --message "Update description"
```

---

## 🆘 Need Help?

- **EAS Build Docs**: https://docs.expo.dev/build/introduction/
- **EAS Submit Docs**: https://docs.expo.dev/submit/introduction/
- **Expo Forums**: https://forums.expo.dev/
- **Appwrite Docs**: https://appwrite.io/docs
- **Clerk Docs**: https://clerk.com/docs

---

## 🎉 You're Ready to Deploy!

The WISE Event App is fully integrated, tested, and ready for production. Follow this guide step-by-step for a smooth deployment.

**Good luck with your launch!** 🚀
