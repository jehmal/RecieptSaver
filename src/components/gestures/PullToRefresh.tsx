import React, { useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Platform,
  ActivityIndicator,
} from 'react-native';
import {
  PanGestureHandler,
  State,
  PanGestureHandlerStateChangeEvent,
  PanGestureHandlerGestureEvent,
} from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../contexts/ThemeContext';

const REFRESH_THRESHOLD = 80;
const MAX_PULL_DISTANCE = 120;

interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void>;
  enabled?: boolean;
  refreshing?: boolean;
  tintColor?: string;
  title?: string;
  titleColor?: string;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  children,
  onRefresh,
  enabled = true,
  refreshing = false,
  tintColor,
  title,
  titleColor,
}) => {
  const { theme } = useTheme();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  
  // Animation values
  const translateY = useRef(new Animated.Value(0)).current;
  const pullDistance = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const rotation = useRef(new Animated.Value(0)).current;
  
  // Track gesture state
  const gestureState = useRef({
    startY: 0,
    isPulling: false,
  });

  // Haptic feedback
  const triggerHaptic = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    triggerHaptic();
    
    // Animate to loading position
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: REFRESH_THRESHOLD,
        useNativeDriver: true,
        tension: 40,
        friction: 7,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    try {
      await onRefresh();
    } finally {
      // Animate back to original position
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 40,
          friction: 7,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setIsRefreshing(false);
        setIsPulling(false);
      });
    }
  };

  // Handle pan gesture
  const onGestureEvent = (event: PanGestureHandlerGestureEvent) => {
    const { translationY } = event.nativeEvent;
    
    if (translationY > 0 && !isRefreshing) {
      // Calculate pull progress
      const progress = Math.min(translationY / REFRESH_THRESHOLD, 1.5);
      const clampedTranslation = Math.min(translationY, MAX_PULL_DISTANCE);
      
      // Update animations
      translateY.setValue(clampedTranslation * 0.5);
      pullDistance.setValue(clampedTranslation);
      opacity.setValue(Math.min(progress, 1));
      
      // Rotate refresh icon based on pull distance
      rotation.setValue(progress * 360);
      
      // Haptic feedback at threshold
      if (translationY >= REFRESH_THRESHOLD && !gestureState.current.isPulling) {
        gestureState.current.isPulling = true;
        triggerHaptic();
      } else if (translationY < REFRESH_THRESHOLD && gestureState.current.isPulling) {
        gestureState.current.isPulling = false;
      }
    }
  };

  const onHandlerStateChange = (event: PanGestureHandlerStateChangeEvent) => {
    const { state, translationY } = event.nativeEvent;
    
    if (state === State.END) {
      if (translationY >= REFRESH_THRESHOLD && !isRefreshing) {
        handleRefresh();
      } else {
        // Snap back
        Animated.parallel([
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 40,
            friction: 7,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start(() => {
          setIsPulling(false);
        });
      }
      gestureState.current.isPulling = false;
    } else if (state === State.BEGAN) {
      setIsPulling(true);
    }
  };

  const spinAnimation = rotation.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    refreshContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: REFRESH_THRESHOLD,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1,
    },
    refreshContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    refreshText: {
      fontSize: 14,
      fontWeight: '500',
      color: titleColor || theme.colors.text.secondary,
    },
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.refreshContainer,
          {
            opacity,
            transform: [{ translateY: translateY }],
          },
        ]}
      >
        <View style={styles.refreshContent}>
          {isRefreshing ? (
            <ActivityIndicator
              size="small"
              color={tintColor || theme.colors.accent.primary}
            />
          ) : (
            <Animated.View style={{ transform: [{ rotate: spinAnimation }] }}>
              <Ionicons
                name="refresh"
                size={24}
                color={tintColor || theme.colors.accent.primary}
              />
            </Animated.View>
          )}
          {title && <Animated.Text style={styles.refreshText}>{title}</Animated.Text>}
        </View>
      </Animated.View>
      
      <PanGestureHandler
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onHandlerStateChange}
        enabled={enabled && !refreshing && !isRefreshing}
        activeOffsetY={[0, 10]}
        failOffsetX={[-10, 10]}
      >
        <Animated.View
          style={[
            styles.container,
            {
              transform: [{ translateY }],
            },
          ]}
        >
          {children}
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
};

export default PullToRefresh;