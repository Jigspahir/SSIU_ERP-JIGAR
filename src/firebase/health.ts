import app, { auth, firestoreDb, storage, analytics } from './config';

export interface FirebaseHealthStatus {
  initialized: boolean;
  appId: string;
  projectId: string;
  authConfigured: boolean;
  firestoreConfigured: boolean;
  storageConfigured: boolean;
  analyticsConfigured: boolean;
  emulatorStatus: 'ENABLED' | 'DISABLED';
  hasEnvApiKey: boolean;
  timestamp: string;
}

export interface FirebaseDiagnosticReport {
  firebase: 'CONNECTED' | 'DISCONNECTED';
  project: string;
  auth: 'READY' | 'NOT_READY';
  firestore: 'READY' | 'NOT_READY';
  storage: 'READY' | 'NOT_READY';
  emulator: 'ENABLED' | 'DISABLED';
  timestamp: string;
}

/**
 * Diagnostic health check verifying Firebase client configuration without exposing any sensitive keys
 */
export function checkFirebaseHealth(): FirebaseHealthStatus {
  const options = app.options;
  const isEmulator = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_USE_FIREBASE_EMULATOR === 'true') ||
                     (typeof process !== 'undefined' && process.env?.VITE_USE_FIREBASE_EMULATOR === 'true');

  return {
    initialized: Boolean(app && app.name),
    appId: options.appId ? `${options.appId.substring(0, 8)}...` : 'not_set',
    projectId: options.projectId || 'not_set',
    authConfigured: Boolean(auth),
    firestoreConfigured: Boolean(firestoreDb),
    storageConfigured: Boolean(storage),
    analyticsConfigured: Boolean(analytics),
    emulatorStatus: isEmulator ? 'ENABLED' : 'DISABLED',
    hasEnvApiKey: Boolean(
      (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_FIREBASE_API_KEY) ||
      (typeof process !== 'undefined' && process.env?.VITE_FIREBASE_API_KEY)
    ),
    timestamp: new Date().toISOString()
  };
}

/**
 * Safe diagnostic status summary without exposing credentials
 */
export function getFirebaseDiagnosticSummary(): FirebaseDiagnosticReport {
  const health = checkFirebaseHealth();
  return {
    firebase: health.initialized ? 'CONNECTED' : 'DISCONNECTED',
    project: health.projectId,
    auth: health.authConfigured ? 'READY' : 'NOT_READY',
    firestore: health.firestoreConfigured ? 'READY' : 'NOT_READY',
    storage: health.storageConfigured ? 'READY' : 'NOT_READY',
    emulator: health.emulatorStatus,
    timestamp: health.timestamp
  };
}
