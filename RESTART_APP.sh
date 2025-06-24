#!/bin/bash

echo "🔄 Restarting Receipt Vault Pro with clean cache..."
echo ""

# Kill any existing Expo processes
echo "Stopping any running Expo processes..."
ps aux | grep expo | grep -v grep | awk '{print $2}' | xargs -r kill -9 2>/dev/null

# Clear Metro bundler cache
echo "Clearing Metro bundler cache..."
rm -rf $TMPDIR/metro-* 2>/dev/null
rm -rf $TMPDIR/haste-map-* 2>/dev/null

# Clear Expo cache
echo "Clearing Expo cache..."
npx expo start --clear --web --port 8082

echo ""
echo "📱 App should now be running on http://localhost:8082"
echo "   Press 'w' to open in web browser"
echo ""