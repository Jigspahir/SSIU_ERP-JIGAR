import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { StorageService } from './storageService';
import { CONFIG } from '../constants/config';
import { api } from './api';
import { API_ROUTES } from '../constants/apiRoutes';

// Configure notification presentation for foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export class PushNotificationService {
  /**
   * Register device for push notifications and obtain token
   */
  static async registerForPushNotificationsAsync(): Promise<string | null> {
    let token: string | null = null;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('swarrnim_erp_default', {
        name: 'Swarrnim University Notifications',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#F59E0B',
        sound: 'default',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Failed to get push notification permission on this device.');
        return null;
      }

      try {
        const tokenData = await Notifications.getExpoPushTokenAsync({
          projectId: process.env.EXPO_PUBLIC_PUSH_PROJECT_ID || 'swarrnim-erp-mobile-app',
        });
        token = tokenData.data;
        console.log('Registered Expo Push Token:', token);

        if (token) {
          await StorageService.setItem(CONFIG.STORAGE_KEYS.PUSH_TOKEN, token);
          // Register token to backend
          await this.syncDeviceTokenWithBackend(token);
        }
      } catch (error) {
        console.warn('Error fetching push token:', error);
      }
    } else {
      console.log('Push notifications require physical hardware device testing.');
    }

    return token;
  }

  /**
   * Send the registered device token to backend
   */
  static async syncDeviceTokenWithBackend(deviceToken: string): Promise<void> {
    try {
      await api.post(API_ROUTES.PUSH.REGISTER_TOKEN, {
        token: deviceToken,
        platform: Platform.OS.toUpperCase(),
        deviceInfo: `${Device.brand || 'Device'} ${Device.modelName || ''}`,
      });
      console.log('Device token synchronized successfully with Swarrnim ERP backend.');
    } catch (e: any) {
      console.log('Backend push registration call queued:', e?.message);
    }
  }

  /**
   * Send local test notification for demonstration
   */
  static async sendLocalNotification(title: string, body: string, data: Record<string, any> = {}): Promise<void> {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
      },
      trigger: null, // deliver immediately
    });
  }
}
