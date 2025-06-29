import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useSyncMonitor } from '../../hooks/useSync';
import { SyncEvent } from '../../types/sync';

interface SyncNotificationProps {
  position?: 'top' | 'bottom';
  duration?: number;
}

export const SyncNotification: React.FC<SyncNotificationProps> = ({
  position = 'top',
  duration = 3000,
}) => {
  const { theme } = useTheme();
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);
  const translateAnim = useRef(new Animated.Value(-100)).current;
  const timeoutRef = useRef<NodeJS.Timeout>();

  useSyncMonitor((event: SyncEvent) => {
    let message = '';
    let type: 'success' | 'error' | 'info' = 'info';

    switch (event.type) {
      case 'completed':
        message = 'Receipt synced successfully';
        type = 'success';
        break;
      case 'failed':
        message = 'Sync failed - Will retry automatically';
        type = 'error';
        break;
      case 'started':
        message = 'Syncing receipts...';
        type = 'info';
        break;
      case 'retry':
        message = 'Retrying sync...';
        type = 'info';
        break;
    }

    if (message) {
      showNotification({ message, type });
    }
  });

  const showNotification = (notif: typeof notification) => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setNotification(notif);

    // Animate in
    Animated.spring(translateAnim, {
      toValue: 0,
      tension: 100,
      friction: 10,
      useNativeDriver: true,
    }).start();

    // Auto hide after duration
    timeoutRef.current = setTimeout(() => {
      hideNotification();
    }, duration);
  };

  const hideNotification = () => {
    Animated.timing(translateAnim, {
      toValue: position === 'top' ? -100 : 100,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setNotification(null);
    });
  };

  if (!notification) return null;

  const getNotificationStyle = () => {
    switch (notification.type) {
      case 'success':
        return {
          backgroundColor: theme.colors.accent.success + '20',
          borderColor: theme.colors.accent.success,
          iconColor: theme.colors.accent.success,
          icon: 'checkmark-circle',
        };
      case 'error':
        return {
          backgroundColor: theme.colors.accent.error + '20',
          borderColor: theme.colors.accent.error,
          iconColor: theme.colors.accent.error,
          icon: 'alert-circle',
        };
      default:
        return {
          backgroundColor: theme.colors.accent.primary + '20',
          borderColor: theme.colors.accent.primary,
          iconColor: theme.colors.accent.primary,
          icon: 'information-circle',
        };
    }
  };

  const style = getNotificationStyle();
  const positionStyle = position === 'top'
    ? { top: Platform.OS === 'ios' ? 50 : 30 }
    : { bottom: 100 };

  return (
    <Animated.View
      style={[
        styles.container,
        positionStyle,
        {
          backgroundColor: style.backgroundColor,
          borderColor: style.borderColor,
          transform: [{ translateY: translateAnim }],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.content}
        onPress={hideNotification}
        activeOpacity={0.9}
      >
        <Ionicons
          name={style.icon as any}
          size={24}
          color={style.iconColor}
        />
        <Text style={[styles.message, { color: theme.colors.text.primary }]}>
          {notification.message}
        </Text>
        <Ionicons
          name="close"
          size={20}
          color={theme.colors.text.secondary}
        />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1001,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  message: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
});