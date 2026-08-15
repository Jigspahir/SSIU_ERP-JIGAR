/**
 * SSIU ERP — Database Demo Seed Script (Backend Phase 6 Academic & Mappings Enabled)
 * Populates core masters, 21 roles, RBAC permissions, demo accounts, workflows, subjects, and student-faculty mappings.
 */

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting SSIU ERP Database, Workflow & Academic Mapping Seeding...');

  const saltRounds = 10;
  const adminPasswordHash = await bcrypt.hash('Admin@123', saltRounds);
  const regPasswordHash = await bcrypt.hash('Registrar@123', saltRounds);
  const hoiPasswordHash = await bcrypt.hash('Hoi@123', saltRounds);
  const hodPasswordHash = await bcrypt.hash('Hod@123', saltRounds);
  const facPasswordHash = await bcrypt.hash('Faculty@123', saltRounds);
  const stuPasswordHash = await bcrypt.hash('Student@123', saltRounds);

  // 1. University
  const university = await prisma.university.upsert({
    where: { code: 'SSIU' },
    update: {},
    create: {
      code: 'SSIU',
      name: 'Swarrnim Startup & Innovation University',
      tagline: "India's First Startup University",
      address: 'Bhayan, Gandhinagar - Ahmedabad Highway, Gujarat 382421',
      website: 'https://swarrnim.edu.in',
      email: 'info@swarrnim.edu.in',
      phone: '+91 70690 03001',
      status: 'ACTIVE',
    },
  });

  // 2. Institute
  const institute = await prisma.institute.upsert({
    where: { code: 'SSCIT' },
    update: {},
    create: {
      code: 'SSCIT',
      name: 'Swarrnim Institute of Technology',
      shortName: 'SSCIT',
      universityId: university.id,
      status: 'ACTIVE',
    },
  });

  // 3. Department
  const department = await prisma.department.upsert({
    where: { code: 'CSE' },
    update: {},
    create: {
      code: 'CSE',
      name: 'Computer Engineering Department',
      instituteId: institute.id,
      status: 'ACTIVE',
    },
  });

  // 4. Program
  const program = await prisma.program.upsert({
    where: { code: 'BTECH-CSE' },
    update: {},
    create: {
      code: 'BTECH-CSE',
      name: 'B.Tech in Computer Engineering',
      degreeType: 'UG',
      durationYears: 4,
      departmentId: department.id,
      status: 'ACTIVE',
    },
  });

  // 5. Academic Year & Batch
  const academicYear = await prisma.academicYear.upsert({
    where: { code: 'AY-2026-27' },
    update: {},
    create: {
      code: 'AY-2026-27',
      startYear: 2026,
      endYear: 2027,
      isCurrent: true,
      status: 'ACTIVE',
    },
  });

  const batch = await prisma.batch.upsert({
    where: { code: 'BATCH-2026-30' },
    update: {},
    create: {
      code: 'BATCH-2026-30',
      programId: program.id,
      academicYearId: academicYear.id,
      startYear: 2026,
      endYear: 2030,
      status: 'ACTIVE',
    },
  });

  // 6. Semester & Division
  const semester = await prisma.semester.create({
    data: { semesterNumber: 1, name: 'Semester 1', batchId: batch.id, status: 'ACTIVE' },
  });

  const division = await prisma.division.create({
    data: { name: 'A', semesterId: semester.id, status: 'ACTIVE' },
  });

  // 7. Seed Subject / Course Master
  const subject01 = await prisma.subject.upsert({
    where: { code: 'CSE101' },
    update: {},
    create: {
      code: 'CSE101',
      name: 'Data Structures & Algorithms',
      credits: 4,
      subjectType: 'THEORY',
      programId: program.id,
      semesterId: semester.id,
      status: 'ACTIVE',
    },
  });

  // 8. Seed All 21 Roles
  const rolesData = [
    { code: 'STUDENT', name: 'Student', authorityLevel: 10 },
    { code: 'MENTOR', name: 'Faculty Mentor', authorityLevel: 20 },
    { code: 'FACULTY', name: 'Faculty Member', authorityLevel: 30 },
    { code: 'HOD', name: 'Head of Department', authorityLevel: 40 },
    { code: 'HOI', name: 'Head of Institute / Principal', authorityLevel: 50 },
    { code: 'DEPUTY_REGISTRAR', name: 'Deputy Registrar', authorityLevel: 60 },
    { code: 'REGISTRAR', name: 'University Registrar', authorityLevel: 70 },
    { code: 'PROVOST', name: 'University Provost', authorityLevel: 80 },
    { code: 'VICE_PRESIDENT', name: 'Vice President', authorityLevel: 90 },
    { code: 'PRESIDENT', name: 'University President', authorityLevel: 100 },
    { code: 'FINANCE_OFFICER', name: 'Chief Finance Officer', authorityLevel: 65 },
    { code: 'EXAM_SECTION', name: 'Exam Controller / Section', authorityLevel: 55 },
    { code: 'HR', name: 'Human Resources Officer', authorityLevel: 55 },
    { code: 'STORE_MANAGER', name: 'Central Store Manager', authorityLevel: 45 },
    { code: 'IT_ADMIN', name: 'IT Infrastructure Administrator', authorityLevel: 85 },
    { code: 'LIBRARIAN', name: 'Chief Librarian', authorityLevel: 35 },
    { code: 'PLACEMENT_OFFICER', name: 'Training & Placement Officer', authorityLevel: 45 },
    { code: 'IQAC_COORDINATOR', name: 'IQAC / NAAC Coordinator', authorityLevel: 65 },
    { code: 'HOSTEL_WARDEN', name: 'Chief Hostel Warden', authorityLevel: 35 },
    { code: 'TRANSPORT_OFFICER', name: 'Transport Supervisor', authorityLevel: 35 },
    { code: 'SYSTEM_ADMIN', name: 'System Technical Administrator', authorityLevel: 95 },
  ];

  const roleMap = new Map<string, any>();
  for (const r of rolesData) {
    const roleRecord = await prisma.role.upsert({
      where: { code: r.code },
      update: { authorityLevel: r.authorityLevel },
      create: {
        code: r.code,
        name: r.name,
        authorityLevel: r.authorityLevel,
        status: 'ACTIVE',
      },
    });
    roleMap.set(r.code, roleRecord);
  }

  // 9. Seed Demo People
  const faculty01 = await prisma.faculty.upsert({
    where: { employeeCode: 'FAC-CSE-001' },
    update: {},
    create: {
      erpId: 'FAC000001',
      employeeCode: 'FAC-CSE-001',
      firstName: 'ABC',
      lastName: 'XYZ',
      email: 'abc.ce@swarrnim.edu.in',
      phone: '+91 0123456789',
      designation: 'HOD Computer Engineering',
      instituteId: institute.id,
      departmentId: department.id,
      status: 'ACTIVE',
    },
  });

  const faculty02 = await prisma.faculty.upsert({
    where: { employeeCode: 'FAC-CSE-002' },
    update: {},
    create: {
      erpId: 'FAC000002',
      employeeCode: 'FAC-CSE-002',
      firstName: 'Neha',
      lastName: 'Patel',
      email: 'neha.patel@swarrnim.edu.in',
      phone: '+91 98250 11223',
      designation: 'Assistant Professor',
      instituteId: institute.id,
      departmentId: department.id,
      status: 'ACTIVE',
    },
  });

  const student01 = await prisma.student.upsert({
    where: { enrollmentNo: '2026SSIUCE0101' },
    update: {},
    create: {
      erpId: 'STU000001',
      enrollmentNo: '2026SSIUCE0101',
      firstName: 'Demo',
      lastName: 'Student 01',
      email: 'student01@swarrnim.edu.in',
      instituteId: institute.id,
      departmentId: department.id,
      batchId: batch.id,
      currentDivisionId: division.id,
      status: 'ACTIVE',
    },
  });

  const student02 = await prisma.student.upsert({
    where: { enrollmentNo: '2026SSIUCE0102' },
    update: {},
    create: {
      erpId: 'STU000002',
      enrollmentNo: '2026SSIUCE0102',
      firstName: 'Demo',
      lastName: 'Student 02',
      email: 'student02@swarrnim.edu.in',
      instituteId: institute.id,
      departmentId: department.id,
      batchId: batch.id,
      currentDivisionId: division.id,
      status: 'ACTIVE',
    },
  });

  // 10. Seed Academic Mappings
  await prisma.studentFacultyMapping.upsert({
    where: {
      studentId_subjectId_mappingType: {
        studentId: student01.id,
        subjectId: subject01.id,
        mappingType: 'COURSE_TEACHER',
      },
    },
    update: {},
    create: {
      studentId: student01.id,
      facultyId: faculty01.id,
      subjectId: subject01.id,
      semesterId: semester.id,
      divisionId: division.id,
      mappingType: 'COURSE_TEACHER',
      status: 'ACTIVE',
    },
  });

  await prisma.studentMentorMapping.upsert({
    where: {
      studentId_academicYearId: {
        studentId: student01.id,
        academicYearId: academicYear.id,
      },
    },
    update: {},
    create: {
      studentId: student01.id,
      mentorFacultyId: faculty01.id,
      academicYearId: academicYear.id,
      status: 'ACTIVE',
    },
  });

  // 11. Seed Users
  const createDemoUser = async (erpId: string, username: string, passHash: string, roleCode: string, extra?: any) => {
    const role = roleMap.get(roleCode);
    const user = await prisma.user.upsert({
      where: { erpId },
      update: { passwordHash: passHash, accountStatus: 'ACTIVE' },
      create: {
        erpId,
        username,
        passwordHash: passHash,
        accountStatus: 'ACTIVE',
        ...extra,
      },
    });

    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: user.id, roleId: role.id } },
      update: {},
      create: {
        userId: user.id,
        roleId: role.id,
      },
    });
    return user;
  };

  await createDemoUser('ADM000001', 'superadmin', adminPasswordHash, 'SYSTEM_ADMIN');
  await createDemoUser('REG000001', 'reg_demo01', regPasswordHash, 'REGISTRAR');
  await createDemoUser('HOI000001', 'hoi_demo01', hoiPasswordHash, 'HOI');
  await createDemoUser('HOD000001', 'hod_demo01', hodPasswordHash, 'HOD', { facultyId: faculty01.id });
  await createDemoUser('FAC000001', 'fac_amitshah', facPasswordHash, 'FACULTY', { facultyId: faculty01.id });
  await createDemoUser('STU000001', 'stu_demo01', stuPasswordHash, 'STUDENT', { studentId: student01.id });
  await createDemoUser('STU000002', 'stu_demo02', stuPasswordHash, 'STUDENT', { studentId: student02.id });

  console.log('✅ Seeded Demo Students, Faculty, Subjects, and Academic Mappings');
  console.log('🎉 SSIU ERP Backend Phase 6 Seeding Completed Successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
