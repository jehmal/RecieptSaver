import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { MaterialIcons } from '@expo/vector-icons';

interface PullToRefreshIndicatorProps {
  pullProgress: number; // 0 to 1
  isRefreshing: boolean;
  size?: number;
}

export const PullToRefreshIndicator: React.FC<PullToRefreshIndicatorProps> = ({
  pullProgress,
  isRefreshing,
  size = 32,
}) => {
  const { theme } = useTheme();
  const rotateValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isRefreshing) {
      Animated.loop(
        Animated.timing(rotateValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      ).start();
    } else {
      rotateValue.setValue(0);
    }
  }, [isRefreshing, rotateValue]);

  const rotate = rotateValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const scale = Math.min(pullProgress, 1);
  const opacity = Math.min(pullProgress * 1.5, 1);

  return (
    <View style={[styles.container, { opacity }]}>
      <Animated.View
        style={[
          styles.iconContainer,
          {
            transform: [
              { scale },
              { rotate: isRefreshing ? rotate : `${pullProgress * 180}deg` },
            ],
          },
        ]}
      >
        <MaterialIcons
          name={isRefreshing ? 'refresh' : 'arrow-downward'}
          size={size}
          color={theme.colors.accent.primary}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});