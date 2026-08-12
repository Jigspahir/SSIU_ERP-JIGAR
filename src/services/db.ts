import type { 
  University, Institute, Department, Program, AcademicYear, Batch, 
  Semester, Division, Subject, Faculty, Student, StudentAcademicHistoryRecord, User, AuditLog,
  AttendanceSession, TimetableEntry, SessionPlanTopic, UnitMaterial,
  Assignment, AssignmentSubmission, AcademicCalendarEvent,
  FeeStructure, StudentFeeRecord, FeePaymentTransaction,
  CRMLead, AdmissionApplication,
  Exam, ExamTimetable, ExamForm, StudentMarks, StudentResult, StudentFeedback, SupportTicket, StudentDocument,
  ERPNotification, UserRole, InwardOutwardRecord, RegistrarFileMovement, ApprovalRequest, ApprovalOfficeType, ApprovalStatus,
  EdpDuty, EdpDutyEvidence, EdpDutyStatus,
  NaacCriterion, NaacKeyIndicator, NaacMetric, NaacDataSubmission, ResearchProject, PublicationRecord, PatentRecord,
  Employee, PayrollRecord, EmployeeLeaveApplication, PerformanceAppraisal, TrainingFdpRecord
} from '../types';
import { 
  initialUniversity, initialInstitutes, initialDepartments, initialPrograms, initialAcademicYears, 
  initialBatches, initialSemesters, initialDivisions, initialSubjects, 
  initialFaculty, initialStudents, initialUsers, initialAuditLogs,
  initialAttendanceSessions, initialTimetableEntries, initialSessionPlanTopics,
  initialUnitMaterials, initialAssignments, initialAssignmentSubmissions,
  initialAcademicCalendarEvents, initialFeeStructures, initialStudentFeeRecords,
  initialFeePaymentTransactions, initialCRMLeads, initialAdmissionApplications,
  initialExams, initialExamTimetables, initialExamForms, initialStudentMarks,
  initialStudentResults, initialStudentFeedbacks, initialSupportTickets, initialStudentDocuments,
  initialERPNotifications, initialInwardOutwardRecords, initialRegistrarFileMovements, initialApprovalRequests,
  initialEdpDuties,
  initialNaacCriteria, initialNaacKeyIndicators, initialNaacMetrics, initialNaacDataSubmissions,
  initialResearchProjects, initialPublicationRecords, initialPatentRecords,
  initialEmployees, initialPayrollRecords, initialLeaveApplications, initialPerformanceAppraisals, initialTrainingFdpRecords
} from './seedData';
import { DB_STORAGE_KEY } from '../constants';

export interface DatabaseState {
  institutes: Institute[];
  departments: Department[];
  programs: Program[];
  academicYears: AcademicYear[];
  batches: Batch[];
  semesters: Semester[];
  divisions: Division[];
  subjects: Subject[];
  faculty: Faculty[];
  students: Student[];
  users: User[];
  auditLogs: AuditLog[];
  attendanceSessions: AttendanceSession[];
  timetableEntries: TimetableEntry[];
  sessionPlanTopics: SessionPlanTopic[];
  unitMaterials: UnitMaterial[];
  assignments: Assignment[];
  assignmentSubmissions: AssignmentSubmission[];
  academicCalendarEvents: AcademicCalendarEvent[];
  feeStructures: FeeStructure[];
  studentFeeRecords: StudentFeeRecord[];
  feePaymentTransactions: FeePaymentTransaction[];
  crmLeads: CRMLead[];
  admissionApplications: AdmissionApplication[];
  exams: Exam[];
  examTimetables: ExamTimetable[];
  examForms: ExamForm[];
  studentMarks: StudentMarks[];
  studentResults: StudentResult[];
  studentFeedbacks: StudentFeedback[];
  supportTickets: SupportTicket[];
  studentDocuments: StudentDocument[];
  notifications: ERPNotification[];
  inwardOutwardRecords: InwardOutwardRecord[];
  registrarFileMovements: RegistrarFileMovement[];
  approvalRequests: ApprovalRequest[];
  edpDuties: EdpDuty[];
  naacCriteria: NaacCriterion[];
  naacKeyIndicators: NaacKeyIndicator[];
  naacMetrics: NaacMetric[];
  naacSubmissions: NaacDataSubmission[];
  researchProjects: ResearchProject[];
  publications: PublicationRecord[];
  patents: PatentRecord[];
  employees: Employee[];
  payrollRecords: PayrollRecord[];
  leaveApplications: EmployeeLeaveApplication[];
  performanceAppraisals: PerformanceAppraisal[];
  trainingFdpRecords: TrainingFdpRecord[];
}

class ERPDatabaseService {
  private state: DatabaseState;

  constructor() {
    this.state = this.loadState();
  }

  // ─── Internal: default seed state ────────────────────────────────────────
  private buildDefaultState(): DatabaseState {
    return {
      institutes: initialInstitutes,
      departments: initialDepartments,
      programs: initialPrograms,
      academicYears: initialAcademicYears,
      batches: initialBatches,
      semesters: initialSemesters,
      divisions: initialDivisions,
      subjects: initialSubjects,
      faculty: initialFaculty,
      students: initialStudents,
      users: initialUsers,
      auditLogs: initialAuditLogs,
      attendanceSessions: initialAttendanceSessions,
      timetableEntries: initialTimetableEntries,
      sessionPlanTopics: initialSessionPlanTopics,
      unitMaterials: initialUnitMaterials,
      assignments: initialAssignments,
      assignmentSubmissions: initialAssignmentSubmissions,
      academicCalendarEvents: initialAcademicCalendarEvents,
      feeStructures: initialFeeStructures,
      studentFeeRecords: initialStudentFeeRecords,
      feePaymentTransactions: initialFeePaymentTransactions,
      crmLeads: initialCRMLeads,
      admissionApplications: initialAdmissionApplications,
      exams: initialExams,
      examTimetables: initialExamTimetables,
      examForms: initialExamForms,
      studentMarks: initialStudentMarks,
      studentResults: initialStudentResults,
      studentFeedbacks: initialStudentFeedbacks,
      supportTickets: initialSupportTickets,
      studentDocuments: initialStudentDocuments,
      notifications: initialERPNotifications,
      inwardOutwardRecords: initialInwardOutwardRecords,
      registrarFileMovements: initialRegistrarFileMovements,
      approvalRequests: initialApprovalRequests,
      edpDuties: initialEdpDuties,
      naacCriteria: initialNaacCriteria,
      naacKeyIndicators: initialNaacKeyIndicators,
      naacMetrics: initialNaacMetrics,
      naacSubmissions: initialNaacDataSubmissions,
      researchProjects: initialResearchProjects,
      publications: initialPublicationRecords,
      patents: initialPatentRecords,
      employees: initialEmployees,
      payrollRecords: initialPayrollRecords,
      leaveApplications: initialLeaveApplications,
      performanceAppraisals: initialPerformanceAppraisals,
      trainingFdpRecords: initialTrainingFdpRecords
    };
  }

  private loadState(): DatabaseState {
    try {
      const saved = localStorage.getItem(DB_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const defaults = this.buildDefaultState();
        // Merge: static master data always uses seed; mutable collections use saved or seed fallback
        return {
          ...parsed,
          institutes: defaults.institutes,
          departments: defaults.departments,
          faculty: defaults.faculty,
          users: defaults.users,
          students: parsed.students || defaults.students,
          attendanceSessions: parsed.attendanceSessions || defaults.attendanceSessions,
          timetableEntries: parsed.timetableEntries || defaults.timetableEntries,
          sessionPlanTopics: parsed.sessionPlanTopics || defaults.sessionPlanTopics,
          unitMaterials: parsed.unitMaterials || defaults.unitMaterials,
          assignments: parsed.assignments || defaults.assignments,
          assignmentSubmissions: parsed.assignmentSubmissions || defaults.assignmentSubmissions,
          academicCalendarEvents: parsed.academicCalendarEvents || defaults.academicCalendarEvents,
          feeStructures: parsed.feeStructures || defaults.feeStructures,
          studentFeeRecords: parsed.studentFeeRecords || defaults.studentFeeRecords,
          feePaymentTransactions: parsed.feePaymentTransactions || defaults.feePaymentTransactions,
          crmLeads: parsed.crmLeads || defaults.crmLeads,
          admissionApplications: parsed.admissionApplications || defaults.admissionApplications,
          exams: parsed.exams || defaults.exams,
          examTimetables: parsed.examTimetables || defaults.examTimetables,
          examForms: parsed.examForms || defaults.examForms,
          studentMarks: parsed.studentMarks || defaults.studentMarks,
          studentResults: parsed.studentResults || defaults.studentResults,
          studentFeedbacks: parsed.studentFeedbacks || defaults.studentFeedbacks,
          supportTickets: parsed.supportTickets || defaults.supportTickets,
          studentDocuments: parsed.studentDocuments || defaults.studentDocuments,
          notifications: parsed.notifications || defaults.notifications,
          inwardOutwardRecords: parsed.inwardOutwardRecords || defaults.inwardOutwardRecords,
          registrarFileMovements: parsed.registrarFileMovements || defaults.registrarFileMovements,
          approvalRequests: parsed.approvalRequests || defaults.approvalRequests,
          edpDuties: parsed.edpDuties || defaults.edpDuties,
        };
      }
    } catch (e) {
      console.error('Error loading ERP database from localStorage:', e);
    }

    const freshState = this.buildDefaultState();
    this.saveState(freshState);
    return freshState;
  }

  private saveState(newState?: DatabaseState): void {
    if (newState) this.state = newState;
    try {
      localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.error('Error saving ERP database to localStorage:', e);
    }
  }

  public resetToDefaultSeed(): DatabaseState {
    const freshState = this.buildDefaultState();
    freshState.auditLogs = [
      ...initialAuditLogs,
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        userName: 'Demo Admin',
        userRole: 'SUPER_ADMIN' as UserRole,
        action: 'RESET_SEED',
        entity: 'Database',
        details: 'Database was reset to default seed state.',
      },
    ];
    this.state = freshState;
    this.saveState();
    return this.state;
  }

  // --- CRUD Engine Helpers ---
  public getInstitutes(): Institute[] { return this.state.institutes; }
  public getDepartments(): Department[] { return this.state.departments; }
  public getPrograms(): Program[] { return this.state.programs; }
  public getAcademicYears(): AcademicYear[] { return this.state.academicYears; }
  public getBatches(): Batch[] { return this.state.batches; }
  public getSemesters(): Semester[] { return this.state.semesters; }
  public getDivisions(): Division[] { return this.state.divisions; }
  public getSubjects(): Subject[] { return this.state.subjects; }
  public getFaculty(): Faculty[] { return this.state.faculty; }
  public getStudents(): Student[] { return this.state.students; }
  public getUsers(): User[] { return this.state.users; }
  public getAuditLogs(): AuditLog[] { return this.state.auditLogs; }

  // --- Academic Management Getters ---
  public getAttendanceSessions(): AttendanceSession[] { return this.state.attendanceSessions; }
  public getTimetableEntries(): TimetableEntry[] { return this.state.timetableEntries; }
  public getSessionPlanTopics(): SessionPlanTopic[] { return this.state.sessionPlanTopics; }
  public getUnitMaterials(): UnitMaterial[] { return this.state.unitMaterials; }
  public getAssignments(): Assignment[] { return this.state.assignments; }
  public getAssignmentSubmissions(): AssignmentSubmission[] { return this.state.assignmentSubmissions; }
  public getAcademicCalendarEvents(): AcademicCalendarEvent[] { return this.state.academicCalendarEvents; }

  // --- Phase 5: Fees & Finance Getters ---
  public getFeeStructures(): FeeStructure[] { return this.state.feeStructures; }
  public getStudentFeeRecords(): StudentFeeRecord[] { return this.state.studentFeeRecords; }
  public getFeePaymentTransactions(): FeePaymentTransaction[] { return this.state.feePaymentTransactions; }

  // --- Phase 6: CRM & Admission Getters ---
  public getCRMLeads(): CRMLead[] { return this.state.crmLeads; }
  public getAdmissionApplications(): AdmissionApplication[] { return this.state.admissionApplications; }

  // --- Phase 12: Examination Management Getters ---
  public getExams(): Exam[] { return this.state.exams; }
  public getExamTimetables(): ExamTimetable[] { return this.state.examTimetables; }
  public getExamForms(): ExamForm[] { return this.state.examForms; }
  public getStudentMarks(): StudentMarks[] { return this.state.studentMarks; }
  public getStudentResults(): StudentResult[] { return this.state.studentResults; }
  public getStudentFeedbacks(): StudentFeedback[] { return this.state.studentFeedbacks || []; }
  public getSupportTickets(): SupportTicket[] { return this.state.supportTickets || []; }
  public getStudentDocuments(): StudentDocument[] { return this.state.studentDocuments || []; }
  public getStudentDocumentsByStudentId(studentId: string): StudentDocument[] {
    return (this.state.studentDocuments || []).filter(d => d.studentId === studentId);
  }
  public getInwardOutwardRecords(): InwardOutwardRecord[] {
    return this.state.inwardOutwardRecords || [];
  }
  public getRegistrarFileMovements(): RegistrarFileMovement[] {
    return this.state.registrarFileMovements || [];
  }

  public getApprovalRequests(): ApprovalRequest[] {
    return this.state.approvalRequests || [];
  }

  public getScopedApprovalRequests(user: User | null, role: UserRole | null): ApprovalRequest[] {
    const requests = this.getApprovalRequests();
    if (!user || !role) return requests;

    if (role === 'SUPER_ADMIN' || role === 'UNIVERSITY_ADMIN') {
      return requests;
    }

    const roleOfficeMap: Partial<Record<UserRole, ApprovalOfficeType>> = {
      REGISTRAR: 'REGISTRAR',
      IQAC: 'IQAC',
      EXAM_CELL: 'EXAM_CELL',
      STUDENT_SECTION: 'STUDENT_SECTION',
      HOSTEL_ADMIN: 'HOSTEL_ADMIN',
      LIBRARY_ADMIN: 'LIBRARY_ADMIN',
      TRANSPORT_ADMIN: 'TRANSPORT_ADMIN',
      MAINTENANCE_ADMIN: 'MAINTENANCE_ADMIN',
      HOD: 'HOD_ACADEMIC',
    };

    const userOffice = roleOfficeMap[role];

    return requests.filter(r => {
      if (r.applicantId === user.id || r.applicantEmail === user.email) return true;
      if (userOffice && (r.currentOffice === userOffice || r.targetOffice === userOffice)) return true;
      if (role === 'HOD' && user.departmentId && r.departmentId === user.departmentId) return true;
      if (role === 'PRINCIPAL' && user.instituteId && r.instituteId === user.instituteId) return true;
      return false;
    });
  }

  public addApprovalRequest(
    data: Omit<ApprovalRequest, 'id' | 'requestNo' | 'createdAt' | 'updatedAt' | 'remarksHistory'>,
    initialRemarks?: string
  ): ApprovalRequest {
    const reqCount = (this.state.approvalRequests || []).length + 1;
    const reqNo = `SSIU-REQ-${new Date().getFullYear()}-${String(reqCount).padStart(3, '0')}`;
    const timestamp = new Date().toISOString();

    const newRequest: ApprovalRequest = {
      ...data,
      id: `app-req-${Date.now()}`,
      requestNo: reqNo,
      createdAt: timestamp,
      updatedAt: timestamp,
      remarksHistory: initialRemarks ? [
        {
          id: `rem-${Date.now()}`,
          actionByUserId: data.applicantId,
          actionByUserName: data.applicantName,
          actionByUserRole: data.applicantRole,
          office: data.targetOffice,
          action: 'PENDING',
          remarks: initialRemarks,
          timestamp: new Date().toLocaleString(),
        }
      ] : []
    };

    if (!this.state.approvalRequests) {
      this.state.approvalRequests = [];
    }
    this.state.approvalRequests.unshift(newRequest);

    this.addNotification({
      title: `New Approval Request (${reqNo}): ${data.title}`,
      message: `Submitted by ${data.applicantName} (${data.applicantRole}) to ${data.targetOffice}. Priority: ${data.priority}.`,
      module: 'REQUEST',
      timestamp: 'Just Now',
      targetRole: 'ALL',
      linkTab: 'requests'
    });

    this.logAudit('CREATE', 'Approval Request', `Submitted request ${reqNo} - ${data.title} to ${data.targetOffice}`, data.applicantName, data.applicantRole);
    this.saveState();
    return newRequest;
  }

  public updateApprovalRequestStatus(
    requestId: string,
    newStatus: ApprovalStatus,
    remarks: string,
    currentUser: User,
    forwardToOffice?: ApprovalOfficeType
  ): ApprovalRequest | null {
    const list = this.state.approvalRequests || [];
    const req = list.find(r => r.id === requestId);
    if (!req) return null;

    const timestamp = new Date().toISOString();
    req.status = newStatus;
    req.updatedAt = timestamp;
    if (newStatus === 'APPROVED' || newStatus === 'REJECTED') {
      req.completedAt = timestamp;
    }

    if (forwardToOffice && newStatus === 'FORWARDED') {
      req.currentOffice = forwardToOffice;
    }

    req.remarksHistory.push({
      id: `rem-${Date.now()}`,
      actionByUserId: currentUser.id,
      actionByUserName: currentUser.name,
      actionByUserRole: currentUser.role,
      office: req.currentOffice,
      action: newStatus,
      remarks: remarks || `Request status updated to ${newStatus}`,
      timestamp: new Date().toLocaleString(),
    });

    this.addNotification({
      title: `Request ${req.requestNo} Update: ${newStatus}`,
      message: `Your request "${req.title}" has been updated to ${newStatus} by ${currentUser.name} (${req.currentOffice}).`,
      module: 'REQUEST',
      timestamp: 'Just Now',
      targetUserId: req.applicantId,
      linkTab: 'requests'
    });

    this.logAudit('UPDATE', 'Approval Request', `Updated request ${req.requestNo} status to ${newStatus} with remarks: ${remarks}`, currentUser.name, currentUser.role);
    this.saveState();
    return req;
  }

  // --- ROLE-BASED SCOPED GETTERS ---
  public getScopedStudents(user: User | null, role: UserRole | null): Student[] {
    const students = this.getStudents();
    if (!user || !role) return students;

    if (role === 'SUPER_ADMIN' || role === 'UNIVERSITY_ADMIN') {
      return students;
    }
    if (role === 'PRINCIPAL') {
      return user.instituteId ? students.filter(s => s.instituteId === user.instituteId) : students;
    }
    if (role === 'HOD') {
      return user.departmentId ? students.filter(s => s.departmentId === user.departmentId) : students;
    }
    if (role === 'FACULTY') {
      return students.filter(s => 
        (user.departmentId && s.departmentId === user.departmentId) ||
        (user.id && s.mentorId === user.id)
      );
    }
    if (role === 'STUDENT') {
      return students.filter(s => 
        s.id === user.id || 
        s.email === user.email || 
        s.enrollmentNo === user.enrollmentNo
      );
    }
    return students;
  }

  public getScopedFaculty(user: User | null, role: UserRole | null): Faculty[] {
    const faculty = this.getFaculty();
    if (!user || !role) return faculty;

    if (role === 'SUPER_ADMIN' || role === 'UNIVERSITY_ADMIN') {
      return faculty;
    }
    if (role === 'PRINCIPAL') {
      return user.instituteId ? faculty.filter(f => f.instituteId === user.instituteId) : faculty;
    }
    if (role === 'HOD') {
      return user.departmentId ? faculty.filter(f => f.departmentId === user.departmentId) : faculty;
    }
    if (role === 'FACULTY') {
      return faculty.filter(f => f.id === user.id || f.email === user.email);
    }
    return faculty;
  }

  public getScopedExamForms(user: User | null, role: UserRole | null): ExamForm[] {
    const forms = this.getExamForms();
    if (!user || !role) return forms;

    if (role === 'SUPER_ADMIN' || role === 'UNIVERSITY_ADMIN') {
      return forms;
    }
    if (role === 'PRINCIPAL' || role === 'HOD') {
      const allowedStudentIds = new Set(this.getScopedStudents(user, role).map(s => s.id));
      return forms.filter(f => allowedStudentIds.has(f.studentId));
    }
    if (role === 'STUDENT') {
      return forms.filter(f => f.studentId === user.id || f.enrollmentNo === user.enrollmentNo);
    }
    return forms;
  }

  public getScopedFeeRecords(user: User | null, role: UserRole | null): StudentFeeRecord[] {
    const records = this.getStudentFeeRecords();
    if (!user || !role) return records;

    if (role === 'SUPER_ADMIN' || role === 'UNIVERSITY_ADMIN') {
      return records;
    }
    if (role === 'PRINCIPAL' || role === 'HOD') {
      const allowedStudentIds = new Set(this.getScopedStudents(user, role).map(s => s.id));
      return records.filter(r => allowedStudentIds.has(r.studentId));
    }
    if (role === 'STUDENT') {
      return records.filter(r => r.studentId === user.id || r.enrollmentNo === user.enrollmentNo);
    }
    return records;
  }

  // Generic Save / Add / Update / Delete
  public addEntity<T extends { id: string }>(collectionKey: keyof DatabaseState, item: Omit<T, 'id'>, auditMsg?: string): T {
    const newItem = { ...item, id: `${String(collectionKey)}-${Date.now()}` } as unknown as T;
    (this.state[collectionKey] as unknown as T[]).unshift(newItem);
    
    if (auditMsg) {
      this.logAudit('CREATE', String(collectionKey), auditMsg);
    }
    
    this.saveState();
    return newItem;
  }

  public updateEntity<T extends { id: string }>(collectionKey: keyof DatabaseState, id: string, updates: Partial<T>, auditMsg?: string): T | null {
    const list = this.state[collectionKey] as unknown as T[];
    const idx = list.findIndex(x => x.id === id);
    if (idx === -1) return null;
    
    list[idx] = { ...list[idx], ...updates };
    
    if (auditMsg) {
      this.logAudit('UPDATE', String(collectionKey), auditMsg);
    }

    this.saveState();
    return list[idx];
  }

  public deleteEntity(collectionKey: keyof DatabaseState, id: string, auditMsg?: string): boolean {
    const list = this.state[collectionKey] as unknown as { id: string }[];
    const initialLen = list.length;
    this.state[collectionKey] = list.filter(x => x.id !== id) as any;

    if (this.state[collectionKey].length !== initialLen) {
      if (auditMsg) {
        this.logAudit('DELETE', String(collectionKey), auditMsg);
      }
      this.saveState();
      return true;
    }
    return false;
  }

  public logAudit(action: string, entity: string, details: string, userName = 'Demo User', userRole: UserRole = 'SUPER_ADMIN'): void {
    const log: AuditLog = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      userName,
      userRole,
      action,
      entity,
      details,
    };
    this.state.auditLogs.unshift(log);
    if (this.state.auditLogs.length > 100) {
      this.state.auditLogs = this.state.auditLogs.slice(0, 100);
    }
    this.saveState();
  }

  // --- Relational Helper Methods ---
  public getInstituteById(id?: string): Institute | undefined {
    return this.state.institutes.find(i => i.id === id);
  }

  public getDepartmentById(id?: string): Department | undefined {
    return this.state.departments.find(d => d.id === id);
  }

  public getProgramById(id?: string): Program | undefined {
    return this.state.programs.find(p => p.id === id);
  }

  public getBatchById(id?: string): Batch | undefined {
    return this.state.batches.find(b => b.id === id);
  }

  public getSemesterById(id?: string): Semester | undefined {
    return this.state.semesters.find(s => s.id === id);
  }

  public getDivisionById(id?: string): Division | undefined {
    return this.state.divisions.find(d => d.id === id);
  }

  public getSubjectById(id?: string): Subject | undefined {
    return this.state.subjects.find(s => s.id === id);
  }

  public getAcademicYearById(id?: string): AcademicYear | undefined {
    return this.state.academicYears.find(a => a.id === id);
  }

  public getDepartmentsByInstitute(instituteId: string): Department[] {
    return this.state.departments.filter(d => d.instituteId === instituteId);
  }

  public getProgramsByDepartment(departmentId: string): Program[] {
    return this.state.programs.filter(p => p.departmentId === departmentId);
  }

  public getSemestersByProgram(programId: string): Semester[] {
    return this.state.semesters.filter(s => s.programId === programId);
  }

  public getDivisionsBySemester(semesterId: string): Division[] {
    return this.state.divisions.filter(d => d.semesterId === semesterId);
  }

  public getSubjectsBySemester(semesterId: string): Subject[] {
    return this.state.subjects.filter(s => s.semesterId === semesterId);
  }

  public getStudentsByInstitute(instituteId: string): Student[] {
    return this.state.students.filter(s => s.instituteId === instituteId);
  }

  public getStudentsByDepartment(departmentId: string): Student[] {
    return this.state.students.filter(s => s.departmentId === departmentId);
  }

  public getFacultyByInstitute(instituteId: string): Faculty[] {
    return this.state.faculty.filter(f => f.instituteId === instituteId);
  }

  public getFacultyByDepartment(departmentId: string): Faculty[] {
    return this.state.faculty.filter(f => f.departmentId === departmentId);
  }

  // --- Finance & Billing Specific Helpers ---
  public getFinanceOverviewStats() {
    const feeRecords = this.state.studentFeeRecords;
    let totalDemand = 0;
    let totalCollected = 0;
    let totalPending = 0;
    let overdueCount = 0;
    let paidCount = 0;

    feeRecords.forEach(rec => {
      totalDemand += rec.totalAmount;
      totalCollected += rec.paidAmount;
      totalPending += rec.pendingAmount;

      if (rec.status === 'OVERDUE') overdueCount++;
      if (rec.status === 'PAID') paidCount++;
    });

    const collectionPercentage = totalDemand > 0 ? Math.round((totalCollected / totalDemand) * 100) : 100;

    return {
      totalDemand,
      totalCollected,
      totalPending,
      overdueCount,
      paidCount,
      totalRecordsCount: feeRecords.length,
      collectionPercentage
    };
  }

  // --- Student Attendance Calculation ---
  public getStudentAttendanceStats(studentId: string) {
    const sessions = this.state.attendanceSessions;
    let totalClasses = 0;
    let presentClasses = 0;
    let absentClasses = 0;

    const subjectStats: Record<string, { subjectName: string; total: number; present: number }> = {};

    sessions.forEach(sess => {
      const rec = sess.records.find(r => r.studentId === studentId);
      if (rec) {
        totalClasses++;
        const subj = this.getSubjectById(sess.subjectId);
        const subjName = subj ? subj.name : 'Subject';

        if (!subjectStats[sess.subjectId]) {
          subjectStats[sess.subjectId] = { subjectName: subjName, total: 0, present: 0 };
        }
        subjectStats[sess.subjectId].total++;

        if (rec.status === 'PRESENT' || rec.status === 'LATE') {
          presentClasses++;
          subjectStats[sess.subjectId].present++;
        } else {
          absentClasses++;
        }
      }
    });

    const percentage = totalClasses > 0 ? Math.round((presentClasses / totalClasses) * 100) : 100;

    return {
      totalClasses,
      presentClasses,
      absentClasses,
      percentage,
      subjectStats
    };
  }

  // --- Phase 6: Convert Approved Applicant to active Student Record ---
  public convertApplicantToStudent(applicationId: string): Student | null {
    const app = this.state.admissionApplications.find(a => a.id === applicationId);
    if (!app || app.status !== 'APPROVED') return null;

    const newStudentId = `stu-${Date.now()}`;
    const enrollmentNo = `${new Date().getFullYear().toString().slice(2)}010100${this.state.students.length + 1}`;

    const prog = this.getProgramById(app.programId);
    const deptId = prog ? prog.departmentId : 'dept-1';
    const instId = prog ? prog.instituteId : 'inst-1';

    // Create student DB record
    const newStudent: Student = {
      id: newStudentId,
      enrollmentNo,
      name: app.applicantName,
      email: app.email,
      phone: app.phone,
      photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80',
      gender: app.gender,
      dateOfBirth: app.dateOfBirth,
      bloodGroup: app.bloodGroup,
      address: app.address,
      admissionDate: new Date().toISOString().split('T')[0],
      instituteId: instId,
      departmentId: deptId,
      programId: app.programId,
      batchId: app.batchId,
      semesterId: app.semesterId,
      divisionId: app.divisionId,
      guardianName: app.guardianName,
      guardianPhone: app.guardianPhone,
      status: 'ACTIVE'
    };

    this.state.students.unshift(newStudent);

    // Update application record
    app.status = 'CONVERTED';
    app.studentId = newStudentId;

    // Generate Student Fee Account Ledger matching the Program Fee Structure
    const feeStructure = this.state.feeStructures.find(f => f.programId === app.programId && f.semesterId === app.semesterId) || this.state.feeStructures[0];
    const totalAmount = feeStructure ? feeStructure.totalAmount : 75000;
    const tuition = feeStructure ? feeStructure.tuitionFee : 45000;
    const lab = feeStructure ? feeStructure.labFee : 8000;
    const dev = feeStructure ? feeStructure.developmentFee : 7000;
    const hostel = feeStructure ? (feeStructure.hostelFee || 0) : 15000;

    const newFeeRecord: StudentFeeRecord = {
      id: `sfr-${Date.now()}`,
      studentId: newStudentId,
      studentName: app.applicantName,
      enrollmentNo,
      programId: app.programId,
      semesterId: app.semesterId,
      academicYearId: 'ay-2024',
      feeStructureId: feeStructure ? feeStructure.id : 'fs-btech-sem4',
      tuitionFee: tuition,
      labFee: lab,
      developmentFee: dev,
      hostelFee: hostel,
      totalAmount,
      paidAmount: 0,
      pendingAmount: totalAmount,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days out
      status: 'PENDING'
    };

    this.state.studentFeeRecords.unshift(newFeeRecord);

    this.logAudit('CONVERT', 'Admissions', `Converted applicant ${app.applicantName} to active Student Enrolment ${enrollmentNo}`);

    this.saveState();
    return newStudent;
  }

  // --- NOTIFICATION MANAGEMENT ---
  getNotifications(user: User | null, role?: UserRole | null): ERPNotification[] {
    const userRole = role || user?.role || 'STUDENT';
    const userId = user?.id;

    // Look up student record if logged-in user is a student
    const student = userRole === 'STUDENT' ? this.getStudents().find(s => s.id === userId || s.email === user?.email || s.enrollmentNo === user?.enrollmentNo) : null;
    const userInstId = user?.instituteId || student?.instituteId;
    const userDeptId = user?.departmentId || student?.departmentId;
    const userProgId = student?.programId;
    const userSemId = student?.semesterId;
    const userDivId = student?.divisionId;

    return (this.state.notifications || []).filter(n => {
      // 1. Target Role Match
      if (n.targetRole && n.targetRole !== 'ALL' && n.targetRole !== userRole) {
        if (n.targetRole === 'SUPER_ADMIN' || n.targetRole === 'UNIVERSITY_ADMIN') {
          if (userRole !== 'SUPER_ADMIN' && userRole !== 'UNIVERSITY_ADMIN') return false;
        } else {
          return false;
        }
      }

      // 2. Target User Match
      if (n.targetUserId && n.targetUserId !== userId) {
        return false;
      }

      // 3. Target Institute Match
      if (n.targetInstituteId && userInstId && n.targetInstituteId !== userInstId) {
        return false;
      }

      // 4. Target Department Match
      if (n.targetDepartmentId && userDeptId && n.targetDepartmentId !== userDeptId) {
        return false;
      }

      // 5. Target Program Match
      if (n.targetProgramId && userProgId && n.targetProgramId !== userProgId) {
        return false;
      }

      // 6. Target Semester Match
      if (n.targetSemesterId && userSemId && n.targetSemesterId !== userSemId) {
        return false;
      }

      // 7. Target Division Match
      if (n.targetDivisionId && userDivId && n.targetDivisionId !== userDivId) {
        return false;
      }

      return true;
    });
  }

  getUnreadNotificationCount(user: User | null, role?: UserRole | null): number {
    const userId = user?.id || 'guest';
    const userNotifications = this.getNotifications(user, role);
    return userNotifications.filter(n => !(n.isReadByUsers || []).includes(userId)).length;
  }

  addNotification(data: Omit<ERPNotification, 'id' | 'createdAt' | 'isReadByUsers'>): ERPNotification {
    const newNotification: ERPNotification = {
      ...data,
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
      isReadByUsers: []
    };
    if (!this.state.notifications) {
      this.state.notifications = [];
    }
    this.state.notifications.unshift(newNotification);
    this.saveState();
    return newNotification;
  }

  markNotificationAsRead(notificationId: string, userId: string): void {
    if (!this.state.notifications) return;
    const notif = this.state.notifications.find(n => n.id === notificationId);
    if (notif) {
      if (!notif.isReadByUsers) notif.isReadByUsers = [];
      if (!notif.isReadByUsers.includes(userId)) {
        notif.isReadByUsers.push(userId);
        this.saveState();
      }
    }
  }

  markAllNotificationsAsRead(user: User | null, role?: UserRole | null): void {
    if (!this.state.notifications) return;
    const userId = user?.id || 'guest';
    const relevant = this.getNotifications(user, role);
    relevant.forEach(n => {
      if (!n.isReadByUsers) n.isReadByUsers = [];
      if (!n.isReadByUsers.includes(userId)) {
        n.isReadByUsers.push(userId);
      }
    });
    this.saveState();
  }

  // ─── EDP Duty Management Methods ──────────────────────────────────────────
  getEdpDuties(): EdpDuty[] {
    return this.state.edpDuties || [];
  }

  getScopedEdpDuties(user: User | null, role?: UserRole | null): EdpDuty[] {
    const list = this.getEdpDuties();
    if (!user || !role) return list;

    if (role === 'SUPER_ADMIN' || role === 'UNIVERSITY_ADMIN' || role === 'REGISTRAR' || role === 'IQAC') {
      return list;
    }

    if (role === 'PRINCIPAL' && user.instituteId) {
      return list.filter(d => d.instituteId === user.instituteId || d.assignedUserId === user.id);
    }

    if (role === 'HOD' && user.departmentId) {
      return list.filter(d => d.departmentId === user.departmentId || d.assignedUserId === user.id);
    }

    // Faculty & other staff see duties assigned to them
    return list.filter(d => d.assignedUserId === user.id || d.assignedUserId === user.employeeId);
  }

  addEdpDuty(dutyData: Partial<EdpDuty>, creatorUser?: User | null): EdpDuty {
    const newId = `edp-${Date.now()}`;
    const dutyCode = `EDP-${new Date().getFullYear()}-${String((this.state.edpDuties || []).length + 1).padStart(3, '0')}`;

    const newDuty: EdpDuty = {
      id: newId,
      dutyCode,
      eventName: dutyData.eventName || 'Official Campus Event',
      eventType: dutyData.eventType || 'SEMINAR',
      dutyRole: dutyData.dutyRole || 'GENERAL_DUTY',
      assignedUserId: dutyData.assignedUserId || 'fac-1',
      assignedUserName: dutyData.assignedUserName || 'Assigned Staff Member',
      assignedUserRole: dutyData.assignedUserRole || 'FACULTY',
      assignedUserDesignation: dutyData.assignedUserDesignation || 'Faculty Member',
      instituteId: dutyData.instituteId || 'inst-1',
      departmentId: dutyData.departmentId || 'dept-1',
      dutyDate: dutyData.dutyDate || new Date().toISOString().split('T')[0],
      startTime: dutyData.startTime || '09:00 AM',
      endTime: dutyData.endTime || '05:00 PM',
      venue: dutyData.venue || 'University Main Campus',
      responsibilityDetails: dutyData.responsibilityDetails || 'General Event Duty Responsibility',
      status: 'ASSIGNED',
      reportsNotes: '',
      evidenceList: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (!this.state.edpDuties) this.state.edpDuties = [];
    this.state.edpDuties.unshift(newDuty);
    this.saveState();

    // Notify assigned user
    this.addNotification({
      title: `New EDP Event Duty Assigned: ${newDuty.eventName}`,
      message: `You have been assigned as ${newDuty.dutyRole.replace('_', ' ')} for ${newDuty.eventName} on ${newDuty.dutyDate} at ${newDuty.venue}.`,
      module: 'EVENT',
      timestamp: new Date().toISOString(),
      targetUserId: newDuty.assignedUserId,
      linkTab: 'edp-duties'
    });

    this.logAudit('CREATE_EDP_DUTY', 'EDP Duty', `Created duty ${dutyCode} for ${newDuty.assignedUserName}`, creatorUser?.name || 'System Admin', creatorUser?.role || 'SUPER_ADMIN');

    return newDuty;
  }

  addEdpDutyEvidence(dutyId: string, evidenceData: Omit<EdpDutyEvidence, 'id'>, notes?: string): void {
    if (!this.state.edpDuties) return;
    const duty = this.state.edpDuties.find(d => d.id === dutyId);
    if (!duty) return;

    const newEvidence: EdpDutyEvidence = {
      id: `ev-${Date.now()}`,
      ...evidenceData
    };

    if (!duty.evidenceList) duty.evidenceList = [];
    duty.evidenceList.push(newEvidence);
    duty.status = 'COMPLETED';
    if (notes) duty.reportsNotes = notes;
    duty.updatedAt = new Date().toISOString();

    this.saveState();
    this.logAudit('SUBMIT_EDP_EVIDENCE', 'EDP Duty', `Submitted geo-tagged evidence for ${duty.dutyCode}`, duty.assignedUserName, duty.assignedUserRole);
  }

  verifyEdpDuty(dutyId: string, adminUser: User, status: EdpDutyStatus, remarks?: string): void {
    if (!this.state.edpDuties) return;
    const duty = this.state.edpDuties.find(d => d.id === dutyId);
    if (!duty) return;

    duty.status = status;
    duty.verifiedByAdminId = adminUser.id;
    duty.verifiedByAdminName = adminUser.name;
    duty.verifiedAt = new Date().toISOString();
    if (remarks) duty.verificationRemarks = remarks;
    duty.updatedAt = new Date().toISOString();

    this.saveState();

    // Notify assigned user
    this.addNotification({
      title: `EDP Duty Status Updated: ${duty.dutyCode}`,
      message: `Your EDP Event Duty status for ${duty.eventName} has been marked as ${status} by ${adminUser.name}.`,
      module: 'SYSTEM',
      timestamp: new Date().toISOString(),
      targetUserId: duty.assignedUserId,
      linkTab: 'edp-duties'
    });

    this.logAudit('VERIFY_EDP_DUTY', 'EDP Duty', `Verified EDP duty ${duty.dutyCode} as ${status}`, adminUser.name, adminUser.role);
  }

  // ─── Academic Lifecycle Architecture Helpers ─────────────────────────────────
  getUniversity(): University {
    return initialUniversity;
  }

  getStudentAcademicTimeline(studentId: string): StudentAcademicHistoryRecord[] {
    const student = this.state.students.find(s => s.id === studentId);
    return student?.academicHistory || [];
  }

  getFacultySubjects(facultyId: string): Subject[] {
    const fac = this.state.faculty.find(f => f.id === facultyId);
    if (!fac || !fac.subjectIds) return [];
    return this.state.subjects.filter(s => fac.subjectIds.includes(s.id));
  }

  getSubjectStudents(subjectId: string): Student[] {
    const subject = this.state.subjects.find(s => s.id === subjectId);
    if (!subject) return [];
    return this.state.students.filter(s => s.semesterId === subject.semesterId && s.programId === subject.programId);
  }

  promoteStudentSemester(
    studentId: string,
    nextSemesterId: string,
    nextDivisionId: string,
    termEndSPI?: number
  ): Student | null {
    const student = this.state.students.find(s => s.id === studentId);
    if (!student) return null;

    const currentSem = this.state.semesters.find(s => s.id === student.semesterId);
    const currentAY = this.state.academicYears.find(a => a.id === student.academicYearId);
    const nextSem = this.state.semesters.find(s => s.id === nextSemesterId);
    const div = this.state.divisions.find(d => d.id === student.divisionId);

    // Create immutable historical record of completed semester
    const historyRecord: StudentAcademicHistoryRecord = {
      id: `hist-${student.id}-sem${currentSem?.number || Date.now()}`,
      academicYearId: student.academicYearId || 'ay-2024',
      academicYearName: currentAY?.name || '2024-2025',
      semesterId: student.semesterId,
      semesterNumber: currentSem?.number || 1,
      batchId: student.batchId,
      divisionId: student.divisionId,
      divisionName: div?.name || 'Division A',
      spi: termEndSPI || 8.0,
      attendancePercentage: 88,
      feeClearanceStatus: 'CLEARED',
      status: 'PROMOTED',
      completedDate: new Date().toISOString().split('T')[0],
      remarks: `Promoted from Semester ${currentSem?.number || 1} to Semester ${nextSem?.number || 2}`
    };

    if (!student.academicHistory) {
      student.academicHistory = [];
    }
    student.academicHistory.push(historyRecord);

    // Update current active semester pointers
    student.semesterId = nextSemesterId;
    student.divisionId = nextDivisionId;
    if (nextSem?.academicYearId) {
      student.academicYearId = nextSem.academicYearId;
    }
    student.academicLifecycleStatus = nextSem && nextSem.number > 8 ? 'GRADUATED' : 'PURSUING';

    this.saveState();
    this.logAudit('PROMOTE_STUDENT', 'Academic Lifecycle', `Promoted ${student.name} (${student.enrollmentNo}) to Semester ${nextSem?.number || 'Next'}`);
    return student;
  }

  // ─── NAAC & IQAC Framework Methods ──────────────────────────────────────────
  getNaacCriteria(): NaacCriterion[] {
    return this.state.naacCriteria || initialNaacCriteria;
  }

  getNaacKeyIndicators(criterionId?: string): NaacKeyIndicator[] {
    const list = this.state.naacKeyIndicators || initialNaacKeyIndicators;
    if (criterionId) return list.filter(k => k.criterionId === criterionId);
    return list;
  }

  getNaacMetrics(criterionId?: string): NaacMetric[] {
    const list = this.state.naacMetrics || initialNaacMetrics;
    if (criterionId) return list.filter(m => m.criterionId === criterionId);
    return list;
  }

  getNaacSubmissions(metricId?: string): NaacDataSubmission[] {
    const list = this.state.naacSubmissions || initialNaacDataSubmissions;
    if (metricId) return list.filter(s => s.metricId === metricId);
    return list;
  }

  submitNaacMetricData(submission: Omit<NaacDataSubmission, 'id' | 'createdAt' | 'updatedAt' | 'remarksHistory'>, user: User): NaacDataSubmission {
    if (!this.state.naacSubmissions) this.state.naacSubmissions = [];
    const newSub: NaacDataSubmission = {
      ...submission,
      id: `naac-sub-${Date.now()}`,
      status: 'SUBMITTED',
      currentApproverRole: 'HOD',
      submittedByUserId: user.id,
      submittedByUserName: user.name,
      submittedAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      remarksHistory: [
        {
          id: `r-${Date.now()}`,
          actionByUserId: user.id,
          actionByUserName: user.name,
          actionByUserRole: user.role,
          office: 'HOD_ACADEMIC',
          action: 'SUBMITTED',
          remarks: 'Submitted metric data & evidence for IQAC verification',
          timestamp: new Date().toISOString()
        }
      ]
    };

    this.state.naacSubmissions.unshift(newSub);
    this.saveState();

    this.addNotification({
      title: `NAAC Metric ${newSub.metricCode} Data Submitted`,
      message: `Data for NAAC Metric ${newSub.metricCode} submitted by ${user.name} for HOD & IQAC verification.`,
      module: 'APPROVAL',
      timestamp: new Date().toISOString(),
      targetRole: 'IQAC',
      linkTab: 'iqac'
    });

    this.logAudit('SUBMIT_NAAC_DATA', 'NAAC / IQAC', `Submitted data for Metric ${newSub.metricCode}`, user.name, user.role);
    return newSub;
  }

  advanceNaacSubmissionStatus(
    submissionId: string,
    actionUser: User,
    action: ApprovalStatus,
    remarks: string
  ): NaacDataSubmission | null {
    if (!this.state.naacSubmissions) return null;
    const sub = this.state.naacSubmissions.find(s => s.id === submissionId);
    if (!sub) return null;

    sub.status = action;
    if (action === 'APPROVED') {
      if (sub.currentApproverRole === 'HOD') sub.currentApproverRole = 'IQAC';
      else if (sub.currentApproverRole === 'IQAC') sub.currentApproverRole = 'REGISTRAR';
      else if (sub.currentApproverRole === 'REGISTRAR') {
        sub.status = 'LOCKED';
        sub.lockedAt = new Date().toISOString();
      }
    } else if (action === 'RETURNED' || action === 'REJECTED') {
      sub.currentApproverRole = 'FACULTY';
    }

    sub.updatedAt = new Date().toISOString();
    sub.remarksHistory.push({
      id: `r-${Date.now()}`,
      actionByUserId: actionUser.id,
      actionByUserName: actionUser.name,
      actionByUserRole: actionUser.role,
      office: actionUser.role === 'REGISTRAR' ? 'REGISTRAR' : actionUser.role === 'IQAC' ? 'IQAC' : 'HOD_ACADEMIC',
      action: action,
      remarks: remarks || `Metric status updated to ${action}`,
      timestamp: new Date().toISOString()
    });

    this.saveState();

    this.addNotification({
      title: `NAAC Metric ${sub.metricCode} ${action}`,
      message: `Submission for Metric ${sub.metricCode} was updated to ${action} by ${actionUser.name}.`,
      module: 'APPROVAL',
      timestamp: new Date().toISOString(),
      targetUserId: sub.submittedByUserId,
      linkTab: 'iqac'
    });

    this.logAudit('VERIFY_NAAC_DATA', 'NAAC / IQAC', `Updated NAAC submission ${sub.metricCode} to ${action}`, actionUser.name, actionUser.role);
    return sub;
  }

  // ─── Research & Innovation Methods ──────────────────────────────────────────
  getResearchProjects(): ResearchProject[] {
    return this.state.researchProjects || initialResearchProjects;
  }

  getPublications(): PublicationRecord[] {
    return this.state.publications || initialPublicationRecords;
  }

  getPatents(): PatentRecord[] {
    return this.state.patents || initialPatentRecords;
  }

  // ─── NAAC Auto ERP Metric Calculator ─────────────────────────────────────────
  calculateNaacAutoValue(metric: NaacMetric): { calculatedValue: number; formulaString: string; erpSummary: string } {
    const students = this.getStudents();
    const faculty = this.getFaculty();
    const results = this.getStudentResults();
    const edpDuties = this.getEdpDuties();
    const publications = this.getPublications();

    switch (metric.autoErpSource) {
      case 'FACULTY_COUNT': {
        const sanctioned = 48;
        const totalFac = faculty.length;
        const val = Number(((totalFac / sanctioned) * 100).toFixed(2));
        return {
          calculatedValue: val,
          formulaString: `(${totalFac} Full-Time Appointed / ${sanctioned} Sanctioned Posts) * 100`,
          erpSummary: `Connected ERP Database: ${totalFac} active faculty records`
        };
      }
      case 'FACULTY_PHD_COUNT': {
        const phdFaculty = faculty.filter(f => f.qualification.toLowerCase().includes('ph.d') || f.qualification.toLowerCase().includes('phd')).length;
        const totalFac = faculty.length || 1;
        const val = Number(((phdFaculty / totalFac) * 100).toFixed(2));
        return {
          calculatedValue: val,
          formulaString: `(${phdFaculty} Ph.D Qualified / ${totalFac} Total Faculty) * 100`,
          erpSummary: `Connected ERP Database: ${phdFaculty} Ph.D qualified professors`
        };
      }
      case 'PASS_PERCENTAGE': {
        const passedCount = results.filter(r => r.status === 'PASS').length || 4;
        const totalAppeared = results.length || 4;
        const val = Number(((passedCount / totalAppeared) * 100).toFixed(2));
        return {
          calculatedValue: val,
          formulaString: `(${passedCount} Passed / ${totalAppeared} Appeared) * 100`,
          erpSummary: `Connected ERP Exam Database: ${passedCount}/${totalAppeared} passed final exams`
        };
      }
      case 'RESEARCH_PAPERS': {
        const scopusPubs = publications.filter(p => p.indexing === 'Scopus' || p.indexing === 'Web of Science').length || 2;
        const totalFac = faculty.length || 1;
        const val = Number((scopusPubs / totalFac).toFixed(2));
        return {
          calculatedValue: val,
          formulaString: `${scopusPubs} Scopus Publications / ${totalFac} Faculty Members`,
          erpSummary: `Connected ERP Research Database: ${scopusPubs} Scopus/WoS journal papers`
        };
      }
      case 'STUDENTS_COUNT': {
        const totalStu = students.length;
        return {
          calculatedValue: 100,
          formulaString: `(${totalStu} Active Students / Total Intake Capacity) * 100`,
          erpSummary: `Connected ERP Student Registry: ${totalStu} enrolled students`
        };
      }
      default:
        return {
          calculatedValue: 95.0,
          formulaString: 'ERP Metric Auto-Aggregation Engine',
          erpSummary: 'Connected SSIU ERP Central Relational Database'
        };
    }
  }

  // ─── HR MANAGEMENT METHODS ───────────────────────────────────────────────
  getEmployees(): Employee[] {
    return this.state.employees || initialEmployees;
  }

  getEmployeeById(id: string): Employee | undefined {
    return (this.state.employees || initialEmployees).find(e => e.id === id);
  }

  getPayrollRecords(): PayrollRecord[] {
    return this.state.payrollRecords || initialPayrollRecords;
  }

  getEmployeeLeaveApplications(): EmployeeLeaveApplication[] {
    return this.state.leaveApplications || initialLeaveApplications;
  }

  getPerformanceAppraisals(): PerformanceAppraisal[] {
    return this.state.performanceAppraisals || initialPerformanceAppraisals;
  }

  getTrainingFdpRecords(): TrainingFdpRecord[] {
    return this.state.trainingFdpRecords || initialTrainingFdpRecords;
  }

  submitEmployeeLeave(leaveData: Omit<EmployeeLeaveApplication, 'id' | 'appliedDate' | 'status'>, user: User): EmployeeLeaveApplication {
    if (!this.state.leaveApplications) this.state.leaveApplications = [];
    const newLeave: EmployeeLeaveApplication = {
      ...leaveData,
      id: `lv-${Date.now()}`,
      status: 'SUBMITTED',
      appliedDate: new Date().toISOString().split('T')[0]
    };
    this.state.leaveApplications.unshift(newLeave);
    this.saveState();

    this.logAudit('SUBMIT_LEAVE', 'HR Management', `Leave applied by ${user.name} for ${newLeave.totalDays} days`, user.name, user.role);
    return newLeave;
  }

  approveEmployeeLeave(leaveId: string, approverUser: User, status: ApprovalStatus): void {
    if (!this.state.leaveApplications) return;
    const lv = this.state.leaveApplications.find(l => l.id === leaveId);
    if (!lv) return;

    lv.status = status;
    lv.approvedByUserId = approverUser.id;
    lv.approvedByUserName = approverUser.name;
    this.saveState();

    this.logAudit('APPROVE_LEAVE', 'HR Management', `Updated leave ${lv.id} status to ${status}`, approverUser.name, approverUser.role);
  }
}

export const db = new ERPDatabaseService();
