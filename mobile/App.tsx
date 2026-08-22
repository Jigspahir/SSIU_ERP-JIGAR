import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './src/context/AuthContext';
import { NetworkProvider } from './src/context/NetworkContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { OfflineNotice } from './src/components/common/OfflineNotice';
import { DeepLinkService } from './src/services/deepLinkService';
import { THEME } from './src/constants/theme';

export default function App() {
  return (
    <SafeAreaProvider>
      <NetworkProvider>
        <AuthProvider>
          <NavigationContainer linking={DeepLinkService.linkingConfig as any}>
            <StatusBar style="light" backgroundColor={THEME.colors.primaryDark} />

            <SafeAreaView style={{ flex: 1, backgroundColor: THEME.colors.primaryDark }} edges={['top']}>
              <OfflineNotice />
              <RootNavigator />
            </SafeAreaView>
          </NavigationContainer>
        </AuthProvider>
      </NetworkProvider>
    </SafeAreaProvider>
  );
}
