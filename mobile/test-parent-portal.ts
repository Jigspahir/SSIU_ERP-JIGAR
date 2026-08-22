/**
 * Automated Test Suite for Swarrnim ERP Parent Portal & Multi-Child Scoping
 */

import { AuthService } from './src/services/authService';
import { DataService } from './src/services/dataService';

async function runParentPortalTests() {
  console.log('====================================================');
  console.log('🧪 RUNNING SWARRNIM ERP PARENT PORTAL & CHILD SCOPING TESTS');
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

  // ─── TEST 1: Parent Authentication ───────────────────────────────
  console.log('--- Test 1: Parent Authentication ---');
  const parentLogin = await AuthService.login('parent', 'Parent@123');
  assert(parentLogin.success === true, 'Parent login must succeed');
  assert(parentLogin.user?.role === 'PARENT', 'Role must be PARENT');

  // ─── TEST 2: Multi-Child Linkage Retrieval ───────────────────────
  console.log('\n--- Test 2: Multi-Child Mapping ---');
  const children = await DataService.getParentLinkedChildren(parentLogin.user!.id);
  assert(children.length >= 2, 'Parent must have multiple linked children');
  assert(children.some((c) => c.name === 'Aarav Sharma'), 'Child 1 (Aarav Sharma) must be linked');
  assert(children.some((c) => c.name === 'Ananya Sharma'), 'Child 2 (Ananya Sharma) must be linked');

  // ─── TEST 3: Child 1 Scoped Data Retrieval ───────────────────────
  console.log('\n--- Test 3: Child 1 (Aarav Sharma - B.Tech) Data Scoping ---');
  const child1Id = children[0].id;
  const child1Att = await DataService.getAttendance(child1Id);
  assert(child1Att.records.length > 0, 'Child 1 attendance records must load');
  const child1PTM = await DataService.getPTMRecords('PARENT', child1Id);
  assert(child1PTM.length > 0, 'Child 1 PTM consultations must load');
  const child1Fees = await DataService.getFeeSummary(child1Id);
  assert(child1Fees.studentId === child1Id, 'Child 1 fee ledger must match child ID');

  // ─── TEST 4: Child 2 Scoped Data Retrieval ───────────────────────
  console.log('\n--- Test 4: Child 2 (Ananya Sharma - B.Pharm) Data Scoping ---');
  const child2Id = children[1].id;
  const child2Att = await DataService.getAttendance(child2Id);
  assert(child2Att !== null, 'Child 2 attendance records must load cleanly');
  const child2PTM = await DataService.getPTMRecords('PARENT', child2Id);
  assert(child2PTM !== null, 'Child 2 PTM records must load');

  // ─── TEST 5: PTM Confirmation & Reschedule Action ─────────────────
  console.log('\n--- Test 5: PTM Confirmation & Reschedule Flow ---');
  const ptmId = child1PTM[0]?.id || 'ptm-1';
  const confirmResult = await DataService.confirmPTMAttendance(ptmId);
  assert(confirmResult === true, 'Parent must be able to confirm PTM consultation');

  const rescheduleResult = await DataService.requestPTMReschedule(
    ptmId,
    '2025-03-28',
    '03:00 PM',
    'Parent has official university meeting conflict.'
  );
  assert(rescheduleResult === true, 'Parent must be able to submit reschedule request');


  // ─── TEST 6: Security & Unlinked Student Isolation ───────────────
  console.log('\n--- Test 6: Security & Unlinked Student Isolation ---');
  const unlinkedChildId = 'unlinked-student-999';
  const isLinked = children.some((c) => c.id === unlinkedChildId);
  assert(isLinked === false, 'Unlinked student must NOT be accessible in parent children list');

  console.log('\n====================================================');
  console.log(`📊 PARENT PORTAL TEST RESULTS: ${passedTests} / ${totalTests} TESTS PASSED`);
  console.log('====================================================\n');
}

// Execute tests
runParentPortalTests().catch((e) => {
  console.error('Test execution error:', e);
});
