import { db } from './db';
import { 
  WorkTransferRecord, 
  CreateWorkTransferDTO, 
  WorkTransferStatus, 
  WorkItemSummary, 
  WorkItemType,
  WorkTransferFilterParams,
  WorkTransferAuditEvent,
  WorkAssignmentHistoryChainItem
} from '../types/workTransfer';

const STORAGE_KEY = 'ssiu_work_transfers';

class WorkTransferService {
  private transfers: WorkTransferRecord[] = [];
  private initialized = false;

  constructor() {
    this.init();
  }

  private init() {
    if (this.initialized) return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.transfers = JSON.parse(stored);
      } else {
        this.transfers = this.getInitialSeedTransfers();
        this.save();
      }
    } catch {
      this.transfers = this.getInitialSeedTransfers();
    }
    this.initialized = true;
    this.autoSyncTransferStatuses();
  }

  private save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.transfers));
    } catch {
      // In-memory fallback
    }
  }

  private getInitialSeedTransfers(): WorkTransferRecord[] {
    return [
      {
        id: 'wtr-seed-1',
        trackingCode: 'WTR-2026-000001',
        fromUserId: 'fac-1',
        fromUserName: 'Prof. Rajesh Sharma',
        fromUserRole: 'FACULTY',
        fromUserDepartmentId: 'dept-1',
        fromUserDepartmentName: 'Computer Engineering',
        fromUserInstituteId: 'inst-1',
        fromUserInstituteName: 'SSIT - Swarrnim Institute of Technology',
        toUserId: 'fac-2',
        toUserName: 'Prof. Anjali Patel',
        toUserRole: 'FACULTY',
        toUserDepartmentId: 'dept-1',
        toUserDepartmentName: 'Computer Engineering',
        toUserInstituteId: 'inst-1',
        toUserInstituteName: 'SSIT - Swarrnim Institute of Technology',
        startAt: '2026-09-01',
        endAt: '2026-09-07',
        reason: 'LEAVE',
        remarks: 'Annual Leave coverage for Lab sessions & Student section requests',
        status: 'SCHEDULED',
        workItemIds: ['req-bonafide-1', 'task-diary-1'],
        workItemTypes: ['STUDENT_REQUEST', 'WORK_DIARY'],
        totalItemsCount: 2,
        completedItemIds: [],
        createdBy: 'fac-1',
        createdByName: 'Prof. Rajesh Sharma',
        createdByRole: 'FACULTY',
        createdAt: '2026-08-20T10:00:00Z',
        auditTrail: [
          {
            id: 'aud-101',
            transferId: 'wtr-seed-1',
            timestamp: '2026-08-20T10:00:00Z',
            actorId: 'fac-1',
            actorName: 'Prof. Rajesh Sharma',
            actorRole: 'FACULTY',
            action: 'TRANSFER_CREATED',
            details: 'Transfer scheduled for 01 Sep to 07 Sep 2026'
          }
        ]
      },
      {
        id: 'wtr-seed-2',
        trackingCode: 'WTR-2026-000002',
        fromUserId: 'fac-3',
        fromUserName: 'Dr. Hardik Patel',
        fromUserRole: 'FACULTY',
        fromUserDepartmentId: 'dept-1',
        fromUserDepartmentName: 'Computer Engineering',
        fromUserInstituteId: 'inst-1',
        fromUserInstituteName: 'SSIT - Swarrnim Institute of Technology',
        toUserId: 'fac-1',
        toUserName: 'Prof. Rajesh Sharma',
        toUserRole: 'FACULTY',
        toUserDepartmentId: 'dept-1',
        toUserDepartmentName: 'Computer Engineering',
        toUserInstituteId: 'inst-1',
        toUserInstituteName: 'SSIT - Swarrnim Institute of Technology',
        startAt: '2026-08-10',
        endAt: '2026-08-15',
        reason: 'OFFICIAL_DUTY',
        remarks: 'Faculty Development Program duty delegation',
        status: 'EXPIRED',
        workItemIds: ['task-edp-1', 'doc-ver-1'],
        workItemTypes: ['EDP_DUTY', 'DOCUMENT_VERIFICATION'],
        totalItemsCount: 2,
        completedItemIds: ['task-edp-1'],
        createdBy: 'fac-3',
        createdByName: 'Dr. Hardik Patel',
        createdByRole: 'FACULTY',
        createdAt: '2026-08-09T09:00:00Z',
        activatedAt: '2026-08-10T00:00:00Z',
        completedAt: '2026-08-12T14:30:00Z',
        completedByUserId: 'fac-1',
        completedByUserName: 'Prof. Rajesh Sharma',
        expiredAt: '2026-08-16T00:00:00Z',
        auditTrail: [
          {
            id: 'aud-102',
            transferId: 'wtr-seed-2',
            timestamp: '2026-08-09T09:00:00Z',
            actorId: 'fac-3',
            actorName: 'Dr. Hardik Patel',
            actorRole: 'FACULTY',
            action: 'TRANSFER_CREATED',
            details: 'Transfer scheduled for official duty'
          },
          {
            id: 'aud-103',
            transferId: 'wtr-seed-2',
            timestamp: '2026-08-10T00:00:00Z',
            actorId: 'system',
            actorName: 'SSIU ERP Scheduler',
            actorRole: 'SYSTEM',
            action: 'TRANSFER_ACTIVATED',
            details: 'Transfer auto-activated on start date'
          },
          {
            id: 'aud-104',
            transferId: 'wtr-seed-2',
            workItemId: 'task-edp-1',
            timestamp: '2026-08-12T14:30:00Z',
            actorId: 'fac-1',
            actorName: 'Prof. Rajesh Sharma',
            actorRole: 'FACULTY',
            action: 'WORK_COMPLETED',
            details: 'Delegated EDP duty completed by Prof. Rajesh Sharma'
          },
          {
            id: 'aud-105',
            transferId: 'wtr-seed-2',
            timestamp: '2026-08-16T00:00:00Z',
            actorId: 'system',
            actorName: 'SSIU ERP Scheduler',
            actorRole: 'SYSTEM',
            action: 'TRANSFER_EXPIRED',
            details: 'Transfer period ended; remaining 1 task restored to Dr. Hardik Patel'
          },
          {
            id: 'aud-106',
            transferId: 'wtr-seed-2',
            timestamp: '2026-08-16T00:00:00Z',
            actorId: 'system',
            actorName: 'SSIU ERP Scheduler',
            actorRole: 'SYSTEM',
            action: 'RESPONSIBILITY_RESTORED',
            details: 'Unfinished document verification restored to original owner'
          }
        ]
      }
    ];
  }

  private getTodayString(asOfDate?: string): string {
    if (asOfDate) return asOfDate;
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  // ════════════════════════════════════════════════════════════════════════════
  // AUTOMATIC ACTIVATION & EXPIRY ENGINE
  // ════════════════════════════════════════════════════════════════════════════
  public autoSyncTransferStatuses(asOfDate?: string): void {
    const today = this.getTodayString(asOfDate);
    let mutated = false;

    this.transfers = this.transfers.map(tr => {
      // SCHEDULED -> ACTIVE when startAt reached
      if (tr.status === 'SCHEDULED' && tr.startAt <= today && today <= tr.endAt) {
        mutated = true;
        
        const auditEvent: WorkTransferAuditEvent = {
          id: `aud-sync-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
          transferId: tr.id,
          timestamp: new Date().toISOString(),
          actorId: 'system',
          actorName: 'SSIU ERP Scheduler',
          actorRole: 'SYSTEM',
          action: 'TRANSFER_ACTIVATED',
          details: `Automatic activation triggered on start date ${tr.startAt}`
        };

        db.addNotification({
          targetUserId: tr.toUserId,
          targetRole: 'FACULTY',
          title: 'Delegated Workload Activated',
          message: `You have received ${tr.totalItemsCount} delegated work items from ${tr.fromUserName} for the period ${tr.startAt} to ${tr.endAt}.`,
          module: 'ADMINISTRATION',
          type: 'INFO' as any
        });
        db.addNotification({
          targetUserId: tr.fromUserId,
          targetRole: 'FACULTY',
          title: 'Workload Delegation Activated',
          message: `Your delegated work (${tr.totalItemsCount} items) has been transferred to ${tr.toUserName}.`,
          module: 'ADMINISTRATION',
          type: 'INFO' as any
        });
        return {
          ...tr,
          status: 'ACTIVE' as WorkTransferStatus,
          activatedAt: new Date().toISOString(),
          auditTrail: [...(tr.auditTrail || []), auditEvent]
        };
      }

      // ACTIVE -> EXPIRED when endAt passed
      if (tr.status === 'ACTIVE' && today > tr.endAt) {
        mutated = true;
        const remainingCount = tr.workItemIds.filter(id => !tr.completedItemIds.includes(id)).length;
        
        const auditEvent1: WorkTransferAuditEvent = {
          id: `aud-exp-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
          transferId: tr.id,
          timestamp: new Date().toISOString(),
          actorId: 'system',
          actorName: 'SSIU ERP Scheduler',
          actorRole: 'SYSTEM',
          action: 'TRANSFER_EXPIRED',
          details: `Transfer period ended on ${tr.endAt}. Incomplete tasks: ${remainingCount}.`
        };

        const auditEvent2: WorkTransferAuditEvent = {
          id: `aud-rst-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
          transferId: tr.id,
          timestamp: new Date().toISOString(),
          actorId: 'system',
          actorName: 'SSIU ERP Scheduler',
          actorRole: 'SYSTEM',
          action: 'RESPONSIBILITY_RESTORED',
          details: `Responsibility for ${remainingCount} incomplete work items safely returned to ${tr.fromUserName}.`
        };

        db.addNotification({
          targetUserId: tr.fromUserId,
          targetRole: 'FACULTY',
          title: 'Delegation Period Concluded',
          message: `Your work transfer to ${tr.toUserName} has expired. ${remainingCount} remaining pending work items have been restored to your workload.`,
          module: 'ADMINISTRATION',
          type: 'INFO' as any
        });
        db.addNotification({
          targetUserId: tr.toUserId,
          targetRole: 'FACULTY',
          title: 'Delegated Work Ended',
          message: `Delegated work period from ${tr.fromUserName} has ended. Completed tasks have been archived.`,
          module: 'ADMINISTRATION',
          type: 'INFO' as any
        });
        return {
          ...tr,
          status: 'EXPIRED' as WorkTransferStatus,
          expiredAt: new Date().toISOString(),
          auditTrail: [...(tr.auditTrail || []), auditEvent1, auditEvent2]
        };
      }

      return tr;
    });

    if (mutated) {
      this.save();
    }
  }

  // ════════════════════════════════════════════════════════════════════════════
  // ACTIVE RUNTIME SETS & EFFECTIVE ASSIGNEE
  // ════════════════════════════════════════════════════════════════════════════
  public getActiveTransfers(asOfDate?: string): WorkTransferRecord[] {
    const today = this.getTodayString(asOfDate);
    return this.transfers.filter(tr => 
      tr.status === 'ACTIVE' && 
      tr.startAt <= today && 
      today <= tr.endAt
    );
  }

  public getTransferredOutWorkItemIds(userId: string, asOfDate?: string): Set<string> {
    const active = this.getActiveTransfers(asOfDate);
    const itemIds = new Set<string>();
    active
      .filter(tr => tr.fromUserId === userId)
      .forEach(tr => {
        tr.workItemIds.forEach(id => {
          if (!tr.completedItemIds.includes(id)) {
            itemIds.add(id);
          }
        });
      });
    return itemIds;
  }

  public getTransferredInWorkItemIds(userId: string, asOfDate?: string): Set<string> {
    const active = this.getActiveTransfers(asOfDate);
    const itemIds = new Set<string>();
    active
      .filter(tr => tr.toUserId === userId)
      .forEach(tr => {
        tr.workItemIds.forEach(id => {
          if (!tr.completedItemIds.includes(id)) {
            itemIds.add(id);
          }
        });
      });
    return itemIds;
  }

  public getEffectiveAssignee(workItemId: string, originalAssigneeId: string, asOfDate?: string): string {
    const active = this.getActiveTransfers(asOfDate);
    const transfer = active.find(tr => tr.workItemIds.includes(workItemId));
    if (transfer) {
      return transfer.toUserId;
    }
    return originalAssigneeId;
  }

  // ════════════════════════════════════════════════════════════════════════════
  // USER WORKLOAD COUNTERS & METRICS (NO DASHBOARD POLLUTION)
  // ════════════════════════════════════════════════════════════════════════════
  public getUserWorkloadMetrics(userId: string, asOfDate?: string) {
    const activeTransfersOut = this.getActiveTransfers(asOfDate).filter(t => t.fromUserId === userId);
    const activeTransfersIn = this.getActiveTransfers(asOfDate).filter(t => t.toUserId === userId);
    
    let activeOutItemCount = 0;
    activeTransfersOut.forEach(t => {
      activeOutItemCount += t.workItemIds.filter(id => !t.completedItemIds.includes(id)).length;
    });

    let activeInItemCount = 0;
    activeTransfersIn.forEach(t => {
      activeInItemCount += t.workItemIds.filter(id => !t.completedItemIds.includes(id)).length;
    });

    const userTransfers = this.transfers.filter(t => t.fromUserId === userId || t.toUserId === userId);
    
    let completedDelegatedCount = 0;
    this.transfers.filter(t => t.toUserId === userId).forEach(t => {
      completedDelegatedCount += t.completedItemIds.length;
    });

    return {
      currentlyDelegatedOutItems: activeOutItemCount,
      currentlyDelegatedInItems: activeInItemCount,
      activeTransfersOutCount: activeTransfersOut.length,
      activeTransfersInCount: activeTransfersIn.length,
      totalTransferHistoryCount: userTransfers.length,
      completedDelegatedWorkCount: completedDelegatedCount
    };
  }

  // ════════════════════════════════════════════════════════════════════════════
  // WORK ITEM DISCOVERY WITH RETURNED-FROM-DELEGATION STATE
  // ════════════════════════════════════════════════════════════════════════════
  public getAssignableWorkItemsForUser(userId: string): WorkItemSummary[] {
    const items: WorkItemSummary[] = [];
    const state = db.getState();
    const transferredOut = this.getTransferredOutWorkItemIds(userId);
    const transferredIn = this.getTransferredInWorkItemIds(userId);

    // Check if an item has expired or returned from delegation
    const isReturned = (itemId: string) => {
      const past = this.transfers.filter(t => 
        t.fromUserId === userId && 
        (t.status === 'EXPIRED' || t.status === 'REVOKED') &&
        t.workItemIds.includes(itemId) &&
        !t.completedItemIds.includes(itemId)
      );
      return past.length > 0;
    };

    // 1. Student Requests / Services
    (state.studentSectionRequests || []).forEach((req: any) => {
      if (req.status === 'PENDING' || req.status === 'IN_REVIEW' || req.status === 'ASSIGNED') {
        const returned = isReturned(req.id);
        items.push({
          id: req.id,
          type: 'STUDENT_REQUEST',
          title: `Student Service: ${req.serviceName || 'Service Request'}`,
          module: 'Student Section',
          studentName: req.studentName,
          enrollmentNo: req.enrollmentNo,
          priority: req.priority || 'MEDIUM',
          status: 'PENDING',
          dueDate: req.expectedDeliveryDate,
          assignedAt: req.createdAt,
          originalOwnerId: req.assignedToFacultyId || userId,
          originalOwnerName: 'Original Assignee',
          isDelegated: transferredIn.has(req.id),
          isReturnedFromDelegation: returned,
          delegationLabel: returned ? 'Returned from Delegation (Responsibility Restored)' : (transferredIn.has(req.id) ? 'Delegated Work' : undefined)
        });
      }
    });

    // 2. Work Diary / EDP Duties
    (state.edpDuties || []).forEach((duty: any) => {
      if (duty.status === 'ASSIGNED' || duty.status === 'PENDING_EVIDENCE' || duty.status === 'IN_PROGRESS') {
        const returned = isReturned(duty.id);
        items.push({
          id: duty.id,
          type: 'EDP_DUTY',
          title: `EDP Duty: ${duty.activityName || duty.description || 'Classroom Monitoring'}`,
          module: 'Academic Operations',
          priority: 'HIGH',
          status: 'PENDING',
          assignedAt: duty.assignedDate || duty.date || '2026-08-20',
          originalOwnerId: duty.facultyId || userId,
          isDelegated: transferredIn.has(duty.id),
          isReturnedFromDelegation: returned,
          delegationLabel: returned ? 'Returned from Delegation (Responsibility Restored)' : (transferredIn.has(duty.id) ? 'Delegated Work' : undefined)
        });
      }
    });

    // 3. Exam Form Verifications
    (state.examForms || []).forEach((ef: any) => {
      if (ef.approvalStatus === 'PENDING' || ef.approvalStatus === 'IN_REVIEW' || ef.status === 'SUBMITTED') {
        const returned = isReturned(ef.id);
        items.push({
          id: ef.id,
          type: 'EXAM_VERIFICATION',
          title: `Exam Form Verification: ${ef.formNo || ef.id}`,
          module: 'Examination Cell',
          studentName: ef.studentName,
          enrollmentNo: ef.enrollmentNo,
          priority: 'CRITICAL',
          status: 'PENDING',
          assignedAt: ef.submissionDate || ef.createdAt || '2026-08-15',
          originalOwnerId: userId,
          isDelegated: transferredIn.has(ef.id),
          isReturnedFromDelegation: returned,
          delegationLabel: returned ? 'Returned from Delegation (Responsibility Restored)' : (transferredIn.has(ef.id) ? 'Delegated Work' : undefined)
        });
      }
    });

    // 4. Student Documents Verification
    (state.studentDocuments || []).forEach((doc: any) => {
      if (doc.status === 'PENDING_VERIFICATION' || doc.status === 'PENDING') {
        const returned = isReturned(doc.id);
        items.push({
          id: doc.id,
          type: 'DOCUMENT_VERIFICATION',
          title: `Document Verification: ${doc.title || doc.fileName}`,
          module: 'Document Master',
          studentName: 'Demo Student',
          enrollmentNo: '230101001',
          priority: 'MEDIUM',
          status: 'PENDING',
          assignedAt: doc.uploadDate || '2026-08-18',
          originalOwnerId: userId,
          isDelegated: transferredIn.has(doc.id),
          isReturnedFromDelegation: returned,
          delegationLabel: returned ? 'Returned from Delegation (Responsibility Restored)' : (transferredIn.has(doc.id) ? 'Delegated Work' : undefined)
        });
      }
    });

    // Exclude items that are currently transferred OUT
    return items.filter(item => !transferredOut.has(item.id));
  }

  // ════════════════════════════════════════════════════════════════════════════
  // WORK ITEM ASSIGNMENT TIMELINE / AUDIT TRAIL
  // ════════════════════════════════════════════════════════════════════════════
  public getWorkItemAssignmentHistory(workItemId: string): WorkAssignmentHistoryChainItem[] {
    const chain: WorkAssignmentHistoryChainItem[] = [];

    // Find all transfers involving this work item
    const relatedTransfers = this.transfers
      .filter(t => t.workItemIds.includes(workItemId))
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    if (relatedTransfers.length > 0) {
      const firstTransfer = relatedTransfers[0];
      
      // Step 1: Work Item Creation & Original Assignment
      chain.push({
        timestamp: firstTransfer.createdAt,
        action: 'CREATED & ASSIGNED',
        actor: firstTransfer.fromUserName,
        role: firstTransfer.fromUserRole,
        notes: `Work item originally created and assigned to ${firstTransfer.fromUserName}`
      });

      // Step 2: Traverse each transfer in the chain
      relatedTransfers.forEach(tr => {
        chain.push({
          timestamp: tr.createdAt,
          action: 'TRANSFER REQUESTED',
          actor: tr.fromUserName,
          role: tr.fromUserRole,
          fromUser: tr.fromUserName,
          toUser: tr.toUserName,
          reason: tr.reason,
          status: tr.status,
          notes: `Delegation initiated (${tr.startAt} to ${tr.endAt}). Reason: ${tr.reason}. Tracking: ${tr.trackingCode}`
        });

        if (tr.activatedAt) {
          chain.push({
            timestamp: tr.activatedAt,
            action: 'TRANSFER ACTIVATED',
            actor: 'System Scheduler',
            role: 'SYSTEM',
            fromUser: tr.fromUserName,
            toUser: tr.toUserName,
            status: 'ACTIVE',
            notes: `Work responsibility shifted to ${tr.toUserName}`
          });
        }

        if (tr.completedItemIds.includes(workItemId)) {
          chain.push({
            timestamp: tr.completedAt || tr.endAt,
            action: 'COMPLETED UNDER DELEGATION',
            actor: tr.completedByUserName || tr.toUserName,
            role: tr.toUserRole,
            status: 'COMPLETED',
            notes: `Task completed by delegated recipient ${tr.completedByUserName || tr.toUserName}`
          });
        } else if (tr.status === 'EXPIRED') {
          chain.push({
            timestamp: tr.expiredAt || tr.endAt,
            action: 'TRANSFER EXPIRED & RESTORED',
            actor: 'System Scheduler',
            role: 'SYSTEM',
            fromUser: tr.toUserName,
            toUser: tr.fromUserName,
            status: 'EXPIRED',
            notes: `Transfer period ended. Incomplete task restored to original owner ${tr.fromUserName}.`
          });
        } else if (tr.status === 'REVOKED') {
          chain.push({
            timestamp: tr.revokedAt || new Date().toISOString(),
            action: 'TRANSFER REVOKED',
            actor: tr.revokedByName || 'Administration',
            role: 'ADMIN',
            fromUser: tr.toUserName,
            toUser: tr.fromUserName,
            status: 'REVOKED',
            notes: `Transfer revoked by higher authority. Task returned to ${tr.fromUserName}.`
          });
        }
      });
    } else {
      // Default single-owner history
      chain.push({
        timestamp: '2026-08-20T10:00:00Z',
        action: 'CREATED & ASSIGNED',
        actor: 'Academic Office',
        role: 'ADMIN',
        notes: 'Work item assigned to active faculty member'
      });
    }

    return chain;
  }

  // ════════════════════════════════════════════════════════════════════════════
  // HIGHER AUTHORITY AUDIT & FILTERING ENGINE
  // ════════════════════════════════════════════════════════════════════════════
  public getFilteredTransfers(params: WorkTransferFilterParams, currentUser?: any): WorkTransferRecord[] {
    this.autoSyncTransferStatuses();
    let list = [...this.transfers];

    // Status filter
    if (params.status && params.status !== 'ALL') {
      list = list.filter(t => t.status === params.status);
    }

    // Reason filter
    if (params.reason && params.reason !== 'ALL') {
      list = list.filter(t => t.reason === params.reason);
    }

    // Department filter
    if (params.departmentId && params.departmentId !== 'ALL') {
      list = list.filter(t => 
        t.fromUserDepartmentId === params.departmentId || 
        t.toUserDepartmentId === params.departmentId
      );
    }

    // Institute filter
    if (params.instituteId && params.instituteId !== 'ALL') {
      list = list.filter(t => 
        t.fromUserInstituteId === params.instituteId || 
        t.toUserInstituteId === params.instituteId
      );
    }

    // From / To User filter
    if (params.fromUserId) {
      list = list.filter(t => t.fromUserId === params.fromUserId);
    }
    if (params.toUserId) {
      list = list.filter(t => t.toUserId === params.toUserId);
    }

    // Date range filter
    if (params.startDate) {
      list = list.filter(t => t.startAt >= params.startDate!);
    }
    if (params.endDate) {
      list = list.filter(t => t.endAt <= params.endDate!);
    }

    // Search query
    if (params.searchQuery && params.searchQuery.trim() !== '') {
      const q = params.searchQuery.toLowerCase().trim();
      list = list.filter(t => 
        t.trackingCode.toLowerCase().includes(q) ||
        t.fromUserName.toLowerCase().includes(q) ||
        t.toUserName.toLowerCase().includes(q) ||
        (t.remarks && t.remarks.toLowerCase().includes(q)) ||
        (t.fromUserDepartmentName && t.fromUserDepartmentName.toLowerCase().includes(q)) ||
        t.workItemIds.some(id => id.toLowerCase().includes(q))
      );
    }

    return list;
  }

  public getTransferAuditMetrics(currentUser?: any) {
    this.autoSyncTransferStatuses();
    const active = this.transfers.filter(t => t.status === 'ACTIVE').length;
    const scheduled = this.transfers.filter(t => t.status === 'SCHEDULED').length;
    const expired = this.transfers.filter(t => t.status === 'EXPIRED').length;
    const completed = this.transfers.filter(t => t.status === 'COMPLETED' || (t.completedItemIds.length > 0 && t.completedItemIds.length === t.totalItemsCount)).length;
    const cancelled = this.transfers.filter(t => t.status === 'CANCELLED').length;
    const revoked = this.transfers.filter(t => t.status === 'REVOKED').length;

    return {
      activeCount: active,
      scheduledCount: scheduled,
      expiredCount: expired,
      completedCount: completed,
      cancelledCount: cancelled,
      revokedCount: revoked,
      totalCount: this.transfers.length
    };
  }

  // ════════════════════════════════════════════════════════════════════════════
  // VALIDATION & CREATION
  // ════════════════════════════════════════════════════════════════════════════
  public validateWorkTransfer(dto: CreateWorkTransferDTO, currentUser: any): { valid: boolean; error?: string } {
    if (!dto.fromUserId || !dto.toUserId) {
      return { valid: false, error: 'Both origin faculty and recipient faculty are required.' };
    }
    if (dto.fromUserId === dto.toUserId) {
      return { valid: false, error: 'Cannot transfer work to oneself. Please select another colleague.' };
    }
    if (!dto.startAt || !dto.endAt) {
      return { valid: false, error: 'Transfer start date and end date are required.' };
    }
    if (dto.startAt > dto.endAt) {
      return { valid: false, error: 'Transfer end date cannot be earlier than start date.' };
    }
    if (!dto.workItemIds || dto.workItemIds.length === 0) {
      return { valid: false, error: 'Please select at least one work item or task to transfer.' };
    }

    // Active conflict checks
    const activeTransfers = this.getActiveTransfers(dto.startAt);
    
    // Conflict 1: Cannot transfer item that is already actively transferred to someone else
    for (const item of dto.workItemIds) {
      const existing = activeTransfers.find(t => t.workItemIds.includes(item));
      if (existing) {
        return { 
          valid: false, 
          error: `Work item ${item} is already actively delegated under transfer ${existing.trackingCode} until ${existing.endAt}.` 
        };
      }
    }

    // Conflict 2: Circular Transfer Prevention (A -> B when B is currently delegating to A)
    const circularActive = activeTransfers.find(t => t.fromUserId === dto.toUserId && t.toUserId === dto.fromUserId);
    if (circularActive) {
      return { 
        valid: false, 
        error: `Circular delegation detected: ${circularActive.fromUserName} currently has active transferred workload assigned to you until ${circularActive.endAt}.` 
      };
    }

    return { valid: true };
  }

  public createWorkTransfer(dto: CreateWorkTransferDTO, currentUser: any): WorkTransferRecord {
    const val = this.validateWorkTransfer(dto, currentUser);
    if (!val.valid) {
      throw new Error(val.error || 'Invalid work transfer request.');
    }

    const state = db.getState();
    const fromFaculty = state.faculty.find(f => f.id === dto.fromUserId);
    const toFaculty = state.faculty.find(f => f.id === dto.toUserId);
    const fromUser = state.users.find(u => u.id === dto.fromUserId) || fromFaculty;
    const toUser = state.users.find(u => u.id === dto.toUserId) || toFaculty;

    const fromDept = fromFaculty ? db.getDepartmentById(fromFaculty.departmentId) : undefined;
    const toDept = toFaculty ? db.getDepartmentById(toFaculty.departmentId) : undefined;
    const fromInst = fromDept ? db.getInstituteById(fromDept.instituteId) : undefined;
    const toInst = toDept ? db.getInstituteById(toDept.instituteId) : undefined;

    const today = this.getTodayString();
    const isImmediate = dto.startAt <= today && today <= dto.endAt;
    const status: WorkTransferStatus = isImmediate ? 'ACTIVE' : 'SCHEDULED';
    const trackingCode = `WTR-${new Date().getFullYear()}-${String(this.transfers.length + 1).padStart(6, '0')}`;

    const creationAuditEvent: WorkTransferAuditEvent = {
      id: `aud-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      transferId: '',
      timestamp: new Date().toISOString(),
      actorId: currentUser?.id || dto.fromUserId,
      actorName: currentUser?.name || (fromUser as any)?.name || 'Faculty Member',
      actorRole: currentUser?.role || (fromUser as any)?.role || 'FACULTY',
      action: 'TRANSFER_CREATED',
      details: `Delegated ${dto.workItemIds.length} tasks to ${(toUser as any)?.name || 'Recipient'} (${dto.startAt} to ${dto.endAt}, Reason: ${dto.reason})`
    };

    const newRecord: WorkTransferRecord = {
      id: `wtr-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      trackingCode,
      fromUserId: dto.fromUserId,
      fromUserName: (fromUser as any)?.name || 'Faculty Member',
      fromUserRole: (fromUser as any)?.role || 'FACULTY',
      fromUserDepartmentId: (fromUser as any)?.departmentId,
      fromUserDepartmentName: fromDept?.name || 'Department',
      fromUserInstituteId: fromInst?.id,
      fromUserInstituteName: fromInst?.name || 'SSIU Institute',
      toUserId: dto.toUserId,
      toUserName: (toUser as any)?.name || 'Assigned Recipient',
      toUserRole: (toUser as any)?.role || 'FACULTY',
      toUserDepartmentId: (toUser as any)?.departmentId,
      toUserDepartmentName: toDept?.name || 'Department',
      toUserInstituteId: toInst?.id,
      toUserInstituteName: toInst?.name || 'SSIU Institute',
      startAt: dto.startAt,
      endAt: dto.endAt,
      reason: dto.reason,
      remarks: dto.remarks || '',
      status,
      workItemIds: dto.workItemIds,
      workItemTypes: ['STUDENT_REQUEST', 'APPROVAL_REQUEST'],
      totalItemsCount: dto.workItemIds.length,
      completedItemIds: [],
      createdBy: currentUser?.id || dto.fromUserId,
      createdByName: currentUser?.name || (fromUser as any)?.name,
      createdByRole: currentUser?.role || 'FACULTY',
      createdAt: new Date().toISOString(),
      activatedAt: isImmediate ? new Date().toISOString() : undefined,
      auditTrail: []
    };

    creationAuditEvent.transferId = newRecord.id;
    newRecord.auditTrail = [creationAuditEvent];

    if (isImmediate) {
      newRecord.auditTrail.push({
        id: `aud-act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        transferId: newRecord.id,
        timestamp: new Date().toISOString(),
        actorId: 'system',
        actorName: 'SSIU ERP Scheduler',
        actorRole: 'SYSTEM',
        action: 'TRANSFER_ACTIVATED',
        details: `Immediate transfer activated upon creation`
      });
    }

    this.transfers.unshift(newRecord);
    this.save();

    // Audit Logging in central DB
    db.logAudit({
      action: 'WORK_TRANSFER_CREATED',
      entity: 'WorkTransfer',
      entityId: newRecord.id,
      details: `Delegated ${newRecord.totalItemsCount} work items from ${newRecord.fromUserName} to ${newRecord.toUserName} (${newRecord.startAt} to ${newRecord.endAt}, Reason: ${newRecord.reason})`,
      userId: currentUser?.id || dto.fromUserId,
      ipAddress: '127.0.0.1'
    });

    // In-App Notifications
    db.addNotification({
      targetUserId: dto.toUserId,
      targetRole: 'FACULTY',
      title: 'New Delegated Workload Assigned',
      message: `${newRecord.fromUserName} has transferred ${newRecord.totalItemsCount} work item(s) to you for the period ${newRecord.startAt} to ${newRecord.endAt}. Reason: ${newRecord.reason}.`,
      module: 'ADMINISTRATION',
      type: 'INFO' as any
    });

    db.addNotification({
      targetUserId: dto.fromUserId,
      targetRole: 'FACULTY',
      title: 'Work Transfer Successfully Registered',
      message: `Your work transfer of ${newRecord.totalItemsCount} item(s) to ${newRecord.toUserName} is confirmed (${newRecord.trackingCode}).`,
      module: 'ADMINISTRATION',
      type: 'SUCCESS' as any
    });

    return newRecord;
  }

  // ════════════════════════════════════════════════════════════════════════════
  // REVOCATION, CANCELLATION & COMPLETION
  // ════════════════════════════════════════════════════════════════════════════
  public cancelScheduledTransfer(transferId: string, currentUser: any): WorkTransferRecord {
    const record = this.transfers.find(t => t.id === transferId);
    if (!record) {
      throw new Error('Work transfer record not found.');
    }
    if (record.status !== 'SCHEDULED') {
      throw new Error(`Only SCHEDULED transfers can be cancelled. Current status is ${record.status}.`);
    }

    record.status = 'CANCELLED';
    record.cancelledAt = new Date().toISOString();
    record.cancelledBy = currentUser?.id || 'admin';
    record.cancelledByName = currentUser?.name || 'Administrator';

    const cancelEvent: WorkTransferAuditEvent = {
      id: `aud-cnl-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      transferId: record.id,
      timestamp: new Date().toISOString(),
      actorId: currentUser?.id || 'admin',
      actorName: currentUser?.name || 'Administrator',
      actorRole: currentUser?.role || 'ADMIN',
      action: 'TRANSFER_CANCELLED',
      details: `Scheduled transfer cancelled before activation date by ${currentUser?.name || 'Administrator'}`
    };

    record.auditTrail = [...(record.auditTrail || []), cancelEvent];
    this.save();

    db.logAudit({
      action: 'WORK_TRANSFER_CANCELLED',
      entity: 'WorkTransfer',
      entityId: record.id,
      details: `Scheduled transfer ${record.trackingCode} cancelled by ${currentUser?.name || 'Administrator'}`,
      userId: currentUser?.id || 'admin',
      ipAddress: '127.0.0.1'
    });

    return record;
  }

  public revokeWorkTransfer(transferId: string, currentUser: any): WorkTransferRecord {
    const record = this.transfers.find(t => t.id === transferId);
    if (!record) {
      throw new Error('Work transfer record not found.');
    }

    if (record.status === 'EXPIRED' || record.status === 'REVOKED' || record.status === 'CANCELLED') {
      throw new Error(`Cannot revoke a transfer that is already ${record.status}.`);
    }

    record.status = 'REVOKED';
    record.revokedAt = new Date().toISOString();
    record.revokedBy = currentUser?.id || 'admin';
    record.revokedByName = currentUser?.name || 'Administrator';

    const revokeEvent: WorkTransferAuditEvent = {
      id: `aud-rvk-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      transferId: record.id,
      timestamp: new Date().toISOString(),
      actorId: currentUser?.id || 'admin',
      actorName: currentUser?.name || 'Administrator',
      actorRole: currentUser?.role || 'ADMIN',
      action: 'TRANSFER_REVOKED',
      details: `Transfer revoked by ${currentUser?.name || 'User'}. Remaining tasks returned to ${record.fromUserName}.`
    };

    record.auditTrail = [...(record.auditTrail || []), revokeEvent];
    this.save();

    // Audit Log
    db.logAudit({
      action: 'WORK_TRANSFER_REVOKED',
      entity: 'WorkTransfer',
      entityId: record.id,
      details: `Transfer ${record.trackingCode} revoked by ${currentUser?.name || 'User'}. Remaining tasks returned to ${record.fromUserName}.`,
      userId: currentUser?.id || 'admin',
      ipAddress: '127.0.0.1'
    });

    // Notifications
    db.addNotification({
      targetUserId: record.fromUserId,
      targetRole: 'FACULTY',
      title: 'Work Transfer Revoked',
      message: `Work transfer ${record.trackingCode} has been revoked. All pending items are now restored to your active workload.`,
      module: 'ADMINISTRATION',
      type: 'INFO' as any
    });

    db.addNotification({
      targetUserId: record.toUserId,
      targetRole: 'FACULTY',
      title: 'Delegated Work Recalled',
      message: `Delegated work from ${record.fromUserName} (${record.trackingCode}) has been revoked by administration.`,
      module: 'ADMINISTRATION',
      type: 'INFO' as any
    });

    return record;
  }

  // Record item completed by recipient during transfer window
  public markWorkItemCompleted(workItemId: string, completedByUserId: string, completedByUserName?: string): void {
    const active = this.getActiveTransfers();
    const transfer = active.find(t => t.workItemIds.includes(workItemId));
    if (transfer && !transfer.completedItemIds.includes(workItemId)) {
      transfer.completedItemIds.push(workItemId);
      transfer.completedByUserId = completedByUserId;
      transfer.completedByUserName = completedByUserName || 'Delegated Faculty';
      transfer.completedAt = new Date().toISOString();

      if (transfer.completedItemIds.length === transfer.totalItemsCount) {
        transfer.status = 'COMPLETED';
      }

      const completeEvent: WorkTransferAuditEvent = {
        id: `aud-cmp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        transferId: transfer.id,
        workItemId,
        timestamp: new Date().toISOString(),
        actorId: completedByUserId,
        actorName: completedByUserName || 'Delegated Faculty',
        actorRole: 'FACULTY',
        action: 'WORK_COMPLETED',
        details: `Task completed by delegated recipient (${completedByUserName || completedByUserId})`
      };

      transfer.auditTrail = [...(transfer.auditTrail || []), completeEvent];
      this.save();

      db.logAudit({
        action: 'DELEGATED_WORK_COMPLETED',
        entity: 'WorkItem',
        entityId: workItemId,
        details: `Delegated work item completed by assignee ${completedByUserName || completedByUserId} under transfer ${transfer.trackingCode}`,
        userId: completedByUserId,
        ipAddress: '127.0.0.1'
      });
    }
  }

  // ════════════════════════════════════════════════════════════════════════════
  // CSV / EXPORT GENERATOR
  // ════════════════════════════════════════════════════════════════════════════
  public generateCsvExport(records: WorkTransferRecord[]): string {
    const headers = [
      'Transfer ID',
      'Tracking Code',
      'Original Owner',
      'Transferred By',
      'Transferred To',
      'Department',
      'Institute',
      'Start Date',
      'End Date',
      'Reason',
      'Status',
      'Total Items',
      'Completed Items',
      'Completed By',
      'Created Date'
    ];

    const rows = records.map(r => [
      r.id,
      r.trackingCode,
      `"${r.fromUserName}"`,
      `"${r.createdByName || r.fromUserName}"`,
      `"${r.toUserName}"`,
      `"${r.fromUserDepartmentName || ''}"`,
      `"${r.fromUserInstituteName || ''}"`,
      r.startAt,
      r.endAt,
      r.reason,
      r.status,
      r.totalItemsCount,
      r.completedItemIds.length,
      `"${r.completedByUserName || ''}"`,
      r.createdAt
    ]);

    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  }

  // Getters for specific scopes
  public getAllTransfers(): WorkTransferRecord[] {
    this.autoSyncTransferStatuses();
    return this.transfers;
  }

  public getTransferById(id: string): WorkTransferRecord | undefined {
    this.autoSyncTransferStatuses();
    return this.transfers.find(t => t.id === id || t.trackingCode === id);
  }

  public getTransfersCreatedByUser(userId: string): WorkTransferRecord[] {
    this.autoSyncTransferStatuses();
    return this.transfers.filter(t => t.fromUserId === userId);
  }

  public getTransfersReceivedByUser(userId: string): WorkTransferRecord[] {
    this.autoSyncTransferStatuses();
    return this.transfers.filter(t => t.toUserId === userId);
  }

  // Reset helper for testing
  public resetToInitialSeed(): void {
    this.transfers = this.getInitialSeedTransfers();
    this.save();
  }
}

export const workTransferService = new WorkTransferService();
