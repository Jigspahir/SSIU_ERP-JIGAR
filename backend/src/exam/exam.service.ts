import { Injectable, NotFoundException, BadRequestException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateExamTypeDto,
  CreateExamDto,
  CreateExamFormWindowDto,
  SubmitExamFormDto,
  CreateExamScheduleDto,
  EnterResultDto,
} from './dto/exam.dto';

@Injectable()
export class ExamService {
  constructor(private readonly prisma: PrismaService) {}

  // Helper: Generate unique numbers
  private generateNumber(prefix: string) {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}-2026-${timestamp}${random}`;
  }

  // ── ExamType ────────────────────────────────────────────────────────────────

  async createExamType(dto: CreateExamTypeDto) {
    const existing = await this.prisma.examType.findUnique({ where: { code: dto.code.toUpperCase() } });
    if (existing) throw new ConflictException(`ExamType code '${dto.code}' already exists.`);
    return this.prisma.examType.create({
      data: { code: dto.code.toUpperCase(), name: dto.name, description: dto.description },
    });
  }

  async getExamTypes() {
    return this.prisma.examType.findMany({ where: { status: 'ACTIVE' }, orderBy: { name: 'asc' } });
  }

  // ── Exam ────────────────────────────────────────────────────────────────────

  async createExam(dto: CreateExamDto, userId: string) {
    const existing = await this.prisma.exam.findUnique({ where: { code: dto.code.toUpperCase() } });
    if (existing) throw new ConflictException(`Exam code '${dto.code}' already exists.`);
    const [examType, program] = await Promise.all([
      this.prisma.examType.findUnique({ where: { id: dto.examTypeId } }),
      this.prisma.program.findUnique({ where: { id: dto.programId } }),
    ]);
    if (!examType) throw new NotFoundException('ExamType not found.');
    if (!program) throw new NotFoundException('Program not found.');
    return this.prisma.exam.create({
      data: {
        code: dto.code.toUpperCase(),
        name: dto.name,
        examTypeId: dto.examTypeId,
        programId: dto.programId,
        academicYearCode: dto.academicYearCode,
        semesterNumber: dto.semesterNumber,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        createdByUserId: userId,
      },
      include: { examType: true, program: true },
    });
  }

  async getExams(programId?: string, status?: string) {
    return this.prisma.exam.findMany({
      where: {
        ...(programId ? { programId } : {}),
        ...(status ? { status } : {}),
      },
      include: { examType: true, program: true, _count: { select: { examForms: true, schedules: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getExamById(id: string) {
    const exam = await this.prisma.exam.findUnique({
      where: { id },
      include: {
        examType: true,
        program: true,
        formWindows: true,
        schedules: { include: { subject: true } },
        _count: { select: { examForms: true } },
      },
    });
    if (!exam) throw new NotFoundException('Exam not found.');
    return exam;
  }

  async updateExamStatus(id: string, status: string) {
    const exam = await this.prisma.exam.findUnique({ where: { id } });
    if (!exam) throw new NotFoundException('Exam not found.');
    return this.prisma.exam.update({ where: { id }, data: { status } });
  }

  // ── Exam Form Window ─────────────────────────────────────────────────────────

  async createFormWindow(dto: CreateExamFormWindowDto) {
    const exam = await this.prisma.exam.findUnique({ where: { id: dto.examId } });
    if (!exam) throw new NotFoundException('Exam not found.');
    return this.prisma.examFormWindow.create({
      data: {
        examId: dto.examId,
        windowOpen: new Date(dto.windowOpen),
        windowClose: new Date(dto.windowClose),
        lateWindowClose: dto.lateWindowClose ? new Date(dto.lateWindowClose) : undefined,
        examFee: dto.examFee ?? 0,
        lateFee: dto.lateFee ?? 0,
        maxAttempts: dto.maxAttempts ?? 1,
      },
    });
  }

  async getActiveFormWindows() {
    const now = new Date();
    return this.prisma.examFormWindow.findMany({
      where: {
        status: 'ACTIVE',
        windowOpen: { lte: now },
        OR: [{ lateWindowClose: { gte: now } }, { windowClose: { gte: now } }],
      },
      include: { exam: { include: { program: true, examType: true } } },
    });
  }

  // ── Exam Forms & Submissions ──────────────────────────────────────────────────

  async submitExamForm(dto: SubmitExamFormDto, studentUserId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: studentUserId }, include: { student: true } });
    if (!user?.student) throw new NotFoundException('Student profile not found for user.');

    const window = await this.prisma.examFormWindow.findUnique({
      where: { id: dto.examFormWindowId },
      include: { exam: true },
    });
    if (!window || window.status !== 'ACTIVE') {
      throw new BadRequestException('Exam form window is not active.');
    }

    const now = new Date();
    const isRegular = now <= new Date(window.windowClose);
    const isLate = window.lateWindowClose && now <= new Date(window.lateWindowClose);
    if (!isRegular && !isLate) {
      throw new BadRequestException('Exam form window has closed.');
    }

    const totalFee = isLate ? Number(window.examFee) + Number(window.lateFee) : Number(window.examFee);

    return this.prisma.examForm.create({
      data: {
        examId: window.examId,
        examFormWindowId: window.id,
        studentId: user.student.id,
        semesterId: dto.semesterId,
        attemptNumber: dto.attemptNumber ?? 1,
        status: 'SUBMITTED',
        submittedAt: now,
        totalFee,
        feePaid: totalFee === 0,
        remarks: dto.remarks,
      },
      include: { exam: true, student: true, semester: true },
    });
  }

  async getExamForms(examId?: string, studentId?: string, status?: string) {
    return this.prisma.examForm.findMany({
      where: {
        ...(examId ? { examId } : {}),
        ...(studentId ? { studentId } : {}),
        ...(status ? { status } : {}),
      },
      include: {
        exam: { include: { program: true, examType: true } },
        student: true,
        semester: true,
        results: true,
      },
      orderBy: { submittedAt: 'desc' },
    });
  }

  async approveExamForm(id: string, feePaid: boolean) {
    const form = await this.prisma.examForm.findUnique({ where: { id } });
    if (!form) throw new NotFoundException('Exam form not found.');

    return this.prisma.examForm.update({
      where: { id },
      data: {
        status: 'APPROVED',
        feePaid: feePaid ?? form.feePaid,
      },
    });
  }

  // ── Official Hall Ticket Generation ──────────────────────────────────────────

  async generateHallTicket(examFormId: string) {
    const form = await this.prisma.examForm.findUnique({
      where: { id: examFormId },
      include: {
        student: { include: { institute: true, department: true } },
        exam: { include: { schedules: { include: { subject: true } } } },
      },
    });
    if (!form) throw new NotFoundException('Exam form not found.');
    if (form.status !== 'APPROVED') {
      throw new BadRequestException('Exam form must be APPROVED before Hall Ticket can be generated.');
    }
    if (!form.feePaid && Number(form.totalFee) > 0) {
      throw new BadRequestException('Exam fee must be paid before Hall Ticket issuance.');
    }

    const hallTicketNo = this.generateNumber('HT');
    const verificationCode = `VER-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    return this.prisma.hallTicket.create({
      data: {
        hallTicketNo,
        examId: form.examId,
        studentId: form.studentId,
        examSessionName: form.exam.name,
        verificationCode,
        status: 'ISSUED',
        qrData: `SSIU|${hallTicketNo}|${form.student.enrollmentNo}|${form.exam.code}`,
        downloadUrl: `/hall-tickets/${hallTicketNo}.pdf`,
      },
      include: { student: true },
    });
  }

  async getHallTickets(studentUserId?: string) {
    let studentId: string | undefined;
    if (studentUserId) {
      const user = await this.prisma.user.findUnique({ where: { id: studentUserId }, include: { student: true } });
      if (user?.student) studentId = user.student.id;
    }

    return this.prisma.hallTicket.findMany({
      where: { ...(studentId ? { studentId } : {}) },
      include: { student: true },
      orderBy: { issueDate: 'desc' },
    });
  }

  // ── Exam Centres & Rooms ──────────────────────────────────────────────────────

  async getExamCentres() {
    let centres = await this.prisma.examCentre.findMany({
      include: { rooms: true },
      orderBy: { name: 'asc' },
    });

    if (centres.length === 0) {
      const defaultCentre = await this.prisma.examCentre.create({
        data: {
          code: 'CENTRE-MAIN',
          name: 'SSIU Main Campus Examination Centre',
          building: 'Academic Block A & B',
          address: 'Swarrnim University Campus, Gandhinagar',
          capacity: 600,
          status: 'ACTIVE',
          rooms: {
            create: [
              { roomNumber: 'ROOM-101', floor: 1, capacity: 40, hasCCTV: true },
              { roomNumber: 'ROOM-102', floor: 1, capacity: 40, hasCCTV: true },
              { roomNumber: 'ROOM-201', floor: 2, capacity: 60, hasCCTV: true },
              { roomNumber: 'ROOM-202', floor: 2, capacity: 60, hasCCTV: true },
            ],
          },
        },
        include: { rooms: true },
      });
      centres = [defaultCentre];
    }
    return centres;
  }

  async createExamCentre(data: { code: string; name: string; building: string; capacity?: number }) {
    return this.prisma.examCentre.create({
      data: {
        code: data.code.toUpperCase(),
        name: data.name,
        building: data.building,
        capacity: data.capacity ?? 500,
        status: 'ACTIVE',
      },
    });
  }

  // ── Invigilator Assignments & Exam Attendance ────────────────────────────────

  async assignInvigilator(data: { examScheduleId: string; roomId: string; facultyUserId: string; dutyDate: string; reportingTime: string }) {
    return this.prisma.invigilatorAssignment.create({
      data: {
        examScheduleId: data.examScheduleId,
        roomId: data.roomId,
        facultyUserId: data.facultyUserId,
        dutyDate: new Date(data.dutyDate),
        reportingTime: data.reportingTime,
        status: 'ASSIGNED',
      },
      include: { room: true },
    });
  }

  async recordExamAttendance(data: { examScheduleId: string; studentId: string; status: string; answerSheetNo?: string; markedByUserId?: string }) {
    return this.prisma.examAttendance.upsert({
      where: { examScheduleId_studentId: { examScheduleId: data.examScheduleId, studentId: data.studentId } },
      create: {
        examScheduleId: data.examScheduleId,
        studentId: data.studentId,
        status: data.status.toUpperCase(),
        answerSheetNo: data.answerSheetNo,
        markedByUserId: data.markedByUserId,
      },
      update: {
        status: data.status.toUpperCase(),
        answerSheetNo: data.answerSheetNo,
        markedByUserId: data.markedByUserId,
      },
    });
  }

  // ── Schedules ─────────────────────────────────────────────────────────────────

  async createSchedule(dto: CreateExamScheduleDto) {
    const [exam, subject, semester] = await Promise.all([
      this.prisma.exam.findUnique({ where: { id: dto.examId } }),
      this.prisma.subject.findUnique({ where: { id: dto.subjectId } }),
      this.prisma.semester.findUnique({ where: { id: dto.semesterId } }),
    ]);
    if (!exam) throw new NotFoundException('Exam not found.');
    if (!subject) throw new NotFoundException('Subject not found.');
    if (!semester) throw new NotFoundException('Semester not found.');

    const existing = await this.prisma.examSchedule.findFirst({
      where: { examId: dto.examId, subjectId: dto.subjectId },
    });
    if (existing) throw new ConflictException('Schedule for this subject already exists in this exam.');

    return this.prisma.examSchedule.create({
      data: {
        examId: dto.examId,
        subjectId: dto.subjectId,
        semesterId: dto.semesterId,
        examDate: new Date(dto.examDate),
        startTime: dto.startTime,
        endTime: dto.endTime,
        venue: dto.venue,
        invigilator: dto.invigilator,
      },
      include: { subject: true, semester: true },
    });
  }

  async getSchedules(examId: string) {
    return this.prisma.examSchedule.findMany({
      where: { examId },
      include: { subject: true, semester: true },
      orderBy: { examDate: 'asc' },
    });
  }

  // ── Exam Results & SGPA/CGPA Calculation ──────────────────────────────────────

  async enterResult(dto: EnterResultDto, enteredByUserId: string) {
    const form = await this.prisma.examForm.findUnique({ where: { id: dto.examFormId } });
    if (!form) throw new NotFoundException('Exam form not found.');
    if (!['SUBMITTED', 'APPROVED'].includes(form.status)) {
      throw new BadRequestException('Exam form is not in a valid state for result entry.');
    }

    const isPassed = dto.isAbsent ? false :
      dto.marksObtained !== undefined && dto.maxMarks !== undefined
        ? Number(dto.marksObtained) >= Number(dto.maxMarks) * 0.4
        : undefined;

    return this.prisma.examResult.upsert({
      where: { examFormId_subjectId: { examFormId: dto.examFormId, subjectId: dto.subjectId } },
      create: {
        examFormId: dto.examFormId,
        studentId: form.studentId,
        subjectId: dto.subjectId,
        examScheduleId: dto.examScheduleId,
        marksObtained: dto.marksObtained,
        maxMarks: dto.maxMarks ?? 100,
        grade: dto.grade || (isPassed ? 'B' : 'F'),
        isPassed,
        isAbsent: dto.isAbsent ?? false,
        resultStatus: 'PENDING',
        enteredByUserId,
      },
      update: {
        marksObtained: dto.marksObtained,
        maxMarks: dto.maxMarks ?? 100,
        grade: dto.grade || (isPassed ? 'B' : 'F'),
        isPassed,
        isAbsent: dto.isAbsent ?? false,
        enteredByUserId,
      },
    });
  }

  async calculateAndPublishResults(examId: string) {
    const exam = await this.prisma.exam.findUnique({ where: { id: examId } });
    if (!exam) throw new NotFoundException('Exam not found.');

    const forms = await this.prisma.examForm.findMany({
      where: { examId, status: 'APPROVED' },
      include: { results: { include: { subject: true } } },
    });

    return this.prisma.$transaction(async (tx) => {
      for (const form of forms) {
        let totalMarks = 0;
        let maxMarks = 0;
        let totalCredits = 0;
        let earnedCredits = 0;
        let totalGradePoints = 0;
        let backlogs = 0;

        for (const res of form.results) {
          const mObt = Number(res.marksObtained || 0);
          const mMax = Number(res.maxMarks || 100);
          const credits = Number(res.subject?.credits || 4);

          totalMarks += mObt;
          maxMarks += mMax;
          totalCredits += credits;

          if (res.isPassed) {
            earnedCredits += credits;
            const gp = (mObt / mMax) * 10;
            totalGradePoints += gp * credits;
          } else {
            backlogs += 1;
          }
        }

        const sgpa = totalCredits > 0 ? (totalGradePoints / totalCredits) : 0;
        const percentage = maxMarks > 0 ? (totalMarks / maxMarks) * 100 : 0;
        const resultStatus = backlogs === 0 ? 'PASS' : backlogs <= 2 ? 'ATKT' : 'FAIL';
        const marksheetNo = this.generateNumber('MS');

        await tx.resultSummary.upsert({
          where: { studentId_examId: { studentId: form.studentId, examId } },
          create: {
            studentId: form.studentId,
            examId,
            semesterNumber: exam.semesterNumber,
            totalCredits,
            earnedCredits,
            totalMarks,
            maxMarks,
            percentage,
            sgpa,
            cgpa: sgpa,
            backlogsCount: backlogs,
            resultStatus,
            isPublished: true,
            publishedAt: new Date(),
            marksheetNo,
          },
          update: {
            totalCredits,
            earnedCredits,
            totalMarks,
            maxMarks,
            percentage,
            sgpa,
            cgpa: sgpa,
            backlogsCount: backlogs,
            resultStatus,
            isPublished: true,
            publishedAt: new Date(),
          },
        });
      }

      await tx.examResult.updateMany({
        where: { examForm: { examId } },
        data: { resultStatus: 'DECLARED', publishedAt: new Date() },
      });

      await tx.exam.update({ where: { id: examId }, data: { status: 'COMPLETED' } });

      return { message: 'Results calculated, locked and published successfully.', examId };
    });
  }

  async getStudentResults(studentUserId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: studentUserId }, include: { student: true } });
    if (!user?.student) return [];

    const [results, summaries] = await Promise.all([
      this.prisma.examResult.findMany({
        where: { studentId: user.student.id, resultStatus: 'DECLARED' },
        include: { subject: true, examForm: { include: { exam: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.resultSummary.findMany({
        where: { studentId: user.student.id, isPublished: true },
        orderBy: { semesterNumber: 'asc' },
      }),
    ]);

    return { results, summaries };
  }

  // ── Revaluation / Rechecking ──────────────────────────────────────────────────

  async applyRevaluation(data: { examResultId: string; subjectId: string; requestType?: string; remarks?: string }, studentUserId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: studentUserId }, include: { student: true } });
    if (!user?.student) throw new NotFoundException('Student profile not found.');

    const result = await this.prisma.examResult.findUnique({ where: { id: data.examResultId } });
    if (!result) throw new NotFoundException('Exam result record not found.');

    const requestNo = this.generateNumber('REV');

    return this.prisma.revaluationRequest.create({
      data: {
        requestNo,
        studentId: user.student.id,
        examResultId: data.examResultId,
        subjectId: data.subjectId,
        requestType: data.requestType || 'REVALUATION',
        originalMarks: result.marksObtained || 0,
        feeAmount: 500,
        isFeePaid: true,
        status: 'SUBMITTED',
        remarks: data.remarks,
      },
      include: { student: true },
    });
  }

  async getRevaluations() {
    return this.prisma.revaluationRequest.findMany({
      include: { student: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getExamDashboardMetrics() {
    const [totalExams, activeExams, totalForms, totalResults, hallTicketsCount] = await Promise.all([
      this.prisma.exam.count(),
      this.prisma.exam.count({ where: { status: 'ACTIVE' } }),
      this.prisma.examForm.count(),
      this.prisma.examResult.count(),
      this.prisma.hallTicket.count(),
    ]);
    return { totalExams, activeExams, totalForms, totalResults, hallTicketsCount };
  }
}
