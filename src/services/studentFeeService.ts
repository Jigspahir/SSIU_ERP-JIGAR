// ==============================================================================
// SWARRNIM STARTUP & INNOVATION UNIVERSITY — STUDENT FEE & PAYMENT SERVICE
// ==============================================================================

import { db } from './db';
import { 
  Student, 
  StudentFeeRecord, 
  FeePaymentTransaction, 
  User, 
  UserRole 
} from '../types';

export interface StudentFeeSummary {
  totalFees: number;
  feesToBeCollected: number;
  previouslyPaid: number;
  totalPaid: number;
  outstandingAmount: number;
  refundAmount: number;
  totalRecordsCount: number;
  totalTransactionsCount: number;
}

export interface SemesterFeeRow {
  id: string;
  semesterId: string;
  semesterName: string;
  academicYear: string;
  feeStructureName: string;
  feeType: string;
  tuitionFee: number;
  labFee: number;
  developmentFee: number;
  hostelFee: number;
  examFee: number;
  totalFee: number;
  previouslyPaid: number;
  currentPaid: number;
  refunded: number;
  outstanding: number;
  status: string;
  dueDate: string;
}

export interface FeeHistoryFilterOptions {
  search?: string;
  semesterId?: string;
  academicYear?: string;
  status?: string;
  feeType?: string;
  paymentMode?: string;
  startDate?: string;
  endDate?: string;
}

export class StudentFeeService {
  private static instance: StudentFeeService;

  private constructor() {}

  public static getInstance(): StudentFeeService {
    if (!StudentFeeService.instance) {
      StudentFeeService.instance = new StudentFeeService();
    }
    return StudentFeeService.instance;
  }

  /**
   * Helper: Convert Number to Indian Currency Words
   * Example: 75000 -> "Rupees Seventy Five Thousand Only"
   */
  public numberToWords(amount: number): string {
    if (isNaN(amount) || amount === 0) return 'Rupees Zero Only';

    const units = [
      '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
      'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
      'Seventeen', 'Eighteen', 'Nineteen'
    ];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    const numToWordsLessThanThousand = (n: number): string => {
      let str = '';
      if (n >= 100) {
        str += units[Math.floor(n / 100)] + ' Hundred ';
        n %= 100;
      }
      if (n >= 20) {
        str += tens[Math.floor(n / 10)] + ' ';
        n %= 10;
      }
      if (n > 0) {
        str += units[n] + ' ';
      }
      return str.trim();
    };

    let n = Math.floor(Math.abs(amount));
    let words = '';

    const crore = Math.floor(n / 10000000);
    n %= 10000000;
    const lakh = Math.floor(n / 100000);
    n %= 100000;
    const thousand = Math.floor(n / 1000);
    n %= 1000;
    const remainder = n;

    if (crore > 0) {
      words += numToWordsLessThanThousand(crore) + ' Crore ';
    }
    if (lakh > 0) {
      words += numToWordsLessThanThousand(lakh) + ' Lakh ';
    }
    if (thousand > 0) {
      words += numToWordsLessThanThousand(thousand) + ' Thousand ';
    }
    if (remainder > 0) {
      words += numToWordsLessThanThousand(remainder);
    }

    return `Rupees ${words.trim()} Only`;
  }

  /**
   * 1. GET STUDENT FEE DASHBOARD SUMMARY METRICS
   */
  public calculateStudentFeeSummary(studentId: string): StudentFeeSummary {
    const allRecords = db.getStudentFeeRecords().filter(r => r.studentId === studentId);
    const allTxs = db.getFeePaymentTransactions().filter(t => t.studentId === studentId);

    let totalFees = 0;
    let totalPaid = 0;
    let feesToBeCollected = 0;
    let refundAmount = 0;

    // Calculate total from fee records
    allRecords.forEach(r => {
      totalFees += r.totalAmount || 0;
      totalPaid += r.paidAmount || 0;
      feesToBeCollected += r.pendingAmount || 0;
      if (r.refundedAmount) {
        refundAmount += r.refundedAmount;
      }
    });

    // Calculate refunds from transactions if any extra
    allTxs.forEach(tx => {
      if (tx.status === 'REFUNDED' && tx.refundAmount) {
        // ensure refund is accounted
      }
    });

    // Previously paid is total paid minus current semester's paid
    // Or sum of fully cleared prior records
    let previouslyPaid = 0;
    if (allRecords.length > 1) {
      const priorRecords = allRecords.slice(0, -1);
      previouslyPaid = priorRecords.reduce((sum, r) => sum + (r.paidAmount || 0), 0);
    }

    return {
      totalFees,
      feesToBeCollected,
      previouslyPaid,
      totalPaid,
      outstandingAmount: feesToBeCollected,
      refundAmount,
      totalRecordsCount: allRecords.length,
      totalTransactionsCount: allTxs.length
    };
  }

  /**
   * 2. GET SEMESTER-WISE FEE BREAKDOWN DETAILS
   */
  public getSemesterFeeDetails(studentId: string, filters?: { semesterId?: string; academicYear?: string }): SemesterFeeRow[] {
    let records = db.getStudentFeeRecords().filter(r => r.studentId === studentId);

    if (filters?.semesterId && filters.semesterId !== 'ALL') {
      records = records.filter(r => r.semesterId === filters.semesterId);
    }
    if (filters?.academicYear && filters.academicYear !== 'ALL') {
      records = records.filter(r => r.academicYearCode === filters.academicYear || r.academicYearId === filters.academicYear);
    }

    return records.map((r, idx) => {
      const sem = db.getSemesterById(r.semesterId);
      const semName = r.semesterName || sem?.code || (sem ? `Semester ${sem.number}` : `Semester ${idx + 1}`);
      const feeStruct = db.getFeeStructures().find(f => f.id === r.feeStructureId);

      return {
        id: r.id,
        semesterId: r.semesterId,
        semesterName: semName,
        academicYear: r.academicYearCode || '2024-2025',
        feeStructureName: r.feeStructureName || feeStruct?.name || 'Standard Tuition Fee Structure',
        feeType: r.feeType || 'TUITION & ACADEMIC',
        tuitionFee: r.tuitionFee || 0,
        labFee: r.labFee || 0,
        developmentFee: r.developmentFee || 0,
        hostelFee: r.hostelFee || 0,
        examFee: r.examFee || 0,
        totalFee: r.totalAmount || 0,
        previouslyPaid: r.previouslyPaid !== undefined ? r.previouslyPaid : 0,
        currentPaid: r.currentPaid !== undefined ? r.currentPaid : r.paidAmount,
        refunded: r.refundedAmount || 0,
        outstanding: r.pendingAmount || 0,
        status: r.status,
        dueDate: r.dueDate || '2025-03-31'
      };
    });
  }

  /**
   * 3. GET PAYMENT HISTORY & TRANSACTIONS (FILTERABLE)
   */
  public getStudentPaymentHistory(
    studentId: string,
    filters?: FeeHistoryFilterOptions
  ): FeePaymentTransaction[] {
    let txs = db.getFeePaymentTransactions().filter(t => t.studentId === studentId);

    // Filter by search query
    if (filters?.search?.trim()) {
      const q = filters.search.toLowerCase().trim();
      txs = txs.filter(t => 
        t.receiptNo.toLowerCase().includes(q) ||
        t.transactionId.toLowerCase().includes(q) ||
        (t.referenceNo && t.referenceNo.toLowerCase().includes(q)) ||
        (t.bankName && t.bankName.toLowerCase().includes(q)) ||
        (t.gatewayName && t.gatewayName.toLowerCase().includes(q)) ||
        (t.remarks && t.remarks.toLowerCase().includes(q))
      );
    }

    // Filter by Semester
    if (filters?.semesterId && filters.semesterId !== 'ALL') {
      txs = txs.filter(t => t.semesterId === filters.semesterId);
    }

    // Filter by Academic Year
    if (filters?.academicYear && filters.academicYear !== 'ALL') {
      txs = txs.filter(t => t.academicYear === filters.academicYear);
    }

    // Filter by Status
    if (filters?.status && filters.status !== 'ALL') {
      txs = txs.filter(t => (t.status || 'SUCCESS') === filters.status);
    }

    // Filter by Fee Type
    if (filters?.feeType && filters.feeType !== 'ALL') {
      txs = txs.filter(t => t.feeType === filters.feeType);
    }

    // Filter by Payment Mode
    if (filters?.paymentMode && filters.paymentMode !== 'ALL') {
      txs = txs.filter(t => t.paymentMode === filters.paymentMode);
    }

    // Filter by Date Range
    if (filters?.startDate) {
      txs = txs.filter(t => t.paymentDate >= filters.startDate!);
    }
    if (filters?.endDate) {
      txs = txs.filter(t => t.paymentDate <= filters.endDate!);
    }

    // Sort descending by payment date
    return txs.sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());
  }

  /**
   * 4. LOG RECEIPT DOWNLOAD / PRINT AUDIT
   */
  public logReceiptActivity(
    action: 'VIEW' | 'PRINT' | 'DOWNLOAD',
    receiptNo: string,
    studentName: string,
    actingUser?: User | null,
    userRole?: UserRole | null
  ) {
    db.logAudit(
      `FEE_RECEIPT_${action}`,
      'FeePaymentTransaction',
      `User ${actingUser?.name || 'Student'} (${userRole || 'STUDENT'}) ${action.toLowerCase()}ed official fee receipt ${receiptNo} for ${studentName}.`,
      actingUser?.name || 'Student User',
      userRole || 'STUDENT',
      {
        recordId: receiptNo,
        module: 'FINANCE_FEES'
      }
    );
  }
}

export const studentFeeService = StudentFeeService.getInstance();
