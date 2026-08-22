import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { THEME } from '../constants/theme';
import { RootStackParamList } from '../types/navigation';
import { AuthNavigator } from './AuthNavigator';
import { MainTabNavigator } from './MainTabNavigator';

// Common Modals & Global Screens
import { NotificationDetailScreen } from '../screens/common/NotificationDetailScreen';
import { CreateRequestScreen } from '../screens/common/CreateRequestScreen';
import { CreateComplaintScreen } from '../screens/common/CreateComplaintScreen';
import { DocumentViewerScreen } from '../screens/common/DocumentViewerScreen';
import { NotificationPreferencesScreen } from '../screens/common/NotificationPreferencesScreen';

const RootStack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={THEME.colors.accent} />
      </View>
    );
  }

  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <RootStack.Group>
          <RootStack.Screen name="MainTabs" component={MainTabNavigator} />
          <RootStack.Screen
            name="NotificationDetail"
            component={NotificationDetailScreen}
            options={{ presentation: 'card' }}
          />
          <RootStack.Screen
            name="NotificationPreferences"
            component={NotificationPreferencesScreen as any}
            options={{ presentation: 'card' }}
          />
          <RootStack.Screen
            name="CreateRequest"
            component={CreateRequestScreen}
            options={{ presentation: 'card' }}
          />
          <RootStack.Screen
            name="CreateComplaint"
            component={CreateComplaintScreen}
            options={{ presentation: 'card' }}
          />
          <RootStack.Screen
            name="DocumentViewer"
            component={DocumentViewerScreen}
            options={{ presentation: 'card' }}
          />
        </RootStack.Group>
      ) : (
        <RootStack.Screen name="Auth" component={AuthNavigator} />
      )}
    </RootStack.Navigator>
  );
};


const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: THEME.colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
