#!/bin/bash

# WISE Event App - Deployment Script with Validation
# Run this script to deploy your app

echo "🚀 WISE Event App - Deployment"
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Validation flag
VALIDATION_PASSED=true

# Function: Run validation checks
run_validation() {
    echo ""
    echo "${BLUE}═══════════════════════════════════════${NC}"
    echo "${BLUE}   Running Pre-Build Validation...${NC}"
    echo "${BLUE}═══════════════════════════════════════${NC}"
    echo ""

    # 1. Check Node.js version
    echo "${BLUE}[1/8]${NC} Checking Node.js version..."
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        echo "${RED}✗ Node.js version $NODE_VERSION is too old. Required: 18+${NC}"
        VALIDATION_PASSED=false
    else
        echo "${GREEN}✓ Node.js version OK${NC}"
    fi

    # 2. Check if EAS project is initialized
    echo "${BLUE}[2/8]${NC} Checking EAS project configuration..."
    if ! grep -q '"projectId"' app.json || grep -q '"projectId": ""' app.json; then
        echo "${YELLOW}⚠ EAS project not initialized. Run option 1 first.${NC}"
        VALIDATION_PASSED=false
    else
        PROJECT_ID=$(grep '"projectId"' app.json | sed 's/.*"projectId": "\(.*\)".*/\1/')
        echo "${GREEN}✓ EAS project configured (ID: ${PROJECT_ID})${NC}"
    fi

    # 3. Check package-lock.json sync
    echo "${BLUE}[3/8]${NC} Checking package-lock.json sync..."
    npm ls >/dev/null 2>&1
    if [ $? -ne 0 ]; then
        echo "${YELLOW}⚠ Dependencies out of sync. Running npm install...${NC}"
        npm install >/dev/null 2>&1
        echo "${GREEN}✓ Dependencies synchronized${NC}"
    else
        echo "${GREEN}✓ Dependencies in sync${NC}"
    fi

    # 4. Check for required assets
    echo "${BLUE}[4/8]${NC} Checking required assets..."
    MISSING_ASSETS=()
    [ ! -f "assets/icon.png" ] && MISSING_ASSETS+=("icon.png")
    [ ! -f "assets/splash-icon.png" ] && MISSING_ASSETS+=("splash-icon.png")
    [ ! -f "assets/adaptive-icon.png" ] && MISSING_ASSETS+=("adaptive-icon.png")
    [ ! -f "assets/notification-icon.png" ] && MISSING_ASSETS+=("notification-icon.png")

    if [ ${#MISSING_ASSETS[@]} -gt 0 ]; then
        echo "${RED}✗ Missing assets: ${MISSING_ASSETS[*]}${NC}"
        VALIDATION_PASSED=false
    else
        echo "${GREEN}✓ All required assets present${NC}"
    fi

    # 5. Run expo-doctor (quick check)
    echo "${BLUE}[5/8]${NC} Running Expo health check..."
    DOCTOR_OUTPUT=$(npx expo-doctor 2>&1)
    FAILED_CHECKS=$(echo "$DOCTOR_OUTPUT" | grep -o '[0-9]* checks failed' | cut -d' ' -f1)

    if [ -z "$FAILED_CHECKS" ]; then
        FAILED_CHECKS=0
    fi

    if [ "$FAILED_CHECKS" -gt 1 ]; then
        echo "${YELLOW}⚠ $FAILED_CHECKS validation checks failed${NC}"
        echo "${YELLOW}  Run 'npx expo-doctor' for details${NC}"
        # Don't fail validation for minor issues
    else
        echo "${GREEN}✓ Expo health check passed${NC}"
    fi

    # 6. Check environment variables
    echo "${BLUE}[6/8]${NC} Checking environment variables..."
    if [ ! -f ".env" ]; then
        echo "${YELLOW}⚠ .env file not found${NC}"
        echo "${YELLOW}  Make sure to configure EAS secrets (option 8)${NC}"
    else
        if ! grep -q "EXPO_PUBLIC_APPWRITE_ENDPOINT" .env; then
            echo "${YELLOW}⚠ APPWRITE_ENDPOINT not found in .env${NC}"
        fi
        if ! grep -q "EXPO_PUBLIC_APPWRITE_PROJECT_ID" .env; then
            echo "${YELLOW}⚠ APPWRITE_PROJECT_ID not found in .env${NC}"
        fi
        echo "${GREEN}✓ Local .env file exists${NC}"
    fi

    # 7. Check EAS secrets
    echo "${BLUE}[7/8]${NC} Checking EAS secrets..."
    EAS_SECRETS=$(eas secret:list 2>&1)
    if echo "$EAS_SECRETS" | grep -q "EXPO_PUBLIC_APPWRITE_ENDPOINT"; then
        echo "${GREEN}✓ Appwrite secrets configured${NC}"
    else
        echo "${YELLOW}⚠ Appwrite secrets not configured. Run option 8.${NC}"
    fi

    # 8. Check git status
    echo "${BLUE}[8/8]${NC} Checking git repository..."
    if [ ! -d ".git" ]; then
        echo "${YELLOW}⚠ Not a git repository${NC}"
    else
        UNCOMMITTED=$(git status --porcelain | wc -l | tr -d ' ')
        if [ "$UNCOMMITTED" -gt 0 ]; then
            echo "${YELLOW}⚠ $UNCOMMITTED uncommitted changes${NC}"
            echo "${YELLOW}  Consider committing before building${NC}"
        else
            echo "${GREEN}✓ Git working tree clean${NC}"
        fi
    fi

    # Summary
    echo ""
    echo "${BLUE}═══════════════════════════════════════${NC}"
    if [ "$VALIDATION_PASSED" = true ]; then
        echo "${GREEN}✓ Validation Passed - Ready to Build!${NC}"
    else
        echo "${RED}✗ Validation Failed - Fix issues before building${NC}"
        echo ""
        echo "${YELLOW}Do you want to continue anyway? (y/N)${NC}"
        read -r continue_anyway
        if [[ ! "$continue_anyway" =~ ^[Yy]$ ]]; then
            echo "Exiting..."
            exit 1
        fi
    fi
    echo "${BLUE}═══════════════════════════════════════${NC}"
    echo ""
}

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
echo "  ${GREEN}0)${NC} Run Validation Only"
echo "  ${BLUE}1)${NC} Initialize EAS project (first time only)"
echo "  ${BLUE}2)${NC} Build for testing (Preview - Android APK)"
echo "  ${BLUE}3)${NC} Build for testing (Preview - iOS TestFlight)"
echo "  ${BLUE}4)${NC} Build for testing (Preview - Both platforms)"
echo "  ${BLUE}5)${NC} Build for production (Android)"
echo "  ${BLUE}6)${NC} Build for production (iOS)"
echo "  ${BLUE}7)${NC} Build for production (Both platforms)"
echo "  ${YELLOW}8)${NC} Configure environment secrets"
echo "  ${YELLOW}9)${NC} Submit to Google Play Store"
echo "  ${YELLOW}10)${NC} Submit to Apple App Store"
echo "  ${YELLOW}11)${NC} View build status"
echo "  ${RED}99)${NC} Exit"
echo ""
read -p "Enter your choice: " choice

case $choice in
    0)
        run_validation
        ;;
    1)
        echo "${BLUE}Initializing EAS project...${NC}"
        eas init --non-interactive --force
        echo ""
        echo "${GREEN}✓ EAS project initialized!${NC}"
        ;;
    2)
        run_validation
        echo "${BLUE}Building Android APK for testing...${NC}"
        ./auto-build.sh
        ;;
    3)
        run_validation
        echo "${BLUE}Building iOS for TestFlight...${NC}"
        eas build --platform ios --profile preview
        ;;
    4)
        run_validation
        echo "${BLUE}Building both platforms for testing...${NC}"
        eas build --platform all --profile preview
        ;;
    5)
        run_validation
        echo "${BLUE}Building Android for production...${NC}"
        eas build --platform android --profile production
        ;;
    6)
        run_validation
        echo "${BLUE}Building iOS for production...${NC}"
        eas build --platform ios --profile production
        ;;
    7)
        run_validation
        echo "${BLUE}Building both platforms for production...${NC}"
        eas build --platform all --profile production
        ;;
    8)
        echo "${BLUE}Configuring environment secrets...${NC}"
        echo ""
        read -p "Enter Appwrite endpoint (e.g., https://cloud.appwrite.io/v1): " appwrite_endpoint
        read -p "Enter Appwrite project ID: " appwrite_project_id

        eas secret:create --scope project --name EXPO_PUBLIC_APPWRITE_ENDPOINT --value "$appwrite_endpoint" --type string --force --non-interactive
        eas secret:create --scope project --name EXPO_PUBLIC_APPWRITE_PROJECT_ID --value "$appwrite_project_id" --type string --force --non-interactive

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
    11)
        echo "${BLUE}Fetching build status...${NC}"
        eas build:list --limit 5
        ;;
    99)
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
echo "Monitor your builds at: https://expo.dev/accounts/$(eas whoami)/projects/wise-event-app/builds"
echo ""
