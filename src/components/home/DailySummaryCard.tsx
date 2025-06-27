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

interface DailySummaryCardProps {
  receiptsToday: number;
  totalSpendToday: number;
  syncStatus: 'synced' | 'pending' | 'error';
  onPress?: () => void;
}

const DailySummaryCard: React.FC<DailySummaryCardProps> = ({
  receiptsToday,
  totalSpendToday,
  syncStatus,
  onPress,
}) => {
  const { theme } = useTheme();

  const getSyncStatusConfig = () => {
    switch (syncStatus) {
      case 'synced':
        return {
          color: '#34C759',
          icon: 'cloud-done',
          text: 'All synced',
        };
      case 'pending':
        return {
          color: '#FF9500',
          icon: 'cloud-upload',
          text: 'Syncing...',
        };
      case 'error':
        return {
          color: '#FF3B30',
          icon: 'cloud-offline',
          text: 'Sync failed',
        };
    }
  };

  const syncConfig = getSyncStatusConfig();

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
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: theme.spacing.md,
    },
    titleText: {
      ...theme.typography.h2,
      color: '#FFFFFF',
      fontWeight: '700',
      marginBottom: theme.spacing.xs,
    },
    syncIndicator: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.md,
      gap: theme.spacing.xs,
    },
    syncText: {
      ...theme.typography.bodySmall,
      color: '#FFFFFF',
      fontWeight: '600',
    },
    statsContainer: {
      gap: theme.spacing.md,
    },
    statRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    statIcon: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    statText: {
      ...theme.typography.body,
      color: '#FFFFFF',
      flex: 1,
    },
    statValue: {
      ...theme.typography.h3,
      color: '#FFFFFF',
      fontWeight: '700',
    },
    totalContainer: {
      alignItems: 'flex-end',
    },
    totalLabel: {
      ...theme.typography.bodySmall,
      color: 'rgba(255, 255, 255, 0.8)',
      marginBottom: 2,
    },
  });

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  };

  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'short', 
    day: 'numeric' 
  });

  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={0.95}
      onPress={onPress}
    >
      <LinearGradient
        colors={['#007AFF', '#34C759']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBackground}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.titleText}>{today}</Text>
          </View>
          
          <View style={[styles.syncIndicator, { backgroundColor: `${syncConfig.color}30` }]}>
            <Ionicons 
              name={syncConfig.icon as any} 
              size={16} 
              color='#FFFFFF'
            />
            <Text style={styles.syncText}>{syncConfig.text}</Text>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statRow}>
            <View style={styles.statIcon}>
              <Ionicons name="receipt" size={18} color="#FFFFFF" />
            </View>
            <Text style={styles.statText}>{receiptsToday} receipts added</Text>
            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>Daily total</Text>
              <Text style={styles.statValue}>{formatCurrency(totalSpendToday)}</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default DailySummaryCard;