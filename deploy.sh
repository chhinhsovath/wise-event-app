#!/bin/bash

# WISE Event App - Deployment Script
# Run this script to deploy your app

echo "🚀 WISE Event App - Deployment"
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if EAS CLI is installed
if ! command -v eas &> /dev/null; then
    echo "${YELLOW}EAS CLI not found. Installing...${NC}"
    npm install -g eas-cli
fi

# Check if logged in
echo "${BLUE}Checking EAS login status...${NC}"
if ! eas whoami &> /dev/null; then
    echo "${YELLOW}Please login to EAS:${NC}"
    eas login
fi

echo ""
echo "${GREEN}✓ Logged in as:${NC} $(eas whoami)"
echo ""

# Show menu
echo "Select deployment option:"
echo "  1) Initialize EAS project (first time only)"
echo "  2) Build for testing (Preview - Android APK)"
echo "  3) Build for testing (Preview - iOS TestFlight)"
echo "  4) Build for testing (Preview - Both platforms)"
echo "  5) Build for production (Android)"
echo "  6) Build for production (iOS)"
echo "  7) Build for production (Both platforms)"
echo "  8) Configure environment secrets"
echo "  9) Submit to Google Play Store"
echo " 10) Submit to Apple App Store"
echo "  0) Exit"
echo ""
read -p "Enter your choice: " choice

case $choice in
    1)
        echo "${BLUE}Initializing EAS project...${NC}"
        eas init
        ;;
    2)
        echo "${BLUE}Building Android APK for testing...${NC}"
        eas build --platform android --profile preview
        ;;
    3)
        echo "${BLUE}Building iOS for TestFlight...${NC}"
        eas build --platform ios --profile preview
        ;;
    4)
        echo "${BLUE}Building both platforms for testing...${NC}"
        eas build --platform all --profile preview
        ;;
    5)
        echo "${BLUE}Building Android for production...${NC}"
        eas build --platform android --profile production
        ;;
    6)
        echo "${BLUE}Building iOS for production...${NC}"
        eas build --platform ios --profile production
        ;;
    7)
        echo "${BLUE}Building both platforms for production...${NC}"
        eas build --platform all --profile production
        ;;
    8)
        echo "${BLUE}Configuring environment secrets...${NC}"
        echo ""
        read -p "Enter Appwrite endpoint (e.g., https://cloud.appwrite.io/v1): " appwrite_endpoint
        read -p "Enter Appwrite project ID: " appwrite_project_id

        eas secret:create --scope project --name EXPO_PUBLIC_APPWRITE_ENDPOINT --value "$appwrite_endpoint"
        eas secret:create --scope project --name EXPO_PUBLIC_APPWRITE_PROJECT_ID --value "$appwrite_project_id"

        echo "${GREEN}✓ Secrets configured!${NC}"
        ;;
    9)
        echo "${BLUE}Submitting to Google Play Store...${NC}"
        eas submit --platform android
        ;;
    10)
        echo "${BLUE}Submitting to Apple App Store...${NC}"
        eas submit --platform ios
        ;;
    0)
        echo "Exiting..."
        exit 0
        ;;
    *)
        echo "${YELLOW}Invalid choice${NC}"
        exit 1
        ;;
esac

echo ""
echo "${GREEN}✓ Done!${NC}"
echo ""
echo "Monitor your build at: https://expo.dev/accounts/$(eas whoami)/projects/wise-event-app/builds"
echo ""
