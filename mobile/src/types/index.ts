export type UserRole =
  | 'SUPER_ADMIN'
  | 'PRESIDENT'
  | 'VICE_PRESIDENT'
  | 'PROVOST'
  | 'UNIVERSITY_ADMIN'
  | 'PRINCIPAL'
  | 'HOD'
  | 'FACULTY'
  | 'MENTOR'
  | 'STUDENT'
  | 'PARENT'
  | 'REGISTRAR'
  | 'DEPUTY_REGISTRAR'
  | 'IQAC'
  | 'EXAM_CELL'
  | 'STUDENT_SECTION'
  | 'HOSTEL_ADMIN'
  | 'LIBRARY_ADMIN'
  | 'TRANSPORT_ADMIN'
  | 'MAINTENANCE_ADMIN'
  | 'ACCOUNTS_ADMIN';

export interface User {
  id: string;
  erpId?: string;
  name: string;
  email: string;
  username?: string;
  role: UserRole;
  roles?: UserRole[];
  phone?: string;
  avatar?: string;
  instituteId?: string;
  instituteName?: string;
  departmentId?: string;
  departmentName?: string;
  programId?: string;
  programName?: string;
  designation?: string;
  enrollmentNo?: string;
  employeeId?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'LOCKED' | 'SUSPENDED';
}

export interface Student {
  id: string;
  enrollmentNo: string;
  name: string;
  email: string;
  phone: string;
  photo?: string;
  gender: 'Male' | 'Female' | 'Other';
  dateOfBirth?: string;
  bloodGroup?: string;
  address?: string;
  admissionDate?: string;
  instituteId: string;
  instituteName?: string;
  departmentId?: string;
  departmentName?: string;
  programId: string;
  programName?: string;
  batchId: string;
  batchName?: string;
  semesterId: string;
  semesterNumber?: number;
  divisionId: string;
  divisionName?: string;
  guardianName: string;
  guardianPhone: string;
  guardianEmail?: string;
  mentorId?: string;
  mentorName?: string;
  abcId?: string;
  abcIdStatus?: 'NOT_SUBMITTED' | 'PENDING_VERIFICATION' | 'VERIFIED' | 'REJECTED';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'GRADUATED';
}

export interface AttendanceRecord {
  id: string;
  subjectCode: string;
  subjectName: string;
  facultyName: string;
  totalSessions: number;
  attendedSessions: number;
  percentage: number;
  lastUpdated: string;
  status: 'SAFE' | 'WARNING' | 'CRITICAL';
}

export interface AttendanceSummary {
  studentId: string;
  overallPercentage: number;
  totalPresent: number;
  totalConducted: number;
  isEligibleForExams: boolean;
  records: AttendanceRecord[];
}

export interface ExamResultItem {
  id: string;
  semesterNumber: number;
  examSession: string; // e.g. "Winter 2024"
  examType: 'REGULAR' | 'REMEDIAL';
  sgpa: number;
  cgpa: number;
  backlogs: number;
  status: 'PASS' | 'FAIL' | 'WITHHELD';
  subjects: {
    code: string;
    name: string;
    credits: number;
    grade: string;
    points: number;
    internalMarks: number;
    externalMarks: number;
    totalMarks: number;
    maxMarks: number;
    status: 'PASS' | 'FAIL';
  }[];
}

export interface StudentDiaryEntry {
  id: string;
  semester: string;
  academicYear: string;
  sgpa: number;
  attendancePercentage: number;
  remarks: string;
  achievements: string[];
  certificates: string[];
  updatedAt: string;
}

export interface PTMRecord {
  id: string;
  title: string;
  date: string;
  timeSlot: string;
  mode: 'OFFLINE' | 'ONLINE';
  venue?: string;
  meetingLink?: string;
  facultyId: string;
  facultyName: string;
  studentId: string;
  studentName: string;
  status: 'SCHEDULED' | 'INVITED' | 'CONFIRMED' | 'RESCHEDULE_REQUESTED' | 'COMPLETED' | 'CANCELLED';
  rescheduleReason?: string;
  proposedDate?: string;
  proposedTime?: string;
  facultyRemarks?: string;
  parentFeedback?: string;
  actionItems?: string[];
}

export interface StudentServiceRequest {
  id: string;
  ticketNumber: string;
  studentId: string;
  studentName: string;
  enrollmentNo: string;
  category: 'ACADEMIC' | 'FEES' | 'HOSTEL' | 'TRANSPORT' | 'CERTIFICATE' | 'DOCUMENT' | 'GRIEVANCE' | 'OTHER';
  title: string;
  description: string;
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
  assignedOffice?: string;
  responseRemarks?: string;
  resolvedAt?: string;
  attachmentUrl?: string;
}

export interface ERPNotificationItem {
  id: string;
  title: string;
  message: string;
  module: 'ATTENDANCE' | 'EXAM' | 'PTM' | 'FEES' | 'REQUEST' | 'NOTICE' | 'GENERAL';
  type: 'INFO' | 'ALERT' | 'REMINDER' | 'SUCCESS' | 'ACTION_REQUIRED';
  priority: 'URGENT' | 'HIGH' | 'MEDIUM' | 'NORMAL';
  isRead: boolean;
  createdAt: string;
  deepLink?: string;
  referenceId?: string;
}

export interface FeeSummary {
  studentId: string;
  totalAnnualFee: number;
  paidAmount: number;
  pendingAmount: number;
  dueDate: string;
  status: 'PAID' | 'PARTIAL' | 'OVERDUE';
  invoices: {
    id: string;
    invoiceNo: string;
    feeHead: string;
    amount: number;
    paidAmount: number;
    status: 'PAID' | 'PENDING' | 'OVERDUE';
    dueDate: string;
  }[];
}
