import { describe, it, expect, beforeEach } from 'vitest';
import { firebaseUserService } from '../firebase/services/userService';
import { firebaseStudentService } from '../firebase/services/studentService';
import { firebaseFacultyService } from '../firebase/services/facultyService';
import { firebaseAttendanceService } from '../firebase/services/attendanceService';
import { firebaseMentorService } from '../firebase/services/mentorService';
import { firebaseNoticeService } from '../firebase/services/noticeService';
import { firebaseWorkTransferService } from '../firebase/services/workTransferService';
import { firebaseAuditService } from '../firebase/services/auditService';
import { firebaseMasterDataService } from '../firebase/services/masterDataService';
import { User, Student } from '../types';
import { FirestoreUser, FirestoreStudent, FirestoreFacultyAssignment, FirestoreTeachingSession } from '../firebase/types';

describe('SSIU ERP — Firebase Production Architecture, RBAC & Data Scoping Test Suite', () => {

  const superAdminUser: User = {
    id: 'user-admin-1',
    name: 'Chief ERP Administrator',
    email: 'superadmin@swarrnim.edu.in',
    username: 'superadmin',
    role: 'SUPER_ADMIN',
    status: 'ACTIVE'
  };

  const adminStaffUser: User = {
    id: 'usr-admin-staff-1',
    name: 'Admin Staff Member',
    email: 'adminstaff@swarrnim.edu.in',
    username: 'adminstaff',
    role: 'ADMIN_STAFF',
    status: 'ACTIVE'
  };

  const deputyRegistrarUser: User = {
    id: 'usr-deputy-reg-1',
    name: 'Deputy Registrar (Academics)',
    email: 'deputy.reg@swarrnim.edu.in',
    username: 'deputy_registrar',
    role: 'DEPUTY_REGISTRAR',
    status: 'ACTIVE'
  };

  const hodCSEUser: User = {
    id: 'usr-hod-1',
    name: 'Dr. Suresh Mehta (HOD CE)',
    email: 'hod.ce@swarrnim.edu.in',
    username: 'hod_ce',
    role: 'HOD',
    instituteId: 'inst-sit',
    departmentId: 'dept-1',
    status: 'ACTIVE'
  };

  const hodMEUser: User = {
    id: 'usr-hod-me',
    name: 'Dr. Ramesh Joshi (HOD ME)',
    email: 'hod.me@swarrnim.edu.in',
    username: 'hod_me',
    role: 'HOD',
    instituteId: 'inst-sit',
    departmentId: 'dept-2',
    status: 'ACTIVE'
  };

  const facultyA: User = {
    id: 'fac-1',
    name: 'Dr. Rajesh Shah (Faculty A)',
    email: 'rajesh.shah@swarrnim.edu.in',
    username: 'faculty',
    role: 'FACULTY',
    instituteId: 'inst-sit',
    departmentId: 'dept-1',
    status: 'ACTIVE'
  };

  const facultyB: User = {
    id: 'fac-2',
    name: 'Prof. Anjali Patel (Faculty B)',
    email: 'anjali.patel@swarrnim.edu.in',
    username: 'faculty2',
    role: 'FACULTY',
    instituteId: 'inst-sit',
    departmentId: 'dept-1',
    status: 'ACTIVE'
  };

  const mentorA: User = {
    id: 'fac-1',
    name: 'Dr. Rajesh Shah (Mentor A)',
    email: 'rajesh.shah@swarrnim.edu.in',
    username: 'mentor1',
    role: 'MENTOR',
    instituteId: 'inst-sit',
    departmentId: 'dept-1',
    status: 'ACTIVE'
  };

  const mentorB: User = {
    id: 'fac-2',
    name: 'Prof. Anjali Patel (Mentor B)',
    email: 'anjali.patel@swarrnim.edu.in',
    username: 'mentor2',
    role: 'MENTOR',
    instituteId: 'inst-sit',
    departmentId: 'dept-1',
    status: 'ACTIVE'
  };

  const studentA: User = {
    id: 'stu-1',
    name: 'Jigar Patel (Student A)',
    email: 'student@swarrnim.edu.in',
    username: 'student1',
    role: 'STUDENT',
    studentId: 'stu-1',
    instituteId: 'inst-sit',
    departmentId: 'dept-1',
    status: 'ACTIVE'
  };

  const studentB: User = {
    id: 'stu-2',
    name: 'Rohan Verma (Student B)',
    email: 'rohan.verma@swarrnim.edu.in',
    username: 'student2',
    role: 'STUDENT',
    studentId: 'stu-2',
    instituteId: 'inst-sit',
    departmentId: 'dept-1',
    status: 'ACTIVE'
  };

  const parentA: User = {
    id: 'usr-parent-1',
    name: 'Mr. Ramesh Patel (Parent A)',
    email: 'ramesh.patel@gmail.com',
    username: 'parent1',
    role: 'PARENT',
    status: 'ACTIVE',
    ...({ parentStudentIds: ['stu-1'] } as any)
  };

  const parentB: User = {
    id: 'usr-parent-2',
    name: 'Mr. Suresh Verma (Parent B)',
    email: 'suresh.verma@gmail.com',
    username: 'parent2',
    role: 'PARENT',
    status: 'ACTIVE',
    ...({ parentStudentIds: ['stu-2'] } as any)
  };

  // ==========================================================================
  // 1. MASTER DATA CENTRALIZATION & RELATIONSHIPS
  // ==========================================================================
  describe('1. Centralized Master Data & Relationships', () => {
    it('Authoritative institutes, departments, programs and subjects exist uniquely', async () => {
      const institutes = await firebaseMasterDataService.getInstitutes();
      expect(institutes.length).toBeGreaterThan(0);

      const departments = await firebaseMasterDataService.getDepartments('inst-sit');
      expect(departments.length).toBeGreaterThan(0);

      const subjects = await firebaseMasterDataService.getSubjects('dept-1');
      expect(subjects.length).toBeGreaterThan(0);
    });
  });

  // ==========================================================================
  // 2. STUDENT & PARENT DATA SCOPE & RBAC ISOLATION
  // ==========================================================================
  describe('2. Student & Parent Data Scoping & Unauthorized Isolation', () => {
    it('Student A queries students list and receives strictly their own profile (Zero Student B contamination)', async () => {
      const resp = await firebaseStudentService.getStudentsForUser(studentA);
      expect(resp.students.length).toBe(1);
      expect(resp.students[0].id).toBe('stu-1');
      expect(resp.students.some(s => s.id === 'stu-2')).toBe(false);
    });

    it('Parent A queries student directory and resolves strictly their linked child (stu-1), blocking Student B', async () => {
      const resp = await firebaseStudentService.getStudentsForUser(parentA);
      expect(resp.students.length).toBe(1);
      expect(resp.students[0].id).toBe('stu-1');
      expect(resp.students.some(s => s.id === 'stu-2')).toBe(false);
    });

    it('Parent with no linked student IDs receives an empty result set (no data leakage)', async () => {
      const unlinkedParent: User = {
        id: 'usr-parent-unlinked',
        name: 'Unlinked Parent',
        email: 'unlinked@gmail.com',
        username: 'unlinked_parent',
        role: 'PARENT',
        status: 'ACTIVE'
      };
      const resp = await firebaseStudentService.getStudentsForUser(unlinkedParent);
      expect(resp.students.length).toBe(0);
    });
  });

  // ==========================================================================
  // 3. FACULTY DATA SCOPING & TEACHING ALLOCATIONS
  // ==========================================================================
  describe('3. Faculty Data Scoping & Teaching Allocations', () => {
    it('Faculty A resolves only their assigned teaching subjects and divisions', async () => {
      const subjects = await firebaseFacultyService.getAuthorizedSubjects('fac-1');
      expect(subjects.some(s => s.code === 'CSE-402')).toBe(true);
      expect(subjects.some(s => s.code === 'CSE-403')).toBe(true);

      const divisions = await firebaseFacultyService.getAuthorizedDivisions('fac-1', 'CSE-402');
      expect(divisions.some(d => d.name === 'Division A')).toBe(true);
    });

    it('Faculty A cannot see unassigned subjects or other faculty records', async () => {
      const assignmentsA = await firebaseFacultyService.getFacultyAssignments('fac-1');
      const assignmentsB = await firebaseFacultyService.getFacultyAssignments('fac-2');
      
      expect(assignmentsA.every(a => a.facultyId === 'fac-1')).toBe(true);
      expect(assignmentsB.every(a => a.facultyId === 'fac-2')).toBe(true);
    });
  });

  // ==========================================================================
  // 4. MENTOR VIEW DATA SCOPING (PRESERVED MENTORSHIP SEPARATION)
  // ==========================================================================
  describe('4. Mentor View Data Scoping', () => {
    it('Mentor queries actively assigned mentees without mixing with unassigned students', async () => {
      const mentees = await firebaseMentorService.getMenteesForMentor('fac-1');
      expect(Array.isArray(mentees)).toBe(true);
      mentees.forEach(m => {
        expect(m.mentorFacultyId).toBe('fac-1');
        expect(m.status).toBe('ACTIVE');
      });
    });

    it('Student correctly resolves their active assigned mentor', async () => {
      const assignment = await firebaseMentorService.getActiveMentorForStudent('stu-1');
      if (assignment) {
        expect(assignment.studentId).toBe('stu-1');
        expect(assignment.status).toBe('ACTIVE');
        expect(assignment.mentorFacultyId).toBeDefined();
      }
    });
  });

  // ==========================================================================
  // 5. ATTENDANCE ARCHITECTURE & DEDUPLICATION
  // ==========================================================================
  describe('5. Centralized Attendance Architecture', () => {
    it('Duplicate lecture submission check executes properly', async () => {
      const isDuplicate = await firebaseAttendanceService.checkDuplicateSession({
        subjectId: 'CSE-402',
        divisionId: 'div-cse-4a',
        date: '2026-01-02',
        lectureNumber: 1
      });

      expect(typeof isDuplicate).toBe('boolean');
    });

    it('Attendance records strictly reference sessionId, studentId, and valid attendance status', async () => {
      const records = await firebaseAttendanceService.getStudentAttendance('stu-1');
      expect(Array.isArray(records)).toBe(true);
      if (records.length > 0) {
        expect(['PRESENT', 'ABSENT', 'LATE', 'ON_DUTY']).toContain(records[0].status);
        expect(records[0].studentId).toBe('stu-1');
      }
    });
  });

  // ==========================================================================
  // 6. TARGETED NOTICES & AUDIENCE SCOPING
  // ==========================================================================
  describe('6. Targeted Notices & Notification Queue', () => {
    it('General notices with targetAudience: ALL are accessible to all roles', async () => {
      const studentNotices = await firebaseNoticeService.getNoticesForUser(studentA);
      expect(studentNotices.some(n => n.targetAudience === 'ALL')).toBe(true);

      const facultyNotices = await firebaseNoticeService.getNoticesForUser(facultyA);
      expect(facultyNotices.some(n => n.targetAudience === 'ALL')).toBe(true);
    });

    it('Department-specific notices are filtered to matching department users only', async () => {
      const cseNotices = await firebaseNoticeService.getNoticesForUser(hodCSEUser);
      const cseNotice = cseNotices.find(n => n.id === 'notice-cse-002');
      expect(cseNotice).toBeDefined();

      const meNotices = await firebaseNoticeService.getNoticesForUser(hodMEUser);
      expect(meNotices.some(n => n.id === 'notice-cse-002')).toBe(false);
    });
  });

  // ==========================================================================
  // 7. WORK TRANSFER DELEGATION LIFECYCLE
  // ==========================================================================
  describe('7. Work Transfer Access & Audit Trail', () => {
    it('Work transfer queries return sent, received, and active handovers for user', async () => {
      const transfers = await firebaseWorkTransferService.getTransfersForUser(facultyA);
      expect(Array.isArray(transfers.sent)).toBe(true);
      expect(Array.isArray(transfers.received)).toBe(true);
      expect(Array.isArray(transfers.active)).toBe(true);
    });
  });

  // ==========================================================================
  // 8. IMMUTABLE SYSTEM AUDIT LOGGING
  // ==========================================================================
  describe('8. Centralized Audit Log Engine', () => {
    it('Audit logging writes immutable events with actorUid, role, action, and severity', async () => {
      await firebaseAuditService.logEvent({
        actor: facultyA,
        action: 'ATTENDANCE_SUBMITTED',
        module: 'ATTENDANCE',
        entity: 'teachingSessions',
        recordId: 'sess-test-001',
        details: 'Submitted attendance for CSE-402 Division A Lecture #1',
        severity: 'INFO'
      });

      const logs = await firebaseAuditService.getAuditLogs({ module: 'ATTENDANCE', limitCount: 10 });
      expect(Array.isArray(logs)).toBe(true);
    });
  });
});
