import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getApps, initializeApp, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';

@Injectable()
export class FirebaseAdminService implements OnModuleInit {
  private readonly logger = new Logger(FirebaseAdminService.name);
  private app: App;
  private db: Firestore;
  private auth: Auth;

  constructor(private readonly configService?: ConfigService) {}

  onModuleInit() {
    this.initializeFirebaseAdmin();
  }

  private initializeFirebaseAdmin() {
    const existingApps = getApps();
    if (existingApps.length > 0) {
      this.app = existingApps[0]!;
    } else {
      const projectId = this.configService?.get<string>('FIREBASE_PROJECT_ID') || process.env.FIREBASE_PROJECT_ID || 'swarrnim-erp-prod';
      const clientEmail = this.configService?.get<string>('FIREBASE_CLIENT_EMAIL') || process.env.FIREBASE_CLIENT_EMAIL;
      const rawPrivateKey = this.configService?.get<string>('FIREBASE_PRIVATE_KEY') || process.env.FIREBASE_PRIVATE_KEY;
      const privateKey = rawPrivateKey?.replace(/\\n/g, '\n');
      const isProduction = (this.configService?.get<string>('NODE_ENV') || process.env.NODE_ENV) === 'production';

      if (clientEmail && privateKey) {
        this.app = initializeApp({
          credential: cert({
            projectId,
            clientEmail,
            privateKey
          }),
          projectId
        });
        this.logger.log(`[FirebaseAdmin] Initialized Firebase Admin SDK with Service Account credentials for project: ${projectId}`);
      } else {
        if (isProduction && !process.env.FIREBASE_AUTH_EMULATOR_HOST && !process.env.FIRESTORE_EMULATOR_HOST) {
          this.logger.warn(`[FirebaseAdmin] WARNING: FIREBASE_CLIENT_EMAIL or FIREBASE_PRIVATE_KEY not provided in production. Falling back to Application Default Credentials.`);
        }
        // Application Default Credentials or Development Default
        this.app = initializeApp({
          projectId
        });
        this.logger.log(`[FirebaseAdmin] Initialized Firebase Admin SDK with Project ID: ${projectId}`);
      }
    }

    this.db = getFirestore(this.app);
    this.auth = getAuth(this.app);
  }

  public getApp(): App {
    return this.app;
  }

  public getFirestore(): Firestore {
    return this.db;
  }

  public getAuth(): Auth {
    return this.auth;
  }

  public async verifyConnection(): Promise<boolean> {
    try {
      if (!this.db) return false;
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Set custom claims for role-based authorization
   */
  public async setCustomUserClaims(uid: string, claims: {
    role: string;
    departmentId?: string;
    instituteId?: string;
    studentId?: string;
    employeeId?: string;
  }): Promise<void> {
    try {
      await this.auth.setCustomUserClaims(uid, claims);
      this.logger.log(`[FirebaseAdmin] Set custom claims for UID: ${uid} (Role: ${claims.role})`);
    } catch (err) {
      this.logger.error(`[FirebaseAdmin] Failed to set claims for UID: ${uid}`, err);
    }
  }

  /**
   * Batch write documents into a Firestore collection
   */
  public async batchWrite<T extends { id: string }>(collectionName: string, items: T[]): Promise<number> {
    const firestore = this.getFirestore();
    const batchSize = 450; // Firestore limit is 500 operations per batch
    let committed = 0;

    for (let i = 0; i < items.length; i += batchSize) {
      const chunk = items.slice(i, i + batchSize);
      const batch = firestore.batch();

      for (const item of chunk) {
        const docRef = firestore.collection(collectionName).doc(item.id);
        batch.set(docRef, item, { merge: true });
      }

      await batch.commit();
      committed += chunk.length;
    }

    this.logger.log(`[FirebaseAdmin] Batch wrote ${committed} records to collection: '${collectionName}'`);
    return committed;
  }
}
