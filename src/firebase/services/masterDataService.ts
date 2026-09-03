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
  orderBy
} from 'firebase/firestore';
import { firestoreDb } from '../config';
import {
  FirestoreInstitute,
  FirestoreDepartment,
  FirestoreProgram,
  FirestoreAcademicYear,
  FirestoreSemester,
  FirestoreDivision,
  FirestoreSubject
} from '../types';
import { withFirestoreTimeout } from '../utils';
import { db } from '../../services/db';

export class FirebaseMasterDataService {
  // ─── 1. INSTITUTES ────────────────────────────────────────────────────────
  public async getInstitutes(): Promise<FirestoreInstitute[]> {
    try {
      const snap = await withFirestoreTimeout(getDocs(collection(firestoreDb, 'institutes')));
      if (!snap.empty) {
        return snap.docs.map(d => d.data() as FirestoreInstitute);
      }
      return (db.getInstitutes() as unknown as FirestoreInstitute[]) || [];
    } catch {
      return (db.getInstitutes() as unknown as FirestoreInstitute[]) || [];
    }
  }

  public async getInstitute(id: string): Promise<FirestoreInstitute | null> {
    try {
      const snap = await withFirestoreTimeout(getDoc(doc(firestoreDb, 'institutes', id)));
      if (snap.exists()) return snap.data() as FirestoreInstitute;
      const local = db.getInstitutes().find(i => i.id === id || i.code === id);
      return (local as unknown as FirestoreInstitute) || null;
    } catch {
      const local = db.getInstitutes().find(i => i.id === id || i.code === id);
      return (local as unknown as FirestoreInstitute) || null;
    }
  }

  public async saveInstitute(institute: FirestoreInstitute): Promise<void> {
    const docRef = doc(firestoreDb, 'institutes', institute.id);
    await setDoc(docRef, institute, { merge: true });
  }

  // ─── 2. DEPARTMENTS ───────────────────────────────────────────────────────
  public async getDepartments(instituteId?: string): Promise<FirestoreDepartment[]> {
    try {
      const constraints: any[] = [];
      if (instituteId && instituteId !== 'ALL') {
        constraints.push(where('instituteId', '==', instituteId));
      }
      const q = query(collection(firestoreDb, 'departments'), ...constraints);
      const snap = await withFirestoreTimeout(getDocs(q));
      if (!snap.empty) {
        return snap.docs.map(d => d.data() as FirestoreDepartment);
      }
      let depts = db.getDepartments();
      if (instituteId && instituteId !== 'ALL') depts = depts.filter(d => d.instituteId === instituteId);
      return (depts as unknown as FirestoreDepartment[]) || [];
    } catch {
      let depts = db.getDepartments();
      if (instituteId && instituteId !== 'ALL') depts = depts.filter(d => d.instituteId === instituteId);
      return (depts as unknown as FirestoreDepartment[]) || [];
    }
  }

  public async saveDepartment(department: FirestoreDepartment): Promise<void> {
    const docRef = doc(firestoreDb, 'departments', department.id);
    await setDoc(docRef, department, { merge: true });
  }

  // ─── 3. PROGRAMS ──────────────────────────────────────────────────────────
  public async getPrograms(departmentId?: string, instituteId?: string): Promise<FirestoreProgram[]> {
    try {
      const constraints: any[] = [];
      if (departmentId && departmentId !== 'ALL') constraints.push(where('departmentId', '==', departmentId));
      if (instituteId && instituteId !== 'ALL') constraints.push(where('instituteId', '==', instituteId));
      const q = query(collection(firestoreDb, 'programs'), ...constraints);
      const snap = await withFirestoreTimeout(getDocs(q));
      if (!snap.empty) {
        return snap.docs.map(d => d.data() as FirestoreProgram);
      }
      let progs = db.getPrograms();
      if (departmentId && departmentId !== 'ALL') progs = progs.filter(p => p.departmentId === departmentId);
      if (instituteId && instituteId !== 'ALL') progs = progs.filter(p => p.instituteId === instituteId);
      return (progs as unknown as FirestoreProgram[]) || [];
    } catch {
      let progs = db.getPrograms();
      if (departmentId && departmentId !== 'ALL') progs = progs.filter(p => p.departmentId === departmentId);
      if (instituteId && instituteId !== 'ALL') progs = progs.filter(p => p.instituteId === instituteId);
      return (progs as unknown as FirestoreProgram[]) || [];
    }
  }

  public async saveProgram(program: FirestoreProgram): Promise<void> {
    const docRef = doc(firestoreDb, 'programs', program.id);
    await setDoc(docRef, program, { merge: true });
  }

  // ─── 4. ACADEMIC YEARS ────────────────────────────────────────────────────
  public async getAcademicYears(): Promise<FirestoreAcademicYear[]> {
    try {
      const snap = await withFirestoreTimeout(getDocs(collection(firestoreDb, 'academicYears')));
      if (!snap.empty) {
        return snap.docs.map(d => d.data() as FirestoreAcademicYear);
      }
      return (db.getAcademicYears() as unknown as FirestoreAcademicYear[]) || [];
    } catch {
      return (db.getAcademicYears() as unknown as FirestoreAcademicYear[]) || [];
    }
  }

  public async saveAcademicYear(ay: FirestoreAcademicYear): Promise<void> {
    const docRef = doc(firestoreDb, 'academicYears', ay.id);
    await setDoc(docRef, ay, { merge: true });
  }

  // ─── 5. SEMESTERS ─────────────────────────────────────────────────────────
  public async getSemesters(programId?: string): Promise<FirestoreSemester[]> {
    try {
      const constraints: any[] = [];
      if (programId && programId !== 'ALL') constraints.push(where('programId', '==', programId));
      const q = query(collection(firestoreDb, 'semesters'), ...constraints);
      const snap = await withFirestoreTimeout(getDocs(q));
      if (!snap.empty) {
        return snap.docs.map(d => d.data() as FirestoreSemester);
      }
      let sems = db.getSemesters();
      if (programId && programId !== 'ALL') sems = sems.filter(s => s.programId === programId);
      return (sems as unknown as FirestoreSemester[]) || [];
    } catch {
      let sems = db.getSemesters();
      if (programId && programId !== 'ALL') sems = sems.filter(s => s.programId === programId);
      return (sems as unknown as FirestoreSemester[]) || [];
    }
  }

  public async saveSemester(semester: FirestoreSemester): Promise<void> {
    const docRef = doc(firestoreDb, 'semesters', semester.id);
    await setDoc(docRef, semester, { merge: true });
  }

  // ─── 6. DIVISIONS ─────────────────────────────────────────────────────────
  public async getDivisions(semesterId?: string, departmentId?: string): Promise<FirestoreDivision[]> {
    try {
      const constraints: any[] = [];
      if (semesterId && semesterId !== 'ALL') constraints.push(where('semesterId', '==', semesterId));
      if (departmentId && departmentId !== 'ALL') constraints.push(where('departmentId', '==', departmentId));
      const q = query(collection(firestoreDb, 'divisions'), ...constraints);
      const snap = await withFirestoreTimeout(getDocs(q));
      if (!snap.empty) {
        return snap.docs.map(d => d.data() as FirestoreDivision);
      }
      let divs = db.getDivisions();
      if (semesterId && semesterId !== 'ALL') divs = divs.filter(d => d.semesterId === semesterId);
      if (departmentId && departmentId !== 'ALL') divs = divs.filter(d => (d as any).departmentId === departmentId);
      return (divs as unknown as FirestoreDivision[]) || [];
    } catch {
      let divs = db.getDivisions();
      if (semesterId && semesterId !== 'ALL') divs = divs.filter(d => d.semesterId === semesterId);
      if (departmentId && departmentId !== 'ALL') divs = divs.filter(d => (d as any).departmentId === departmentId);
      return (divs as unknown as FirestoreDivision[]) || [];
    }
  }

  public async saveDivision(division: FirestoreDivision): Promise<void> {
    const docRef = doc(firestoreDb, 'divisions', division.id);
    await setDoc(docRef, division, { merge: true });
  }

  // ─── 7. SUBJECTS ──────────────────────────────────────────────────────────
  public async getSubjects(departmentId?: string, semesterId?: string): Promise<FirestoreSubject[]> {
    try {
      const constraints: any[] = [];
      if (departmentId && departmentId !== 'ALL') constraints.push(where('departmentId', '==', departmentId));
      if (semesterId && semesterId !== 'ALL') constraints.push(where('semesterId', '==', semesterId));
      const q = query(collection(firestoreDb, 'subjects'), ...constraints);
      const snap = await withFirestoreTimeout(getDocs(q));
      if (!snap.empty) {
        return snap.docs.map(d => d.data() as FirestoreSubject);
      }
      let subjs = db.getSubjects();
      if (departmentId && departmentId !== 'ALL') subjs = subjs.filter(s => s.departmentId === departmentId);
      if (semesterId && semesterId !== 'ALL') subjs = subjs.filter(s => s.semesterId === semesterId);
      return (subjs as unknown as FirestoreSubject[]) || [];
    } catch {
      let subjs = db.getSubjects();
      if (departmentId && departmentId !== 'ALL') subjs = subjs.filter(s => s.departmentId === departmentId);
      if (semesterId && semesterId !== 'ALL') subjs = subjs.filter(s => s.semesterId === semesterId);
      return (subjs as unknown as FirestoreSubject[]) || [];
    }
  }

  public async saveSubject(subject: FirestoreSubject): Promise<void> {
    const docRef = doc(firestoreDb, 'subjects', subject.id);
    await setDoc(docRef, subject, { merge: true });
  }
}

export const firebaseMasterDataService = new FirebaseMasterDataService();
