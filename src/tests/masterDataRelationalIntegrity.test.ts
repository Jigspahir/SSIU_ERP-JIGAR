declare const process: any;

import { db } from '../services/db';
import { masterDataService } from '../services/masterDataService';

let testsPassed = 0;
let testsFailed = 0;

function assert(condition: boolean, testName: string, detail?: string): void {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    testsPassed++;
  } else {
    console.error(`  ✗ FAIL: ${testName} ${detail ? `(${detail})` : ''}`);
    testsFailed++;
  }
}

export async function runMasterDataRelationalIntegrityTests(): Promise<void> {
  console.log('\n======================================================');
  console.log('RUNNING MASTER DATA RELATIONAL INTEGRITY & CRUD TESTS');
  console.log('======================================================\n');

  db.resetToDefaultSeed();

  // ─── 1. INSTITUTE MASTER CRUD ──────────────────────────────────────────────
  console.log('\n--- 1. Institute Master CRUD & Deactivation ---');
  const testInstCode = `INST-TEST-${Date.now().toString().slice(-4)}`;
  const createdInst = masterDataService.createInstitute({
    code: testInstCode,
    name: 'Swarrnim Test Institute of Technology',
    type: 'Engineering',
    email: 'test.sit@swarrnim.edu.in',
    phone: '9876543210',
    location: 'Main Campus',
    establishedYear: 2020,
    status: 'ACTIVE'
  });
  assert(Boolean(createdInst && createdInst.code === testInstCode), '1.1 Create Institute succeeds');

  const updatedInst = masterDataService.updateInstitute(createdInst.id, { principalName: 'Dr. Test Principal' });
  assert(updatedInst.principalName === 'Dr. Test Principal', '1.2 Update Institute succeeds');

  const deactivatedInst = masterDataService.deactivateInstitute(createdInst.id);
  assert(deactivatedInst.status === 'INACTIVE', '1.3 Deactivate Institute succeeds without hard delete');

  // ─── 2. DEPARTMENT MASTER RELATIONAL VALIDATION ────────────────────────────
  console.log('\n--- 2. Department Master Relational Validation ---');
  
  // 2.1 Invalid Parent Institute -> Rejected
  let threwDeptParent = false;
  try {
    masterDataService.createDepartment({
      code: 'DEPT-ORPHAN',
      name: 'Orphan Department',
      instituteId: 'inst-non-existent-999',
      email: 'orphan@swarrnim.edu.in',
      phone: '9876543210',
      status: 'ACTIVE'
    });
  } catch (err: any) {
    threwDeptParent = err.statusCode === 422;
  }
  assert(threwDeptParent, '2.1 Department creation rejects non-existent parent Institute');

  // 2.2 Valid Parent Institute -> Accepted
  const testDeptCode = `DEPT-TEST-${Date.now().toString().slice(-4)}`;
  const createdDept = masterDataService.createDepartment({
    code: testDeptCode,
    name: 'Test Autonomous Robotics',
    instituteId: createdInst.id,
    email: 'robotics@swarrnim.edu.in',
    phone: '9876543210',
    status: 'ACTIVE'
  });
  assert(createdDept.instituteId === createdInst.id, '2.2 Department creation binds to valid parent Institute');

  // ─── 3. PROGRAM MASTER RELATIONAL VALIDATION ───────────────────────────────
  console.log('\n--- 3. Program Master Relational Validation ---');

  // 3.1 Invalid Parent Department -> Rejected
  let threwProgDept = false;
  try {
    masterDataService.createProgram({
      code: 'PROG-ORPHAN',
      name: 'Orphan Program',
      degreeType: 'B.Tech',
      durationYears: 4,
      totalSemesters: 8,
      intakeCapacity: 60,
      instituteId: createdInst.id,
      departmentId: 'dept-non-existent-999',
      status: 'ACTIVE'
    });
  } catch (err: any) {
    threwProgDept = err.statusCode === 422;
  }
  assert(threwProgDept, '3.1 Program creation rejects non-existent Department');

  // 3.2 Valid Parents -> Accepted
  const testProgCode = `PROG-TEST-${Date.now().toString().slice(-4)}`;
  const createdProg = masterDataService.createProgram({
    code: testProgCode,
    name: 'B.Tech Robotics & AI',
    degreeType: 'B.Tech',
    durationYears: 4,
    totalSemesters: 8,
    intakeCapacity: 60,
    instituteId: createdInst.id,
    departmentId: createdDept.id,
    status: 'ACTIVE'
  });
  assert(createdProg.departmentId === createdDept.id && createdProg.instituteId === createdInst.id, '3.2 Program correctly references Institute & Department');

  // ─── 4. SUBJECT MASTER RELATIONAL VALIDATION ───────────────────────────────
  console.log('\n--- 4. Subject Master Relational Validation ---');

  // 4.1 Invalid Program -> Rejected
  let threwSubjParent = false;
  try {
    masterDataService.createSubject({
      code: 'SUBJ-ORPHAN',
      name: 'Orphan Subject',
      programId: 'prog-non-existent-999',
      semesterId: 'sem-1',
      credits: 4,
      theoryHoursPerWeek: 3,
      labHoursPerWeek: 2,
      type: 'THEORY',
      status: 'ACTIVE'
    });
  } catch (err: any) {
    threwSubjParent = err.statusCode === 422;
  }
  assert(threwSubjParent, '4.1 Subject creation rejects non-existent Program');

  // 4.2 Valid Program -> Accepted
  const testSubjCode = `SUBJ-TEST-${Date.now().toString().slice(-4)}`;
  const createdSubj = masterDataService.createSubject({
    code: testSubjCode,
    name: 'Autonomous Navigation',
    programId: createdProg.id,
    semesterId: 'sem-1',
    credits: 4,
    theoryHoursPerWeek: 3,
    labHoursPerWeek: 2,
    type: 'THEORY',
    status: 'ACTIVE'
  });
  assert(createdSubj.programId === createdProg.id, '4.2 Subject correctly references Program');

  // ─── 5. STUDENT MASTER RELATIONAL VALIDATION & USER SYNC ───────────────────
  console.log('\n--- 5. Student Master Relational Validation & User Sync ---');

  // 5.1 Invalid Program/Department -> Rejected
  let threwStudentInvalid = false;
  try {
    masterDataService.createStudent({
      enrollmentNo: 'ENR-TEST-ORPHAN',
      name: 'Orphan Student',
      email: 'orphan@swarrnim.edu.in',
      instituteId: createdInst.id,
      departmentId: 'dept-invalid',
      programId: createdProg.id,
      phone: '9876543210',
      gender: 'Male',
      dateOfBirth: '2004-01-01',
      academicYearId: 'ay-2024-2025',
      batchId: 'batch-1',
      semesterId: 'sem-1',
      divisionId: 'div-1',
      guardianName: 'Guardian',
      guardianPhone: '9876543210',
      status: 'ACTIVE',
      admissionDate: '2024-07-15'
    });
  } catch (err: any) {
    threwStudentInvalid = err.statusCode === 422;
  }
  assert(threwStudentInvalid, '5.1 Student creation rejects invalid Department reference');

  // 5.2 Valid Hierarchy -> Student created & User account synchronized
  const testEnrNo = `ENR-TEST-${Date.now().toString().slice(-4)}`;
  const createdStudent = masterDataService.createStudent({
    enrollmentNo: testEnrNo,
    name: 'Integrated Test Student',
    email: `student.${testEnrNo.toLowerCase()}@swarrnim.edu.in`,
    instituteId: createdInst.id,
    departmentId: createdDept.id,
    programId: createdProg.id,
    phone: '9876543210',
    gender: 'Male',
    dateOfBirth: '2004-01-01',
    academicYearId: 'ay-2024-2025',
    batchId: 'batch-1',
    semesterId: 'sem-1',
    divisionId: 'div-1',
    guardianName: 'Guardian',
    guardianPhone: '9876543210',
    status: 'ACTIVE',
    admissionDate: '2024-07-15'
  });
  assert(createdStudent.enrollmentNo === testEnrNo, '5.2 Student record created with full hierarchy');

  const syncedUser = db.getUsers().find(u => u.enrollmentNo === testEnrNo);
  assert(Boolean(syncedUser && syncedUser.role === 'STUDENT'), '5.3 Student User account synchronized automatically');

  // ─── 6. FACULTY MASTER RELATIONAL VALIDATION & USER SYNC ───────────────────
  console.log('\n--- 6. Faculty Master Relational Validation & User Sync ---');

  const testEmpId = `EMP-TEST-${Date.now().toString().slice(-4)}`;
  const createdFaculty = masterDataService.createFaculty({
    employeeId: testEmpId,
    name: 'Dr. Integrated Faculty',
    email: `faculty.${testEmpId.toLowerCase()}@swarrnim.edu.in`,
    instituteId: createdInst.id,
    departmentId: createdDept.id,
    designation: 'Associate Professor',
    phone: '9876543210',
    qualification: 'Ph.D. in AI',
    specialization: 'Robotics',
    experienceYears: 8,
    subjectIds: [createdSubj.id],
    status: 'ACTIVE'
  });
  assert(createdFaculty.employeeId === testEmpId, '6.1 Faculty record created with Institute & Department references');

  const syncedFacUser = db.getUsers().find(u => u.employeeId === testEmpId);
  assert(Boolean(syncedFacUser && syncedFacUser.role === 'FACULTY'), '6.2 Faculty User account synchronized automatically');

  // ─── 7. MASTER DATA HEALTH CHECK & ORPHAN DETECTOR ─────────────────────────
  console.log('\n--- 7. Master Data Health Check & Orphan Detector ---');
  const healthReport = masterDataService.runMasterDataHealthCheck();
  assert(healthReport.isHealthy === true, '7.1 Master Data Health Check confirms 0 orphan departments, programs, subjects, or students');
  assert(healthReport.orphanDepartments.length === 0, '7.2 0 orphan departments');
  assert(healthReport.orphanPrograms.length === 0, '7.3 0 orphan programs');
  assert(healthReport.orphanSubjects.length === 0, '7.4 0 orphan subjects');

  // ─── SUMMARY ───────────────────────────────────────────────────────────────
  console.log('\n======================================================');
  console.log(`TEST SUMMARY: ${testsPassed} PASSED, ${testsFailed} FAILED`);
  console.log('======================================================\n');

  if (testsFailed > 0 && typeof process !== 'undefined' && process.exit) {
    process.exit(1);
  }
}

if (typeof window === 'undefined' && typeof process !== 'undefined') {
  runMasterDataRelationalIntegrityTests().catch(err => {
    console.error('Fatal test execution error:', err);
    process.exit(1);
  });
}
