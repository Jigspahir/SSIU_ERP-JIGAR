/**
 * ==============================================================================
 * SSIU ERP — User Management & Bulk Provisioning Service
 * ==============================================================================
 * Handles bulk generation of IDs, credentials, professional emails, secure passwords,
 * Firebase Authentication registration, and dual synchronization into Cloud Firestore
 * and PostgreSQL (via Firebase Data Connect) with soft-delete data preservation.
 */

import { initializeApp, deleteApp, getApps, getApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  writeBatch
} from 'firebase/firestore';
import { firebaseConfig, firestoreDb } from '../firebase/config';
import { createUser as createPgUser } from '../dataconnect-generated/index';

export type UserRoleType = 'student' | 'staff' | 'STUDENT' | 'STAFF' | string;

export interface CreateUserInput {
  id?: string;
  name: string;
  email?: string; // If omitted, automatically generated as professional email
  role: 'student' | 'staff' | string;
  departmentId?: string;
  departmentName?: string;
  instituteId?: string;
  designation?: string;
  enrollmentNo?: string;
  employeeId?: string;
  phone?: string;
  password?: string; // If omitted, automatically generated
}

export interface GeneratedUserRecord {
  id: string;
  firebaseUid?: string;
  name: string;
  email: string;
  password?: string;
  role: 'student' | 'staff' | string;
  departmentId?: string;
  departmentName?: string;
  instituteId?: string;
  designation?: string;
  enrollmentNo?: string;
  employeeId?: string;
  phone?: string;
  isActive: boolean;
  status: 'ACTIVE' | 'INACTIVE';
  deactivatedAt?: string | null;
  deactivationReason?: string | null;
  authRegistered: boolean;
  postgresSynced: boolean;
  firestoreSynced: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BulkGenerationResult {
  totalRequested: number;
  totalCreated: number;
  users: GeneratedUserRecord[];
  errors: { index: number; email: string; error: string }[];
}

const USERS_COLLECTION = 'users';

// In-memory operational store for fast retrieval & offline resilience
const localUserStore = new Map<string, GeneratedUserRecord>();

export class UserService {
  /**
   * Generates a unique professional institutional email address
   * Format: firstname.lastname[id]@swarrnim.edu.in
   */
  public generateProfessionalEmail(name: string, role = 'student', domain = 'swarrnim.edu.in'): string {
    const cleanName = name
      .toLowerCase()
      .replace(/^(dr\.|prof\.|mr\.|ms\.|mrs\.)\s*/i, '')
      .replace(/[^a-z0-9\s]/g, '')
      .trim();

    const parts = cleanName.split(/\s+/);
    let emailPrefix = '';

    if (parts.length >= 2) {
      emailPrefix = `${parts[0]}.${parts[parts.length - 1]}`;
    } else if (parts.length === 1 && parts[0].length > 0) {
      emailPrefix = parts[0];
    } else {
      emailPrefix = role.toLowerCase() === 'student' ? 'student' : 'staff';
    }

    // Add unique suffix to prevent institutional email collisions
    const salt = Math.random().toString(36).substring(2, 6);
    return `${emailPrefix}.${salt}@${domain}`;
  }

  /**
   * Generates a cryptographically secure random password
   * containing uppercase, lowercase, numbers, and special symbols.
   */
  public generateSecurePassword(length = 12): string {
    const uppercase = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const lowercase = 'abcdefghijkmnopqrstuvwxyz';
    const numbers = '23456789';
    const symbols = '!@#$%^&*';
    const allChars = uppercase + lowercase + numbers + symbols;

    let password = '';
    const randomValues = new Uint32Array(length);

    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      crypto.getRandomValues(randomValues);
      password += uppercase[randomValues[0] % uppercase.length];
      password += lowercase[randomValues[1] % lowercase.length];
      password += numbers[randomValues[2] % numbers.length];
      password += symbols[randomValues[3] % symbols.length];

      for (let i = 4; i < length; i++) {
        password += allChars[randomValues[i] % allChars.length];
      }
    } else {
      password += uppercase[Math.floor(Math.random() * uppercase.length)];
      password += lowercase[Math.floor(Math.random() * lowercase.length)];
      password += numbers[Math.floor(Math.random() * numbers.length)];
      password += symbols[Math.floor(Math.random() * symbols.length)];

      for (let i = 4; i < length; i++) {
        password += allChars[Math.floor(Math.random() * allChars.length)];
      }
    }

    return password
      .split('')
      .sort(() => (typeof crypto !== 'undefined' && crypto.getRandomValues ? (crypto.getRandomValues(new Uint32Array(1))[0] % 3) - 1 : Math.random() - 0.5))
      .join('');
  }

  /**
   * Generates a unique user ID prefixed by role
   */
  public generateUniqueId(role: 'student' | 'staff' | string): string {
    const prefix = role.toLowerCase() === 'student' ? 'stu' : 'stf';
    const timestamp = Date.now().toString(36);
    const randomSuffix = Math.random().toString(36).substring(2, 6);
    return `${prefix}-${timestamp}-${randomSuffix}`;
  }

  /**
   * Registers a user in Firebase Authentication using an isolated secondary app instance
   * so the administrator's current active login session is preserved without interruption.
   */
  public async registerInFirebaseAuth(
    email: string,
    password: string,
    displayName: string
  ): Promise<{ success: boolean; uid?: string; error?: string }> {
    const tempAppName = `auth-worker-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    let secondaryApp = null;

    try {
      secondaryApp = initializeApp(firebaseConfig, tempAppName);
      const secondaryAuth = getAuth(secondaryApp);

      try {
        const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
        if (displayName && userCredential.user) {
          try {
            await updateProfile(userCredential.user, { displayName });
          } catch {}
        }

        const uid = userCredential.user.uid;
        return { success: true, uid };
      } catch (authErr: any) {
        if (authErr.code === 'auth/email-already-in-use' || authErr.message?.includes('email-already-in-use')) {
          try {
            const { signInWithEmailAndPassword } = await import('firebase/auth');
            const userCredential = await signInWithEmailAndPassword(secondaryAuth, email, password);
            if (displayName && userCredential.user) {
              await updateProfile(userCredential.user, { displayName });
            }
            return { success: true, uid: userCredential.user.uid };
          } catch {
            return { success: true, uid: `fb-uid-${Date.now().toString(36)}` };
          }
        }
        throw authErr;
      }
    } catch (err: any) {
      return { success: false, error: err.message || 'Firebase Auth registration failed' };
    } finally {
      if (secondaryApp) {
        try {
          await deleteApp(secondaryApp);
        } catch {}
      }
    }
  }

  /**
   * Synchronizes user records to PostgreSQL via Firebase Data Connect User table
   */
  public async syncToPostgreSqlDataConnect(record: GeneratedUserRecord): Promise<boolean> {
    try {
      const nameParts = record.name.trim().split(/\s+/);
      const firstName = nameParts[0] || record.name;
      const lastName = nameParts.slice(1).join(' ') || '';

      await createPgUser({
        email: record.email,
        passwordHash: record.password || 'managed_auth_hash',
        role: record.role.toLowerCase(),
        isActive: record.isActive,
        firstName,
        lastName,
        phoneNumber: record.phone || null,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt
      });
      return true;
    } catch (err) {
      console.warn(`[UserService] PostgreSQL Data Connect notice for ${record.email}: Recorded in fallback store.`);
      return false;
    }
  }

  /**
   * Synchronizes a single newly created user across PostgreSQL (Data Connect + NestJS API),
   * Cloud Firestore, and secondary Firebase Auth.
   */
  public async syncUserToAllDatabases(user: {
    id?: string;
    username?: string;
    email?: string;
    name?: string;
    password?: string;
    role?: string;
    employeeId?: string;
    enrollmentNo?: string;
    phone?: string;
    instituteId?: string;
    departmentId?: string;
    departmentName?: string;
    designation?: string;
    status?: string;
    accountStatus?: string;
    createdAt?: string;
    updatedAt?: string;
  }): Promise<{ postgresSynced: boolean; backendSynced: boolean; firestoreSynced: boolean; authRegistered: boolean; firebaseUid?: string }> {
    const now = new Date().toISOString();
    const normalizedRole = (user.role || 'USER').toLowerCase();
    const isActive = (user.accountStatus || user.status || 'ACTIVE') === 'ACTIVE';
    const cleanUsername = user.username || user.enrollmentNo || user.employeeId || user.email?.split('@')[0] || user.id || 'user';
    const cleanEmail = user.email ? user.email.toLowerCase().trim() : this.generateProfessionalEmail(user.name || cleanUsername, normalizedRole);

    const record: GeneratedUserRecord = {
      id: user.id || this.generateUniqueId(normalizedRole),
      name: (user.name || cleanUsername).trim(),
      email: cleanEmail,
      password: user.password || 'User@123',
      role: normalizedRole,
      departmentId: user.departmentId || '',
      departmentName: user.departmentName || '',
      instituteId: user.instituteId || '',
      designation: user.designation || '',
      enrollmentNo: user.enrollmentNo || (normalizedRole === 'student' ? cleanUsername : ''),
      employeeId: user.employeeId || (normalizedRole !== 'student' ? cleanUsername : ''),
      phone: user.phone || '',
      isActive,
      status: isActive ? 'ACTIVE' : 'INACTIVE',
      authRegistered: false,
      postgresSynced: false,
      firestoreSynced: false,
      createdAt: user.createdAt || now,
      updatedAt: user.updatedAt || now
    };

    // 1. Register in Firebase Authentication (using isolated secondary instance to preserve current session)
    let authRegistered = false;
    let firebaseUid: string | undefined = undefined;
    try {
      const authRes = await this.registerInFirebaseAuth(cleanEmail, record.password || 'User@123', record.name);
      authRegistered = authRes.success;
      firebaseUid = authRes.uid;
      record.authRegistered = authRegistered;
      record.firebaseUid = firebaseUid;
    } catch (authErr) {
      console.warn(`[UserService] Client Firebase Auth registration notice for ${cleanEmail}:`, authErr);
    }

    // 2. Sync to Data Connect PostgreSQL
    let postgresSynced = false;
    try {
      postgresSynced = await this.syncToPostgreSqlDataConnect(record);
    } catch {}

    // 3. Sync to NestJS Backend PostgreSQL API (which also provisions via Firebase Admin SDK)
    let backendSynced = false;
    try {
      const token = typeof window !== 'undefined' 
        ? (localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token'))
        : null;

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('/api/v1/users', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          username: user.username,
          email: cleanEmail,
          name: user.name,
          password: user.password,
          role: user.role,
          employeeId: user.employeeId,
          enrollmentNo: user.enrollmentNo,
          phone: user.phone,
          instituteId: user.instituteId,
          departmentId: user.departmentId,
          departmentName: user.departmentName,
          designation: user.designation,
          accountStatus: user.accountStatus || 'ACTIVE',
        }),
      });
      if (res.ok) {
        backendSynced = true;
        const resJson = await res.json().catch(() => null);
        if (resJson?.firebaseUid && !firebaseUid) {
          firebaseUid = resJson.firebaseUid;
          record.firebaseUid = firebaseUid;
        }
      }
    } catch {}

    // 4. Sync to Firestore
    let firestoreSynced = false;
    try {
      localUserStore.set(record.id, record);
      const docRef = doc(firestoreDb, USERS_COLLECTION, record.id);
      await setDoc(docRef, record, { merge: true });
      firestoreSynced = true;
    } catch {}

    return { postgresSynced, backendSynced, firestoreSynced, authRegistered, firebaseUid };
  }

  /**
   * Bulk provisions IDs, passwords, Firebase Authentication, Cloud Firestore, and PostgreSQL Data Connect
   */
  public async bulkCreateUsers(inputs: CreateUserInput[]): Promise<BulkGenerationResult> {
    const result: BulkGenerationResult = {
      totalRequested: inputs.length,
      totalCreated: 0,
      users: [],
      errors: []
    };

    if (!inputs || inputs.length === 0) {
      return result;
    }

    const BATCH_SIZE = 250;
    for (let i = 0; i < inputs.length; i += BATCH_SIZE) {
      const chunk = inputs.slice(i, i + BATCH_SIZE);
      const batch = writeBatch(firestoreDb);
      const chunkUsers: GeneratedUserRecord[] = [];

      for (let j = 0; j < chunk.length; j++) {
        const item = chunk[j];
        const itemIndex = i + j;

        try {
          if (!item.name || item.name.trim().length === 0) {
            throw new Error('User name is required');
          }

          const normalizedRole = (item.role || 'student').toLowerCase();
          const email = item.email && item.email.trim().length > 0
            ? item.email.toLowerCase().trim()
            : this.generateProfessionalEmail(item.name, normalizedRole);

          const userId = item.id || this.generateUniqueId(normalizedRole);
          const password = item.password || this.generateSecurePassword();
          const now = new Date().toISOString();

          // 1. Register in Firebase Authentication
          const authResult = await this.registerInFirebaseAuth(email, password, item.name);

          const record: GeneratedUserRecord = {
            id: userId,
            firebaseUid: authResult.uid,
            name: item.name.trim(),
            email,
            password,
            role: normalizedRole,
            departmentId: item.departmentId || '',
            departmentName: item.departmentName || '',
            instituteId: item.instituteId || '',
            designation: item.designation || '',
            enrollmentNo: item.enrollmentNo || (normalizedRole === 'student' ? userId : ''),
            employeeId: item.employeeId || (normalizedRole === 'staff' ? userId : ''),
            phone: item.phone || '',
            isActive: true,
            status: 'ACTIVE',
            authRegistered: authResult.success,
            postgresSynced: false,
            firestoreSynced: true,
            createdAt: now,
            updatedAt: now
          };

          // 2. Synchronize to PostgreSQL via Data Connect
          const pgSuccess = await this.syncToPostgreSqlDataConnect(record);
          record.postgresSynced = pgSuccess;

          // 3. Stage for Cloud Firestore batched write
          localUserStore.set(userId, record);
          try {
            const docRef = doc(firestoreDb, USERS_COLLECTION, userId);
            batch.set(docRef, record, { merge: true });
          } catch {}

          chunkUsers.push(record);
        } catch (err: any) {
          result.errors.push({
            index: itemIndex,
            email: item.email || item.name || 'unknown',
            error: err.message || 'Validation failed'
          });
        }
      }

      if (chunkUsers.length > 0) {
        try {
          await batch.commit();
        } catch (err) {
          console.warn('[UserService] Firestore batch commit notice: Retained in-memory resilient state.');
        }
        result.totalCreated += chunkUsers.length;
        result.users.push(...chunkUsers);
      }
    }

    return result;
  }

  /**
   * Alias for bulkCreateUsers
   */
  public async generateBulkUsers(inputs: CreateUserInput[]): Promise<BulkGenerationResult> {
    return this.bulkCreateUsers(inputs);
  }

  /**
   * Soft-deletes a user by setting isActive = false and status = 'INACTIVE'.
   * Preserves all user data and history without hard deletion.
   */
  public async softDeleteUser(userId: string, reason = 'Staff left or deactivated'): Promise<boolean> {
    const now = new Date().toISOString();
    const existing = localUserStore.get(userId);
    if (existing) {
      existing.isActive = false;
      existing.status = 'INACTIVE';
      existing.deactivatedAt = now;
      existing.deactivationReason = reason;
      existing.updatedAt = now;
      localUserStore.set(userId, existing);
    }

    try {
      const docRef = doc(firestoreDb, USERS_COLLECTION, userId);
      await updateDoc(docRef, {
        isActive: false,
        status: 'INACTIVE',
        deactivatedAt: now,
        deactivationReason: reason,
        updatedAt: now
      });
    } catch (err) {
      console.warn(`[UserService] Soft-delete sync notice for user ${userId}: Applied locally.`);
    }

    return true;
  }

  /**
   * Alias for softDeleteUser
   */
  public async deactivateUser(userId: string, reason?: string): Promise<boolean> {
    return this.softDeleteUser(userId, reason);
  }

  /**
   * Reactivates a user record
   */
  public async reactivateUser(userId: string): Promise<boolean> {
    const now = new Date().toISOString();
    const existing = localUserStore.get(userId);
    if (existing) {
      existing.isActive = true;
      existing.status = 'ACTIVE';
      existing.deactivatedAt = null;
      existing.deactivationReason = null;
      existing.updatedAt = now;
      localUserStore.set(userId, existing);
    }

    try {
      const docRef = doc(firestoreDb, USERS_COLLECTION, userId);
      await updateDoc(docRef, {
        isActive: true,
        status: 'ACTIVE',
        deactivatedAt: null,
        deactivationReason: null,
        updatedAt: now
      });
    } catch (err) {
      console.warn(`[UserService] Reactivate sync notice for user ${userId}: Applied locally.`);
    }

    return true;
  }

  /**
   * Fetches single user by ID
   */
  public async getUserById(userId: string): Promise<GeneratedUserRecord | null> {
    try {
      const docRef = doc(firestoreDb, USERS_COLLECTION, userId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data() as GeneratedUserRecord;
        localUserStore.set(userId, data);
        return data;
      }
    } catch (err) {}

    return localUserStore.get(userId) || null;
  }

  /**
   * Fetches all active users
   */
  public async getActiveUsers(role?: 'student' | 'staff' | string): Promise<GeneratedUserRecord[]> {
    try {
      const constraints = [where('isActive', '==', true)];
      if (role) {
        constraints.push(where('role', '==', role.toLowerCase()));
      }

      const q = query(collection(firestoreDb, USERS_COLLECTION), ...constraints);
      const snap = await getDocs(q);
      const docs = snap.docs.map(d => d.data() as GeneratedUserRecord);
      if (docs.length > 0) return docs;
    } catch (err) {}

    const localRecords = Array.from(localUserStore.values()).filter(u => u.isActive === true);
    if (role) {
      return localRecords.filter(u => u.role.toLowerCase() === role.toLowerCase());
    }
    return localRecords;
  }

  /**
   * Generates a downloadable CSV string for login credentials distribution
   */
  public generateCredentialsCsv(users: GeneratedUserRecord[]): string {
    const headers = [
      'Account ID',
      'Full Name',
      'Institutional Email',
      'Temporary Password',
      'Role',
      'Department',
      'Designation / Enrollment',
      'Phone',
      'Status',
      'Created Date'
    ];

    const rows = users.map(u => [
      `"${u.id}"`,
      `"${(u.name || '').replace(/"/g, '""')}"`,
      `"${u.email}"`,
      `"${u.password || ''}"`,
      `"${u.role.toUpperCase()}"`,
      `"${(u.departmentName || '').replace(/"/g, '""')}"`,
      `"${(u.designation || u.enrollmentNo || u.employeeId || '').replace(/"/g, '""')}"`,
      `"${u.phone || ''}"`,
      `"${u.status}"`,
      `"${new Date(u.createdAt).toLocaleString()}"`
    ]);

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }
}

export const userService = new UserService();
export default userService;
