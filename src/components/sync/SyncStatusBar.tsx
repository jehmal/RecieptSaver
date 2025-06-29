import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { useSync } from '../../contexts/SyncContext';
import { useNetworkStatus } from '../../contexts/NetworkStatusContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const SyncStatusBar: React.FC = () => {
  const { theme } = useTheme();
  const { globalSyncState, syncProgress } = useSync();
  const { isOnline, isSyncing, syncProgress: networkSyncProgress } = useNetworkStatus();
  
  const slideAnim = useRef(new Animated.Value(-60)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const isVisible = !isOnline || globalSyncState.status === 'syncing' || globalSyncState.status === 'error';

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isVisible ? 0 : -60,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isVisible]);

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
  }, [isSyncing]);

  useEffect(() => {
    const progress = syncProgress?.total 
      ? (syncProgress.completed / syncProgress.total) * 100 
      : networkSyncProgress;
      
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [syncProgress, networkSyncProgress]);

  const getStatusConfig = () => {
    if (!isOnline) {
      return {
        icon: 'cloud-offline',
        text: 'Offline - Changes will sync when connected',
        color: theme.colors.accent.warning,
        showProgress: false,
      };
    }

    switch (globalSyncState.status) {
      case 'syncing':
        return {
          icon: 'sync',
          text: syncProgress 
            ? `Syncing ${syncProgress.completed}/${syncProgress.total} items`
            : 'Syncing...',
          color: theme.colors.accent.primary,
          showProgress: true,
        };
      case 'error':
        return {
          icon: 'alert-circle',
          text: 'Sync failed - Tap to retry',
          color: theme.colors.accent.error,
          showProgress: false,
        };
      default:
        return null;
    }
  };

  const config = getStatusConfig();
  if (!config) return null;

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <Animated.View 
      style={[
        styles.container, 
        { 
          backgroundColor: theme.colors.surface,
          transform: [{ translateY: slideAnim }],
        }
      ]}
    >
      <TouchableOpacity 
        style={styles.content}
        onPress={globalSyncState.status === 'error' ? () => {} : undefined}
        disabled={globalSyncState.status !== 'error'}
      >
        <View style={styles.statusRow}>
          <Animated.View style={config.icon === 'sync' ? { transform: [{ rotate: spin }] } : {}}>
            <Ionicons 
              name={config.icon as any} 
              size={18} 
              color={config.color} 
            />
          </Animated.View>
          <Text style={[styles.statusText, { color: theme.colors.text.primary }]}>
            {config.text}
          </Text>
        </View>
        
        {config.showProgress && (
          <View style={styles.progressContainer}>
            <View style={[styles.progressTrack, { backgroundColor: theme.colors.surfaceLight }]}>
              <Animated.View 
                style={[
                  styles.progressBar,
                  { 
                    width: progressWidth,
                    backgroundColor: config.color,
                  }
                ]}
              />
            </View>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 40, // Account for status bar
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  progressContainer: {
    marginTop: 8,
  },
  progressTrack: {
    height: 3,
    borderRadius: 1.5,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 1.5,
  },
});