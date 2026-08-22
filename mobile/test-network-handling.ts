/**
 * Automated Test Suite for Swarrnim ERP Mobile Network Handling & Safe Caching
 */

import { CacheService, CACHE_KEYS } from './src/services/cacheService';
import { DataService } from './src/services/dataService';

async function runNetworkHandlingTests() {
  console.log('====================================================');
  console.log('🧪 RUNNING SWARRNIM ERP NETWORK & CACHE TESTS');
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

  // ─── TEST 1: Safe Read-Only Caching for Profile ───────────────────
  console.log('--- Test 1: Safe Read-Only Profile Caching ---');
  const mockProfile = { name: 'Aarav Sharma', enrollmentNo: '24010101001', program: 'B.Tech Computer Engineering' };
  await CacheService.set(CACHE_KEYS.USER_PROFILE, mockProfile);
  const cachedProfile = await CacheService.get(CACHE_KEYS.USER_PROFILE);
  assert(cachedProfile.data !== null, 'Cached profile must be retrievable offline');
  assert(cachedProfile.isStale === false, 'Freshly saved cache envelope must not be stale');

  // ─── TEST 2: Attendance Summary Caching ───────────────────────────
  console.log('\n--- Test 2: Attendance Summary Caching ---');
  const mockAttendanceSummary = { overallPercentage: 86.4, totalPresent: 152, totalConducted: 176 };
  await CacheService.set(CACHE_KEYS.ATTENDANCE_SUMMARY, mockAttendanceSummary);
  const cachedAtt = await CacheService.get<typeof mockAttendanceSummary>(CACHE_KEYS.ATTENDANCE_SUMMARY);
  assert(cachedAtt.data?.overallPercentage === 86.4, 'Offline attendance summary must match last server sync');

  // ─── TEST 3: PTM Schedule & Recent Notices Caching ────────────────
  console.log('\n--- Test 3: PTM Schedule & Recent Notices Caching ---');
  const mockNotices = [{ id: 'n-1', title: 'Mid-Term Exam Schedule Winter 2025', date: '20 Feb 2025' }];
  await CacheService.set(CACHE_KEYS.RECENT_NOTICES, mockNotices);
  const cachedNotices = await CacheService.get<typeof mockNotices>(CACHE_KEYS.RECENT_NOTICES);
  assert(cachedNotices.data?.length === 1, 'Recent notices must be cached for offline viewing');

  // ─── TEST 4: Sensitive Data Exclusion Guardrail ───────────────────
  console.log('\n--- Test 4: Sensitive Data Exclusion Guardrail ---');
  const sensitiveCacheAttempt = (CACHE_KEYS as any).USER_PASSWORDS || (CACHE_KEYS as any).EXAM_QUESTION_PAPERS;
  assert(sensitiveCacheAttempt === undefined, 'Sensitive credentials/exam papers must never exist in cache keys');

  // ─── TEST 5: Offline Modification Rejection ───────────────────────
  console.log('\n--- Test 5: Offline Immutability Guardrail ---');
  let offlineErrorThrown = false;
  try {
    const isOnline = false;
    CacheService.assertOnlineOnlyAction('UPDATE_ATTENDANCE_RECORD', isOnline);
  } catch (e: any) {
    offlineErrorThrown = true;
  }
  assert(offlineErrorThrown === true, 'Offline modification of official records must be strictly blocked');

  console.log('\n====================================================');
  console.log(`📊 NETWORK & CACHE TEST RESULTS: ${passedTests} / ${totalTests} TESTS PASSED`);
  console.log('====================================================\n');
}

// Run test suite
runNetworkHandlingTests().catch((e) => {
  console.error('Test execution error:', e);
});
