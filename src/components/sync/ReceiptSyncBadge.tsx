import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSync } from '../../contexts/SyncContext';
import { useTheme } from '../../contexts/ThemeContext';
import { SyncStatus } from '../../types/sync';

interface ReceiptSyncBadgeProps {
  receiptId: string;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  size?: 'small' | 'medium';
}

export const ReceiptSyncBadge: React.FC<ReceiptSyncBadgeProps> = ({
  receiptId,
  position = 'top-right',
  size = 'small',
}) => {
  const { theme } = useTheme();
  const { getReceiptSyncState } = useSync();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const syncState = getReceiptSyncState(receiptId);
  const status = syncState?.status || 'synced';

  useEffect(() => {
    // Animate badge appearance
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 100,
      friction: 10,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    if (status === 'syncing') {
      // Rotate animation for syncing
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

    if (status === 'synced') {
      // Fade out synced badge after a delay
      setTimeout(() => {
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }).start();
      }, 2000);
    } else {
      opacityAnim.setValue(1);
    }
  }, [status]);

  const getStatusConfig = () => {
    switch (status) {
      case 'syncing':
        return {
          icon: 'sync',
          color: theme.colors.accent.primary,
          showBadge: true,
        };
      case 'pending':
        return {
          icon: 'cloud-upload',
          color: theme.colors.accent.warning,
          showBadge: true,
        };
      case 'error':
        return {
          icon: 'alert-circle',
          color: theme.colors.accent.error,
          showBadge: true,
        };
      case 'offline':
        return {
          icon: 'cloud-offline',
          color: theme.colors.text.secondary,
          showBadge: true,
        };
      case 'synced':
      default:
        return {
          icon: 'checkmark-circle',
          color: theme.colors.accent.success,
          showBadge: false, // Don't show for synced items
        };
    }
  };

  const config = getStatusConfig();
  
  // Don't render if synced (unless just completed)
  if (!config.showBadge && opacityAnim._value === 0) {
    return null;
  }

  const positionStyles = {
    'top-right': { top: 8, right: 8 },
    'top-left': { top: 8, left: 8 },
    'bottom-right': { bottom: 8, right: 8 },
    'bottom-left': { bottom: 8, left: 8 },
  };

  const sizeConfig = {
    small: { size: 24, iconSize: 16 },
    medium: { size: 32, iconSize: 20 },
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        positionStyles[position],
        {
          opacity: opacityAnim,
          transform: [
            { scale: scaleAnim },
            ...(status === 'syncing' ? [{ rotate: spin }] : []),
          ],
        },
      ]}
    >
      <View
        style={[
          styles.badge,
          {
            backgroundColor: theme.colors.surface,
            width: sizeConfig[size].size,
            height: sizeConfig[size].size,
            borderColor: config.color,
          },
        ]}
      >
        <Ionicons
          name={config.icon as any}
          size={sizeConfig[size].iconSize}
          color={config.color}
        />
      </View>
      
      {syncState?.progress !== undefined && status === 'syncing' && (
        <View style={[styles.progressRing, { width: sizeConfig[size].size, height: sizeConfig[size].size }]}>
          <CircularProgress
            size={sizeConfig[size].size}
            progress={syncState.progress}
            color={config.color}
            width={2}
          />
        </View>
      )}
    </Animated.View>
  );
};

// Simple circular progress component
const CircularProgress: React.FC<{
  size: number;
  progress: number;
  color: string;
  width: number;
}> = ({ size, progress, color, width }) => {
  const radius = (size - width) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <View style={StyleSheet.absoluteFillObject}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={width}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 10,
  },
  badge: {
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  progressRing: {
    position: 'absolute',
  },
});

// Fix imports for Svg components
import Svg, { Circle } from 'react-native-svg';