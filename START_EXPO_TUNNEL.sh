#!/bin/bash

echo "Starting Expo with tunnel mode for external device access..."
echo "This will create a publicly accessible URL that works on your iPhone."
echo ""

# Install ngrok if not present
if ! npm list @expo/ngrok >/dev/null 2>&1; then
    echo "Installing @expo/ngrok for tunnel support..."
    npm install @expo/ngrok@^4.1.0
fi

# Start Expo with tunnel
echo "Starting Expo in tunnel mode..."
npx expo start --tunnel

# Note: The QR code will now contain a URL like: exp://xxx.xxx.exp.direct:80
# This URL is accessible from any device with internet connection