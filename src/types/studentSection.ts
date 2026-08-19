// ==============================================================================
// SWARRNIM UNIVERSITY ERP — STUDENT SECTION & OFFICIAL SERVICES TYPES
// ==============================================================================

export type StudentSectionDeliveryMode = 'DIGITAL' | 'PHYSICAL' | 'BOTH';

export type StudentSectionRequestStatus = 
  | 'DRAFT'
  | 'SUBMITTED'
  | 'PAYMENT_PENDING'
  | 'PAID'
  | 'UNDER_REVIEW'
  | 'PROCESSING'
  | 'READY'
  | 'COMPLETED'
  | 'REJECTED'
  | 'CANCELLED';

export type StudentSectionPaymentStatus = 
  | 'NOT_REQUIRED'
  | 'PENDING'
  | 'PAID'
  | 'FAILED'
  | 'REFUNDED'
  | 'WAIVED';

export type StudentServiceCategory =
  | 'CERTIFICATE'
  | 'TRANSCRIPT'
  | 'DEGREE'
  | 'DUPLICATE_ID'
  | 'VERIFICATION'
  | 'MIGRATION'
  | 'TRANSFER'
  | 'MARKSHEET'
  | 'OTHER';

export interface StudentSectionService {
  id: string;
  code: string;
  name: string;
  description: string;
  category: StudentServiceCategory;
  fee: number;
  urgentFee: number;
  isRefundable: boolean;
  deliveryMode: StudentSectionDeliveryMode;
  processingDays: number;
  urgentProcessingDays: number;
  requiredDocuments: string[];
  templateId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StudentSectionTimelineItem {
  id: string;
  action: string;
  fromUserId: string;
  fromUserName: string;
  fromUserRole: string;
  toUserId?: string;
  toUserName?: string;
  toUserRole?: string;
  timestamp: string;
  remarks?: string;
  status: StudentSectionRequestStatus;
}

export interface StudentSectionRequest {
  id: string;
  requestNo: string; // e.g. SSR/2026/000001
  studentId: string;
  studentName: string;
  enrollmentNo: string;
  email: string;
  phone?: string;
  departmentId: string;
  departmentName: string;
  programId: string;
  programName: string;
  semesterId?: string;
  semesterName?: string;
  
  // Service configuration
  serviceId: string;
  serviceCode: string;
  serviceName: string;
  category: StudentServiceCategory;
  purpose: string;
  copies: number;
  isUrgent: boolean;

  // Financial / Payment
  calculatedFee: number;
  paymentStatus: StudentSectionPaymentStatus;
  paymentTransactionId?: string;
  receiptNo?: string;
  paidAt?: string;

  // Delivery & Dispatch
  deliveryMode: StudentSectionDeliveryMode;
  deliveryAddress?: string;
  trackingNumber?: string;
  dispatchedAt?: string;

  // Review & Processing
  status: StudentSectionRequestStatus;
  assignedStaffId?: string;
  assignedStaffName?: string;
  rejectionReason?: string;
  remarks?: string;

  // Generated Document
  documentId?: string;
  documentNo?: string;
  documentUrl?: string;
  documentIssuedAt?: string;

  // Attachments
  attachments: {
    name: string;
    url: string;
    uploadedAt: string;
  }[];

  timeline: StudentSectionTimelineItem[];
  createdAt: string;
  updatedAt: string;
}

export interface StudentSectionDocument {
  id: string;
  documentNo: string; // e.g. SSIU/DOC/2026/000123
  requestId: string;
  requestNo: string;
  studentId: string;
  studentName: string;
  enrollmentNo: string;
  departmentName: string;
  programName: string;
  serviceName: string;
  title: string;
  contentHtml?: string;
  fileUrl: string;
  fileType: 'PDF' | 'IMAGE';
  generatedBy: string;
  generatedByName: string;
  generatedAt: string;
  version: number;
  verificationCode: string; // QR / Security Hash
  status: 'ACTIVE' | 'REVOKED';
  downloadsCount: number;
}
