import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface BlackbirdLogoProps {
  size?: 'small' | 'medium' | 'large';
}

export const BlackbirdLogo: React.FC<BlackbirdLogoProps> = ({ size = 'medium' }) => {
  const { theme } = useTheme();

  const fontSize = size === 'small' ? 20 : size === 'large' ? 32 : 24;
  const letterSpacing = size === 'small' ? 2 : size === 'large' ? 4 : 3;

  return (
    <View style={styles.container}>
      <Text 
        style={[
          styles.logo, 
          { 
            color: theme.colors.text.primary,
            fontSize,
            letterSpacing,
          }
        ]}
      >
        BLACKBIRD
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    fontWeight: '900',
    textAlign: 'center',
  },
});