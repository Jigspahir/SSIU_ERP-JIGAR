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
import { FirestoreWorkTransfer } from '../types';
import { User } from '../../types';

import { withFirestoreTimeout } from '../utils';
import { workTransferService } from '../../services/workTransferService';

const COLLECTION_NAME = 'workTransfers';

export class FirebaseWorkTransferService {
  /**
   * Fetch all work transfers initiated by or assigned to a user
   */
  public async getTransfersForUser(user: User): Promise<{
    sent: FirestoreWorkTransfer[];
    received: FirestoreWorkTransfer[];
    active: FirestoreWorkTransfer[];
  }> {
    try {
      // Query outgoing transfers
      const sentQuery = query(collection(firestoreDb, COLLECTION_NAME), where('fromUserId', '==', user.id));
      const sentSnap = await withFirestoreTimeout(getDocs(sentQuery));
      const sent = sentSnap.docs.map(d => d.data() as FirestoreWorkTransfer);

      // Query incoming transfers
      const recQuery = query(collection(firestoreDb, COLLECTION_NAME), where('toUserId', '==', user.id));
      const recSnap = await withFirestoreTimeout(getDocs(recQuery));
      const received = recSnap.docs.map(d => d.data() as FirestoreWorkTransfer);

      const all = [...sent, ...received];
      const active = all.filter(t => t.status === 'ACCEPTED');

      return { sent, received, active };
    } catch (err) {
      const sent = (workTransferService.getTransfersCreatedByUser(user.id) as unknown as FirestoreWorkTransfer[]) || [];
      const received = (workTransferService.getTransfersReceivedByUser(user.id) as unknown as FirestoreWorkTransfer[]) || [];
      const active = (workTransferService.getActiveTransfers() as unknown as FirestoreWorkTransfer[]) || [];
      return {
        sent,
        received,
        active
      };
    }
  }

  /**
   * Initiate new work transfer request
   */
  public async createTransfer(transfer: FirestoreWorkTransfer, actorUser: User): Promise<void> {
    const docRef = doc(firestoreDb, COLLECTION_NAME, transfer.id);
    const now = new Date().toISOString();

    const payload: FirestoreWorkTransfer = {
      ...transfer,
      status: 'PENDING',
      createdAt: now,
      auditTrail: [
        {
          action: 'INITIATED',
          performedByUid: actorUser.id,
          performedByName: actorUser.name || 'Faculty Member',
          timestamp: now,
          notes: transfer.reason
        }
      ]
    };

    await setDoc(docRef, payload, { merge: true });
  }

  /**
   * Accept an incoming work transfer
   */
  public async acceptTransfer(transferId: string, actorUser: User): Promise<void> {
    const docRef = doc(firestoreDb, COLLECTION_NAME, transferId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) throw new Error('Work transfer record not found.');

    const data = snap.data() as FirestoreWorkTransfer;
    const now = new Date().toISOString();

    await updateDoc(docRef, {
      status: 'ACCEPTED',
      acceptedAt: now,
      auditTrail: [
        ...(data.auditTrail || []),
        {
          action: 'ACCEPTED',
          performedByUid: actorUser.id,
          performedByName: actorUser.name || 'Delegated User',
          timestamp: now
        }
      ]
    });
  }

  /**
   * Reject an incoming work transfer
   */
  public async rejectTransfer(transferId: string, reason: string, actorUser: User): Promise<void> {
    const docRef = doc(firestoreDb, COLLECTION_NAME, transferId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) throw new Error('Work transfer record not found.');

    const data = snap.data() as FirestoreWorkTransfer;
    const now = new Date().toISOString();

    await updateDoc(docRef, {
      status: 'REJECTED',
      rejectionReason: reason,
      auditTrail: [
        ...(data.auditTrail || []),
        {
          action: 'REJECTED',
          performedByUid: actorUser.id,
          performedByName: actorUser.name || 'Delegated User',
          timestamp: now,
          notes: reason
        }
      ]
    });
  }

  /**
   * Subscribe to real-time work transfers for a user
   */
  public subscribeToTransfers(userId: string, callback: (transfers: FirestoreWorkTransfer[]) => void): Unsubscribe {
    const q = query(collection(firestoreDb, COLLECTION_NAME), where('toUserId', '==', userId));
    return onSnapshot(q, (snap) => {
      const list = snap.docs.map(d => d.data() as FirestoreWorkTransfer);
      callback(list);
    }, (err) => {
      console.error('[FirebaseWorkTransferService] Realtime work transfer error:', err);
    });
  }
}

export const firebaseWorkTransferService = new FirebaseWorkTransferService();
