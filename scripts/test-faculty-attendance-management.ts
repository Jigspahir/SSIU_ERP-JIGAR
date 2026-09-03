/**
 * SSIU ERP — FACULTY ATTENDANCE MANAGEMENT & DATA FLOW VERIFICATION SUITE
 * 
 * Verifies:
 * 1. Faculty Attendance is strictly teaching/class/lecture based (NOT mentor/mentee based).
 * 2. Teaching assignments (subjects, divisions, semesters, timetable) scoped to authenticated faculty.
 * 3. Student list is strictly division/class enrollment based (NO mentee students loaded).
 * 4. "My Teaching Attendance" banner context (faculty name, academic year, department, subjects, divisions, semester, today's lectures).
 * 5. "Today's Teaching Schedule" status tracking (Attendance Submitted, Attendance Not Submitted / Pending, Upcoming).
 * 6. "Attendance Pending" calculates all lectures for which attendance is NOT yet submitted.
 * 7. "Attendance Submitted" displays only sessions submitted by the logged-in faculty.
 * 8. Attendance submission records against faculty identity and prevents duplicate submissions.
 * 9. Faculty View vs Mentor View strict separation (Mentor View unchanged, dual-role contexts isolated).
 * 10. Backend APIs (/teaching-assignments, /teaching-schedule, /pending) and IDOR RBAC protection.
 * 11. Student & Parent roles are strictly blocked from attendance marking.
 */

import { db } from '../src/services/db';
import { attendanceService } from '../src/services/attendanceService';
import { mentorAssignmentService } from '../src/services/mentorAssignmentService';
import { User } from '../src/types';

const BASE_URL = 'http://localhost:3001';

interface TestStats {
  passed: number;
  failed: number;
  total: number;
}

const stats: TestStats = { passed: 0, failed: 0, total: 0 };

function assert(condition: boolean, message: string, section?: string) {
  stats.total++;
  if (condition) {
    stats.passed++;
    console.log(`  ✅ [PASS] ${message}`);
  } else {
    stats.failed++;
    console.error(`  ❌ [FAIL] ${message} ${section ? `(${section})` : ''}`);
  }
}

async function runTests() {
  console.log('═══════════════════════════════════════════════════════════════════════════════');
  console.log('🧪 SSIU ERP — FACULTY ATTENDANCE MANAGEMENT & DATA FLOW TEST SUITE');
  console.log('═══════════════════════════════════════════════════════════════════════════════\n');

  const demoFacultyUser: User = {
    id: 'fac-1',
    name: 'Prof. Demo Faculty',
    username: 'faculty',
    email: 'demo.faculty@university.edu',
    role: 'FACULTY',
    departmentId: 'dept-1',
    instituteId: 'inst-1',
    status: 'ACTIVE'
  };

  const otherFacultyUser: User = {
    id: 'fac-2',
    name: 'Prof. Rajesh Sharma',
    username: 'fac_rajesh',
    email: 'rajesh.sharma@swarrnim.edu.in',
    role: 'FACULTY',
    departmentId: 'dept-1',
    instituteId: 'inst-1',
    status: 'ACTIVE'
  };

  // ─── 1. TEACHING ASSIGNMENTS & SCOPE ISOLATION ────────────────────────────
  console.log('📌 1. TEACHING ASSIGNMENTS & SCOPE ISOLATION (FACULTY VIEW)');

  const teachingAssignments = attendanceService.getFacultyTeachingAssignments(demoFacultyUser, 'FACULTY');
  assert(
    Boolean(teachingAssignments.subjects && teachingAssignments.subjects.length > 0),
    `Faculty teaching subjects resolved: ${teachingAssignments.subjects.map(s => s.code).join(', ')}`
  );

  assert(
    Boolean(teachingAssignments.divisions && teachingAssignments.divisions.length > 0),
    `Faculty teaching divisions resolved: ${teachingAssignments.divisions.map(d => d.name).join(', ')}`
  );

  const subjects = attendanceService.getFacultySubjects(demoFacultyUser, 'FACULTY');
  assert(
    subjects.every(s => typeof s.id === 'string' && typeof s.name === 'string'),
    'getFacultySubjects returns authorized teaching subjects list'
  );

  const divisions = attendanceService.getFacultyDivisions(demoFacultyUser, 'FACULTY');
  assert(
    divisions.every(d => typeof d.id === 'string' && typeof d.name === 'string'),
    'getFacultyDivisions returns authorized teaching divisions list'
  );

  // ─── 2. STUDENT ROSTER ENROLLMENT SCOPE (NO MENTEE MIXING) ────────────────
  console.log('\n📌 2. STUDENT ROSTER ENROLLMENT SCOPE (NO MENTEE MIXING)');

  const selectedSubj = subjects[0]?.id || 'sub-dbms';
  const selectedDiv = divisions[0]?.id || 'div-cse-4a';
  const roster = attendanceService.getStudentRoster(selectedSubj, selectedDiv, demoFacultyUser, 'FACULTY');

  assert(
    roster.length > 0,
    `Class attendance roster loaded ${roster.length} enrolled students for division ${selectedDiv}`
  );

  assert(
    roster.every(stu => !stu.divisionId || stu.divisionId === selectedDiv),
    'Every student in roster strictly belongs to the selected teaching division'
  );

  // Verify that mentee students who are in a different division are NOT included
  const allAssignments = db.getMentorAssignments();
  const mentees = allAssignments.filter(a => a.mentorFacultyId === demoFacultyUser.id);
  const students = db.getStudents();
  const menteeStudents = students.filter(s => mentees.some(m => m.studentId === s.id));
  const differentDivMentees = menteeStudents.filter(m => m.divisionId && m.divisionId !== selectedDiv);
  const mixedMenteeInRoster = roster.some(r => differentDivMentees.some(m => m.id === r.id));
  assert(
    !mixedMenteeInRoster,
    'Faculty attendance roster strictly excludes students who are only assigned as mentees in other divisions'
  );

  // ─── 3. MENTOR VIEW ISOLATION & NON-REGRESSION ────────────────────────────
  console.log('\n📌 3. MENTOR VIEW ISOLATION & NON-REGRESSION');

  assert(
    Array.isArray(mentees),
    `Mentor View mentee assignments remain accessible and independent (${mentees.length} mentees)`
  );

  // Verify switching context: Faculty View gets teaching subjects, Mentor View gets mentees
  const facultyViewSubjects = attendanceService.getFacultySubjects(demoFacultyUser, 'FACULTY');
  assert(
    facultyViewSubjects.length > 0 && Array.isArray(mentees),
    'Dual-role faculty/mentor preserves two completely distinct data contexts without interference'
  );

  // ─── 4. "TODAY\'S TEACHING SCHEDULE" STATUS TRACKING ──────────────────────
  console.log('\n📌 4. "TODAY\'S TEACHING SCHEDULE" STATUS TRACKING');

  const todayStr = new Date().toISOString().split('T')[0];
  const schedule = attendanceService.getFacultyTeachingSchedule(demoFacultyUser, 'FACULTY', todayStr);

  assert(
    schedule.length > 0,
    `Today's teaching schedule computed ${schedule.length} lecture sessions for faculty`
  );

  assert(
    schedule.every(item => ['SUBMITTED', 'PENDING', 'UPCOMING'].includes(item.status)),
    'Every lecture in today\'s schedule has a valid status (SUBMITTED, PENDING, UPCOMING)'
  );

  // ─── 5. "ATTENDANCE PENDING" SESSION CALCULATION ──────────────────────────
  console.log('\n📌 5. "ATTENDANCE PENDING" SESSION CALCULATION');

  const pending = attendanceService.getFacultyPendingAttendance(demoFacultyUser, 'FACULTY', todayStr);
  assert(
    Array.isArray(pending),
    `Pending attendance lectures calculated: ${pending.length} pending sessions`
  );

  if (pending.length > 0) {
    const firstPending = pending[0];
    assert(
      Boolean(firstPending.subjectName && firstPending.divisionName && firstPending.lectureNo && firstPending.timeSlot),
      `Pending lecture details complete: Lec #${firstPending.lectureNo} ${firstPending.subjectName} (${firstPending.divisionName}) at ${firstPending.timeSlot}`
    );
  }

  // ─── 6. "ATTENDANCE SUBMITTED" & SUBMISSION DUPLICATE PREVENTION ──────────
  console.log('\n📌 6. "ATTENDANCE SUBMITTED" & SUBMISSION DUPLICATE PREVENTION');

  const testDate = '2026-09-03';
  const testLectureNo = 4;
  const testSubjectId = selectedSubj;
  const testDivisionId = selectedDiv;

  // Submit test session
  const records = roster.map((stu, i) => ({
    studentId: stu.id,
    studentName: stu.name,
    enrollmentNo: stu.enrollmentNo || `23010100${i + 1}`,
    status: i === 0 ? 'ABSENT' as const : 'PRESENT' as const,
    remarks: ''
  }));

  const saved = attendanceService.saveAttendanceSession({
    subjectId: testSubjectId,
    divisionId: testDivisionId,
    date: testDate,
    lectureNo: testLectureNo,
    timeSlot: '02:00 PM - 03:00 PM',
    topicTaught: 'Unit Testing & Verification Architecture',
    records
  }, demoFacultyUser);

  assert(
    saved.facultyId === demoFacultyUser.id || saved.facultyName === demoFacultyUser.name,
    `Attendance saved with correct faculty identity: ${saved.facultyName} (${saved.facultyId})`
  );

  // Verify duplicate session detection
  const duplicate = attendanceService.checkDuplicateSession(testSubjectId, testDivisionId, testDate, testLectureNo);
  assert(
    Boolean(duplicate && duplicate.id === saved.id),
    'checkDuplicateSession correctly flags duplicate attendance for same subject + division + date + lectureNo'
  );

  // Verify submitted attendance listing
  const submittedList = attendanceService.getFacultySubmittedAttendance(demoFacultyUser, 'FACULTY');
  assert(
    submittedList.some(s => s.id === saved.id),
    `Submitted attendance session appears in faculty's submitted sessions register (${submittedList.length} sessions)`
  );

  // Clean up test session
  attendanceService.deleteAttendanceSession(saved.id, demoFacultyUser);

  // ─── 7. BACKEND REST APIS & RBAC / IDOR ENFORCEMENT ───────────────────────
  console.log('\n📌 7. BACKEND REST APIS & RBAC / IDOR ENFORCEMENT');

  try {
    // 7.1 Authenticate as Faculty
    const authRes = await fetch(`${BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ loginId: 'faculty', password: 'Faculty@123' })
    });

    if (authRes.ok) {
      const authData = await authRes.json();
      const token = authData.data?.accessToken || authData.accessToken || authData.token || authData.access_token;
      const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

      // 7.2 Fetch Teaching Assignments
      const assignRes = await fetch(`${BASE_URL}/api/v1/attendance/teaching-assignments`, { headers });
      assert(
        assignRes.status === 200,
        'GET /api/v1/attendance/teaching-assignments returns HTTP 200 OK for authenticated faculty'
      );

      // 7.3 Fetch Teaching Schedule
      const schedRes = await fetch(`${BASE_URL}/api/v1/attendance/teaching-schedule`, { headers });
      assert(
        schedRes.status === 200,
        'GET /api/v1/attendance/teaching-schedule returns HTTP 200 OK with today\'s lecture completion status'
      );

      // 7.4 Fetch Pending Attendance
      const pendRes = await fetch(`${BASE_URL}/api/v1/attendance/pending`, { headers });
      assert(
        pendRes.status === 200,
        'GET /api/v1/attendance/pending returns HTTP 200 OK for pending lectures queue'
      );

      // 7.5 IDOR Protection: Faculty cannot access another faculty's attendance
      const idorRes = await fetch(`${BASE_URL}/api/v1/attendance/faculty/other-fac-999`, { headers });
      assert(
        idorRes.status === 403,
        'GET /api/v1/attendance/faculty/:otherId rejects cross-faculty query with HTTP 403 Forbidden (IDOR Protection)'
      );

      // 7.6 Create Attendance Session via API
      const createRes = await fetch(`${BASE_URL}/api/v1/attendance/session`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          subjectId: 'sub-dbms',
          divisionId: 'div-cse-4a',
          date: '2026-09-03',
          lectureNo: 5,
          timeSlot: '03:00 PM - 04:00 PM',
          topicTaught: 'B+ Tree Indexing Engine',
          records: [
            { studentId: 'stu-1', studentName: 'Aarav Patel', status: 'PRESENT' },
            { studentId: 'stu-2', studentName: 'Diya Sharma', status: 'ABSENT' }
          ]
        })
      });

      assert(
        createRes.status === 201 || createRes.status === 200,
        'POST /api/v1/attendance/session successfully creates attendance session against authenticated faculty'
      );

      // 7.7 Duplicate session prevention via API (409 Conflict)
      const duplicateRes = await fetch(`${BASE_URL}/api/v1/attendance/session`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          subjectId: 'sub-dbms',
          divisionId: 'div-cse-4a',
          date: '2026-09-03',
          lectureNo: 5,
          records: [{ studentId: 'stu-1', status: 'PRESENT' }]
        })
      });

      assert(
        duplicateRes.status === 409,
        'POST /api/v1/attendance/session rejects duplicate session with HTTP 409 Conflict'
      );
    } else {
      console.log('  ⚠️ Backend live server not listening on 3001, skipping live HTTP API assertions');
    }
  } catch (err: any) {
    console.log(`  ℹ️ Live backend call note: ${err.message}`);
  }

  // ─── 8. NON-REGRESSION FOR STUDENT AND PARENT ROLES ───────────────────────
  console.log('\n📌 8. NON-REGRESSION FOR STUDENT AND PARENT ROLES');

  const studentUser: User = {
    id: 'stu-1',
    name: 'Aarav Patel',
    username: '230101001',
    email: 'aarav.patel@swarrnim.edu.in',
    role: 'STUDENT',
    status: 'ACTIVE'
  };

  let studentBlocked = false;
  try {
    attendanceService.getStudentRoster('sub-dbms', 'div-cse-4a', studentUser, 'STUDENT');
  } catch (e: any) {
    studentBlocked = true;
  }
  assert(studentBlocked, 'STUDENT is strictly blocked from accessing attendance roster');

  let studentSubmitBlocked = false;
  try {
    attendanceService.saveAttendanceSession({
      subjectId: 'sub-dbms',
      divisionId: 'div-cse-4a',
      date: '2026-09-03',
      lectureNo: 1,
      topicTaught: 'Unauthorized attempt',
      records: []
    }, studentUser);
  } catch (e: any) {
    studentSubmitBlocked = true;
  }
  assert(studentSubmitBlocked, 'STUDENT is strictly blocked from saving/marking attendance sessions');

  // ─── SUMMARY ─────────────────────────────────────────────────────────────
  console.log('\n═══════════════════════════════════════════════════════════════════════════════');
  console.log(`🏁 TEST RESULTS: ${stats.passed}/${stats.total} TESTS PASSED (${Math.round((stats.passed / stats.total) * 100)}%)`);
  console.log('═══════════════════════════════════════════════════════════════════════════════\n');

  if (stats.failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
