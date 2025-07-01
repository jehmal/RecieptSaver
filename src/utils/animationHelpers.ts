import { Platform } from 'react-native';

/**
 * Cross-platform animation configuration helper
 * Automatically disables native driver on web platform
 */
export const createAnimationConfig = (config: any = {}) => {
  return {
    ...config,
    // Disable native driver on web to prevent warnings
    useNativeDriver: Platform.OS !== 'web' && (config.useNativeDriver ?? true),
  };
};

/**
 * Helper for timing animations with platform-specific native driver
 */
export const createTimingConfig = (
  toValue: number,
  duration: number = 300,
  additionalConfig: any = {}
) => {
  return createAnimationConfig({
    toValue,
    duration,
    ...additionalConfig,
  });
};

/**
 * Helper for spring animations with platform-specific native driver
 */
export const createSpringConfig = (
  toValue: number,
  additionalConfig: any = {}
) => {
  return createAnimationConfig({
    toValue,
    ...additionalConfig,
  });
};