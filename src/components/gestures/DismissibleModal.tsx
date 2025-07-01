import React, { useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
  Modal,
} from 'react-native';
import {
  PanGestureHandler,
  State,
  PanGestureHandlerStateChangeEvent,
  PanGestureHandlerGestureEvent,
} from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { normalizePointerEvents, getAnimationConfig } from '../../utils/animatedStyleHelpers';

const { height: screenHeight } = Dimensions.get('window');
const DISMISS_THRESHOLD = 150;
const VELOCITY_THRESHOLD = 800;

interface DismissibleModalProps {
  visible: boolean;
  onDismiss: () => void;
  children: React.ReactNode;
  dismissThreshold?: number;
  velocityThreshold?: number;
  backdropOpacity?: number;
  enableSwipeDown?: boolean;
  presentationStyle?: 'pageSheet' | 'fullScreen';
}

export const DismissibleModal: React.FC<DismissibleModalProps> = ({
  visible,
  onDismiss,
  children,
  dismissThreshold = DISMISS_THRESHOLD,
  velocityThreshold = VELOCITY_THRESHOLD,
  backdropOpacity = 0.5,
  enableSwipeDown = true,
  presentationStyle = 'pageSheet',
}) => {
  // Animation values
  const translateY = useRef(new Animated.Value(screenHeight)).current;
  const backdropAnimatedOpacity = useRef(new Animated.Value(0)).current;
  const gestureTranslateY = useRef(new Animated.Value(0)).current;
  
  // Track if modal is being dismissed
  const isDismissing = useRef(false);

  // Haptic feedback
  const triggerHaptic = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  // Show/hide modal animations
  useEffect(() => {
    if (visible) {
      // Reset dismissing state
      isDismissing.current = false;
      
      // Show modal
      Animated.parallel([
        Animated.spring(translateY, getAnimationConfig({
          toValue: 0,
          tension: 65,
          friction: 11,
        })),
        Animated.timing(backdropAnimatedOpacity, getAnimationConfig({
          toValue: backdropOpacity,
          duration: 300,
        })),
      ]).start();
    } else {
      // Hide modal
      Animated.parallel([
        Animated.spring(translateY, getAnimationConfig({
          toValue: screenHeight,
          tension: 65,
          friction: 11,
        })),
        Animated.timing(backdropAnimatedOpacity, getAnimationConfig({
          toValue: 0,
          duration: 300,
        })),
      ]).start();
    }
  }, [visible]);

  // Handle pan gesture
  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationY: gestureTranslateY } }],
    getAnimationConfig()
  );

  const onHandlerStateChange = (event: PanGestureHandlerStateChangeEvent) => {
    if (event.nativeEvent.state === State.END) {
      const { translationY, velocityY } = event.nativeEvent;
      
      // Determine if we should dismiss
      const shouldDismiss = 
        translationY > dismissThreshold || 
        (velocityY > velocityThreshold && translationY > 50);
      
      if (shouldDismiss && !isDismissing.current) {
        // Dismiss modal
        isDismissing.current = true;
        triggerHaptic();
        
        Animated.parallel([
          Animated.spring(translateY, getAnimationConfig({
            toValue: screenHeight,
            velocity: velocityY,
            tension: 65,
            friction: 11,
          })),
          Animated.timing(backdropAnimatedOpacity, getAnimationConfig({
            toValue: 0,
            duration: 300,
          })),
        ]).start(() => {
          gestureTranslateY.setValue(0);
          onDismiss();
        });
      } else {
        // Snap back to position
        Animated.spring(gestureTranslateY, getAnimationConfig({
          toValue: 0,
          tension: 65,
          friction: 11,
        })).start();
      }
    }
  };

  // Combined transform
  const modalTransform = Animated.add(translateY, gestureTranslateY);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'black',
    },
    modalContainer: {
      flex: 1,
      justifyContent: presentationStyle === 'pageSheet' ? 'flex-end' : 'center',
    },
    modalContent: {
      backgroundColor: 'white',
      borderTopLeftRadius: presentationStyle === 'pageSheet' ? 20 : 0,
      borderTopRightRadius: presentationStyle === 'pageSheet' ? 20 : 0,
      overflow: 'hidden',
      ...(presentationStyle === 'fullScreen' && { flex: 1 }),
    },
    handle: {
      width: 36,
      height: 5,
      backgroundColor: '#E0E0E0',
      borderRadius: 3,
      alignSelf: 'center',
      marginTop: 8,
      marginBottom: 8,
    },
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onDismiss}
    >
      <View style={styles.container}>
        {/* Backdrop */}
        <Animated.View
          style={[
            styles.backdrop,
            { opacity: backdropAnimatedOpacity },
            { pointerEvents: visible ? 'auto' : 'none' },
          ]}
          onTouchEnd={onDismiss}
        />
        
        {/* Modal Content */}
        <View style={[styles.modalContainer, { pointerEvents: 'box-none' }]}>
          <PanGestureHandler
            onGestureEvent={enableSwipeDown ? onGestureEvent : undefined}
            onHandlerStateChange={enableSwipeDown ? onHandlerStateChange : undefined}
            enabled={enableSwipeDown && visible}
            activeOffsetY={10}
            failOffsetX={[-10, 10]}
          >
            <Animated.View
              style={[
                styles.modalContent,
                {
                  transform: [{ translateY: modalTransform }],
                },
              ]}
            >
              {/* Drag Handle */}
              {enableSwipeDown && presentationStyle === 'pageSheet' && (
                <View style={styles.handle} />
              )}
              
              {children}
            </Animated.View>
          </PanGestureHandler>
        </View>
      </View>
    </Modal>
  );
};

export default DismissibleModal;