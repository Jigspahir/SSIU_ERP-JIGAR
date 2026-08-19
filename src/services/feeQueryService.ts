import { db } from './db';
import { FeeQuery, FeeQueryCategory, FeeQueryTimelineItem, ExamFeeConfigItem } from '../types/feeQuery';
import { User, UserRole, Student } from '../types';

export class FeeQueryServiceEngine {
  private static instance: FeeQueryServiceEngine;

  private constructor() {}

  public static getInstance(): FeeQueryServiceEngine {
    if (!FeeQueryServiceEngine.instance) {
      FeeQueryServiceEngine.instance = new FeeQueryServiceEngine();
    }
    return FeeQueryServiceEngine.instance;
  }

  // ============================================================================
  // 1. STUDENT FEE QUERY SUBMISSION (DIRECT TO ACCOUNTS)
  // ============================================================================

  public createFeeQuery(
    params: {
      category: FeeQueryCategory;
      subject: string;
      description: string;
      priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
      claimedAmount?: number;
      transactionReferenceNo?: string;
      attachmentUrl?: string;
      studentFeeRecordId?: string;
      paymentTransactionId?: string;
    },
    user: User
  ): FeeQuery {
    const student = db.getStudents().find(s => s.id === user.id || s.enrollmentNo === user.enrollmentNo) || {
      id: user.id,
      name: user.name,
      enrollmentNo: user.enrollmentNo || 'ENR-STUDENT',
      email: user.email,
      phone: user.phone || '9876543210',
      departmentId: user.departmentId || 'dept-cse',
      programId: 'prog-btech-cse'
    };

    const departments = db.getDepartments();
    const programs = db.getPrograms();
    const deptObj = departments.find(d => d.id === student.departmentId);
    const progObj = programs.find(p => p.id === student.programId);

    const now = new Date().toISOString();
    const count = (db.getState().feeQueries || []).length + 1;
    const queryNo = `FQ/${new Date().getFullYear()}/${String(count).padStart(6, '0')}`;

    const timeline: FeeQueryTimelineItem[] = [
      {
        id: `tl-${Date.now()}-1`,
        action: 'QUERY_SUBMITTED',
        fromUserId: user.id,
        fromUserName: user.name,
        fromUserRole: 'STUDENT',
        toUserId: 'ACCOUNTS_DESK',
        toUserName: 'Accounts Office Directorate',
        toUserRole: 'ACCOUNTS_ADMIN',
        timestamp: now,
        remarks: `Student submitted fee query regarding ${params.category.replace(/_/g, ' ')}. Priority: ${params.priority || 'MEDIUM'}.`,
        status: 'SUBMITTED'
      }
    ];

    const newQuery: FeeQuery = {
      id: `fq-${Date.now()}`,
      queryNo,
      studentId: student.id,
      studentName: student.name,
      enrollmentNo: student.enrollmentNo,
      email: student.email,
      phone: student.phone,
      departmentId: student.departmentId || '',
      departmentName: deptObj?.name || 'Department of Computer Science & Engineering',
      programId: student.programId,
      programName: progObj?.name || 'B.Tech Computer Science & Engineering',
      category: params.category,
      subject: params.subject.trim(),
      description: params.description.trim(),
      priority: params.priority || 'MEDIUM',
      attachmentUrl: params.attachmentUrl,
      studentFeeRecordId: params.studentFeeRecordId,
      paymentTransactionId: params.paymentTransactionId,
      claimedAmount: params.claimedAmount,
      transactionReferenceNo: params.transactionReferenceNo,
      status: 'SUBMITTED',
      timeline,
      createdAt: now,
      updatedAt: now
    };

    db.updateState(state => {
      state.feeQueries = [newQuery, ...(state.feeQueries || [])];
    }, `Created Fee Query: ${queryNo}`);

    // Direct Notification to Accounts Staff (Section 7 rule: Route directly to Accounts)
    db.addNotification({
      title: `New Fee Query: ${queryNo}`,
      message: `Student ${student.name} submitted query on "${params.subject}" (${params.category.replace(/_/g, ' ')}). Assigned to Accounts.`,
      module: 'FEES',
      timestamp: now,
      targetRole: 'ACCOUNTS_ADMIN',
      linkTab: 'accounts-admin'
    });

    return newQuery;
  }

  // ============================================================================
  // 2. ACCOUNTS REVIEW & RESOLUTION
  // ============================================================================

  public resolveFeeQuery(
    queryId: string,
    params: {
      resolutionSummary: string;
      resolutionRemarks?: string;
      action?: 'RESOLVED' | 'REJECTED' | 'UNDER_REVIEW';
    },
    accountsUser: User
  ): FeeQuery {
    const query = this.getQueryById(queryId);
    if (!query) throw new Error('Fee query record not found.');

    const now = new Date().toISOString();
    const action = params.action || 'RESOLVED';

    query.status = action;
    query.assignedAccountsHandlerId = accountsUser.id;
    query.assignedAccountsHandlerName = accountsUser.name;
    query.resolutionSummary = params.resolutionSummary.trim();
    query.resolutionRemarks = params.resolutionRemarks?.trim() || params.resolutionSummary.trim();
    if (action === 'RESOLVED') {
      query.resolvedAt = now;
    }
    query.updatedAt = now;

    query.timeline.push({
      id: `tl-${Date.now()}`,
      action: `QUERY_${action}`,
      fromUserId: accountsUser.id,
      fromUserName: accountsUser.name,
      fromUserRole: 'ACCOUNTS_ADMIN',
      toUserId: query.studentId,
      toUserName: query.studentName,
      toUserRole: 'STUDENT',
      timestamp: now,
      remarks: params.resolutionRemarks?.trim() || params.resolutionSummary.trim(),
      status: action
    });

    this.saveQuery(query);

    // Notify Student
    db.addNotification({
      title: `Fee Query ${action === 'RESOLVED' ? 'Resolved' : 'Updated'}: ${query.queryNo}`,
      message: `Accounts officer ${accountsUser.name} responded to "${query.subject}": "${params.resolutionSummary}".`,
      module: 'FEES',
      timestamp: now,
      targetUserId: query.studentId,
      linkTab: 'fees'
    });

    return query;
  }

  // ============================================================================
  // 3. EXAM FEE CATEGORY CONFIGURATION
  // ============================================================================

  public getExamFeeConfigs(): ExamFeeConfigItem[] {
    return db.getState().examFeeConfigs || [];
  }

  public saveExamFeeConfig(config: ExamFeeConfigItem): void {
    db.updateState(state => {
      const configs = [...(state.examFeeConfigs || [])];
      const idx = configs.findIndex(c => c.id === config.id || c.category === config.category);
      if (idx >= 0) {
        configs[idx] = config;
      } else {
        configs.push(config);
      }
      state.examFeeConfigs = configs;
    }, `Updated Exam Fee Config: ${config.name}`);
  }

  // ============================================================================
  // 4. SCOPED ACCESS CONTROL
  // ============================================================================

  public getScopedQueries(user?: User | null, role?: UserRole | null): FeeQuery[] {
    const all = db.getState().feeQueries || [];
    if (!user) return [];

    if (role === 'STUDENT') {
      return all.filter((q: FeeQuery) => q.studentId === user.id || q.enrollmentNo === user.enrollmentNo || q.email === user.email);
    }

    if (role === 'ACCOUNTS_ADMIN' || role === 'SUPER_ADMIN' || role === 'REGISTRAR' || role === 'PRINCIPAL') {
      return all;
    }

    if (role === 'HOD') {
      return all.filter((q: FeeQuery) => q.departmentId === user.departmentId);
    }

    return [];
  }

  public getQueryById(id: string): FeeQuery | undefined {
    return (db.getState().feeQueries || []).find((q: FeeQuery) => q.id === id);
  }

  private saveQuery(query: FeeQuery): void {
    db.updateState(state => {
      const queries = [...(state.feeQueries || [])];
      const index = queries.findIndex(q => q.id === query.id);
      if (index >= 0) {
        queries[index] = query;
      } else {
        queries.unshift(query);
      }
      state.feeQueries = queries;
    }, `Updated Fee Query ${query.queryNo}`);
  }
}

export const feeQueryService = FeeQueryServiceEngine.getInstance();
