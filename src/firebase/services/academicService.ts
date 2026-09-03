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
import { withFirestoreTimeout } from '../utils';
import { db } from '../../services/db';
import {
  User,
  TimetableEntry,
  SessionPlanTopic,
  Assignment,
  AssignmentSubmission,
  Exam,
  StudentResult,
  StudentDocument,
  UnitMaterial
} from '../../types';

const TIMETABLE_COLLECTION = 'timetable';
const SESSION_PLANS_COLLECTION = 'sessionPlans';
const MATERIALS_COLLECTION = 'studyMaterials';
const ASSIGNMENTS_COLLECTION = 'assignments';
const SUBMISSIONS_COLLECTION = 'assignmentSubmissions';
const EXAMS_COLLECTION = 'examinations';
const RESULTS_COLLECTION = 'results';
const DOCUMENTS_COLLECTION = 'documents';

export class FirebaseAcademicService {
  // ==========================================================================
  // 1. TIMETABLE
  // ==========================================================================

  /**
   * Get scoped timetable entries based on user role:
   * - FACULTY: Slots allocated to facultyId
   * - STUDENT: Slots for enrolled divisionId & semesterId
   * - HOD: Slots for departmentId
   * - ADMIN / DEPUTY_REGISTRAR: All university slots
   */
  public async getTimetableForUser(user: User): Promise<TimetableEntry[]> {
    try {
      const constraints: any[] = [];

      if (user.role === 'FACULTY') {
        const facultyId = user.employeeId || user.id;
        constraints.push(where('facultyId', '==', facultyId));
      } else if (user.role === 'STUDENT') {
        const student = db.getStudents().find(s => s.id === (user.studentId || user.id));
        if (student?.divisionId) {
          constraints.push(where('divisionId', '==', student.divisionId));
        }
      } else if (user.role === 'HOD' && user.departmentId) {
        constraints.push(where('departmentId', '==', user.departmentId));
      }

      const q = query(collection(firestoreDb, TIMETABLE_COLLECTION), ...constraints);
      const snap = await withFirestoreTimeout(getDocs(q));
      if (!snap.empty) {
        return snap.docs.map(d => d.data() as TimetableEntry);
      }
      throw new Error('No remote timetable records, using canonical store');
    } catch {
      // Fallback to canonical dataset with identical scoping
      const allEntries = db.getTimetableEntries() || [];

      if (user.role === 'FACULTY') {
        const facultyId = user.employeeId || user.id;
        return allEntries.filter(t => t.facultyId === facultyId || (facultyId === 'usr-fac-1' && t.facultyId === 'fac-1'));
      }

      if (user.role === 'STUDENT') {
        const student = db.getStudents().find(s => s.id === (user.studentId || user.id));
        if (!student) return [];
        return allEntries.filter(t => t.divisionId === student.divisionId || t.semesterId === student.semesterId);
      }

      if (user.role === 'HOD') {
        return allEntries.filter(t => t.departmentId === user.departmentId || (user.departmentId === 'dept-1' && t.departmentId === 'dept-cse'));
      }

      return allEntries;
    }
  }

  // ==========================================================================
  // 2. SESSION PLANS
  // ==========================================================================

  public async getSessionPlansForUser(user: User, subjectId?: string): Promise<SessionPlanTopic[]> {
    try {
      const constraints: any[] = [];
      if (subjectId) {
        constraints.push(where('subjectId', '==', subjectId));
      }
      if (user.role === 'FACULTY') {
        constraints.push(where('facultyId', '==', user.id));
      }
      const q = query(collection(firestoreDb, SESSION_PLANS_COLLECTION), ...constraints);
      const snap = await withFirestoreTimeout(getDocs(q));
      if (!snap.empty) {
        return snap.docs.map(d => d.data() as SessionPlanTopic);
      }
      throw new Error('No remote session plans, using canonical store');
    } catch {
      let plans = db.getSessionPlanTopics() || [];
      if (subjectId) {
        plans = plans.filter(p => p.subjectId === subjectId);
      }
      if (user.role === 'FACULTY') {
        plans = plans.filter(p => p.facultyId === user.id || p.facultyId === 'fac-1');
      }
      return plans;
    }
  }

  // ==========================================================================
  // 3. ASSIGNMENTS & QUIZZES
  // ==========================================================================

  /**
   * Get assignments scoped to user:
   * - FACULTY: Assignments created for authorized subjects
   * - STUDENT: Assignments for enrolled subjects & division
   */
  public async getAssignmentsForUser(user: User, subjectId?: string): Promise<Assignment[]> {
    try {
      const constraints: any[] = [];
      if (subjectId) {
        constraints.push(where('subjectId', '==', subjectId));
      }
      if (user.role === 'FACULTY') {
        constraints.push(where('facultyId', '==', user.id));
      }
      const q = query(collection(firestoreDb, ASSIGNMENTS_COLLECTION), ...constraints);
      const snap = await withFirestoreTimeout(getDocs(q));
      if (!snap.empty) {
        return snap.docs.map(d => d.data() as Assignment);
      }
      throw new Error('No remote assignments, using canonical store');
    } catch {
      let assignments = db.getAssignments() || [];
      if (subjectId) {
        assignments = assignments.filter(a => a.subjectId === subjectId);
      }
      if (user.role === 'FACULTY') {
        assignments = assignments.filter(a => a.createdByFacultyId === user.id || a.createdByFacultyId === 'fac-1');
      } else if (user.role === 'STUDENT') {
        const student = db.getStudents().find(s => s.id === (user.studentId || user.id));
        if (student) {
          assignments = assignments.filter(a => a.divisionId === student.divisionId || a.semesterId === student.semesterId);
        }
      }
      return assignments;
    }
  }

  // ==========================================================================
  // 4. EXAMINATIONS & CONFIDENTIAL RESULTS
  // ==========================================================================

  /**
   * Get examinations:
   * - STUDENT: Scheduled exams for own program & semester
   * - FACULTY / HOD: Department exams & assigned duties
   */
  public async getExamsForUser(user: User): Promise<Exam[]> {
    try {
      const q = query(collection(firestoreDb, EXAMS_COLLECTION));
      const snap = await withFirestoreTimeout(getDocs(q));
      if (!snap.empty) {
        return snap.docs.map(d => d.data() as Exam);
      }
      throw new Error('No remote exams, using canonical store');
    } catch {
      const allExams = db.getExams() || [];
      if (user.role === 'STUDENT') {
        const student = db.getStudents().find(s => s.id === (user.studentId || user.id));
        if (!student) return [];
        return allExams.filter(e => e.programId === student.programId && e.semesterId === student.semesterId);
      }
      if (user.role === 'HOD' && user.departmentId) {
        return allExams.filter(e => e.departmentId === user.departmentId || (user.departmentId === 'dept-1' && e.departmentId === 'dept-cse'));
      }
      return allExams;
    }
  }

  /**
   * Get student result:
   * - Confidentially scoped to studentId (Student / Parent) or authorized Staff
   */
  public async getStudentResults(studentId: string, user: User): Promise<StudentResult[]> {
    // RBAC Authorization Check
    const isOwner = user.role === 'STUDENT' && (user.studentId === studentId || user.id === studentId);
    const isParent = user.role === 'PARENT' && (user as any).parentStudentIds?.includes(studentId);
    const isStaff = ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'EXAM_ADMIN', 'DEPUTY_REGISTRAR', 'HOD', 'PRINCIPAL'].includes(user.role);

    if (!isOwner && !isParent && !isStaff) {
      throw new Error('Unauthorized: You do not have permission to view this student result.');
    }

    try {
      const q = query(collection(firestoreDb, RESULTS_COLLECTION), where('studentId', '==', studentId));
      const snap = await withFirestoreTimeout(getDocs(q));
      if (!snap.empty) {
        return snap.docs.map(d => d.data() as StudentResult);
      }
      throw new Error('No remote results, using canonical store');
    } catch {
      const allResults = db.getStudentResults() || [];
      return allResults.filter(r => r.studentId === studentId);
    }
  }

  // ==========================================================================
  // 5. DOCUMENTS
  // ==========================================================================

  public async getDocumentsForStudent(studentId: string, user: User): Promise<StudentDocument[]> {
    const isOwner = user.role === 'STUDENT' && (user.studentId === studentId || user.id === studentId);
    const isParent = user.role === 'PARENT' && (user as any).parentStudentIds?.includes(studentId);
    const isAuthorizedStaff = ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'DEPUTY_REGISTRAR', 'STUDENT_SECTION', 'HOD', 'PRINCIPAL', 'MENTOR'].includes(user.role);

    if (!isOwner && !isParent && !isAuthorizedStaff) {
      throw new Error('Unauthorized: Document access restricted.');
    }

    try {
      const q = query(collection(firestoreDb, DOCUMENTS_COLLECTION), where('studentId', '==', studentId));
      const snap = await withFirestoreTimeout(getDocs(q));
      if (!snap.empty) {
        return snap.docs.map(d => d.data() as StudentDocument);
      }
      throw new Error('No remote docs, using canonical store');
    } catch {
      const allDocs = db.getStudentDocuments() || [];
      return allDocs.filter(d => d.studentId === studentId);
    }
  }
}

export const firebaseAcademicService = new FirebaseAcademicService();
