/**
 * Safe Read-Only Cache Manager for Swarrnim University Mobile Application
 * Strictly limits caching to non-sensitive summaries with read-only guarantees.
 */

import { StorageService } from './storageService';

export const CACHE_KEYS = {
  USER_PROFILE: 'swarrnim_cache_profile',
  RECENT_NOTIFICATIONS: 'swarrnim_cache_notifications',
  ATTENDANCE_SUMMARY: 'swarrnim_cache_attendance_summary',
  ACADEMIC_SUMMARY: 'swarrnim_cache_academic_summary',
  PTM_SCHEDULE: 'swarrnim_cache_ptm_schedule',
  RECENT_NOTICES: 'swarrnim_cache_notices',
} as const;

export type CacheKey = (typeof CACHE_KEYS)[keyof typeof CACHE_KEYS];

interface CacheEnvelope<T> {
  data: T;
  timestamp: number;
  isStale: boolean;
  version: string;
}

export class CacheService {
  private static DEFAULT_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
  private static CACHE_VERSION = '1.0.0';

  /**
   * Safely save allowed read-only summary data
   */
  static async set<T>(key: CacheKey, data: T): Promise<void> {
    try {
      const envelope: CacheEnvelope<T> = {
        data,
        timestamp: Date.now(),
        isStale: false,
        version: this.CACHE_VERSION,
      };
      await StorageService.setItem(key, JSON.stringify(envelope));
    } catch (error) {
      console.warn(`[CacheService] Failed to cache key ${key}:`, error);
    }
  }

  /**
   * Safely retrieve cached data with staleness validation
   */
  static async get<T>(key: CacheKey, maxAgeMs: number = this.DEFAULT_TTL_MS): Promise<{ data: T | null; isStale: boolean }> {
    try {
      const raw = await StorageService.getItem<any>(key);
      if (!raw) {
        return { data: null, isStale: true };
      }

      const envelope: CacheEnvelope<T> = typeof raw === 'string' ? JSON.parse(raw) : raw;
      const isExpired = Date.now() - envelope.timestamp > maxAgeMs;

      return {
        data: envelope.data,
        isStale: isExpired,
      };
    } catch (error) {
      console.warn(`[CacheService] Failed to read cached key ${key}:`, error);
      return { data: null, isStale: true };
    }
  }


  /**
   * Clear cached summaries on logout
   */
  static async clearAll(): Promise<void> {
    try {
      await Promise.all(
        Object.values(CACHE_KEYS).map((k) => StorageService.removeItem(k))
      );
    } catch (error) {
      console.warn('[CacheService] Failed to clear caches:', error);
    }
  }

  /**
   * Immutability guardrail: offline mutation prevention
   */
  static assertOnlineOnlyAction(actionName: string, isOnline: boolean): void {
    if (!isOnline) {
      throw new Error(
        `Action "${actionName}" requires active university network connection. Offline modification of official records is prohibited.`
      );
    }
  }
}
