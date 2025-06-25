import React from 'react';
import { TextInput, StyleSheet, View, Text, TextInputProps } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface AuthInputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export const AuthInput: React.FC<AuthInputProps> = ({ 
  label, 
  error,
  style,
  ...props 
}) => {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, { color: theme.colors.text.primary }]}>
          {label}
        </Text>
      )}
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: theme.colors.surface,
            color: theme.colors.text.primary,
            borderColor: error ? theme.colors.accent.error : theme.colors.card.border,
          },
          style,
        ]}
        placeholderTextColor={theme.colors.text.tertiary}
        autoCapitalize="none"
        {...props}
      />
      {error && (
        <Text style={[styles.errorText, { color: theme.colors.accent.error }]}>
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    height: 56,
    borderRadius: 12,
    paddingHorizontal: 20,
    fontSize: 16,
    borderWidth: 1,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
});