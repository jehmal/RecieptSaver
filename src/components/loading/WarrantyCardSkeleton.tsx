import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { SkeletonLoader } from './SkeletonLoader';

export const WarrantyCardSkeleton: React.FC = () => {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.card.background }]}>
      <View style={styles.header}>
        <SkeletonLoader width={48} height={48} borderRadius={24} />
        <View style={styles.headerContent}>
          <SkeletonLoader width="70%" height={20} />
          <SkeletonLoader width="50%" height={16} style={{ marginTop: 4 }} />
        </View>
      </View>
      
      <View style={styles.status}>
        <SkeletonLoader width={120} height={28} borderRadius={14} />
      </View>

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <SkeletonLoader width="40%" height={14} />
          <SkeletonLoader width="30%" height={14} />
        </View>
        <View style={styles.detailRow}>
          <SkeletonLoader width="45%" height={14} />
          <SkeletonLoader width="25%" height={14} />
        </View>
      </View>

      <SkeletonLoader 
        width="100%" 
        height={48} 
        borderRadius={24} 
        style={styles.button}
      />
    </View>
  );
};

export const WarrantyListItemSkeleton: React.FC = () => {
  const { theme } = useTheme();

  return (
    <View style={[styles.listItem, { backgroundColor: theme.colors.card.background }]}>
      <SkeletonLoader width={56} height={56} borderRadius={28} />
      <View style={styles.listContent}>
        <SkeletonLoader width="60%" height={18} />
        <SkeletonLoader width="40%" height={14} style={{ marginTop: 4 }} />
        <SkeletonLoader width={100} height={24} borderRadius={12} style={{ marginTop: 8 }} />
      </View>
      <View style={styles.listEnd}>
        <SkeletonLoader width={80} height={16} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerContent: {
    flex: 1,
    marginLeft: 12,
  },
  status: {
    marginBottom: 16,
  },
  details: {
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  button: {
    marginTop: 8,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  listContent: {
    flex: 1,
    marginLeft: 12,
  },
  listEnd: {
    alignItems: 'flex-end',
  },
});