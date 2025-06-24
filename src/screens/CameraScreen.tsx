import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { Camera, CameraType, FlashMode } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

// Get device dimensions
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const isTablet = screenWidth > 768;

// TypeScript interfaces
interface CameraState {
  hasPermission: boolean;
  isFlashOn: boolean;
  isCapturing: boolean;
  edgesDetected: boolean;
  countdownValue: number | null;
  lastCapture: string | null;
}

interface EdgeCorner {
  top: number;
  left: number;
  right: number;
  bottom: number;
}

const CameraScreen: React.FC = () => {
  const { theme, themeMode } = useTheme();
  
  // State management
  const [state, setState] = useState<CameraState>({
    hasPermission: false,
    isFlashOn: false,
    isCapturing: false,
    edgesDetected: false,
    countdownValue: null,
    lastCapture: null,
  });

  // Refs
  const cameraRef = useRef<Camera>(null);
  const countdownInterval = useRef<NodeJS.Timeout | null>(null);

  // Animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const flashAnim = useRef(new Animated.Value(0)).current;
  const captureScaleAnim = useRef(new Animated.Value(1)).current;
  const cornerOpacity = useRef(new Animated.Value(0)).current;
  const capturedImageScale = useRef(new Animated.Value(1)).current;
  const capturedImageOpacity = useRef(new Animated.Value(0)).current;

  // Request camera permissions on mount
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setState((prev) => ({ ...prev, hasPermission: status === 'granted' }));
    })();
  }, []);

  // Edge detection pulse animation
  useEffect(() => {
    if (state.edgesDetected) {
      // Start pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Show corners
      Animated.timing(cornerOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Start countdown if auto-capture is enabled
      startCountdown();
    } else {
      // Hide corners and stop animations
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
      Animated.timing(cornerOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Cancel countdown
      if (countdownInterval.current) {
        clearInterval(countdownInterval.current);
        setState((prev) => ({ ...prev, countdownValue: null }));
      }
    }
  }, [state.edgesDetected]);

  // Mock edge detection (in real app, this would use ML/CV)
  useEffect(() => {
    const mockEdgeDetection = setInterval(() => {
      if (!state.isCapturing && !state.countdownValue) {
        // Randomly detect edges for demo
        const detected = Math.random() > 0.7;
        setState((prev) => ({ ...prev, edgesDetected: detected }));
      }
    }, 2000);

    return () => clearInterval(mockEdgeDetection);
  }, [state.isCapturing, state.countdownValue]);

  // Start countdown for auto-capture
  const startCountdown = () => {
    let count = 3;
    setState((prev) => ({ ...prev, countdownValue: count }));

    countdownInterval.current = setInterval(() => {
      count--;
      if (count === 0) {
        clearInterval(countdownInterval.current!);
        setState((prev) => ({ ...prev, countdownValue: null }));
        handleCapture();
      } else {
        setState((prev) => ({ ...prev, countdownValue: count }));
      }
    }, 1000);
  };

  // Cancel countdown
  const cancelCountdown = () => {
    if (countdownInterval.current) {
      clearInterval(countdownInterval.current);
      setState((prev) => ({ ...prev, countdownValue: null, edgesDetected: false }));
    }
  };

  // Handle capture
  const handleCapture = async () => {
    if (cameraRef.current && !state.isCapturing) {
      setState((prev) => ({ ...prev, isCapturing: true }));

      // Haptic feedback
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      // Shutter animation
      Animated.sequence([
        Animated.timing(flashAnim, {
          toValue: 1,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(flashAnim, {
          toValue: 0,
          duration: 50,
          useNativeDriver: true,
        }),
      ]).start();

      // Capture button animation
      Animated.sequence([
        Animated.timing(captureScaleAnim, {
          toValue: 0.8,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(captureScaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();

      try {
        // Take picture
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: false,
          skipProcessing: false,
        });

        // Animate captured image to corner
        setState((prev) => ({ ...prev, lastCapture: photo.uri }));
        
        Animated.parallel([
          Animated.timing(capturedImageOpacity, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(capturedImageScale, {
            toValue: 0.2,
            duration: 500,
            useNativeDriver: true,
          }),
        ]).start(() => {
          // Reset after animation
          setTimeout(() => {
            capturedImageOpacity.setValue(0);
            capturedImageScale.setValue(1);
          }, 1000);
        });

        // Process the captured image
        console.log('Photo captured:', photo.uri);
        // Here you would typically save the image and navigate to detail screen
      } catch (error) {
        console.error('Error capturing photo:', error);
      } finally {
        setState((prev) => ({ ...prev, isCapturing: false, edgesDetected: false }));
      }
    }
  };

  // Toggle flash
  const toggleFlash = () => {
    setState((prev) => ({ ...prev, isFlashOn: !prev.isFlashOn }));
  };

  // Navigate to gallery
  const navigateToGallery = () => {
    console.log('Navigate to gallery');
    // Navigation logic would go here
  };

  // Close camera (if not default screen)
  const closeCamera = () => {
    console.log('Close camera');
    // Navigation logic would go here
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    camera: {
      flex: 1,
      width: '100%',
    },
    tabletCamera: {
      width: screenWidth > 1024 ? screenWidth * 0.6 : screenWidth * 0.8,
      height: (screenWidth > 1024 ? screenWidth * 0.6 : screenWidth * 0.8) * (4 / 3),
      maxWidth: 800,
      maxHeight: 600,
    },
    flashOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: theme.colors.background,
    },
    topControls: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingTop: Platform.OS === 'ios' ? 0 : StatusBar.currentHeight || 24,
    },
    rightControls: {
      flexDirection: 'row',
      gap: 12,
    },
    controlButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: theme.colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
      ...theme.shadows.sm,
    },
    captureButtonContainer: {
      position: 'absolute',
      bottom: 32,
      alignSelf: 'center',
    },
    captureButton: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: theme.colors.surface,
      padding: 4,
      ...theme.shadows.lg,
    },
    captureButtonTablet: {
      width: 100,
      height: 100,
      borderRadius: 50,
    },
    captureButtonInner: {
      flex: 1,
      borderRadius: 50,
      backgroundColor: theme.colors.accent.primary,
      borderWidth: 2,
      borderColor: theme.colors.card.border,
    },
    edgeDetectionContainer: {
      ...StyleSheet.absoluteFillObject,
      margin: 32,
    },
    cornerTL: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: 60,
      height: 60,
      borderTopWidth: 4,
      borderLeftWidth: 4,
      borderColor: theme.colors.accent.success,
      borderTopLeftRadius: 16,
    },
    cornerTR: {
      position: 'absolute',
      top: 0,
      right: 0,
      width: 60,
      height: 60,
      borderTopWidth: 4,
      borderRightWidth: 4,
      borderColor: theme.colors.accent.success,
      borderTopRightRadius: 16,
    },
    cornerBL: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      width: 60,
      height: 60,
      borderBottomWidth: 4,
      borderLeftWidth: 4,
      borderColor: theme.colors.accent.success,
      borderBottomLeftRadius: 16,
    },
    cornerBR: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      width: 60,
      height: 60,
      borderBottomWidth: 4,
      borderRightWidth: 4,
      borderColor: theme.colors.accent.success,
      borderBottomRightRadius: 16,
    },
    helperTextContainer: {
      position: 'absolute',
      top: '50%',
      left: 0,
      right: 0,
      alignItems: 'center',
    },
    helperText: {
      color: theme.colors.text.primary,
      fontSize: 16,
      fontWeight: '600',
      textShadowColor: theme.colors.shadow,
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 4,
    },
    countdownOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    countdownText: {
      fontSize: 120,
      fontWeight: 'bold',
      color: theme.colors.text.primary,
    },
    countdownSubtext: {
      fontSize: 18,
      color: theme.colors.text.secondary,
      marginTop: 16,
    },
    capturedImage: {
      ...StyleSheet.absoluteFillObject,
      resizeMode: 'cover',
    },
    permissionText: {
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 8,
    },
    permissionSubtext: {
      fontSize: 14,
      textAlign: 'center',
      paddingHorizontal: 32,
    },
  });

  // Render loading or permission denied
  if (state.hasPermission === null) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.accent.primary} />
      </View>
    );
  }

  if (state.hasPermission === false) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.permissionText, { color: theme.colors.text.primary }]}>No access to camera</Text>
        <Text style={[styles.permissionSubtext, { color: theme.colors.text.secondary }]}>
          Please grant camera permissions in your device settings
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: '#000' }]}>
      <StatusBar barStyle="light-content" />
      
      {/* Camera View */}
      <Camera
        ref={cameraRef}
        style={isTablet ? styles.tabletCamera : styles.camera}
        type={CameraType.back}
        flashMode={state.isFlashOn ? FlashMode.on : FlashMode.off}
      >
        {/* Flash overlay for shutter effect */}
        <Animated.View
          style={[
            styles.flashOverlay,
            {
              opacity: flashAnim,
            },
          ]}
          pointerEvents="none"
        />

        {/* Top Controls */}
        <SafeAreaView style={styles.topControls}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={toggleFlash}
            activeOpacity={0.7}
          >
            <Ionicons
              name={state.isFlashOn ? 'flash' : 'flash-off'}
              size={24}
              color={theme.colors.text.primary}
            />
          </TouchableOpacity>

          <View style={styles.rightControls}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={navigateToGallery}
              activeOpacity={0.7}
            >
              <Ionicons name="images" size={24} color={theme.colors.text.primary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.controlButton}
              onPress={closeCamera}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={24} color={theme.colors.text.primary} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>

        {/* Edge Detection Visualization */}
        {state.edgesDetected && (
          <Animated.View
            style={[
              styles.edgeDetectionContainer,
              {
                transform: [{ scale: pulseAnim }],
              },
            ]}
            pointerEvents="none"
          >
            {/* Corner markers */}
            <Animated.View
              style={[styles.cornerTL, { opacity: cornerOpacity }]}
            />
            <Animated.View
              style={[styles.cornerTR, { opacity: cornerOpacity }]}
            />
            <Animated.View
              style={[styles.cornerBL, { opacity: cornerOpacity }]}
            />
            <Animated.View
              style={[styles.cornerBR, { opacity: cornerOpacity }]}
            />

            {/* Helper text */}
            <View style={styles.helperTextContainer}>
              <Text style={styles.helperText}>
                Position receipt within frame
              </Text>
            </View>
          </Animated.View>
        )}

        {/* Countdown Overlay */}
        {state.countdownValue !== null && (
          <TouchableOpacity
            style={styles.countdownOverlay}
            onPress={cancelCountdown}
            activeOpacity={1}
          >
            <Text style={styles.countdownText}>{state.countdownValue}</Text>
            <Text style={styles.countdownSubtext}>Tap to cancel</Text>
          </TouchableOpacity>
        )}

        {/* Captured Image Animation */}
        {state.lastCapture && (
          <Animated.Image
            source={{ uri: state.lastCapture }}
            style={[
              styles.capturedImage,
              {
                opacity: capturedImageOpacity,
                transform: [
                  { scale: capturedImageScale },
                  {
                    translateX: capturedImageScale.interpolate({
                      inputRange: [0.2, 1],
                      outputRange: [screenWidth * 0.3, 0],
                    }),
                  },
                  {
                    translateY: capturedImageScale.interpolate({
                      inputRange: [0.2, 1],
                      outputRange: [screenHeight * 0.3, 0],
                    }),
                  },
                ],
              },
            ]}
            pointerEvents="none"
          />
        )}
      </Camera>

      {/* Capture Button */}
      <View style={styles.captureButtonContainer}>
        <TouchableOpacity
          onPress={handleCapture}
          disabled={state.isCapturing || state.countdownValue !== null}
          activeOpacity={0.8}
        >
          <Animated.View
            style={[
              styles.captureButton,
              isTablet && styles.captureButtonTablet,
              {
                transform: [{ scale: captureScaleAnim }],
              },
            ]}
          >
            <View style={styles.captureButtonInner} />
          </Animated.View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CameraScreen;