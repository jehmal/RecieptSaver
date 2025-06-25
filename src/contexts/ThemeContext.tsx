import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
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

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>('system');
  const [currentTheme, setCurrentTheme] = useState(darkTheme);

  useEffect(() => {
    if (themeMode === 'system') {
      setCurrentTheme(systemColorScheme === 'light' ? lightTheme : darkTheme);
    } else {
      setCurrentTheme(themeMode === 'light' ? lightTheme : darkTheme);
    }
  }, [themeMode, systemColorScheme]);

  const toggleTheme = () => {
    setThemeMode(prevMode => {
      if (prevMode === 'system') return 'light';
      if (prevMode === 'light') return 'dark';
      return 'system';
    });
  };

  return (
    <ThemeContext.Provider value={{ theme: currentTheme, themeMode, toggleTheme, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};