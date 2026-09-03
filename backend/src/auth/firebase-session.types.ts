/**
 * ==============================================================================
 * SSIU ERP — FIREBASE AUTHENTICATION & SESSION DATA TYPES
 * Central type definitions for authenticated Firebase sessions, roles, and identity mappings
 * ==============================================================================
 */

export type FirebaseERPRole =
  | 'SUPER_ADMIN'
  | 'PRESIDENT'
  | 'VICE_PRESIDENT'
  | 'PROVOST'
  | 'UNIVERSITY_ADMIN'
  | 'ERP_COORDINATOR'
  | 'PRINCIPAL'
  | 'HOD'
  | 'FACULTY'
  | 'STAFF'
  | 'ADMIN_STAFF'
  | 'MENTOR'
  | 'STUDENT_ADMIN'
  | 'STUDENT'
  | 'PARENT'
  | 'REGISTRAR'
  | 'DEPUTY_REGISTRAR'
  | 'IQAC'
  | 'EXAM_CELL'
  | 'STUDENT_SECTION'
  | 'HOSTEL_ADMIN'
  | 'HOSTEL_WARDEN'
  | 'SECURITY'
  | 'LIBRARY_ADMIN'
  | 'TRANSPORT_ADMIN'
  | 'MAINTENANCE_ADMIN'
  | 'ACCOUNTS_ADMIN'
  | 'HR_ADMIN'
  | 'HR_OFFICER';

export interface AuthenticatedFirebaseUserSession {
  uid: string;
  email: string;
  displayName: string;
  role: FirebaseERPRole;
  roles: FirebaseERPRole[];
  active: boolean;
  status: 'ACTIVE' | 'DISABLED' | 'LOCKED' | 'SUSPENDED';
  isSuperAdmin: boolean;

  // Identity links
  employeeId?: string;
  studentId?: string;
  parentStudentIds?: string[];

  // Academic scopes
  instituteId?: string;
  departmentId?: string;
  programId?: string;
  semesterId?: string;
  divisionId?: string;
  mentorId?: string;

  // Permissions & metadata
  permissions?: string[];
  tokenIssuedAt?: number;
  tokenExpiresAt?: number;
}
