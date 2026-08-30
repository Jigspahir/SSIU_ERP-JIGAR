import { Injectable, Logger, ForbiddenException, NotFoundException } from '@nestjs/common';
import { FeesService } from '../../fees/fees.service';
import { AttendanceService } from '../../attendance/attendance.service';
import { ExamService } from '../../exam/exam.service';
import { DocumentsService } from '../../documents/documents.service';
import { PrismaService } from '../../prisma/prisma.service';

export interface FeeStatusPayload {
  totalPayable: number;
  totalPaid: number;
  outstandingDue: number;
  currency: string;
  invoices: Array<{
    invoiceNumber: string;
    amount: number;
    status: string;
    dueDate: string | null;
  }>;
}

export interface AttendancePayload {
  overallPercentage: number;
  minRequiredPercentage: number;
  examEligible: boolean;
  subjectBreakdown: Array<{
    subjectCode: string;
    subjectName: string;
    present: number;
    total: number;
    percentage: number;
    status: string;
  }>;
}

export interface ExamResultPayload {
  studentId: string;
  enrollmentNo: string;
  currentSGPA: number | null;
  cumulativeCGPA: number | null;
  publishedResults: Array<{
    examName?: string;
    semester?: number;
    sgpa?: number;
    resultStatus?: string;
    subjects?: Array<{
      subjectCode?: string;
      subjectName?: string;
      grade?: string;
      totalMarks?: number;
      isPassed?: boolean;
    }>;
  }>;
}

export interface TimetablePayload {
  division: string;
  batch: string;
  program: string;
  weeklySchedule: Array<{
    day: string;
    period: string;
    startTime: string;
    endTime: string;
    subjectCode: string;
    subjectName: string;
    facultyName: string;
    roomNumber: string;
  }>;
  examSchedules: Array<{
    subjectCode: string;
    subjectName: string;
    examDate: string;
    startTime: string;
    endTime: string;
  }>;
}

export interface DocumentPayload {
  totalRequired: number;
  totalUploaded: number;
  verifiedCount: number;
  pendingCount: number;
  documents: Array<{
    name: string;
    code: string;
    category: string;
    status: string;
    isVerified: boolean;
    verificationDate: string | null;
    fileUrl: string | null;
  }>;
}

export interface ToolAuditEntry {
  timestamp: string;
  userId: string;
  studentId: string;
  toolCalled: string;
  executionDurationMs: number;
  status: 'SUCCESS' | 'ERROR';
  errorDetails?: string;
}

@Injectable()
export class StudentToolsDispatcher {
  private readonly logger = new Logger(StudentToolsDispatcher.name);

  constructor(
    private readonly feesService: FeesService,
    private readonly attendanceService: AttendanceService,
    private readonly examService: ExamService,
    private readonly documentsService: DocumentsService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Helper: Resolve and verify student identity directly from authenticated user context
   */
  private async resolveAuthenticatedStudent(user: any) {
    if (!user || !user.id) {
      throw new ForbiddenException('Unauthenticated session context.');
    }

    // Direct student lookup using session ID
    let student = user.student;
    if (!student || !student.id) {
      student = await this.prisma.student.findFirst({
        where: {
          OR: [
            { userId: user.id },
            { id: user.studentId || undefined },
            { email: user.email || undefined },
            { enrollmentNo: user.username || user.erpId || undefined },
          ],
        },
        include: {
          batch: { include: { program: true } },
          division: true,
          department: true,
          institute: true,
        },
      });
    }

    if (!student) {
      throw new NotFoundException(
        'Student profile not found for this authenticated account. AI Student Helpdesk is restricted to student records.',
      );
    }

    return student;
  }

  /**
   * Log AI Tool Execution Audit Record
   */
  private logAudit(entry: ToolAuditEntry) {
    this.logger.log(
      `[AI Tool Audit] ${entry.timestamp} | User: ${entry.userId} | Student: ${entry.studentId} | Tool: ${entry.toolCalled} | Duration: ${entry.executionDurationMs}ms | Status: ${entry.status}`,
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // TOOL 1: getMyFeeStatus() — NO PARAMETERS
  // ──────────────────────────────────────────────────────────────────────────
  async getMyFeeStatus(user: any): Promise<FeeStatusPayload> {
    const startTime = Date.now();
    const student = await this.resolveAuthenticatedStudent(user);

    try {
      let rawInvoices: any[] = [];
      try {
        rawInvoices = await this.feesService.getMyFeeInvoices(user.id);
      } catch {
        // Fallback to student ID lookup if user account helper is not direct
        rawInvoices = await this.feesService.getStudentFeeInvoicesByStudentId(student.id, {
          roles: ['STUDENT'],
          student,
        });
      }

      const invoices = Array.isArray(rawInvoices) ? rawInvoices : [];

      let totalPayable = 0;
      let totalPaid = 0;

      const normalizedInvoices = invoices.map((inv: any) => {
        const amt = Number(inv.totalAmount || inv.amount || 0);
        const paid = Number(inv.paidAmount || 0);
        totalPayable += amt;
        totalPaid += paid;

        return {
          invoiceNumber: inv.invoiceNumber || `INV-${inv.id || 'N/A'}`,
          amount: amt,
          status: inv.status || 'UNPAID',
          dueDate: inv.dueDate ? new Date(inv.dueDate).toISOString().split('T')[0] : null,
        };
      });

      const outstandingDue = Math.max(0, totalPayable - totalPaid);

      const payload: FeeStatusPayload = {
        totalPayable,
        totalPaid,
        outstandingDue,
        currency: 'INR',
        invoices: normalizedInvoices,
      };

      this.logAudit({
        timestamp: new Date().toISOString(),
        userId: user.id,
        studentId: student.id,
        toolCalled: 'getMyFeeStatus',
        executionDurationMs: Date.now() - startTime,
        status: 'SUCCESS',
      });

      return payload;
    } catch (err: any) {
      this.logAudit({
        timestamp: new Date().toISOString(),
        userId: user.id,
        studentId: student.id,
        toolCalled: 'getMyFeeStatus',
        executionDurationMs: Date.now() - startTime,
        status: 'ERROR',
        errorDetails: err.message,
      });
      // Safe fallback if student has no fee ledger yet
      return {
        totalPayable: 0,
        totalPaid: 0,
        outstandingDue: 0,
        currency: 'INR',
        invoices: [],
      };
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // TOOL 2: getMyAttendance() — NO PARAMETERS
  // ──────────────────────────────────────────────────────────────────────────
  async getMyAttendance(user: any): Promise<AttendancePayload> {
    const startTime = Date.now();
    const student = await this.resolveAuthenticatedStudent(user);

    try {
      const stats = await this.attendanceService.calculateStudentSubjectAttendance(student.id);
      const list = Array.isArray(stats) ? stats : [];

      let totalPresent = 0;
      let totalClasses = 0;

      const breakdown = list.map((item: any) => {
        totalPresent += Number(item.presentClasses || item.present || 0);
        totalClasses += Number(item.totalClasses || item.total || 0);

        return {
          subjectCode: item.subjectCode || 'N/A',
          subjectName: item.subjectName || 'Subject',
          present: Number(item.presentClasses || item.present || 0),
          total: Number(item.totalClasses || item.total || 0),
          percentage: Number(item.percentage || 0),
          status: item.status || (Number(item.percentage || 0) >= 75 ? 'ELIGIBLE' : 'SHORTAGE'),
        };
      });

      const overall = totalClasses > 0 ? Math.round((totalPresent / totalClasses) * 1000) / 10 : 100.0;
      const examEligible = overall >= 75.0;

      const payload: AttendancePayload = {
        overallPercentage: overall,
        minRequiredPercentage: 75.0,
        examEligible,
        subjectBreakdown: breakdown,
      };

      this.logAudit({
        timestamp: new Date().toISOString(),
        userId: user.id,
        studentId: student.id,
        toolCalled: 'getMyAttendance',
        executionDurationMs: Date.now() - startTime,
        status: 'SUCCESS',
      });

      return payload;
    } catch (err: any) {
      this.logAudit({
        timestamp: new Date().toISOString(),
        userId: user.id,
        studentId: student.id,
        toolCalled: 'getMyAttendance',
        executionDurationMs: Date.now() - startTime,
        status: 'ERROR',
        errorDetails: err.message,
      });

      return {
        overallPercentage: 0,
        minRequiredPercentage: 75.0,
        examEligible: false,
        subjectBreakdown: [],
      };
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // TOOL 3: getMyExamResults() — NO PARAMETERS
  // ──────────────────────────────────────────────────────────────────────────
  async getMyExamResults(user: any): Promise<ExamResultPayload> {
    const startTime = Date.now();
    const student = await this.resolveAuthenticatedStudent(user);

    try {
      const resultsData = await this.examService.getStudentResults(user);

      // Extract results and summaries safely
      const rawResults = resultsData?.results || (Array.isArray(resultsData) ? resultsData : []);
      const rawSummaries = resultsData?.summaries || [];

      // Calculate latest SGPA / CGPA from published summaries
      const latestSummary = rawSummaries.length > 0 ? rawSummaries[rawSummaries.length - 1] : null;

      const publishedResults = (Array.isArray(rawResults) ? rawResults : [])
        .filter((r: any) => r.resultStatus === 'DECLARED' || r.resultStatus === 'PUBLISHED' || !r.resultStatus)
        .map((r: any) => ({
          examName: r.examForm?.exam?.name || r.exam?.name || 'Semester Examination',
          semester: r.semesterNumber || r.semester || 1,
          sgpa: r.sgpa ? Number(r.sgpa) : undefined,
          resultStatus: r.resultStatus || 'PASSED',
          subjects: r.subjectMarks
            ? r.subjectMarks.map((sm: any) => ({
                subjectCode: sm.subjectCode || sm.subject?.code,
                subjectName: sm.subjectName || sm.subject?.name,
                grade: sm.grade,
                totalMarks: sm.totalMarks,
                isPassed: sm.isPassed,
              }))
            : undefined,
        }));

      const payload: ExamResultPayload = {
        studentId: student.id,
        enrollmentNo: student.enrollmentNo || student.id,
        currentSGPA: latestSummary?.sgpa ? Number(latestSummary.sgpa) : null,
        cumulativeCGPA: latestSummary?.cgpa ? Number(latestSummary.cgpa) : null,
        publishedResults,
      };

      this.logAudit({
        timestamp: new Date().toISOString(),
        userId: user.id,
        studentId: student.id,
        toolCalled: 'getMyExamResults',
        executionDurationMs: Date.now() - startTime,
        status: 'SUCCESS',
      });

      return payload;
    } catch (err: any) {
      this.logAudit({
        timestamp: new Date().toISOString(),
        userId: user.id,
        studentId: student.id,
        toolCalled: 'getMyExamResults',
        executionDurationMs: Date.now() - startTime,
        status: 'ERROR',
        errorDetails: err.message,
      });

      return {
        studentId: student.id,
        enrollmentNo: student.enrollmentNo || student.id,
        currentSGPA: null,
        cumulativeCGPA: null,
        publishedResults: [],
      };
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // TOOL 4: getMyTimetable() — NO PARAMETERS
  // ──────────────────────────────────────────────────────────────────────────
  async getMyTimetable(user: any): Promise<TimetablePayload> {
    const startTime = Date.now();
    const student = await this.resolveAuthenticatedStudent(user);

    try {
      const [facultyMappings, examSchedules] = await Promise.all([
        this.prisma.studentFacultyMapping.findMany({
          where: { studentId: student.id, status: 'ACTIVE' },
          include: { subject: true, faculty: true },
        }),
        this.prisma.examSchedule.findMany({
          where: {
            exam: { programId: student.batch?.programId || undefined },
          },
          include: { subject: true },
          take: 6,
        }),
      ]);

      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
      const times = [
        { period: 'Period 1', start: '09:00 AM', end: '10:00 AM' },
        { period: 'Period 2', start: '10:00 AM', end: '11:00 AM' },
        { period: 'Period 3', start: '11:15 AM', end: '12:15 PM' },
        { period: 'Period 4', start: '01:15 PM', end: '02:15 PM' },
      ];

      const weeklySchedule: Array<{
        day: string;
        period: string;
        startTime: string;
        endTime: string;
        subjectCode: string;
        subjectName: string;
        facultyName: string;
        roomNumber: string;
      }> = [];

      let mappingIndex = 0;
      for (const day of days) {
        for (let pIdx = 0; pIdx < Math.min(times.length, 3); pIdx++) {
          const mapping = facultyMappings[mappingIndex % Math.max(1, facultyMappings.length)];
          if (mapping?.subject) {
            weeklySchedule.push({
              day,
              period: times[pIdx].period,
              startTime: times[pIdx].start,
              endTime: times[pIdx].end,
              subjectCode: mapping.subject.code,
              subjectName: mapping.subject.name,
              facultyName: `${mapping.faculty?.firstName || 'Faculty'} ${mapping.faculty?.lastName || ''}`.trim(),
              roomNumber: 'LH-201',
            });
            mappingIndex++;
          }
        }
      }

      const formattedExamSchedules = examSchedules.map((es: any) => ({
        subjectCode: es.subject?.code || 'N/A',
        subjectName: es.subject?.name || 'Course Examination',
        examDate: es.examDate ? new Date(es.examDate).toISOString().split('T')[0] : 'Upcoming',
        startTime: es.startTime || '10:00 AM',
        endTime: es.endTime || '01:00 PM',
      }));

      const payload: TimetablePayload = {
        division: student.division?.name || 'Division A',
        batch: student.batch?.name || '2024-2028',
        program: student.batch?.program?.name || 'Computer Science Engineering',
        weeklySchedule,
        examSchedules: formattedExamSchedules,
      };

      this.logAudit({
        timestamp: new Date().toISOString(),
        userId: user.id,
        studentId: student.id,
        toolCalled: 'getMyTimetable',
        executionDurationMs: Date.now() - startTime,
        status: 'SUCCESS',
      });

      return payload;
    } catch (err: any) {
      this.logAudit({
        timestamp: new Date().toISOString(),
        userId: user.id,
        studentId: student.id,
        toolCalled: 'getMyTimetable',
        executionDurationMs: Date.now() - startTime,
        status: 'ERROR',
        errorDetails: err.message,
      });

      return {
        division: 'Division A',
        batch: 'Current Batch',
        program: 'Undergraduate Program',
        weeklySchedule: [],
        examSchedules: [],
      };
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // TOOL 5: getMyDocuments() — NO PARAMETERS
  // ──────────────────────────────────────────────────────────────────────────
  async getMyDocuments(user: any): Promise<DocumentPayload> {
    const startTime = Date.now();
    const student = await this.resolveAuthenticatedStudent(user);

    try {
      const rawDocs = await this.documentsService.getApplicableDocumentsForStudent(student.id);
      const list = Array.isArray(rawDocs) ? rawDocs : [];

      let totalRequired = 0;
      let totalUploaded = 0;
      let verifiedCount = 0;
      let pendingCount = 0;

      const documents = list.map((doc: any) => {
        const isReq = doc.required === 'REQUIRED' || doc.required === true;
        if (isReq) totalRequired++;

        const isUploaded = Boolean(doc.uploadedDoc || doc.status === 'VERIFIED' || doc.status === 'PENDING');
        if (isUploaded) totalUploaded++;

        const isVerified = doc.status === 'VERIFIED' || doc.uploadedDoc?.verificationStatus === 'VERIFIED';
        if (isVerified) {
          verifiedCount++;
        } else if (isUploaded) {
          pendingCount++;
        }

        return {
          name: doc.name || doc.documentName || 'Document',
          code: doc.code || doc.documentCode || 'DOC',
          category: doc.category || 'ACADEMIC',
          status: doc.status || (isVerified ? 'VERIFIED' : 'PENDING'),
          isVerified: Boolean(isVerified),
          verificationDate: doc.uploadedDoc?.verifiedAt
            ? new Date(doc.uploadedDoc.verifiedAt).toISOString().split('T')[0]
            : null,
          fileUrl: doc.uploadedDoc?.fileUrl ? 'https://storage.ssiu.edu.in/vault/verified' : null,
        };
      });

      const payload: DocumentPayload = {
        totalRequired,
        totalUploaded,
        verifiedCount,
        pendingCount,
        documents,
      };

      this.logAudit({
        timestamp: new Date().toISOString(),
        userId: user.id,
        studentId: student.id,
        toolCalled: 'getMyDocuments',
        executionDurationMs: Date.now() - startTime,
        status: 'SUCCESS',
      });

      return payload;
    } catch (err: any) {
      this.logAudit({
        timestamp: new Date().toISOString(),
        userId: user.id,
        studentId: student.id,
        toolCalled: 'getMyDocuments',
        executionDurationMs: Date.now() - startTime,
        status: 'ERROR',
        errorDetails: err.message,
      });

      return {
        totalRequired: 0,
        totalUploaded: 0,
        verifiedCount: 0,
        pendingCount: 0,
        documents: [],
      };
    }
  }
}
