declare const require: any;

const memoryStore = new Map<string, string>();

export class StorageService {
  // ─── SECURE STORAGE (Tokens, Sensitive Credentials) ─────────────
  static async setSecureItem(key: string, value: string): Promise<void> {
    try {
      const SecureStore = require('expo-secure-store');
      if (SecureStore && SecureStore.setItemAsync) {
        await SecureStore.setItemAsync(key, value, {
          keychainAccessible: SecureStore.WHEN_UNLOCKED,
        });
        return;
      }
    } catch (e) {
      // Fallback for tests/environments where SecureStore is unavailable
    }
    memoryStore.set(key, value);
  }

  static async getSecureItem(key: string): Promise<string | null> {
    try {
      const SecureStore = require('expo-secure-store');
      if (SecureStore && SecureStore.getItemAsync) {
        const val = await SecureStore.getItemAsync(key);
        if (val !== null) return val;
      }
    } catch (e) {
      // Fallback for tests/environments where SecureStore is unavailable
    }
    return memoryStore.get(key) || null;
  }

  static async removeSecureItem(key: string): Promise<void> {
    try {
      const SecureStore = require('expo-secure-store');
      if (SecureStore && SecureStore.deleteItemAsync) {
        await SecureStore.deleteItemAsync(key);
      }
    } catch (e) {}
    memoryStore.delete(key);
  }

  // ─── REGULAR STORAGE (Non-Sensitive App State, Caching) ──────────
  static async setItem<T>(key: string, value: T): Promise<void> {
    const jsonValue = typeof value === 'string' ? value : JSON.stringify(value);
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      if (AsyncStorage && AsyncStorage.setItem) {
        await AsyncStorage.setItem(key, jsonValue);
        return;
      }
    } catch (e) {}
    memoryStore.set(key, jsonValue);
  }

  static async getItem<T>(key: string): Promise<T | null> {
    let raw: string | null = null;
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      if (AsyncStorage && AsyncStorage.getItem) {
        raw = await AsyncStorage.getItem(key);
      }
    } catch (e) {}

    if (raw == null) {
      raw = memoryStore.get(key) || null;
    }

    if (raw == null) return null;

    try {
      return JSON.parse(raw);
    } catch (e) {
      return raw as unknown as T;
    }
  }

  static async removeItem(key: string): Promise<void> {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      if (AsyncStorage && AsyncStorage.removeItem) {
        await AsyncStorage.removeItem(key);
      }
    } catch (e) {}
    memoryStore.delete(key);
  }

  static async clearAll(): Promise<void> {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      if (AsyncStorage && AsyncStorage.clear) {
        await AsyncStorage.clear();
      }
    } catch (e) {}
    memoryStore.clear();
  }
}
