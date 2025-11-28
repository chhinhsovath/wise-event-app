# 🚀 Deploy WISE Event App - Quick Start

**Status**: Ready to deploy!
**Your Account**: chhinhs
**Estimated Time**: 20-30 minutes for first build

---

## ⚡ Quick Deployment (Run These Commands)

### 1. Initialize EAS Project (First Time Only)
```bash
eas init
```
- Select "Yes" to create project
- This will add your EAS project ID to app.json

### 2. Configure Your Appwrite Credentials

Update your `.env` file with your production Appwrite credentials:
```bash
EXPO_PUBLIC_APPWRITE_ENDPOINT=https://your-appwrite-instance.com/v1
EXPO_PUBLIC_APPWRITE_PROJECT_ID=your-production-project-id
```

**Or** add them as EAS secrets (recommended for production):
```bash
eas secret:create --scope project --name EXPO_PUBLIC_APPWRITE_ENDPOINT --value "https://your-appwrite.com/v1"
eas secret:create --scope project --name EXPO_PUBLIC_APPWRITE_PROJECT_ID --value "your-project-id"
```

### 3. Build for Testing (Recommended First)

**Android APK** (Easy to test):
```bash
npm run build:preview:android
```

**iOS TestFlight**:
```bash
npm run build:preview:ios
```

**Both Platforms**:
```bash
eas build --platform all --profile preview
```

### 4. Build for Production (App Stores)

**After testing preview builds successfully:**

```bash
# Build both platforms
npm run build:all

# Or build individually
npm run build:prod:android
npm run build:prod:ios
```

---

## 📱 What Happens Next?

### During Build (~20-30 minutes)
1. **EAS starts building** your app in the cloud
2. **Monitor progress** at: https://expo.dev/accounts/chhinhs/projects/wise-event-app/builds
3. **Or** watch in terminal for real-time logs

### After Build Completes

**Android:**
- Download APK from EAS dashboard
- Install on your device to test
- Or get shareable link to send to testers

**iOS:**
- Build uploaded to App Store Connect automatically
- Configure TestFlight in App Store Connect
- Add testers and distribute

---

## 🧪 Testing Your Build

### Download and Install

**Android APK:**
```bash
# After build completes, download from dashboard
# Transfer to device and install
```

**iOS TestFlight:**
```bash
# Automatically available in TestFlight app
# Check email for invite
```

### Test Checklist

- [ ] App launches successfully
- [ ] Login with Clerk works
- [ ] Profile loads from Appwrite
- [ ] Sessions display correctly
- [ ] Bookmarks work
- [ ] Networking features work
- [ ] QR scanning works
- [ ] Polls and Q&A work
- [ ] Real-time updates work
- [ ] Notifications received

---

## 🏪 Submit to App Stores

### After successful testing:

**Google Play Store:**
```bash
npm run submit:android
```

**Apple App Store:**
```bash
npm run submit:ios
```

You'll need:
- Google Play Developer account ($25 one-time)
- Apple Developer account ($99/year)
- App screenshots and descriptions
- Privacy policy URL

---

## 🆘 Troubleshooting

### "No Appwrite instance found"
- Check your `.env` file has correct endpoint
- Or add as EAS secret (see step 2 above)

### "Build failed - credentials"
```bash
eas credentials
# Configure iOS/Android credentials
```

### "Bundle identifier already exists"
- Change in `app.json`:
```json
{
  "ios": {
    "bundleIdentifier": "com.yourcompany.wiseevent"
  },
  "android": {
    "package": "com.yourcompany.wiseevent"
  }
}
```

---

## 🔄 Future Updates

### Build New Version:
1. Update version in `app.json`
2. Run: `npm run build:all`
3. Submit: `eas submit --platform all`

### Quick JS Updates (No rebuild needed):
```bash
eas update --branch production --message "Bug fixes"
```

---

## 📊 Monitor Your Builds

- **Dashboard**: https://expo.dev/accounts/chhinhs
- **Build logs**: Real-time in terminal
- **Build status**: Email notifications

---

## ✅ Ready to Go!

Your app is fully integrated and ready to deploy. Run the commands above to start building!

**Start with preview build** to test everything, then move to production builds.

Good luck! 🎉
