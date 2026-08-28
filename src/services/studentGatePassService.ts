import { db } from './db';
import { StudentGatePass, GatePassStatus, GatePassAuditEntry } from '../types';

export class StudentGatePassService {
  private static instance: StudentGatePassService;

  private constructor() {
    this.ensureInitialized();
  }

  public static getInstance(): StudentGatePassService {
    if (!StudentGatePassService.instance) {
      StudentGatePassService.instance = new StudentGatePassService();
    }
    return StudentGatePassService.instance;
  }

  private ensureInitialized() {
    const state = db.getState();
    if (!state.studentGatePasses || state.studentGatePasses.length === 0) {
      const students = db.getStudents();
      const hostels = db.getHostels();
      const currentAY = '2026-2027';

      const seedPasses: StudentGatePass[] = [
        {
          id: 'gp-1',
          gatePassNo: 'GP/2026/0001',
          studentId: students[0]?.id || 'stu-1',
          studentName: students[0]?.name || 'Aditya Sharma',
          enrollmentNo: students[0]?.enrollmentNo || '26SSIU001',
          studentPhoto: students[0]?.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          instituteName: 'SSIT - Institute of Technology',
          departmentName: 'Computer Science & Engineering',
          programName: 'B.Tech CSE',
          semester: 4,
          hostelId: hostels[0]?.id || 'hst-1',
          hostelName: hostels[0]?.name || 'Vivekananda Boys Hostel (Block A)',
          roomNo: 'A-204',
          bedNo: 'Bed-1 (Window Side)',
          parentGuardianName: 'Mr. Rameshchandra Sharma',
          parentGuardianMobile: '+91 98250 11223',
          purpose: 'Family Visit',
          destination: 'Gandhinagar Sector 21 (Home)',
          outingDate: '2026-08-24',
          expectedOutTime: '17:30',
          expectedReturnTime: '21:00',
          modeOfTravel: 'Campus Bus / Cab',
          emergencyContact: '+91 98250 11223',
          studentRemarks: 'Visiting family for birthday dinner.',
          status: 'APPROVED',
          approvedBy: 'user-hosteladmin',
          approvedByName: 'Dr. Rajesh Patel (Chief Warden)',
          approvedAt: '2026-08-24T10:15:00Z',
          wardenRemarks: 'Approved. Ensure return before 09:30 PM curfew.',
          qrCodeData: 'SSIU-GP:GP/2026/0001:APPROVED:2026-08-24',
          createdAt: '2026-08-24T08:30:00Z',
          updatedAt: '2026-08-24T10:15:00Z',
          history: [
            {
              id: 'aud-1',
              action: 'SUBMITTED',
              userId: students[0]?.id || 'stu-1',
              userName: students[0]?.name || 'Aditya Sharma',
              userRole: 'STUDENT',
              timestamp: '2026-08-24T08:30:00Z',
              remarks: 'Gate pass requested by student'
            },
            {
              id: 'aud-2',
              action: 'APPROVED',
              userId: 'user-hosteladmin',
              userName: 'Dr. Rajesh Patel',
              userRole: 'HOSTEL_ADMIN',
              timestamp: '2026-08-24T10:15:00Z',
              remarks: 'Approved by Chief Warden'
            }
          ]
        },
        {
          id: 'gp-2',
          gatePassNo: 'GP/2026/0002',
          studentId: students[0]?.id || 'stu-1',
          studentName: students[0]?.name || 'Aditya Sharma',
          enrollmentNo: students[0]?.enrollmentNo || '26SSIU001',
          studentPhoto: students[0]?.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          instituteName: 'SSIT - Institute of Technology',
          departmentName: 'Computer Science & Engineering',
          programName: 'B.Tech CSE',
          semester: 4,
          hostelId: hostels[0]?.id || 'hst-1',
          hostelName: hostels[0]?.name || 'Vivekananda Boys Hostel (Block A)',
          roomNo: 'A-204',
          bedNo: 'Bed-1 (Window Side)',
          parentGuardianName: 'Mr. Rameshchandra Sharma',
          parentGuardianMobile: '+91 98250 11223',
          purpose: 'Medical',
          destination: 'Apollo Clinic, Gandhinagar Highway',
          outingDate: '2026-08-25',
          expectedOutTime: '15:00',
          expectedReturnTime: '18:00',
          modeOfTravel: 'Auto Rickshaw',
          emergencyContact: '+91 98250 11223',
          studentRemarks: 'Dental appointment follow-up checkup.',
          status: 'PENDING',
          qrCodeData: 'SSIU-GP:GP/2026/0002:PENDING:2026-08-25',
          createdAt: '2026-08-24T11:00:00Z',
          updatedAt: '2026-08-24T11:00:00Z',
          history: [
            {
              id: 'aud-3',
              action: 'SUBMITTED',
              userId: students[0]?.id || 'stu-1',
              userName: students[0]?.name || 'Aditya Sharma',
              userRole: 'STUDENT',
              timestamp: '2026-08-24T11:00:00Z',
              remarks: 'Gate pass requested for medical checkup'
            }
          ]
        },
        {
          id: 'gp-3',
          gatePassNo: 'GP/2026/0003',
          studentId: students[0]?.id || 'stu-1',
          studentName: students[0]?.name || 'Aditya Sharma',
          enrollmentNo: students[0]?.enrollmentNo || '26SSIU001',
          studentPhoto: students[0]?.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          instituteName: 'SSIT - Institute of Technology',
          departmentName: 'Computer Science & Engineering',
          programName: 'B.Tech CSE',
          semester: 4,
          hostelId: hostels[0]?.id || 'hst-1',
          hostelName: hostels[0]?.name || 'Vivekananda Boys Hostel (Block A)',
          roomNo: 'A-204',
          bedNo: 'Bed-1 (Window Side)',
          parentGuardianName: 'Mr. Rameshchandra Sharma',
          parentGuardianMobile: '+91 98250 11223',
          purpose: 'Academic',
          destination: 'Gujarat Technological Library, Ahmedabad',
          outingDate: '2026-08-20',
          expectedOutTime: '09:00',
          expectedReturnTime: '17:00',
          modeOfTravel: 'Campus Bus',
          emergencyContact: '+91 98250 11223',
          studentRemarks: 'Reference book collection for final semester project.',
          status: 'RETURNED',
          approvedBy: 'user-hosteladmin',
          approvedByName: 'Dr. Rajesh Patel',
          approvedAt: '2026-08-19T16:00:00Z',
          wardenRemarks: 'Approved for academic library visit.',
          actualOutDateTime: '2026-08-20T09:12:00Z',
          actualOutRecordedByName: 'Officer Vikram Singh (Main Gate)',
          actualInDateTime: '2026-08-20T16:45:00Z',
          actualInRecordedByName: 'Officer Vikram Singh (Main Gate)',
          isLateReturn: false,
          qrCodeData: 'SSIU-GP:GP/2026/0003:RETURNED:2026-08-20',
          createdAt: '2026-08-19T14:00:00Z',
          updatedAt: '2026-08-20T16:45:00Z',
          history: [
            {
              id: 'aud-4',
              action: 'SUBMITTED',
              userId: students[0]?.id || 'stu-1',
              userName: students[0]?.name || 'Aditya Sharma',
              userRole: 'STUDENT',
              timestamp: '2026-08-19T14:00:00Z',
              remarks: 'Request submitted'
            },
            {
              id: 'aud-5',
              action: 'APPROVED',
              userId: 'user-hosteladmin',
              userName: 'Dr. Rajesh Patel',
              userRole: 'HOSTEL_ADMIN',
              timestamp: '2026-08-19T16:00:00Z',
              remarks: 'Approved by Warden'
            },
            {
              id: 'aud-6',
              action: 'OUT_RECORDED',
              userId: 'sec-1',
              userName: 'Officer Vikram Singh',
              userRole: 'SECURITY',
              timestamp: '2026-08-20T09:12:00Z',
              remarks: 'Campus exit verified at Main Gate'
            },
            {
              id: 'aud-7',
              action: 'IN_RECORDED',
              userId: 'sec-1',
              userName: 'Officer Vikram Singh',
              userRole: 'SECURITY',
              timestamp: '2026-08-20T16:45:00Z',
              remarks: 'Campus return verified at Main Gate on-time'
            }
          ]
        }
      ];

      (state as any).studentGatePasses = seedPasses;
      db.saveState();
    }
  }

  public getGatePasses(filters?: {
    studentId?: string;
    enrollmentNo?: string;
    hostelId?: string;
    status?: string;
    search?: string;
  }): StudentGatePass[] {
    this.ensureInitialized();
    const state = db.getState();
    let list: StudentGatePass[] = (state as any).studentGatePasses || [];

    if (filters?.studentId) {
      list = list.filter(g => g.studentId === filters.studentId);
    }
    if (filters?.enrollmentNo) {
      list = list.filter(g => g.enrollmentNo === filters.enrollmentNo);
    }
    if (filters?.hostelId && filters.hostelId !== 'ALL') {
      list = list.filter(g => g.hostelId === filters.hostelId);
    }
    if (filters?.status && filters.status !== 'ALL') {
      list = list.filter(g => g.status === filters.status);
    }
    if (filters?.search && filters.search.trim()) {
      const q = filters.search.toLowerCase();
      list = list.filter(g =>
        g.gatePassNo.toLowerCase().includes(q) ||
        g.studentName.toLowerCase().includes(q) ||
        g.enrollmentNo.toLowerCase().includes(q) ||
        g.destination.toLowerCase().includes(q) ||
        g.purpose.toLowerCase().includes(q)
      );
    }

    return [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getGatePassById(id: string): StudentGatePass | undefined {
    this.ensureInitialized();
    const list = this.getGatePasses();
    return list.find(g => g.id === id || g.gatePassNo === id);
  }

  public createGatePass(data: Partial<StudentGatePass>, user: any): StudentGatePass {
    this.ensureInitialized();
    const state = db.getState();
    const existingList: StudentGatePass[] = (state as any).studentGatePasses || [];

    const nextSeq = existingList.length + 1;
    const gatePassNo = `GP/2026/${String(nextSeq).padStart(4, '0')}`;

    const newPass: StudentGatePass = {
      id: data.id || `gp-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      gatePassNo,
      studentId: data.studentId || user?.id || 'stu-1',
      studentName: data.studentName || user?.name || 'Student',
      enrollmentNo: data.enrollmentNo || user?.enrollmentNo || user?.username || '26SSIU001',
      studentPhoto: data.studentPhoto || (user as any)?.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      instituteId: data.instituteId,
      instituteName: data.instituteName || 'SSIT - Institute of Technology',
      departmentId: data.departmentId,
      departmentName: data.departmentName || 'Computer Science & Engineering',
      programId: data.programId,
      programName: data.programName || 'B.Tech CSE',
      semester: data.semester || 4,
      hostelId: data.hostelId || 'hst-1',
      hostelName: data.hostelName || 'Vivekananda Boys Hostel (Block A)',
      roomNo: data.roomNo || 'A-204',
      bedNo: data.bedNo || 'Bed-1',
      parentGuardianName: data.parentGuardianName || 'Parent',
      parentGuardianMobile: data.parentGuardianMobile || '',
      purpose: data.purpose || 'Personal',
      destination: data.destination || '',
      outingDate: data.outingDate || new Date().toISOString().split('T')[0],
      expectedOutTime: data.expectedOutTime || '17:00',
      expectedReturnTime: data.expectedReturnTime || '20:00',
      modeOfTravel: data.modeOfTravel || 'Public Transport',
      emergencyContact: data.emergencyContact || data.parentGuardianMobile || '',
      studentRemarks: data.studentRemarks || '',
      supportingDocument: data.supportingDocument,
      status: 'PENDING',
      qrCodeData: `SSIU-GP:${gatePassNo}:PENDING:${data.outingDate || new Date().toISOString().split('T')[0]}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      history: [
        {
          id: `aud-${Date.now()}-1`,
          action: 'SUBMITTED',
          userId: user?.id || 'student',
          userName: user?.name || 'Student',
          userRole: user?.role || 'STUDENT',
          timestamp: new Date().toISOString(),
          remarks: 'Gate Pass request submitted by student'
        }
      ]
    };

    (state as any).studentGatePasses = [newPass, ...existingList];
    db.saveState();

    // Trigger Notification
    db.addNotification({
      title: 'Gate Pass Request Submitted',
      message: `Your Gate Pass request ${newPass.gatePassNo} has been submitted for Warden review.`,
      module: 'HOSTEL' as any,
      priority: 'MEDIUM' as any,
      linkTab: 'hostel'
    });

    return newPass;
  }

  public approveGatePass(id: string, wardenRemarks: string, user: any): StudentGatePass {
    this.ensureInitialized();
    const state = db.getState();
    const existingList: StudentGatePass[] = (state as any).studentGatePasses || [];
    const pass = existingList.find(g => g.id === id || g.gatePassNo === id);

    if (!pass) throw new Error('Gate pass not found.');

    pass.status = 'APPROVED';
    pass.approvedBy = user?.id || 'warden-1';
    pass.approvedByName = user?.name || 'Chief Hostel Warden';
    pass.approvedAt = new Date().toISOString();
    pass.wardenRemarks = wardenRemarks?.trim() || 'Approved by Hostel Warden';
    pass.qrCodeData = `SSIU-GP:${pass.gatePassNo}:APPROVED:${pass.outingDate}`;
    pass.updatedAt = new Date().toISOString();

    pass.history.push({
      id: `aud-${Date.now()}`,
      action: 'APPROVED',
      userId: user?.id || 'warden',
      userName: user?.name || 'Warden',
      userRole: user?.role || 'HOSTEL_ADMIN',
      timestamp: new Date().toISOString(),
      remarks: pass.wardenRemarks
    });

    db.saveState();

    // Trigger Student Notification
    db.addNotification({
      title: 'Gate Pass Approved',
      message: `Your Gate Pass ${pass.gatePassNo} has been approved by ${pass.approvedByName}.`,
      module: 'HOSTEL' as any,
      priority: 'HIGH' as any,
      linkTab: 'hostel'
    });

    return pass;
  }

  public rejectGatePass(id: string, rejectedReason: string, user: any): StudentGatePass {
    this.ensureInitialized();
    const state = db.getState();
    const existingList: StudentGatePass[] = (state as any).studentGatePasses || [];
    const pass = existingList.find(g => g.id === id || g.gatePassNo === id);

    if (!pass) throw new Error('Gate pass not found.');
    if (!rejectedReason?.trim()) throw new Error('Rejection reason is mandatory.');

    pass.status = 'REJECTED';
    pass.approvedBy = user?.id || 'warden-1';
    pass.approvedByName = user?.name || 'Chief Hostel Warden';
    pass.approvedAt = new Date().toISOString();
    pass.rejectedReason = rejectedReason.trim();
    pass.qrCodeData = `SSIU-GP:${pass.gatePassNo}:REJECTED:${pass.outingDate}`;
    pass.updatedAt = new Date().toISOString();

    pass.history.push({
      id: `aud-${Date.now()}`,
      action: 'REJECTED',
      userId: user?.id || 'warden',
      userName: user?.name || 'Warden',
      userRole: user?.role || 'HOSTEL_ADMIN',
      timestamp: new Date().toISOString(),
      remarks: `Rejected: ${rejectedReason}`
    });

    db.saveState();

    // Trigger Student Notification
    db.addNotification({
      title: 'Gate Pass Rejected',
      message: `Your Gate Pass request ${pass.gatePassNo} was rejected: ${rejectedReason}.`,
      module: 'HOSTEL' as any,
      priority: 'HIGH' as any,
      linkTab: 'hostel'
    });

    return pass;
  }

  public cancelGatePass(id: string, reason: string, user: any): StudentGatePass {
    this.ensureInitialized();
    const state = db.getState();
    const existingList: StudentGatePass[] = (state as any).studentGatePasses || [];
    const pass = existingList.find(g => g.id === id || g.gatePassNo === id);

    if (!pass) throw new Error('Gate pass not found.');
    if (pass.status !== 'PENDING') throw new Error('Only pending gate pass requests can be cancelled.');

    pass.status = 'CANCELLED';
    pass.updatedAt = new Date().toISOString();

    pass.history.push({
      id: `aud-${Date.now()}`,
      action: 'CANCELLED',
      userId: user?.id || 'student',
      userName: user?.name || 'Student',
      userRole: user?.role || 'STUDENT',
      timestamp: new Date().toISOString(),
      remarks: reason || 'Cancelled by Student'
    });

    db.saveState();

    db.addNotification({
      title: 'Gate Pass Cancelled',
      message: `Gate Pass ${pass.gatePassNo} has been cancelled.`,
      module: 'HOSTEL' as any,
      priority: 'LOW' as any,
      linkTab: 'hostel'
    });

    return pass;
  }

  public recordGatePassOut(id: string, user: any): StudentGatePass {
    this.ensureInitialized();
    const state = db.getState();
    const existingList: StudentGatePass[] = (state as any).studentGatePasses || [];
    const pass = existingList.find(g => g.id === id || g.gatePassNo === id);

    if (!pass) throw new Error('Gate pass not found.');
    if (pass.status !== 'APPROVED' && pass.status !== 'ACTIVE') {
      throw new Error(`Cannot record OUT for gate pass with status ${pass.status}. Must be APPROVED.`);
    }

    const now = new Date();
    pass.status = 'OUT';
    pass.actualOutDateTime = now.toISOString();
    pass.actualOutRecordedBy = user?.id || 'security-1';
    pass.actualOutRecordedByName = user?.name || 'Campus Main Gate Security';
    pass.updatedAt = now.toISOString();

    pass.history.push({
      id: `aud-${Date.now()}`,
      action: 'OUT_RECORDED',
      userId: user?.id || 'security',
      userName: user?.name || 'Security Officer',
      userRole: user?.role || 'SECURITY',
      timestamp: now.toISOString(),
      remarks: `Campus exit verified at Main Gate`
    });

    db.saveState();

    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    db.addNotification({
      title: 'Gate Exit Recorded',
      message: `Gate exit for Pass ${pass.gatePassNo} recorded at ${timeStr}.`,
      module: 'HOSTEL' as any,
      priority: 'MEDIUM' as any,
      linkTab: 'hostel'
    });

    return pass;
  }

  public recordGatePassIn(id: string, user: any): StudentGatePass {
    this.ensureInitialized();
    const state = db.getState();
    const existingList: StudentGatePass[] = (state as any).studentGatePasses || [];
    const pass = existingList.find(g => g.id === id || g.gatePassNo === id);

    if (!pass) throw new Error('Gate pass not found.');
    if (pass.status !== 'OUT') {
      throw new Error(`Cannot record IN for gate pass with status ${pass.status}. Must be marked OUT first.`);
    }

    const now = new Date();
    pass.status = 'RETURNED';
    pass.actualInDateTime = now.toISOString();
    pass.actualInRecordedBy = user?.id || 'security-1';
    pass.actualInRecordedByName = user?.name || 'Campus Main Gate Security';

    // Calculate late return
    const [expHours, expMins] = pass.expectedReturnTime.split(':').map(Number);
    const expDate = new Date(pass.outingDate);
    expDate.setHours(expHours || 21, expMins || 0, 0, 0);

    const isLate = now.getTime() > expDate.getTime();
    pass.isLateReturn = isLate;
    pass.updatedAt = now.toISOString();

    pass.history.push({
      id: `aud-${Date.now()}`,
      action: 'IN_RECORDED',
      userId: user?.id || 'security',
      userName: user?.name || 'Security Officer',
      userRole: user?.role || 'SECURITY',
      timestamp: now.toISOString(),
      remarks: isLate ? 'Campus return recorded - LATE RETURN' : 'Campus return recorded on-time'
    });

    db.saveState();

    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    db.addNotification({
      title: 'Gate Return Recorded',
      message: `Gate return for Pass ${pass.gatePassNo} recorded at ${timeStr}${isLate ? ' (LATE RETURN WARNING)' : ''}.`,
      module: 'HOSTEL' as any,
      priority: isLate ? 'HIGH' : 'MEDIUM' as any,
      linkTab: 'hostel'
    });

    return pass;
  }

  public verifyGatePassQR(qrDataOrPassNo: string): { valid: boolean; pass?: StudentGatePass; message: string } {
    this.ensureInitialized();
    const passes = this.getGatePasses();
    let passNo = qrDataOrPassNo.trim();

    if (passNo.startsWith('SSIU-GP:')) {
      const parts = passNo.split(':');
      passNo = parts[1] || passNo;
    }

    const pass = passes.find(p => p.gatePassNo.toLowerCase() === passNo.toLowerCase() || p.id === passNo);

    if (!pass) {
      return { valid: false, message: 'Invalid Gate Pass. No record found in university registry.' };
    }

    if (pass.status === 'REJECTED' || pass.status === 'CANCELLED') {
      return { valid: false, pass, message: `Gate Pass is ${pass.status}. Campus movement not authorized.` };
    }

    if (pass.status === 'RETURNED' || pass.status === 'EXPIRED') {
      return { valid: false, pass, message: `Gate Pass is ${pass.status}. Cannot be re-used.` };
    }

    if (pass.status === 'PENDING') {
      return { valid: false, pass, message: 'Gate Pass is PENDING WARDEN APPROVAL. Cannot exit campus.' };
    }

    return { valid: true, pass, message: 'Valid Approved Gate Pass.' };
  }
}

export const studentGatePassService = StudentGatePassService.getInstance();
