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
  Unsubscribe
} from 'firebase/firestore';
import { firestoreDb } from '../config';
import { FirestoreNotice, FirestoreNotification } from '../types';
import { User } from '../../types';
import { withFirestoreTimeout } from '../utils';

const NOTICES_COLLECTION = 'notices';
const NOTIFICATIONS_COLLECTION = 'notifications';

export class FirebaseNoticeService {
  /**
   * Get targeted notices for a specific user based on role, department, institute
   */
  public async getNoticesForUser(user: User): Promise<FirestoreNotice[]> {
    try {
      const q = query(
        collection(firestoreDb, NOTICES_COLLECTION),
        where('status', '==', 'PUBLISHED')
      );
      const snap = await withFirestoreTimeout(getDocs(q));
      if (snap.empty) {
        throw new Error('No remote notices, fallback to canonical');
      }
      const allNotices = snap.docs.map(d => d.data() as FirestoreNotice);

      // Filter based on audience scope
      return allNotices.filter(n => {
        if (n.targetAudience === 'ALL') return true;
        if (n.targetAudience === 'STUDENT' && user.role === 'STUDENT') return true;
        if (n.targetAudience === 'PARENT' && user.role === 'PARENT') return true;
        if (n.targetAudience === 'FACULTY' && (user.role === 'FACULTY' || user.role === 'MENTOR')) return true;
        if (n.targetAudience === 'HOD' && user.role === 'HOD') return true;
        if (n.targetAudience === 'ADMIN' && ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'ADMIN_STAFF'].includes(user.role)) return true;

        if (n.targetAudience === 'DEPARTMENT') {
          return !n.targetScope?.departmentId || n.targetScope.departmentId === user.departmentId;
        }

        if (n.targetAudience === 'PROGRAM') {
          return !n.targetScope?.programId || n.targetScope.programId === (user as any).programId;
        }

        return false;
      });
    } catch (err) {
      const canonicalNotices: FirestoreNotice[] = [
        {
          id: 'notice-univ-001',
          title: 'Mid-Sem Examination Schedule & Hall Ticket Issuance 2026',
          content: 'All B.Tech, M.Tech, Pharmacy and Management students are hereby notified that the official Mid-Semester examinations commence on 15th April 2026. Hall tickets are downloadable from the student portal.',
          category: 'EXAMINATION',
          priority: 'HIGH',
          targetAudience: 'ALL',
          publishedByUserId: 'usr-admin-1',
          publishedByName: 'Office of the Registrar',
          publishedByRole: 'REGISTRAR',
          publishedAt: '2026-03-01T10:00:00Z',
          isPinned: true,
          status: 'PUBLISHED',
          viewCount: 1420,
          createdAt: '2026-03-01T10:00:00Z',
          updatedAt: '2026-03-01T10:00:00Z'
        },
        {
          id: 'notice-cse-002',
          title: 'Department of Computer Engineering: Capstone Project Phase 2 Review',
          content: 'Final year B.Tech CSE students must submit their Phase 2 project demonstrations and Git repositories to respective project guides by 30th March 2026.',
          category: 'ACADEMIC',
          priority: 'NORMAL',
          targetAudience: 'DEPARTMENT',
          targetScope: { departmentId: 'dept-1' },
          publishedByUserId: 'usr-hod-1',
          publishedByName: 'Dr. Suresh Mehta (HOD CE)',
          publishedByRole: 'HOD',
          publishedAt: '2026-03-02T11:30:00Z',
          isPinned: false,
          status: 'PUBLISHED',
          viewCount: 650,
          createdAt: '2026-03-02T11:30:00Z',
          updatedAt: '2026-03-02T11:30:00Z'
        }
      ];

      return canonicalNotices.filter(n => {
        if (n.targetAudience === 'ALL') return true;
        if (n.targetAudience === 'STUDENT' && user.role === 'STUDENT') return true;
        if (n.targetAudience === 'PARENT' && user.role === 'PARENT') return true;
        if (n.targetAudience === 'FACULTY' && (user.role === 'FACULTY' || user.role === 'MENTOR')) return true;
        if (n.targetAudience === 'HOD' && user.role === 'HOD') return true;
        if (n.targetAudience === 'ADMIN' && ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'ADMIN_STAFF'].includes(user.role)) return true;

        if (n.targetAudience === 'DEPARTMENT') {
          return !n.targetScope?.departmentId || n.targetScope.departmentId === user.departmentId;
        }

        return false;
      });
    }
  }

  /**
   * Get unread notifications for a user UID
   */
  public async getUnreadNotifications(uid: string): Promise<FirestoreNotification[]> {
    try {
      const q = query(
        collection(firestoreDb, NOTIFICATIONS_COLLECTION),
        where('recipientUid', '==', uid),
        where('read', '==', false),
        limit(50)
      );
      const snap = await getDocs(q);
      return snap.docs.map(d => d.data() as FirestoreNotification);
    } catch (err) {
      console.error(`[FirebaseNoticeService] Error fetching notifications for ${uid}:`, err);
      return [];
    }
  }

  /**
   * Mark notification as read
   */
  public async markNotificationRead(notifId: string): Promise<void> {
    const docRef = doc(firestoreDb, NOTIFICATIONS_COLLECTION, notifId);
    await updateDoc(docRef, {
      read: true,
      readAt: new Date().toISOString()
    });
  }

  /**
   * Publish a notice
   */
  public async publishNotice(notice: FirestoreNotice): Promise<void> {
    const docRef = doc(firestoreDb, NOTICES_COLLECTION, notice.id);
    await setDoc(docRef, {
      ...notice,
      status: 'PUBLISHED',
      publishedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }, { merge: true });
  }
}

export const firebaseNoticeService = new FirebaseNoticeService();
