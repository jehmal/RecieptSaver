// Light theme configuration
export const lightTheme = {
  colors: {
    // Light theme colors
    background: '#FFFFFF',
    surface: '#F5F5F7',
    surfaceLight: '#FAFAFA',
    
    // Text colors
    text: {
      primary: '#1C1C1E',
      secondary: '#8E8E93',
      tertiary: '#C7C7CC',
    },
    
    // Accent colors
    accent: {
      primary: '#007AFF',
      success: '#34C759',
      warning: '#FF9500',
      error: '#FF3B30',
    },
    
    // Card colors
    card: {
      background: '#FFFFFF',
      border: '#E5E5EA',
      shadow: 'rgba(0, 0, 0, 0.1)',
    },
  },
  
  typography: {
    // Ultra-thin for large numbers
    largeNumber: {
      fontWeight: '100' as const,
      fontSize: 56,
      letterSpacing: -2,
    },
    
    // Headers
    h1: {
      fontSize: 34,
      fontWeight: '700' as const,
      letterSpacing: -1,
    },
    h2: {
      fontSize: 28,
      fontWeight: '600' as const,
      letterSpacing: -0.5,
    },
    h3: {
      fontSize: 22,
      fontWeight: '600' as const,
    },
    
    // Body text
    body: {
      fontSize: 17,
      fontWeight: '400' as const,
      lineHeight: 22,
    },
    bodySmall: {
      fontSize: 15,
      fontWeight: '400' as const,
      lineHeight: 20,
    },
    
    // Labels
    label: {
      fontSize: 13,
      fontWeight: '500' as const,
      letterSpacing: -0.08,
    },
    caption: {
      fontSize: 12,
      fontWeight: '400' as const,
    },
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  },
  
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
  },
  
  transitions: {
    fast: 200,
    medium: 300,
    slow: 500,
  },
};

export type Theme = typeof lightTheme;