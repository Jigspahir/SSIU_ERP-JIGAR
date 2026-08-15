import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StudentServicesService {
  constructor(private readonly prisma: PrismaService) {}

  // Helper: Generate unique Request / Certificate Numbers
  private generateNumber(prefix: string) {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}-2026-${timestamp}${random}`;
  }

  // ── 1. Service Catalog ───────────────────────────────────────────────────

  async getServiceCatalog() {
    let services = await this.prisma.studentService.findMany({
      where: { isActive: true },
      include: { requirements: true },
      orderBy: { name: 'asc' },
    });

    if (services.length === 0) {
      // Seed default student services if empty
      const defaultCatalog = [
        { code: 'BONAFIDE', name: 'Bonafide Certificate', category: 'CERTIFICATE', expectedDays: 2, responsibleRoleCode: 'STUDENT_SECTION' },
        { code: 'CHARACTER_CERT', name: 'Character Certificate', category: 'CERTIFICATE', expectedDays: 3, responsibleRoleCode: 'STUDENT_SECTION' },
        { code: 'TRANSCRIPT', name: 'Official Transcript Request', category: 'ACADEMIC', expectedDays: 7, feeAmount: 500, responsibleRoleCode: 'EXAM_SECTION' },
        { code: 'MIGRATION', name: 'Migration Certificate', category: 'CERTIFICATE', expectedDays: 5, feeAmount: 250, responsibleRoleCode: 'STUDENT_SECTION' },
        { code: 'TRANSFER_CERT', name: 'Transfer Certificate (TC)', category: 'CERTIFICATE', expectedDays: 5, responsibleRoleCode: 'STUDENT_SECTION' },
        { code: 'DUPLICATE_ID', name: 'Duplicate Student ID Card', category: 'ADMINISTRATIVE', expectedDays: 3, feeAmount: 200, responsibleRoleCode: 'STUDENT_SECTION' },
        { code: 'FEE_RECEIPT', name: 'Duplicate Fee Receipt / Ledger', category: 'FINANCE', expectedDays: 2, responsibleRoleCode: 'FINANCE_OFFICER' },
        { code: 'NO_DUES', name: 'No Dues Clearance Certificate', category: 'ADMINISTRATIVE', expectedDays: 4, responsibleRoleCode: 'STUDENT_SECTION' },
        { code: 'INTERNSHIP_LETTER', name: 'Internship NOC / Permission Letter', category: 'ACADEMIC', expectedDays: 3, responsibleRoleCode: 'HOD' },
        { code: 'SCHOLARSHIP_REQ', name: 'Scholarship / Financial Aid Endorsement', category: 'FINANCE', expectedDays: 4, responsibleRoleCode: 'STUDENT_SECTION' },
        { code: 'HOSTEL_REQ', name: 'Hostel Room Change / Request', category: 'HOSTEL', expectedDays: 3, responsibleRoleCode: 'HOSTEL_WARDEN' },
        { code: 'TRANSPORT_REQ', name: 'Bus Route Change Request', category: 'TRANSPORT', expectedDays: 3, responsibleRoleCode: 'TRANSPORT_MANAGER' },
      ];

      for (const s of defaultCatalog) {
        await this.prisma.studentService.upsert({
          where: { code: s.code },
          create: s,
          update: {},
        });
      }

      services = await this.prisma.studentService.findMany({
        where: { isActive: true },
        include: { requirements: true },
        orderBy: { name: 'asc' },
      });
    }

    return services;
  }

  // ── 2. Student Service Request Creation ──────────────────────────────────

  async createServiceRequest(userId: string, data: {
    serviceId: string;
    purpose?: string;
    remarks?: string;
    documents?: { name: string; documentUrl: string; fileType?: string; fileSize?: number }[];
  }) {
    // 1. Resolve Student profile
    const student = await this.prisma.student.findFirst({
      where: { OR: [{ erpId: userId }, { email: userId }, { id: userId }] },
    });
    if (!student) {
      throw new NotFoundException('Student profile not found for this account.');
    }

    const service = await this.prisma.studentService.findUnique({ where: { id: data.serviceId } });
    if (!service) throw new NotFoundException('Service not found.');

    const requestNo = this.generateNumber('REQ');
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + (service.expectedDays || 3));

    return this.prisma.$transaction(async (tx) => {
      const req = await tx.studentServiceRequest.create({
        data: {
          requestNo,
          studentId: student.id,
          serviceId: service.id,
          status: 'SUBMITTED',
          currentStage: 'SUBMITTED',
          currentAuthorityRole: service.responsibleRoleCode,
          purpose: data.purpose,
          remarks: data.remarks,
          dueDate,
          documents: {
            create: (data.documents || []).map((doc) => ({
              name: doc.name,
              documentUrl: doc.documentUrl,
              fileType: doc.fileType,
              fileSize: doc.fileSize,
            })),
          },
        },
        include: { documents: true, service: true },
      });

      return req;
    });
  }

  // ── 3. Query Service Requests ────────────────────────────────────────────

  async getStudentRequests(userId: string, isStudentRole: boolean) {
    let studentId: string | undefined;
    if (isStudentRole) {
      const student = await this.prisma.student.findFirst({
        where: { OR: [{ erpId: userId }, { email: userId }, { id: userId }] },
      });
      if (!student) return [];
      studentId = student.id;
    }

    return this.prisma.studentServiceRequest.findMany({
      where: {
        ...(studentId ? { studentId } : {}),
      },
      include: {
        service: true,
        student: { select: { id: true, erpId: true, enrollmentNo: true, firstName: true, lastName: true } },
        documents: true,
        certificates: true,
      },
      orderBy: { submissionDate: 'desc' },
    });
  }

  async getRequestById(id: string, userId: string, isStudentRole: boolean) {
    const request = await this.prisma.studentServiceRequest.findUnique({
      where: { id },
      include: {
        service: { include: { requirements: true } },
        student: { include: { institute: true, department: true, batch: true } },
        documents: true,
        certificates: true,
      },
    });
    if (!request) throw new NotFoundException('Service request not found.');

    if (isStudentRole) {
      const student = await this.prisma.student.findFirst({
        where: { OR: [{ erpId: userId }, { email: userId }, { id: userId }] },
      });
      if (!student || student.id !== request.studentId) {
        throw new ForbiddenException('You are not authorized to view this request.');
      }
    }

    return request;
  }

  async cancelRequest(id: string, userId: string) {
    const student = await this.prisma.student.findFirst({
      where: { OR: [{ erpId: userId }, { email: userId }, { id: userId }] },
    });
    if (!student) throw new NotFoundException('Student not found.');

    const request = await this.prisma.studentServiceRequest.findUnique({ where: { id } });
    if (!request) throw new NotFoundException('Request not found.');
    if (request.studentId !== student.id) throw new ForbiddenException('Cannot cancel request belonging to another student.');
    if (request.status !== 'SUBMITTED' && request.status !== 'UNDER_VERIFICATION') {
      throw new BadRequestException('Request is already being processed or completed.');
    }

    return this.prisma.studentServiceRequest.update({
      where: { id },
      data: { status: 'CANCELLED', currentStage: 'CANCELLED' },
    });
  }

  // ── 4. Digital Certificate Generation & Public Verification ──────────────

  async generateCertificate(requestId: string, signatoryTitle?: string) {
    const request = await this.prisma.studentServiceRequest.findUnique({
      where: { id: requestId },
      include: { student: { include: { institute: true, department: true } }, service: true },
    });
    if (!request) throw new NotFoundException('Service request not found.');

    const certNo = this.generateNumber('CERT');
    const verificationHash = `HASH-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    return this.prisma.$transaction(async (tx) => {
      const cert = await tx.certificate.create({
        data: {
          certificateNumber: certNo,
          requestId: request.id,
          studentId: request.studentId,
          serviceId: request.serviceId,
          certificateType: request.service.code,
          title: `${request.service.name} - ${request.student.firstName} ${request.student.lastName}`,
          status: 'VALID',
          signatoryTitle: signatoryTitle || 'Registrar / Authorized Signatory',
          verificationHash,
          certificateUrl: `/certificates/${certNo}.pdf`,
        },
      });

      await tx.studentServiceRequest.update({
        where: { id: requestId },
        data: { status: 'COMPLETED', currentStage: 'COMPLETED', completedAt: new Date() },
      });

      return cert;
    });
  }

  async getCertificates(userId: string, isStudentRole: boolean) {
    let studentId: string | undefined;
    if (isStudentRole) {
      const student = await this.prisma.student.findFirst({
        where: { OR: [{ erpId: userId }, { email: userId }, { id: userId }] },
      });
      if (!student) return [];
      studentId = student.id;
    }

    return this.prisma.certificate.findMany({
      where: {
        ...(studentId ? { studentId } : {}),
      },
      include: {
        student: { select: { id: true, erpId: true, enrollmentNo: true, firstName: true, lastName: true } },
        service: true,
      },
      orderBy: { issueDate: 'desc' },
    });
  }

  async verifyCertificate(certificateNumberOrHash: string) {
    const cert = await this.prisma.certificate.findFirst({
      where: {
        OR: [{ certificateNumber: certificateNumberOrHash }, { verificationHash: certificateNumberOrHash }],
      },
      include: {
        student: {
          select: {
            enrollmentNo: true,
            firstName: true,
            lastName: true,
            institute: { select: { name: true } },
            department: { select: { name: true } },
          },
        },
        service: { select: { name: true, code: true } },
      },
    });

    if (!cert) {
      return {
        isValid: false,
        message: 'Certificate record not found or invalid certificate number.',
      };
    }

    // Return strictly non-private public verification record
    return {
      isValid: cert.status === 'VALID',
      certificateNumber: cert.certificateNumber,
      title: cert.title,
      serviceName: cert.service?.name,
      studentName: `${cert.student.firstName} ${cert.student.lastName}`,
      enrollmentNo: cert.student.enrollmentNo,
      institute: cert.student.institute?.name,
      department: cert.student.department?.name,
      issueDate: cert.issueDate,
      validUntil: cert.validUntil,
      status: cert.status,
      signatory: cert.signatoryTitle,
      verificationHash: cert.verificationHash,
    };
  }
}
