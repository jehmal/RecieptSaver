import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Text } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface ProgressBarProps {
  progress: number; // 0 to 1
  height?: number;
  showPercentage?: boolean;
  animated?: boolean;
  color?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  height = 4,
  showPercentage = false,
  animated = true,
  color,
}) => {
  const { theme } = useTheme();
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animated) {
      Animated.timing(animatedValue, {
        toValue: progress,
        duration: 300,
        useNativeDriver: false,
      }).start();
    } else {
      animatedValue.setValue(progress);
    }
  }, [progress, animated, animatedValue]);

  const widthPercentage = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <View 
        style={[
          styles.progressContainer,
          { 
            height,
            backgroundColor: theme.colors.surfaceLight,
          }
        ]}
      >
        <Animated.View
          style={[
            styles.progressBar,
            {
              width: widthPercentage,
              backgroundColor: color || theme.colors.accent.primary,
            },
          ]}
        />
      </View>
      {showPercentage && (
        <Text style={[styles.percentage, { color: theme.colors.text.secondary }]}>
          {Math.round(progress * 100)}%
        </Text>
      )}
    </View>
  );
};

interface CircularProgressProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  showPercentage?: boolean;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  progress,
  size = 60,
  strokeWidth = 4,
  color,
  showPercentage = true,
}) => {
  const { theme } = useTheme();
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: progress,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [progress, animatedValue]);

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  const strokeDashoffset = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  return (
    <View style={[styles.circularContainer, { width: size, height: size }]}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFillObject}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={theme.colors.surfaceLight}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color || theme.colors.accent.primary}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      {showPercentage && (
        <Text style={[styles.circularPercentage, { color: theme.colors.text.primary }]}>
          {Math.round(progress * 100)}%
        </Text>
      )}
    </View>
  );
};

// Import these at the top of the file
import Svg, { Circle } from 'react-native-svg';
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  progressContainer: {
    width: '100%',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  percentage: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  circularContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  circularPercentage: {
    position: 'absolute',
    fontSize: 14,
    fontWeight: '600',
  },
});