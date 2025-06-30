import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface ActivityLoaderProps {
  size?: 'small' | 'large';
  message?: string;
  fullScreen?: boolean;
  overlay?: boolean;
}

export const ActivityLoader: React.FC<ActivityLoaderProps> = ({
  size = 'large',
  message,
  fullScreen = false,
  overlay = false,
}) => {
  const { theme } = useTheme();

  const content = (
    <View style={[
      styles.container,
      fullScreen && styles.fullScreen,
      overlay && styles.overlay,
      { backgroundColor: overlay ? 'rgba(0, 0, 0, 0.8)' : 'transparent' }
    ]}>
      <View style={[
        styles.loaderContainer,
        { backgroundColor: theme.colors.surface }
      ]}>
        <ActivityIndicator 
          size={size} 
          color={theme.colors.accent.primary} 
        />
        {message && (
          <Text style={[
            styles.message,
            { color: theme.colors.text.secondary }
          ]}>
            {message}
          </Text>
        )}
      </View>
    </View>
  );

  return content;
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  fullScreen: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  loaderContainer: {
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  message: {
    marginTop: 12,
    fontSize: 16,
    textAlign: 'center',
  },
});