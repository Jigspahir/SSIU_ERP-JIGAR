/**
 * Automated Test Suite for Swarrnim University ERP Mobile Authentication & RBAC
 */

import { AuthService } from './src/services/authService';
import { StorageService } from './src/services/storageService';
import { CONFIG } from './src/constants/config';

async function runMobileAuthTests() {
  console.log('====================================================');
  console.log('🧪 RUNNING SWARRNIM ERP MOBILE AUTHENTICATION TESTS');
  console.log('====================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition: boolean | undefined, testName: string) {
    totalTests++;
    if (Boolean(condition)) {
      console.log(`✅ PASS: ${testName}`);
      passedTests++;
    } else {
      console.error(`❌ FAIL: ${testName}`);
    }
  }

  // ─── TEST 1: Student Login & Role Detection ──────────────────────
  console.log('--- Test 1: Student Login ---');
  const studentLogin = await AuthService.login('student', 'Student@123');
  assert(studentLogin.success === true, 'Student login should succeed with valid credentials');
  assert(studentLogin.user?.role === 'STUDENT', 'Student role must be detected as STUDENT');
  assert(Boolean(studentLogin.token), 'A valid JWT session token must be returned');

  // ─── TEST 2: Parent Login & Multi-Child Access ───────────────────
  console.log('\n--- Test 2: Parent Login ---');
  const parentLogin = await AuthService.login('parent', 'Parent@123');
  assert(parentLogin.success === true, 'Parent login should succeed with valid credentials');
  assert(parentLogin.user?.role === 'PARENT', 'Parent role must be detected as PARENT');

  // ─── TEST 3: Faculty Login ───────────────────────────────────────
  console.log('\n--- Test 3: Faculty Login ---');
  const facultyLogin = await AuthService.login('faculty', 'Faculty@123');
  assert(facultyLogin.success === true, 'Faculty login should succeed with valid credentials');
  assert(facultyLogin.user?.role === 'FACULTY', 'Faculty role must be detected as FACULTY');

  // ─── TEST 4: Mentor Login ────────────────────────────────────────
  console.log('\n--- Test 4: Mentor Login ---');
  const mentorLogin = await AuthService.login('mentor', 'Faculty@123');
  assert(mentorLogin.success === true, 'Mentor login should succeed with valid credentials');
  assert(mentorLogin.user?.role === 'MENTOR', 'Mentor role must be detected as MENTOR');

  // ─── TEST 5: Wrong Password Handling ────────────────────────────
  console.log('\n--- Test 5: Wrong Password Validation ---');
  const wrongPassLogin = await AuthService.login('student', 'IncorrectPassword!@#');
  assert(wrongPassLogin.success === false, 'Login with incorrect password must be rejected');
  assert(
    wrongPassLogin.error?.toLowerCase().includes('password') || wrongPassLogin.error?.toLowerCase().includes('credentials'),
    'Should return a clear incorrect password error message'
  );

  // ─── TEST 6: Session Persistence ─────────────────────────────────
  console.log('\n--- Test 6: Session Persistence ---');
  await AuthService.login('student', 'Student@123');
  const restoredSession = await AuthService.getCurrentSession();
  assert(restoredSession.user !== null, 'Session must persist in storage across app restarts');
  assert(restoredSession.user?.username === 'student', 'Restored user must match authenticated session');

  // ─── TEST 7: Logout & Token Purging ──────────────────────────────
  console.log('\n--- Test 7: Logout & Token Cleanup ---');
  await AuthService.logout();
  const sessionAfterLogout = await AuthService.getCurrentSession();
  assert(sessionAfterLogout.user === null, 'Session must be null after logout');
  assert(sessionAfterLogout.token === null, 'JWT token must be purged from secure storage upon logout');

  // ─── TEST 8: Session Expiry Handling ────────────────────────────
  console.log('\n--- Test 8: Inactivity Timeout & Session Expiry ---');
  await AuthService.login('student', 'Student@123');
  // Simulate activity from 2 hours ago (> 30 min session timeout)
  const expiredTime = Date.now() - (2 * 60 * 60 * 1000);
  await StorageService.setItem(CONFIG.STORAGE_KEYS.LAST_ACTIVITY, expiredTime);
  const expiredCheck = await AuthService.getCurrentSession();
  assert(expiredCheck.expired === true || expiredCheck.user === null, 'Expired session must auto-terminate');

  console.log('\n====================================================');
  console.log(`📊 TEST RESULTS: ${passedTests} / ${totalTests} TESTS PASSED`);
  console.log('====================================================\n');
}

// Run tests
runMobileAuthTests().catch((e) => {
  console.error('Test execution error:', e);
});
