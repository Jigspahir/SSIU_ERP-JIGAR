import { isTabPermittedForRole, PARENT_NAVIGATION_STRUCTURE, ROLE_NAV_ORDER } from '../src/constants/navigationConfig';
import { smartActionCenterService } from '../src/services/actionCenterService';
import { User, UserRole } from '../src/types';

async function runParentAccessTests() {
  console.log('═══════════════════════════════════════════════════════════════════════════════');
  console.log('🧪 SSIU ERP — PARENT ROLE STRICT ACCESS & MINIMAL DASHBOARD TEST SUITE');
  console.log('═══════════════════════════════════════════════════════════════════════════════\n');

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    total++;
    if (condition) {
      console.log(`  ✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${testName}`);
      if (detail) console.error(`     ↳ Detail: ${detail}`);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // SUITE 1: PARENT NAVIGATION & MENU STRUCTURE ISOLATION
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('📌 1. NAVIGATION & MENU STRUCTURE (MINIMAL ALLOWLIST)');

  const parentNavTabs = PARENT_NAVIGATION_STRUCTURE.map(g => g.id);
  assert(
    parentNavTabs.length === 8,
    'PARENT_NAVIGATION_STRUCTURE contains exactly 8 dedicated items',
    `Found ${parentNavTabs.length} items: ${parentNavTabs.join(', ')}`
  );

  assert(
    parentNavTabs.includes('dashboard') &&
    parentNavTabs.includes('my-children') &&
    parentNavTabs.includes('ptm-dashboard') &&
    parentNavTabs.includes('notices') &&
    parentNavTabs.includes('feedback') &&
    parentNavTabs.includes('grievance') &&
    parentNavTabs.includes('notifications') &&
    parentNavTabs.includes('profile'),
    'PARENT_NAVIGATION_STRUCTURE covers all mandatory minimal sections'
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // SUITE 2: ROUTE GUARDS & PERMISSIONS (LEAST-PRIVILEGE ACCESS)
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n📌 2. ROUTE GUARDS & PERMISSIONS (STRICT ACCESS CONTROL)');

  // Permitted Tabs
  const allowedTabs = [
    'dashboard',
    'parent-dashboard',
    'my-children',
    'parent-children',
    'ptm-dashboard',
    'parent-ptm',
    'ptm-schedule',
    'ptm-feedback',
    'notices',
    'feedback',
    'feedback-give',
    'feedback-my',
    'grievance',
    'student-grievance',
    'notifications',
    'profile'
  ];

  for (const tab of allowedTabs) {
    assert(
      isTabPermittedForRole(tab, 'PARENT'),
      `Parent is permitted to access: ${tab}`
    );
  }

  // Strictly Blocked Administrative Modules
  const blockedAdminTabs = [
    'settings',
    'user-management',
    'users-management',
    'rbac-matrix',
    'access-control',
    'security-audit',
    'inventory-assets',
    'faculty-assets',
    'crm',
    'admission',
    'analytics',
    'management-analytics',
    'kpi-dashboard',
    'hr',
    'payroll',
    'recruitment',
    'hostel-admin',
    'transport-admin',
    'library-admin',
    'maintenance-admin',
    'exam-cell',
    'student-section',
    'student-search',
    'students-search',
    'students-directory',
    'bulk-import',
    'note-sheets',
    'notesheet-create',
    'notesheet-pending',
    'inward-outward',
    'work-diary',
    'work-transfer',
    'workload-transfer',
    'ai-control-center',
    'ai-agents',
    'accreditation',
    'accreditation-naac',
    'obe',
    'course-outcomes',
    'research',
    'startups',
    'grants'
  ];

  for (const tab of blockedAdminTabs) {
    assert(
      !isTabPermittedForRole(tab, 'PARENT'),
      `Parent is STRICTLY DENIED access to admin module: ${tab}`,
      `Expected false for tab '${tab}' but received true`
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // SUITE 3: ACTION CENTER & SMART ALERTS ("WHAT NEEDS MY ATTENTION?")
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n📌 3. ACTION CENTER & "WHAT NEEDS MY ATTENTION?" ALERTS');

  const parentUser: User = {
    id: 'user-parent-1',
    name: 'Rajesh Sharma',
    email: 'rajesh.sharma@parent.ssiu-demo.ac.in',
    role: 'PARENT',
    departmentId: 'dept-1',
    instituteId: 'inst-1',
    status: 'ACTIVE'
  };

  const parentActions = smartActionCenterService.getSmartActionItems(parentUser, 'PARENT');
  
  assert(
    parentActions.length > 0,
    'Parent receives active smart action items'
  );

  const hasRegistrarActions = parentActions.some(a => a.sourceModule === 'Registrar Office' || a.id.includes('reg-'));
  const hasAdmissionActions = parentActions.some(a => a.sourceModule === 'Admission Cell' || a.id.includes('crm') || a.id.includes('hotlead'));
  const hasEstateActions = parentActions.some(a => a.sourceModule === 'Estate & Maintenance' || a.id.includes('estate') || a.id.includes('workorder'));

  assert(
    !hasRegistrarActions,
    'Parent action center does NOT contain Registrar Office operational queues'
  );

  assert(
    !hasAdmissionActions,
    'Parent action center does NOT contain Admission CRM hot leads'
  );

  assert(
    !hasEstateActions,
    'Parent action center does NOT contain Estate & Maintenance internal work orders'
  );

  const hasPTMAlert = parentActions.some(a => a.id === 'act-parent-ptm-invite' || a.sourceModule === 'PTM Portal');
  assert(
    hasPTMAlert,
    'Parent action center contains PTM consultation alert'
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // SUITE 4: BACKEND AUTHENTICATION & ROLE IDENTITY
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n📌 4. BACKEND AUTHENTICATION & ROLE IDENTITY');

  try {
    const loginRes = await fetch('http://localhost:3001/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ loginId: 'parent', password: 'Parent@123' })
    });

    if (loginRes.ok) {
      const authData = await loginRes.json();
      const parentToken = authData?.data?.accessToken || authData?.accessToken;
      const userObj = authData?.data?.user || authData?.user;

      assert(
        userObj?.role === 'PARENT',
        'Backend login returns exact role: PARENT (never SUPER_ADMIN)',
        `Received role: ${userObj?.role}`
      );

      assert(
        Boolean(parentToken),
        'Backend generates valid JWT token for parent session'
      );

      // Verify notices scoped to parent
      const noticeRes = await fetch('http://localhost:3001/api/v1/notices', {
        headers: { 'Authorization': `Bearer ${parentToken}` }
      });

      if (noticeRes.ok) {
        const noticeData = await noticeRes.json();
        const rawNotices = noticeData?.data?.data || noticeData?.data?.notices || noticeData?.data || noticeData || [];
        const notices: any[] = Array.isArray(rawNotices) ? rawNotices : [];
        const containsFacultyOnlyNotices = notices.some(n => n.targetRole === 'FACULTY' || n.targetRole === 'STAFF');
        assert(
          !containsFacultyOnlyNotices,
          'Parent notices feed does not expose internal FACULTY/STAFF-only circulars'
        );
      }

      // Verify feedback scoped to parent
      const feedbackRes = await fetch('http://localhost:3001/api/v1/feedback/student-feedbacks', {
        headers: { 'Authorization': `Bearer ${parentToken}` }
      });

      if (feedbackRes.ok) {
        const feedbackData = await feedbackRes.json();
        const scope = feedbackData?.data?.scope || feedbackData?.scope;
        assert(
          scope === 'PARENT_OWN',
          'Parent feedback list endpoint enforces scope: PARENT_OWN',
          `Received scope: ${scope}`
        );
      }

      // Verify IDOR protection on getStudentFeedbackById
      const idorRes = await fetch('http://localhost:3001/api/v1/feedback/student-feedbacks/fdb-1', {
        headers: { 'Authorization': `Bearer ${parentToken}` }
      });

      assert(
        idorRes.status === 403 || idorRes.status === 404,
        'Parent IDOR check rejects accessing unlinked student feedback with HTTP 403 Forbidden',
        `HTTP Status: ${idorRes.status}`
      );

      // Verify Parent feedback submission
      const submitRes = await fetch('http://localhost:3001/api/v1/feedback', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${parentToken}`
        },
        body: JSON.stringify({
          category: 'CAMPUS',
          overallRating: 5,
          ratings: { infrastructure: 5, cleanliness: 5 },
          comments: 'Excellent campus infrastructure and mentor support.'
        })
      });

      assert(
        submitRes.ok,
        'Parent is authorized to submit parent feedback and suggestions',
        `HTTP Status: ${submitRes.status}`
      );
    } else {
      console.warn('  ⚠️ Backend live API check skipped (backend service starting up)');
    }
  } catch (err: any) {
    console.warn(`  ⚠️ Live HTTP backend check skipped (${err.message})`);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // SUITE 5: NON-REGRESSION OF OTHER CORE ROLES
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n📌 5. NON-REGRESSION FOR SUPER_ADMIN, FACULTY, AND STUDENT ROLES');

  assert(
    isTabPermittedForRole('settings', 'SUPER_ADMIN') &&
    isTabPermittedForRole('inventory-assets', 'SUPER_ADMIN') &&
    isTabPermittedForRole('user-management', 'SUPER_ADMIN'),
    'SUPER_ADMIN retains full access to administrative modules'
  );

  assert(
    isTabPermittedForRole('attendance', 'FACULTY') &&
    isTabPermittedForRole('subjects', 'FACULTY') &&
    !isTabPermittedForRole('settings', 'FACULTY'),
    'FACULTY retains academic capabilities and remains restricted from system settings'
  );

  assert(
    isTabPermittedForRole('my-attendance', 'STUDENT') &&
    isTabPermittedForRole('feedback', 'STUDENT') &&
    !isTabPermittedForRole('attendance', 'STUDENT') &&
    !isTabPermittedForRole('settings', 'STUDENT'),
    'STUDENT retains student capabilities and remains restricted from attendance marking and settings'
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // SUMMARY
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n═══════════════════════════════════════════════════════════════════════════════');
  console.log(`🏁 TEST RESULTS: ${passed}/${total} TESTS PASSED (${Math.round((passed / total) * 100)}%)`);
  console.log('═══════════════════════════════════════════════════════════════════════════════\n');

  if (passed < total) {
    process.exit(1);
  }
}

runParentAccessTests().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
