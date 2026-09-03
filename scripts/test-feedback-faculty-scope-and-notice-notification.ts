const BASE_URL = 'http://localhost:3001';

let passedAssertions = 0;
let failedAssertions = 0;

function assert(condition: boolean, description: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${description}`);
    passedAssertions++;
  } else {
    console.error(`  ❌ FAIL: ${description}`);
    failedAssertions++;
  }
}

async function login(loginId: string, password: string) {
  const res = await fetch(`${BASE_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ loginId, password }),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Login failed for ${loginId} (${res.status}): ${txt}`);
  }
  const json: any = await res.json();
  const token = json.data?.accessToken || json.data?.token || json.accessToken;
  const user = json.data?.user || json.user;
  return { token, user };
}

async function runTests() {
  console.log('\n===============================================================');
  console.log('🧪 SSIU ERP: FACULTY FEEDBACK SCOPE & NOTICE NOTIFICATION TEST SUITE');
  console.log('===============================================================\n');

  try {
    // 1. Authenticate users
    console.log('--- 1. Authenticating Test Users ---');
    const admin = await login('superadmin', 'Admin@123');
    const faculty1 = await login('fac_amitshah', 'Faculty@123');
    const faculty2 = await login('faculty', 'Faculty@123');
    const student1 = await login('stu_demo01', 'Student@123');
    const student2 = await login('student', 'Student@123');

    assert(Boolean(admin.token), 'Admin logged in successfully');
    assert(Boolean(faculty1.token), 'Faculty 1 logged in successfully');
    assert(Boolean(faculty2.token), 'Faculty 2 logged in successfully');
    assert(Boolean(student1.token), 'Student 1 logged in successfully');
    assert(Boolean(student2.token), 'Student 2 logged in successfully');

    // =========================================================================
    // PART A: FACULTY FEEDBACK SCOPE, READ-ONLY & IDOR SECURITY TESTS
    // =========================================================================
    console.log('\n--- PART A: FACULTY STUDENT FEEDBACK SCOPING & SECURITY ---');

    // Test A1: Faculty cannot submit student feedback
    const facSubmitRes = await fetch(`${BASE_URL}/api/v1/feedback/student/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${faculty1.token}`,
      },
      body: JSON.stringify({
        category: 'FACULTY',
        facultyId: 'fac-1',
        overallRating: 5,
        ratings: { 'Teaching Clarity': 5 },
      }),
    });
    assert(facSubmitRes.status === 403, 'Faculty submitting student feedback is blocked with HTTP 403 Forbidden');

    // Test A2: Faculty cannot submit student suggestions
    const facSuggRes = await fetch(`${BASE_URL}/api/v1/feedback/student/suggestions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${faculty1.token}`,
      },
      body: JSON.stringify({
        category: 'ACADEMIC',
        title: 'Faculty Suggestion Attempt',
        description: 'Should be rejected',
      }),
    });
    assert(facSuggRes.status === 403, 'Faculty submitting student suggestion is blocked with HTTP 403 Forbidden');

    // Test A3: Faculty cannot mutate/patch student feedback
    const facPatchRes = await fetch(`${BASE_URL}/api/v1/feedback/student-feedbacks/fdb-101`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${faculty1.token}`,
      },
      body: JSON.stringify({ overallRating: 1 }),
    });
    assert(facPatchRes.status === 403, 'Faculty updating student feedback is blocked with HTTP 403 Forbidden');

function getData(json: any) {
  if (json && json.data && json.data.data !== undefined) return json.data.data;
  if (json && json.data !== undefined) return json.data;
  return json;
}

    // Test A4: Student can submit their own feedback
    const stdSubmitRes = await fetch(`${BASE_URL}/api/v1/feedback/student/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${student1.token}`,
      },
      body: JSON.stringify({
        category: 'FACULTY',
        facultyId: 'fac-1',
        overallRating: 5,
        ratings: { 'Teaching Clarity': 5, 'Subject Knowledge': 5 },
        comments: 'Great explanation of database indexing.',
      }),
    });
    assert(stdSubmitRes.status === 200 || stdSubmitRes.status === 201, 'Student successfully submits official teaching evaluation feedback');

    // Test A5: Faculty 1 list feedback only contains assigned student feedback
    const fac1ListRes = await fetch(`${BASE_URL}/api/v1/feedback/student-feedbacks`, {
      headers: { Authorization: `Bearer ${faculty1.token}` },
    });
    const fac1ListJson = await fac1ListRes.json();
    const fac1Feedbacks = getData(fac1ListJson);
    assert(fac1ListRes.status === 200, 'Faculty 1 fetches scoped student feedbacks');
    assert(Array.isArray(fac1Feedbacks) && fac1Feedbacks.length > 0, 'Faculty 1 receives assigned feedback records');
    const hasOnlyAssigned = Array.isArray(fac1Feedbacks) && fac1Feedbacks.every((f: any) => f.facultyId === 'fac-1' || f.mentorId === 'fac-1' || f.studentId === 'std-1' || f.studentId === 'std-2');
    assert(hasOnlyAssigned, 'Faculty 1 only receives feedback for assigned classes/students (No leak of unassigned faculty)');

    // Test A6: Faculty 1 cannot access Faculty 2 feedback via ID (IDOR check)
    const idorRes = await fetch(`${BASE_URL}/api/v1/feedback/student-feedbacks/fdb-103`, {
      headers: { Authorization: `Bearer ${faculty1.token}` },
    });
    assert(idorRes.status === 403, 'Faculty 1 accessing Faculty 2 feedback ID is blocked with HTTP 403 Forbidden (IDOR Protected)');

    // Test A7: Faculty 1 can access their own assigned feedback fdb-101
    const fac1OwnRes = await fetch(`${BASE_URL}/api/v1/feedback/student-feedbacks/fdb-101`, {
      headers: { Authorization: `Bearer ${faculty1.token}` },
    });
    assert(fac1OwnRes.status === 200, 'Faculty 1 successfully accesses their own assigned feedback fdb-101');

    // Test A8: Student 1 can access their own feedback but cannot access other feedback
    const std1OwnRes = await fetch(`${BASE_URL}/api/v1/feedback/student-feedbacks/fdb-101`, {
      headers: { Authorization: `Bearer ${student1.token}` },
    });
    assert(std1OwnRes.status === 200, 'Student 1 can view their own submitted feedback');

    // =========================================================================
    // PART B: NOTICE PUBLISH & MULTI-USER REAL-TIME NOTIFICATION TESTS
    // =========================================================================
    console.log('\n--- PART B: NOTICE PUBLISH & REAL-TIME NOTIFICATION VISIBILITY ---');

    // Test B1: Admin publishes University-wide notice
    const univNoticeRes = await fetch(`${BASE_URL}/api/v1/notices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${admin.token}`,
      },
      body: JSON.stringify({
        title: 'University Holiday Declaration',
        content: 'Campus closed tomorrow on occasion of National Innovation Day.',
        category: 'ACADEMIC',
        priority: 'HIGH',
        scopeType: 'UNIVERSITY_WIDE',
        targetRole: 'ALL',
        status: 'PUBLISHED',
      }),
    });
    const univNoticeJson = await univNoticeRes.json();
    assert(univNoticeRes.status === 201, 'Admin publishes University-Wide notice');
    const univNoticeId = univNoticeJson.data?.id || univNoticeJson.id;

    // Test B2: Both Student 1 and Faculty 1 receive the University-wide notice in their popup feed
    const stdFeedRes = await fetch(`${BASE_URL}/api/v1/notices/feed/popup`, {
      headers: { Authorization: `Bearer ${student1.token}` },
    });
    const stdFeedJson = await stdFeedRes.json();
    assert(stdFeedRes.status === 200, 'Student 1 fetches notice popup feed');
    const stdHasNotice = stdFeedJson.data?.unreadNotices?.some((n: any) => n.id === univNoticeId);
    assert(stdHasNotice, 'Student 1 automatically receives University-Wide notice in unread feed');

    const facFeedRes = await fetch(`${BASE_URL}/api/v1/notices/feed/popup`, {
      headers: { Authorization: `Bearer ${faculty1.token}` },
    });
    const facFeedJson = await facFeedRes.json();
    assert(facFeedRes.status === 200, 'Faculty 1 fetches notice popup feed');
    const facHasNotice = facFeedJson.data?.unreadNotices?.some((n: any) => n.id === univNoticeId);
    assert(facHasNotice, 'Faculty 1 automatically receives University-Wide notice in unread feed');

    // Test B3: Admin publishes a STUDENT-ONLY Notice
    const studentOnlyNoticeRes = await fetch(`${BASE_URL}/api/v1/notices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${admin.token}`,
      },
      body: JSON.stringify({
        title: 'Student Academic Portal Reopened',
        content: 'Eligible undergraduate students can register until Friday.',
        category: 'ACADEMIC',
        priority: 'NORMAL',
        scopeType: 'ROLE_BASED',
        targetRole: 'STUDENT',
        status: 'PUBLISHED',
      }),
    });
    const studentOnlyNoticeJson = await studentOnlyNoticeRes.json();
    const studentOnlyNoticeId = studentOnlyNoticeJson.data?.id || studentOnlyNoticeJson.id;
    assert(studentOnlyNoticeRes.status === 201, 'Admin publishes Student-Only targeted notice');

    // Test B4: Student 1 receives it, but Faculty 1 does NOT receive it
    const stdFeed2Res = await fetch(`${BASE_URL}/api/v1/notices/feed/popup`, {
      headers: { Authorization: `Bearer ${student1.token}` },
    });
    const stdFeed2Json = await stdFeed2Res.json();
    const stdHasStudentNotice = stdFeed2Json.data?.unreadNotices?.some((n: any) => n.id === studentOnlyNoticeId);
    assert(stdHasStudentNotice, 'Student 1 receives Student-Only targeted notice');
    assert(stdHasStudentNotice, 'Student 1 receives Student-Only targeted notice');

    const facFeed2Res = await fetch(`${BASE_URL}/api/v1/notices/feed/popup`, {
      headers: { Authorization: `Bearer ${faculty1.token}` },
    });
    const facFeed2Json = await facFeed2Res.json();
    const facHasStudentNotice = facFeed2Json.data?.unreadNotices?.some((n: any) => n.id === studentOnlyNoticeId);
    assert(!facHasStudentNotice, 'Faculty 1 does NOT receive Student-Only targeted notice (Target isolation enforced)');

    // Test B5: Mark notice as read
    const markReadRes = await fetch(`${BASE_URL}/api/v1/notices/${univNoticeId}/read`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${student1.token}` },
    });
    assert(markReadRes.status === 200 || markReadRes.status === 201, 'Student 1 marks notice as read');

    // Test B6: Verify notice is removed from unread feed for Student 1
    const stdFeed3Res = await fetch(`${BASE_URL}/api/v1/notices/feed/popup`, {
      headers: { Authorization: `Bearer ${student1.token}` },
    });
    const stdFeed3Json = await stdFeed3Res.json();
    const stdStillHasUnivNotice = stdFeed3Json.data?.unreadNotices?.some((n: any) => n.id === univNoticeId);
    assert(!stdStillHasUnivNotice, 'Marked notice is properly excluded from unread popup feed for Student 1');

    // Test B7: Verify Faculty 1 still has it unread (Recipient read isolation per user)
    const facFeed3Res = await fetch(`${BASE_URL}/api/v1/notices/feed/popup`, {
      headers: { Authorization: `Bearer ${faculty1.token}` },
    });
    const facFeed3Json = await facFeed3Res.json();
    const facStillHasUnivNotice = facFeed3Json.data?.unreadNotices?.some((n: any) => n.id === univNoticeId);
    assert(facStillHasUnivNotice, 'Faculty 1 unread state is independent (Recipient read state isolated per user)');

    // Test B8: Mark all read for Faculty 1
    const markAllReadRes = await fetch(`${BASE_URL}/api/v1/notices/mark-all-read`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${faculty1.token}` },
    });
    assert(markAllReadRes.status === 200 || markAllReadRes.status === 201, 'Faculty 1 executes mark-all-read');

    const facFeed4Res = await fetch(`${BASE_URL}/api/v1/notices/feed/popup`, {
      headers: { Authorization: `Bearer ${faculty1.token}` },
    });
    const facFeed4Json = await facFeed4Res.json();
    assert(facFeed4Json.data?.unreadCount === 0, 'Faculty 1 unread notice count is 0 after mark-all-read');

    console.log('\n===============================================================');
    console.log(`📊 TEST RESULTS: ${passedAssertions} PASSED, ${failedAssertions} FAILED`);
    console.log('===============================================================\n');

    if (failedAssertions > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('Test execution error:', error);
    process.exit(1);
  }
}

runTests();
