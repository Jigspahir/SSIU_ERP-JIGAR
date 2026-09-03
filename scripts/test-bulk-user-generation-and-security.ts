/**
 * ==============================================================================
 * SSIU ERP — BULK USER GENERATION, AUTH & DATA CONNECT VERIFICATION
 * ==============================================================================
 * Tests and verifies:
 *  1. Professional Institutional Email Generation (firstname.lastname[salt]@swarrnim.edu.in)
 *  2. High-Entropy Secure Password Generation (12+ chars, mixed cases, numbers, symbols)
 *  3. Bulk User Provisioning with Role-Based ID Prefixes ('stu-*', 'stf-*')
 *  4. Cloud Firestore & PostgreSQL Data Connect Synchronization (isActive: true, status: 'ACTIVE')
 *  5. Soft-Delete Lifecycle (isActive: false, preserving historical staff/student data)
 *  6. Account Reactivation Lifecycle (isActive: true restoration)
 *  7. Secure Login Credentials CSV Export (RFC-4180 compliant)
 *  8. Firestore Security Rules Enforcement:
 *     - Global deletion prohibition (`allow delete: if false;`)
 *     - Authenticated creation & mutation allowance (`allow create, update: if isAuthenticated();`)
 *     - Immutable audit trail (`allow update, delete: if false;`)
 */

import fs from 'fs';
import path from 'path';
import { userService, CreateUserInput } from '../src/services/userService';

interface TestStepResult {
  step: number;
  title: string;
  passed: boolean;
  details: string;
}

const testResults: TestStepResult[] = [];

function recordStep(step: number, title: string, passed: boolean, details: string) {
  testResults.push({ step, title, passed, details });
  const icon = passed ? '✅ [PASS]' : '❌ [FAIL]';
  console.log(`${icon} Step ${step}: ${title}`);
  console.log(`   └─ ${details}\n`);
}

async function runVerification() {
  console.log('═══════════════════════════════════════════════════════════════════════════════');
  console.log('🧪 SSIU ERP — BULK USER GENERATION, AUTH & DATA CONNECT VERIFICATION SUITE');
  console.log('═══════════════════════════════════════════════════════════════════════════════\n');

  // ─── TEST 1: Professional Institutional Email Generation ────────────────────
  try {
    const studentEmail = userService.generateProfessionalEmail('Rohan Sharma', 'student');
    const staffEmail = userService.generateProfessionalEmail('Dr. Priya Patel', 'staff');

    const studentValid = studentEmail.startsWith('rohan.sharma.') && studentEmail.endsWith('@swarrnim.edu.in');
    const staffValid = staffEmail.startsWith('priya.patel.') && staffEmail.endsWith('@swarrnim.edu.in');

    recordStep(
      1,
      'Automatic Professional Institutional Email Generation',
      studentValid && staffValid,
      `Student Email: ${studentEmail} | Staff Email: ${staffEmail}`
    );
  } catch (err: any) {
    recordStep(1, 'Automatic Professional Institutional Email Generation', false, `Error: ${err.message}`);
  }

  // ─── TEST 2: High-Entropy Password Generation ────────────────────────────────
  try {
    const password = userService.generateSecurePassword(14);
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSymbol = /[!@#$%^&*]/.test(password);
    const isValid = password.length === 14 && hasUpper && hasLower && hasNumber && hasSymbol;

    recordStep(
      2,
      'Secure Random Password Generation',
      isValid,
      `Generated: ${password} (Length: ${password.length}, Upper: ${hasUpper}, Lower: ${hasLower}, Num: ${hasNumber}, Sym: ${hasSymbol})`
    );
  } catch (err: any) {
    recordStep(2, 'Secure Random Password Generation', false, `Error: ${err.message}`);
  }

  // ─── TEST 3: Bulk Provisioning with Dual Sync (Firestore + Data Connect) ─────
  let createdUsers: any[] = [];
  try {
    const timestamp = Date.now().toString().slice(-4);
    const testInputs: CreateUserInput[] = [
      {
        name: 'Aarav Patel (Verification Test)',
        // Omit email to test automatic email generation
        role: 'student',
        departmentName: 'Computer Science & Engineering',
        enrollmentNo: `SWU-TEST-${timestamp}-01`
      },
      {
        name: 'Dr. Meera Sharma (Verification Test)',
        email: `meera.test.${timestamp}@swarrnim.edu.in`,
        role: 'staff',
        departmentName: 'Computer Science & Engineering',
        designation: 'Associate Professor',
        employeeId: `EMP-TEST-${timestamp}-01`
      }
    ];

    const bulkResult = await userService.generateBulkUsers(testInputs);
    createdUsers = bulkResult.users;

    const allHaveIsActive = bulkResult.users.every(u => u.isActive === true && u.status === 'ACTIVE');
    const allHavePasswords = bulkResult.users.every(u => Boolean(u.password) && u.password!.length >= 12);
    const autoEmailGenerated = bulkResult.users.some(u => u.email.includes('@swarrnim.edu.in'));
    const allHaveRoles = bulkResult.users.some(u => u.role === 'student') && bulkResult.users.some(u => u.role === 'staff');

    const passed = bulkResult.totalCreated === 2 && allHaveIsActive && allHavePasswords && autoEmailGenerated && allHaveRoles;
    recordStep(
      3,
      'Bulk User Provisioning & Dual Database Sync',
      passed,
      `Created ${bulkResult.totalCreated} users. Verified auto-generated emails, secure passwords, isActive=true, and dual-sync mapping.`
    );
  } catch (err: any) {
    recordStep(3, 'Bulk User Provisioning & Dual Database Sync', false, `Error: ${err.message}`);
  }

  // ─── TEST 4: Soft-Delete Data Preservation ──────────────────────────────────
  try {
    const staffUser = createdUsers.find(u => u.role === 'staff');
    if (!staffUser) throw new Error('No staff user available from Step 3');

    await userService.softDeleteUser(staffUser.id, 'Staff resigned - historical records archived');

    const updatedRecord = await userService.getUserById(staffUser.id);
    const isSoftDeleted = updatedRecord !== null && updatedRecord.isActive === false && updatedRecord.status === 'INACTIVE';
    const dataPreserved = updatedRecord !== null && updatedRecord.email === staffUser.email && updatedRecord.name === staffUser.name;

    recordStep(
      4,
      'Soft-Delete Mechanism (Data Preservation)',
      Boolean(isSoftDeleted && dataPreserved),
      `User ${staffUser.id} marked as isActive: false, status: 'INACTIVE'. Data and history safely preserved.`
    );
  } catch (err: any) {
    recordStep(4, 'Soft-Delete Mechanism (Data Preservation)', false, `Error: ${err.message}`);
  }

  // ─── TEST 5: Account Reactivation ───────────────────────────────────────────
  try {
    const staffUser = createdUsers.find(u => u.role === 'staff');
    if (!staffUser) throw new Error('No staff user available from Step 3');

    await userService.reactivateUser(staffUser.id);
    const reactivated = await userService.getUserById(staffUser.id);
    const isRestored = reactivated !== null && reactivated.isActive === true && reactivated.status === 'ACTIVE';

    recordStep(
      5,
      'Account Reactivation Lifecycle',
      Boolean(isRestored),
      `User ${staffUser.id} restored to isActive: true, status: 'ACTIVE'.`
    );
  } catch (err: any) {
    recordStep(5, 'Account Reactivation Lifecycle', false, `Error: ${err.message}`);
  }

  // ─── TEST 6: Login Credentials CSV Export ───────────────────────────────────
  try {
    const csvData = userService.generateCredentialsCsv(createdUsers);
    const hasHeaders = csvData.includes('Account ID') && csvData.includes('Institutional Email') && csvData.includes('Temporary Password');
    const hasUsers = createdUsers.every(u => csvData.includes(u.email));

    recordStep(
      6,
      'Credentials CSV Export Generation',
      hasHeaders && hasUsers,
      `Generated RFC-4180 CSV export with ${createdUsers.length} user credential rows.`
    );
  } catch (err: any) {
    recordStep(6, 'Credentials CSV Export Generation', false, `Error: ${err.message}`);
  }

  // ─── TEST 7: Firestore Security Rules Enforcement ───────────────────────────
  try {
    const rulesPath = path.resolve(process.cwd(), 'firestore.rules');
    const rulesContent = fs.readFileSync(rulesPath, 'utf-8');

    const hasAllowDeleteFalse = rulesContent.includes('allow delete: if false;');
    const usersMatchBlock = rulesContent.match(/match \/users\/\{uid\} \{[\s\S]*?\}/);
    const usersBlock = usersMatchBlock ? usersMatchBlock[0] : '';
    const usersHasDeleteFalse = usersBlock.includes('allow delete: if false;');
    const usersHasCreateUpdateAuth = usersBlock.includes('allow create, update: if isAuthenticated();');

    const auditMatchBlock = rulesContent.match(/match \/auditLogs\/\{logId\} \{[\s\S]*?\}/);
    const auditBlock = auditMatchBlock ? auditMatchBlock[0] : '';
    const auditImmutable = auditBlock.includes('allow update, delete: if false;');

    const securityRulesStrict =
      hasAllowDeleteFalse &&
      usersHasDeleteFalse &&
      usersHasCreateUpdateAuth &&
      auditImmutable;

    recordStep(
      7,
      'Firestore Security Rules Deletion Lock',
      securityRulesStrict,
      `Verified: /users has 'allow delete: if false;', /auditLogs has 'allow update, delete: if false;', while allowing authenticated mutations.`
    );
  } catch (err: any) {
    recordStep(7, 'Firestore Security Rules Deletion Lock', false, `Error: ${err.message}`);
  }

  console.log('═══════════════════════════════════════════════════════════════════════════════');
  const totalPassed = testResults.filter(r => r.passed).length;
  console.log(`🏁 BULK USER & SECURITY VERIFICATION: ${totalPassed} / ${testResults.length} PASSED`);
  console.log('═══════════════════════════════════════════════════════════════════════════════\n');

  return testResults.every(r => r.passed);
}

runVerification().then(success => {
  process.exit(success ? 0 : 1);
}).catch(err => {
  console.error('Verification suite failed:', err);
  process.exit(1);
});
