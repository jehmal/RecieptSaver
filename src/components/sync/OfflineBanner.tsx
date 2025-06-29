import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNetworkStatus } from '../../contexts/NetworkStatusContext';
import { useTheme } from '../../contexts/ThemeContext';

interface OfflineBannerProps {
  position?: 'top' | 'bottom';
  showNetworkType?: boolean;
  onPress?: () => void;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({
  position = 'bottom',
  showNetworkType = true,
  onPress,
}) => {
  const { theme } = useTheme();
  const { networkStatus, isOnline } = useNetworkStatus();
  const translateAnim = useRef(new Animated.Value(100)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(translateAnim, {
      toValue: isOnline ? 100 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();

    if (!isOnline) {
      // Pulse animation when offline
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
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
  }, [isOnline]);

  const getBannerContent = () => {
    if (isOnline) {
      return null;
    }

    let message = 'No internet connection';
    let subMessage = 'Your changes will sync when you\'re back online';

    if (networkStatus.isConnected && !networkStatus.isInternetReachable) {
      message = 'Limited connectivity';
      subMessage = 'Connected to network but no internet access';
    }

    return { message, subMessage };
  };

  const content = getBannerContent();
  if (!content) return null;

  const positionStyle = position === 'top' 
    ? { top: 0, paddingTop: 40 } // Account for status bar
    : { bottom: 0, paddingBottom: 20 };

  const translateY = position === 'top'
    ? translateAnim.interpolate({
        inputRange: [0, 100],
        outputRange: [0, -100],
      })
    : translateAnim;

  return (
    <Animated.View
      style={[
        styles.container,
        positionStyle,
        {
          backgroundColor: theme.colors.surfaceLight,
          transform: [
            { translateY },
            { scale: pulseAnim },
          ],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.content}
        onPress={onPress}
        disabled={!onPress}
        activeOpacity={0.8}
      >
        <View style={styles.iconContainer}>
          <Ionicons
            name="cloud-offline"
            size={24}
            color={theme.colors.accent.warning}
          />
        </View>
        
        <View style={styles.textContainer}>
          <Text style={[styles.message, { color: theme.colors.text.primary }]}>
            {content.message}
          </Text>
          <Text style={[styles.subMessage, { color: theme.colors.text.secondary }]}>
            {content.subMessage}
          </Text>
          
          {showNetworkType && networkStatus.type !== 'none' && (
            <View style={styles.networkTypeContainer}>
              <Ionicons
                name={networkStatus.type === 'wifi' ? 'wifi' : 'cellular'}
                size={12}
                color={theme.colors.text.tertiary}
              />
              <Text style={[styles.networkType, { color: theme.colors.text.tertiary }]}>
                {networkStatus.type.charAt(0).toUpperCase() + networkStatus.type.slice(1)}
                {networkStatus.details?.cellularGeneration && 
                  ` (${networkStatus.details.cellularGeneration.toUpperCase()})`}
              </Text>
            </View>
          )}
        </View>

        {onPress && (
          <View style={styles.actionContainer}>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={theme.colors.text.secondary}
            />
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  iconContainer: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  message: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  subMessage: {
    fontSize: 14,
  },
  networkTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  networkType: {
    fontSize: 12,
  },
  actionContainer: {
    marginLeft: 12,
  },
});