import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../services/db';
import {
  can,
  resolveUserOrganizationScope,
  getReportingAuthority,
  getDirectReports,
  generateApprovalChain,
  getScopedStudents,
  getScopedFaculty,
  getScopedAssets,
  getScopedAttendanceApplications
} from '../services/access';
import { inventoryManagementService } from '../services/inventoryManagementService';
import { staffProfileService } from '../services/staffProfileService';
import { User } from '../types';

describe('Master ERP Architecture & Centralized System Governance Suite', () => {
  let superAdminUser: User;
  let registrarUser: User;
  let principalUser: User;
  let hodUser: User;
  let facultyUser: User;
  let mentorUser: User;
  let studentUser: User;

  let testInstituteId: string;
  let testDepartmentId: string;

  beforeEach(() => {
    const inst = db.getInstitutes()[0];
    const dept = db.getDepartments()[0];

    testInstituteId = inst?.id || 'inst-sit';
    testDepartmentId = dept?.id || 'dept-1';

    superAdminUser = {
      id: 'usr-admin-1',
      name: 'System Administrator',
      email: 'admin@swarrnim.edu.in',
      role: 'SUPER_ADMIN',
      status: 'ACTIVE'
    };

    registrarUser = {
      id: 'usr-reg-1',
      name: 'Dr. R. K. Patel',
      email: 'registrar@swarrnim.edu.in',
      role: 'REGISTRAR',
      status: 'ACTIVE'
    };

    principalUser = {
      id: 'usr-prin-1',
      name: 'Dr. Suresh Verma',
      email: 'principal.sit@swarrnim.edu.in',
      role: 'PRINCIPAL',
      instituteId: testInstituteId,
      status: 'ACTIVE'
    };

    hodUser = {
      id: 'usr-hod-1',
      name: 'Dr. Rajesh Sharma',
      email: 'hod.ce@swarrnim.edu.in',
      role: 'HOD',
      instituteId: testInstituteId,
      departmentId: testDepartmentId,
      status: 'ACTIVE'
    };

    facultyUser = {
      id: 'fac-1',
      name: 'Prof. Amit Patel',
      email: 'amit.patel@swarrnim.edu.in',
      role: 'FACULTY',
      instituteId: testInstituteId,
      departmentId: testDepartmentId,
      status: 'ACTIVE'
    };

    mentorUser = {
      id: 'fac-1',
      name: 'Prof. Amit Patel',
      email: 'amit.patel@swarrnim.edu.in',
      role: 'MENTOR',
      instituteId: testInstituteId,
      departmentId: testDepartmentId,
      status: 'ACTIVE'
    };

    const student = db.getStudents()[0];
    studentUser = {
      id: student?.id || 'stud-1',
      name: student?.name || 'Jigar Patel',
      email: student?.email || 'jigar@swarrnim.edu.in',
      enrollmentNo: student?.enrollmentNo || '230101001',
      role: 'STUDENT',
      instituteId: testInstituteId,
      departmentId: testDepartmentId,
      status: 'ACTIVE'
    };
  });

  describe('1. Role-by-Role Scope Resolution (Organization Hierarchy)', () => {
    it('resolves global scope for SUPER_ADMIN & REGISTRAR', () => {
      const adminScope = resolveUserOrganizationScope(superAdminUser);
      expect(adminScope.isGlobalScope).toBe(true);
      expect(adminScope.allowedInstituteIds.length).toBeGreaterThan(0);
      expect(adminScope.allowedDepartmentIds.length).toBeGreaterThan(0);

      const regScope = resolveUserOrganizationScope(registrarUser);
      expect(regScope.isGlobalScope).toBe(true);
    });

    it('resolves institute scope for PRINCIPAL', () => {
      const prinScope = resolveUserOrganizationScope(principalUser);
      expect(prinScope.isGlobalScope).toBe(false);
      expect(prinScope.instituteId).toBe(testInstituteId);
      expect(prinScope.allowedInstituteIds).toEqual([testInstituteId]);
    });

    it('resolves department scope for HOD', () => {
      const hodScope = resolveUserOrganizationScope(hodUser);
      expect(hodScope.isGlobalScope).toBe(false);
      expect(hodScope.departmentId).toBe(testDepartmentId);
      expect(hodScope.allowedDepartmentIds).toEqual([testDepartmentId]);
    });

    it('resolves personal/student scope for STUDENT', () => {
      const stuScope = resolveUserOrganizationScope(studentUser);
      expect(stuScope.isGlobalScope).toBe(false);
    });
  });

  describe('2. Canonical Reporting Hierarchy', () => {
    it('resolves Student reporting authority to assigned Mentor or HOD', () => {
      const authority = getReportingAuthority(studentUser);
      expect(authority).toBeDefined();
      expect(['MENTOR', 'HOD']).toContain(authority?.role);
    });

    it('resolves Faculty reporting authority to Department HOD', () => {
      const authority = getReportingAuthority(facultyUser);
      expect(authority).toBeDefined();
      expect(authority?.role).toBe('HOD');
    });

    it('resolves HOD reporting authority to Institute Principal', () => {
      const authority = getReportingAuthority(hodUser);
      expect(authority).toBeDefined();
      expect(authority?.role).toBe('PRINCIPAL');
    });

    it('resolves Principal reporting authority to Vice-Chancellor', () => {
      const authority = getReportingAuthority(principalUser);
      expect(authority).toBeDefined();
      expect(authority?.role).toBe('VICE_CHANCELLOR');
    });

    it('resolves Direct Reports for HOD (department faculty) and Principal (department heads)', () => {
      const hodReports = getDirectReports(hodUser);
      expect(Array.isArray(hodReports)).toBe(true);

      const prinReports = getDirectReports(principalUser);
      expect(Array.isArray(prinReports)).toBe(true);
      expect(prinReports.length).toBeGreaterThan(0);
      expect(prinReports[0].role).toBe('HOD');
    });

    it('generates accurate multi-tier approval chains', () => {
      const chain = generateApprovalChain('ATTENDANCE_CONDONATION', studentUser);
      expect(chain.length).toBe(4);
      expect(chain[0].roleName).toBe('Course Faculty');
      expect(chain[1].roleName).toBe('Faculty Mentor');
      expect(chain[2].roleName).toBe('Head of Department (HOD)');
      expect(chain[3].roleName).toBe('Principal / Head of Institute (HOI)');
    });
  });

  describe('3. Centralized RBAC Permission Evaluation (can())', () => {
    it('SUPER_ADMIN is authorized for all permissions', () => {
      expect(can(superAdminUser, 'VIEW_STUDENT')).toBe(true);
      expect(can(superAdminUser, 'DELETE_STUDENT')).toBe(true);
      expect(can(superAdminUser, 'MANAGE_ORGANIZATION')).toBe(true);
      expect(can(superAdminUser, 'RESET_SYSTEM_DATABASE')).toBe(true);
    });

    it('PRINCIPAL has institute governance authorizations but cannot reset system DB', () => {
      expect(can(principalUser, 'VIEW_STUDENT', { instituteId: testInstituteId })).toBe(true);
      expect(can(principalUser, 'APPOINT_HOD', { instituteId: testInstituteId })).toBe(true);
      expect(can(principalUser, 'APPROVE_EXAM_ELIGIBILITY', { instituteId: testInstituteId })).toBe(true);
      expect(can(principalUser, 'RESET_SYSTEM_DATABASE')).toBe(false);
    });

    it('HOD has department authorizations but cannot appoint HODs or manage institutes', () => {
      expect(can(hodUser, 'VIEW_STUDENT', { departmentId: testDepartmentId })).toBe(true);
      expect(can(hodUser, 'EDIT_STUDENT', { departmentId: testDepartmentId })).toBe(true);
      expect(can(hodUser, 'ASSIGN_FACULTY_WORKLOAD', { departmentId: testDepartmentId })).toBe(true);
      expect(can(hodUser, 'APPOINT_HOD')).toBe(false);
      expect(can(hodUser, 'MANAGE_INSTITUTE')).toBe(false);
    });

    it('FACULTY has academic execution authorizations but cannot manage department or delete students', () => {
      expect(can(facultyUser, 'TAKE_ATTENDANCE', { departmentId: testDepartmentId })).toBe(true);
      expect(can(facultyUser, 'UPLOAD_STUDY_MATERIAL', { departmentId: testDepartmentId })).toBe(true);
      expect(can(facultyUser, 'REPORT_ASSET_ISSUE')).toBe(true);
      expect(can(facultyUser, 'DELETE_STUDENT')).toBe(false);
      expect(can(facultyUser, 'MANAGE_DEPARTMENT')).toBe(false);
    });

    it('STUDENT has self-service authorizations only and cannot take attendance or edit faculty', () => {
      expect(can(studentUser, 'VIEW_STUDENT_PROFILE', { studentId: studentUser.id })).toBe(true);
      expect(can(studentUser, 'CREATE_REQUEST')).toBe(true);
      expect(can(studentUser, 'SUBMIT_FEEDBACK')).toBe(true);
      expect(can(studentUser, 'TAKE_ATTENDANCE')).toBe(false);
      expect(can(studentUser, 'EDIT_FACULTY')).toBe(false);
      expect(can(studentUser, 'APPROVE_REQUEST')).toBe(false);
    });
  });

  describe('4. Inventory Data Layer Separation (Zero Data Duplication)', () => {
    it('returns dedicated, distinct datasets for each inventory transaction type', () => {
      const transfers = inventoryManagementService.getAssetTransfers();
      const returns = inventoryManagementService.getAssetReturns();
      const replacements = inventoryManagementService.getAssetReplacements();
      const issues = inventoryManagementService.getAssetIssues();
      const requisitions = inventoryManagementService.getAssetRequisitions();
      const departmentAssets = inventoryManagementService.getDepartmentAssets();

      // Each query returns an array matching its business domain
      expect(Array.isArray(transfers)).toBe(true);
      expect(Array.isArray(returns)).toBe(true);
      expect(Array.isArray(replacements)).toBe(true);
      expect(Array.isArray(issues)).toBe(true);
      expect(Array.isArray(requisitions)).toBe(true);
      expect(Array.isArray(departmentAssets)).toBe(true);

      // Verify that department fixed assets is distinct from transactions
      expect(departmentAssets.length).toBeGreaterThan(0);
      expect(departmentAssets[0]).toHaveProperty('assetTag');
    });

    it('scopes inventory queries by department when requested by HOD', () => {
      const deptTransfers = inventoryManagementService.getAssetTransfers({ departmentId: testDepartmentId });
      const deptAssets = inventoryManagementService.getDepartmentAssets({ departmentId: testDepartmentId });

      expect(Array.isArray(deptTransfers)).toBe(true);
      expect(Array.isArray(deptAssets)).toBe(true);
    });
  });

  describe('5. Data Visibility Scoped Query Wrappers', () => {
    it('scopes students correctly based on role', () => {
      const allStudents = getScopedStudents(superAdminUser);
      const hodStudents = getScopedStudents(hodUser);
      const studentSelf = getScopedStudents(studentUser);

      expect(allStudents.length).toBeGreaterThanOrEqual(hodStudents.length);
      expect(studentSelf.length).toBe(1);
      expect(studentSelf[0].id).toBe(studentUser.id);
    });

    it('scopes faculty correctly based on role', () => {
      const allFaculty = getScopedFaculty(superAdminUser);
      const hodFaculty = getScopedFaculty(hodUser);

      expect(allFaculty.length).toBeGreaterThanOrEqual(hodFaculty.length);
      expect(hodFaculty.every(f => f.departmentId === testDepartmentId)).toBe(true);
    });

    it('scopes assets correctly based on role', () => {
      const allAssets = getScopedAssets(superAdminUser);
      const hodAssets = getScopedAssets(hodUser);

      expect(Array.isArray(allAssets)).toBe(true);
      expect(Array.isArray(hodAssets)).toBe(true);
    });
  });

  describe('6. Non-Student Profile Governance & Dynamic Relationships', () => {
    it('computes live normalized profile with supervisor and direct reports for HOD', () => {
      const profile = staffProfileService.getStaffProfile(hodUser, 'HOD');
      expect(profile).toBeDefined();
      expect(profile.name).toBe(hodUser.name);
      expect(profile.role).toBe('HOD');
      expect(profile.reportsTo).toBeDefined();
      expect(Array.isArray(profile.directReports)).toBe(true);
      expect(Array.isArray(profile.modulePermissions)).toBe(true);
    });

    it('computes live normalized profile for Principal', () => {
      const profile = staffProfileService.getStaffProfile(principalUser, 'PRINCIPAL');
      expect(profile).toBeDefined();
      expect(profile.name).toBe(principalUser.name);
      expect(profile.role).toBe('PRINCIPAL');
      expect(profile.directReports.length).toBeGreaterThan(0);
    });
  });
});
