import { UserRole } from '../types';

// ============================================================================
// 1. IDENTITY & ACCESS (users, roles, permissions)
// ============================================================================

export interface FirestoreUser {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  employeeId?: string;
  studentId?: string;
  parentStudentIds?: string[];
  instituteId?: string;
  departmentId?: string;
  programId?: string;
  semesterId?: string;
  divisionId?: string;
  mentorId?: string;
  phone?: string;
  avatar?: string;
  designation?: string;
  customPermissions?: Record<string, Partial<FirestoreModulePermissionSet>>;
  active: boolean;
  status: 'ACTIVE' | 'DISABLED' | 'LOCKED' | 'SUSPENDED';
  lockReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FirestoreModulePermissionSet {
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canApprove: boolean;
  canReject: boolean;
  canExport: boolean;
  canImport: boolean;
  canPrint: boolean;
  canAssign: boolean;
  canTransfer: boolean;
  canVerify: boolean;
  canManage: boolean;
}

export interface FirestoreRole {
  roleId: UserRole;
  name: string;
  description: string;
  hierarchyLevel: number;
  isSystemRole: boolean;
  defaultPermissions: Record<string, FirestoreModulePermissionSet>;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// 2. MASTER ACADEMIC STRUCTURE
// ============================================================================

export interface FirestoreInstitute {
  id: string;
  code: string;
  name: string;
  universityId: string;
  type: string;
  establishedYear: number;
  principalName?: string;
  email?: string;
  phone?: string;
  location?: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface FirestoreDepartment {
  id: string;
  code: string;
  name: string;
  instituteId: string;
  instituteCode?: string;
  instituteName?: string;
  hodName?: string;
  hodEmail?: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface FirestoreProgram {
  id: string;
  code: string;
  name: string;
  shortName?: string;
  departmentId: string;
  instituteId: string;
  degreeType: 'BACHELOR' | 'MASTER' | 'DOCTORATE' | 'DIPLOMA';
  totalSemesters: number;
  durationYears: number;
  intakeCapacity: number;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface FirestoreAcademicYear {
  id: string;
  code: string;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  status: 'UPCOMING' | 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
}

export interface FirestoreSemester {
  id: string;
  programId: string;
  academicYearId: string;
  number: number;
  name: string;
  termType: 'ODD' | 'EVEN';
  startDate?: string;
  endDate?: string;
  status: 'ACTIVE' | 'UPCOMING' | 'COMPLETED';
}

export interface FirestoreDivision {
  id: string;
  semesterId: string;
  programId: string;
  departmentId: string;
  instituteId: string;
  academicYearId: string;
  name: string;
  capacity: number;
  classCounselorId?: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface FirestoreSubject {
  id: string;
  code: string;
  name: string;
  shortName?: string;
  departmentId: string;
  programId: string;
  semesterId: string;
  academicYearId: string;
  credits: number;
  lectureHours: number;
  labHours: number;
  tutorialHours: number;
  type: 'THEORY' | 'PRACTICAL' | 'ELECTIVE' | 'PROJECT';
  syllabusUrl?: string;
  status: 'ACTIVE' | 'INACTIVE';
}

// ============================================================================
// 3. MASTER PROFILES & RELATIONSHIPS (Students, Faculty, Assignments)
// ============================================================================

export interface FirestoreStudent {
  id: string;
  uid?: string;
  enrollmentNo: string;
  universityId: string;
  grNo: string;
  rollNo: string;
  name: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  phone: string;
  photo?: string;
  gender: 'Male' | 'Female' | 'Other';
  dob?: string;
  admissionDate: string;
  admissionYear: string;
  academicYearId: string;
  instituteId: string;
  instituteName?: string;
  departmentId: string;
  programId: string;
  programName?: string;
  semesterId: string;
  divisionId: string;
  mentorId?: string;
  mentorName?: string;
  guardianName?: string;
  guardianPhone?: string;
  guardianEmail?: string;
  parentUid?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  academicStanding: 'GOOD_STANDING' | 'ATTENDANCE_SHORTAGE' | 'ACADEMIC_RISK' | 'PROBATION';
  abcId?: string;
  abcIdStatus?: 'VERIFIED' | 'PENDING' | 'NOT_LINKED';
  academicLifecycleStatus: 'PURSUING' | 'GRADUATED' | 'DETAINED' | 'WITHDRAWN';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  createdAt: string;
  updatedAt: string;
}

export interface FirestoreFaculty {
  id: string;
  uid?: string;
  employeeId: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  designation: 'Professor' | 'Associate Professor' | 'Assistant Professor' | 'Lecturer' | 'Head of Department' | 'Dean';
  qualification?: string;
  experienceYears?: number;
  specialization?: string;
  instituteId: string;
  instituteName?: string;
  departmentId: string;
  departmentName?: string;
  isHOD?: boolean;
  isMentor?: boolean;
  status: 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE';
  createdAt: string;
  updatedAt: string;
}

export interface FirestoreFacultyAssignment {
  id: string;
  facultyId: string;
  facultyName: string;
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  divisionId: string;
  divisionName: string;
  departmentId: string;
  programId: string;
  academicYearId: string;
  semesterId: string;
  weeklyLectures: number;
  role: 'PRIMARY_FACULTY' | 'LAB_ASSISTANT' | 'VISITING_FACULTY';
  status: 'ACTIVE' | 'INACTIVE';
  assignedAt: string;
  assignedByUserId: string;
}

export interface FirestoreMentorAssignment {
  id: string;
  studentId: string;
  studentEnrollmentNo: string;
  studentName: string;
  mentorFacultyId: string;
  mentorEmployeeId: string;
  mentorName: string;
  mentorEmail?: string;
  mentorPhone?: string;
  mentorDepartmentId: string;
  assignedByUserId: string;
  assignedByName: string;
  assignedByRole: string;
  instituteId: string;
  departmentId: string;
  programId: string;
  academicYearId: string;
  semesterId?: string;
  section?: string;
  status: 'ACTIVE' | 'INACTIVE';
  changeReason?: string;
  assignedDate: string;
  effectiveFrom: string;
  effectiveTo?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// 4. TIMETABLE, TEACHING SESSIONS & ATTENDANCE
// ============================================================================

export interface FirestoreTimetableEntry {
  id: string;
  academicYearId: string;
  semesterId: string;
  departmentId: string;
  programId: string;
  divisionId: string;
  subjectId: string;
  facultyId: string;
  dayOfWeek: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY';
  lectureNumber: number;
  timeSlot: string;
  room: string;
  sessionType: 'LECTURE' | 'LAB' | 'TUTORIAL';
  status: 'ACTIVE' | 'CANCELLED';
}

export interface FirestoreTeachingSession {
  id: string;
  academicYearId: string;
  semesterId: string;
  departmentId: string;
  programId: string;
  divisionId: string;
  divisionName?: string;
  subjectId: string;
  subjectCode?: string;
  subjectName?: string;
  facultyId: string;
  facultyName: string;
  date: string; // YYYY-MM-DD
  lectureNumber: number;
  timeSlot: string;
  room: string;
  topicTaught: string;
  status: 'PENDING' | 'SUBMITTED' | 'UPCOMING' | 'CANCELLED';
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  submittedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FirestoreAttendanceRecord {
  id: string;
  sessionId: string;
  date: string;
  subjectId: string;
  subjectCode?: string;
  divisionId: string;
  facultyId: string;
  facultyName: string;
  studentId: string;
  studentName: string;
  enrollmentNo: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'ON_DUTY';
  remarks?: string;
  submittedBy: string;
  submittedAt: string;
}

export interface FirestoreAttendanceReport {
  id: string;
  studentId: string;
  enrollmentNo: string;
  studentName: string;
  departmentId: string;
  programId: string;
  semesterId: string;
  divisionId: string;
  academicYearId: string;
  subjectId?: string;
  totalConducted: number;
  totalPresent: number;
  totalAbsent: number;
  totalLate: number;
  percentage: number;
  standing: 'GOOD_STANDING' | 'SHORTAGE' | 'CRITICAL';
  lastCalculatedAt: string;
}

// ============================================================================
// 5. NOTICES, NOTIFICATIONS & EVENTS
// ============================================================================

export interface FirestoreNotice {
  id: string;
  title: string;
  content: string;
  category: 'ACADEMIC' | 'EXAMINATION' | 'ADMINISTRATIVE' | 'EVENT' | 'URGENT' | 'FEE';
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  targetAudience: 'ALL' | 'DEPARTMENT' | 'PROGRAM' | 'SEMESTER' | 'DIVISION' | 'FACULTY' | 'STUDENT' | 'PARENT' | 'HOD' | 'ADMIN';
  targetScope?: {
    instituteId?: string;
    departmentId?: string;
    programId?: string;
    semesterId?: string;
    divisionId?: string;
    roles?: UserRole[];
  };
  attachmentUrls?: string[];
  publishedByUserId: string;
  publishedByName: string;
  publishedByRole: string;
  publishedAt: string;
  expiresAt?: string;
  isPinned: boolean;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface FirestoreNotification {
  id: string;
  recipientUid: string;
  recipientRole?: UserRole;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ALERT' | 'ATTENDANCE' | 'APPROVAL' | 'TRANSFER';
  title: string;
  message: string;
  referenceType?: 'ATTENDANCE' | 'LEAVE' | 'WORK_TRANSFER' | 'NOTICE' | 'PTM' | 'EXAM' | 'FEE';
  referenceId?: string;
  actionUrl?: string;
  read: boolean;
  readAt?: string;
  createdAt: string;
}

export interface FirestoreEvent {
  id: string;
  title: string;
  description: string;
  eventType: 'ACADEMIC' | 'CULTURAL' | 'SPORTS' | 'WORKSHOP' | 'SEMINAR' | 'EXAM';
  startDate: string;
  endDate: string;
  venue: string;
  organizer: string;
  instituteId?: string;
  departmentId?: string;
  status: 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
}

// ============================================================================
// 6. FEEDBACK, COMPLAINTS & PTM
// ============================================================================

export interface FirestoreFeedback {
  id: string;
  studentId: string;
  facultyId: string;
  facultyName: string;
  subjectId: string;
  subjectName: string;
  academicYearId: string;
  semesterId: string;
  divisionId: string;
  ratings: Record<string, number>; // e.g. teachingClarity: 5, punctuality: 4
  overallScore: number;
  comments?: string;
  isAnonymous: boolean;
  submittedAt: string;
}

export interface FirestoreComplaint {
  id: string;
  ticketNo: string;
  requesterUid: string;
  requesterName: string;
  requesterRole: UserRole;
  category: 'ACADEMIC' | 'HOSTEL' | 'TRANSPORT' | 'MESS' | 'INFRASTRUCTURE' | 'GRIEVANCE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  subject: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'REJECTED';
  assignedToUid?: string;
  assignedToName?: string;
  resolutionRemarks?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface FirestorePTM {
  id: string;
  mentorFacultyId: string;
  mentorName: string;
  studentId: string;
  studentName: string;
  enrollmentNo: string;
  parentUid?: string;
  parentName: string;
  meetingDate: string;
  timeSlot: string;
  mode: 'ONLINE' | 'OFFLINE' | 'TELEPHONIC';
  academicRemarks: string;
  attendanceFeedback: string;
  actionItems: string;
  status: 'SCHEDULED' | 'CONDUCTED' | 'CANCELLED' | 'RESCHEDULED';
  conductedAt?: string;
  createdAt: string;
}

// ============================================================================
// 7. WORK TRANSFERS & AUDIT LOGS
// ============================================================================

export interface FirestoreWorkTransfer {
  id: string;
  transferId: string;
  fromUserId: string;
  fromUserName: string;
  fromUserRole: UserRole;
  toUserId: string;
  toUserName: string;
  toUserRole: UserRole;
  module: 'ATTENDANCE' | 'TIMETABLE' | 'EXAM_EVALUATION' | 'MENTORSHIP' | 'COMMITTEE' | 'PROJECT_GUIDE' | 'GENERAL';
  recordType: string;
  recordId: string;
  title: string;
  reason: string;
  startDate: string;
  endDate?: string;
  isTemporary: boolean;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'REVOKED' | 'COMPLETED';
  rejectionReason?: string;
  approvedByHOD?: boolean;
  hodApprovalUid?: string;
  hodApprovalAt?: string;
  createdAt: string;
  acceptedAt?: string;
  completedAt?: string;
  auditTrail: {
    action: string;
    performedByUid: string;
    performedByName: string;
    timestamp: string;
    notes?: string;
  }[];
}

export interface FirestoreAuditLog {
  id: string;
  actorUid: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  module: string;
  entity: string;
  recordId: string;
  details: string;
  status: 'SUCCESS' | 'FAILURE' | 'BLOCKED';
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  ipAddress?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

// ============================================================================
// 8. DOCUMENTS, EXAMS & RESULTS
// ============================================================================

export interface FirestoreDocument {
  id: string;
  studentId?: string;
  facultyId?: string;
  title: string;
  category: 'IDENTITY' | 'ACADEMIC' | 'CERTIFICATE' | 'BONAFIDE' | 'TRANSCRIPT' | 'FEE_RECEIPT';
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadedByUid: string;
  verifiedStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  verifiedByUid?: string;
  verifiedAt?: string;
  createdAt: string;
}

export interface FirestoreExamination {
  id: string;
  name: string;
  examType: 'MID_TERM' | 'SEMESTER_END' | 'REMEDIAL' | 'PRACTICAL';
  academicYearId: string;
  semesterId: string;
  startDate: string;
  endDate: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ONGOING' | 'EVALUATION' | 'CONCLUDED';
  createdAt: string;
}

export interface FirestoreResult {
  id: string;
  examId: string;
  studentId: string;
  enrollmentNo: string;
  studentName: string;
  programId: string;
  semesterId: string;
  academicYearId: string;
  subjectGrades: {
    subjectId: string;
    subjectCode: string;
    subjectName: string;
    credits: number;
    internalMarks: number;
    externalMarks: number;
    totalMarks: number;
    gradePoint: number;
    letterGrade: string;
    status: 'PASS' | 'FAIL' | 'ABSENT';
  }[];
  sgpa: number;
  cgpa: number;
  totalCreditsEarned: number;
  finalResultStatus: 'PASS' | 'ATKT' | 'FAIL' | 'WITHHELD';
  publishedAt: string;
}
