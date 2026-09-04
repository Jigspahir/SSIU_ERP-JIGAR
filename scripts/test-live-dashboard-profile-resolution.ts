import { db } from '../src/services/db';
import { syncLiveUserDataAndEntities } from '../src/context/AuthContext';
import { User, Student, Faculty, StudentFeeRecord } from '../src/types';

async function runLiveDashboardResolutionTests() {
  console.log('═══════════════════════════════════════════════════════════════════════════════');
  console.log('🧪 SSIU ERP — LIVE PROFILE & DASHBOARD DATA-FETCHING RESOLUTION TEST SUITE');
  console.log('═══════════════════════════════════════════════════════════════════════════════\n');

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, testName: string, detail: string) {
    total++;
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      console.log(`   └─ ${detail}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
      console.error(`   └─ ${detail}`);
      process.exitCode = 1;
    }
  }

  // 1. Test live student hydration and resolution
  const realStudentInput: Partial<User> = {
    id: 'user-stu-yash99',
    name: 'Yash Chaudhary',
    email: 'yash.chaudhary@swarrnim.edu.in',
    username: '2401010099',
    role: 'STUDENT',
    departmentId: 'dept-cse',
    instituteId: 'inst-01',
    programId: 'prog-1',
    phone: '9825123456',
    gender: 'Male'
  };

  const syncedStudentUser = await syncLiveUserDataAndEntities(realStudentInput);

  assert(
    syncedStudentUser.name === 'Yash Chaudhary' && syncedStudentUser.role === 'STUDENT',
    'Test 01: Live Student Profile Hydrated Correctly',
    `Name: ${syncedStudentUser.name}, Role: ${syncedStudentUser.role}, Email: ${syncedStudentUser.email}`
  );

  // 2. Verify Student master record in database store
  const students = db.getStudents();
  const matchedStudent = students.find(s => s.enrollmentNo === '2401010099' || s.email === 'yash.chaudhary@swarrnim.edu.in');

  assert(
    Boolean(matchedStudent && matchedStudent.name === 'Yash Chaudhary' && matchedStudent.departmentId === 'dept-cse'),
    'Test 02: Dynamic Student Master Record Registered in DB',
    `Resolved ID: ${matchedStudent?.id}, Enrollment: ${matchedStudent?.enrollmentNo}, Dept: ${matchedStudent?.departmentId}`
  );

  // 3. Verify Fee ledger initialized for real student
  const feeRecords = db.getStudentFeeRecords();
  const matchedFee = feeRecords.find(f => f.enrollmentNo === '2401010099' || f.studentId === matchedStudent?.id);

  assert(
    Boolean(matchedFee && matchedFee.studentName === 'Yash Chaudhary' && matchedFee.status === 'PAID'),
    'Test 03: Student Fee Record & Transaction Ledgers Resolved Dynamically',
    `Fee ID: ${matchedFee?.id}, Total: ₹${matchedFee?.totalAmount}, Paid: ₹${matchedFee?.paidAmount}`
  );

  // 4. Test live faculty hydration and resolution
  const realFacultyInput: Partial<User> = {
    id: 'user-fac-ananya',
    name: 'Dr. Ananya Sharma',
    email: 'ananya.sharma@swarrnim.edu.in',
    username: 'EMP-FAC-99',
    role: 'FACULTY',
    departmentId: 'dept-cse',
    instituteId: 'inst-01',
    designation: 'Associate Professor',
    phone: '9876543299'
  };

  const syncedFacultyUser = await syncLiveUserDataAndEntities(realFacultyInput);
  const facultyList = db.getFaculty();
  const matchedFaculty = facultyList.find(f => f.email === 'ananya.sharma@swarrnim.edu.in' || f.employeeId === 'EMP-FAC-99');

  assert(
    Boolean(matchedFaculty && matchedFaculty.name === 'Dr. Ananya Sharma' && matchedFaculty.departmentId === 'dept-cse'),
    'Test 04: Dynamic Faculty Master Record Registered in DB',
    `Faculty ID: ${matchedFaculty?.id}, Designation: ${matchedFaculty?.designation}, Dept: ${matchedFaculty?.departmentId}`
  );

  // 5. Verify Academic Subjects & Attendance Resolution for Live Student
  const subjects = db.getSubjects().filter(s => s.departmentId === matchedStudent?.departmentId || s.programId === matchedStudent?.programId);
  assert(
    subjects.length > 0,
    'Test 05: Academic Subjects Scoped to Real Student Department Curriculum',
    `Found ${subjects.length} active department subjects (e.g. ${subjects[0]?.name})`
  );

  console.log('\n═══════════════════════════════════════════════════════════════════════════════');
  console.log(`🏁 LIVE PROFILE RESOLUTION RESULTS: ${passed} / ${total} PASSED`);
  console.log('═══════════════════════════════════════════════════════════════════════════════\n');
}

runLiveDashboardResolutionTests().catch((err) => {
  console.error('Fatal Test Execution Error:', err);
  process.exit(1);
});
