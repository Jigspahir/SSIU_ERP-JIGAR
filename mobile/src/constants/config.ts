export const CONFIG = {
  APP_NAME: 'Swarrnim University ERP',
  UNIVERSITY_FULL_NAME: 'Swarrnim Startup & Innovation University',
  TAGLINE: 'Where Ideas Take Flight',
  VERSION: '1.0.0 (Build 101)',
  SUPPORT_EMAIL: 'erp-support@swarrnim.edu.in',
  SUPPORT_PHONE: '+91 79 4000 5000',
  PORTAL_URL: 'https://erp.swarrnim.edu.in',
  DEFAULT_API_URL: 'http://localhost:3000',

  // Session & Security Config
  SESSION: {
    TIMEOUT_MS: 30 * 60 * 1000, // 30 minutes inactivity timeout
    TOKEN_REFRESH_THRESHOLD_MS: 5 * 60 * 1000, // 5 minutes before expiry
  },

  // Storage Keys
  STORAGE_KEYS: {
    AUTH_TOKEN: 'ssiu_mobile_jwt_token',
    REFRESH_TOKEN: 'ssiu_mobile_refresh_token',
    USER_PROFILE: 'ssiu_mobile_user_profile',
    ACTIVE_ROLE: 'ssiu_mobile_active_role',
    SELECTED_CHILD_ID: 'ssiu_mobile_selected_child_id',
    LAST_ACTIVITY: 'ssiu_mobile_last_activity_timestamp',
    PUSH_TOKEN: 'ssiu_mobile_push_device_token',
    CACHE_ATTENDANCE: 'ssiu_mobile_cache_attendance',
    CACHE_NOTIFICATIONS: 'ssiu_mobile_cache_notifications',
    CACHE_DIARY: 'ssiu_mobile_cache_diary',
  },


  // Deep Link Configuration
  DEEP_LINK: {
    SCHEME: 'swarrnimerp',
    PREFIXES: ['swarrnimerp://', 'https://erp.swarrnim.edu.in/app/'],
  },
};
