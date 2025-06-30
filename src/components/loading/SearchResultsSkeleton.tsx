import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { SkeletonLoader } from './SkeletonLoader';

export const SearchResultsSkeleton: React.FC = () => {
  const { theme } = useTheme();

  return (
    <ScrollView style={{ backgroundColor: theme.colors.background }}>
      {/* Search stats */}
      <View style={styles.searchStats}>
        <SkeletonLoader width={150} height={16} />
      </View>

      {/* Filter pills */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
      >
        {[80, 100, 90, 110].map((width, index) => (
          <SkeletonLoader 
            key={index}
            width={width} 
            height={32} 
            borderRadius={16}
            style={styles.filterPill}
          />
        ))}
      </ScrollView>

      {/* Results list */}
      <View style={styles.results}>
        {Array.from({ length: 5 }).map((_, index) => (
          <SearchResultItemSkeleton key={index} />
        ))}
      </View>
    </ScrollView>
  );
};

const SearchResultItemSkeleton: React.FC = () => {
  const { theme } = useTheme();

  return (
    <View style={[styles.resultItem, { backgroundColor: theme.colors.surface }]}>
      <SkeletonLoader width={64} height={64} borderRadius={8} />
      <View style={styles.resultContent}>
        <SkeletonLoader width="70%" height={18} />
        <SkeletonLoader width="50%" height={14} style={{ marginTop: 4 }} />
        <View style={styles.resultTags}>
          <SkeletonLoader width={60} height={20} borderRadius={10} style={styles.tag} />
          <SkeletonLoader width={80} height={20} borderRadius={10} />
        </View>
      </View>
      <View style={styles.resultEnd}>
        <SkeletonLoader width={70} height={20} />
        <SkeletonLoader width={50} height={14} style={{ marginTop: 4 }} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  searchStats: {
    padding: 16,
  },
  filterContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  filterPill: {
    marginRight: 8,
  },
  results: {
    paddingHorizontal: 16,
  },
  resultItem: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  resultContent: {
    flex: 1,
    marginLeft: 12,
  },
  resultTags: {
    flexDirection: 'row',
    marginTop: 8,
  },
  tag: {
    marginRight: 8,
  },
  resultEnd: {
    alignItems: 'flex-end',
  },
});