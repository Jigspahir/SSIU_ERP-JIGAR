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

export interface University {
  id: string;
  code: string;
  name: string;
  tagline?: string;
  establishedYear: number;
  chancellorName: string;
  viceChancellorName: string;
  registrarName: string;
  location: string;
  address: string;
  email: string;
  phone: string;
  website: string;
}

export interface Institute {
  id: string;
  code: string;
  name: string;
  universityId?: string;
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
  assignedFacultyId?: string;
  enrolledStudentIds?: string[];
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

export interface StudentAcademicHistoryRecord {
  id: string;
  academicYearId: string;
  academicYearName: string;
  semesterId: string;
  semesterNumber: number;
  batchId: string;
  divisionId: string;
  divisionName?: string;
  spi?: number;
  cpi?: number;
  attendancePercentage?: number;
  feeClearanceStatus?: 'CLEARED' | 'PENDING' | 'WAIVED';
  status: 'COMPLETED' | 'PROMOTED' | 'DETAINED';
  completedDate: string;
  remarks?: string;
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
  mentorId?: string;
  abcId?: string; // 12-digit Academic Bank of Credits ID e.g. "9842-1056-7890"
  abcIdStatus?: 'NOT_SUBMITTED' | 'PENDING_VERIFICATION' | 'VERIFIED' | 'REJECTED';
  abcIdDocUrl?: string;
  abcIdRemarks?: string;
  academicHistory?: StudentAcademicHistoryRecord[];
  academicLifecycleStatus?: 'ADMITTED' | 'PURSUING' | 'GRADUATED' | 'ALUMNI';
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

export interface InwardOutwardRecord {
  id: string;
  type: 'INWARD' | 'OUTWARD';
  dispatchNo: string;
  senderOrRecipient: string;
  subject: string;
  category: 'GOVT_DIRECTIVE' | 'UGC_AICTE' | 'AFFILIATION' | 'LEGAL' | 'GENERAL';
  mode: 'REGISTERED_POST' | 'SPEED_POST' | 'EMAIL' | 'HAND_DELIVERY' | 'COURIER';
  trackingNo?: string;
  assignedSection?: string;
  receivedOrDispatchedDate: string;
  status: 'PENDING' | 'PROCESSING' | 'DISPOSED';
  remarks?: string;
}

export interface RegistrarFileMovement {
  id: string;
  fileNo: string;
  fileTitle: string;
  initiatingSection: string;
  currentCustodian: string;
  movementDate: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'IN_MOVEMENT' | 'UNDER_REVIEW' | 'APPROVED' | 'ARCHIVED';
  remarks?: string;
}

// --- CENTRAL APPROVAL WORKFLOW TYPES ---

export type ApprovalOfficeType = 
  | 'REGISTRAR'
  | 'UNIVERSITY_ADMIN'
  | 'IQAC'
  | 'EXAM_CELL'
  | 'STUDENT_SECTION'
  | 'HOSTEL_ADMIN'
  | 'LIBRARY_ADMIN'
  | 'TRANSPORT_ADMIN'
  | 'MAINTENANCE_ADMIN'
  | 'HOD_ACADEMIC'
  | 'FINANCE_CELL';

export type ApprovalRequestCategory = 
  | 'BONAFIDE_CERTIFICATE'
  | 'TRANSCRIPT_DEGREE'
  | 'FEE_CONCESSION'
  | 'HOSTEL_NO_DUES'
  | 'RE_EVALUATION'
  | 'NO_OBJECTION_CERTIFICATE'
  | 'LEAVE_APPLICATION'
  | 'RESEARCH_GRANT'
  | 'EVENT_PERMISSION'
  | 'INFRASTRUCTURE_MAINTENANCE'
  | 'GENERAL_ADMINISTRATIVE';

export type ApprovalStatus = 
  | 'DRAFT'
  | 'SUBMITTED'
  | 'PENDING'
  | 'UNDER_REVIEW'
  | 'RETURNED'
  | 'APPROVED'
  | 'REJECTED'
  | 'CHANGES_REQUESTED'
  | 'FORWARDED'
  | 'WITHDRAWN'
  | 'LOCKED';

export type ApprovalPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface ApprovalAttachment {
  id: string;
  fileName: string;
  fileSize: string;
  fileType: string;
  fileUrl: string;
  uploadedAt: string;
}

export interface ApprovalRemarkHistory {
  id: string;
  actionByUserId: string;
  actionByUserName: string;
  actionByUserRole: UserRole;
  office: ApprovalOfficeType;
  action: ApprovalStatus | 'COMMENTED';
  remarks: string;
  timestamp: string;
}

export interface ApprovalRequest {
  id: string;
  requestNo: string;
  applicantId: string;
  applicantName: string;
  applicantRole: UserRole;
  applicantEmail: string;
  applicantPhone?: string;
  applicantEnrollmentOrEmpId?: string;
  departmentId?: string;
  instituteId?: string;
  
  category: ApprovalRequestCategory;
  title: string;
  description: string;
  priority: ApprovalPriority;
  
  targetOffice: ApprovalOfficeType;
  currentOffice: ApprovalOfficeType;
  
  status: ApprovalStatus;
  deadlineDate: string;
  
  attachments: ApprovalAttachment[];
  remarksHistory: ApprovalRemarkHistory[];
  
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

// --- EDP DUTY MANAGEMENT MODULE TYPES ---

export type EdpDutyRole = 
  | 'EVENT_COORDINATOR'
  | 'VENUE_INCHARGE'
  | 'DISCIPLINE_OFFICER'
  | 'TECHNICAL_LEAD'
  | 'REGISTRATION_DESK'
  | 'STAGE_MANAGER'
  | 'VIP_HOSPITALITY'
  | 'CHIEF_GUEST_ESCORT'
  | 'GENERAL_DUTY';

export type EdpDutyStatus = 
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'VERIFIED'
  | 'EXCUSED'
  | 'ABSENT';

export interface EdpDutyEvidence {
  id: string;
  photoUrl: string;
  latitude: number;
  longitude: number;
  locationAddress: string;
  capturedAt: string;
  deviceInfo?: string;
  remarks?: string;
}

export interface EdpDuty {
  id: string;
  dutyCode: string; // e.g. "EDP-2024-001"
  eventName: string;
  eventType: 'CONVOCATION' | 'SEMINAR' | 'EXAM_INVIGILATION' | 'WORKSHOP' | 'CULTURAL_FEST' | 'SPORTS_MEET' | 'NAAC_AUDIT';
  dutyRole: EdpDutyRole;
  
  assignedUserId: string;
  assignedUserName: string;
  assignedUserRole: UserRole;
  assignedUserDesignation?: string;
  
  instituteId: string;
  departmentId: string;
  
  dutyDate: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  venue: string;
  responsibilityDetails: string;
  
  status: EdpDutyStatus;
  reportsNotes?: string;
  evidenceList: EdpDutyEvidence[];
  
  verifiedByAdminId?: string;
  verifiedByAdminName?: string;
  verifiedAt?: string;
  verificationRemarks?: string;
  
  createdAt: string;
  updatedAt: string;
}

// ─── NAAC & IQAC FRAMEWORK TYPES ───────────────────────────────────────────

export interface NaacCriterion {
  id: string;
  code: string; // e.g. "C1", "C2" ... "C7"
  number: number; // 1 to 7
  title: string;
  description: string;
  weightage: number;
  keyIndicatorsCount: number;
}

export interface NaacKeyIndicator {
  id: string;
  criterionId: string;
  code: string; // e.g. "1.1", "2.4"
  title: string;
  weightage: number;
}

export type NaacMetricType = 'QnM' | 'QlM'; // QnM = Quantitative Metric, QlM = Qualitative Metric

export interface NaacMetric {
  id: string;
  keyIndicatorId: string;
  criterionId: string;
  code: string; // e.g. "1.1.1", "2.4.2"
  title: string;
  type: NaacMetricType;
  weightage: number;
  formulaDescription?: string;
  autoErpSource?: 'STUDENTS_COUNT' | 'FACULTY_COUNT' | 'FACULTY_PHD_COUNT' | 'PASS_PERCENTAGE' | 'RESEARCH_PAPERS' | 'EDP_DUTIES' | 'FEEDBACK_RATING';
  requiredEvidence: string[];
}

export interface NaacDataSubmission {
  id: string;
  metricId: string;
  metricCode: string;
  criterionId: string;
  departmentId?: string;
  instituteId?: string;
  academicYearId: string;
  
  // Data values
  quantitativeValue?: number;
  qualitativeText?: string;
  dataFields?: Record<string, any>;
  
  // Evidence
  evidenceUrls: string[];
  geoTaggedPhotoUrls?: string[];
  websiteLinks?: string[];
  
  // Multi-Stage Approval Workflow: Dept -> HOD -> IQAC -> Registrar -> Locked
  status: ApprovalStatus;
  currentApproverRole: UserRole;
  submittedByUserId: string;
  submittedByUserName: string;
  submittedAt: string;
  
  remarksHistory: ApprovalRemarkHistory[];
  updatedAt: string;
  lockedAt?: string;
}

// ─── RESEARCH & INNOVATION TYPES ──────────────────────────────────────────

export interface ResearchProject {
  id: string;
  projectCode: string;
  title: string;
  principalInvestigatorId: string;
  principalInvestigatorName: string;
  departmentId: string;
  instituteId: string;
  fundingAgency: string; // e.g. GUJCOST, DST, SERB, UGC, Industry Sponsored
  sanctionedAmount: number;
  sanctionYear: number;
  durationYears: number;
  status: 'PROPOSED' | 'SANCTIONED' | 'ONGOING' | 'COMPLETED';
}

export interface PublicationRecord {
  id: string;
  title: string;
  authors: string;
  facultyId: string;
  departmentId: string;
  journalOrConferenceName: string;
  indexing: 'Scopus' | 'Web of Science' | 'UGC CARE' | 'IEEE' | 'Other';
  issnIsbn?: string;
  publicationYear: number;
  doiUrl?: string;
}

export interface PatentRecord {
  id: string;
  applicationNo: string;
  title: string;
  inventors: string;
  facultyId: string;
  departmentId: string;
  status: 'FILED' | 'PUBLISHED' | 'GRANTED';
  filedDate: string;
  grantedDate?: string;
}

// ─── HR MANAGEMENT MODULE TYPES ──────────────────────────────────────────

export type EmployeeType = 'FACULTY' | 'ADMIN_STAFF' | 'TECHNICAL_STAFF' | 'SUPPORT_STAFF';
export type EmployeeStatus = 'ACTIVE' | 'ON_LEAVE' | 'PROBATION' | 'RESIGNED' | 'RELIEVED';
export type LeaveType = 'CASUAL' | 'MEDICAL' | 'EARNED' | 'DUTY_LEAVE' | 'MATERNITY';

export interface Employee {
  id: string;
  employeeId: string; // e.g. "EMP-2024-001"
  name: string;
  email: string;
  phone: string;
  designation: string;
  employeeType: EmployeeType;
  instituteId: string;
  departmentId: string;
  joiningDate: string;
  salary: number; // monthly gross pay
  bankAccountNo: string;
  panNo: string;
  aadhaarNo: string;
  qualification: string;
  experienceYears: number;
  status: EmployeeStatus;
}

export interface PayrollRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  month: string; // e.g. "August 2026"
  year: number;
  basicPay: number;
  hra: number;
  da: number;
  specialAllowance: number;
  grossSalary: number;
  pfDeduction: number;
  taxDeduction: number;
  netSalary: number;
  status: 'DRAFT' | 'APPROVED' | 'PAID';
  paidDate?: string;
}

export interface EmployeeLeaveApplication {
  id: string;
  employeeId: string;
  employeeName: string;
  departmentId: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: ApprovalStatus;
  approvedByUserId?: string;
  approvedByUserName?: string;
  appliedDate: string;
}

export interface PerformanceAppraisal {
  id: string;
  employeeId: string;
  employeeName: string;
  academicYearId: string;
  teachingRating: number; // out of 5.0
  researchRating: number; // out of 5.0
  administrativeRating: number; // out of 5.0
  overallScore: number; // out of 5.0
  feedback: string;
  status: 'DRAFT' | 'SUBMITTED' | 'REVIEWED' | 'APPROVED';
}

export interface TrainingFdpRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  title: string;
  organizer: string;
  startDate: string;
  endDate: string;
  certificateUrl?: string;
  status: 'ATTENDED' | 'COMPLETED' | 'VERIFIED';
}

// ─── INCUBATION & STARTUP MANAGEMENT MODULE TYPES ────────────────────────────

export type StartupStage =
  | 'IDEA'
  | 'VALIDATION'
  | 'PROTOTYPE'
  | 'MVP'
  | 'EARLY_REVENUE'
  | 'GROWTH'
  | 'SCALING'
  | 'GRADUATED'
  | 'ALUMNI';

export type StartupSector =
  | 'EDTECH'
  | 'HEALTHTECH'
  | 'AGRITECH'
  | 'FINTECH'
  | 'CLEAN_ENERGY'
  | 'MANUFACTURING'
  | 'IOT_ROBOTICS'
  | 'AI_ML'
  | 'SOCIAL_IMPACT'
  | 'OTHER';

export type IncubationApplicationStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_SCREENING'
  | 'SCREENED'
  | 'COMMITTEE_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'INCUBATING'
  | 'GRADUATED'
  | 'WITHDRAWN';

export type FundingType =
  | 'SSIP_GOVT'
  | 'DST_NIDHI'
  | 'MSME_SCHEME'
  | 'ANGEL_INVESTMENT'
  | 'SEED_FUND'
  | 'VENTURE_CAPITAL'
  | 'GRANT'
  | 'BOOTSTRAP';

export interface StartupFounder {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'STUDENT' | 'FACULTY' | 'EXTERNAL';
  studentId?: string;
  facultyId?: string;
  programId?: string;
  departmentId?: string;
  instituteId?: string;
  designation?: string; // For faculty/external founders
}

export interface StartupIdea {
  id: string;
  ideaCode: string; // e.g. "IDEA-2024-001"
  title: string;
  description: string;
  problemStatement: string;
  proposedSolution: string;
  targetMarket: string;
  sector: StartupSector;
  stage: StartupStage;
  founderIds: string[];
  leadFounderId: string;
  instituteId: string;
  departmentId: string;
  registeredDate: string;
  status: IncubationApplicationStatus;
  applicationStatus: IncubationApplicationStatus;
  screeningScore?: number;
  screeningRemarks?: string;
  committeeRemarks?: string;
  approvedByUserId?: string;
  approvedDate?: string;
  rejectionReason?: string;
  mentorId?: string;
  mentorName?: string;
  patentApplicationNo?: string;
  patentStatus?: 'NONE' | 'FILED' | 'PUBLISHED' | 'GRANTED';
  hasPrototype: boolean;
  hasProduct: boolean;
  fundingReceived: number;
  totalInvestment: number;
  annualRevenue: number;
  employeesCount: number;
  investorNames?: string;
  awards?: string;
  milestones: StartupMilestone[];
  documents: StartupDocument[];
  createdAt: string;
  updatedAt: string;
}

export interface StartupMilestone {
  id: string;
  startupId: string;
  title: string;
  description: string;
  targetDate: string;
  completedDate?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';
  evidenceUrl?: string;
}

export interface StartupDocument {
  id: string;
  startupId: string;
  name: string;
  type: 'PITCH_DECK' | 'BUSINESS_PLAN' | 'PROTOTYPE_VIDEO' | 'IPR_CERT' | 'FUNDING_LETTER' | 'REGISTRATION_CERT' | 'OTHER';
  uploadedDate: string;
  fileUrl?: string;
  verified: boolean;
}

export interface StartupFunding {
  id: string;
  startupId: string;
  startupName: string;
  fundingType: FundingType;
  amount: number;
  currency: 'INR' | 'USD';
  source: string;
  receivedDate: string;
  status: 'APPLIED' | 'UNDER_REVIEW' | 'APPROVED' | 'DISBURSED' | 'REJECTED';
  utilizationReport?: string;
}

export interface IncubationMentorSession {
  id: string;
  startupId: string;
  startupName: string;
  mentorId: string;
  mentorName: string;
  sessionDate: string;
  duration: number; // minutes
  agenda: string;
  notes: string;
  nextSteps: string;
  rating?: number; // 1-5 by founder
}

export interface IncubationWorkshop {
  id: string;
  title: string;
  description: string;
  date: string;
  venue: string;
  conductedBy: string;
  topic: string;
  registeredStartupIds: string[];
  status: 'UPCOMING' | 'COMPLETED';
}

