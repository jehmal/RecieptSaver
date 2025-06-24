import React, { useState } from 'react';
import {
  View,
  Image,
  StyleSheet,
  ActivityIndicator,
  Text,
  Dimensions,
} from 'react-native';
import {
  PinchGestureHandler,
  TapGestureHandler,
  State,
  PinchGestureHandlerStateChangeEvent,
  TapGestureHandlerStateChangeEvent,
} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

interface ReceiptImageViewerProps {
  imageUri?: string;
  onError?: () => void;
}

const { width: screenWidth } = Dimensions.get('window');
const MAX_ZOOM = 3;
const MIN_ZOOM = 1;

const ReceiptImageViewer: React.FC<ReceiptImageViewerProps> = ({ imageUri, onError }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { theme } = useTheme();
  
  // Zoom and position values
  const scale = useSharedValue(1);
  const focalX = useSharedValue(0);
  const focalY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const handleImageLoad = () => {
    setLoading(false);
  };

  const handleImageError = () => {
    setLoading(false);
    setError(true);
    onError?.();
  };

  const handlePinchGesture = (event: PinchGestureHandlerStateChangeEvent) => {
    if (event.nativeEvent.state === State.ACTIVE) {
      scale.value = Math.min(Math.max(event.nativeEvent.scale, MIN_ZOOM), MAX_ZOOM);
      focalX.value = event.nativeEvent.focalX;
      focalY.value = event.nativeEvent.focalY;
    } else if (event.nativeEvent.state === State.END) {
      if (scale.value < MIN_ZOOM) {
        scale.value = withSpring(MIN_ZOOM);
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
    }
  };

  const handleDoubleTap = (event: TapGestureHandlerStateChangeEvent) => {
    if (event.nativeEvent.state === State.ACTIVE) {
      if (scale.value > MIN_ZOOM) {
        scale.value = withSpring(MIN_ZOOM);
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      } else {
        scale.value = withSpring(2);
        const centerX = event.nativeEvent.x - screenWidth / 2;
        const centerY = event.nativeEvent.y - 140; // Half of container height
        translateX.value = withSpring(-centerX);
        translateY.value = withSpring(-centerY);
      }
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  const styles = StyleSheet.create({
    container: {
      height: 280,
      backgroundColor: '#F5F5F7',
      borderRadius: 12,
      marginHorizontal: 16,
      marginTop: 8,
      overflow: 'hidden',
    },
    loadingContainer: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: 'center',
      alignItems: 'center',
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    errorText: {
      marginTop: 12,
      fontSize: 15,
      color: theme.colors.text.secondary,
      fontWeight: '400',
    },
    imageWrapper: {
      flex: 1,
    },
    imageContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    image: {
      width: 248,
      height: 260,
    },
  });

  if (error || !imageUri) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="document-outline" size={48} color={theme.colors.text.secondary} />
          <Text style={styles.errorText}>Image unavailable</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.text.secondary} />
        </View>
      )}
      
      <TapGestureHandler
        numberOfTaps={2}
        onHandlerStateChange={handleDoubleTap}
      >
        <Animated.View style={styles.imageWrapper}>
          <PinchGestureHandler onHandlerStateChange={handlePinchGesture}>
            <Animated.View style={[styles.imageContainer, animatedStyle]}>
              <Image
                source={{ uri: imageUri }}
                style={styles.image}
                resizeMode="contain"
                onLoad={handleImageLoad}
                onError={handleImageError}
              />
            </Animated.View>
          </PinchGestureHandler>
        </Animated.View>
      </TapGestureHandler>
    </View>
  );
};

export default ReceiptImageViewer;