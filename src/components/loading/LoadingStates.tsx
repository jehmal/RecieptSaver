import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { ActivityLoader } from './ActivityLoader';
import { MaterialIcons } from '@expo/vector-icons';

interface EmptyStateProps {
  icon?: keyof typeof MaterialIcons.glyphMap;
  title: string;
  message?: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'inbox',
  title,
  message,
  action,
}) => {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <MaterialIcons 
        name={icon} 
        size={64} 
        color={theme.colors.text.tertiary} 
        style={styles.icon}
      />
      <Text style={[styles.title, { color: theme.colors.text.primary }]}>
        {title}
      </Text>
      {message && (
        <Text style={[styles.message, { color: theme.colors.text.secondary }]}>
          {message}
        </Text>
      )}
      {action && <View style={styles.action}>{action}</View>}
    </View>
  );
};

interface ErrorStateProps {
  error: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ error, onRetry }) => {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <MaterialIcons 
        name="error-outline" 
        size={64} 
        color={theme.colors.accent.error} 
        style={styles.icon}
      />
      <Text style={[styles.title, { color: theme.colors.text.primary }]}>
        Something went wrong
      </Text>
      <Text style={[styles.message, { color: theme.colors.text.secondary }]}>
        {error}
      </Text>
      {onRetry && (
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: theme.colors.accent.primary }]}
          onPress={onRetry}
        >
          <Text style={[styles.retryText, { color: theme.colors.background }]}>
            Try Again
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ message = 'Loading...' }) => {
  return <ActivityLoader message={message} />;
};

// Import TouchableOpacity
import { TouchableOpacity } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  icon: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 32,
  },
  action: {
    marginTop: 24,
  },
  retryButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  retryText: {
    fontSize: 16,
    fontWeight: '600',
  },
});