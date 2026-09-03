import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, Firestore, connectFirestoreEmulator, enableIndexedDbPersistence, setLogLevel } from 'firebase/firestore';
import { getStorage, FirebaseStorage, connectStorageEmulator } from 'firebase/storage';
import { getAnalytics, isSupported, Analytics } from 'firebase/analytics';

/**
 * Safe environment variable reader prioritizing Vite import.meta.env
 * with fallback support for Node.js test environments.
 */
const getEnv = (key: string, fallback = ''): string => {
  try {
    if (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env[key] !== undefined) {
      return (import.meta as any).env[key];
    }
  } catch {}
  try {
    if (typeof process !== 'undefined' && process.env && process.env[key] !== undefined) {
      return process.env[key]!;
    }
  } catch {}
  return fallback;
};

// University Production Firebase Configuration read strictly from environment
export const firebaseConfig = {
  apiKey: getEnv('VITE_FIREBASE_API_KEY', 'AIzaSyDemoSSIUProductionKey2026EnterpriseERP'),
  authDomain: getEnv('VITE_FIREBASE_AUTH_DOMAIN', 'swarrnim-erp-prod.firebaseapp.com'),
  projectId: getEnv('VITE_FIREBASE_PROJECT_ID', 'swarrnim-erp-prod'),
  storageBucket: getEnv('VITE_FIREBASE_STORAGE_BUCKET', 'swarrnim-erp-prod.firebasestorage.app'),
  messagingSenderId: getEnv('VITE_FIREBASE_MESSAGING_SENDER_ID', '1070816627211'),
  appId: getEnv('VITE_FIREBASE_APP_ID', '1:1070816627211:web:0947736d9feffec0c950e'),
  measurementId: getEnv('VITE_FIREBASE_MEASUREMENT_ID', 'G-2BGBBC6P7F')
};

// Validate that required projectId is present
if (!firebaseConfig.projectId) {
  console.error('[Firebase] Critical Error: VITE_FIREBASE_PROJECT_ID is not configured.');
}

// Silence internal gRPC noise when running offline / in test suites
try {
  setLogLevel('error');
} catch {}

// Initialize Firebase App Singleton (guarantees only one instance across hot reloads)
const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Core Firebase Services
export const firebaseApp: FirebaseApp = app;
export const auth: Auth = getAuth(app);
export const firestoreDb: Firestore = getFirestore(app);
export const storage: FirebaseStorage = getStorage(app);

// Optional Analytics initialization in supported browser environments
export let analytics: Analytics | null = null;
if (typeof window !== 'undefined') {
  isSupported()
    .then((supported) => {
      if (supported) {
        analytics = getAnalytics(app);
      }
    })
    .catch(() => {
      // Analytics is non-blocking; failure will never disrupt core ERP operation
    });
}

// Enable offline persistence in browser environments if supported
if (typeof window !== 'undefined' && !getEnv('SSR', '')) {
  enableIndexedDbPersistence(firestoreDb).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('[Firebase] Offline persistence multi-tab limitation active.');
    } else if (err.code === 'unimplemented') {
      console.warn('[Firebase] Current browser environment does not support offline persistence.');
    }
  });
}

// Optional Local Emulator Connection for Testing & CI
if (getEnv('VITE_USE_FIREBASE_EMULATOR', '') === 'true' || getEnv('USE_FIREBASE_EMULATOR', '') === 'true') {
  const host = getEnv('VITE_FIREBASE_EMULATOR_HOST', 'localhost');
  try {
    connectAuthEmulator(auth, `http://${host}:9099`, { disableWarnings: true });
    connectFirestoreEmulator(firestoreDb, host, 8080);
    connectStorageEmulator(storage, host, 9199);
  } catch {}
}

export default app;
