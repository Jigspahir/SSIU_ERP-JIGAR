import type { 
  Institute, Department, Program, AcademicYear, Batch, 
  Semester, Division, Subject, Faculty, Student, User, AuditLog,
  AttendanceSession, TimetableEntry, SessionPlanTopic, UnitMaterial,
  Assignment, AssignmentSubmission, AcademicCalendarEvent,
  FeeStructure, StudentFeeRecord, FeePaymentTransaction,
  CRMLead, AdmissionApplication, AdmissionDocument,
  Exam, ExamTimetable, ExamForm, StudentMarks, StudentResult, StudentFeedback, SupportTicket, StudentDocument,
  ERPNotification, UserRole
} from '../types';
import { 
  initialInstitutes, initialDepartments, initialPrograms, initialAcademicYears, 
  initialBatches, initialSemesters, initialDivisions, initialSubjects, 
  initialFaculty, initialStudents, initialUsers, initialAuditLogs,
  initialAttendanceSessions, initialTimetableEntries, initialSessionPlanTopics,
  initialUnitMaterials, initialAssignments, initialAssignmentSubmissions,
  initialAcademicCalendarEvents, initialFeeStructures, initialStudentFeeRecords,
  initialFeePaymentTransactions, initialCRMLeads, initialAdmissionApplications,
  initialExams, initialExamTimetables, initialExamForms, initialStudentMarks, initialStudentResults, initialStudentFeedbacks, initialSupportTickets, initialStudentDocuments,
  initialERPNotifications
} from './seedData';

const STORAGE_KEY = 'SWARRNIM_ERP_DB_V5';

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
}

class ERPDatabaseService {
  private state: DatabaseState;

  constructor() {
    this.state = this.loadState();
  }

  private loadState(): DatabaseState {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          institutes: initialInstitutes,
          departments: initialDepartments,
          faculty: initialFaculty,
          students: parsed.students || initialStudents,
          users: initialUsers,
          attendanceSessions: parsed.attendanceSessions || initialAttendanceSessions,
          timetableEntries: parsed.timetableEntries || initialTimetableEntries,
          sessionPlanTopics: parsed.sessionPlanTopics || initialSessionPlanTopics,
          unitMaterials: parsed.unitMaterials || initialUnitMaterials,
          assignments: parsed.assignments || initialAssignments,
          assignmentSubmissions: parsed.assignmentSubmissions || initialAssignmentSubmissions,
          academicCalendarEvents: parsed.academicCalendarEvents || initialAcademicCalendarEvents,
          feeStructures: parsed.feeStructures || initialFeeStructures,
          studentFeeRecords: parsed.studentFeeRecords || initialStudentFeeRecords,
          feePaymentTransactions: parsed.feePaymentTransactions || initialFeePaymentTransactions,
          crmLeads: parsed.crmLeads || initialCRMLeads,
          admissionApplications: parsed.admissionApplications || initialAdmissionApplications,
          exams: parsed.exams || initialExams,
          examTimetables: parsed.examTimetables || initialExamTimetables,
          examForms: parsed.examForms || initialExamForms,
          studentMarks: parsed.studentMarks || initialStudentMarks,
          studentResults: parsed.studentResults || initialStudentResults,
          studentFeedbacks: parsed.studentFeedbacks || initialStudentFeedbacks,
          supportTickets: parsed.supportTickets || initialSupportTickets,
          studentDocuments: parsed.studentDocuments || initialStudentDocuments,
          notifications: parsed.notifications || initialERPNotifications
        };
      }
    } catch (e) {
      console.error('Error loading database state from LocalStorage:', e);
    }

    // Default Seed State
    const defaultState: DatabaseState = {
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
      notifications: initialERPNotifications
    };
    
    this.saveState(defaultState);
    return defaultState;
  }

  private saveState(newState?: DatabaseState): void {
    if (newState) this.state = newState;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.error('Error saving state to LocalStorage:', e);
    }
  }

  public resetToDefaultSeed(): DatabaseState {
    const defaultState: DatabaseState = {
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
      auditLogs: [...initialAuditLogs, {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        userName: 'Demo Admin',
        userRole: 'SUPER_ADMIN',
        action: 'RESET_SEED',
        entity: 'Database',
        details: 'Database was reset to default Swarrnim University seed state.'
      }],
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
      studentDocuments: initialStudentDocuments
    };
    this.state = defaultState;
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

  public logAudit(action: string, entity: string, details: string, userName = 'Demo User', userRole = 'SUPER_ADMIN'): void {
    const log: AuditLog = {
      id: `log-${Date.now()}-${Math.floor(Math.random()*1000)}`,
      timestamp: new Date().toISOString(),
      userName,
      userRole: userRole as any,
      action,
      entity,
      details
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
  getNotifications(user: User | null, role?: UserRole): ERPNotification[] {
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

  getUnreadNotificationCount(user: User | null, role?: UserRole): number {
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

  markAllNotificationsAsRead(user: User | null, role?: UserRole): void {
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
}

export const db = new ERPDatabaseService();
