import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

interface EmailReceiptDetectionCardProps {
  detectedCount: number;
  merchantNames?: string[];
  onImportPress?: () => void;
  onDismissPress?: () => void;
}

const EmailReceiptDetectionCard: React.FC<EmailReceiptDetectionCardProps> = ({
  detectedCount,
  merchantNames = [],
  onImportPress,
  onDismissPress,
}) => {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    container: {
      marginHorizontal: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
      borderRadius: theme.borderRadius.xl,
      overflow: 'hidden',
      ...theme.shadows.md,
    },
    gradientBackground: {
      padding: theme.spacing.lg,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
      gap: theme.spacing.md,
    },
    iconContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    titleSection: {
      flex: 1,
    },
    titleText: {
      ...theme.typography.h3,
      color: '#FFFFFF',
      fontWeight: '700',
      marginBottom: theme.spacing.xs,
    },
    subtitleText: {
      ...theme.typography.bodySmall,
      color: 'rgba(255, 255, 255, 0.9)',
    },
    contentSection: {
      marginBottom: theme.spacing.lg,
    },
    merchantPreview: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: theme.spacing.sm,
      gap: theme.spacing.xs,
    },
    merchantChip: {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.sm,
    },
    merchantText: {
      ...theme.typography.bodySmall,
      color: '#FFFFFF',
      fontWeight: '600',
    },
    moreText: {
      ...theme.typography.bodySmall,
      color: 'rgba(255, 255, 255, 0.8)',
      marginLeft: theme.spacing.xs,
    },
    actionSection: {
      flexDirection: 'row',
      gap: theme.spacing.md,
      alignItems: 'center',
    },
    importButton: {
      flex: 1,
      backgroundColor: '#FFFFFF',
      paddingVertical: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    importButtonText: {
      ...theme.typography.body,
      color: '#5856D6',
      fontWeight: '700',
    },
    dismissButton: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.md,
    },
    dismissText: {
      ...theme.typography.body,
      color: 'rgba(255, 255, 255, 0.9)',
      fontWeight: '600',
    },
  });

  const displayMerchants = merchantNames.slice(0, 2);
  const remainingCount = merchantNames.length - 2;

  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={0.95}
      onPress={onImportPress}
    >
      <LinearGradient
        colors={['#007AFF', '#5856D6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBackground}
      >
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="mail" size={28} color="#FFFFFF" />
          </View>
          
          <View style={styles.titleSection}>
            <Text style={styles.titleText}>
              {detectedCount} New Receipt{detectedCount !== 1 ? 's' : ''} Found
            </Text>
            <Text style={styles.subtitleText}>
              We detected receipts in your email
            </Text>
          </View>
        </View>

        <View style={styles.contentSection}>
          {displayMerchants.length > 0 && (
            <View style={styles.merchantPreview}>
              {displayMerchants.map((merchant, index) => (
                <View key={index} style={styles.merchantChip}>
                  <Text style={styles.merchantText}>{merchant}</Text>
                </View>
              ))}
              {remainingCount > 0 && (
                <Text style={styles.moreText}>
                  +{remainingCount} more
                </Text>
              )}
            </View>
          )}
        </View>

        <View style={styles.actionSection}>
          <TouchableOpacity
            style={styles.importButton}
            onPress={onImportPress}
            activeOpacity={0.8}
          >
            <Ionicons name="add-circle" size={20} color="#5856D6" />
            <Text style={styles.importButtonText}>Import All</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.dismissButton}
            onPress={onDismissPress}
            activeOpacity={0.8}
          >
            <Text style={styles.dismissText}>Later</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default EmailReceiptDetectionCard;