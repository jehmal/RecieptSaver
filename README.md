# Receipt Vault Pro

A comprehensive React Native application for managing receipts and expenses, built with Expo.

## Getting Started

### Prerequisites

- Node.js 16.x or higher
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac only) or Android Emulator
- Expo Go app on your physical device (optional)

### Installation

1. Clone the repository:
```bash
cd /mnt/c/Users/jehma/Desktop/AI/Infinite/
```

2. Install dependencies:
```bash
npm install
```

3. Create placeholder assets (if not present):
```bash
mkdir -p assets
# Add placeholder images for icon.png, splash.png, adaptive-icon.png, and favicon.png
```

4. Start the development server:
```bash
npx expo start
```

### Running the App

After starting the development server, you can:

- Press `i` to open iOS simulator
- Press `a` to open Android emulator
- Press `w` to open in web browser
- Scan the QR code with Expo Go app on your phone

## Project Structure

```
receipt-vault-pro/
├── App.tsx                 # Main application entry point
├── app.json               # Expo configuration
├── package.json           # Project dependencies
├── tsconfig.json          # TypeScript configuration
├── babel.config.js        # Babel configuration
├── metro.config.js        # Metro bundler configuration
├── assets/                # Images, fonts, and other assets
└── src/                   # Source code
    ├── components/        # Reusable components
    ├── screens/          # Screen components
    ├── navigation/       # Navigation configuration
    ├── services/         # API and data services
    ├── utils/           # Utility functions
    ├── hooks/           # Custom React hooks
    ├── types/           # TypeScript type definitions
    └── constants/       # App constants
```

## Features

- Receipt scanning and OCR
- Expense tracking and categorization
- Budget management
- Analytics and reporting
- Multi-user support
- Cloud backup
- Export functionality

## Development

### TypeScript

The project uses TypeScript for type safety. All component props and function parameters should be properly typed.

### Code Style

- ESLint and Prettier are configured for code linting and formatting
- Run `npm run lint` to check for linting errors
- Code is automatically formatted on save (if your editor supports it)

### Testing

- Jest is configured for unit testing
- Run `npm test` to execute tests
- Test files should be placed next to the components they test with `.test.ts` or `.test.tsx` extension

## Building for Production

### iOS

```bash
npx eas build --platform ios
```

### Android

```bash
npx eas build --platform android
```

### Web

```bash
npx expo export:web
```

## Troubleshooting

### Common Issues

1. **Metro bundler issues**: Clear cache with `npx expo start -c`
2. **Dependency issues**: Delete `node_modules` and run `npm install`
3. **iOS build issues**: Run `cd ios && pod install`
4. **Android build issues**: Clean build with `cd android && ./gradlew clean`

## License

This project is private and proprietary.#   R e c i e p t S a v e r  
 