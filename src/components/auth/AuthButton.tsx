import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator,
  TouchableOpacityProps
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface AuthButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary';
  loading?: boolean;
}

export const AuthButton: React.FC<AuthButtonProps> = ({ 
  title, 
  variant = 'primary',
  loading = false,
  disabled,
  style,
  ...props 
}) => {
  const { theme } = useTheme();

  const isPrimary = variant === 'primary';
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: isPrimary ? theme.colors.text.primary : 'transparent',
          borderColor: theme.colors.text.primary,
          borderWidth: isPrimary ? 0 : 1,
          opacity: isDisabled ? 0.5 : 1,
        },
        style,
      ]}
      disabled={isDisabled}
      {...props}
    >
      {loading ? (
        <ActivityIndicator 
          color={isPrimary ? theme.colors.background : theme.colors.text.primary} 
        />
      ) : (
        <Text
          style={[
            styles.buttonText,
            {
              color: isPrimary ? theme.colors.background : theme.colors.text.primary,
            },
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 8,
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '600',
  },
});