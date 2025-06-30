import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
  FlatList,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSync } from '../../contexts/SyncContext';
import { useTheme } from '../../contexts/ThemeContext';
import { SyncQueueItem } from '../../types/sync';
import { ProgressBar } from '../loading';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface SyncProgressModalProps {
  visible: boolean;
  onClose: () => void;
  onCancel?: () => void;
  title?: string;
}

export const SyncProgressModal: React.FC<SyncProgressModalProps> = ({
  visible,
  onClose,
  onCancel,
  title = 'Syncing Your Data',
}) => {
  const { theme } = useTheme();
  const { syncProgress, syncQueue, globalSyncState } = useSync();
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 75,
          friction: 10,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: SCREEN_HEIGHT,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const renderQueueItem = ({ item }: { item: SyncQueueItem }) => {
    const getItemIcon = () => {
      switch (item.status) {
        case 'processing':
          return 'sync';
        case 'failed':
          return 'alert-circle';
        default:
          return 'time';
      }
    };

    const getItemColor = () => {
      switch (item.status) {
        case 'processing':
          return theme.colors.accent.primary;
        case 'failed':
          return theme.colors.accent.error;
        default:
          return theme.colors.text.secondary;
      }
    };

    return (
      <View style={[styles.queueItem, { backgroundColor: theme.colors.surface }]}>
        <Ionicons
          name={getItemIcon() as any}
          size={20}
          color={getItemColor()}
        />
        <Text style={[styles.queueItemText, { color: theme.colors.text.primary }]}>
          {item.type.charAt(0).toUpperCase() + item.type.slice(1)} - {item.id.slice(0, 8)}
        </Text>
        {item.status === 'failed' && (
          <Text style={[styles.retryText, { color: theme.colors.accent.error }]}>
            Retry {item.retries}/3
          </Text>
        )}
      </View>
    );
  };

  const progress = syncProgress
    ? (syncProgress.completed / syncProgress.total) * 100
    : 0;

  const estimatedTime = syncProgress?.estimatedTimeRemaining
    ? Math.ceil(syncProgress.estimatedTimeRemaining / 60)
    : null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View
        style={[
          styles.backdrop,
          {
            opacity: fadeAnim,
            backgroundColor: 'rgba(0,0,0,0.5)',
          },
        ]}
      >
        <Animated.View
          style={[
            styles.container,
            {
              backgroundColor: theme.colors.background,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.text.primary }]}>
              {title}
            </Text>
            {globalSyncState.status !== 'syncing' && (
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons
                  name="close"
                  size={24}
                  color={theme.colors.text.secondary}
                />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.content}>
            {syncProgress && (
              <>
                <View style={styles.progressSection}>
                  <View style={styles.progressInfo}>
                    <Text style={[styles.progressText, { color: theme.colors.text.primary }]}>
                      {syncProgress.completed} of {syncProgress.total} items
                    </Text>
                    <Text style={[styles.progressPercent, { color: theme.colors.accent.primary }]}>
                      {Math.round(progress)}%
                    </Text>
                  </View>

                  <ProgressBar
                    progress={progress / 100}
                    height={8}
                    animated
                  />

                  {estimatedTime && (
                    <Text style={[styles.timeEstimate, { color: theme.colors.text.secondary }]}>
                      About {estimatedTime} {estimatedTime === 1 ? 'minute' : 'minutes'} remaining
                    </Text>
                  )}
                </View>

                {syncProgress.failed > 0 && (
                  <View style={[styles.errorBanner, { backgroundColor: theme.colors.accent.error + '20' }]}>
                    <Ionicons
                      name="warning"
                      size={20}
                      color={theme.colors.accent.error}
                    />
                    <Text style={[styles.errorText, { color: theme.colors.accent.error }]}>
                      {syncProgress.failed} items failed to sync
                    </Text>
                  </View>
                )}
              </>
            )}

            <View style={styles.queueSection}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text.secondary }]}>
                Sync Queue
              </Text>
              <FlatList
                data={syncQueue}
                renderItem={renderQueueItem}
                keyExtractor={(item) => item.id}
                style={styles.queueList}
                ListEmptyComponent={
                  <Text style={[styles.emptyText, { color: theme.colors.text.tertiary }]}>
                    No items in queue
                  </Text>
                }
              />
            </View>
          </View>

          <View style={[styles.footer, { borderTopColor: theme.colors.surfaceLight }]}>
            {globalSyncState.status === 'syncing' ? (
              <TouchableOpacity
                style={[styles.button, styles.cancelButton, { backgroundColor: theme.colors.accent.error }]}
                onPress={onCancel}
              >
                <Text style={styles.buttonText}>Cancel Sync</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.button, { backgroundColor: theme.colors.accent.primary }]}
                onPress={onClose}
              >
                <Text style={styles.buttonText}>Done</Text>
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  container: {
    maxHeight: SCREEN_HEIGHT * 0.7,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 20,
  },
  progressSection: {
    marginBottom: 24,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 16,
  },
  progressPercent: {
    fontSize: 16,
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  timeEstimate: {
    fontSize: 14,
    marginTop: 8,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    fontSize: 14,
    fontWeight: '500',
  },
  queueSection: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  queueList: {
    maxHeight: 200,
  },
  queueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    gap: 12,
  },
  queueItemText: {
    flex: 1,
    fontSize: 14,
  },
  retryText: {
    fontSize: 12,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 14,
    marginVertical: 20,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButton: {
    // Additional styles for cancel button if needed
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});