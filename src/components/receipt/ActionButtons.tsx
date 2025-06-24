import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';

interface ActionButtonsProps {
  onExport: () => void;
  onShare: () => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ onExport, onShare }) => {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, 20);
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    container: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: theme.colors.background,
      paddingHorizontal: 20,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: theme.colors.card.border,
      ...Platform.select({
        ios: {
          shadowColor: theme.colors.shadow,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 5,
        },
        android: {
          elevation: 5,
        },
      }),
    },
    primaryButton: {
      height: 50,
      backgroundColor: theme.colors.text.primary,
      borderRadius: 25,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 12,
    },
    primaryButtonText: {
      fontSize: 17,
      color: theme.colors.background,
      fontWeight: '600',
    },
    secondaryButton: {
      height: 50,
      backgroundColor: theme.colors.surfaceLight,
      borderRadius: 25,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    secondaryButtonText: {
      fontSize: 17,
      color: theme.colors.text.primary,
      fontWeight: '600',
    },
    icon: {
      marginRight: 8,
    },
  });

  return (
    <View style={[styles.container, { paddingBottom: bottomPadding }]}>
      <TouchableOpacity
        style={styles.primaryButton}
        onPress={onExport}
        activeOpacity={0.8}
      >
        <Ionicons name="arrow-up-outline" size={20} color={theme.colors.background} style={styles.icon} />
        <Text style={styles.primaryButtonText}>Export Receipt</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={onShare}
        activeOpacity={0.8}
      >
        <Ionicons name="share-outline" size={20} color={theme.colors.text.primary} style={styles.icon} />
        <Text style={styles.secondaryButtonText}>Share</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ActionButtons;