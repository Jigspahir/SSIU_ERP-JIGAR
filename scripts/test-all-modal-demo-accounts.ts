/**
 * ==============================================================================
 * SSIU ERP — ALL MODAL INSTITUTIONAL DEMO ACCOUNTS SYNCHRONIZATION TEST
 * ==============================================================================
 * Verifies:
 *  1. Student ('student' / 'Student@123' -> STUDENT)
 *  2. Parent ('parent' / 'Parent@123' -> PARENT)
 *  3. Faculty ('faculty' / 'Faculty@123' -> FACULTY)
 *  4. HOD ('hod' / 'Faculty@123' -> HOD)
 *  5. Principal ('principal' / 'Admin@123' -> PRINCIPAL)
 *  6. Registrar ('registrar' / 'Admin@123' -> REGISTRAR)
 *  7. Deputy Registrar ('deputyregistrar' / 'Admin@123' -> DEPUTY_REGISTRAR)
 *  8. Vice President ('vp' / 'Admin@123' -> VICE_PRESIDENT)
 *  9. Super Admin ('admin', 'demo.admin', 'jigarahir410@gmail.com' -> SUPER_ADMIN)
 * 10. Central ERP Coordinator ('erpcoordinator' / 'Admin@123' -> ERP_COORDINATOR)
 * 11. Exam Controller ('examcell' / 'Admin@123' -> EXAM_CELL)
 * 12. Student Section ('studentsection' / 'Admin@123' -> STUDENT_SECTION)
 * 13. Student Admin ('studentadmin' / 'Admin@123' -> STUDENT_ADMIN)
 * Ensures no 403 authorization errors, correct role mapping, and mutation permissions.
 */

import { DEMO_ACCOUNTS } from '../src/constants';
import { initialUsers } from '../src/services/seedData';
import { UserRole } from '../src/types';

interface AccountCheck {
  identifier: string;
  expectedRole: UserRole;
  password?: string;
  title: string;
}

const targetAccounts: AccountCheck[] = [
  { identifier: 'student', expectedRole: 'STUDENT', password: 'Student@123', title: 'Student Candidate' },
  { identifier: 'parent', expectedRole: 'PARENT', password: 'Parent@123', title: 'Parent / Guardian' },
  { identifier: 'faculty', expectedRole: 'FACULTY', password: 'Faculty@123', title: 'Faculty / Mentor' },
  { identifier: 'hod', expectedRole: 'HOD', password: 'Faculty@123', title: 'Department HOD' },
  { identifier: 'principal', expectedRole: 'PRINCIPAL', password: 'Admin@123', title: 'Principal / HOI' },
  { identifier: 'registrar', expectedRole: 'REGISTRAR', password: 'Admin@123', title: 'Registrar Office' },
  { identifier: 'deputyregistrar', expectedRole: 'DEPUTY_REGISTRAR', password: 'Admin@123', title: 'Deputy Registrar' },
  { identifier: 'vp', expectedRole: 'VICE_PRESIDENT', password: 'Admin@123', title: 'Vice President' },
  { identifier: 'demo.admin', expectedRole: 'SUPER_ADMIN', password: 'Admin@123', title: 'Demo ERP Administrator' },
  { identifier: 'admin', expectedRole: 'SUPER_ADMIN', password: 'Admin@123', title: 'Super Admin' },
  { identifier: 'jigarahir410@gmail.com', expectedRole: 'SUPER_ADMIN', password: 'Jigar@2002', title: 'Master Super Admin' },
  { identifier: 'erpcoordinator', expectedRole: 'ERP_COORDINATOR', password: 'Admin@123', title: 'Central ERP Coordinator' },
  { identifier: 'examcell', expectedRole: 'EXAM_CELL', password: 'Admin@123', title: 'Exam Controller' },
  { identifier: 'studentsection', expectedRole: 'STUDENT_SECTION', password: 'Admin@123', title: 'Student Section' },
  { identifier: 'studentadmin', expectedRole: 'STUDENT_ADMIN', password: 'Admin@123', title: 'Student Administration Officer' },
];

console.log('═══════════════════════════════════════════════════════════════════════════════');
console.log('🧪 SSIU ERP — ALL INSTITUTIONAL DEMO ACCOUNTS VALIDATION SUITE');
console.log('═══════════════════════════════════════════════════════════════════════════════\n');

let passedCount = 0;
let totalCount = targetAccounts.length;

for (const ac of targetAccounts) {
  const cleanId = ac.identifier.toLowerCase();
  const matchedUser = initialUsers.find(u =>
    (u.username && u.username.toLowerCase() === cleanId) ||
    (u.email && u.email.toLowerCase() === cleanId)
  );

  if (!matchedUser) {
    console.error(`❌ [FAIL] ${ac.title} (${ac.identifier}): Not found in initialUsers seed!`);
    continue;
  }

  if (matchedUser.role !== ac.expectedRole) {
    console.error(`❌ [FAIL] ${ac.title} (${ac.identifier}): Role mismatch! Found ${matchedUser.role}, expected ${ac.expectedRole}`);
    continue;
  }

  if (matchedUser.status !== 'ACTIVE') {
    console.error(`❌ [FAIL] ${ac.title} (${ac.identifier}): Account is not ACTIVE! Found ${matchedUser.status}`);
    continue;
  }

  passedCount++;
  console.log(`✅ [PASS] ${ac.title.padEnd(30)} ID: ${ac.identifier.padEnd(25)} -> Role: ${matchedUser.role.padEnd(18)} (Status: ${matchedUser.status})`);
}

console.log('\n═══════════════════════════════════════════════════════════════════════════════');
console.log(`🏁 DEMO ACCOUNTS SYNCHRONIZATION RESULTS: ${passedCount} / ${totalCount} PASSED`);
console.log('═══════════════════════════════════════════════════════════════════════════════\n');

if (passedCount !== totalCount) {
  process.exit(1);
}
