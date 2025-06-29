import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import * as Haptics from 'expo-haptics';

interface FloatingActionBarProps {
  visible: boolean;
  selectedCount: number;
  onCategorize: () => void;
  onDelete: () => void;
  onMore: () => void;
}

const FloatingActionBar: React.FC<FloatingActionBarProps> = ({
  visible,
  selectedCount,
  onCategorize,
  onDelete,
  onMore,
}) => {
  const { theme } = useTheme();
  const slideAnim = useRef(new Animated.Value(100)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (visible) {
      // Slide up and scale animation
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 65,
          friction: 11,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 65,
          friction: 11,
        }),
      ]).start();
    } else {
      // Slide down animation
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 100,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleAction = (action: () => void) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    action();
  };

  const styles = StyleSheet.create({
    container: {
      position: 'absolute',
      bottom: Platform.OS === 'ios' ? 100 : 80,
      left: 20,
      right: 20,
      backgroundColor: theme.colors.card.background,
      borderRadius: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-around',
      paddingVertical: 12,
      paddingHorizontal: 16,
      elevation: 8,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 8,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 12,
      gap: 8,
    },
    actionText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text.primary,
    },
    divider: {
      width: 1,
      height: 24,
      backgroundColor: theme.colors.card.border,
    },
    deleteButton: {
      backgroundColor: 'rgba(255, 59, 48, 0.1)',
    },
    deleteText: {
      color: '#FF3B30',
    },
  });

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim },
          ],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => handleAction(onCategorize)}
        activeOpacity={0.7}
      >
        <MaterialIcons name="category" size={20} color={theme.colors.accent.primary} />
        <Text style={styles.actionText}>Categorize</Text>
      </TouchableOpacity>

      <View style={styles.divider} />

      <TouchableOpacity
        style={[styles.actionButton, styles.deleteButton]}
        onPress={() => handleAction(onDelete)}
        activeOpacity={0.7}
      >
        <Ionicons name="trash-outline" size={20} color="#FF3B30" />
        <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
      </TouchableOpacity>

      <View style={styles.divider} />

      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => handleAction(onMore)}
        activeOpacity={0.7}
      >
        <Ionicons name="ellipsis-horizontal" size={20} color={theme.colors.text.primary} />
        <Text style={styles.actionText}>More</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default FloatingActionBar;