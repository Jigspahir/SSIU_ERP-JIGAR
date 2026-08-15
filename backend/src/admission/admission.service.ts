import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AdmissionService {
  constructor(private readonly prisma: PrismaService) {}

  // Helper: Generate unique application/inquiry numbers
  private generateNumber(prefix: string) {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}-2026-${timestamp}${random}`;
  }

  // ── 1. Admission Cycles ───────────────────────────────────────────────────

  async getAdmissionCycles() {
    let cycles = await this.prisma.admissionCycle.findMany({
      orderBy: { startDate: 'desc' },
    });

    if (cycles.length === 0) {
      // Seed default admission cycle if empty
      const defaultCycle = await this.prisma.admissionCycle.create({
        data: {
          code: 'ADM-2026-REGULAR',
          academicYearCode: '2026-27',
          name: 'Academic Year 2026-27 Regular Admissions',
          admissionType: 'REGULAR',
          startDate: new Date('2026-04-01'),
          endDate: new Date('2026-09-30'),
          applicationFee: 500,
          status: 'ACTIVE',
        },
      });
      cycles = [defaultCycle];
    }
    return cycles;
  }

  async createAdmissionCycle(data: {
    code: string;
    academicYearCode?: string;
    name: string;
    admissionType?: string;
    startDate: string;
    endDate: string;
    applicationFee?: number;
  }) {
    return this.prisma.admissionCycle.create({
      data: {
        code: data.code.toUpperCase(),
        academicYearCode: data.academicYearCode || '2026-27',
        name: data.name,
        admissionType: data.admissionType || 'REGULAR',
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        applicationFee: data.applicationFee ?? 500,
        status: 'ACTIVE',
      },
    });
  }

  // ── 2. Leads & Inquiries ──────────────────────────────────────────────────

  async createInquiry(data: {
    applicantName: string;
    mobile: string;
    email?: string;
    city?: string;
    state?: string;
    interestedInstituteId?: string;
    interestedProgramId?: string;
    source?: string;
    counsellorUserId?: string;
    nextFollowUpDate?: string;
    remarks?: string;
  }) {
    const inqNo = this.generateNumber('INQ');

    return this.prisma.admissionInquiry.create({
      data: {
        inquiryNo: inqNo,
        applicantName: data.applicantName,
        mobile: data.mobile,
        email: data.email,
        city: data.city,
        state: data.state,
        interestedInstituteId: data.interestedInstituteId,
        interestedProgramId: data.interestedProgramId,
        source: data.source || 'WEBSITE',
        counsellorUserId: data.counsellorUserId,
        nextFollowUpDate: data.nextFollowUpDate ? new Date(data.nextFollowUpDate) : undefined,
        remarks: data.remarks,
        status: 'NEW',
      },
    });
  }

  async getInquiries(counsellorUserId?: string, status?: string) {
    return this.prisma.admissionInquiry.findMany({
      where: {
        ...(counsellorUserId ? { counsellorUserId } : {}),
        ...(status ? { status: status.toUpperCase() } : {}),
      },
      include: {
        counsellings: { orderBy: { counsellingDate: 'desc' } },
        applications: { select: { id: true, applicationNo: true, status: true } },
      },
      orderBy: { inquiryDate: 'desc' },
    });
  }

  async recordCounselling(data: {
    inquiryId: string;
    counsellorUserId: string;
    discussionPoints: string;
    applicantNeed?: string;
    nextFollowUpDate?: string;
    remarks?: string;
  }) {
    const inquiry = await this.prisma.admissionInquiry.findUnique({ where: { id: data.inquiryId } });
    if (!inquiry) throw new NotFoundException('Inquiry not found.');

    return this.prisma.$transaction(async (tx) => {
      const record = await tx.counsellingRecord.create({
        data: {
          inquiryId: data.inquiryId,
          counsellorUserId: data.counsellorUserId,
          discussionPoints: data.discussionPoints,
          applicantNeed: data.applicantNeed,
          nextFollowUpDate: data.nextFollowUpDate ? new Date(data.nextFollowUpDate) : undefined,
          remarks: data.remarks,
        },
      });

      await tx.admissionInquiry.update({
        where: { id: data.inquiryId },
        data: {
          status: 'COUNSELLING',
          nextFollowUpDate: data.nextFollowUpDate ? new Date(data.nextFollowUpDate) : inquiry.nextFollowUpDate,
        },
      });

      return record;
    });
  }

  // ── 3. Applications ───────────────────────────────────────────────────────

  async createApplication(data: {
    inquiryId?: string;
    admissionCycleId: string;
    instituteId: string;
    programId: string;
    admissionType?: string;
    firstName: string;
    middleName?: string;
    lastName: string;
    email: string;
    mobile: string;
    gender?: string;
    dateOfBirth?: string;
    category?: string;
    city?: string;
    state?: string;
    address?: string;
    qualifyingExam?: string;
    qualifyingBoard?: string;
    passingYear?: number;
    percentage?: number;
    documents?: { documentType: string; documentUrl: string }[];
  }) {
    const appNo = this.generateNumber('APP');

    return this.prisma.$transaction(async (tx) => {
      const app = await tx.admissionApplication.create({
        data: {
          applicationNo: appNo,
          inquiryId: data.inquiryId,
          admissionCycleId: data.admissionCycleId,
          instituteId: data.instituteId,
          programId: data.programId,
          admissionType: data.admissionType || 'REGULAR',
          firstName: data.firstName,
          middleName: data.middleName,
          lastName: data.lastName,
          email: data.email,
          mobile: data.mobile,
          gender: data.gender,
          dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
          category: data.category || 'GENERAL',
          city: data.city,
          state: data.state,
          address: data.address,
          qualifyingExam: data.qualifyingExam,
          qualifyingBoard: data.qualifyingBoard,
          passingYear: data.passingYear,
          percentage: data.percentage,
          status: 'SUBMITTED',
          documents: {
            create: (data.documents || []).map((doc) => ({
              documentType: doc.documentType,
              documentUrl: doc.documentUrl,
              status: 'UPLOADED',
            })),
          },
        },
        include: { documents: true },
      });

      if (data.inquiryId) {
        await tx.admissionInquiry.update({
          where: { id: data.inquiryId },
          data: { status: 'CONVERTED' },
        });
      }

      return app;
    });
  }

  async getApplications(filters?: { instituteId?: string; programId?: string; status?: string }) {
    return this.prisma.admissionApplication.findMany({
      where: {
        ...(filters?.instituteId ? { instituteId: filters.instituteId } : {}),
        ...(filters?.programId ? { programId: filters.programId } : {}),
        ...(filters?.status ? { status: filters.status.toUpperCase() } : {}),
      },
      include: {
        admissionCycle: true,
        documents: true,
        approvals: true,
        enrollment: true,
      },
      orderBy: { submissionDate: 'desc' },
    });
  }

  async getApplicationById(id: string) {
    const app = await this.prisma.admissionApplication.findUnique({
      where: { id },
      include: {
        admissionCycle: true,
        documents: true,
        eligibilityResults: true,
        approvals: true,
        enrollment: true,
      },
    });
    if (!app) throw new NotFoundException('Application not found.');
    return app;
  }

  async verifyDocument(documentId: string, verifiedByUserId: string, isApproved: boolean, remarks?: string) {
    const doc = await this.prisma.admissionApplicationDocument.findUnique({ where: { id: documentId } });
    if (!doc) throw new NotFoundException('Document not found.');

    return this.prisma.admissionApplicationDocument.update({
      where: { id: documentId },
      data: {
        status: isApproved ? 'VERIFIED' : 'REJECTED',
        verifiedBy: verifiedByUserId,
        remarks,
      },
    });
  }

  async approveApplication(id: string, approverUserId: string, roleCode: string, comments?: string) {
    const app = await this.prisma.admissionApplication.findUnique({ where: { id } });
    if (!app) throw new NotFoundException('Application not found.');

    return this.prisma.$transaction(async (tx) => {
      await tx.admissionApproval.create({
        data: {
          applicationId: id,
          approverRole: roleCode,
          approverUserId,
          status: 'APPROVED',
          comments,
        },
      });

      return tx.admissionApplication.update({
        where: { id },
        data: {
          status: 'APPROVED',
          approvedByUserId: approverUserId,
          approvedAt: new Date(),
        },
      });
    });
  }

  async confirmFeePayment(id: string, feeAmount: number, receiptNo: string) {
    const app = await this.prisma.admissionApplication.findUnique({ where: { id } });
    if (!app) throw new NotFoundException('Application not found.');

    return this.prisma.admissionApplication.update({
      where: { id },
      data: {
        isFeePaid: true,
        feeAmountPaid: feeAmount,
        feeReceiptNo: receiptNo,
        status: 'ADMISSION_CONFIRMED',
      },
    });
  }

  // ── 4. Enrollment & Student Master Creation ──────────────────────────────

  async enrollStudent(applicationId: string, enrolledByUserId: string, batchId?: string, divisionId?: string) {
    const app = await this.prisma.admissionApplication.findUnique({
      where: { id: applicationId },
      include: { enrollment: true },
    });
    if (!app) throw new NotFoundException('Application not found.');
    if (app.enrollment) throw new ConflictException('Student already enrolled for this application.');

    // 1. Resolve Batch & Division if not provided
    let targetBatchId = batchId;
    if (!targetBatchId) {
      const batch = await this.prisma.batch.findFirst({
        where: { programId: app.programId },
        orderBy: { startYear: 'desc' },
      });
      if (batch) targetBatchId = batch.id;
    }

    if (!targetBatchId) {
      // Create fallback batch for this program
      const academicYear = await this.prisma.academicYear.findFirst({ where: { isCurrent: true } }) || 
        await this.prisma.academicYear.findFirst();
      const newBatch = await this.prisma.batch.create({
        data: {
          code: `BATCH-2026-${app.programId.slice(0, 4).toUpperCase()}`,
          programId: app.programId,
          academicYearId: academicYear?.id || '',
          startYear: 2026,
          endYear: 2030,
          status: 'ACTIVE',
        },
      });
      targetBatchId = newBatch.id;
    }

    const enrollmentNo = `2026SSIU${Math.floor(100000 + Math.random() * 900000)}`;
    const erpId = `STU${Math.floor(100000 + Math.random() * 900000)}`;

    return this.prisma.$transaction(async (tx) => {
      // 2. Create Student in Student Master
      const student = await tx.student.create({
        data: {
          erpId,
          enrollmentNo,
          firstName: app.firstName,
          middleName: app.middleName,
          lastName: app.lastName,
          email: app.email,
          phone: app.mobile,
          dateOfBirth: app.dateOfBirth,
          gender: app.gender,
          instituteId: app.instituteId,
          departmentId: (await tx.program.findUnique({ where: { id: app.programId } }))?.departmentId || '',
          batchId: targetBatchId,
          currentDivisionId: divisionId,
          status: 'ACTIVE',
        },
      });

      // 3. Create User Account for Student login
      const passwordHash = await bcrypt.hash('Student@123', 10);
      const studentRole = await tx.role.findUnique({ where: { code: 'STUDENT' } });

      const user = await tx.user.create({
        data: {
          erpId,
          username: enrollmentNo,
          passwordHash,
          accountStatus: 'ACTIVE',
          studentId: student.id,
          userRoles: studentRole ? {
            create: {
              roleId: studentRole.id,
              scopeType: 'OWN',
            },
          } : undefined,
        },
      });

      // 4. Create Enrollment record
      const enrollment = await tx.enrollment.create({
        data: {
          applicationId: app.id,
          studentId: student.id,
          enrollmentNo,
          academicYearCode: '2026-27',
          enrolledBy: enrolledByUserId,
        },
      });

      // 5. Update Application status
      await tx.admissionApplication.update({
        where: { id: app.id },
        data: { status: 'ENROLLED' },
      });

      return {
        enrollment,
        student,
        user: { id: user.id, username: user.username, erpId: user.erpId },
      };
    });
  }

  // ── 5. Reports & Funnel ───────────────────────────────────────────────────

  async getAdmissionDashboardMetrics() {
    const [
      totalInquiries,
      totalApplications,
      underVerification,
      pendingApproval,
      approved,
      rejected,
      feePending,
      confirmed,
      enrolled,
    ] = await Promise.all([
      this.prisma.admissionInquiry.count(),
      this.prisma.admissionApplication.count(),
      this.prisma.admissionApplication.count({ where: { status: 'UNDER_VERIFICATION' } }),
      this.prisma.admissionApplication.count({ where: { status: 'APPROVAL_PENDING' } }),
      this.prisma.admissionApplication.count({ where: { status: 'APPROVED' } }),
      this.prisma.admissionApplication.count({ where: { status: 'REJECTED' } }),
      this.prisma.admissionApplication.count({ where: { status: 'APPROVED', isFeePaid: false } }),
      this.prisma.admissionApplication.count({ where: { status: 'ADMISSION_CONFIRMED' } }),
      this.prisma.admissionApplication.count({ where: { status: 'ENROLLED' } }),
    ]);

    return {
      funnel: {
        totalInquiries,
        totalApplications,
        underVerification,
        pendingApproval,
        approved,
        rejected,
        feePending,
        confirmed,
        enrolled,
      },
    };
  }
}
