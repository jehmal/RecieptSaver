import React, { useRef, useCallback } from 'react';
import {
  Pressable,
  Animated,
  ViewStyle,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';

interface LongPressWrapperProps {
  children: React.ReactNode;
  onLongPress: () => void;
  onPress?: () => void;
  disabled?: boolean;
  style?: ViewStyle;
  delayLongPress?: number;
}

export const LongPressWrapper: React.FC<LongPressWrapperProps> = ({
  children,
  onLongPress,
  onPress,
  disabled = false,
  style,
  delayLongPress = 400,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    // Start scale animation for visual feedback
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0.97,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0.8,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scaleAnim, opacityAnim]);

  const handlePressOut = useCallback(() => {
    // Reset animations
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 40,
        friction: 7,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scaleAnim, opacityAnim]);

  const handleLongPress = useCallback(() => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
    
    // Animate scale back before calling onLongPress
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 40,
      friction: 7,
    }).start(() => {
      onLongPress();
    });
  }, [scaleAnim, onLongPress]);

  const handlePress = useCallback(() => {
    if (onPress) {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      onPress();
    }
  }, [onPress]);

  return (
    <Pressable
      onPress={handlePress}
      onLongPress={handleLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      delayLongPress={delayLongPress}
      disabled={disabled}
    >
      <Animated.View
        style={[
          style,
          {
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          },
        ]}
      >
        {children}
      </Animated.View>
    </Pressable>
  );
};

export default LongPressWrapper;