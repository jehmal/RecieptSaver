import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import {
  PanGestureHandler,
  State,
  PanGestureHandlerStateChangeEvent,
  PanGestureHandlerGestureEvent,
  LongPressGestureHandler,
  LongPressGestureHandlerStateChangeEvent,
} from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface MultiSelectGestureProps {
  children: React.ReactNode;
  onSelectionStart?: () => void;
  onSelectionChange?: (selectedIndices: number[]) => void;
  onSelectionEnd?: (selectedIndices: number[]) => void;
  itemHeight: number;
  totalItems: number;
  enabled?: boolean;
}

export const MultiSelectGesture: React.FC<MultiSelectGestureProps> = ({
  children,
  onSelectionStart,
  onSelectionChange,
  onSelectionEnd,
  itemHeight,
  totalItems,
  enabled = true,
}) => {
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  
  // Animation values
  const selectionOpacity = useRef(new Animated.Value(0)).current;
  const selectionHeight = useRef(new Animated.Value(0)).current;
  const selectionY = useRef(new Animated.Value(0)).current;
  
  // Gesture state
  const gestureState = useRef({
    startY: 0,
    currentY: 0,
    startIndex: -1,
    endIndex: -1,
  });

  // Haptic feedback
  const triggerHaptic = (type: 'light' | 'medium' | 'heavy' = 'light') => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(
        type === 'light' ? Haptics.ImpactFeedbackStyle.Light :
        type === 'medium' ? Haptics.ImpactFeedbackStyle.Medium :
        Haptics.ImpactFeedbackStyle.Heavy
      );
    } else {
      Haptics.selectionAsync();
    }
  };

  // Calculate item index from Y position
  const getItemIndex = (y: number): number => {
    return Math.floor(y / itemHeight);
  };

  // Update selection range
  const updateSelection = useCallback((startY: number, endY: number) => {
    const startIndex = Math.max(0, Math.min(totalItems - 1, getItemIndex(startY)));
    const endIndex = Math.max(0, Math.min(totalItems - 1, getItemIndex(endY)));
    
    const minIndex = Math.min(startIndex, endIndex);
    const maxIndex = Math.max(startIndex, endIndex);
    
    // Create new selection set
    const newSelection = new Set<number>();
    for (let i = minIndex; i <= maxIndex; i++) {
      newSelection.add(i);
    }
    
    // Check if selection changed
    const changed = newSelection.size !== selectedIndices.size ||
      [...newSelection].some(i => !selectedIndices.has(i));
    
    if (changed) {
      setSelectedIndices(newSelection);
      onSelectionChange?.([...newSelection]);
      triggerHaptic('light');
    }
    
    // Update visual selection indicator
    const selectionTop = minIndex * itemHeight;
    const selectionSize = (maxIndex - minIndex + 1) * itemHeight;
    
    selectionY.setValue(selectionTop);
    selectionHeight.setValue(selectionSize);
  }, [selectedIndices, itemHeight, totalItems, onSelectionChange]);

  // Handle long press to start selection
  const onLongPressHandlerStateChange = (event: LongPressGestureHandlerStateChangeEvent) => {
    if (event.nativeEvent.state === State.ACTIVE) {
      const { y } = event.nativeEvent;
      setIsSelecting(true);
      gestureState.current.startY = y;
      gestureState.current.currentY = y;
      
      triggerHaptic('heavy');
      onSelectionStart?.();
      
      // Show selection indicator
      Animated.timing(selectionOpacity, {
        toValue: 0.2,
        duration: 200,
        useNativeDriver: true,
      }).start();
      
      // Initialize selection with current item
      updateSelection(y, y);
    }
  };

  // Handle pan gesture for multi-select
  const onPanGestureEvent = (event: PanGestureHandlerGestureEvent) => {
    if (!isSelecting) return;
    
    const { y } = event.nativeEvent;
    gestureState.current.currentY = y;
    updateSelection(gestureState.current.startY, y);
  };

  const onPanHandlerStateChange = (event: PanGestureHandlerStateChangeEvent) => {
    if (event.nativeEvent.state === State.END && isSelecting) {
      // End selection
      setIsSelecting(false);
      triggerHaptic('medium');
      onSelectionEnd?.([...selectedIndices]);
      
      // Hide selection indicator
      Animated.timing(selectionOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setSelectedIndices(new Set());
        selectionHeight.setValue(0);
      });
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    selectionIndicator: {
      position: 'absolute',
      left: 0,
      right: 0,
      backgroundColor: '#007AFF',
      zIndex: 10,
    },
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.selectionIndicator,
          {
            opacity: selectionOpacity,
            height: selectionHeight,
            transform: [{ translateY: selectionY }],
          },
        ]}
        pointerEvents="none"
      />
      
      <LongPressGestureHandler
        onHandlerStateChange={onLongPressHandlerStateChange}
        enabled={enabled}
        minDurationMs={500}
      >
        <Animated.View style={styles.container}>
          <PanGestureHandler
            onGestureEvent={onPanGestureEvent}
            onHandlerStateChange={onPanHandlerStateChange}
            enabled={isSelecting}
            shouldCancelWhenOutside={false}
          >
            <Animated.View style={styles.container}>
              {children}
            </Animated.View>
          </PanGestureHandler>
        </Animated.View>
      </LongPressGestureHandler>
    </View>
  );
};

export default MultiSelectGesture;