#!/bin/bash
# Auto-build script with automatic keystore generation

# Use expect to auto-answer prompts
expect << 'EOF'
set timeout -1
spawn eas build --platform android --profile preview
expect "Generate a new Android Keystore?" { send "y\r" }
expect eof
EOF
