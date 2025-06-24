# 🚀 How to Start Receipt Vault Pro

## Quick Start Commands

Open a terminal in the project directory and run:

```bash
cd /mnt/c/Users/jehma/Desktop/AI/Infinite
npx expo start
```

## What to Expect

When Expo starts, you'll see:
- A QR code in the terminal
- Options to press keys:
  - `w` - Open in web browser
  - `a` - Open in Android emulator
  - `i` - Open in iOS simulator (Mac only)

## Viewing Options

### 1. Web Browser (Easiest)
- Press `w` after running `npx expo start`
- The app will open in your default browser
- Best for quick testing

### 2. Mobile Device
- Install "Expo Go" app from App Store/Play Store
- Scan the QR code with:
  - iOS: Camera app
  - Android: Expo Go app
- The app will load on your phone

### 3. Emulator/Simulator
- Android: Have Android Studio with emulator running, press `a`
- iOS: On Mac with Xcode installed, press `i`

## Troubleshooting

If you get an error about missing modules:
```bash
npm install
```

If Expo doesn't start:
```bash
npx expo start --clear
```

For network issues:
```bash
npx expo start --tunnel
```

## What You'll See

1. **Camera Screen** (default)
   - Full-screen camera view
   - Edge detection visualization (mock)
   - Capture button at bottom

2. **Gallery Tab**
   - Grid of 25 mock receipts
   - Search and filter functionality
   - Multi-select with long press

3. **Search Tab**
   - Search receipts by merchant
   - Filter by date, amount, category

4. **Profile Tab**
   - User settings
   - Camera preferences
   - Storage info

## Features to Try

- Tap the camera button to simulate capture
- Long press receipts in gallery for multi-select
- Pull down to refresh in gallery
- Use search to find specific receipts
- Try the floating camera button in gallery

Enjoy testing Receipt Vault Pro! 🎉