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
  writeBatch,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { firestoreDb } from '../config';
import {
  FirestoreTeachingSession,
  FirestoreAttendanceRecord,
  FirestoreAttendanceReport
} from '../types';
import { User } from '../../types';

import { withFirestoreTimeout } from '../utils';

const SESSIONS_COLLECTION = 'teachingSessions';
const ATTENDANCE_COLLECTION = 'attendance';
const REPORTS_COLLECTION = 'attendanceReports';

export interface MarkAttendanceParams {
  sessionId: string;
  subjectId: string;
  subjectCode?: string;
  subjectName?: string;
  divisionId: string;
  divisionName?: string;
  departmentId: string;
  programId: string;
  academicYearId: string;
  semesterId: string;
  facultyId: string;
  facultyName: string;
  date: string;
  lectureNumber: number;
  timeSlot: string;
  room: string;
  topicTaught: string;
  records: {
    studentId: string;
    studentName: string;
    enrollmentNo: string;
    status: 'PRESENT' | 'ABSENT' | 'LATE' | 'ON_DUTY';
    remarks?: string;
  }[];
}

export class FirebaseAttendanceService {
  /**
   * Check if an attendance session already exists for the given subject, division, date and lecture number
   */
  public async checkDuplicateSession(params: {
    subjectId: string;
    divisionId: string;
    date: string;
    lectureNumber: number;
    excludeSessionId?: string;
  }): Promise<boolean> {
    try {
      const q = query(
        collection(firestoreDb, SESSIONS_COLLECTION),
        where('subjectId', '==', params.subjectId),
        where('divisionId', '==', params.divisionId),
        where('date', '==', params.date),
        where('lectureNumber', '==', params.lectureNumber),
        where('status', '==', 'SUBMITTED')
      );
      const snap = await withFirestoreTimeout(getDocs(q));
      if (snap.empty) return false;

      if (params.excludeSessionId) {
        return snap.docs.some(d => d.id !== params.excludeSessionId);
      }
      return true;
    } catch (err) {
      return false;
    }
  }

  /**
   * Record and submit full attendance session with batched Firestore writes
   */
  public async submitAttendance(params: MarkAttendanceParams, actorUser: User): Promise<FirestoreTeachingSession> {
    // 1. Validate Duplicate
    const isDuplicate = await this.checkDuplicateSession({
      subjectId: params.subjectId,
      divisionId: params.divisionId,
      date: params.date,
      lectureNumber: params.lectureNumber,
      excludeSessionId: params.sessionId
    });

    if (isDuplicate) {
      throw new Error(`Duplicate Session Conflict: Attendance for Lecture #${params.lectureNumber} in this division and subject on ${params.date} has already been submitted.`);
    }

    const now = new Date().toISOString();
    let presentCount = 0;
    let absentCount = 0;
    let lateCount = 0;

    params.records.forEach(r => {
      if (r.status === 'PRESENT' || r.status === 'ON_DUTY') presentCount++;
      else if (r.status === 'ABSENT') absentCount++;
      else if (r.status === 'LATE') lateCount++;
    });

    const sessionDoc: FirestoreTeachingSession = {
      id: params.sessionId,
      academicYearId: params.academicYearId,
      semesterId: params.semesterId,
      departmentId: params.departmentId,
      programId: params.programId,
      divisionId: params.divisionId,
      divisionName: params.divisionName,
      subjectId: params.subjectId,
      subjectCode: params.subjectCode,
      subjectName: params.subjectName,
      facultyId: params.facultyId,
      facultyName: params.facultyName,
      date: params.date,
      lectureNumber: params.lectureNumber,
      timeSlot: params.timeSlot,
      room: params.room,
      topicTaught: params.topicTaught,
      status: 'SUBMITTED',
      totalStudents: params.records.length,
      presentCount,
      absentCount,
      lateCount,
      submittedAt: now,
      createdAt: now,
      updatedAt: now
    };

    const batch = writeBatch(firestoreDb);

    // Write Teaching Session Document
    const sessionRef = doc(firestoreDb, SESSIONS_COLLECTION, params.sessionId);
    batch.set(sessionRef, sessionDoc, { merge: true });

    // Write Individual Attendance Records
    params.records.forEach(r => {
      const attRecordId = `att-${params.sessionId}-${r.studentId}`;
      const attRef = doc(firestoreDb, ATTENDANCE_COLLECTION, attRecordId);

      const attRecord: FirestoreAttendanceRecord = {
        id: attRecordId,
        sessionId: params.sessionId,
        date: params.date,
        subjectId: params.subjectId,
        subjectCode: params.subjectCode,
        divisionId: params.divisionId,
        facultyId: params.facultyId,
        facultyName: params.facultyName,
        studentId: r.studentId,
        studentName: r.studentName,
        enrollmentNo: r.enrollmentNo,
        status: r.status,
        remarks: r.remarks || '',
        submittedBy: actorUser.id,
        submittedAt: now
      };

      batch.set(attRef, attRecord, { merge: true });
    });

    await batch.commit();
    return sessionDoc;
  }

  /**
   * Get teaching schedule sessions for a faculty on a specific date
   */
  public async getFacultySessions(facultyId: string, date?: string): Promise<FirestoreTeachingSession[]> {
    try {
      const constraints: any[] = [where('facultyId', '==', facultyId)];
      if (date) {
        constraints.push(where('date', '==', date));
      }
      const q = query(collection(firestoreDb, SESSIONS_COLLECTION), ...constraints);
      const snap = await withFirestoreTimeout(getDocs(q));
      return snap.docs.map(d => d.data() as FirestoreTeachingSession);
    } catch (err) {
      return [];
    }
  }

  /**
   * Subscribe to real-time teaching sessions for a faculty member
   */
  public subscribeToFacultySessions(
    facultyId: string,
    callback: (sessions: FirestoreTeachingSession[]) => void
  ): Unsubscribe {
    const q = query(collection(firestoreDb, SESSIONS_COLLECTION), where('facultyId', '==', facultyId));
    return onSnapshot(q, (snap) => {
      const sessions = snap.docs.map(d => d.data() as FirestoreTeachingSession);
      callback(sessions);
    }, (err) => {
      console.warn('[FirebaseAttendanceService] Realtime session listener notice:', err);
    });
  }

  /**
   * Get individual student attendance history
   */
  public async getStudentAttendance(studentId: string, subjectId?: string): Promise<FirestoreAttendanceRecord[]> {
    try {
      const constraints: any[] = [where('studentId', '==', studentId)];
      if (subjectId && subjectId !== 'ALL') {
        constraints.push(where('subjectId', '==', subjectId));
      }
      const q = query(collection(firestoreDb, ATTENDANCE_COLLECTION), ...constraints);
      const snap = await withFirestoreTimeout(getDocs(q));
      return snap.docs.map(d => d.data() as FirestoreAttendanceRecord);
    } catch (err) {
      return [];
    }
  }

  /**
   * Subscribe to real-time student attendance updates
   */
  public subscribeToStudentAttendance(
    studentId: string,
    callback: (records: FirestoreAttendanceRecord[]) => void
  ): Unsubscribe {
    const q = query(collection(firestoreDb, ATTENDANCE_COLLECTION), where('studentId', '==', studentId));
    return onSnapshot(q, (snap) => {
      const records = snap.docs.map(d => d.data() as FirestoreAttendanceRecord);
      callback(records);
    }, (err) => {
      console.error('[FirebaseAttendanceService] Realtime student attendance error:', err);
    });
  }
}

export const firebaseAttendanceService = new FirebaseAttendanceService();
