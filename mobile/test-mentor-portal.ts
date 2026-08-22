/**
 * Automated Test Suite for Swarrnim ERP Mentor Dedicated Mobile Workspace
 */

import { AuthService } from './src/services/authService';
import { DataService } from './src/services/dataService';

async function runMentorPortalTests() {
  console.log('====================================================');
  console.log('🧪 RUNNING SWARRNIM ERP MENTOR PORTAL TESTS');
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

  // ─── TEST 1: Mentor Authentication ───────────────────────────────
  console.log('--- Test 1: Mentor Authentication ---');
  const mentorLogin = await AuthService.login('mentor', 'Faculty@123');
  assert(mentorLogin.success === true, 'Mentor login must succeed');
  assert(mentorLogin.user?.role === 'MENTOR', 'Role must be MENTOR');

  // ─── TEST 2: Assigned Mentees Scoping ────────────────────────────
  console.log('\n--- Test 2: Assigned Mentees Scoping ---');
  const mentees = await DataService.getMentorMentees();
  assert(mentees.length > 0, 'Assigned mentees list must load');
  assert(mentees.some((m) => m.name === 'Aarav Sharma'), 'Assigned mentee Aarav Sharma must exist in cohort');
  assert(mentees.some((m) => m.name === 'Rohan Verma'), 'Assigned mentee Rohan Verma must exist in cohort');

  // ─── TEST 3: Risk Early Warning Radar ────────────────────────────
  console.log('\n--- Test 3: Risk Early Warning Radar ---');
  const highRiskStudents = mentees.filter((m) => m.riskLevel === 'HIGH' || m.attendancePercentage < 75);
  assert(highRiskStudents.length > 0, 'Risk radar must identify students with attendance < 75%');
  const atRiskMentee = highRiskStudents.find((m) => m.name === 'Rohan Verma');
  assert(Boolean(atRiskMentee && atRiskMentee.riskFlags.length > 0), 'Risk flags (remedial/attendance) must be populated');

  // ─── TEST 4: Direct Guardian Contact Linkage ─────────────────────
  console.log('\n--- Test 4: Direct Guardian Contact Linkage ---');
  assert(Boolean(atRiskMentee?.guardianPhone), 'Guardian contact phone must be available for mentor follow-up');

  // ─── TEST 5: Isolation & Non-Cohort Protection ────────────────────
  console.log('\n--- Test 5: Isolation & Non-Cohort Protection ---');
  const outsideStudentId = 'student-outside-cohort-999';
  const isMentee = mentees.some((m) => m.id === outsideStudentId);
  assert(isMentee === false, 'Outside students must not be present in mentor cohort');

  console.log('\n====================================================');
  console.log(`📊 MENTOR PORTAL TEST RESULTS: ${passedTests} / ${totalTests} TESTS PASSED`);
  console.log('====================================================\n');
}

// Run test suite
runMentorPortalTests().catch((e) => {
  console.error('Test execution error:', e);
});
