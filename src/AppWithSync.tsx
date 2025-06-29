import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { Provider as PaperProvider } from 'react-native-paper';
import Toast from 'react-native-toast-message';

import { AppNavigator } from './navigation/AppNavigator';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { ErrorProvider } from './contexts/ErrorContext';
import { NetworkStatusProvider } from './contexts/NetworkStatusContext';
import { SyncProvider } from './contexts/SyncContext';
import { SyncStatusBar } from './components/sync/SyncStatusBar';
import { OfflineBanner } from './components/sync/OfflineBanner';
import { SyncNotification } from './components/sync/SyncNotification';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function AppWithSync() {
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
            <NetworkStatusProvider 
              syncInterval={60000} // Sync every minute when online
              onNetworkChange={(status) => {
                console.log('Network status changed:', status);
              }}
            >
              <SyncProvider>
                <PaperProvider>
                  <StatusBar style="auto" />
                  
                  {/* Global sync status indicators */}
                  <SyncStatusBar />
                  <OfflineBanner position="bottom" />
                  <SyncNotification position="top" />
                  
                  {/* Main app navigation */}
                  <AppNavigator />
                  
                  <Toast />
                </PaperProvider>
              </SyncProvider>
            </NetworkStatusProvider>
          </ErrorProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}