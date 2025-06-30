import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Text, Animated } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { CircularProgress } from './ProgressBar';
import { MaterialIcons } from '@expo/vector-icons';

interface SyncProgressIndicatorProps {
  totalItems: number;
  syncedItems: number;
  status: 'idle' | 'syncing' | 'complete' | 'error';
  error?: string;
}

export const SyncProgressIndicator: React.FC<SyncProgressIndicatorProps> = ({
  totalItems,
  syncedItems,
  status,
  error,
}) => {
  const { theme } = useTheme();
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (status === 'syncing') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [status, pulseAnim]);

  const progress = totalItems > 0 ? syncedItems / totalItems : 0;

  const getStatusColor = () => {
    switch (status) {
      case 'complete':
        return theme.colors.accent.success;
      case 'error':
        return theme.colors.accent.error;
      case 'syncing':
        return theme.colors.accent.primary;
      default:
        return theme.colors.text.tertiary;
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.progressContainer,
          status === 'syncing' && { transform: [{ scale: pulseAnim }] },
        ]}
      >
        <CircularProgress
          progress={progress}
          size={80}
          strokeWidth={6}
          color={getStatusColor()}
          showPercentage={false}
        />
        <View style={styles.iconContainer}>
          <MaterialIcons
            name={
              status === 'complete' ? 'check' :
              status === 'error' ? 'error-outline' :
              'sync'
            }
            size={32}
            color={getStatusColor()}
          />
        </View>
      </Animated.View>

      <Text style={[styles.statusText, { color: theme.colors.text.primary }]}>
        {status === 'syncing' ? 'Syncing...' :
         status === 'complete' ? 'All synced!' :
         status === 'error' ? 'Sync failed' :
         'Ready to sync'}
      </Text>

      {status === 'syncing' && (
        <Text style={[styles.progressText, { color: theme.colors.text.secondary }]}>
          {syncedItems} of {totalItems} items
        </Text>
      )}

      {status === 'error' && error && (
        <Text style={[styles.errorText, { color: theme.colors.accent.error }]}>
          {error}
        </Text>
      )}
    </View>
  );
};

interface CompactSyncIndicatorProps {
  isSyncing: boolean;
  hasChanges: boolean;
}

export const CompactSyncIndicator: React.FC<CompactSyncIndicatorProps> = ({
  isSyncing,
  hasChanges,
}) => {
  const { theme } = useTheme();
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isSyncing) {
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      ).start();
    } else {
      rotateAnim.setValue(0);
    }
  }, [isSyncing, rotateAnim]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.compactContainer}>
      <Animated.View
        style={[
          styles.compactIcon,
          isSyncing && { transform: [{ rotate }] },
        ]}
      >
        <MaterialIcons
          name={isSyncing ? 'sync' : hasChanges ? 'cloud-upload' : 'cloud-done'}
          size={20}
          color={
            isSyncing ? theme.colors.accent.primary :
            hasChanges ? theme.colors.accent.warning :
            theme.colors.accent.success
          }
        />
      </Animated.View>
      {hasChanges && !isSyncing && (
        <View style={[styles.badge, { backgroundColor: theme.colors.accent.warning }]} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 24,
  },
  progressContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  iconContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  progressText: {
    fontSize: 14,
  },
  errorText: {
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
  },
  compactContainer: {
    position: 'relative',
  },
  compactIcon: {
    padding: 8,
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});