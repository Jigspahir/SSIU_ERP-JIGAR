// ==============================================================================
// SWARRNIM UNIVERSITY ERP — STUDENT SECTION & OFFICIAL SERVICES SERVICE
// ==============================================================================

import { db } from './db';
import { 
  StudentSectionService, StudentSectionRequest, StudentSectionDocument,
  StudentSectionRequestStatus, StudentSectionPaymentStatus, StudentSectionTimelineItem
} from '../types/studentSection';
import { User, UserRole, FeePaymentTransaction, PaymentMode } from '../types';

export class StudentSectionServiceEngine {
  private static instance: StudentSectionServiceEngine;

  private constructor() {}

  public static getInstance(): StudentSectionServiceEngine {
    if (!StudentSectionServiceEngine.instance) {
      StudentSectionServiceEngine.instance = new StudentSectionServiceEngine();
    }
    return StudentSectionServiceEngine.instance;
  }

  // ============================================================================
  // 1. SERVICE CATALOG MASTERS
  // ============================================================================

  public getServices(onlyActive = true): StudentSectionService[] {
    const services = db.getState().studentSectionServices || [];
    if (onlyActive) {
      return services.filter((s: StudentSectionService) => s.isActive);
    }
    return services;
  }

  public getServiceById(id: string): StudentSectionService | undefined {
    return (db.getState().studentSectionServices || []).find((s: StudentSectionService) => s.id === id);
  }

  public saveService(service: StudentSectionService): void {
    db.updateState(state => {
      const services = [...(state.studentSectionServices || [])];
      const index = services.findIndex(s => s.id === service.id);
      if (index >= 0) {
        services[index] = service;
      } else {
        services.push(service);
      }
      state.studentSectionServices = services;
    }, `Saved Student Section Service: ${service.name}`);
  }

  // ============================================================================
  // 2. REQUEST CREATION & ELIGIBILITY
  // ============================================================================

  public createRequest(
    params: {
      serviceId: string;
      purpose: string;
      copies?: number;
      isUrgent?: boolean;
      deliveryMode?: 'DIGITAL' | 'PHYSICAL' | 'BOTH';
      deliveryAddress?: string;
      attachments?: { name: string; url: string; uploadedAt: string }[];
    },
    user: User
  ): StudentSectionRequest {
    const service = this.getServiceById(params.serviceId);
    if (!service) {
      throw new Error('Requested service does not exist in master catalog.');
    }
    if (!service.isActive) {
      throw new Error('This service is currently disabled by the university administration.');
    }

    const students = db.getStudents();
    const student = students.find(s => s.id === user.id || s.email === user.email || s.enrollmentNo === user.enrollmentNo);
    if (!student) {
      throw new Error('Student profile not found. Request creation aborted.');
    }

    const departments = db.getDepartments();
    const programs = db.getPrograms();
    const deptObj = departments.find(d => d.id === student.departmentId);
    const progObj = programs.find(p => p.id === student.programId);

    const copies = Math.max(1, params.copies || 1);
    const isUrgent = Boolean(params.isUrgent);
    const calculatedFee = (service.fee * copies) + (isUrgent ? service.urgentFee : 0);

    const now = new Date().toISOString();
    const count = (db.getState().studentSectionRequests || []).length + 1;
    const requestNo = `SSR/${new Date().getFullYear()}/${String(count).padStart(6, '0')}`;

    const requiresPayment = calculatedFee > 0;
    const initialStatus: StudentSectionRequestStatus = requiresPayment ? 'PAYMENT_PENDING' : 'UNDER_REVIEW';
    const paymentStatus: StudentSectionPaymentStatus = requiresPayment ? 'PENDING' : 'NOT_REQUIRED';

    const timeline: StudentSectionTimelineItem[] = [
      {
        id: `tl-${Date.now()}-1`,
        action: 'REQUEST_SUBMITTED',
        fromUserId: user.id,
        fromUserName: user.name,
        fromUserRole: 'STUDENT',
        timestamp: now,
        remarks: `Student submitted application for ${service.name} (${copies} ${copies > 1 ? 'copies' : 'copy'}${isUrgent ? ', URGENT' : ''}). Purpose: ${params.purpose}. Calculated Fee: ₹${calculatedFee}.`,
        status: initialStatus
      }
    ];

    if (requiresPayment) {
      timeline.push({
        id: `tl-${Date.now()}-2`,
        action: 'PAYMENT_PENDING',
        fromUserId: 'SYSTEM',
        fromUserName: 'ERP Financial System',
        fromUserRole: 'ACCOUNTS_ADMIN',
        timestamp: now,
        remarks: `Fee of ₹${calculatedFee} is required before application processing. Please complete payment online.`,
        status: 'PAYMENT_PENDING'
      });
    }

    const newRequest: StudentSectionRequest = {
      id: `ssr-${Date.now()}`,
      requestNo,
      studentId: student.id,
      studentName: student.name,
      enrollmentNo: student.enrollmentNo,
      email: student.email,
      phone: student.phone,
      departmentId: student.departmentId || '',
      departmentName: deptObj?.name || 'Department of Computer Science & Engineering',
      programId: student.programId,
      programName: progObj?.name || 'B.Tech Computer Science & Engineering',
      semesterId: student.semesterId,
      semesterName: 'Semester 4',

      serviceId: service.id,
      serviceCode: service.code,
      serviceName: service.name,
      category: service.category,
      purpose: params.purpose.trim(),
      copies,
      isUrgent,

      calculatedFee,
      paymentStatus,

      deliveryMode: params.deliveryMode || service.deliveryMode || 'BOTH',
      deliveryAddress: params.deliveryAddress,
      attachments: params.attachments || [],

      status: initialStatus,
      timeline,
      createdAt: now,
      updatedAt: now
    };

    db.updateState(state => {
      state.studentSectionRequests = [newRequest, ...(state.studentSectionRequests || [])];
    }, `Created Student Section Request ${requestNo}`);

    // System Notification to Student Section Officer
    db.addNotification({
      title: `New Service Request: ${requestNo}`,
      message: `${student.name} (${student.enrollmentNo}) applied for ${service.name}. Status: ${initialStatus}.`,
      module: 'REQUEST',
      timestamp: now,
      targetRole: 'STUDENT_SECTION',
      linkTab: 'student-section'
    });

    return newRequest;
  }

  // ============================================================================
  // 3. FEE PAYMENT & OFFICIAL RECEIPT GENERATION
  // ============================================================================

  public processPayment(
    requestId: string,
    params: {
      paymentMode: PaymentMode;
      gatewayTxId?: string;
      shouldSucceed?: boolean;
    },
    user: User
  ): { success: boolean; receiptNo?: string; error?: string } {
    const request = this.getRequestById(requestId);
    if (!request) throw new Error('Service request not found.');

    if (request.paymentStatus === 'PAID') {
      throw new Error('This service application has already been paid for.');
    }

    const now = new Date().toISOString();
    const shouldSucceed = params.shouldSucceed !== false;

    if (!shouldSucceed) {
      // Payment Failure handling (Prompt rule 17: remain PAYMENT_PENDING, no receipt, allow retry)
      request.paymentStatus = 'FAILED';
      request.status = 'PAYMENT_PENDING';
      request.updatedAt = now;

      request.timeline.push({
        id: `tl-${Date.now()}`,
        action: 'PAYMENT_FAILED',
        fromUserId: user.id,
        fromUserName: user.name,
        fromUserRole: user.role,
        timestamp: now,
        remarks: `Payment attempt of ₹${request.calculatedFee} via ${params.paymentMode} failed. Status remains PAYMENT_PENDING. Please retry.`,
        status: 'PAYMENT_PENDING'
      });

      this.saveRequest(request);

      return {
        success: false,
        error: 'Payment transaction could not be processed by gateway. Status remains PAYMENT_PENDING. You can safely retry.'
      };
    }

    // Successful payment path:
    const txId = params.gatewayTxId || `TXN-SSR-${Date.now()}`;
    const year = new Date().getFullYear();
    const receiptCount = (db.getFeePaymentTransactions() || []).length + 1;
    const receiptNo = `SSIU/REC/${year}-${String(year + 1).slice(-2)}/${String(receiptCount).padStart(6, '0')}`;

    // Record official Accounts transaction
    const newTx: FeePaymentTransaction = {
      id: `tx-ssr-${Date.now()}`,
      studentFeeRecordId: `ssr-fee-${request.id}`,
      receiptNo,
      studentId: request.studentId,
      studentName: request.studentName,
      enrollmentNo: request.enrollmentNo,
      programId: request.programId,
      semesterId: request.semesterId || 'sem-4',
      paidAmount: request.calculatedFee,
      paymentMode: params.paymentMode,
      transactionId: txId,
      feeType: 'OTHER',
      status: 'SUCCESS',
      paymentDate: now.split('T')[0],
      remarks: `Official Fee Payment for Student Section Service: ${request.serviceName} (${request.requestNo})`,
      recordedBy: `${user.name} (${user.role})`
    };

    db.updateState(state => {
      state.feePaymentTransactions = [newTx, ...(state.feePaymentTransactions || [])];
    }, `Recorded service payment receipt ${receiptNo}`);

    // Update request state
    request.paymentStatus = 'PAID';
    request.status = 'UNDER_REVIEW';
    request.paymentTransactionId = newTx.id;
    request.receiptNo = receiptNo;
    request.paidAt = now;
    request.updatedAt = now;

    request.timeline.push({
      id: `tl-${Date.now()}`,
      action: 'PAYMENT_COMPLETED',
      fromUserId: user.id,
      fromUserName: user.name,
      fromUserRole: user.role,
      timestamp: now,
      remarks: `Paid ₹${request.calculatedFee} via ${params.paymentMode}. Receipt generated: ${receiptNo}. Transaction Ref: ${txId}. Request is now UNDER REVIEW.`,
      status: 'UNDER_REVIEW'
    });

    this.saveRequest(request);

    // Notify Student Section Staff
    db.addNotification({
      title: `Service Payment Received: ${request.requestNo}`,
      message: `Fee of ₹${request.calculatedFee} paid by ${request.studentName} for ${request.serviceName}. Ready for staff verification.`,
      module: 'REQUEST',
      timestamp: now,
      targetRole: 'STUDENT_SECTION',
      linkTab: 'student-section'
    });

    return {
      success: true,
      receiptNo
    };
  }

  // ============================================================================
  // 4. REQUEST LIFECYCLE & STATUS ACTIONS
  // ============================================================================

  public updateRequestStatus(
    requestId: string,
    params: {
      status: StudentSectionRequestStatus;
      remarks?: string;
      rejectionReason?: string;
      trackingNumber?: string;
    },
    staffUser: User
  ): StudentSectionRequest {
    const request = this.getRequestById(requestId);
    if (!request) throw new Error('Service request not found.');

    const now = new Date().toISOString();
    const oldStatus = request.status;
    const newStatus = params.status;

    if (newStatus === 'REJECTED' && !params.rejectionReason?.trim()) {
      throw new Error('Mandatory rejection reason must be provided when rejecting a student service application.');
    }

    request.status = newStatus;
    request.assignedStaffId = staffUser.id;
    request.assignedStaffName = staffUser.name;
    request.updatedAt = now;

    if (params.remarks) request.remarks = params.remarks.trim();
    if (params.rejectionReason) request.rejectionReason = params.rejectionReason.trim();
    if (params.trackingNumber) {
      request.trackingNumber = params.trackingNumber.trim();
      request.dispatchedAt = now;
    }

    request.timeline.push({
      id: `tl-${Date.now()}`,
      action: `STATUS_CHANGED_${newStatus}`,
      fromUserId: staffUser.id,
      fromUserName: staffUser.name,
      fromUserRole: staffUser.role,
      toUserId: request.studentId,
      toUserName: request.studentName,
      toUserRole: 'STUDENT',
      timestamp: now,
      remarks: params.rejectionReason || params.remarks || `Status changed from ${oldStatus} to ${newStatus} by ${staffUser.name}.`,
      status: newStatus
    });

    this.saveRequest(request);

    // Notify Student
    db.addNotification({
      title: `Service Request Update: ${request.requestNo}`,
      message: `Your application for ${request.serviceName} has been updated to ${newStatus}. ${params.rejectionReason || params.remarks || ''}`,
      module: 'REQUEST',
      timestamp: now,
      targetUserId: request.studentId,
      linkTab: 'certificates'
    });

    return request;
  }

  // ============================================================================
  // 5. OFFICIAL DOCUMENT GENERATION (SEAL & VERIFICATION CODE)
  // ============================================================================

  public generateOfficialDocument(
    requestId: string,
    staffUser: User
  ): { document: StudentSectionDocument; request: StudentSectionRequest } {
    const request = this.getRequestById(requestId);
    if (!request) throw new Error('Service request not found.');

    if (request.paymentStatus !== 'PAID' && request.calculatedFee > 0) {
      throw new Error('Cannot generate official document before service fee clearance.');
    }

    const now = new Date().toISOString();
    const year = new Date().getFullYear();
    const docCount = (db.getState().studentSectionDocuments || []).length + 1;
    const documentNo = `SSIU/DOC/${year}/${String(docCount).padStart(6, '0')}`;
    const verificationCode = `SSIU-VERIFY-${Math.random().toString(36).substring(2, 9).toUpperCase()}-${year}`;

    const newDoc: StudentSectionDocument = {
      id: `doc-ssr-${Date.now()}`,
      documentNo,
      requestId: request.id,
      requestNo: request.requestNo,
      studentId: request.studentId,
      studentName: request.studentName,
      enrollmentNo: request.enrollmentNo,
      departmentName: request.departmentName,
      programName: request.programName,
      serviceName: request.serviceName,
      title: `Official ${request.serviceName} - ${request.studentName}`,
      fileUrl: `https://erp.swarrnim.edu.in/vault/documents/${documentNo.replace(/\//g, '_')}.pdf`,
      fileType: 'PDF',
      generatedBy: staffUser.id,
      generatedByName: `${staffUser.name} (${staffUser.role})`,
      generatedAt: now,
      version: 1,
      verificationCode,
      status: 'ACTIVE',
      downloadsCount: 0
    };

    db.updateState(state => {
      state.studentSectionDocuments = [newDoc, ...(state.studentSectionDocuments || [])];
    }, `Generated official document ${documentNo}`);

    // Link document to request & transition to READY
    request.documentId = newDoc.id;
    request.documentNo = newDoc.documentNo;
    request.documentUrl = newDoc.fileUrl;
    request.documentIssuedAt = now;
    request.status = 'READY';
    request.updatedAt = now;

    request.timeline.push({
      id: `tl-${Date.now()}`,
      action: 'DOCUMENT_GENERATED',
      fromUserId: staffUser.id,
      fromUserName: staffUser.name,
      fromUserRole: staffUser.role,
      toUserId: request.studentId,
      toUserName: request.studentName,
      toUserRole: 'STUDENT',
      timestamp: now,
      remarks: `Official digital document ${documentNo} generated and issued. Verification Code: ${verificationCode}. Available for student download.`,
      status: 'READY'
    });

    this.saveRequest(request);

    // Notify Student
    db.addNotification({
      title: `Document Issued: ${request.serviceName}`,
      message: `Your official ${request.serviceName} (${documentNo}) is ready for download in your Student Section Document Vault.`,
      module: 'REQUEST',
      timestamp: now,
      targetUserId: request.studentId,
      linkTab: 'certificates'
    });

    return { document: newDoc, request };
  }

  // ============================================================================
  // 6. SCOPED ACCESS CONTROL (STUDENT PRIVACY RULES)
  // ============================================================================

  public getScopedRequests(user?: User | null, role?: UserRole | null): StudentSectionRequest[] {
    const all = db.getState().studentSectionRequests || [];
    if (!user) return [];

    if (role === 'STUDENT') {
      return all.filter((r: StudentSectionRequest) => r.studentId === user.id || r.enrollmentNo === user.enrollmentNo || r.email === user.email);
    }

    if (role === 'STUDENT_SECTION' || role === 'SUPER_ADMIN' || role === 'REGISTRAR' || role === 'PRINCIPAL') {
      return all;
    }

    if (role === 'HOD') {
      return all.filter((r: StudentSectionRequest) => r.departmentId === user.departmentId);
    }

    return [];
  }

  public getScopedDocuments(user?: User | null, role?: UserRole | null): StudentSectionDocument[] {
    const all = db.getState().studentSectionDocuments || [];
    if (!user) return [];

    if (role === 'STUDENT') {
      return all.filter((d: StudentSectionDocument) => d.studentId === user.id || d.enrollmentNo === user.enrollmentNo);
    }

    return all;
  }

  public getRequestById(id: string): StudentSectionRequest | undefined {
    return (db.getState().studentSectionRequests || []).find((r: StudentSectionRequest) => r.id === id);
  }

  private saveRequest(request: StudentSectionRequest): void {
    db.updateState(state => {
      const requests = [...(state.studentSectionRequests || [])];
      const index = requests.findIndex(r => r.id === request.id);
      if (index >= 0) {
        requests[index] = request;
      } else {
        requests.unshift(request);
      }
      state.studentSectionRequests = requests;
    }, `Updated Student Section Request ${request.requestNo}`);
  }
}

export const studentSectionService = StudentSectionServiceEngine.getInstance();
