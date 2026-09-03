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
  startAfter,
  DocumentSnapshot,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { firestoreDb } from '../config';
import { FirestoreStudent } from '../types';
import { User } from '../../types';

import { withFirestoreTimeout } from '../utils';
import { db } from '../../services/db';

const COLLECTION_NAME = 'students';

export interface StudentQueryParams {
  searchQuery?: string;
  departmentId?: string;
  programId?: string;
  semesterId?: string;
  divisionId?: string;
  instituteId?: string;
  academicStanding?: string;
  status?: string;
  pageSize?: number;
  lastDoc?: DocumentSnapshot;
}

export class FirebaseStudentService {
  /**
   * Get single student by authoritative ID
   */
  public async getStudent(studentId: string): Promise<FirestoreStudent | null> {
    try {
      const docRef = doc(firestoreDb, COLLECTION_NAME, studentId);
      const snap = await withFirestoreTimeout(getDoc(docRef));
      if (snap.exists()) {
        return snap.data() as FirestoreStudent;
      }

      // Fallback query by enrollmentNo
      const q = query(collection(firestoreDb, COLLECTION_NAME), where('enrollmentNo', '==', studentId), limit(1));
      const querySnap = await withFirestoreTimeout(getDocs(q));
      if (!querySnap.empty) {
        return querySnap.docs[0].data() as FirestoreStudent;
      }

      const localStudent = db.getStudents().find(s => s.id === studentId || s.enrollmentNo === studentId);
      return (localStudent as unknown as FirestoreStudent) || null;
    } catch (err) {
      const localStudent = db.getStudents().find(s => s.id === studentId || s.enrollmentNo === studentId);
      return (localStudent as unknown as FirestoreStudent) || null;
    }
  }

  /**
   * Query students strictly respecting user role and data scope boundaries
   */
  public async getStudentsForUser(
    user: User,
    params?: StudentQueryParams
  ): Promise<{ students: FirestoreStudent[]; lastDoc?: DocumentSnapshot; totalEstimated?: number }> {
    try {
      const constraints: any[] = [];

      // 1. Enforce RBAC & Scope Boundaries
      if (user.role === 'STUDENT') {
        constraints.push(where('id', '==', user.studentId || user.id));
      } else if (user.role === 'PARENT') {
        const childIds = (user as any).parentStudentIds || [];
        if (childIds.length === 0) return { students: [] };
        // Firestore in-query supports up to 30 items
        constraints.push(where('id', 'in', childIds.slice(0, 30)));
      } else if (user.role === 'HOD') {
        if (user.departmentId) {
          constraints.push(where('departmentId', '==', user.departmentId));
        }
      } else if (user.role === 'PRINCIPAL') {
        if (user.instituteId) {
          constraints.push(where('instituteId', '==', user.instituteId));
        }
      }

      // 2. Apply Custom Filters
      if (params?.departmentId && params.departmentId !== 'ALL') {
        constraints.push(where('departmentId', '==', params.departmentId));
      }
      if (params?.programId && params.programId !== 'ALL') {
        constraints.push(where('programId', '==', params.programId));
      }
      if (params?.semesterId && params.semesterId !== 'ALL') {
        constraints.push(where('semesterId', '==', params.semesterId));
      }
      if (params?.divisionId && params.divisionId !== 'ALL') {
        constraints.push(where('divisionId', '==', params.divisionId));
      }
      if (params?.status && params.status !== 'ALL') {
        constraints.push(where('status', '==', params.status));
      }

      // 3. Apply Pagination
      const pageSize = params?.pageSize || 50;
      constraints.push(limit(pageSize));

      if (params?.lastDoc) {
        constraints.push(startAfter(params.lastDoc));
      }

      const q = query(collection(firestoreDb, COLLECTION_NAME), ...constraints);
      const snap = await withFirestoreTimeout(getDocs(q));
      if (snap.empty) {
        throw new Error('Empty snapshot, fallback to canonical');
      }

      let students = snap.docs.map(d => d.data() as FirestoreStudent);

      // In-memory text search across loaded page if search query provided
      if (params?.searchQuery) {
        const qText = params.searchQuery.toLowerCase().trim();
        students = students.filter(s =>
          s.name.toLowerCase().includes(qText) ||
          s.enrollmentNo.toLowerCase().includes(qText) ||
          s.email.toLowerCase().includes(qText) ||
          s.rollNo?.toLowerCase().includes(qText)
        );
      }

      const lastVisible = snap.docs[snap.docs.length - 1];

      return {
        students,
        lastDoc: lastVisible,
        totalEstimated: students.length
      };
    } catch (err) {
      // Offline / Local fallback to canonical dataset
      let students = (db.getStudents() as unknown as FirestoreStudent[]) || [];

      if (user.role === 'STUDENT') {
        students = students.filter(s => s.id === (user.studentId || user.id) || s.enrollmentNo === user.enrollmentNo);
      } else if (user.role === 'PARENT') {
        const childIds = new Set((user as any).parentStudentIds || []);
        students = students.filter(s => childIds.has(s.id));
      } else if (user.role === 'HOD') {
        if (user.departmentId) {
          students = students.filter(s => s.departmentId === user.departmentId || (user.departmentId === 'dept-1' && s.departmentId === 'dept-cse'));
        }
      } else if (user.role === 'PRINCIPAL') {
        if (user.instituteId) {
          students = students.filter(s => s.instituteId === user.instituteId || (user.instituteId === 'inst-1' && s.instituteId === 'inst-sit'));
        }
      }

      if (params?.departmentId && params.departmentId !== 'ALL') {
        students = students.filter(s => s.departmentId === params.departmentId);
      }
      if (params?.programId && params.programId !== 'ALL') {
        students = students.filter(s => s.programId === params.programId);
      }
      if (params?.divisionId && params.divisionId !== 'ALL') {
        students = students.filter(s => s.divisionId === params.divisionId);
      }

      if (params?.searchQuery) {
        const qText = params.searchQuery.toLowerCase().trim();
        students = students.filter(s =>
          s.name.toLowerCase().includes(qText) ||
          s.enrollmentNo.toLowerCase().includes(qText) ||
          s.email.toLowerCase().includes(qText)
        );
      }

      return {
        students: students.slice(0, params?.pageSize || 50),
        totalEstimated: students.length
      };
    }
  }

  /**
   * Save or update student master record
   */
  public async saveStudent(student: FirestoreStudent): Promise<void> {
    const docRef = doc(firestoreDb, COLLECTION_NAME, student.id);
    await setDoc(docRef, {
      ...student,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  }

  /**
   * Subscribe to real-time updates for a single student (e.g. Profile, Attendance changes)
   */
  public subscribeToStudent(studentId: string, callback: (student: FirestoreStudent | null) => void): Unsubscribe {
    const docRef = doc(firestoreDb, COLLECTION_NAME, studentId);
    return onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        callback(snap.data() as FirestoreStudent);
      } else {
        callback(null);
      }
    }, (err) => {
      console.error(`[FirebaseStudentService] Realtime listener error for student ${studentId}:`, err);
    });
  }
}

export const firebaseStudentService = new FirebaseStudentService();
