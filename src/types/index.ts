export type UserRole = 
  | 'SUPER_ADMIN' 
  | 'UNIVERSITY_ADMIN' 
  | 'PRINCIPAL' 
  | 'HOD' 
  | 'FACULTY' 
  | 'STUDENT'
  | 'REGISTRAR'
  | 'IQAC'
  | 'EXAM_CELL'
  | 'STUDENT_SECTION'
  | 'HOSTEL_ADMIN'
  | 'LIBRARY_ADMIN'
  | 'TRANSPORT_ADMIN'
  | 'MAINTENANCE_ADMIN';


export interface User {
  id: string;
  name: string;
  email: string;
  username?: string;
  password?: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  instituteId?: string;
  departmentId?: string;
  programId?: string;
  designation?: string;
  enrollmentNo?: string;
  employeeId?: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}

export interface Institute {
  id: string;
  code: string;
  name: string;
  type: 'Engineering' | 'Management' | 'Design' | 'Architecture' | 'Pharmacy' | 'Science' | 'Other';
  principalName?: string;
  principalId?: string;
  email: string;
  phone: string;
  location: string;
  establishedYear: number;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface Department {
  id: string;
  code: string;
  name: string;
  instituteId: string;
  hodName?: string;
  hodId?: string;
  email: string;
  phone: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface Program {
  id: string;
  code: string;
  name: string;
  departmentId: string;
  instituteId: string;
  degreeType: 'B.Tech' | 'M.Tech' | 'BCA' | 'MCA' | 'MBA' | 'B.Des' | 'M.Des' | 'B.Pharm' | 'B.Arch' | 'Diploma' | 'Ph.D';
  durationYears: number;
  totalSemesters: number;
  intakeCapacity: number;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface AcademicYear {
  id: string;
  name: string; // e.g. "2024-2025"
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  status: 'ACTIVE' | 'ARCHIVED';
}

export interface Batch {
  id: string;
  name: string; // e.g. "2024-2028"
  programId: string;
  academicYearId: string;
  startYear: number;
  endYear: number;
  status: 'ACTIVE' | 'COMPLETED';
}

export interface Semester {
  id: string;
  number: number; // e.g. 1 to 8
  code: string; // e.g. "SEM-1"
  programId: string;
  academicYearId: string;
  status: 'ACTIVE' | 'COMPLETED' | 'UPCOMING';
}

export interface Division {
  id: string;
  name: string; // e.g. "Div A", "Div B"
  semesterId: string;
  batchId: string;
  programId: string;
  capacity: number;
  roomNo: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface Subject {
  id: string;
  code: string; // e.g. "CSE-101"
  name: string;
  semesterId: string;
  programId: string;
  departmentId: string;
  type: 'THEORY' | 'PRACTICAL' | 'ELECTIVE' | 'LAB';
  credits: number;
  theoryHoursPerWeek: number;
  labHoursPerWeek: number;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface Faculty {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  phone: string;
  photo?: string;
  designation: 'Professor' | 'Associate Professor' | 'Assistant Professor' | 'Lecturer' | 'Adjunct';
  instituteId: string;
  departmentId: string;
  qualification: string;
  specialization?: string;
  joiningDate?: string;
  dateOfBirth?: string;
  bloodGroup?: string;
  address?: string;
  experienceYears: number;
  subjectIds: string[];
  status: 'ACTIVE' | 'ON_LEAVE' | 'INACTIVE';
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
  departmentId: string;
  programId: string;
  academicYearId?: string;
  batchId: string;
  semesterId: string;
  divisionId: string;
  guardianName: string;
  guardianPhone: string;
  abcId?: string; // 12-digit Academic Bank of Credits ID e.g. "9842-1056-7890"
  abcIdStatus?: 'NOT_SUBMITTED' | 'PENDING_VERIFICATION' | 'VERIFIED' | 'REJECTED';
  abcIdDocUrl?: string;
  abcIdRemarks?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'GRADUATED';
}

export type DocumentVerificationStatus = 'PENDING_VERIFICATION' | 'VERIFIED' | 'REJECTED';

export interface StudentDocument {
  id: string;
  studentId: string;
  studentName: string;
  enrollmentNo: string;
  title: string;
  category: 'ACADEMIC' | 'IDENTITY' | 'ADMISSION' | 'CERTIFICATE' | 'OTHER';
  fileName: string;
  fileSize: string;
  fileUrl?: string;
  uploadDate: string;
  status: DocumentVerificationStatus;
  isLocked: boolean; // Permanently locked after Admin verification
  verifiedBy?: string;
  verifiedAt?: string;
  remarks?: string;
  rejectionReason?: string;
}

export interface StandardDocumentDefinition {
  title: string;
  category: 'ACADEMIC' | 'IDENTITY' | 'ADMISSION' | 'CERTIFICATE' | 'OTHER';
  description: string;
  required: boolean;
}

export const STANDARD_STUDENT_DOCUMENTS: StandardDocumentDefinition[] = [
  { title: 'Aadhaar Card', category: 'IDENTITY', description: 'National Identity Proof (12-digit Unique Identification)', required: true },
  { title: 'Passport Size Photo', category: 'IDENTITY', description: 'Official Color Photograph for University ID Card', required: true },
  { title: 'Student Signature', category: 'IDENTITY', description: 'Specimen Signature for Examination & Official Records', required: true },
  { title: '10th Marksheet', category: 'ACADEMIC', description: 'Secondary School Certificate (SSC) Marksheet', required: true },
  { title: '12th Marksheet', category: 'ACADEMIC', description: 'Higher Secondary Certificate (HSC) Marksheet', required: true },
  { title: 'Diploma Marksheet', category: 'ACADEMIC', description: 'Polytechnic / Diploma Transcripts (For Lateral Entry)', required: false },
  { title: 'Graduation Marksheet', category: 'ACADEMIC', description: 'Undergraduate Degree Transcripts (For Post-Graduate Programs)', required: false },
  { title: 'Transfer Certificate (TC)', category: 'ADMISSION', description: 'Original College / School Leaving Transfer Certificate', required: true },
  { title: 'Migration Certificate', category: 'ADMISSION', description: 'Inter-Board / Inter-University Migration Certificate', required: true },
  { title: 'Caste Certificate', category: 'CERTIFICATE', description: 'Government Issued Caste / Category Certificate (SC/ST/OBC/EWS)', required: false },
  { title: 'Income Certificate', category: 'CERTIFICATE', description: 'Financial Year Income Proof Certificate for Scholarships', required: false },
  { title: 'ABC ID', category: 'CERTIFICATE', description: '12-Digit Academic Bank of Credits DigiLocker Card', required: true },
  { title: 'Bank Passbook / Cancelled Cheque', category: 'CERTIFICATE', description: 'Bank Account Passbook Front Page or Cancelled Cheque for Refunds/Stipends', required: true }
];


export interface AuditLog {
  id: string;
  timestamp: string;
  userName: string;
  userRole: UserRole;
  action: string;
  entity: string;
  details: string;
}

// --- ACADEMIC MANAGEMENT MODULE TYPES ---

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE';

export interface AttendanceStudentEntry {
  studentId: string;
  studentName: string;
  enrollmentNo: string;
  status: AttendanceStatus;
  remarks?: string;
}

export interface AttendanceSession {
  id: string;
  date: string; // YYYY-MM-DD
  subjectId: string;
  divisionId: string;
  facultyId: string;
  facultyName: string;
  lectureNo: number;
  topicTaught: string;
  records: AttendanceStudentEntry[];
  submittedAt: string;
  status: 'SUBMITTED' | 'DRAFT';
}

export interface TimetableEntry {
  id: string;
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  timeSlot: string; // e.g. "09:00 AM - 10:00 AM"
  subjectId: string;
  facultyId: string;
  divisionId: string;
  roomNo: string;
  departmentId: string;
  status: 'ACTIVE' | 'CANCELLED';
}

export interface SessionPlanTopic {
  id: string;
  subjectId: string;
  unitNo: number;
  lectureNo: number;
  topicTitle: string;
  teachingMethod: 'Chalk & Board' | 'PPT Presentation' | 'Lab Demonstration' | 'Interactive Case Study';
  plannedDate: string;
  completedDate?: string;
  status: 'COMPLETED' | 'PENDING' | 'IN_PROGRESS';
  facultyId: string;
  notes?: string;
}

export interface UnitMaterial {
  id: string;
  subjectId: string;
  unitNo: number;
  unitTitle: string;
  title: string;
  description: string;
  fileType: 'PDF' | 'PPT' | 'DOC' | 'ZIP' | 'LINK';
  fileSize?: string;
  fileUrl: string;
  uploadedByFacultyId: string;
  uploadedByFacultyName: string;
  uploadedDate: string;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  enrollmentNo: string;
  submittedDate: string;
  fileUrl: string;
  notes?: string;
  status: 'SUBMITTED' | 'GRADED' | 'LATE';
  obtainedMarks?: number;
  feedback?: string;
}

export interface Assignment {
  id: string;
  subjectId: string;
  divisionId: string;
  unitNo: number;
  title: string;
  description: string;
  deadline: string; // YYYY-MM-DD
  totalMarks: number;
  createdByFacultyId: string;
  createdByFacultyName: string;
  createdDate: string;
  attachmentUrl?: string;
  status: 'ACTIVE' | 'CLOSED';
}

export interface AcademicCalendarEvent {
  id: string;
  title: string;
  eventType: 'HOLIDAY' | 'EXAM' | 'EVENT' | 'SEMINAR' | 'IMPORTANT';
  startDate: string; // YYYY-MM-DD
  endDate: string;
  description: string;
  location?: string;
  isImportant: boolean;
  createdBy: string;
}

// --- PHASE 5: FEES AND FINANCE MANAGEMENT TYPES ---

export interface FeeStructure {
  id: string;
  programId: string;
  semesterId: string;
  academicYearId: string;
  tuitionFee: number;
  labFee: number;
  developmentFee: number;
  hostelFee?: number;
  totalAmount: number;
  status: 'ACTIVE' | 'ARCHIVED';
}

export type FeePaymentStatus = 'PAID' | 'PENDING' | 'OVERDUE' | 'PARTIAL' | 'FAILED' | 'REFUNDED';

export interface StudentFeeRecord {
  id: string;
  studentId: string;
  studentName: string;
  enrollmentNo: string;
  programId: string;
  semesterId: string;
  academicYearId: string;
  feeStructureId: string;
  tuitionFee: number;
  labFee: number;
  developmentFee: number;
  hostelFee: number;
  examFee?: number;
  lateFeePerDay?: number;
  lateFeeAmount?: number;
  feeType?: 'TUITION' | 'EXAM' | 'HOSTEL' | 'ALL';
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  dueDate: string; // YYYY-MM-DD
  status: FeePaymentStatus;
}

export type PaymentMode = 'Online UPI' | 'Credit/Debit Card' | 'Net Banking' | 'Cheque' | 'Demand Draft' | 'Bank Transfer';

export interface FeePaymentTransaction {
  id: string;
  studentFeeRecordId: string;
  receiptNo: string; // e.g. "SSIU-REC-2024-001"
  studentId: string;
  studentName: string;
  enrollmentNo: string;
  programId: string;
  semesterId: string;
  paidAmount: number;
  paymentMode: PaymentMode;
  transactionId: string;
  gatewayRef?: string;
  feeType?: 'TUITION' | 'EXAM' | 'OTHER';
  status?: 'SUCCESS' | 'PENDING' | 'FAILED' | 'REFUNDED';
  paymentDate: string; // YYYY-MM-DD
  remarks?: string;
  recordedBy: string;
}

// --- PHASE 6: CRM & ADMISSION MANAGEMENT TYPES ---

export interface LeadFollowUp {
  id: string;
  date: string; // YYYY-MM-DD
  notes: string;
  counsellorName: string;
}

export type LeadSource = 'Website' | 'Social Media' | 'Newspaper' | 'Walk-in' | 'Reference' | 'Educational Fair';
export type LeadStatus = 'NEW' | 'CONTACTED' | 'INTERESTED' | 'FOLLOW_UP' | 'CONVERTED' | 'CLOSED';

export interface CRMLead {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: LeadSource;
  status: LeadStatus;
  counsellorId: string; // faculty ID
  counsellorName: string;
  programId: string;
  followUps: LeadFollowUp[];
  remarks?: string;
  createdAt: string; // YYYY-MM-DD
}

export type AdmissionApplicationStatus = 'APPLIED' | 'DOCUMENT_VERIFICATION' | 'SHORTLISTED' | 'APPROVED' | 'REJECTED' | 'CONVERTED';

export interface AdmissionDocument {
  id: string;
  name: string;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  fileUrl?: string;
}

export interface AdmissionApplication {
  id: string;
  leadId?: string; // If converted from CRM lead
  studentId?: string; // Generated once converted to active Student
  applicantName: string;
  email: string;
  phone: string;
  gender: 'Male' | 'Female' | 'Other';
  dateOfBirth: string;
  bloodGroup: string;
  address: string;
  guardianName: string;
  guardianPhone: string;
  programId: string;
  semesterId: string;
  batchId: string;
  divisionId: string;
  status: AdmissionApplicationStatus;
  documents: AdmissionDocument[];
  reviewerRemarks?: string;
  submittedAt: string; // YYYY-MM-DD
}

// --- PHASE 12: EXAMINATION MANAGEMENT TYPES ---

export type ExamType = 'Mid Semester' | 'End Semester' | 'Practical' | 'Remedial';
export type ExamStatus = 'DRAFT' | 'SCHEDULED' | 'ONGOING' | 'COMPLETED' | 'RESULTS_PUBLISHED';

export interface Exam {
  id: string;
  name: string; // e.g., "B.Tech Sem-1 Mid Sem 2024"
  type: ExamType;
  academicYearId: string;
  programId: string;
  semesterId: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;
  status: ExamStatus;
  description?: string;
  // Fee & Deadline Configuration
  baseFee: number;
  perSubjectFee: number;
  lateFee: number;
  formDeadline: string; // YYYY-MM-DD
  lateFeeDeadline: string; // YYYY-MM-DD
  minAttendancePercentage: number; // e.g., 75
}

export interface ExamTimetable {
  id: string;
  examId: string;
  subjectId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM AM/PM
  endTime: string;
  roomNo: string;
  supervisorId?: string; // Faculty ID
}

export type ExamFormStatus = 
  | 'DRAFT' 
  | 'SUBMITTED' 
  | 'PAYMENT_PENDING' 
  | 'PAID' 
  | 'VERIFICATION_PENDING' 
  | 'APPROVED' 
  | 'HALL_TICKET_ISSUED' 
  | 'REJECTED';

export interface ExamFormDocument {
  id: string;
  name: string;
  fileUrl: string;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
}

export interface ExamForm {
  id: string;
  examId: string;
  studentId: string;
  studentName: string;
  enrollmentNo: string;
  programId: string;
  semesterId: string;
  appliedDate: string; // YYYY-MM-DD
  status: ExamFormStatus;
  paymentStatus: 'PAID' | 'PENDING';
  regularSubjects: string[]; // Subject IDs
  remedialSubjects?: string[]; // Subject IDs
  baseFee: number;
  subjectFee: number;
  lateFee: number;
  totalFee: number;
  documents?: ExamFormDocument[];
  paymentMode?: string;
  transactionId?: string;
  paidAt?: string;
  hallTicketNo?: string;
  isEligible?: boolean;
  attendancePercentage?: number;
  rejectionReason?: string;
}

export interface StudentMarks {
  id: string;
  examId: string;
  studentId: string;
  subjectId: string;
  internalMarks: number;
  externalMarks: number;
  totalMarks: number;
  maxInternalMarks: number;
  maxExternalMarks: number;
  grade: string;
  isPass: boolean;
  enteredBy: string; // Faculty ID or Admin
  enteredAt: string;
}

export interface StudentResult {
  id: string;
  examId: string;
  studentId: string;
  studentName: string;
  enrollmentNo: string;
  programId: string;
  semesterId: string;
  totalMarksObtained: number;
  totalMaxMarks: number;
  sgpa: number;
  cgpa: number;
  status: 'PASS' | 'FAIL' | 'WITHHELD';
  publishedDate: string; // YYYY-MM-DD
  remarks?: string;
}

export type FeedbackType = 'FACULTY' | 'DEPARTMENT' | 'SUBJECT' | 'FACILITIES' | 'UNIVERSITY';

export interface StudentFeedback {
  id: string;
  studentId: string; // Kept internally for student edit rights, hidden from Faculty
  type: FeedbackType;
  academicYearId: string;
  departmentId: string;
  programId?: string;
  semesterId?: string;
  facultyId?: string;
  facultyName?: string;
  subjectId?: string;
  subjectName?: string;

  // Faculty Ratings (1-5 Stars)
  teachingQualityRating?: number;
  communicationRating?: number;
  subjectKnowledgeRating?: number;
  disciplineRating?: number;

  // Department / Facility Ratings (1-5 Stars)
  facilitiesRating?: number;
  administrationRating?: number;
  academicSupportRating?: number;

  overallRating: number;
  comments?: string;
  submittedAt: string; // YYYY-MM-DD
}

export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type TicketCategory = 'ACADEMIC' | 'ADMINISTRATIVE' | 'FEE_FINANCE' | 'EXAMINATION' | 'HOSTEL_FACILITIES' | 'OTHER';

export interface SupportTicketMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  message: string;
  fileUrl?: string;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  ticketNo: string;
  studentId: string;
  studentName: string;
  enrollmentNo: string;
  departmentId: string;
  assignedFacultyId?: string;
  assignedFacultyName?: string;
  category: TicketCategory;
  subject: string;
  priority: TicketPriority;
  status: TicketStatus;
  messages: SupportTicketMessage[];
  createdAt: string;
  updatedAt: string;
}

export type NotificationModule = 
  | 'NOTICE' 
  | 'TIMETABLE' 
  | 'ASSIGNMENT' 
  | 'MATERIAL' 
  | 'EXAM' 
  | 'FEES' 
  | 'REQUEST' 
  | 'APPROVAL' 
  | 'EVENT' 
  | 'SYSTEM';

export interface ERPNotification {
  id: string;
  title: string;
  message: string;
  module: NotificationModule;
  timestamp: string;
  createdAt: string;
  isReadByUsers: string[];
  targetRole?: UserRole | 'ALL';
  targetInstituteId?: string;
  targetDepartmentId?: string;
  targetProgramId?: string;
  targetSemesterId?: string;
  targetDivisionId?: string;
  targetUserId?: string;
  linkTab?: string;
}


