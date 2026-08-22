import * as Linking from 'expo-linking';
import { CONFIG } from '../constants/config';

export class DeepLinkService {
  /**
   * Generates a deep link URL for in-app or push routing
   */
  static createLink(path: string, queryParams?: Record<string, string>): string {
    return Linking.createURL(path, {
      queryParams,
      scheme: CONFIG.DEEP_LINK.SCHEME,
    });
  }

  /**
   * Parse incoming URL into route and params
   */
  static parseUrl(url: string) {
    const parsed = Linking.parse(url);
    return {
      hostname: parsed.hostname,
      path: parsed.path,
      queryParams: parsed.queryParams,
    };
  }

  /**
   * React Navigation linking configuration
   */
  static linkingConfig = {
    prefixes: CONFIG.DEEP_LINK.PREFIXES,
    config: {
      screens: {
        MainTabs: {
          screens: {
            HomeTab: 'home',
            ActivityTab: 'activity',
            NotificationsTab: 'notifications',
            ProfileTab: 'profile',
            MoreTab: 'more',
          },
        },
        NotificationDetail: 'notification/:id',
        CreateRequest: 'requests/new',
        CreateComplaint: 'complaints/new',
        PTMDetail: 'ptm/:id',
      },
    },
  };
}
