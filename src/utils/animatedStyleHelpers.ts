import { Animated, Platform, ViewStyle, TextStyle, ImageStyle } from 'react-native';

/**
 * Safely interpolates animated values to prevent toFixed errors
 * This wrapper ensures opacity values are properly bounded between 0 and 1
 */
export function safeInterpolate(
  animatedValue: Animated.Value,
  config: {
    inputRange: number[];
    outputRange: number[];
    extrapolate?: 'extend' | 'clamp' | 'identity';
  }
): Animated.AnimatedInterpolation {
  // Ensure output values are valid numbers
  const safeOutputRange = config.outputRange.map(value => {
    if (typeof value !== 'number' || isNaN(value) || !isFinite(value)) {
      return 0;
    }
    return value;
  });

  return animatedValue.interpolate({
    ...config,
    outputRange: safeOutputRange,
    extrapolate: config.extrapolate || 'clamp',
  });
}

/**
 * Creates a safe opacity animated value
 * Ensures the value is always between 0 and 1
 */
export function createSafeOpacityValue(initialValue: number = 1): Animated.Value {
  const safeInitial = Math.max(0, Math.min(1, initialValue));
  return new Animated.Value(safeInitial);
}

/**
 * Animates opacity safely
 */
export function animateOpacity(
  animatedValue: Animated.Value,
  toValue: number,
  duration: number = 300,
  callback?: () => void
): void {
  const safeToValue = Math.max(0, Math.min(1, toValue));
  
  Animated.timing(animatedValue, {
    toValue: safeToValue,
    duration,
    useNativeDriver: Platform.OS !== 'web', // Disable native driver on web
  }).start(callback);
}

/**
 * Platform-aware animation configuration
 * Automatically disables native driver on web platform
 */
export const getAnimationConfig = (config: any = {}) => {
  const webDefaults = {
    useNativeDriver: false,
  };
  
  const nativeDefaults = {
    useNativeDriver: true,
  };
  
  const platformDefaults = Platform.OS === 'web' ? webDefaults : nativeDefaults;
  
  return {
    ...platformDefaults,
    ...config,
    // Force useNativeDriver to false on web even if explicitly set
    ...(Platform.OS === 'web' ? { useNativeDriver: false } : {}),
  };
};

/**
 * Helper to move pointerEvents from props to style
 * React Native Web deprecated pointerEvents as a prop
 */
export const normalizePointerEvents = <T extends ViewStyle | TextStyle | ImageStyle>(
  props: any,
  style?: T
): { props: any; style: T } => {
  if (Platform.OS === 'web' && props.pointerEvents) {
    const { pointerEvents, ...restProps } = props;
    return {
      props: restProps,
      style: {
        ...style,
        pointerEvents,
      } as T,
    };
  }
  
  return { props, style: style || {} as T };
};

/**
 * Common animation configs with platform support
 */
export const AnimationConfigs = {
  // Fade animations
  fade: getAnimationConfig({
    duration: 200,
    useNativeDriver: true,
  }),
  
  // Slide animations
  slide: getAnimationConfig({
    duration: 300,
    useNativeDriver: true,
  }),
  
  // Spring animations
  spring: getAnimationConfig({
    friction: 7,
    tension: 40,
    useNativeDriver: true,
  }),
  
  // Scale animations
  scale: getAnimationConfig({
    duration: 200,
    useNativeDriver: true,
  }),
  
  // Layout animations (always false for useNativeDriver)
  layout: {
    duration: 300,
    useNativeDriver: false, // Layout animations can't use native driver
  },
};

/**
 * Helper to create platform-aware animated timing config
 */
export const createTimingConfig = (
  duration: number = 300,
  additionalConfig: any = {}
) => {
  return getAnimationConfig({
    duration,
    ...additionalConfig,
  });
};

/**
 * Helper to create platform-aware spring config
 */
export const createSpringConfig = (
  friction: number = 7,
  tension: number = 40,
  additionalConfig: any = {}
) => {
  return getAnimationConfig({
    friction,
    tension,
    ...additionalConfig,
  });
};

/**
 * Debug helper for animation warnings
 */
export const debugAnimationWarning = (component: string, animationType: string) => {
  if (__DEV__ && Platform.OS === 'web') {
    console.log(`[AnimationHelper] ${component}: Using non-native driver for ${animationType} animation on web`);
  }
};