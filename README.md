# WISE Event Management App

A comprehensive event management mobile application for educational summits, conferences, and large-scale events, inspired by WISE Qatar.

## Tech Stack

- **Frontend**: React Native 0.76+ with Expo SDK 54+
- **Language**: TypeScript
- **Navigation**: Expo Router v4 (file-based routing)
- **Authentication**: Clerk (handles ALL auth including SSO)
- **Backend**: Appwrite Cloud (Database, Storage, Realtime)
- **State Management**:
  - Global: Zustand
  - Server State: TanStack Query (React Query)
  - Forms: React Hook Form + Zod
- **UI**: React Native Paper + NativeWind (Tailwind CSS)
- **Animations**: React Native Reanimated 3

## Getting Started

### Prerequisites

- Node.js 18+ and npm/pnpm/yarn
- Expo CLI
- iOS Simulator (Mac) or Android Emulator

### Installation

1. Clone the repository
```bash
cd /Users/chhinhsovath/Documents/WISE-PP
```

2. Install dependencies (already done)
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env
```

4. Configure your Clerk and Appwrite credentials in `.env`:
```env
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
EXPO_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
EXPO_PUBLIC_APPWRITE_PROJECT_ID=your-project-id
EXPO_PUBLIC_APPWRITE_DATABASE_ID=your-database-id
```

### Running the App

```bash
# Start development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android

# Run on Web
npm run web
```

## Project Structure

```
src/
├── app/                    # Expo Router file-based routing
│   ├── _layout.tsx        # Root layout with providers
│   ├── index.tsx          # Entry point / splash
│   ├── (auth)/            # Public auth screens
│   │   ├── sign-in.tsx
│   │   ├── sign-up.tsx
│   │   └── sso-callback.tsx
│   └── (app)/             # Protected app screens
│       └── (tabs)/        # Bottom tab navigation
│           ├── index.tsx  # Home/Dashboard
│           ├── schedule.tsx
│           ├── networking.tsx
│           ├── map.tsx
│           └── profile.tsx
├── components/            # Reusable components
├── services/              # API services (Appwrite)
├── hooks/                 # Custom React hooks
├── stores/                # Zustand stores
├── lib/                   # Utilities and configs
└── types/                 # TypeScript types

```

## Key Features

### Authentication (Clerk)
- Email/Password authentication
- Social OAuth (Google, Apple, LinkedIn, Facebook, etc.)
- Enterprise SSO (SAML, OIDC)
- Multi-factor authentication
- Organization/tenant support
- Session management

### Event Management
- Event schedule with filtering
- Session details and bookmarking
- Speaker profiles
- Venue navigation with interactive maps
- QR code check-ins
- Personal agenda management

### Networking
- Attendee directory
- Connection requests
- Direct messaging
- Meeting scheduling
- Contact exchange via QR

### Engagement
- Live polls and Q&A
- Session feedback and ratings
- Gamification (points, badges, leaderboard)
- Push notifications
- In-app announcements

## Development Guidelines

### Authentication Pattern
- **Critical**: Clerk handles ALL authentication
- Appwrite handles ONLY data persistence
- Always use `clerkUserId` for user references
- Sync Clerk users to Appwrite on sign-in

### File Naming
- Components: PascalCase (e.g., `SessionCard.tsx`)
- Hooks: camelCase with `use` prefix (e.g., `useSessions.ts`)
- Utilities: camelCase (e.g., `formatDate.ts`)
- Routes: kebab-case (e.g., `sign-in.tsx`)

### State Management
- **Global UI state**: Use Zustand stores
- **Server data**: Use TanStack Query hooks
- **Form state**: Use React Hook Form + Zod

### Styling
- Use NativeWind (Tailwind) classes: `className="flex-1 p-4"`
- Use React Native Paper components for Material Design
- Custom theme colors defined in `tailwind.config.js`

## Environment Setup

### Clerk Setup
1. Create account at https://dashboard.clerk.com
2. Create new application
3. Enable desired authentication methods (Social OAuth, Enterprise SSO)
4. Copy publishable key to `.env`
5. Configure redirect URLs for your app scheme

### Appwrite Setup
1. Create account at https://cloud.appwrite.io
2. Create new project
3. Create database and collections (see PRD/complete_doc.json for schema)
4. Set up storage buckets
5. Configure Clerk webhook to sync users
6. Copy project ID and database ID to `.env`

## Testing

```bash
# Run tests (when implemented)
npm test

# Type checking
npx tsc --noEmit

# Linting (when configured)
npm run lint
```

## Building for Production

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure EAS
eas build:configure

# Build for iOS
eas build --platform ios --profile production

# Build for Android
eas build --platform android --profile production

# Build for both
eas build --platform all --profile production
```

## Documentation

- [CLAUDE.md](./CLAUDE.md) - Development guidelines for AI assistants
- [PRD](./PRD/complete_doc.json) - Complete product requirements
- [Clerk Docs](https://clerk.com/docs/quickstarts/expo)
- [Appwrite Docs](https://appwrite.io/docs/quick-starts/react-native)
- [Expo Router Docs](https://docs.expo.dev/router/introduction/)

## License

Proprietary - All rights reserved

## Support

For questions or issues, please contact the development team.
# wise-event-app
