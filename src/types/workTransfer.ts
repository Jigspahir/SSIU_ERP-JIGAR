export type WorkTransferStatus = 'SCHEDULED' | 'ACTIVE' | 'EXPIRED' | 'COMPLETED' | 'CANCELLED' | 'REVOKED';

export type WorkItemType = 
  | 'STUDENT_TASK' 
  | 'STUDENT_REQUEST' 
  | 'APPROVAL_REQUEST' 
  | 'EXAM_VERIFICATION' 
  | 'ATTENDANCE_TASK' 
  | 'MARKS_ENTRY' 
  | 'DOCUMENT_VERIFICATION' 
  | 'GRIEVANCE' 
  | 'WORK_DIARY' 
  | 'EDP_DUTY' 
  | 'COURSE_WORKLOAD';

export type TransferReason = 
  | 'LEAVE' 
  | 'VACATION' 
  | 'WEEK_OFF' 
  | 'OFFICIAL_DUTY' 
  | 'UNAVAILABLE' 
  | 'TEMPORARY_ASSIGNMENT' 
  | 'EMERGENCY'
  | 'OTHER';

export interface WorkTransferAuditEvent {
  id: string;
  transferId: string;
  workItemId?: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  action: 
    | 'TRANSFER_CREATED' 
    | 'TRANSFER_CONFIRMED' 
    | 'TRANSFER_ACTIVATED' 
    | 'WORK_ACCESSED' 
    | 'WORK_COMPLETED' 
    | 'TRANSFER_EXPIRED' 
    | 'RESPONSIBILITY_RESTORED' 
    | 'TRANSFER_REVOKED' 
    | 'TRANSFER_CANCELLED';
  details: string;
}

export interface WorkItemSummary {
  id: string;
  type: WorkItemType;
  title: string;
  description?: string;
  module: string;
  studentId?: string;
  studentName?: string;
  enrollmentNo?: string;
  studentEnrollment?: string;
  departmentName?: string;
  programName?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  dueDate?: string;
  assignedAt: string;
  createdAt?: string;
  originalOwnerId?: string;
  originalOwnerName?: string;
  currentAssigneeId?: string;
  currentAssigneeName?: string;
  isDelegated?: boolean;
  isReturnedFromDelegation?: boolean;
  delegationLabel?: string; // e.g. "Returned from Delegation", "Delegated to Prof. B"
}

export interface WorkTransferRecord {
  id: string;
  trackingCode: string; // e.g. WTR-2026-000001
  fromUserId: string;
  fromUserName: string;
  fromUserRole: string;
  fromUserDepartmentId?: string;
  fromUserDepartmentName?: string;
  fromUserInstituteId?: string;
  fromUserInstituteName?: string;
  toUserId: string;
  toUserName: string;
  toUserRole: string;
  toUserDepartmentId?: string;
  toUserDepartmentName?: string;
  toUserInstituteId?: string;
  toUserInstituteName?: string;
  startAt: string; // YYYY-MM-DD
  endAt: string;   // YYYY-MM-DD
  reason: TransferReason;
  remarks?: string;
  status: WorkTransferStatus;
  workItemIds: string[];
  workItemTypes: WorkItemType[];
  totalItemsCount: number;
  completedItemIds: string[];
  createdBy: string;
  createdByName?: string;
  createdByRole?: string;
  createdAt: string;
  activatedAt?: string;
  completedAt?: string;
  completedByUserId?: string;
  completedByUserName?: string;
  expiredAt?: string;
  cancelledAt?: string;
  cancelledBy?: string;
  cancelledByName?: string;
  revokedAt?: string;
  revokedBy?: string;
  revokedByName?: string;
  auditTrail: WorkTransferAuditEvent[];
}

export interface CreateWorkTransferDTO {
  fromUserId: string;
  toUserId: string;
  startAt: string;
  endAt: string;
  reason: TransferReason;
  remarks?: string;
  workItemIds: string[];
}

export interface WorkTransferFilterParams {
  startDate?: string;
  endDate?: string;
  departmentId?: string;
  instituteId?: string;
  fromUserId?: string;
  toUserId?: string;
  module?: string;
  workType?: WorkItemType;
  status?: WorkTransferStatus | 'ALL';
  reason?: TransferReason | 'ALL';
  searchQuery?: string;
}

export interface WorkAssignmentHistoryChainItem {
  timestamp: string;
  action: string;
  actor: string;
  role: string;
  fromUser?: string;
  toUser?: string;
  transferTrackingCode?: string;
  reason?: string;
  status?: string;
  notes?: string;
}

