/**
 * Automated Test Suite for Swarrnim ERP Faculty Portal & Class Permissions
 */

import { AuthService } from './src/services/authService';
import { DataService } from './src/services/dataService';

async function runFacultyPortalTests() {
  console.log('====================================================');
  console.log('🧪 RUNNING SWARRNIM ERP FACULTY PORTAL TESTS');
  console.log('====================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition: boolean, testName: string) {
    totalTests++;
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passedTests++;
    } else {
      console.error(`❌ FAIL: ${testName}`);
    }
  }

  // ─── TEST 1: Faculty Authentication ───────────────────────────────
  console.log('--- Test 1: Faculty Authentication ---');
  const facultyLogin = await AuthService.login('faculty', 'Faculty@123');
  assert(facultyLogin.success === true, 'Faculty login must succeed');
  assert(facultyLogin.user?.role === 'FACULTY', 'Role must be FACULTY');

  // ─── TEST 2: Faculty PTM Schedule Access ─────────────────────────
  console.log('\n--- Test 2: PTM Consultation Access ---');
  const ptmSchedules = await DataService.getPTMRecords('FACULTY');
  assert(ptmSchedules.length > 0, 'Faculty must have assigned PTM consultation slots');

  // ─── TEST 3: Student Requests Review & Action ──────────────────
  console.log('\n--- Test 3: Student Requests Review & Action ---');
  const requests = await DataService.getRequests();
  assert(requests.length > 0, 'Pending student requests must load');
  const targetReq = requests[0];
  assert(Boolean(targetReq.id), 'Target request ID must be valid');

  // ─── TEST 4: Attendance Marking Permission ────────────────────────
  console.log('\n--- Test 4: Attendance Session Verification ---');
  const sampleStudentAtt = await DataService.getAttendance('student-1');
  assert(sampleStudentAtt.records.some((r) => r.subjectCode === 'CE-501'), 'Assigned subject CE-501 must exist');

  console.log('\n====================================================');
  console.log(`📊 FACULTY PORTAL TEST RESULTS: ${passedTests} / ${totalTests} TESTS PASSED`);
  console.log('====================================================\n');
}

// Run test suite
runFacultyPortalTests().catch((e) => {
  console.error('Test execution error:', e);
});
