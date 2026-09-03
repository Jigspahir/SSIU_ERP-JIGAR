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
import { FirestoreFeedback, FirestoreComplaint, FirestorePTM } from '../types';
import { User } from '../../types';

import { withFirestoreTimeout } from '../utils';

const FEEDBACK_COLLECTION = 'feedback';
const COMPLAINTS_COLLECTION = 'complaints';
const PTM_COLLECTION = 'ptm';

export class FirebaseFeedbackService {
  /**
   * Submit student feedback on a faculty / subject
   */
  public async submitFeedback(feedback: FirestoreFeedback): Promise<void> {
    const docRef = doc(firestoreDb, FEEDBACK_COLLECTION, feedback.id);
    await setDoc(docRef, {
      ...feedback,
      submittedAt: new Date().toISOString()
    });
  }

  /**
   * Get feedback records for a faculty member (anonymized if configured)
   */
  public async getFeedbackForFaculty(facultyId: string): Promise<FirestoreFeedback[]> {
    try {
      const q = query(
        collection(firestoreDb, FEEDBACK_COLLECTION),
        where('facultyId', '==', facultyId)
      );
      const snap = await withFirestoreTimeout(getDocs(q));
      return snap.docs.map(d => {
        const item = d.data() as FirestoreFeedback;
        if (item.isAnonymous) {
          return { ...item, studentId: 'ANONYMOUS' };
        }
        return item;
      });
    } catch (err) {
      return [];
    }
  }

  /**
   * Save PTM record
   */
  public async savePTMRecord(ptm: FirestorePTM): Promise<void> {
    const docRef = doc(firestoreDb, PTM_COLLECTION, ptm.id);
    await setDoc(docRef, ptm, { merge: true });
  }

  /**
   * Get PTM records for student / parent
   */
  public async getPTMForStudent(studentId: string): Promise<FirestorePTM[]> {
    try {
      const q = query(
        collection(firestoreDb, PTM_COLLECTION),
        where('studentId', '==', studentId)
      );
      const snap = await withFirestoreTimeout(getDocs(q));
      return snap.docs.map(d => d.data() as FirestorePTM);
    } catch (err) {
      return [];
    }
  }
}

export const firebaseFeedbackService = new FirebaseFeedbackService();
