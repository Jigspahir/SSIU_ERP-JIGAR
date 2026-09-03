import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  limit,
  orderBy,
  onSnapshot,
  Unsubscribe,
  serverTimestamp
} from 'firebase/firestore';
import { firestoreDb } from '../config';
import { FirestoreUser } from '../types';
import { User, UserRole } from '../../types';

import { withFirestoreTimeout } from '../utils';
import { initialUsers } from '../../services/seedData';

const COLLECTION_NAME = 'users';

export class FirebaseUserService {
  /**
   * Fetch single user profile by UID
   */
  public async getUser(uid: string): Promise<FirestoreUser | null> {
    try {
      const docRef = doc(firestoreDb, COLLECTION_NAME, uid);
      const snap = await withFirestoreTimeout(getDoc(docRef));
      if (!snap.exists()) {
        throw new Error('Not found in remote');
      }
      return snap.data() as FirestoreUser;
    } catch (err) {
      // Canonical fallback for demo/seed identities
      const cleanUid = uid.replace('fb-uid-', '');
      let canonical = initialUsers.find(u => u.id === uid || u.id === cleanUid || u.id === `user-${cleanUid}` || `fb-uid-${u.id}` === uid || u.username === uid || u.username === cleanUid);
      if (!canonical) {
        if (uid.includes('fac')) {
          canonical = initialUsers.find(u => u.role === 'FACULTY');
        } else if (uid.includes('student') || uid.includes('stu')) {
          canonical = initialUsers.find(u => u.role === 'STUDENT');
        } else if (uid.includes('parent')) {
          canonical = initialUsers.find(u => u.role === 'PARENT');
        } else if (uid.includes('hod')) {
          canonical = initialUsers.find(u => u.role === 'HOD');
        } else if (uid.includes('admin')) {
          canonical = initialUsers.find(u => u.role === 'SUPER_ADMIN' || u.role === 'UNIVERSITY_ADMIN');
        }
      }
      if (canonical) {
        return {
          uid,
          email: canonical.email,
          displayName: canonical.name,
          role: canonical.role,
          active: true,
          status: 'ACTIVE',
          departmentId: canonical.departmentId || 'dept-1',
          instituteId: canonical.instituteId || 'inst-sit',
          employeeId: canonical.employeeId || (canonical.role === 'FACULTY' ? 'fac-1' : undefined),
          studentId: canonical.studentId || (canonical.role === 'STUDENT' ? 'stu-1' : undefined),
          parentStudentIds: (canonical as any).parentStudentIds,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        } as FirestoreUser;
      }
      return null;
    }
  }

  /**
   * Subscribe to real-time updates for a user document
   */
  public subscribeToUser(uid: string, callback: (user: FirestoreUser | null) => void): Unsubscribe {
    const docRef = doc(firestoreDb, COLLECTION_NAME, uid);
    return onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        callback(snap.data() as FirestoreUser);
      } else {
        callback(null);
      }
    }, (error) => {
      console.error(`[FirebaseUserService] Realtime listener error for user ${uid}:`, error);
    });
  }

  /**
   * Create or update user profile
   */
  public async saveUser(user: FirestoreUser): Promise<void> {
    const docRef = doc(firestoreDb, COLLECTION_NAME, user.uid);
    await setDoc(docRef, {
      ...user,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  }

  /**
   * Update account status (e.g. LOCK, SUSPEND, ACTIVATE)
   */
  public async setAccountStatus(
    uid: string,
    status: FirestoreUser['status'],
    lockReason?: string
  ): Promise<void> {
    const docRef = doc(firestoreDb, COLLECTION_NAME, uid);
    await updateDoc(docRef, {
      status,
      active: status === 'ACTIVE',
      lockReason: lockReason || null,
      updatedAt: new Date().toISOString()
    });
  }

  /**
   * Query users with filters and pagination
   */
  public async queryUsers(filters?: {
    role?: UserRole;
    departmentId?: string;
    instituteId?: string;
    status?: string;
    pageSize?: number;
  }): Promise<FirestoreUser[]> {
    try {
      const constraints: any[] = [];

      if (filters?.role) {
        constraints.push(where('role', '==', filters.role));
      }
      if (filters?.departmentId && filters.departmentId !== 'ALL') {
        constraints.push(where('departmentId', '==', filters.departmentId));
      }
      if (filters?.instituteId && filters.instituteId !== 'ALL') {
        constraints.push(where('instituteId', '==', filters.instituteId));
      }
      if (filters?.status && filters.status !== 'ALL') {
        constraints.push(where('status', '==', filters.status));
      }

      if (filters?.pageSize) {
        constraints.push(limit(filters.pageSize));
      }

      const q = query(collection(firestoreDb, COLLECTION_NAME), ...constraints);
      const snap = await getDocs(q);

      return snap.docs.map(d => d.data() as FirestoreUser);
    } catch (err) {
      console.error('[FirebaseUserService] Error querying users:', err);
      return [];
    }
  }
}

export const firebaseUserService = new FirebaseUserService();
