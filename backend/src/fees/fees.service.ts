import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateFeeHeadDto,
  CreateFeeStructureDto,
  CreateStudentFeeAccountDto,
  RecordPaymentDto,
  ApplyDiscountDto,
  CreateRefundDto,
} from './dto/fees.dto';

@Injectable()
export class FeesService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Fee Heads ─────────────────────────────────────────────────────────────────

  async createFeeHead(dto: CreateFeeHeadDto) {
    const existing = await this.prisma.feeHead.findUnique({ where: { code: dto.code.toUpperCase() } });
    if (existing) throw new ConflictException(`Fee head code '${dto.code}' already exists.`);
    return this.prisma.feeHead.create({
      data: {
        code: dto.code.toUpperCase(),
        name: dto.name,
        description: dto.description,
        isOptional: dto.isOptional ?? false,
      },
    });
  }

  async getFeeHeads() {
    return this.prisma.feeHead.findMany({ where: { status: 'ACTIVE' }, orderBy: { name: 'asc' } });
  }

  // ── Fee Structure ─────────────────────────────────────────────────────────────

  async createFeeStructure(dto: CreateFeeStructureDto) {
    const existing = await this.prisma.feeStructure.findFirst({
      where: { programId: dto.programId, semesterId: dto.semesterId, academicYearCode: dto.academicYearCode },
    });
    if (existing) throw new ConflictException('Fee structure already exists for this program/semester/year.');

    const totalAmount = dto.items.reduce((sum, i) => sum + i.amount, 0);

    return this.prisma.feeStructure.create({
      data: {
        programId: dto.programId,
        semesterId: dto.semesterId,
        academicYearCode: dto.academicYearCode,
        name: dto.name,
        totalAmount,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        items: {
          create: dto.items.map((item) => ({
            feeHeadId: item.feeHeadId,
            amount: item.amount,
            isOptional: item.isOptional ?? false,
          })),
        },
      },
      include: { items: { include: { feeHead: true } }, program: true, semester: true },
    });
  }

  async getFeeStructures(programId?: string) {
    return this.prisma.feeStructure.findMany({
      where: { ...(programId ? { programId } : {}), status: 'ACTIVE' },
      include: { items: { include: { feeHead: true } }, program: true, semester: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getFeeStructureById(id: string) {
    const fs = await this.prisma.feeStructure.findUnique({
      where: { id },
      include: { items: { include: { feeHead: true } }, program: true, semester: true },
    });
    if (!fs) throw new NotFoundException('Fee structure not found.');
    return fs;
  }

  // ── Student Fee Account ───────────────────────────────────────────────────────

  async createStudentFeeAccount(dto: CreateStudentFeeAccountDto) {
    const existing = await this.prisma.studentFeeAccount.findFirst({
      where: { studentId: dto.studentId, feeStructureId: dto.feeStructureId },
    });
    if (existing) throw new ConflictException('Fee account already exists for this student/fee-structure.');

    const feeStructure = await this.prisma.feeStructure.findUnique({ where: { id: dto.feeStructureId } });
    if (!feeStructure) throw new NotFoundException('Fee structure not found.');

    const totalDue = Number(feeStructure.totalAmount);
    return this.prisma.studentFeeAccount.create({
      data: {
        studentId: dto.studentId,
        feeStructureId: dto.feeStructureId,
        academicYearCode: dto.academicYearCode,
        totalDue,
        totalPaid: 0,
        totalDiscount: 0,
        balanceDue: totalDue,
        status: 'UNPAID',
      },
      include: { student: true, feeStructure: { include: { items: { include: { feeHead: true } } } } },
    });
  }

  async getStudentFeeAccount(studentId: string) {
    return this.prisma.studentFeeAccount.findMany({
      where: { studentId },
      include: {
        feeStructure: { include: { items: { include: { feeHead: true } }, semester: true } },
        payments: { orderBy: { paymentDate: 'desc' } },
        discounts: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getMyFeeAccount(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, include: { student: true } });
    if (!user?.student) throw new BadRequestException('Only students can view their fee accounts.');
    return this.getStudentFeeAccount(user.student.id);
  }

  async getAllFeeAccounts(status?: string) {
    return this.prisma.studentFeeAccount.findMany({
      where: { ...(status ? { status } : {}) },
      include: { student: true, feeStructure: true },
      orderBy: { updatedAt: 'desc' },
    });
  }

  // ── Payment Recording ─────────────────────────────────────────────────────────

  private async generateReceiptNo(): Promise<string> {
    const count = await this.prisma.feePayment.count();
    const seq = String(count + 1).padStart(6, '0');
    const year = new Date().getFullYear();
    return `FEE-${year}-${seq}`;
  }

  async recordPayment(dto: RecordPaymentDto, collectedByUserId: string) {
    const account = await this.prisma.studentFeeAccount.findUnique({ where: { id: dto.feeAccountId } });
    if (!account) throw new NotFoundException('Student fee account not found.');
    if (Number(account.balanceDue) <= 0) throw new BadRequestException('No outstanding balance for this account.');
    if (dto.amount > Number(account.balanceDue)) {
      throw new BadRequestException(`Payment amount exceeds balance due (${account.balanceDue}).`);
    }

    const receiptNo = await this.generateReceiptNo();
    const newTotalPaid = Number(account.totalPaid) + dto.amount;
    const newBalance = Number(account.balanceDue) - dto.amount;
    const newStatus = newBalance <= 0 ? 'PAID' : newBalance < Number(account.totalDue) ? 'PARTIAL' : 'UNPAID';

    return this.prisma.$transaction(async (tx) => {
      const payment = await tx.feePayment.create({
        data: {
          receiptNo,
          feeAccountId: dto.feeAccountId,
          amount: dto.amount,
          paymentMode: dto.paymentMode,
          transactionRef: dto.transactionRef,
          collectedByUserId,
          remarks: dto.remarks,
          status: 'CONFIRMED',
          items: dto.items?.length
            ? { create: dto.items.map((i) => ({ feeHeadId: i.feeHeadId, amount: i.amount })) }
            : undefined,
        },
        include: { items: true },
      });

      await tx.studentFeeAccount.update({
        where: { id: dto.feeAccountId },
        data: { totalPaid: newTotalPaid, balanceDue: newBalance, status: newStatus },
      });

      return payment;
    });
  }

  async getPaymentHistory(feeAccountId: string) {
    return this.prisma.feePayment.findMany({
      where: { feeAccountId },
      include: { items: { include: { feeHead: true } } },
      orderBy: { paymentDate: 'desc' },
    });
  }

  // ── Discounts ─────────────────────────────────────────────────────────────────

  async applyDiscount(dto: ApplyDiscountDto, approvedByUserId: string) {
    const account = await this.prisma.studentFeeAccount.findUnique({ where: { id: dto.feeAccountId } });
    if (!account) throw new NotFoundException('Student fee account not found.');
    if (dto.amount > Number(account.balanceDue)) {
      throw new BadRequestException('Discount amount exceeds balance due.');
    }

    return this.prisma.$transaction(async (tx) => {
      const discount = await tx.feeDiscount.create({
        data: {
          feeAccountId: dto.feeAccountId,
          discountType: dto.discountType,
          description: dto.description,
          amount: dto.amount,
          approvedByUserId,
        },
      });

      const newDiscount = Number(account.totalDiscount) + dto.amount;
      const newBalance = Number(account.balanceDue) - dto.amount;
      const newStatus = newBalance <= 0 ? 'WAIVED' : 'PARTIAL';

      await tx.studentFeeAccount.update({
        where: { id: dto.feeAccountId },
        data: { totalDiscount: newDiscount, balanceDue: newBalance, status: newStatus },
      });

      return discount;
    });
  }

  // ── Refunds ───────────────────────────────────────────────────────────────────

  async createRefund(dto: CreateRefundDto) {
    const account = await this.prisma.studentFeeAccount.findUnique({ where: { id: dto.feeAccountId } });
    if (!account) throw new NotFoundException('Student fee account not found.');
    const payment = await this.prisma.feePayment.findUnique({ where: { id: dto.paymentId } });
    if (!payment) throw new NotFoundException('Payment record not found.');
    if (dto.refundAmount > Number(payment.amount)) throw new BadRequestException('Refund exceeds payment amount.');

    return this.prisma.feeRefund.create({
      data: {
        feeAccountId: dto.feeAccountId,
        paymentId: dto.paymentId,
        refundAmount: dto.refundAmount,
        reason: dto.reason,
        refundMode: dto.refundMode ?? 'ONLINE',
      },
    });
  }

  // ── Reports ───────────────────────────────────────────────────────────────────

  async getDuesReport() {
    const overdueAccounts = await this.prisma.studentFeeAccount.findMany({
      where: { status: { in: ['UNPAID', 'PARTIAL', 'OVERDUE'] } },
      include: { student: true, feeStructure: { include: { program: true } } },
      orderBy: { balanceDue: 'desc' },
    });
    const totalDue = overdueAccounts.reduce((sum, a) => sum + Number(a.balanceDue), 0);
    return { totalAccountsWithDues: overdueAccounts.length, totalDueAmount: totalDue, accounts: overdueAccounts };
  }
}
