import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import {
  PinchGestureHandler,
  State,
  PinchGestureHandlerStateChangeEvent,
} from 'react-native-gesture-handler';
import { createAnimationConfig, createTimingConfig, createSpringConfig } from '../../utils/animationHelpers';
// Platform-specific imports
let Haptics: any = null;
if (Platform.OS !== 'web') {
  Haptics = require('expo-haptics');
}

const { width: screenWidth } = Dimensions.get('window');

interface PinchGridViewProps {
  children: (columns: number) => React.ReactNode;
  minColumns?: number;
  maxColumns?: number;
  defaultColumns?: number;
  onColumnsChange?: (columns: number) => void;
  enabled?: boolean;
}

export const PinchGridView: React.FC<PinchGridViewProps> = ({
  children,
  minColumns = 2,
  maxColumns = 4,
  defaultColumns = 3,
  onColumnsChange,
  enabled = true,
}) => {
  const [columns, setColumns] = useState(defaultColumns);
  const [isPinching, setIsPinching] = useState(false);
  
  // Animation values
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  
  // Track pinch state
  const pinchState = useRef({
    startScale: 1,
    startColumns: defaultColumns,
  });

  // Haptic feedback
  const triggerHaptic = (type: 'light' | 'medium' | 'heavy' = 'medium') => {
    if (Platform.OS === 'web' || !Haptics) return;
    
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(
        type === 'light' ? Haptics.ImpactFeedbackStyle.Light :
        type === 'medium' ? Haptics.ImpactFeedbackStyle.Medium :
        Haptics.ImpactFeedbackStyle.Heavy
      );
    } else if (Platform.OS === 'android') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  // Calculate columns from scale
  const getColumnsFromScale = useCallback((gestureScale: number): number => {
    const { startColumns, startScale } = pinchState.current;
    const scaleRatio = gestureScale / startScale;
    
    // Determine column change based on scale
    let newColumns = startColumns;
    if (scaleRatio > 1.3) {
      // Pinch out - decrease columns (bigger items)
      newColumns = Math.max(minColumns, startColumns - 1);
    } else if (scaleRatio < 0.7) {
      // Pinch in - increase columns (smaller items)
      newColumns = Math.min(maxColumns, startColumns + 1);
    }
    
    return newColumns;
  }, [minColumns, maxColumns]);

  // Handle pinch gesture
  const onPinchHandlerStateChange = (event: PinchGestureHandlerStateChangeEvent) => {
    const { state, scale: gestureScale } = event.nativeEvent;
    
    if (state === State.BEGAN) {
      setIsPinching(true);
      pinchState.current.startScale = gestureScale;
      pinchState.current.startColumns = columns;
      
      // Show overlay
      Animated.timing(opacity, createTimingConfig(0.3, 200)).start();
    } else if (state === State.ACTIVE) {
      // Update scale animation
      const scaleValue = 0.9 + (gestureScale - 1) * 0.1; // Dampened scale
      scale.setValue(scaleValue);
      
      // Check if we should change columns
      const newColumns = getColumnsFromScale(gestureScale);
      if (newColumns !== columns) {
        setColumns(newColumns);
        triggerHaptic('medium');
        onColumnsChange?.(newColumns);
      }
    } else if (state === State.END || state === State.CANCELLED) {
      setIsPinching(false);
      
      // Animate back to normal
      Animated.parallel([
        Animated.spring(scale, createSpringConfig(1, {
          tension: 40,
          friction: 7,
        })),
        Animated.timing(opacity, createTimingConfig(0, 200)),
      ]).start();
      
      // Final haptic feedback
      const finalColumns = getColumnsFromScale(gestureScale);
      if (finalColumns !== pinchState.current.startColumns) {
        triggerHaptic('heavy');
      }
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'black',
      zIndex: 10,
    },
    gridContainer: {
      flex: 1,
    },
    columnIndicator: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: [{ translateX: -50 }, { translateY: -50 }],
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 20,
      zIndex: 20,
    },
    columnText: {
      color: 'white',
      fontSize: 18,
      fontWeight: '600',
    },
  });

  return (
    <View style={styles.container}>
      {/* Overlay for visual feedback */}
      <Animated.View
        style={[
          styles.overlay,
          { opacity, pointerEvents: 'none' },
        ]}
      />
      
      {/* Column indicator */}
      {isPinching && (
        <View style={styles.columnIndicator}>
          <Animated.Text style={styles.columnText}>
            {columns} {columns === 1 ? 'Column' : 'Columns'}
          </Animated.Text>
        </View>
      )}
      
      {Platform.OS === 'web' ? (
        // On web, just render the grid without gesture handling
        <View style={styles.gridContainer}>
          {children(columns)}
        </View>
      ) : (
        <PinchGestureHandler
          onHandlerStateChange={onPinchHandlerStateChange}
          enabled={enabled}
        >
          <Animated.View
            style={[
              styles.gridContainer,
              {
                transform: [{ scale }],
              },
            ]}
          >
            {children(columns)}
          </Animated.View>
        </PinchGestureHandler>
      )}
    </View>
  );
};

export default PinchGridView;