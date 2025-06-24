import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { theme } from '../../styles/theme';
import { Ionicons } from '@expo/vector-icons';

interface CircularProgressRingProps {
  progress: number; // 0 to 1
  mainValue: string | number;
  subValue?: string;
  icon: keyof typeof Ionicons.glyphMap;
  gradientColors?: string[];
}

const CircularProgressRing: React.FC<CircularProgressRingProps> = ({
  progress,
  mainValue,
  subValue,
  icon,
  gradientColors = [theme.colors.accent.primary, theme.colors.accent.success],
}) => {
  const size = 120;
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress * circumference);

  return (
    <View style={styles.container}>
      <Svg width={size} height={size} style={styles.svg}>
        <Defs>
          <LinearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={gradientColors[0]} />
            <Stop offset="100%" stopColor={gradientColors[1]} />
          </LinearGradient>
        </Defs>
        
        {/* Background circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={theme.colors.card.border}
          strokeWidth={strokeWidth}
          fill="none"
          opacity={0.3}
        />
        
        {/* Progress circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#progressGradient)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      
      <View style={styles.contentContainer}>
        <Ionicons 
          name={icon} 
          size={24} 
          color={theme.colors.text.secondary}
          style={styles.icon}
        />
        <Text style={styles.mainValue}>{mainValue}</Text>
        {subValue && <Text style={styles.subValue}>{subValue}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: 120,
    height: 120,
  },
  svg: {
    position: 'absolute',
  },
  contentContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    marginBottom: theme.spacing.xs,
  },
  mainValue: {
    ...theme.typography.h3,
    color: theme.colors.text.primary,
    marginBottom: 2,
  },
  subValue: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
  },
});

export default CircularProgressRing;