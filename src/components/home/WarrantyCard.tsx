import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';

interface WarrantyCardProps {
  itemName: string;
  serialNumber: string;
  purchaseDate: string;
  expiryDate: string;
  supplier: string;
  onPress?: () => void;
}

const WarrantyCard: React.FC<WarrantyCardProps> = ({
  itemName,
  serialNumber,
  purchaseDate,
  expiryDate,
  supplier,
  onPress,
}) => {
  const { theme } = useTheme();

  // Calculate days remaining and determine color
  const { daysRemaining, statusColor, gradientColors, progressPercentage } = useMemo(() => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const purchase = new Date(purchaseDate);
    const totalDays = Math.ceil((expiry.getTime() - purchase.getTime()) / (1000 * 60 * 60 * 24));
    const remaining = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const progress = Math.max(0, Math.min(1, remaining / totalDays));
    
    let color;
    let gradients;
    
    if (remaining > 90) {
      // Premium green gradient - matches the app's blue-to-green theme
      color = '#34C759';
      gradients = ['#007AFF', '#34C759']; // Blue to green like DailySummaryCard
    } else if (remaining > 30) {
      // Sophisticated amber gradient
      color = '#FF9500';
      gradients = ['#FF6B00', '#FFB800']; // Deep orange to golden amber
    } else if (remaining > 0) {
      // Elegant warning gradient
      color = '#FF3B30';
      gradients = ['#FF3B30', '#FF6B6B']; // Deep red to coral
    } else {
      // Expired - muted gray gradient
      color = '#8E8E93';
      gradients = ['#48484A', '#8E8E93']; // Dark gray to light gray
    }
    
    return {
      daysRemaining: Math.max(0, remaining),
      statusColor: color,
      gradientColors: gradients,
      progressPercentage: progress,
    };
  }, [expiryDate, purchaseDate, theme]);

  const formatTimeRemaining = (days: number): string => {
    if (days <= 0) return 'Expired';
    if (days === 1) return '1 day';
    if (days < 30) return `${days} days`;
    if (days < 60) return '1 month';
    const months = Math.floor(days / 30);
    return `${months} month${months > 1 ? 's' : ''}`;
  };

  const styles = StyleSheet.create({
    container: {
      marginHorizontal: theme.spacing.lg,
      marginBottom: theme.spacing.md,
      borderRadius: theme.borderRadius.lg,
      overflow: 'hidden',
      ...theme.shadows.md,
    },
    gradientContainer: {
      padding: theme.spacing.md,
    },
    contentContainer: {
      backgroundColor: 'rgba(28, 28, 30, 0.85)', // Semi-transparent to let gradient show through
      borderRadius: theme.borderRadius.lg - 2,
      padding: theme.spacing.md,
      backdropFilter: 'blur(10px)', // Add blur effect for premium feel
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: theme.spacing.sm,
    },
    leftHeader: {
      flex: 1,
      marginRight: theme.spacing.md,
    },
    itemName: {
      ...theme.typography.body,
      color: theme.colors.text.primary,
      fontWeight: '600',
      marginBottom: theme.spacing.xs,
    },
    serialNumber: {
      ...theme.typography.bodySmall,
      color: theme.colors.text.secondary,
    },
    warrantyBadge: {
      backgroundColor: 'rgba(255, 255, 255, 0.1)', // Subtle glass effect
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.sm,
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    warrantyText: {
      ...theme.typography.caption,
      color: theme.colors.text.secondary,
      marginLeft: theme.spacing.xs,
    },
    detailsContainer: {
      marginBottom: theme.spacing.md,
    },
    detailRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.xs,
    },
    detailLabel: {
      ...theme.typography.bodySmall,
      color: theme.colors.text.secondary,
    },
    detailValue: {
      ...theme.typography.bodySmall,
      color: theme.colors.text.primary,
      fontWeight: '500',
    },
    expirationContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingTop: theme.spacing.sm,
      borderTopWidth: 1,
      borderTopColor: theme.colors.card.border,
    },
    expirationLeft: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    countdownContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      borderWidth: 2,
      borderColor: statusColor,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: theme.spacing.sm,
    },
    countdownBackground: {
      position: 'absolute',
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: statusColor,
      opacity: 0.15, // More subtle opacity
    },
    progressRing: {
      position: 'absolute',
      width: 40,
      height: 40,
      borderRadius: 20,
      borderWidth: 3,
      borderColor: 'transparent',
      borderTopColor: statusColor,
      borderRightColor: statusColor,
      transform: [{ rotate: `${progressPercentage * 360}deg` }],
    },
    countdownText: {
      ...theme.typography.caption,
      color: statusColor,
      fontWeight: '700',
      fontSize: 10,
    },
    expirationText: {
      flex: 1,
    },
    expiresLabel: {
      ...theme.typography.caption,
      color: theme.colors.text.secondary,
    },
    timeRemaining: {
      ...theme.typography.body,
      color: statusColor,
      fontWeight: '600',
    },
    chevron: {
      marginLeft: theme.spacing.sm,
    },
  });

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress}>
      <View style={styles.container}>
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientContainer}
        >
          <View style={styles.contentContainer}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.leftHeader}>
                <Text style={styles.itemName}>{itemName}</Text>
                <Text style={styles.serialNumber}>SN: {serialNumber}</Text>
              </View>
              <View style={styles.warrantyBadge}>
                <Ionicons name="shield-checkmark" size={16} color={theme.colors.text.primary} />
                <Text style={styles.warrantyText}>WARRANTY</Text>
              </View>
            </View>

            {/* Details */}
            <View style={styles.detailsContainer}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Purchased</Text>
                <Text style={styles.detailValue}>{purchaseDate}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Supplier</Text>
                <Text style={styles.detailValue}>{supplier}</Text>
              </View>
            </View>

            {/* Expiration */}
            <View style={styles.expirationContainer}>
              <View style={styles.expirationLeft}>
                <View style={styles.countdownContainer}>
                  <View style={styles.countdownBackground} />
                  <Text style={styles.countdownText}>
                    {daysRemaining > 99 ? '99+' : daysRemaining}
                  </Text>
                </View>
                <View style={styles.expirationText}>
                  <Text style={styles.expiresLabel}>Expires in</Text>
                  <Text style={styles.timeRemaining}>
                    {formatTimeRemaining(daysRemaining)}
                  </Text>
                </View>
              </View>
              <Ionicons 
                name="chevron-forward" 
                size={20} 
                color={theme.colors.text.tertiary}
                style={styles.chevron}
              />
            </View>
          </View>
        </LinearGradient>
      </View>
    </TouchableOpacity>
  );
};

export default WarrantyCard;