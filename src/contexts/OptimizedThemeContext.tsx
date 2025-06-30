import React, { createContext, useState, useContext, ReactNode, useEffect, useMemo, useCallback } from 'react';
import { useColorScheme } from 'react-native';
import { theme as darkTheme } from '../styles/theme';
import { lightTheme } from '../styles/lightTheme';

type ThemeMode = 'system' | 'light' | 'dark';

interface ThemeContextType {
  theme: typeof darkTheme;
  themeMode: ThemeMode;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
}

// Split contexts to prevent unnecessary re-renders
const ThemeValueContext = createContext<typeof darkTheme | undefined>(undefined);
const ThemeModeContext = createContext<{ themeMode: ThemeMode; toggleTheme: () => void; setThemeMode: (mode: ThemeMode) => void } | undefined>(undefined);

export const OptimizedThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>('system');
  
  // Memoize theme calculation
  const currentTheme = useMemo(() => {
    if (themeMode === 'system') {
      return systemColorScheme === 'light' ? lightTheme : darkTheme;
    }
    return themeMode === 'light' ? lightTheme : darkTheme;
  }, [themeMode, systemColorScheme]);

  // Memoize toggle function
  const toggleTheme = useCallback(() => {
    setThemeMode(prevMode => {
      if (prevMode === 'system') return 'light';
      if (prevMode === 'light') return 'dark';
      return 'system';
    });
  }, []);

  // Memoize setThemeMode wrapper
  const setThemeModeCallback = useCallback((mode: ThemeMode) => {
    setThemeMode(mode);
  }, []);

  // Memoize mode context value
  const modeContextValue = useMemo(() => ({
    themeMode,
    toggleTheme,
    setThemeMode: setThemeModeCallback,
  }), [themeMode, toggleTheme, setThemeModeCallback]);

  return (
    <ThemeValueContext.Provider value={currentTheme}>
      <ThemeModeContext.Provider value={modeContextValue}>
        {children}
      </ThemeModeContext.Provider>
    </ThemeValueContext.Provider>
  );
};

// Hook to only get theme colors (won't re-render on mode changes)
export const useThemeColors = () => {
  const theme = useContext(ThemeValueContext);
  if (theme === undefined) {
    throw new Error('useThemeColors must be used within a ThemeProvider');
  }
  return theme;
};

// Hook to only get theme mode and controls
export const useThemeMode = () => {
  const context = useContext(ThemeModeContext);
  if (context === undefined) {
    throw new Error('useThemeMode must be used within a ThemeProvider');
  }
  return context;
};

// Legacy hook for compatibility (use sparingly as it causes re-renders)
export const useTheme = () => {
  const theme = useThemeColors();
  const { themeMode, toggleTheme, setThemeMode } = useThemeMode();
  
  return {
    theme,
    themeMode,
    toggleTheme,
    setThemeMode,
  };
};