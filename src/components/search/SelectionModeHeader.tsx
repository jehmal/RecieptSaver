import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import * as Haptics from 'expo-haptics';

interface SelectionModeHeaderProps {
  selectedCount: number;
  totalCount: number;
  onClose: () => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  isAllSelected: boolean;
  fadeAnim: Animated.Value;
}

const SelectionModeHeader: React.FC<SelectionModeHeaderProps> = ({
  selectedCount,
  totalCount,
  onClose,
  onSelectAll,
  onDeselectAll,
  isAllSelected,
  fadeAnim,
}) => {
  const { theme } = useTheme();

  const handleSelectToggle = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    if (isAllSelected) {
      onDeselectAll();
    } else {
      onSelectAll();
    }
  };

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.card.background,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.card.border,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    leftSection: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
    },
    closeButton: {
      padding: 4,
    },
    countText: {
      fontSize: 17,
      fontWeight: '600',
      color: theme.colors.text.primary,
    },
    selectAllButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      backgroundColor: theme.colors.surfaceLight,
    },
    selectAllText: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.accent.primary,
    },
  });

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.header}>
        <View style={styles.leftSection}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close" size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.countText}>
            {selectedCount} of {totalCount} selected
          </Text>
        </View>

        <TouchableOpacity
          style={styles.selectAllButton}
          onPress={handleSelectToggle}
          activeOpacity={0.7}
        >
          <Ionicons
            name={isAllSelected ? "checkbox" : "square-outline"}
            size={20}
            color={theme.colors.accent.primary}
          />
          <Text style={styles.selectAllText}>
            {isAllSelected ? 'Deselect All' : 'Select All'}
          </Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

export default SelectionModeHeader;