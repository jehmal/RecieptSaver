import React, { useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import {
  PinchGestureHandler,
  PanGestureHandler,
  TapGestureHandler,
  State,
  PinchGestureHandlerStateChangeEvent,
  PanGestureHandlerStateChangeEvent,
  TapGestureHandlerStateChangeEvent,
} from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface PinchZoomViewProps {
  children: React.ReactNode;
  minZoom?: number;
  maxZoom?: number;
  doubleTapZoom?: number;
  enablePinch?: boolean;
  enablePan?: boolean;
  enableDoubleTap?: boolean;
  onZoomStart?: () => void;
  onZoomEnd?: (scale: number) => void;
}

export const PinchZoomView: React.FC<PinchZoomViewProps> = ({
  children,
  minZoom = 1,
  maxZoom = 4,
  doubleTapZoom = 2,
  enablePinch = true,
  enablePan = true,
  enableDoubleTap = true,
  onZoomStart,
  onZoomEnd,
}) => {
  // Animation values
  const scale = useRef(new Animated.Value(1)).current;
  const baseScale = useRef(new Animated.Value(1)).current;
  const pinchScale = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const lastTranslateX = useRef(0);
  const lastTranslateY = useRef(0);
  
  // State
  const [isZoomed, setIsZoomed] = useState(false);
  const currentScale = useRef(1);

  // Refs for gesture handlers
  const pinchRef = useRef(null);
  const panRef = useRef(null);
  const doubleTapRef = useRef(null);

  // Combined scale value
  const animatedScale = Animated.multiply(baseScale, pinchScale);

  // Haptic feedback
  const triggerHaptic = (type: 'light' | 'medium' = 'light') => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(
        type === 'light' ? Haptics.ImpactFeedbackStyle.Light :
        Haptics.ImpactFeedbackStyle.Medium
      );
    }
  };

  // Handle pinch gesture
  const onPinchGestureEvent = Animated.event(
    [{ nativeEvent: { scale: pinchScale } }],
    { useNativeDriver: true }
  );

  const onPinchHandlerStateChange = (event: PinchGestureHandlerStateChangeEvent) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      // Calculate new scale
      const newScale = currentScale.current * event.nativeEvent.scale;
      const clampedScale = Math.max(minZoom, Math.min(maxZoom, newScale));
      
      currentScale.current = clampedScale;
      setIsZoomed(clampedScale > 1);

      // Animate to new scale
      Animated.parallel([
        Animated.spring(baseScale, {
          toValue: clampedScale,
          useNativeDriver: true,
          tension: 40,
          friction: 7,
        }),
        Animated.spring(pinchScale, {
          toValue: 1,
          useNativeDriver: true,
          tension: 40,
          friction: 7,
        }),
      ]).start();

      // Reset translation if zooming out completely
      if (clampedScale === 1) {
        Animated.parallel([
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }),
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
          }),
        ]).start();
        lastTranslateX.current = 0;
        lastTranslateY.current = 0;
      }

      triggerHaptic('light');
      onZoomEnd?.(clampedScale);
    } else if (event.nativeEvent.state === State.BEGAN) {
      onZoomStart?.();
    }
  };

  // Handle pan gesture
  const onPanGestureEvent = Animated.event(
    [
      {
        nativeEvent: {
          translationX: translateX,
          translationY: translateY,
        },
      },
    ],
    { useNativeDriver: true }
  );

  const onPanHandlerStateChange = (event: PanGestureHandlerStateChangeEvent) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      // Calculate boundaries based on zoom level
      const maxTranslateX = (screenWidth * (currentScale.current - 1)) / 2;
      const maxTranslateY = (screenHeight * (currentScale.current - 1)) / 2;

      // Clamp translation values
      const clampedX = Math.max(-maxTranslateX, Math.min(maxTranslateX, 
        lastTranslateX.current + event.nativeEvent.translationX));
      const clampedY = Math.max(-maxTranslateY, Math.min(maxTranslateY, 
        lastTranslateY.current + event.nativeEvent.translationY));

      lastTranslateX.current = clampedX;
      lastTranslateY.current = clampedY;

      // Animate to clamped position
      Animated.parallel([
        Animated.spring(translateX, {
          toValue: clampedX,
          useNativeDriver: true,
          tension: 40,
          friction: 7,
        }),
        Animated.spring(translateY, {
          toValue: clampedY,
          useNativeDriver: true,
          tension: 40,
          friction: 7,
        }),
      ]).start();
    }
  };

  // Handle double tap
  const onDoubleTapHandlerStateChange = (event: TapGestureHandlerStateChangeEvent) => {
    if (event.nativeEvent.state === State.ACTIVE) {
      triggerHaptic('medium');
      
      const targetScale = isZoomed ? 1 : doubleTapZoom;
      currentScale.current = targetScale;
      setIsZoomed(targetScale > 1);

      if (targetScale === 1) {
        // Reset everything when zooming out
        Animated.parallel([
          Animated.spring(baseScale, {
            toValue: 1,
            useNativeDriver: true,
            tension: 40,
            friction: 7,
          }),
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }),
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
          }),
        ]).start();
        lastTranslateX.current = 0;
        lastTranslateY.current = 0;
      } else {
        // Zoom to tap location
        const { x, y } = event.nativeEvent;
        const offsetX = (screenWidth / 2 - x) * (targetScale - 1);
        const offsetY = (screenHeight / 2 - y) * (targetScale - 1);

        Animated.parallel([
          Animated.spring(baseScale, {
            toValue: targetScale,
            useNativeDriver: true,
            tension: 40,
            friction: 7,
          }),
          Animated.spring(translateX, {
            toValue: offsetX,
            useNativeDriver: true,
          }),
          Animated.spring(translateY, {
            toValue: offsetY,
            useNativeDriver: true,
          }),
        ]).start();
        
        lastTranslateX.current = offsetX;
        lastTranslateY.current = offsetY;
      }

      onZoomEnd?.(targetScale);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      overflow: 'hidden',
    },
  });

  return (
    <View style={styles.container}>
      <PanGestureHandler
        ref={panRef}
        onGestureEvent={enablePan && isZoomed ? onPanGestureEvent : undefined}
        onHandlerStateChange={enablePan && isZoomed ? onPanHandlerStateChange : undefined}
        enabled={enablePan && isZoomed}
        simultaneousHandlers={[pinchRef, doubleTapRef]}
      >
        <Animated.View>
          <PinchGestureHandler
            ref={pinchRef}
            onGestureEvent={enablePinch ? onPinchGestureEvent : undefined}
            onHandlerStateChange={enablePinch ? onPinchHandlerStateChange : undefined}
            enabled={enablePinch}
            simultaneousHandlers={[panRef, doubleTapRef]}
          >
            <Animated.View>
              <TapGestureHandler
                ref={doubleTapRef}
                onHandlerStateChange={enableDoubleTap ? onDoubleTapHandlerStateChange : undefined}
                numberOfTaps={2}
                enabled={enableDoubleTap}
              >
                <Animated.View
                  style={{
                    transform: [
                      { scale: animatedScale },
                      { translateX },
                      { translateY },
                    ],
                  }}
                >
                  {children}
                </Animated.View>
              </TapGestureHandler>
            </Animated.View>
          </PinchGestureHandler>
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
};

export default PinchZoomView;