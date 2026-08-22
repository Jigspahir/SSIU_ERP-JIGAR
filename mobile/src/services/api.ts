import { CONFIG } from '../constants/config';
import { StorageService } from './storageService';

export interface ApiResponse<T = any> {
  data: T;
  status: number;
  ok: boolean;
}

class ApiClient {
  private getBaseUrl(): string {
    const envObj = typeof globalThis !== 'undefined' ? (globalThis as any).process?.env : undefined;
    if (envObj?.EXPO_PUBLIC_API_URL) {
      return envObj.EXPO_PUBLIC_API_URL;
    }
    return CONFIG.DEFAULT_API_URL;
  }


  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = endpoint.startsWith('http') ? endpoint : `${this.getBaseUrl()}${endpoint}`;
    const token = await StorageService.getSecureItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Client-Platform': 'MOBILE_APP',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...((options.headers as Record<string, string>) || {}),
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      let data: any = null;
      try {
        data = await response.json();
      } catch (e) {
        data = null;
      }

      // Handle 401 Unauthorized token refresh
      if (response.status === 401) {
        const refreshToken = await StorageService.getSecureItem(CONFIG.STORAGE_KEYS.REFRESH_TOKEN);
        if (refreshToken) {
          try {
            const refreshRes = await fetch(`${this.getBaseUrl()}/api/v1/auth/refresh`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ refreshToken }),
            });
            const refreshData = await refreshRes.json();
            if (refreshData?.accessToken) {
              await StorageService.setSecureItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN, refreshData.accessToken);
              // Retry original request with new token
              headers.Authorization = `Bearer ${refreshData.accessToken}`;
              const retryRes = await fetch(url, { ...options, headers });
              const retryData = await retryRes.json();
              return { data: retryData, status: retryRes.status, ok: retryRes.ok };
            }
          } catch (refErr) {
            await StorageService.removeSecureItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
            await StorageService.removeSecureItem(CONFIG.STORAGE_KEYS.REFRESH_TOKEN);
          }
        }
      }

      if (!response.ok) {
        throw new Error(data?.message || `HTTP error ${response.status}`);
      }

      return { data, status: response.status, ok: response.ok };
    } catch (error: any) {
      throw error;
    }
  }

  public get<T = any>(endpoint: string, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET', headers });
  }

  public post<T = any>(endpoint: string, body?: any, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public put<T = any>(endpoint: string, body?: any, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public delete<T = any>(endpoint: string, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE', headers });
  }
}

export const api = new ApiClient();
