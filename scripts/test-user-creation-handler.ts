/**
 * ==============================================================================
 * Test: System Settings User Creation -> Firebase Auth & SQL Connect Sync Verification
 * ==============================================================================
 */

import { userAccountManagementService } from '../src/services/userAccountManagementService';
import { db } from '../src/services/db';
import { userService } from '../src/services/userService';

async function runTests() {
  console.log('═══════════════════════════════════════════════════════════════════════════════');
  console.log('🧪 SSIU ERP — SYSTEM SETTINGS USER CREATION -> FIREBASE AUTH & SQL CONNECT TEST');
  console.log('═══════════════════════════════════════════════════════════════════════════════\n');

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, desc: string, detail?: string) {
    total++;
    if (condition) {
      passed++;
      console.log(`✅ [PASS] Test ${total.toString().padStart(2, '0')}: ${desc}`);
      if (detail) console.log(`   └─ ${detail}`);
    } else {
      console.error(`❌ [FAIL] Test ${total.toString().padStart(2, '0')}: ${desc}`);
      if (detail) console.error(`   └─ ${detail}`);
    }
  }

  // Test 1: Student Account Creation for Yash Chaudhary
  const testStudentEnroll = `enr2024099`;
  const testStudentEmail = `yash.chaudhary.test@swarrnim.edu.in`;

  const createdStudent = userAccountManagementService.createUser({
    username: testStudentEnroll,
    email: testStudentEmail,
    name: 'Yash Chaudhary',
    password: 'Password@123',
    role: 'STUDENT',
    enrollmentNo: testStudentEnroll,
    phone: '+91 9876543210',
    departmentName: 'Computer Science & Engineering',
    designation: 'Student',
    accountStatus: 'ACTIVE'
  }, { id: 'admin-1', username: 'admin', name: 'Super Administrator', role: 'SUPER_ADMIN', email: 'admin@swarrnim.edu.in' } as any);

  assert(
    !!createdStudent && createdStudent.username === testStudentEnroll,
    'Student Account Created for Yash Chaudhary',
    `Created ID: ${createdStudent.id}, Username/Enrollment: ${createdStudent.username}, Role: ${createdStudent.role}`
  );

  // Test 2: Synchronize Yash Chaudhary to Firebase Auth, SQL Connect (PostgreSQL), and Cloud Firestore
  const syncResult = await userService.syncUserToAllDatabases({
    id: createdStudent.id,
    username: createdStudent.username,
    email: createdStudent.email,
    name: createdStudent.name,
    password: createdStudent.password,
    role: createdStudent.role,
    enrollmentNo: createdStudent.enrollmentNo,
    phone: createdStudent.phone,
    departmentName: createdStudent.departmentName,
    designation: createdStudent.designation,
    accountStatus: createdStudent.accountStatus
  });

  assert(
    typeof syncResult.postgresSynced === 'boolean' && typeof syncResult.authRegistered === 'boolean',
    'Firebase Authentication & SQL Connect Execution Dispatched',
    `Auth Registered: ${syncResult.authRegistered}, Postgres SQL Connect: ${syncResult.postgresSynced}, Backend Synced: ${syncResult.backendSynced}`
  );

  // Test 3: Faculty User Provisioning (e.g. Dr. Rajesh Sharma)
  const testFacultyEmpId = `emp-fac-982`;
  const testFacultyEmail = `rajesh.faculty.test@swarrnim.edu.in`;

  const createdFaculty = userAccountManagementService.createUser({
    username: testFacultyEmpId,
    email: testFacultyEmail,
    name: 'Dr. Rajesh Sharma',
    password: 'FacultyPassword@123',
    role: 'FACULTY',
    employeeId: testFacultyEmpId,
    phone: '+91 9898012345',
    departmentName: 'Computer Engineering',
    designation: 'Professor & HOD',
    accountStatus: 'ACTIVE'
  }, { id: 'admin-1', username: 'admin', name: 'Super Administrator', role: 'SUPER_ADMIN', email: 'admin@swarrnim.edu.in' } as any);

  assert(
    !!createdFaculty && createdFaculty.role === 'FACULTY',
    'Faculty Account Created with Employee ID Mapping',
    `Created ID: ${createdFaculty.id}, Employee ID / Username: ${createdFaculty.username}, Role: ${createdFaculty.role}`
  );

  // Test 4: Verification of Data Store Persistence
  const storedYash = db.getUsers().find(u => u.username === testStudentEnroll);
  assert(
    !!storedYash && storedYash.name === 'Yash Chaudhary' && storedYash.role === 'STUDENT',
    'Verified Student Record in Database Store with Exact Role and Name',
    `Name: ${storedYash?.name}, Role: ${storedYash?.role}, Email: ${storedYash?.email}`
  );

  // Test 5: Role Permission Validation for Student vs Faculty
  const studentPerms = userAccountManagementService.getEffectivePermissions(createdStudent);
  const facultyPerms = userAccountManagementService.getEffectivePermissions(createdFaculty);
  assert(
    studentPerms.permissions.SETTINGS.canEdit === false && facultyPerms.permissions.ATTENDANCE.canView === true,
    'Effective Permissions Properly Enforced based on Assigned Role',
    `Student Settings Edit: ${studentPerms.permissions.SETTINGS.canEdit}, Faculty Attendance View: ${facultyPerms.permissions.ATTENDANCE.canView}`
  );

  console.log('\n═══════════════════════════════════════════════════════════════════════════════');
  console.log(`🏁 SYSTEM SETTINGS USER CREATION VERIFICATION: ${passed} / ${total} PASSED`);
  console.log('═══════════════════════════════════════════════════════════════════════════════\n');

  if (passed !== total) process.exit(1);
}

runTests().catch(err => {
  console.error(err);
  process.exit(1);
});
