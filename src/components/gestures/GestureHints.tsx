import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Modal,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../contexts/ThemeContext';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface Hint {
  id: string;
  icon: string;
  title: string;
  description: string;
  gesture: 'swipe' | 'pinch' | 'longPress' | 'doubleTap' | 'pull';
}

interface GestureHintsProps {
  screen: 'search' | 'gallery' | 'detail' | 'camera';
  onDismiss?: () => void;
}

const hints: Record<string, Hint[]> = {
  search: [
    {
      id: 'swipe-right',
      icon: 'arrow-forward',
      title: 'Swipe Right',
      description: 'Quick categorize receipts',
      gesture: 'swipe',
    },
    {
      id: 'swipe-left',
      icon: 'arrow-back',
      title: 'Swipe Left',
      description: 'Archive or delete receipts',
      gesture: 'swipe',
    },
    {
      id: 'long-press',
      icon: 'hand-left',
      title: 'Long Press',
      description: 'Enter selection mode',
      gesture: 'longPress',
    },
    {
      id: 'double-tap',
      icon: 'open',
      title: 'Double Tap',
      description: 'Quick view receipt details',
      gesture: 'doubleTap',
    },
    {
      id: 'pull-down',
      icon: 'refresh',
      title: 'Pull Down',
      description: 'Refresh receipt list',
      gesture: 'pull',
    },
  ],
  gallery: [
    {
      id: 'pinch',
      icon: 'resize',
      title: 'Pinch In/Out',
      description: 'Change grid size (2-4 columns)',
      gesture: 'pinch',
    },
    {
      id: 'two-finger',
      icon: 'hand-left',
      title: 'Two-Finger Swipe',
      description: 'Multi-select range of receipts',
      gesture: 'swipe',
    },
  ],
  detail: [
    {
      id: 'pinch-zoom',
      icon: 'scan',
      title: 'Pinch to Zoom',
      description: 'Zoom in on receipt image',
      gesture: 'pinch',
    },
    {
      id: 'double-tap-zoom',
      icon: 'expand',
      title: 'Double Tap',
      description: 'Quick zoom to specific area',
      gesture: 'doubleTap',
    },
    {
      id: 'swipe-down',
      icon: 'chevron-down',
      title: 'Swipe Down',
      description: 'Dismiss receipt details',
      gesture: 'swipe',
    },
  ],
  camera: [
    {
      id: 'pinch-camera',
      icon: 'scan',
      title: 'Pinch to Zoom',
      description: 'Zoom camera view',
      gesture: 'pinch',
    },
    {
      id: 'double-tap-switch',
      icon: 'camera-reverse',
      title: 'Double Tap',
      description: 'Switch camera (front/back)',
      gesture: 'doubleTap',
    },
    {
      id: 'swipe-up',
      icon: 'images',
      title: 'Swipe Up',
      description: 'Access recent captures',
      gesture: 'swipe',
    },
  ],
};

export const GestureHints: React.FC<GestureHintsProps> = ({ screen, onDismiss }) => {
  const { theme } = useTheme();
  const [visible, setVisible] = useState(false);
  const [hasSeenKey, setHasSeenKey] = useState(`gesture_hints_${screen}_seen`);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    checkAndShowHints();
  }, []);

  const checkAndShowHints = async () => {
    try {
      const hasSeen = await AsyncStorage.getItem(hasSeenKey);
      if (!hasSeen) {
        setVisible(true);
        animateIn();
      }
    } catch (error) {
      console.error('Error checking hints:', error);
    }
  };

  const animateIn = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 65,
        friction: 11,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleDismiss = async () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 50,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(async () => {
      setVisible(false);
      try {
        await AsyncStorage.setItem(hasSeenKey, 'true');
      } catch (error) {
        console.error('Error saving hints seen status:', error);
      }
      onDismiss?.();
    });
  };

  const renderHint = (hint: Hint) => {
    const getGestureIcon = () => {
      switch (hint.gesture) {
        case 'swipe':
          return 'swap-horizontal';
        case 'pinch':
          return 'resize';
        case 'longPress':
          return 'hand-left';
        case 'doubleTap':
          return 'finger-print';
        case 'pull':
          return 'arrow-down';
        default:
          return hint.icon;
      }
    };

    return (
      <View key={hint.id} style={styles.hintItem}>
        <View style={styles.hintIconContainer}>
          <Ionicons
            name={getGestureIcon() as any}
            size={24}
            color={theme.colors.accent.primary}
          />
        </View>
        <View style={styles.hintContent}>
          <Text style={styles.hintTitle}>{hint.title}</Text>
          <Text style={styles.hintDescription}>{hint.description}</Text>
        </View>
      </View>
    );
  };

  const styles = StyleSheet.create({
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    container: {
      backgroundColor: theme.colors.surface,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingTop: 8,
      paddingBottom: Platform.OS === 'ios' ? 34 : 24,
      maxHeight: screenHeight * 0.6,
    },
    handle: {
      width: 36,
      height: 5,
      backgroundColor: theme.colors.text.tertiary,
      borderRadius: 3,
      alignSelf: 'center',
      marginBottom: 16,
    },
    header: {
      paddingHorizontal: 20,
      paddingBottom: 16,
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: theme.colors.text.primary,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: theme.colors.text.secondary,
      lineHeight: 22,
    },
    hintsContainer: {
      paddingHorizontal: 20,
    },
    hintItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 16,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.card.border,
    },
    hintIconContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: theme.colors.accent.light,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
    },
    hintContent: {
      flex: 1,
    },
    hintTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text.primary,
      marginBottom: 2,
    },
    hintDescription: {
      fontSize: 14,
      color: theme.colors.text.secondary,
    },
    dismissButton: {
      margin: 20,
      paddingVertical: 14,
      backgroundColor: theme.colors.accent.primary,
      borderRadius: 12,
      alignItems: 'center',
    },
    dismissButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#FFFFFF',
    },
  });

  if (!visible) return null;

  const screenHints = hints[screen] || [];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleDismiss}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={handleDismiss}
      >
        <Animated.View
          style={[
            styles.container,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.handle} />
          
          <View style={styles.header}>
            <Text style={styles.title}>Gesture Tips</Text>
            <Text style={styles.subtitle}>
              Use these gestures for a better experience
            </Text>
          </View>
          
          <View style={styles.hintsContainer}>
            {screenHints.map(renderHint)}
          </View>
          
          <TouchableOpacity
            style={styles.dismissButton}
            onPress={handleDismiss}
            activeOpacity={0.8}
          >
            <Text style={styles.dismissButtonText}>Got it!</Text>
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};

export default GestureHints;