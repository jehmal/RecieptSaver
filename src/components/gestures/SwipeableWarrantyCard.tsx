import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Platform,
  Dimensions,
} from 'react-native';
import {
  RectButton,
  Swipeable,
} from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

const { width: screenWidth } = Dimensions.get('window');
const SWIPE_THRESHOLD = screenWidth * 0.25;
const ACTION_BUTTON_WIDTH = 75;
const MAX_SWIPE_DISTANCE = screenWidth * 0.4;

interface SwipeAction {
  type: 'renew' | 'archive' | 'delete' | 'claim' | 'share';
  color: string;
  icon: string;
  label: string;
  onPress: () => void;
}

interface SwipeableWarrantyCardProps {
  children: React.ReactNode;
  leftActions?: SwipeAction[];
  rightActions?: SwipeAction[];
  onLongPress?: () => void;
  onDoubleTap?: () => void;
  isSelectionMode?: boolean;
  swipeEnabled?: boolean;
}

export const SwipeableWarrantyCard: React.FC<SwipeableWarrantyCardProps> = ({
  children,
  leftActions = [],
  rightActions = [],
  onLongPress,
  onDoubleTap,
  isSelectionMode = false,
  swipeEnabled = true,
}) => {
  const { theme } = useTheme();
  const swipeableRef = useRef<Swipeable>(null);
  const lastTap = useRef<number>(0);

  // Haptic feedback
  const triggerHaptic = (type: 'light' | 'medium' | 'heavy' = 'light') => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(
        type === 'light' ? Haptics.ImpactFeedbackStyle.Light :
        type === 'medium' ? Haptics.ImpactFeedbackStyle.Medium :
        Haptics.ImpactFeedbackStyle.Heavy
      );
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  // Handle double tap
  const handlePress = () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (lastTap.current && (now - lastTap.current) < DOUBLE_TAP_DELAY) {
      if (onDoubleTap) {
        triggerHaptic('light');
        onDoubleTap();
      }
    }
    lastTap.current = now;
  };

  // Render left actions
  const renderLeftActions = (progress: Animated.AnimatedInterpolation<number>, dragX: Animated.AnimatedInterpolation<number>) => {
    if (leftActions.length === 0) return null;

    const totalWidth = leftActions.length * ACTION_BUTTON_WIDTH;
    
    return (
      <View style={[styles.leftActionsContainer, { width: totalWidth }]}>
        {leftActions.map((action, index) => {
          const translateX = dragX.interpolate({
            inputRange: [0, totalWidth / 2, totalWidth, totalWidth + 1],
            outputRange: [-ACTION_BUTTON_WIDTH, -ACTION_BUTTON_WIDTH / 2, 0, 0],
            extrapolate: 'clamp',
          });

          return (
            <Animated.View
              key={action.type}
              style={[
                styles.actionButton,
                {
                  backgroundColor: action.color,
                  transform: [{ translateX }],
                },
              ]}
            >
              <RectButton
                style={styles.actionContent}
                onPress={() => {
                  triggerHaptic('medium');
                  action.onPress();
                  swipeableRef.current?.close();
                }}
              >
                <Ionicons name={action.icon as any} size={24} color="#FFFFFF" />
                <Text style={styles.actionText}>{action.label}</Text>
              </RectButton>
            </Animated.View>
          );
        })}
      </View>
    );
  };

  // Render right actions
  const renderRightActions = (progress: Animated.AnimatedInterpolation<number>, dragX: Animated.AnimatedInterpolation<number>) => {
    if (rightActions.length === 0) return null;

    const totalWidth = rightActions.length * ACTION_BUTTON_WIDTH;
    
    return (
      <View style={[styles.rightActionsContainer, { width: totalWidth }]}>
        {rightActions.map((action, index) => {
          const translateX = dragX.interpolate({
            inputRange: [-totalWidth - 1, -totalWidth, -totalWidth / 2, 0],
            outputRange: [0, 0, ACTION_BUTTON_WIDTH / 2, ACTION_BUTTON_WIDTH],
            extrapolate: 'clamp',
          });

          return (
            <Animated.View
              key={action.type}
              style={[
                styles.actionButton,
                {
                  backgroundColor: action.color,
                  transform: [{ translateX }],
                },
              ]}
            >
              <RectButton
                style={styles.actionContent}
                onPress={() => {
                  triggerHaptic('medium');
                  action.onPress();
                  swipeableRef.current?.close();
                }}
              >
                <Ionicons name={action.icon as any} size={24} color="#FFFFFF" />
                <Text style={styles.actionText}>{action.label}</Text>
              </RectButton>
            </Animated.View>
          );
        })}
      </View>
    );
  };

  // Handle swipe events
  const handleSwipeableOpen = (direction: 'left' | 'right') => {
    triggerHaptic('medium');
  };

  const handleSwipeableWillOpen = (direction: 'left' | 'right') => {
    triggerHaptic('light');
  };

  const styles = StyleSheet.create({
    leftActionsContainer: {
      flexDirection: 'row',
      overflow: 'hidden',
    },
    rightActionsContainer: {
      flexDirection: 'row',
      overflow: 'hidden',
    },
    actionButton: {
      justifyContent: 'center',
      alignItems: 'center',
      width: ACTION_BUTTON_WIDTH,
      height: '100%',
    },
    actionContent: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 8,
    },
    actionText: {
      color: '#FFFFFF',
      fontSize: 11,
      fontWeight: '600',
      marginTop: 2,
    },
  });

  // When swipe is disabled, render children directly
  if (!swipeEnabled || isSelectionMode) {
    return <>{children}</>;
  }

  return (
    <Swipeable
      ref={swipeableRef}
      friction={2}
      leftThreshold={SWIPE_THRESHOLD}
      rightThreshold={SWIPE_THRESHOLD}
      overshootLeft={false}
      overshootRight={false}
      overshootFriction={8}
      renderLeftActions={renderLeftActions}
      renderRightActions={renderRightActions}
      onSwipeableOpen={handleSwipeableOpen}
      onSwipeableWillOpen={handleSwipeableWillOpen}
      enabled={true}
    >
      <RectButton
        onPress={handlePress}
        onLongPress={() => {
          if (onLongPress) {
            triggerHaptic('heavy');
            onLongPress();
          }
        }}
        rippleColor={theme.colors.surfaceLight}
        underlayColor={theme.colors.surfaceLight}
      >
        {children}
      </RectButton>
    </Swipeable>
  );
};

export default SwipeableWarrantyCard;