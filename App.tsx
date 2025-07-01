// Apply web style patches before any React Native imports
// Using static import with conditional execution for Metro bundler compatibility
import { Platform } from 'react-native';
import { applyWebStylePatches } from './src/utils/webStylePatches';

// Apply patches only on web platform
if (Platform.OS === 'web') {
  try {
    console.log('[App] Applying web style patches...');
    applyWebStylePatches();
  } catch (error) {
    console.error('[App] Failed to apply web style patches:', error);
  }
}

import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { Provider as PaperProvider } from 'react-native-paper';
import Toast from 'react-native-toast-message';

import { AppNavigator } from './src/navigation/AppNavigator';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { AuthProvider } from './src/contexts/AuthContext';
import { ErrorProvider } from './src/contexts/ErrorContext';
import { ReceiptProvider } from './src/contexts/ReceiptContext';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function App() {
  useEffect(() => {
    async function prepare() {
      try {
        // Pre-load fonts, make any API calls you need to do here
        // await Font.loadAsync({
        //   'custom-font': require('./assets/fonts/custom-font.ttf'),
        // });
        
        // Artificially delay for demo purposes
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (e) {
        console.warn(e);
      } finally {
        // Tell the application to render
        await SplashScreen.hideAsync();
      }
    }

    prepare();
  }, []);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <ErrorProvider>
            <ReceiptProvider>
              <PaperProvider>
                <StatusBar style="auto" />
                <AppNavigator />
                <Toast />
              </PaperProvider>
            </ReceiptProvider>
          </ErrorProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}