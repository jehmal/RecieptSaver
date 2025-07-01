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
  Alert,
  Modal,
  ScrollView,
} from 'react-native';
import { Camera, CameraType, FlashMode } from 'expo-camera';
import * as FileSystem from 'expo-file-system';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import ocrService from '../services/ocrService';
import {
  PinchGestureHandler,
  State as GestureState,
  PinchGestureHandlerStateChangeEvent,
  TapGestureHandler,
  TapGestureHandlerStateChangeEvent,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import { GestureHints } from '../components/gestures';
import WebCamera from '../components/camera/WebCamera';
import { ActivityLoader } from '../components/loading';
import { safeToFixed } from '../utils/developmentHelpers';
import { createAnimationConfig, createTimingConfig } from '../utils/animationHelpers';

// Fallback values for web
const CameraTypeFallback = {
  back: 'back' as any,
  front: 'front' as any,
};

const FlashModeFallback = {
  on: 'on' as any,
  off: 'off' as any,
  auto: 'auto' as any,
  torch: 'torch' as any,
};

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
  isProcessing: boolean;
  showResults: boolean;
  ocrResults: any | null;
  zoom: number;
  cameraType: CameraType | string;
}

interface EdgeCorner {
  top: number;
  left: number;
  right: number;
  bottom: number;
}

const CameraScreen: React.FC = () => {
  const { theme, themeMode } = useTheme();
  const navigation = useNavigation<any>();
  
  // Add back method if missing (temporary fix)
  useEffect(() => {
    if (navigation && !navigation.back && navigation.goBack) {
      (navigation as any).back = navigation.goBack;
    }
  }, [navigation]);
  
  // State management
  const [state, setState] = useState<CameraState>({
    hasPermission: false,
    isFlashOn: false,
    isCapturing: false,
    edgesDetected: false,
    countdownValue: null,
    lastCapture: null,
    isProcessing: false,
    showResults: false,
    ocrResults: null,
    zoom: 0,
    cameraType: Platform.OS === 'web' ? CameraTypeFallback.back : (CameraType?.back || CameraTypeFallback.back),
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
      try {
        // Check if running on web
        if (Platform.OS === 'web') {
          // On web, we'll use a different approach
          setState((prev) => ({ ...prev, hasPermission: true }));
          return;
        }
        
        const { status } = await Camera.requestCameraPermissionsAsync();
        setState((prev) => ({ ...prev, hasPermission: status === 'granted' }));
      } catch (error) {
        console.error('Error requesting camera permissions:', error);
        setState((prev) => ({ ...prev, hasPermission: false }));
      }
    })();
  }, []);

  // Edge detection pulse animation
  useEffect(() => {
    if (state.edgesDetected) {
      // Start pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, createTimingConfig(1.1, 500)),
          Animated.timing(pulseAnim, createTimingConfig(1, 500)),
        ])
      ).start();

      // Show corners
      Animated.timing(cornerOpacity, createTimingConfig(1, 300)).start();

      // Start countdown if auto-capture is enabled
      startCountdown();
    } else {
      // Hide corners and stop animations
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
      Animated.timing(cornerOpacity, createTimingConfig(0, 300)).start();

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

  // Handle web camera capture
  const handleWebCapture = async (imageData: string) => {
    setState((prev) => ({ ...prev, isCapturing: true }));

    try {
      // Save image data (base64) to a temporary location
      const fileName = `receipt_${Date.now()}.jpg`;
      const newUri = Platform.OS === 'web' ? imageData : FileSystem.documentDirectory + fileName;
      
      if (Platform.OS !== 'web') {
        // Convert base64 to file for native platforms
        await FileSystem.writeAsStringAsync(newUri, imageData.replace(/^data:image\/\w+;base64,/, ''), {
          encoding: FileSystem.EncodingType.Base64,
        });
      }

      // Update state with captured image
      setState((prev) => ({ ...prev, lastCapture: newUri, isProcessing: true }));
      
      try {
        // Process the image with OCR
        const ocrResults = await ocrService.processImage(newUri);
        
        // Validate results
        if (ocrService.validateResult(ocrResults)) {
          setState((prev) => ({ 
            ...prev, 
            ocrResults,
            showResults: true,
            isProcessing: false 
          }));
        } else {
          Alert.alert(
            'Processing Failed',
            'Unable to extract receipt information. Please try again with better lighting or a clearer image.',
            [{ text: 'OK', onPress: () => setState((prev) => ({ ...prev, isProcessing: false })) }]
          );
        }
      } catch (ocrError) {
        console.error('OCR Error:', ocrError);
        Alert.alert(
          'Processing Error',
          'An error occurred while processing the image. Please try again.',
          [{ text: 'OK', onPress: () => setState((prev) => ({ ...prev, isProcessing: false })) }]
        );
      }
    } catch (error) {
      console.error('Error capturing photo:', error);
      Alert.alert(
        'Capture Error',
        'Failed to capture photo. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setState((prev) => ({ ...prev, isCapturing: false, edgesDetected: false }));
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
        Animated.timing(flashAnim, createTimingConfig(1, 50)),
        Animated.timing(flashAnim, createTimingConfig(0, 50)),
      ]).start();

      // Capture button animation
      Animated.sequence([
        Animated.timing(captureScaleAnim, createTimingConfig(0.8, 100)),
        Animated.timing(captureScaleAnim, createTimingConfig(1, 100)),
      ]).start();

      try {
        // Take picture
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: false,
          skipProcessing: false,
        });

        // Save image to a permanent location
        const fileName = `receipt_${Date.now()}.jpg`;
        const newUri = FileSystem.documentDirectory + fileName;
        
        await FileSystem.copyAsync({
          from: photo.uri,
          to: newUri,
        });

        // Animate captured image to corner
        setState((prev) => ({ ...prev, lastCapture: newUri }));
        
        Animated.parallel([
          Animated.timing(capturedImageOpacity, createTimingConfig(1, 200)),
          Animated.timing(capturedImageScale, createTimingConfig(0.2, 500)),
        ]).start(() => {
          // Reset after animation
          setTimeout(() => {
            capturedImageOpacity.setValue(0);
            capturedImageScale.setValue(1);
          }, 1000);
        });

        // Start OCR processing
        setState((prev) => ({ ...prev, isProcessing: true }));
        
        try {
          // Process the image with OCR
          const ocrResults = await ocrService.processImage(newUri);
          
          // Validate results
          if (ocrService.validateResult(ocrResults)) {
            setState((prev) => ({ 
              ...prev, 
              ocrResults,
              showResults: true,
              isProcessing: false 
            }));
          } else {
            Alert.alert(
              'Processing Failed',
              'Unable to extract receipt information. Please try again with better lighting or a clearer image.',
              [{ text: 'OK', onPress: () => setState((prev) => ({ ...prev, isProcessing: false })) }]
            );
          }
        } catch (ocrError) {
          console.error('OCR Error:', ocrError);
          Alert.alert(
            'Processing Error',
            'An error occurred while processing the image. Please try again.',
            [{ text: 'OK', onPress: () => setState((prev) => ({ ...prev, isProcessing: false })) }]
          );
        }
      } catch (error) {
        console.error('Error capturing photo:', error);
        Alert.alert(
          'Capture Error',
          'Failed to capture photo. Please try again.',
          [{ text: 'OK' }]
        );
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
    if (navigation && navigation.navigate) {
      navigation.navigate('Search');
    }
  };

  // Close camera (if not default screen)
  const closeCamera = () => {
    try {
      if (navigation && navigation.navigate) {
        navigation.navigate('Home');
      } else {
        console.error('Navigation not available');
      }
    } catch (error) {
      console.error('Error navigating:', error);
    }
  };

  // Handle OCR result confirmation
  const handleConfirmResults = () => {
    // Save the receipt data to storage/database
    // For now, we'll navigate to the search screen where receipts are listed
    const receiptData = {
      ...state.ocrResults,
      imageUri: state.lastCapture,
      createdAt: new Date().toISOString(),
    };
    
    // Reset state
    setState((prev) => ({
      ...prev,
      showResults: false,
      ocrResults: null,
      lastCapture: null,
    }));
    
    // Navigate to search/receipts screen
    if (navigation && navigation.navigate) {
      navigation.navigate('Search', { newReceipt: receiptData });
    }
  };

  // Handle retake
  const handleRetake = () => {
    setState((prev) => ({
      ...prev,
      showResults: false,
      ocrResults: null,
      lastCapture: null,
    }));
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
    processingOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    processingContainer: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: 32,
      alignItems: 'center',
      ...theme.shadows.lg,
    },
    processingText: {
      fontSize: 18,
      fontWeight: '600',
      marginTop: 16,
      color: theme.colors.text.primary,
    },
    resultsModal: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    resultsHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.card.border,
    },
    resultsTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: theme.colors.text.primary,
    },
    resultsContent: {
      flex: 1,
      padding: 16,
    },
    resultItem: {
      marginBottom: 16,
    },
    resultLabel: {
      fontSize: 14,
      color: theme.colors.text.secondary,
      marginBottom: 4,
    },
    resultValue: {
      fontSize: 16,
      fontWeight: '500',
      color: theme.colors.text.primary,
    },
    itemsList: {
      marginTop: 8,
    },
    itemRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 8,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.card.border,
    },
    itemName: {
      flex: 1,
      fontSize: 14,
      color: theme.colors.text.primary,
    },
    itemPrice: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text.primary,
    },
    resultsFooter: {
      flexDirection: 'row',
      padding: 16,
      borderTopWidth: 1,
      borderTopColor: theme.colors.card.border,
      gap: 12,
    },
    footerButton: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    retakeButton: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.card.border,
    },
    confirmButton: {
      backgroundColor: theme.colors.accent.primary,
    },
    buttonText: {
      fontSize: 16,
      fontWeight: '600',
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

  // Check if Camera component is available (might not be on web)
  if (Platform.OS !== 'web' && !Camera) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.permissionText, { color: theme.colors.text.primary }]}>Camera not available</Text>
        <Text style={[styles.permissionSubtext, { color: theme.colors.text.secondary }]}>
          The camera component is not available on this platform
        </Text>
      </View>
    );
  }

  // Handle pinch to zoom
  const handlePinchGesture = (event: PinchGestureHandlerStateChangeEvent) => {
    if (event.nativeEvent.state === GestureState.ACTIVE) {
      const scale = event.nativeEvent.scale;
      const newZoom = Math.max(0, Math.min(1, (scale - 1) * 0.5));
      setState(prev => ({ ...prev, zoom: newZoom }));
    }
  };

  // Handle double tap to switch camera
  const handleDoubleTap = (event: TapGestureHandlerStateChangeEvent) => {
    if (event.nativeEvent.state === GestureState.ACTIVE) {
      const backType = CameraType?.back || CameraTypeFallback.back;
      const frontType = CameraType?.front || CameraTypeFallback.front;
      const newType = state.cameraType === backType ? frontType : backType;
      setState(prev => ({ ...prev, cameraType: newType }));
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }
  };

  // Render web camera for web platform
  if (Platform.OS === 'web') {
    return (
      <View style={{ flex: 1 }}>
        <WebCamera
          onCapture={handleWebCapture}
          onClose={closeCamera}
          isFlashOn={state.isFlashOn}
          onToggleFlash={toggleFlash}
        />

        {/* Processing Overlay */}
        {state.isProcessing && (
          <ActivityLoader
            size="large"
            message="Processing receipt..."
            fullScreen
            overlay
          />
        )}

        {/* Results Modal */}
        <Modal
          visible={state.showResults}
          animationType="slide"
          presentationStyle="fullScreen"
          onRequestClose={handleRetake}
        >
          <SafeAreaView style={styles.resultsModal}>
            <StatusBar barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'} />
            
            {/* Header */}
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsTitle}>Receipt Details</Text>
              <TouchableOpacity onPress={handleRetake}>
                <Ionicons name="close" size={24} color={theme.colors.text.primary} />
              </TouchableOpacity>
            </View>

            {/* Content */}
            <ScrollView style={styles.resultsContent}>
              {state.ocrResults && (
                <>
                  <View style={styles.resultItem}>
                    <Text style={styles.resultLabel}>Merchant</Text>
                    <Text style={styles.resultValue}>
                      {state.ocrResults.merchantName || 'Unknown'}
                    </Text>
                  </View>

                  <View style={styles.resultItem}>
                    <Text style={styles.resultLabel}>Date</Text>
                    <Text style={styles.resultValue}>
                      {state.ocrResults.date ? new Date(state.ocrResults.date).toLocaleDateString() : 'Unknown'}
                    </Text>
                  </View>

                  <View style={styles.resultItem}>
                    <Text style={styles.resultLabel}>Total Amount</Text>
                    <Text style={styles.resultValue}>
                      ${safeToFixed(state.ocrResults.totalAmount, 2)}
                    </Text>
                  </View>

                  {state.ocrResults.items && state.ocrResults.items.length > 0 && (
                    <View style={styles.resultItem}>
                      <Text style={styles.resultLabel}>Items</Text>
                      <View style={styles.itemsList}>
                        {state.ocrResults.items.map((item: any, index: number) => (
                          <View key={index} style={styles.itemRow}>
                            <Text style={styles.itemName}>
                              {item.name} {item.quantity > 1 ? `x${item.quantity}` : ''}
                            </Text>
                            <Text style={styles.itemPrice}>
                              ${safeToFixed(item.price, 2)}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}
                </>
              )}
            </ScrollView>

            {/* Footer */}
            <View style={styles.resultsFooter}>
              <TouchableOpacity
                style={[styles.footerButton, styles.retakeButton]}
                onPress={handleRetake}
              >
                <Text style={[styles.buttonText, { color: theme.colors.text.primary }]}>
                  Retake
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.footerButton, styles.confirmButton]}
                onPress={handleConfirmResults}
              >
                <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>
                  Save Receipt
                </Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </Modal>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={[styles.container, { backgroundColor: '#000' }]}>
        <StatusBar barStyle="light-content" />
        
        {/* Camera View */}
        <TapGestureHandler
          numberOfTaps={2}
          onHandlerStateChange={handleDoubleTap}
        >
          <Animated.View style={{ flex: 1 }}>
            <PinchGestureHandler onHandlerStateChange={handlePinchGesture}>
              <Animated.View style={{ flex: 1 }}>
                <Camera
                  ref={cameraRef}
                  style={isTablet ? styles.tabletCamera : styles.camera}
                  type={state.cameraType}
                  flashMode={state.isFlashOn ? (FlashMode?.on || FlashModeFallback.on) : (FlashMode?.off || FlashModeFallback.off)}
                  zoom={state.zoom}
                >
        {/* Flash overlay for shutter effect */}
        <Animated.View
          style={[
            styles.flashOverlay,
            {
              opacity: flashAnim,
              pointerEvents: 'none',
            },
          ]}
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
                pointerEvents: 'none',
              },
            ]}
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
                pointerEvents: 'none',
              },
            ]}
          />
        )}
                </Camera>
              </Animated.View>
            </PinchGestureHandler>
          </Animated.View>
        </TapGestureHandler>

        {/* Capture Button */}
        <View style={styles.captureButtonContainer}>
        <TouchableOpacity
          onPress={handleCapture}
          disabled={state.isCapturing || state.countdownValue !== null || state.isProcessing}
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

      {/* Processing Overlay */}
      {state.isProcessing && (
        <ActivityLoader
          size="large"
          message="Processing receipt..."
          fullScreen
          overlay
        />
      )}

      {/* Results Modal */}
      <Modal
        visible={state.showResults}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={handleRetake}
      >
        <SafeAreaView style={styles.resultsModal}>
          <StatusBar barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'} />
          
          {/* Header */}
          <View style={styles.resultsHeader}>
            <Text style={styles.resultsTitle}>Receipt Details</Text>
            <TouchableOpacity onPress={handleRetake}>
              <Ionicons name="close" size={24} color={theme.colors.text.primary} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView style={styles.resultsContent}>
            {state.ocrResults && (
              <>
                <View style={styles.resultItem}>
                  <Text style={styles.resultLabel}>Merchant</Text>
                  <Text style={styles.resultValue}>
                    {state.ocrResults.merchantName || 'Unknown'}
                  </Text>
                </View>

                <View style={styles.resultItem}>
                  <Text style={styles.resultLabel}>Date</Text>
                  <Text style={styles.resultValue}>
                    {state.ocrResults.date ? new Date(state.ocrResults.date).toLocaleDateString() : 'Unknown'}
                  </Text>
                </View>

                <View style={styles.resultItem}>
                  <Text style={styles.resultLabel}>Total Amount</Text>
                  <Text style={styles.resultValue}>
                    ${safeToFixed(state.ocrResults.totalAmount, 2)}
                  </Text>
                </View>

                {state.ocrResults.items && state.ocrResults.items.length > 0 && (
                  <View style={styles.resultItem}>
                    <Text style={styles.resultLabel}>Items</Text>
                    <View style={styles.itemsList}>
                      {state.ocrResults.items.map((item: any, index: number) => (
                        <View key={index} style={styles.itemRow}>
                          <Text style={styles.itemName}>
                            {item.name} {item.quantity > 1 ? `x${item.quantity}` : ''}
                          </Text>
                          <Text style={styles.itemPrice}>
                            ${safeToFixed(item.price, 2)}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </>
            )}
          </ScrollView>

          {/* Footer */}
          <View style={styles.resultsFooter}>
            <TouchableOpacity
              style={[styles.footerButton, styles.retakeButton]}
              onPress={handleRetake}
            >
              <Text style={[styles.buttonText, { color: theme.colors.text.primary }]}>
                Retake
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.footerButton, styles.confirmButton]}
              onPress={handleConfirmResults}
            >
              <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>
                Save Receipt
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
      
      {/* Gesture Hints */}
      <GestureHints screen="camera" />
    </View>
    </GestureHandlerRootView>
  );
};

export default CameraScreen;