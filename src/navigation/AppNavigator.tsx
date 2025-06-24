import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BottomTabNavigator from '../components/navigation/BottomTabNavigator';
import SearchScreen from '../screens/SearchScreen';
import ReceiptDetailScreen from '../screens/ReceiptDetailScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { useTheme } from '../contexts/ThemeContext';

const Stack = createNativeStackNavigator();

export const AppNavigator = () => {
  const { theme, themeMode } = useTheme();
  
  const navigationTheme = themeMode === 'dark' ? {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      primary: theme.colors.accent.primary,
      background: theme.colors.background,
      card: theme.colors.surface,
      text: theme.colors.text.primary,
      border: theme.colors.card.border,
    },
  } : {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: theme.colors.accent.primary,
      background: theme.colors.background,
      card: theme.colors.surface,
      text: theme.colors.text.primary,
      border: theme.colors.card.border,
    },
  };
  
  try {
    return (
      <NavigationContainer theme={navigationTheme}>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Main" component={BottomTabNavigator} />
          <Stack.Screen 
            name="SearchScreen" 
            component={SearchScreen}
            options={{
              animation: 'slide_from_right',
              headerShown: false
            }}
          />
          <Stack.Screen 
            name="ReceiptDetailScreen" 
            component={ReceiptDetailScreen}
            options={{
              presentation: 'transparentModal',
              animation: 'slide_from_bottom',
              headerShown: false
            }}
          />
          <Stack.Screen 
            name="ProfileScreen" 
            component={ProfileScreen}
            options={{
              animation: 'slide_from_right',
              headerShown: false
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    );
  } catch (error) {
    // Fallback UI if navigation fails
    return (
      <View style={[styles.errorContainer, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.errorText, { color: theme.colors.accent.error }]}>
          Navigation Error: {error?.message || 'Unknown error'}
        </Text>
        <Text style={[styles.errorSubtext, { color: theme.colors.text.secondary }]}>
          Please refresh the page (Ctrl+R or Cmd+R)
        </Text>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    marginBottom: 10,
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
});