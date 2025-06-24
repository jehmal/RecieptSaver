// Blackbird-inspired theme configuration
export const theme = {
  colors: {
    // Dark theme colors
    background: '#000000',
    surface: '#1C1C1E',
    surfaceLight: '#2C2C2E',
    
    // Text colors
    text: {
      primary: '#FFFFFF',
      secondary: '#8E8E93',
      tertiary: '#48484A',
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
      background: '#1C1C1E',
      border: '#38383A',
      shadow: 'rgba(0, 0, 0, 0.3)',
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
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.35,
      shadowRadius: 16,
      elevation: 8,
    },
  },
  
  transitions: {
    fast: 200,
    medium: 300,
    slow: 500,
  },
};

export type Theme = typeof theme;