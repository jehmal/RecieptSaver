import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

interface WarrantyListCardProps {
  itemName: string;
  serialNumber: string;
  purchaseDate: string;
  expiryDate: string;
  supplier: string;
  category?: string;
  onPress?: () => void;
}

const WarrantyListCard: React.FC<WarrantyListCardProps> = React.memo(({
  itemName,
  serialNumber,
  purchaseDate,
  expiryDate,
  supplier,
  category = 'General',
  onPress,
}) => {
  const { theme } = useTheme();

  // Calculate days remaining and determine color
  const { daysRemaining, statusColor, expirationText, urgencyTag } = useMemo(() => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const remaining = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    let color;
    let urgency = '';
    
    if (remaining <= 0) {
      color = theme.colors.text.tertiary;
      urgency = 'Expired';
    } else if (remaining < 30) {
      color = '#FF3B30'; // Red for urgent
      urgency = 'Urgent';
    } else if (remaining <= 90) {
      color = '#FF9500'; // Amber for warning
      urgency = 'Soon';
    } else {
      color = '#34C759'; // Green for safe
      urgency = '';
    }

    // Format expiration text
    let expText;
    if (remaining <= 0) {
      expText = 'Expired';
    } else if (remaining === 1) {
      expText = '1 day';
    } else if (remaining < 30) {
      expText = `${remaining} days`;
    } else if (remaining < 60) {
      expText = '1 month';
    } else {
      const months = Math.floor(remaining / 30);
      expText = `${months} months`;
    }
    
    return {
      daysRemaining: remaining,
      statusColor: color,
      expirationText: expText,
      urgencyTag: urgency,
    };
  }, [expiryDate, theme]);

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.card.background,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      marginHorizontal: theme.spacing.lg,
      marginBottom: theme.spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      ...theme.shadows.sm,
    },
    leftContent: {
      flex: 1,
      marginRight: theme.spacing.md,
    },
    itemName: {
      ...theme.typography.body,
      color: theme.colors.text.primary,
      fontWeight: '600',
      marginBottom: theme.spacing.xs,
    },
    subtitle: {
      ...theme.typography.bodySmall,
      color: theme.colors.text.secondary,
    },
    rightContent: {
      alignItems: 'flex-end',
    },
    expirationHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.xs,
    },
    expiresLabel: {
      ...theme.typography.caption,
      color: theme.colors.text.secondary,
      marginRight: theme.spacing.xs,
    },
    urgencyTag: {
      ...theme.typography.caption,
      color: statusColor,
      fontWeight: '700',
      backgroundColor: theme.isDark ? `${statusColor}20` : `${statusColor}15`,
      paddingHorizontal: theme.spacing.xs,
      paddingVertical: 2,
      borderRadius: theme.borderRadius.xs,
    },
    expirationTime: {
      ...theme.typography.body,
      color: statusColor,
      fontWeight: '600',
    },
    chevronContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: theme.spacing.xs,
    },
    chevron: {
      marginLeft: theme.spacing.xs,
    },
  });

  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={0.9}
      onPress={onPress}
    >
      <View style={styles.leftContent}>
        <Text style={styles.itemName}>{itemName}</Text>
        <Text style={styles.subtitle}>
          {category} • SN: {serialNumber}
        </Text>
      </View>
      
      <View style={styles.rightContent}>
        <View style={styles.expirationHeader}>
          <Text style={styles.expiresLabel}>Expires in</Text>
          {urgencyTag && (
            <Text style={styles.urgencyTag}>{urgencyTag}</Text>
          )}
        </View>
        <View style={styles.chevronContainer}>
          <Text style={styles.expirationTime}>{expirationText}</Text>
          <Ionicons 
            name="chevron-forward" 
            size={20} 
            color={theme.colors.text.tertiary}
            style={styles.chevron}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
});

WarrantyListCard.displayName = 'WarrantyListCard';

export default WarrantyListCard;