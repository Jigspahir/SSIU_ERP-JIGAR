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
import { FirestoreMentorAssignment, FirestoreStudent } from '../types';
import { User } from '../../types';

import { withFirestoreTimeout } from '../utils';
import { db } from '../../services/db';

const ASSIGNMENTS_COLLECTION = 'mentorAssignments';
const STUDENTS_COLLECTION = 'students';

export class FirebaseMentorService {
  /**
   * Get all active mentee assignments for a specific mentor
   */
  public async getMenteesForMentor(mentorFacultyId: string): Promise<FirestoreMentorAssignment[]> {
    try {
      const q = query(
        collection(firestoreDb, ASSIGNMENTS_COLLECTION),
        where('mentorFacultyId', '==', mentorFacultyId),
        where('status', '==', 'ACTIVE')
      );
      const snap = await withFirestoreTimeout(getDocs(q));
      if (snap.empty) {
        throw new Error('Empty snapshot, fallback to canonical');
      }
      return snap.docs.map(d => d.data() as FirestoreMentorAssignment);
    } catch (err) {
      const assignments = db.getMentorAssignments();
      return assignments.filter(a => a.mentorFacultyId === mentorFacultyId && a.status === 'ACTIVE') as unknown as FirestoreMentorAssignment[];
    }
  }

  /**
   * Get active mentor assignment for a student
   */
  public async getActiveMentorForStudent(studentId: string): Promise<FirestoreMentorAssignment | null> {
    try {
      const q = query(
        collection(firestoreDb, ASSIGNMENTS_COLLECTION),
        where('studentId', '==', studentId),
        where('status', '==', 'ACTIVE'),
        limit(1)
      );
      const snap = await withFirestoreTimeout(getDocs(q));
      if (snap.empty) {
        const assignments = db.getMentorAssignments();
        const active = assignments.find(a => (a.studentId === studentId || a.studentEnrollmentNo === studentId) && a.status === 'ACTIVE');
        return (active as unknown as FirestoreMentorAssignment) || null;
      }
      return snap.docs[0].data() as FirestoreMentorAssignment;
    } catch (err) {
      const assignments = db.getMentorAssignments();
      const active = assignments.find(a => (a.studentId === studentId || a.studentEnrollmentNo === studentId) && a.status === 'ACTIVE');
      return (active as unknown as FirestoreMentorAssignment) || null;
    }
  }

  /**
   * Assign or Reassign a student to a mentor
   */
  public async assignMentor(
    assignment: FirestoreMentorAssignment,
    isChange: boolean = false
  ): Promise<void> {
    if (isChange) {
      // Deactivate existing active assignment if present
      const currentActive = await this.getActiveMentorForStudent(assignment.studentId);
      if (currentActive) {
        const oldDocRef = doc(firestoreDb, ASSIGNMENTS_COLLECTION, currentActive.id);
        await updateDoc(oldDocRef, {
          status: 'INACTIVE',
          effectiveTo: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
    }

    // Write new active assignment
    const docRef = doc(firestoreDb, ASSIGNMENTS_COLLECTION, assignment.id);
    await setDoc(docRef, assignment, { merge: true });

    // Update student master record mentorId and mentorName
    const studentRef = doc(firestoreDb, STUDENTS_COLLECTION, assignment.studentId);
    await updateDoc(studentRef, {
      mentorId: assignment.mentorFacultyId,
      mentorName: assignment.mentorName,
      updatedAt: new Date().toISOString()
    });
  }
}

export const firebaseMentorService = new FirebaseMentorService();
