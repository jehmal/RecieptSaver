// Add any global test setup here
import '@testing-library/jest-native/extend-expect';

// Mock expo modules that might cause issues in tests
jest.mock('expo-camera', () => ({
  Camera: jest.fn(),
  CameraType: {
    back: 'back',
    front: 'front'
  },
  FlashMode: {
    off: 'off',
    on: 'on',
    auto: 'auto'
  }
}));

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy'
  }
}));

jest.mock('expo-blur', () => ({
  BlurView: 'BlurView'
}));

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Silence the warning: Animated: `useNativeDriver` is not supported
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);