import React, { useState, useRef, useEffect } from 'react';
import {
  RefreshControl,
  ScrollView,
  FlatList,
  View,
  Text,
  StyleSheet,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNetworkStatus } from '../../contexts/NetworkStatusContext';
import { useSync } from '../../contexts/SyncContext';
import { useTheme } from '../../contexts/ThemeContext';

interface PullToRefreshSyncProps {
  children: React.ReactNode;
  onRefresh?: () => Promise<void>;
  scrollComponent?: 'ScrollView' | 'FlatList';
  flatListProps?: any;
}

export const PullToRefreshSync: React.FC<PullToRefreshSyncProps> = ({
  children,
  onRefresh,
  scrollComponent = 'ScrollView',
  flatListProps,
}) => {
  const { theme } = useTheme();
  const { triggerSync, isOnline, lastSyncTime } = useNetworkStatus();
  const { syncQueue } = useSync();
  const [refreshing, setRefreshing] = useState(false);
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const handleRefresh = async () => {
    setRefreshing(true);
    
    // Start rotation animation
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    ).start();

    try {
      if (onRefresh) {
        await onRefresh();
      }
      
      if (isOnline) {
        await triggerSync();
      }
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setRefreshing(false);
      rotateAnim.setValue(0);
    }
  };

  const getLastSyncText = () => {
    if (!lastSyncTime) return 'Never synced';
    
    const now = new Date();
    const diff = now.getTime() - lastSyncTime.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `Last synced ${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `Last synced ${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `Last synced ${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just synced';
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const refreshControl = (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={handleRefresh}
      tintColor={theme.colors.accent.primary}
      titleColor={theme.colors.text.primary}
      title={isOnline ? 'Pull to sync' : 'Offline - Pull to refresh'}
    />
  );

  const syncStatusHeader = (
    <View style={[styles.syncStatus, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.syncStatusContent}>
        <Animated.View style={{ transform: [{ rotate: spin }] }}>
          <Ionicons
            name={refreshing ? 'sync' : isOnline ? 'cloud-done' : 'cloud-offline'}
            size={20}
            color={isOnline ? theme.colors.accent.success : theme.colors.accent.warning}
          />
        </Animated.View>
        <Text style={[styles.syncStatusText, { color: theme.colors.text.secondary }]}>
          {getLastSyncText()}
        </Text>
        {syncQueue.length > 0 && (
          <View style={[styles.pendingBadge, { backgroundColor: theme.colors.accent.warning }]}>
            <Text style={styles.pendingBadgeText}>{syncQueue.length}</Text>
          </View>
        )}
      </View>
    </View>
  );

  if (scrollComponent === 'FlatList') {
    return (
      <FlatList
        {...flatListProps}
        refreshControl={refreshControl}
        ListHeaderComponent={
          <>
            {syncStatusHeader}
            {flatListProps?.ListHeaderComponent}
          </>
        }
      />
    );
  }

  return (
    <ScrollView
      refreshControl={refreshControl}
      showsVerticalScrollIndicator={false}
    >
      {syncStatusHeader}
      {children}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  syncStatus: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 8,
  },
  syncStatusContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  syncStatusText: {
    fontSize: 12,
    flex: 1,
  },
  pendingBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
  },
  pendingBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
});