import {
  collection,
  doc,
  CollectionReference,
  DocumentReference,
  Firestore
} from 'firebase/firestore';
import { firestoreDb } from './config';

/**
 * Authoritative Firestore ERP Collection Names
 */
export const FIRESTORE_COLLECTIONS = {
  USERS: 'users',
  ROLES: 'roles',
  PERMISSIONS: 'permissions',
  DEPARTMENTS: 'departments',
  PROGRAMS: 'programs',
  ACADEMIC_YEARS: 'academicYears',
  SEMESTERS: 'semesters',
  DIVISIONS: 'divisions',
  SUBJECTS: 'subjects',
  STUDENTS: 'students',
  FACULTY: 'faculty',
  FACULTY_ASSIGNMENTS: 'facultyAssignments',
  MENTOR_ASSIGNMENTS: 'mentorAssignments',
  TIMETABLE: 'timetable',
  TEACHING_SESSIONS: 'teachingSessions',
  ATTENDANCE: 'attendance',
  ATTENDANCE_REPORTS: 'attendanceReports',
  NOTICES: 'notices',
  EVENTS: 'events',
  FEEDBACK: 'feedback',
  COMPLAINTS: 'complaints',
  PTM: 'ptm',
  WORK_TRANSFERS: 'workTransfers',
  DOCUMENTS: 'documents',
  EXAMINATIONS: 'examinations',
  RESULTS: 'results',
  NOTIFICATIONS: 'notifications',
  AUDIT_LOGS: 'auditLogs',
  INSTITUTES: 'institutes'
} as const;

export type FirestoreCollectionKey = keyof typeof FIRESTORE_COLLECTIONS;
export type FirestoreCollectionName = typeof FIRESTORE_COLLECTIONS[FirestoreCollectionKey];

/**
 * Phase 1 Firestore Initialization & Collection Access Layer
 */
export class FirestoreDatabaseService {
  private readonly db: Firestore = firestoreDb;

  /**
   * Return the active Firestore client instance
   */
  public getDb(): Firestore {
    return this.db;
  }

  /**
   * Obtain a typed collection reference
   */
  public getCollection<T = any>(collectionName: FirestoreCollectionName): CollectionReference<T> {
    return collection(this.db, collectionName) as CollectionReference<T>;
  }

  /**
   * Obtain a typed document reference
   */
  public getDocRef<T = any>(collectionName: FirestoreCollectionName, documentId: string): DocumentReference<T> {
    return doc(this.db, collectionName, documentId) as DocumentReference<T>;
  }
}

export const firestoreService = new FirestoreDatabaseService();
export { firestoreDb };
