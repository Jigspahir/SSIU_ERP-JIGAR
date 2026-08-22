/**
 * Automated Test Suite for Swarrnim ERP PTM, Requests and Complaints Modules
 */

import { AuthService } from './src/services/authService';
import { DataService } from './src/services/dataService';

async function runPTMRequestsComplaintsTests() {
  console.log('====================================================');
  console.log('🧪 RUNNING SWARRNIM ERP PTM, REQUESTS & COMPLAINTS TESTS');
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

  // ─── TEST 1: Parent PTM Records & Actions ─────────────────────────
  console.log('--- Test 1: Parent PTM Management ---');
  const parentPTMs = await DataService.getPTMRecords('PARENT', 'student-1');
  assert(parentPTMs.length > 0, 'Parent must be able to view upcoming and historical PTMs');
  assert(Boolean(parentPTMs[0].timeSlot), 'PTM meeting time slot details must be present');
  assert(Boolean(parentPTMs[0].facultyName), 'Assigned faculty mentor name must be present');


  // ─── TEST 2: Faculty/Mentor PTM Desk & Remarks ────────────────────
  console.log('\n--- Test 2: Faculty/Mentor PTM Consultation Desk ---');
  const facultyPTMs = await DataService.getPTMRecords('FACULTY');
  assert(facultyPTMs.length > 0, 'Faculty must be able to view assigned student consultations');
  assert(Boolean(facultyPTMs[0].studentName), 'Student name must be associated with PTM slot');

  // ─── TEST 3: Student/Parent Service Request Creation & Tracking ───
  console.log('\n--- Test 3: Service Requests Lifecycle ---');
  const initialRequests = await DataService.getRequests();
  assert(initialRequests.length > 0, 'Existing service requests must load');

  const newReq = await DataService.createServiceRequest(
    'CERTIFICATE',
    'Bonafide Certificate for Visa Application',
    'Required for international educational exchange program.'
  );
  assert(newReq.title === 'Bonafide Certificate for Visa Application', 'New request must be created');
  assert(newReq.status === 'SUBMITTED', 'Initial status must be SUBMITTED');

  // ─── TEST 4: Grievance & Complaints Registration ──────────────────
  console.log('\n--- Test 4: Grievance & Complaints Registration ---');
  const grievanceReq = await DataService.createServiceRequest(
    'GRIEVANCE',
    'Evaluation Re-check for DAA Mid-Term',
    '[EVALUATION] Requesting re-evaluation of question 3.',
    'HIGH'
  );
  assert(grievanceReq.category === 'GRIEVANCE', 'Grievance ticket category must be GRIEVANCE');
  assert(grievanceReq.priority === 'HIGH', 'Grievance priority must be set to HIGH');

  console.log('\n====================================================');
  console.log(`📊 PTM, REQUESTS & COMPLAINTS TEST RESULTS: ${passedTests} / ${totalTests} TESTS PASSED`);
  console.log('====================================================\n');
}

// Run test suite
runPTMRequestsComplaintsTests().catch((e) => {
  console.error('Test execution error:', e);
});
