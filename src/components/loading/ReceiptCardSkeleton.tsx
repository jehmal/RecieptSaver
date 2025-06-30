import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { SkeletonLoader } from './SkeletonLoader';

export const ReceiptCardSkeleton: React.FC = () => {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.card.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <SkeletonLoader width={40} height={40} borderRadius={20} />
        <View style={styles.headerContent}>
          <SkeletonLoader width="60%" height={18} />
          <SkeletonLoader width="40%" height={14} style={{ marginTop: 4 }} />
        </View>
        <SkeletonLoader width={80} height={24} />
      </View>

      {/* Receipt Image */}
      <SkeletonLoader 
        width="100%" 
        height={200} 
        borderRadius={8} 
        style={styles.image}
      />

      {/* Tags */}
      <View style={styles.tags}>
        <SkeletonLoader width={60} height={24} borderRadius={12} style={styles.tag} />
        <SkeletonLoader width={80} height={24} borderRadius={12} style={styles.tag} />
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <SkeletonLoader width="30%" height={14} />
        <SkeletonLoader width={100} height={32} borderRadius={16} />
      </View>
    </View>
  );
};

export const ReceiptListItemSkeleton: React.FC = () => {
  const { theme } = useTheme();

  return (
    <View style={[styles.listItem, { backgroundColor: theme.colors.card.background }]}>
      <SkeletonLoader width={60} height={60} borderRadius={8} />
      <View style={styles.listItemContent}>
        <SkeletonLoader width="50%" height={18} />
        <SkeletonLoader width="30%" height={14} style={{ marginTop: 4 }} />
        <View style={styles.listItemTags}>
          <SkeletonLoader width={50} height={20} borderRadius={10} style={styles.tag} />
          <SkeletonLoader width={70} height={20} borderRadius={10} />
        </View>
      </View>
      <View style={styles.listItemEnd}>
        <SkeletonLoader width={80} height={20} />
        <SkeletonLoader width={60} height={14} style={{ marginTop: 4 }} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
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
  image: {
    marginBottom: 12,
  },
  tags: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  tag: {
    marginRight: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listItem: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  listItemContent: {
    flex: 1,
    marginLeft: 12,
  },
  listItemTags: {
    flexDirection: 'row',
    marginTop: 8,
  },
  listItemEnd: {
    alignItems: 'flex-end',
  },
});