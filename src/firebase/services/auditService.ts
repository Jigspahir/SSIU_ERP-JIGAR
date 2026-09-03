import {
  collection,
  doc,
  getDocs,
  setDoc,
  query,
  where,
  limit,
  orderBy
} from 'firebase/firestore';
import { firestoreDb } from '../config';
import { withFirestoreTimeout } from '../utils';
import { FirestoreAuditLog } from '../types';
import { User, UserRole } from '../../types';
import { db } from '../../services/db';

const COLLECTION_NAME = 'auditLogs';

export class FirebaseAuditService {
  /**
   * Log an immutable system audit event to Firestore
   */
  public async logEvent(params: {
    actor: User;
    action: string;
    module: string;
    entity: string;
    recordId: string;
    details: string;
    status?: 'SUCCESS' | 'FAILURE' | 'BLOCKED';
    severity?: 'INFO' | 'WARNING' | 'CRITICAL';
    metadata?: Record<string, any>;
  }): Promise<void> {
    try {
      const logId = `audit-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
      const docRef = doc(firestoreDb, COLLECTION_NAME, logId);

      const logEntry: FirestoreAuditLog = {
        id: logId,
        actorUid: params.actor.id,
        actorName: params.actor.name || 'User',
        actorRole: params.actor.role,
        action: params.action,
        module: params.module,
        entity: params.entity,
        recordId: params.recordId,
        details: params.details,
        status: params.status || 'SUCCESS',
        severity: params.severity || 'INFO',
        timestamp: new Date().toISOString(),
        metadata: params.metadata || {}
      };

      await withFirestoreTimeout(setDoc(docRef, logEntry));
    } catch (err) {
      db.logAudit(params.action, params.entity, params.details);
    }
  }

  /**
   * Alias for logEvent
   */
  public async logAction(params: {
    userId: string;
    userName: string;
    userRole: UserRole;
    action: string;
    module: string;
    targetId: string;
    details: string;
    ipAddress?: string;
  }): Promise<void> {
    return this.logEvent({
      actor: {
        id: params.userId,
        name: params.userName,
        role: params.userRole,
        email: '',
        status: 'ACTIVE',
        createdAt: new Date().toISOString()
      },
      action: params.action,
      module: params.module,
      entity: params.module,
      recordId: params.targetId,
      details: params.details,
      metadata: { ipAddress: params.ipAddress }
    });
  }

  /**
   * Query audit logs with pagination and filters
   */
  public async getAuditLogs(filters?: {
    module?: string;
    actorUid?: string;
    severity?: string;
    limitCount?: number;
  }): Promise<FirestoreAuditLog[]> {
    try {
      const constraints: any[] = [];
      if (filters?.module) constraints.push(where('module', '==', filters.module));
      if (filters?.actorUid) constraints.push(where('actorUid', '==', filters.actorUid));
      if (filters?.severity) constraints.push(where('severity', '==', filters.severity));

      constraints.push(limit(filters?.limitCount || 100));

      const q = query(collection(firestoreDb, COLLECTION_NAME), ...constraints);
      const snap = await getDocs(q);
      return snap.docs.map(d => d.data() as FirestoreAuditLog);
    } catch (err) {
      const localLogs = db.getAuditLogs();
      return (localLogs as unknown as FirestoreAuditLog[]) || [];
    }
  }
}

export const firebaseAuditService = new FirebaseAuditService();
