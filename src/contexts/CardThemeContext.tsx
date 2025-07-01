import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CardTheme {
  id: string;
  name: string;
  dailySummaryGradient: string[];
  emailDetectionGradient: string[];
  previewColor: string; // Color shown in the selector circle
}

export const cardThemes: CardTheme[] = [
  {
    id: 'ocean',
    name: 'Ocean',
    dailySummaryGradient: ['#007AFF', '#34C759'], // Blue to Green (current default)
    emailDetectionGradient: ['#007AFF', '#5856D6'], // Blue to Purple
    previewColor: '#007AFF',
  },
  {
    id: 'sunset',
    name: 'Sunset',
    dailySummaryGradient: ['#FF6B6B', '#FFB347'], // Coral to Orange
    emailDetectionGradient: ['#FF6B6B', '#FF47A3'], // Coral to Pink
    previewColor: '#FF6B6B',
  },
  {
    id: 'midnight',
    name: 'Midnight',
    dailySummaryGradient: ['#1E3C72', '#2A5298'], // Deep Blue to Royal Blue
    emailDetectionGradient: ['#1E3C72', '#7B68EE'], // Deep Blue to Medium Purple
    previewColor: '#1E3C72',
  },
];

interface CardThemeContextType {
  currentTheme: CardTheme;
  setTheme: (themeId: string) => void;
  themes: CardTheme[];
}

const CardThemeContext = createContext<CardThemeContextType | undefined>(undefined);

const STORAGE_KEY = '@card_theme';

export const CardThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<CardTheme>(cardThemes[0]);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedThemeId = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedThemeId) {
        const theme = cardThemes.find(t => t.id === savedThemeId);
        if (theme) {
          setCurrentTheme(theme);
        }
      }
    } catch (error) {
      console.error('Error loading card theme:', error);
    }
  };

  const setTheme = async (themeId: string) => {
    const theme = cardThemes.find(t => t.id === themeId);
    if (theme) {
      setCurrentTheme(theme);
      try {
        await AsyncStorage.setItem(STORAGE_KEY, themeId);
      } catch (error) {
        console.error('Error saving card theme:', error);
      }
    }
  };

  return (
    <CardThemeContext.Provider value={{ currentTheme, setTheme, themes: cardThemes }}>
      {children}
    </CardThemeContext.Provider>
  );
};

export const useCardTheme = () => {
  const context = useContext(CardThemeContext);
  if (!context) {
    throw new Error('useCardTheme must be used within a CardThemeProvider');
  }
  return context;
};