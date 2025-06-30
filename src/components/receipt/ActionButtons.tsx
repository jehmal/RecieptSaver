import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';

interface ActionButtonsProps {
  onExport: () => void | Promise<void>;
  onShare: () => void | Promise<void>;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ onExport, onShare }) => {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, 20);
  const { theme } = useTheme();
  const [exportLoading, setExportLoading] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);

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

  const handleExport = async () => {
    if (exportLoading) return;
    setExportLoading(true);
    try {
      await onExport();
    } finally {
      setExportLoading(false);
    }
  };

  const handleShare = async () => {
    if (shareLoading) return;
    setShareLoading(true);
    try {
      await onShare();
    } finally {
      setShareLoading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingBottom: bottomPadding }]}>
      <TouchableOpacity
        style={[styles.primaryButton, (exportLoading || shareLoading) && { opacity: 0.7 }]}
        onPress={handleExport}
        activeOpacity={0.8}
        disabled={exportLoading || shareLoading}
      >
        {exportLoading ? (
          <ActivityIndicator size="small" color={theme.colors.background} style={styles.icon} />
        ) : (
          <Ionicons name="arrow-up-outline" size={20} color={theme.colors.background} style={styles.icon} />
        )}
        <Text style={styles.primaryButtonText}>Export Receipt</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.secondaryButton, (exportLoading || shareLoading) && { opacity: 0.7 }]}
        onPress={handleShare}
        activeOpacity={0.8}
        disabled={exportLoading || shareLoading}
      >
        {shareLoading ? (
          <ActivityIndicator size="small" color={theme.colors.text.primary} style={styles.icon} />
        ) : (
          <Ionicons name="share-outline" size={20} color={theme.colors.text.primary} style={styles.icon} />
        )}
        <Text style={styles.secondaryButtonText}>Share</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ActionButtons;