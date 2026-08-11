import { 
  Institute, Department, Program, AcademicYear, Batch, Semester, Division, Subject, 
  Faculty, Student, User, AuditLog, AttendanceSession, TimetableEntry, 
  SessionPlanTopic, UnitMaterial, Assignment, AssignmentSubmission, AcademicCalendarEvent,
  FeeStructure, StudentFeeRecord, FeePaymentTransaction,
  CRMLead, AdmissionApplication,
  Exam, ExamTimetable, ExamForm, StudentMarks, StudentResult, StudentFeedback, SupportTicket, StudentDocument,
  ERPNotification
} from '../types';

export const initialInstitutes: Institute[] = [
  {
    id: 'inst-1',
    code: 'SSCIT',
    name: 'Swarrnim School of Computer & IT',
    type: 'Engineering',
    establishedYear: 2017,
    principalName: 'Demo Principal',
    email: 'demo.principal@university.edu',
    phone: '+91 79 2328 1001',
    location: 'Swarrnim Campus, Gandhinagar',
    status: 'ACTIVE'
  },
  {
    id: 'inst-2',
    code: 'SSD',
    name: 'Swarrnim School of Design',
    type: 'Design',
    establishedYear: 2018,
    principalName: 'Demo Principal Two',
    email: 'demo.principal2@university.edu',
    phone: '+91 79 2328 1002',
    location: 'Design Block, Swarrnim Campus, Gandhinagar',
    status: 'ACTIVE'
  },
  {
    id: 'inst-3',
    code: 'SSB',
    name: 'Swarrnim School of Business',
    type: 'Management',
    establishedYear: 2017,
    principalName: 'Demo Principal Three',
    email: 'demo.principal3@university.edu',
    phone: '+91 79 2328 1003',
    location: 'Management Block, Swarrnim Campus, Gandhinagar',
    status: 'ACTIVE'
  }
];

export const initialDepartments: Department[] = [
  {
    id: 'dept-1',
    code: 'CSE',
    name: 'Computer Science & Engineering',
    instituteId: 'inst-1',
    hodName: 'Demo HOD',
    email: 'demo.hod@university.edu',
    phone: '+91 79 2328 1010',
    status: 'ACTIVE'
  },
  {
    id: 'dept-2',
    code: 'IT',
    name: 'Information Technology',
    instituteId: 'inst-1',
    hodName: 'Demo HOD Two',
    email: 'demo.hod2@university.edu',
    phone: '+91 79 2328 1011',
    status: 'ACTIVE'
  },
  {
    id: 'dept-3',
    code: 'AI-ML',
    name: 'Artificial Intelligence & Machine Learning',
    instituteId: 'inst-1',
    hodName: 'Demo HOD Three',
    email: 'demo.hod3@university.edu',
    phone: '+91 79 2328 1012',
    status: 'ACTIVE'
  },
  {
    id: 'dept-4',
    code: 'UID',
    name: 'User Interface & Interaction Design',
    instituteId: 'inst-2',
    hodName: 'Demo HOD Four',
    email: 'demo.hod4@university.edu',
    phone: '+91 79 2328 1020',
    status: 'ACTIVE'
  },
  {
    id: 'dept-5',
    code: 'ENT',
    name: 'Innovation & Entrepreneurship',
    instituteId: 'inst-3',
    hodName: 'Demo HOD Five',
    email: 'demo.hod5@university.edu',
    phone: '+91 79 2328 1030',
    status: 'ACTIVE'
  }
];

export const initialPrograms: Program[] = [
  {
    id: 'prog-1',
    code: 'BTECH-CSE',
    name: 'B.Tech in Computer Science & Engineering',
    degreeType: 'B.Tech',
    durationYears: 4,
    totalSemesters: 8,
    intakeCapacity: 120,
    departmentId: 'dept-1',
    instituteId: 'inst-1',
    status: 'ACTIVE'
  },
  {
    id: 'prog-2',
    code: 'BTECH-AI',
    name: 'B.Tech in Artificial Intelligence & Data Science',
    degreeType: 'B.Tech',
    durationYears: 4,
    totalSemesters: 8,
    intakeCapacity: 60,
    departmentId: 'dept-3',
    instituteId: 'inst-1',
    status: 'ACTIVE'
  },
  {
    id: 'prog-3',
    code: 'MTECH-CSE',
    name: 'M.Tech in Computer Science & Engineering',
    degreeType: 'M.Tech',
    durationYears: 2,
    totalSemesters: 4,
    intakeCapacity: 30,
    departmentId: 'dept-1',
    instituteId: 'inst-1',
    status: 'ACTIVE'
  },
  {
    id: 'prog-4',
    code: 'BCA-INNO',
    name: 'Bachelor of Computer Applications (Cloud & AI)',
    degreeType: 'BCA',
    durationYears: 3,
    totalSemesters: 6,
    intakeCapacity: 60,
    departmentId: 'dept-2',
    instituteId: 'inst-1',
    status: 'ACTIVE'
  },
  {
    id: 'prog-5',
    code: 'B-DES-UI',
    name: 'Bachelor of Design in Product & UI/UX',
    degreeType: 'B.Des',
    durationYears: 4,
    totalSemesters: 8,
    intakeCapacity: 40,
    departmentId: 'dept-4',
    instituteId: 'inst-2',
    status: 'ACTIVE'
  },
  {
    id: 'prog-6',
    code: 'MBA-ENT',
    name: 'MBA in Innovation, Entrepreneurship & Venture Development',
    degreeType: 'MBA',
    durationYears: 2,
    totalSemesters: 4,
    intakeCapacity: 60,
    departmentId: 'dept-5',
    instituteId: 'inst-3',
    status: 'ACTIVE'
  },
  {
    id: 'prog-7',
    code: 'PHD-CS',
    name: 'Doctor of Philosophy in Computer Science',
    degreeType: 'Ph.D',
    durationYears: 3,
    totalSemesters: 6,
    intakeCapacity: 10,
    departmentId: 'dept-1',
    instituteId: 'inst-1',
    status: 'ACTIVE'
  }
];

export const initialAcademicYears: AcademicYear[] = [
  {
    id: 'ay-2024',
    name: '2024-2025',
    startDate: '2024-06-15',
    endDate: '2025-05-30',
    isCurrent: true,
    status: 'ACTIVE'
  },
  {
    id: 'ay-2023',
    name: '2023-2024',
    startDate: '2023-06-15',
    endDate: '2024-05-30',
    isCurrent: false,
    status: 'ARCHIVED'
  },
  {
    id: 'ay-2025',
    name: '2025-2026',
    startDate: '2025-06-15',
    endDate: '2026-05-30',
    isCurrent: false,
    status: 'ACTIVE'
  }
];

export const initialBatches: Batch[] = [
  {
    id: 'batch-2023-2027',
    name: 'Batch 2023-2027',
    programId: 'prog-1',
    academicYearId: 'ay-2023',
    startYear: 2023,
    endYear: 2027,
    status: 'ACTIVE'
  },
  {
    id: 'batch-2024-2028',
    name: 'Batch 2024-2028',
    programId: 'prog-1',
    academicYearId: 'ay-2024',
    startYear: 2024,
    endYear: 2028,
    status: 'ACTIVE'
  },
  {
    id: 'batch-ai-2023-2027',
    name: 'Batch AI 2023-2027',
    programId: 'prog-2',
    academicYearId: 'ay-2023',
    startYear: 2023,
    endYear: 2027,
    status: 'ACTIVE'
  },
  {
    id: 'batch-bca-2023-2026',
    name: 'Batch BCA 2023-2026',
    programId: 'prog-4',
    academicYearId: 'ay-2023',
    startYear: 2023,
    endYear: 2026,
    status: 'ACTIVE'
  }
];

export const initialSemesters: Semester[] = [
  {
    id: 'sem-cse-4',
    number: 4,
    code: 'SEM-4',
    programId: 'prog-1',
    academicYearId: 'ay-2024',
    status: 'ACTIVE'
  },
  {
    id: 'sem-cse-3',
    number: 3,
    code: 'SEM-3',
    programId: 'prog-1',
    academicYearId: 'ay-2023',
    status: 'COMPLETED'
  },
  {
    id: 'sem-cse-2',
    number: 2,
    code: 'SEM-2',
    programId: 'prog-1',
    academicYearId: 'ay-2023',
    status: 'COMPLETED'
  },
  {
    id: 'sem-cse-1',
    number: 1,
    code: 'SEM-1',
    programId: 'prog-1',
    academicYearId: 'ay-2023',
    status: 'COMPLETED'
  },
  {
    id: 'sem-bca-3',
    number: 3,
    code: 'SEM-3',
    programId: 'prog-4',
    academicYearId: 'ay-2024',
    status: 'ACTIVE'
  }
];

export const initialDivisions: Division[] = [
  {
    id: 'div-cse-4a',
    name: 'Division A',
    semesterId: 'sem-cse-4',
    batchId: 'batch-2023-2027',
    programId: 'prog-1',
    capacity: 60,
    roomNo: 'Lab-301',
    status: 'ACTIVE'
  },
  {
    id: 'div-cse-4b',
    name: 'Division B',
    semesterId: 'sem-cse-4',
    batchId: 'batch-2023-2027',
    programId: 'prog-1',
    capacity: 60,
    roomNo: 'Lab-302',
    status: 'ACTIVE'
  },
  {
    id: 'div-bca-3a',
    name: 'Division BCA-A',
    semesterId: 'sem-bca-3',
    batchId: 'batch-bca-2023-2026',
    programId: 'prog-4',
    capacity: 50,
    roomNo: 'Lab-104',
    status: 'ACTIVE'
  }
];

export const initialSubjects: Subject[] = [
  {
    id: 'sub-dsa',
    code: 'CSE-401',
    name: 'Data Structures & Algorithms',
    semesterId: 'sem-cse-4',
    programId: 'prog-1',
    departmentId: 'dept-1',
    type: 'THEORY',
    credits: 4,
    theoryHoursPerWeek: 3,
    labHoursPerWeek: 2,
    status: 'ACTIVE'
  },
  {
    id: 'sub-dbms',
    code: 'CSE-402',
    name: 'Database Management Systems',
    semesterId: 'sem-cse-4',
    programId: 'prog-1',
    departmentId: 'dept-1',
    type: 'THEORY',
    credits: 4,
    theoryHoursPerWeek: 3,
    labHoursPerWeek: 2,
    status: 'ACTIVE'
  },
  {
    id: 'sub-webtech',
    code: 'CSE-403',
    name: 'Modern Web Architecture & Frameworks',
    semesterId: 'sem-cse-4',
    programId: 'prog-1',
    departmentId: 'dept-1',
    type: 'PRACTICAL',
    credits: 3,
    theoryHoursPerWeek: 2,
    labHoursPerWeek: 2,
    status: 'ACTIVE'
  },
  {
    id: 'sub-ai',
    code: 'CSE-404',
    name: 'Artificial Intelligence Foundations',
    semesterId: 'sem-cse-4',
    programId: 'prog-1',
    departmentId: 'dept-1',
    type: 'THEORY',
    credits: 3,
    theoryHoursPerWeek: 3,
    labHoursPerWeek: 0,
    status: 'ACTIVE'
  },
  {
    id: 'sub-ent',
    code: 'SSI-101',
    name: 'Startup Ideation & Innovation',
    semesterId: 'sem-cse-2',
    programId: 'prog-1',
    departmentId: 'dept-1',
    type: 'ELECTIVE',
    credits: 2,
    theoryHoursPerWeek: 2,
    labHoursPerWeek: 0,
    status: 'ACTIVE'
  }
];

export const initialFaculty: Faculty[] = [
  {
    id: 'fac-1',
    employeeId: 'EMP-CSE-001',
    name: 'Prof. Demo Faculty',
    email: 'demo.faculty@university.edu',
    phone: '+91 98765 22001',
    photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80',
    designation: 'Associate Professor',
    instituteId: 'inst-1',
    departmentId: 'dept-1',
    qualification: 'Ph.D. in Computer Science',
    specialization: 'Database Systems & Web Architecture',
    joiningDate: '2019-01-10',
    dateOfBirth: '1985-09-24',
    bloodGroup: 'B+',
    address: 'Swarrnim Faculty Quarters, Gandhinagar',
    experienceYears: 9,
    subjectIds: ['sub-dbms', 'sub-webtech'],
    status: 'ACTIVE'
  },
  {
    id: 'fac-2',
    employeeId: 'EMP-CSE-002',
    name: 'Prof. Demo Faculty Two',
    email: 'demo.faculty2@university.edu',
    phone: '+91 98765 22002',
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80',
    designation: 'Professor',
    instituteId: 'inst-1',
    departmentId: 'dept-1',
    qualification: 'Ph.D. in AI & Data Science',
    specialization: 'Artificial Intelligence, High Performance Computing',
    joiningDate: '2017-06-15',
    dateOfBirth: '1980-04-12',
    bloodGroup: 'O+',
    address: 'Swarrnim Campus, Gandhinagar',
    experienceYears: 14,
    subjectIds: ['sub-dsa', 'sub-ai'],
    status: 'ACTIVE'
  },
  {
    id: 'fac-3',
    employeeId: 'EMP-CSE-003',
    name: 'Prof. Demo Faculty Three',
    email: 'demo.faculty3@university.edu',
    phone: '+91 98765 22003',
    photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    designation: 'Assistant Professor',
    instituteId: 'inst-1',
    departmentId: 'dept-1',
    qualification: 'M.Tech in Software Engineering',
    specialization: 'Object Oriented Programming, Algorithms',
    joiningDate: '2021-08-01',
    dateOfBirth: '1990-11-05',
    bloodGroup: 'A+',
    address: 'Swarrnim Staff Housing, Gandhinagar',
    experienceYears: 5,
    subjectIds: ['sub-dsa'],
    status: 'ACTIVE'
  },
  {
    id: 'fac-4',
    employeeId: 'EMP-MGMT-001',
    name: 'Prof. Demo Faculty Four',
    email: 'demo.faculty4@university.edu',
    phone: '+91 98765 22004',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    designation: 'Professor',
    instituteId: 'inst-3',
    departmentId: 'dept-5',
    qualification: 'Ph.D in Entrepreneurship',
    specialization: 'Venture Capital, Startup Incubation, Business Strategy',
    joiningDate: '2018-07-20',
    dateOfBirth: '1978-02-18',
    bloodGroup: 'AB+',
    address: 'Innovation Quarters, Swarrnim Campus',
    experienceYears: 16,
    subjectIds: ['sub-ent'],
    status: 'ACTIVE'
  }
];

export const initialStudents: Student[] = [
  {
    id: 'stu-1',
    enrollmentNo: '230101001',
    name: 'Demo Student',
    email: 'demo.student@university.edu',
    phone: '+91 91234 56789',
    photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80',
    gender: 'Male',
    dateOfBirth: '2004-03-15',
    bloodGroup: 'B+',
    address: 'Swarrnim Student Hostel Block A, Gandhinagar',
    admissionDate: '2023-07-15',
    instituteId: 'inst-1',
    departmentId: 'dept-1',
    programId: 'prog-1',
    academicYearId: 'ay-2024',
    batchId: 'batch-2023-2027',
    semesterId: 'sem-cse-4',
    divisionId: 'div-cse-4a',
    guardianName: 'Guardian Demo',
    guardianPhone: '+91 98250 11223',
    abcId: '9842-1056-7890',
    abcIdStatus: 'VERIFIED',
    status: 'ACTIVE'
  },
  {
    id: 'stu-2',
    enrollmentNo: '230101002',
    name: 'Demo Student Two',
    email: 'demo.student2@university.edu',
    phone: '+91 91234 56790',
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
    gender: 'Female',
    dateOfBirth: '2004-08-22',
    bloodGroup: 'O+',
    address: 'Swarrnim Student Hostel Block B, Gandhinagar',
    admissionDate: '2023-07-16',
    instituteId: 'inst-1',
    departmentId: 'dept-1',
    programId: 'prog-1',
    academicYearId: 'ay-2024',
    batchId: 'batch-2023-2027',
    semesterId: 'sem-cse-4',
    divisionId: 'div-cse-4a',
    guardianName: 'Guardian Two',
    guardianPhone: '+91 98250 11224',
    abcId: '8712-4509-3321',
    abcIdStatus: 'PENDING_VERIFICATION',
    status: 'ACTIVE'
  },
  {
    id: 'stu-3',
    enrollmentNo: '230101003',
    name: 'Demo Student Three',
    email: 'demo.student3@university.edu',
    phone: '+91 91234 56791',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    gender: 'Male',
    dateOfBirth: '2003-12-10',
    bloodGroup: 'A+',
    address: 'Swarrnim Campus Residency, Gandhinagar',
    admissionDate: '2023-07-18',
    instituteId: 'inst-1',
    departmentId: 'dept-1',
    programId: 'prog-1',
    academicYearId: 'ay-2024',
    batchId: 'batch-2023-2027',
    semesterId: 'sem-cse-4',
    divisionId: 'div-cse-4b',
    guardianName: 'Guardian Demo Three',
    guardianPhone: '+91 98250 11225',
    status: 'ACTIVE'
  },
  {
    id: 'stu-4',
    enrollmentNo: '240101001',
    name: 'Demo Student Four',
    email: 'demo.student4@university.edu',
    phone: '+91 91234 56792',
    photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
    gender: 'Female',
    dateOfBirth: '2005-05-19',
    bloodGroup: 'AB+',
    address: 'Swarrnim Girls Hostel Block C, Gandhinagar',
    admissionDate: '2024-07-10',
    instituteId: 'inst-1',
    departmentId: 'dept-1',
    programId: 'prog-1',
    academicYearId: 'ay-2024',
    batchId: 'batch-2024-2028',
    semesterId: 'sem-cse-4',
    divisionId: 'div-cse-4a',
    guardianName: 'Guardian Demo Four',
    guardianPhone: '+91 98250 11226',
    status: 'ACTIVE'
  }
];

export const initialUsers: User[] = [
  {
    id: 'user-superadmin',
    name: 'Demo Admin',
    username: 'admin',
    email: 'demo.admin@university.edu',
    password: 'Admin@123',
    role: 'SUPER_ADMIN',
    phone: '+91 79 2328 1000',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    status: 'ACTIVE',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'user-univadmin',
    name: 'Demo Admin',
    username: 'univadmin',
    email: 'demo.admin@university.edu',
    password: 'Admin@123',
    role: 'UNIVERSITY_ADMIN',
    phone: '+91 79 2328 1001',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    status: 'ACTIVE',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'user-principal-1',
    name: 'Demo Principal',
    username: 'principal',
    email: 'demo.principal@university.edu',
    password: 'Admin@123',
    role: 'PRINCIPAL',
    instituteId: 'inst-1',
    phone: '+91 98765 43210',
    designation: 'Principal, SSCIT',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    status: 'ACTIVE',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'user-hod-1',
    name: 'Demo HOD',
    username: 'hod',
    email: 'demo.hod@university.edu',
    password: 'Faculty@123',
    role: 'HOD',
    instituteId: 'inst-1',
    departmentId: 'dept-1',
    phone: '+91 98765 11101',
    designation: 'HOD, Computer Science',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
    status: 'ACTIVE',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'user-faculty-1',
    name: 'Prof. Demo Faculty',
    username: 'faculty',
    email: 'demo.faculty@university.edu',
    password: 'Faculty@123',
    role: 'FACULTY',
    instituteId: 'inst-1',
    departmentId: 'dept-1',
    employeeId: 'EMP-CSE-001',
    phone: '+91 98765 22001',
    designation: 'Associate Professor',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80',
    status: 'ACTIVE',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'user-student-1',
    name: 'Demo Student',
    username: 'student',
    email: 'demo.student@university.edu',
    password: 'Student@123',
    role: 'STUDENT',
    instituteId: 'inst-1',
    departmentId: 'dept-1',
    programId: 'prog-1',
    enrollmentNo: '230101001',
    phone: '+91 91234 56789',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80',
    status: 'ACTIVE',
    createdAt: '2024-01-01T00:00:00Z'
  }
];

export const initialAuditLogs: AuditLog[] = [
  {
    id: 'log-1',
    timestamp: '2024-01-01T10:00:00Z',
    userName: 'Demo Admin',
    userRole: 'SUPER_ADMIN',
    action: 'SYSTEM_INIT',
    entity: 'Master System',
    details: 'Swarrnim University ERP system initialized with default master hierarchy.'
  },
  {
    id: 'log-2',
    timestamp: '2024-01-01T10:05:00Z',
    userName: 'Demo Admin',
    userRole: 'SUPER_ADMIN',
    action: 'CREATE',
    entity: 'Institutes',
    details: 'Created master record for Swarrnim School of Computer & IT (SSCIT)'
  },
  {
    id: 'log-3',
    timestamp: '2024-01-01T10:15:00Z',
    userName: 'Demo Admin',
    userRole: 'SUPER_ADMIN',
    action: 'CREATE',
    entity: 'Faculty',
    details: 'Added faculty profile Prof. Demo Faculty (EMP-CSE-001)'
  },
  {
    id: 'log-4',
    timestamp: '2024-01-01T10:20:00Z',
    userName: 'Demo Admin',
    userRole: 'SUPER_ADMIN',
    action: 'CREATE',
    entity: 'Students',
    details: 'Enrolled student Demo Student (230101001) in B.Tech CSE Semester 4'
  }
];

export const initialAttendanceSessions: AttendanceSession[] = [
  {
    id: 'att-1',
    date: '2024-10-10',
    subjectId: 'sub-dbms',
    divisionId: 'div-cse-4a',
    facultyId: 'fac-1',
    facultyName: 'Prof. Demo Faculty',
    lectureNo: 1,
    topicTaught: 'Relational Database Schema & Primary Key Constraints',
    submittedAt: '2024-10-10T10:15:00Z',
    status: 'SUBMITTED',
    records: [
      { studentId: 'stu-1', studentName: 'Demo Student', enrollmentNo: '230101001', status: 'PRESENT' },
      { studentId: 'stu-2', studentName: 'Demo Student Two', enrollmentNo: '230101002', status: 'PRESENT' },
      { studentId: 'stu-3', studentName: 'Demo Student Three', enrollmentNo: '230101003', status: 'ABSENT', remarks: 'Medical Leave' },
      { studentId: 'stu-4', studentName: 'Demo Student Four', enrollmentNo: '240101001', status: 'PRESENT' }
    ]
  },
  {
    id: 'att-2',
    date: '2024-10-12',
    subjectId: 'sub-webtech',
    divisionId: 'div-cse-4a',
    facultyId: 'fac-1',
    facultyName: 'Prof. Demo Faculty',
    lectureNo: 2,
    topicTaught: 'React State Hooks & Component Lifecycle Architecture',
    submittedAt: '2024-10-12T11:45:00Z',
    status: 'SUBMITTED',
    records: [
      { studentId: 'stu-1', studentName: 'Demo Student', enrollmentNo: '230101001', status: 'PRESENT' },
      { studentId: 'stu-2', studentName: 'Demo Student Two', enrollmentNo: '230101002', status: 'PRESENT' },
      { studentId: 'stu-3', studentName: 'Demo Student Three', enrollmentNo: '230101003', status: 'PRESENT' },
      { studentId: 'stu-4', studentName: 'Demo Student Four', enrollmentNo: '240101001', status: 'LATE', remarks: 'Arrived 10 mins late' }
    ]
  }
];

export const initialTimetableEntries: TimetableEntry[] = [
  {
    id: 'tt-1',
    dayOfWeek: 'Monday',
    timeSlot: '09:00 AM - 10:00 AM',
    subjectId: 'sub-dsa',
    facultyId: 'fac-2',
    divisionId: 'div-cse-4a',
    roomNo: 'Lab-301',
    departmentId: 'dept-1',
    status: 'ACTIVE'
  },
  {
    id: 'tt-2',
    dayOfWeek: 'Monday',
    timeSlot: '10:00 AM - 11:00 AM',
    subjectId: 'sub-dbms',
    facultyId: 'fac-1',
    divisionId: 'div-cse-4a',
    roomNo: 'Lab-301',
    departmentId: 'dept-1',
    status: 'ACTIVE'
  },
  {
    id: 'tt-3',
    dayOfWeek: 'Tuesday',
    timeSlot: '11:00 AM - 12:00 PM',
    subjectId: 'sub-webtech',
    facultyId: 'fac-1',
    divisionId: 'div-cse-4a',
    roomNo: 'Lab-301',
    departmentId: 'dept-1',
    status: 'ACTIVE'
  },
  {
    id: 'tt-4',
    dayOfWeek: 'Wednesday',
    timeSlot: '02:00 PM - 03:00 PM',
    subjectId: 'sub-ai',
    facultyId: 'fac-2',
    divisionId: 'div-cse-4a',
    roomNo: 'Lab-301',
    departmentId: 'dept-1',
    status: 'ACTIVE'
  },
  {
    id: 'tt-5',
    dayOfWeek: 'Thursday',
    timeSlot: '10:00 AM - 11:00 AM',
    subjectId: 'sub-dsa',
    facultyId: 'fac-2',
    divisionId: 'div-cse-4a',
    roomNo: 'Lab-301',
    departmentId: 'dept-1',
    status: 'ACTIVE'
  },
  {
    id: 'tt-6',
    dayOfWeek: 'Friday',
    timeSlot: '11:00 AM - 12:00 PM',
    subjectId: 'sub-dbms',
    facultyId: 'fac-1',
    divisionId: 'div-cse-4a',
    roomNo: 'Lab-301',
    departmentId: 'dept-1',
    status: 'ACTIVE'
  }
];

export const initialSessionPlanTopics: SessionPlanTopic[] = [
  {
    id: 'sp-1',
    subjectId: 'sub-dbms',
    unitNo: 1,
    lectureNo: 1,
    topicTitle: 'DBMS Overview, Architecture & 3-Schema Architecture',
    teachingMethod: 'PPT Presentation',
    plannedDate: '2024-09-01',
    completedDate: '2024-09-01',
    status: 'COMPLETED',
    facultyId: 'fac-1',
    notes: 'Covered Data Independence and Data Models'
  },
  {
    id: 'sp-2',
    subjectId: 'sub-dbms',
    unitNo: 1,
    lectureNo: 2,
    topicTitle: 'ER Diagrams & Relational Mapping Strategies',
    teachingMethod: 'Chalk & Board',
    plannedDate: '2024-09-08',
    completedDate: '2024-09-08',
    status: 'COMPLETED',
    facultyId: 'fac-1'
  },
  {
    id: 'sp-3',
    subjectId: 'sub-dbms',
    unitNo: 2,
    lectureNo: 3,
    topicTitle: 'Relational Algebra Operations & Query Optimization',
    teachingMethod: 'Lab Demonstration',
    plannedDate: '2024-09-15',
    completedDate: '2024-09-15',
    status: 'COMPLETED',
    facultyId: 'fac-1'
  },
  {
    id: 'sp-4',
    subjectId: 'sub-dbms',
    unitNo: 2,
    lectureNo: 4,
    topicTitle: 'Functional Dependencies & Normalization (1NF, 2NF, 3NF, BCNF)',
    teachingMethod: 'Chalk & Board',
    plannedDate: '2024-09-22',
    completedDate: '2024-09-22',
    status: 'COMPLETED',
    facultyId: 'fac-1'
  },
  {
    id: 'sp-5',
    subjectId: 'sub-dbms',
    unitNo: 3,
    lectureNo: 5,
    topicTitle: 'Transaction Processing Concepts & ACID Properties',
    teachingMethod: 'PPT Presentation',
    plannedDate: '2024-10-18',
    status: 'PENDING',
    facultyId: 'fac-1'
  },
  {
    id: 'sp-6',
    subjectId: 'sub-dbms',
    unitNo: 3,
    lectureNo: 6,
    topicTitle: 'Concurrency Control Protocols & Two-Phase Locking (2PL)',
    teachingMethod: 'Interactive Case Study',
    plannedDate: '2024-10-25',
    status: 'PENDING',
    facultyId: 'fac-1'
  }
];

export const initialUnitMaterials: UnitMaterial[] = [
  {
    id: 'mat-1',
    subjectId: 'sub-dbms',
    unitNo: 1,
    unitTitle: 'Unit 1: ER Modeling & Database Architecture',
    title: 'DBMS Module 1 - ER Modeling & Relational Algebra Lecture Notes',
    description: 'Comprehensive guide covering ER Diagrams, Entity Sets, Weak Entities, and Relational Algebra operators.',
    fileType: 'PDF',
    fileSize: '3.4 MB',
    fileUrl: 'https://swarrnim.edu.in/materials/dbms-unit1-notes.pdf',
    uploadedByFacultyId: 'fac-1',
    uploadedByFacultyName: 'Prof. Demo Faculty',
    uploadedDate: '2024-09-02'
  },
  {
    id: 'mat-2',
    subjectId: 'sub-dbms',
    unitNo: 2,
    unitTitle: 'Unit 2: Normalization & Advanced SQL',
    title: 'DBMS Module 2 - Normalization & Complex SQL Queries Slide Deck',
    description: 'Lecture slides on functional dependency decomposition, 3NF vs BCNF, and nested SQL join queries.',
    fileType: 'PPT',
    fileSize: '8.2 MB',
    fileUrl: 'https://swarrnim.edu.in/materials/dbms-unit2-slides.pptx',
    uploadedByFacultyId: 'fac-1',
    uploadedByFacultyName: 'Prof. Demo Faculty',
    uploadedDate: '2024-09-16'
  },
  {
    id: 'mat-3',
    subjectId: 'sub-webtech',
    unitNo: 1,
    unitTitle: 'Unit 1: Modern JavaScript & React Fundamentals',
    title: 'Web Architecture - Modern React & State Management Guide',
    description: 'Complete hands-on tutorial on React Hooks, Context API, Vite bundler, and CSS Design System Architecture.',
    fileType: 'PDF',
    fileSize: '5.1 MB',
    fileUrl: 'https://swarrnim.edu.in/materials/webtech-unit1-guide.pdf',
    uploadedByFacultyId: 'fac-1',
    uploadedByFacultyName: 'Prof. Demo Faculty',
    uploadedDate: '2024-09-20'
  }
];

export const initialAssignments: Assignment[] = [
  {
    id: 'asg-1',
    subjectId: 'sub-dbms',
    divisionId: 'div-cse-4a',
    unitNo: 1,
    title: 'Assignment 1: ER Diagram & Relational Schema Design',
    description: 'Design a normalized ER diagram and relational schema for Swarrnim Hospital Management System based on given specifications.',
    deadline: '2024-10-25',
    totalMarks: 20,
    createdByFacultyId: 'fac-1',
    createdByFacultyName: 'Prof. Demo Faculty',
    createdDate: '2024-10-01',
    attachmentUrl: 'https://swarrnim.edu.in/assignments/dbms-asg1-problem.pdf',
    status: 'ACTIVE'
  },
  {
    id: 'asg-2',
    subjectId: 'sub-webtech',
    divisionId: 'div-cse-4a',
    unitNo: 1,
    title: 'Assignment 2: Interactive React Dashboard Component',
    description: 'Build a responsive single-page dashboard component in React utilizing custom hooks and reusable CSS tokens.',
    deadline: '2024-11-05',
    totalMarks: 30,
    createdByFacultyId: 'fac-1',
    createdByFacultyName: 'Prof. Demo Faculty',
    createdDate: '2024-10-10',
    attachmentUrl: 'https://swarrnim.edu.in/assignments/webtech-asg2-spec.pdf',
    status: 'ACTIVE'
  }
];

export const initialAssignmentSubmissions: AssignmentSubmission[] = [
  {
    id: 'subm-1',
    assignmentId: 'asg-1',
    studentId: 'stu-1',
    studentName: 'Demo Student',
    enrollmentNo: '230101001',
    submittedDate: '2024-10-20',
    fileUrl: 'https://swarrnim.edu.in/submissions/stu-1-asg1.pdf',
    notes: 'Submitted solution containing ER diagram and relational table scripts.',
    status: 'GRADED',
    obtainedMarks: 18,
    feedback: 'Excellent ER diagram structure and well-defined primary keys!'
  }
];

export const initialAcademicCalendarEvents: AcademicCalendarEvent[] = [
  {
    id: 'cal-1',
    title: 'Mid-Semester Examinations (AY 2024-2025)',
    eventType: 'EXAM',
    startDate: '2024-10-15',
    endDate: '2024-10-22',
    description: 'Mid-semester written examinations for all B.Tech and BCA undergraduate programs.',
    location: 'Swarrnim Examination Centre, Block B',
    isImportant: true,
    createdBy: 'Demo Admin'
  },
  {
    id: 'cal-2',
    title: 'Diwali Festive Vacation & Holiday',
    eventType: 'HOLIDAY',
    startDate: '2024-10-31',
    endDate: '2024-11-05',
    description: 'University holiday on account of Diwali celebrations.',
    isImportant: false,
    createdBy: 'Demo Admin'
  },
  {
    id: 'cal-3',
    title: 'Swarrnim National Innovation Hackathon 2024',
    eventType: 'SEMINAR',
    startDate: '2024-11-15',
    endDate: '2024-11-16',
    description: '36-hour national startup hackathon hosted by Swarrnim Incubation Centre.',
    location: 'Swarrnim Auditorium & Incubation Lab',
    isImportant: true,
    createdBy: 'Demo Admin'
  },
  {
    id: 'cal-4',
    title: 'Annual University Sports & Cultural Odyssey',
    eventType: 'EVENT',
    startDate: '2024-12-05',
    endDate: '2024-12-08',
    description: 'Inter-institute sports competition and cultural evening performances.',
    location: 'Swarrnim University Sports Complex',
    isImportant: false,
    createdBy: 'Demo Admin'
  }
];

// --- PHASE 5: SEED DATA FOR FEES AND FINANCE MANAGEMENT ---

export const initialFeeStructures: FeeStructure[] = [
  {
    id: 'fs-btech-sem4',
    programId: 'prog-1',
    semesterId: 'sem-cse-4',
    academicYearId: 'ay-2024',
    tuitionFee: 45000,
    labFee: 8000,
    developmentFee: 7000,
    hostelFee: 15000,
    totalAmount: 75000,
    status: 'ACTIVE'
  },
  {
    id: 'fs-bca-sem3',
    programId: 'prog-4',
    semesterId: 'sem-bca-3',
    academicYearId: 'ay-2024',
    tuitionFee: 30000,
    labFee: 5000,
    developmentFee: 5000,
    hostelFee: 0,
    totalAmount: 40000,
    status: 'ACTIVE'
  },
  {
    id: 'fs-mtech-sem1',
    programId: 'prog-3',
    semesterId: 'sem-cse-1',
    academicYearId: 'ay-2024',
    tuitionFee: 55000,
    labFee: 10000,
    developmentFee: 8000,
    hostelFee: 15000,
    totalAmount: 88000,
    status: 'ACTIVE'
  }
];

export const initialStudentFeeRecords: StudentFeeRecord[] = [
  {
    id: 'sfr-stu1',
    studentId: 'stu-1',
    studentName: 'Demo Student',
    enrollmentNo: '230101001',
    programId: 'prog-1',
    semesterId: 'sem-cse-4',
    academicYearId: 'ay-2024',
    feeStructureId: 'fs-btech-sem4',
    tuitionFee: 45000,
    labFee: 8000,
    developmentFee: 7000,
    hostelFee: 15000,
    totalAmount: 75000,
    paidAmount: 75000,
    pendingAmount: 0,
    dueDate: '2024-09-30',
    status: 'PAID'
  },
  {
    id: 'sfr-stu2',
    studentId: 'stu-2',
    studentName: 'Demo Student Two',
    enrollmentNo: '230101002',
    programId: 'prog-1',
    semesterId: 'sem-cse-4',
    academicYearId: 'ay-2024',
    feeStructureId: 'fs-btech-sem4',
    tuitionFee: 45000,
    labFee: 8000,
    developmentFee: 7000,
    hostelFee: 15000,
    totalAmount: 75000,
    paidAmount: 45000,
    pendingAmount: 30000,
    dueDate: '2024-10-31',
    status: 'PARTIAL'
  },
  {
    id: 'sfr-stu3',
    studentId: 'stu-3',
    studentName: 'Demo Student Three',
    enrollmentNo: '230101003',
    programId: 'prog-1',
    semesterId: 'sem-cse-4',
    academicYearId: 'ay-2024',
    feeStructureId: 'fs-btech-sem4',
    tuitionFee: 45000,
    labFee: 8000,
    developmentFee: 7000,
    hostelFee: 15000,
    totalAmount: 75000,
    paidAmount: 0,
    pendingAmount: 75000,
    dueDate: '2024-08-31',
    status: 'OVERDUE'
  },
  {
    id: 'sfr-stu4',
    studentId: 'stu-4',
    studentName: 'Demo Student Four',
    enrollmentNo: '240101001',
    programId: 'prog-1',
    semesterId: 'sem-cse-4',
    academicYearId: 'ay-2024',
    feeStructureId: 'fs-btech-sem4',
    tuitionFee: 45000,
    labFee: 8000,
    developmentFee: 7000,
    hostelFee: 15000,
    totalAmount: 75000,
    paidAmount: 25000,
    pendingAmount: 50000,
    dueDate: '2024-11-15',
    status: 'PENDING'
  }
];

export const initialFeePaymentTransactions: FeePaymentTransaction[] = [
  {
    id: 'tx-001',
    studentFeeRecordId: 'sfr-stu1',
    receiptNo: 'SSIU-REC-2024-001',
    studentId: 'stu-1',
    studentName: 'Demo Student',
    enrollmentNo: '230101001',
    programId: 'prog-1',
    semesterId: 'sem-cse-4',
    paidAmount: 75000,
    paymentMode: 'Online UPI',
    transactionId: 'UPI9823471029',
    paymentDate: '2024-08-20',
    remarks: 'Full semester 4 tuition, lab, development and hostel fee payment.',
    recordedBy: 'Demo Admin'
  },
  {
    id: 'tx-002',
    studentFeeRecordId: 'sfr-stu2',
    receiptNo: 'SSIU-REC-2024-002',
    studentId: 'stu-2',
    studentName: 'Demo Student Two',
    enrollmentNo: '230101002',
    programId: 'prog-1',
    semesterId: 'sem-cse-4',
    paidAmount: 45000,
    paymentMode: 'Demand Draft',
    transactionId: 'DD-BOB-998822',
    paymentDate: '2024-09-10',
    remarks: '1st Installment tuition fee payment via Bank Demand Draft.',
    recordedBy: 'Demo Admin'
  }
];

// --- PHASE 6: SEED DATA FOR CRM & ADMISSION MANAGEMENT ---

export const initialCRMLeads: CRMLead[] = [
  {
    id: 'lead-1',
    name: 'Ramesh Kumar',
    email: 'ramesh.kumar@gmail.com',
    phone: '+91 99887 76655',
    source: 'Website',
    status: 'FOLLOW_UP',
    counsellorId: 'fac-1',
    counsellorName: 'Prof. Demo Faculty',
    programId: 'prog-1',
    createdAt: '2024-06-01',
    remarks: 'Enquired about B.Tech CSE eligibility criteria and placement packages.',
    followUps: [
      { id: 'f-1', date: '2024-06-02', notes: 'Called candidate, explained eligibility guidelines. Asked to visit university campus.', counsellorName: 'Prof. Demo Faculty' },
      { id: 'f-2', date: '2024-06-08', notes: 'Candidate requested more details on start-up incubation benefits.', counsellorName: 'Prof. Demo Faculty' }
    ]
  },
  {
    id: 'lead-2',
    name: 'Sneha Patel',
    email: 'sneha.patel@yahoo.com',
    phone: '+91 98980 12345',
    source: 'Walk-in',
    status: 'INTERESTED',
    counsellorId: 'fac-2',
    counsellorName: 'Prof. Demo Faculty Two',
    programId: 'prog-5',
    createdAt: '2024-06-10',
    remarks: 'Visited campus with parents. Highly interested in UX Design portfolio programs.',
    followUps: [
      { id: 'f-3', date: '2024-06-11', notes: 'Explained fee structures and design studio laboratory setups. Candidate planning to apply soon.', counsellorName: 'Prof. Demo Faculty Two' }
    ]
  },
  {
    id: 'lead-3',
    name: 'Vijay Sharma',
    email: 'vijay.sharma@outlook.com',
    phone: '+91 97776 55443',
    source: 'Social Media',
    status: 'CONVERTED',
    counsellorId: 'fac-1',
    counsellorName: 'Prof. Demo Faculty',
    programId: 'prog-1',
    createdAt: '2024-06-12',
    remarks: 'Leads converted successfully. Registered an admission application.',
    followUps: [
      { id: 'f-4', date: '2024-06-13', notes: 'Sent application link via SMS. Guided candidate in uploading document credentials.', counsellorName: 'Prof. Demo Faculty' }
    ]
  }
];

export const initialAdmissionApplications: AdmissionApplication[] = [
  {
    id: 'app-1',
    leadId: 'lead-3',
    applicantName: 'Vijay Sharma',
    email: 'vijay.sharma@outlook.com',
    phone: '+91 97776 55443',
    gender: 'Male',
    dateOfBirth: '2005-08-14',
    bloodGroup: 'B+',
    address: 'Vastrapur, Ahmedabad, Gujarat',
    guardianName: 'Amit Sharma',
    guardianPhone: '+91 98988 88990',
    programId: 'prog-1',
    semesterId: 'sem-cse-4',
    batchId: 'batch-2023-2027',
    divisionId: 'div-cse-4a',
    status: 'APPROVED',
    submittedAt: '2024-06-14',
    reviewerRemarks: '12th marksheet and identity verified. Fees paid successfully. Recommended for enrolment.',
    documents: [
      { id: 'doc-app-1', name: '12th Marksheet & Transcript', status: 'VERIFIED', fileUrl: 'https://swarrnim.edu.in/docs/12th_marksheet.pdf' },
      { id: 'doc-app-2', name: 'Government ID Proof (Aadhaar)', status: 'VERIFIED', fileUrl: 'https://swarrnim.edu.in/docs/aadhaar.pdf' }
    ]
  },
  {
    id: 'app-2',
    applicantName: 'Anjali Mehta',
    email: 'anjali.mehta@gmail.com',
    phone: '+91 88990 11223',
    gender: 'Female',
    dateOfBirth: '2005-11-20',
    bloodGroup: 'O+',
    address: 'Satellite, Ahmedabad, Gujarat',
    guardianName: 'Rakesh Mehta',
    guardianPhone: '+91 99009 99009',
    programId: 'prog-4',
    semesterId: 'sem-bca-3',
    batchId: 'batch-bca-2023-2026',
    divisionId: 'div-bca-3a',
    status: 'DOCUMENT_VERIFICATION',
    submittedAt: '2024-06-18',
    reviewerRemarks: 'Leaving certificate verification pending.',
    documents: [
      { id: 'doc-app-3', name: '12th Marksheet & Transcript', status: 'VERIFIED', fileUrl: 'https://swarrnim.edu.in/docs/12th_marksheet.pdf' },
      { id: 'doc-app-4', name: 'School Leaving Certificate', status: 'PENDING' }
    ]
  },
  {
    id: 'app-3',
    studentId: 'stu-1',
    applicantName: 'Demo Student',
    email: 'demo.student@university.edu',
    phone: '+91 91234 56789',
    gender: 'Male',
    dateOfBirth: '2004-03-15',
    bloodGroup: 'B+',
    address: 'Swarrnim Student Hostel Block A, Gandhinagar',
    guardianName: 'Guardian Demo',
    guardianPhone: '+91 98250 11223',
    programId: 'prog-1',
    semesterId: 'sem-cse-4',
    batchId: 'batch-2023-2027',
    divisionId: 'div-cse-4a',
    status: 'CONVERTED',
    submittedAt: '2024-06-05',
    reviewerRemarks: 'Successfully converted to student database record.',
    documents: [
      { id: 'doc-app-5', name: '12th Marksheet & Transcript', status: 'VERIFIED', fileUrl: 'https://swarrnim.edu.in/docs/12th_marksheet.pdf' },
      { id: 'doc-app-6', name: 'Government ID Proof (Aadhaar)', status: 'VERIFIED', fileUrl: 'https://swarrnim.edu.in/docs/aadhaar.pdf' }
    ]
  }
];

// --- PHASE 12: EXAM MANAGEMENT SEED DATA ---
export const initialExams: Exam[] = [
  {
    id: 'exam-1',
    name: 'B.Tech Sem-4 Mid Semester Exam 2024',
    type: 'Mid Semester',
    academicYearId: 'ay-2024',
    programId: 'prog-1',
    semesterId: 'sem-cse-4',
    startDate: '2024-03-10',
    endDate: '2024-03-15',
    status: 'SCHEDULED',
    description: 'Mid semester examination for 4th semester B.Tech Computer Engineering',
    baseFee: 300,
    perSubjectFee: 100,
    lateFee: 200,
    formDeadline: '2026-12-31',
    lateFeeDeadline: '2026-12-31',
    minAttendancePercentage: 75
  }
];

export const initialExamTimetables: ExamTimetable[] = [
  {
    id: 'et-1',
    examId: 'exam-1',
    subjectId: 'sub-dsa',
    date: '2024-03-10',
    startTime: '10:00 AM',
    endTime: '12:00 PM',
    roomNo: 'A-101'
  }
];

export const initialExamForms: ExamForm[] = [
  {
    id: 'ef-1',
    examId: 'exam-1',
    studentId: 'stu-1',
    studentName: 'Demo Student',
    enrollmentNo: '230101001',
    programId: 'prog-1',
    semesterId: 'sem-cse-4',
    appliedDate: '2024-03-01',
    status: 'HALL_TICKET_ISSUED',
    paymentStatus: 'PAID',
    regularSubjects: ['sub-dsa', 'sub-dbms'],
    baseFee: 300,
    subjectFee: 200,
    lateFee: 0,
    totalFee: 500,
    hallTicketNo: 'HT-2024-001',
    isEligible: true,
    attendancePercentage: 85,
    documents: [
      { id: 'doc-1', name: 'Identity Proof (Aadhaar)', fileUrl: 'https://swarrnim.edu.in/docs/aadhaar.pdf', status: 'VERIFIED' }
    ]
  }
];

export const initialStudentMarks: StudentMarks[] = [
  { id: 'mk-1', examId: 'exam-1', studentId: 'stu-1', subjectId: 'sub-dsa', internalMarks: 18, externalMarks: 72, totalMarks: 90, maxInternalMarks: 20, maxExternalMarks: 80, grade: 'AA', isPass: true, enteredBy: 'fac-1', enteredAt: '2024-03-15' },
  { id: 'mk-2', examId: 'exam-1', studentId: 'stu-1', subjectId: 'sub-dbms', internalMarks: 16, externalMarks: 64, totalMarks: 80, maxInternalMarks: 20, maxExternalMarks: 80, grade: 'AB', isPass: true, enteredBy: 'fac-1', enteredAt: '2024-03-15' },
  { id: 'mk-3', examId: 'exam-1', studentId: 'stu-1', subjectId: 'sub-webtech', internalMarks: 17, externalMarks: 58, totalMarks: 75, maxInternalMarks: 20, maxExternalMarks: 80, grade: 'BB', isPass: true, enteredBy: 'fac-1', enteredAt: '2024-03-15' },
  { id: 'mk-4', examId: 'exam-1', studentId: 'stu-1', subjectId: 'sub-ai', internalMarks: 15, externalMarks: 50, totalMarks: 65, maxInternalMarks: 20, maxExternalMarks: 80, grade: 'BC', isPass: true, enteredBy: 'fac-1', enteredAt: '2024-03-15' },
  { id: 'mk-5', examId: 'exam-1', studentId: 'stu-2', subjectId: 'sub-dsa', internalMarks: 19, externalMarks: 78, totalMarks: 97, maxInternalMarks: 20, maxExternalMarks: 80, grade: 'AA', isPass: true, enteredBy: 'fac-1', enteredAt: '2024-03-15' },
  { id: 'mk-6', examId: 'exam-1', studentId: 'stu-2', subjectId: 'sub-dbms', internalMarks: 18, externalMarks: 70, totalMarks: 88, maxInternalMarks: 20, maxExternalMarks: 80, grade: 'AA', isPass: true, enteredBy: 'fac-1', enteredAt: '2024-03-15' },
  { id: 'mk-7', examId: 'exam-1', studentId: 'stu-2', subjectId: 'sub-webtech', internalMarks: 14, externalMarks: 45, totalMarks: 59, maxInternalMarks: 20, maxExternalMarks: 80, grade: 'CC', isPass: true, enteredBy: 'fac-1', enteredAt: '2024-03-15' },
  { id: 'mk-8', examId: 'exam-1', studentId: 'stu-2', subjectId: 'sub-ai', internalMarks: 12, externalMarks: 30, totalMarks: 42, maxInternalMarks: 20, maxExternalMarks: 80, grade: 'FF', isPass: false, enteredBy: 'fac-1', enteredAt: '2024-03-15' },
  { id: 'mk-9', examId: 'exam-1', studentId: 'stu-3', subjectId: 'sub-dsa', internalMarks: 16, externalMarks: 62, totalMarks: 78, maxInternalMarks: 20, maxExternalMarks: 80, grade: 'AB', isPass: true, enteredBy: 'fac-1', enteredAt: '2024-03-15' },
  { id: 'mk-10', examId: 'exam-1', studentId: 'stu-3', subjectId: 'sub-dbms', internalMarks: 15, externalMarks: 55, totalMarks: 70, maxInternalMarks: 20, maxExternalMarks: 80, grade: 'BB', isPass: true, enteredBy: 'fac-1', enteredAt: '2024-03-15' },
  { id: 'mk-11', examId: 'exam-1', studentId: 'stu-3', subjectId: 'sub-webtech', internalMarks: 18, externalMarks: 68, totalMarks: 86, maxInternalMarks: 20, maxExternalMarks: 80, grade: 'AA', isPass: true, enteredBy: 'fac-1', enteredAt: '2024-03-15' },
  { id: 'mk-12', examId: 'exam-1', studentId: 'stu-3', subjectId: 'sub-ai', internalMarks: 17, externalMarks: 60, totalMarks: 77, maxInternalMarks: 20, maxExternalMarks: 80, grade: 'AB', isPass: true, enteredBy: 'fac-1', enteredAt: '2024-03-15' },
  { id: 'mk-13', examId: 'exam-1', studentId: 'stu-4', subjectId: 'sub-dsa', internalMarks: 13, externalMarks: 40, totalMarks: 53, maxInternalMarks: 20, maxExternalMarks: 80, grade: 'CC', isPass: true, enteredBy: 'fac-1', enteredAt: '2024-03-15' },
  { id: 'mk-14', examId: 'exam-1', studentId: 'stu-4', subjectId: 'sub-dbms', internalMarks: 11, externalMarks: 28, totalMarks: 39, maxInternalMarks: 20, maxExternalMarks: 80, grade: 'FF', isPass: false, enteredBy: 'fac-1', enteredAt: '2024-03-15' },
  { id: 'mk-15', examId: 'exam-1', studentId: 'stu-4', subjectId: 'sub-webtech', internalMarks: 16, externalMarks: 58, totalMarks: 74, maxInternalMarks: 20, maxExternalMarks: 80, grade: 'BB', isPass: true, enteredBy: 'fac-1', enteredAt: '2024-03-15' },
  { id: 'mk-16', examId: 'exam-1', studentId: 'stu-4', subjectId: 'sub-ai', internalMarks: 15, externalMarks: 52, totalMarks: 67, maxInternalMarks: 20, maxExternalMarks: 80, grade: 'BC', isPass: true, enteredBy: 'fac-1', enteredAt: '2024-03-15' }
];

export const initialStudentResults: StudentResult[] = [
  { id: 'res-1', examId: 'exam-1', studentId: 'stu-1', studentName: 'Demo Student', enrollmentNo: '230101001', programId: 'prog-1', semesterId: 'sem-cse-4', totalMarksObtained: 310, totalMaxMarks: 400, sgpa: 8.75, cgpa: 8.50, status: 'PASS', publishedDate: '2024-03-20' },
  { id: 'res-2', examId: 'exam-1', studentId: 'stu-2', studentName: 'Demo Student Two', enrollmentNo: '230101002', programId: 'prog-1', semesterId: 'sem-cse-4', totalMarksObtained: 286, totalMaxMarks: 400, sgpa: 7.85, cgpa: 8.10, status: 'PASS', publishedDate: '2024-03-20' },
  { id: 'res-3', examId: 'exam-1', studentId: 'stu-3', studentName: 'Demo Student Three', enrollmentNo: '230101003', programId: 'prog-1', semesterId: 'sem-cse-4', totalMarksObtained: 311, totalMaxMarks: 400, sgpa: 8.80, cgpa: 8.65, status: 'PASS', publishedDate: '2024-03-20' },
  { id: 'res-4', examId: 'exam-1', studentId: 'stu-4', studentName: 'Demo Student Four', enrollmentNo: '240101001', programId: 'prog-1', semesterId: 'sem-cse-4', totalMarksObtained: 233, totalMaxMarks: 400, sgpa: 6.20, cgpa: 7.45, status: 'WITHHELD', publishedDate: '2024-03-20', remarks: 'Withheld due to failed subject - DBMS re-examination required.' }
];

export const initialStudentFeedbacks: StudentFeedback[] = [
  {
    id: 'fb-1',
    studentId: 'stu-1',
    type: 'FACULTY',
    academicYearId: 'ay-2024-25',
    departmentId: 'dept-1',
    programId: 'prog-1',
    semesterId: 'sem-cse-4',
    facultyId: 'fac-1',
    facultyName: 'Prof. Rajesh Sharma',
    subjectId: 'sub-dsa',
    subjectName: 'Data Structures & Algorithms',
    teachingQualityRating: 5,
    communicationRating: 5,
    subjectKnowledgeRating: 5,
    disciplineRating: 4,
    overallRating: 5,
    comments: 'Excellent explanation of graph algorithms and tree traversals. Highly supportive professor.',
    submittedAt: '2024-03-05'
  },
  {
    id: 'fb-2',
    studentId: 'stu-2',
    type: 'DEPARTMENT',
    academicYearId: 'ay-2024-25',
    departmentId: 'dept-1',
    programId: 'prog-1',
    semesterId: 'sem-cse-4',
    facilitiesRating: 4,
    administrationRating: 5,
    academicSupportRating: 4,
    overallRating: 4,
    comments: 'Good computer laboratory equipment and helpful department library staff.',
    submittedAt: '2024-03-06'
  }
];

export const initialSupportTickets: SupportTicket[] = [
  {
    id: 'tkt-1',
    ticketNo: 'TKT-2024-001',
    studentId: 'stu-1',
    studentName: 'Aarav Patel',
    enrollmentNo: '230101001',
    departmentId: 'dept-1',
    assignedFacultyId: 'fac-1',
    assignedFacultyName: 'Prof. Rajesh Sharma',
    category: 'ACADEMIC',
    subject: 'Clarification regarding Data Structures Unit 3 Lab Assignment',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    messages: [
      {
        id: 'msg-1',
        senderId: 'stu-1',
        senderName: 'Aarav Patel',
        senderRole: 'STUDENT',
        message: 'Respected Sir, I have a doubt regarding the binary tree traversal recursion logic in Question 4. Could you please review my implementation?',
        createdAt: '2024-03-02 10:30 AM'
      },
      {
        id: 'msg-2',
        senderId: 'fac-1',
        senderName: 'Prof. Rajesh Sharma',
        senderRole: 'FACULTY',
        message: 'Hello Aarav. Make sure your base case handles the null node pointer before making recursive calls on left and right children. I will review it during tomorrow\'s lab session.',
        createdAt: '2024-03-02 02:15 PM'
      }
    ],
    createdAt: '2024-03-02',
    updatedAt: '2024-03-02'
  },
  {
    id: 'tkt-2',
    ticketNo: 'TKT-2024-002',
    studentId: 'stu-2',
    studentName: 'Ananya Roy',
    enrollmentNo: '230101002',
    departmentId: 'dept-1',
    assignedFacultyId: 'fac-2',
    assignedFacultyName: 'Dr. Priya Desai',
    category: 'FEE_FINANCE',
    subject: 'Online Exam Fee Receipt Download Query',
    priority: 'MEDIUM',
    status: 'RESOLVED',
    messages: [
      {
        id: 'msg-3',
        senderId: 'stu-2',
        senderName: 'Ananya Roy',
        senderRole: 'STUDENT',
        message: 'Ma\'am, my payment of ₹500 was deducted via UPI but the fee status still shows pending in portal.',
        createdAt: '2024-03-04 11:00 AM'
      },
      {
        id: 'msg-4',
        senderId: 'fac-2',
        senderName: 'Dr. Priya Desai',
        senderRole: 'FACULTY',
        message: 'Your payment transaction TXN-EXAM-991201 has been verified with bank gateway. Status updated to PAID and receipt is ready for download.',
        createdAt: '2024-03-04 04:30 PM'
      }
    ],
    createdAt: '2024-03-04',
    updatedAt: '2024-03-04'
  }
];

export const initialStudentDocuments: StudentDocument[] = [
  {
    id: 'sdoc-1',
    studentId: 'stu-1',
    studentName: 'Demo Student',
    enrollmentNo: '230101001',
    title: 'Aadhaar Card',
    category: 'IDENTITY',
    fileName: 'Aadhaar_Card_Aarav.pdf',
    fileSize: '1.4 MB',
    fileUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
    uploadDate: '2023-07-15',
    status: 'VERIFIED',
    isLocked: true,
    verifiedBy: 'University Registrar Admin',
    verifiedAt: '2023-07-16',
    remarks: 'Aadhaar 12-digit UID verified against UIDAI database.'
  },
  {
    id: 'sdoc-2',
    studentId: 'stu-1',
    studentName: 'Demo Student',
    enrollmentNo: '230101001',
    title: 'Passport Size Photo',
    category: 'IDENTITY',
    fileName: 'Student_Photo_Aarav.jpg',
    fileSize: '0.4 MB',
    fileUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80',
    uploadDate: '2023-07-15',
    status: 'VERIFIED',
    isLocked: true,
    verifiedBy: 'University Registrar Admin',
    verifiedAt: '2023-07-16',
    remarks: 'Approved for Smart Card ID generation.'
  },
  {
    id: 'sdoc-3',
    studentId: 'stu-1',
    studentName: 'Demo Student',
    enrollmentNo: '230101001',
    title: 'Student Signature',
    category: 'IDENTITY',
    fileName: 'Student_Signature.png',
    fileSize: '0.2 MB',
    fileUrl: 'https://images.unsplash.com/photo-1583521214690-73421a1829a9?auto=format&fit=crop&w=400&q=80',
    uploadDate: '2023-07-15',
    status: 'VERIFIED',
    isLocked: true,
    verifiedBy: 'University Registrar Admin',
    verifiedAt: '2023-07-16',
    remarks: 'Official specimen signature registered for exams.'
  },
  {
    id: 'sdoc-4',
    studentId: 'stu-1',
    studentName: 'Demo Student',
    enrollmentNo: '230101001',
    title: '10th Marksheet',
    category: 'ACADEMIC',
    fileName: '10th_Marksheet_Aarav.pdf',
    fileSize: '2.1 MB',
    fileUrl: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=600&q=80',
    uploadDate: '2023-07-15',
    status: 'VERIFIED',
    isLocked: true,
    verifiedBy: 'University Registrar Admin',
    verifiedAt: '2023-07-16',
    remarks: 'Verified against GSEB Board Records.'
  },
  {
    id: 'sdoc-5',
    studentId: 'stu-1',
    studentName: 'Demo Student',
    enrollmentNo: '230101001',
    title: '12th Marksheet',
    category: 'ACADEMIC',
    fileName: '12th_Marksheet_Aarav.pdf',
    fileSize: '2.8 MB',
    fileUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=600&q=80',
    uploadDate: '2023-07-15',
    status: 'VERIFIED',
    isLocked: true,
    verifiedBy: 'University Registrar Admin',
    verifiedAt: '2023-07-16',
    remarks: 'Verified against GSEB HSC Board Records.'
  },
  {
    id: 'sdoc-6',
    studentId: 'stu-1',
    studentName: 'Demo Student',
    enrollmentNo: '230101001',
    title: 'Diploma Marksheet',
    category: 'ACADEMIC',
    fileName: 'Diploma_Marksheet.pdf',
    fileSize: '3.1 MB',
    fileUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=600&q=80',
    uploadDate: '2023-07-18',
    status: 'VERIFIED',
    isLocked: true,
    verifiedBy: 'University Registrar Admin',
    verifiedAt: '2023-07-19',
    remarks: 'Lateral entry diploma transcript verified.'
  },
  {
    id: 'sdoc-7',
    studentId: 'stu-1',
    studentName: 'Demo Student',
    enrollmentNo: '230101001',
    title: 'Transfer Certificate (TC)',
    category: 'ADMISSION',
    fileName: 'Transfer_Certificate.pdf',
    fileSize: '1.2 MB',
    fileUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80',
    uploadDate: '2023-07-20',
    status: 'VERIFIED',
    isLocked: true,
    verifiedBy: 'University Registrar Admin',
    verifiedAt: '2023-07-21',
    remarks: 'Original TC submitted and verified.'
  },
  {
    id: 'sdoc-8',
    studentId: 'stu-1',
    studentName: 'Demo Student',
    enrollmentNo: '230101001',
    title: 'Migration Certificate',
    category: 'ADMISSION',
    fileName: 'Migration_Certificate.pdf',
    fileSize: '1.5 MB',
    fileUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80',
    uploadDate: '2024-01-10',
    status: 'PENDING_VERIFICATION',
    isLocked: false,
    remarks: 'Submitted for verification by student.'
  },
  {
    id: 'sdoc-9',
    studentId: 'stu-1',
    studentName: 'Demo Student',
    enrollmentNo: '230101001',
    title: 'Caste Certificate',
    category: 'CERTIFICATE',
    fileName: 'Caste_Certificate_OBC.pdf',
    fileSize: '1.0 MB',
    fileUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80',
    uploadDate: '2024-01-12',
    status: 'REJECTED',
    isLocked: false,
    remarks: 'Rejected by Admin: Scan copy is illegible. Please upload clear original color scan of SEBC/OBC certificate.',
    rejectionReason: 'Scan copy is illegible. Please upload clear original color scan of SEBC/OBC certificate.'
  },
  {
    id: 'sdoc-10',
    studentId: 'stu-1',
    studentName: 'Demo Student',
    enrollmentNo: '230101001',
    title: 'Income Certificate',
    category: 'CERTIFICATE',
    fileName: 'Income_Proof_2023.pdf',
    fileSize: '0.9 MB',
    fileUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80',
    uploadDate: '2024-01-15',
    status: 'REJECTED',
    isLocked: false,
    remarks: 'Rejected by Admin: Certificate is expired (FY 2022-23). Upload current Financial Year income certificate from Mamlatdar.',
    rejectionReason: 'Certificate is expired (FY 2022-23). Upload current Financial Year income certificate from Mamlatdar.'
  },
  {
    id: 'sdoc-11',
    studentId: 'stu-1',
    studentName: 'Demo Student',
    enrollmentNo: '230101001',
    title: 'ABC ID',
    category: 'CERTIFICATE',
    fileName: 'ABC_ID_DigiLocker.pdf',
    fileSize: '0.8 MB',
    fileUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80',
    uploadDate: '2023-07-15',
    status: 'VERIFIED',
    isLocked: true,
    verifiedBy: 'University Registrar Admin',
    verifiedAt: '2023-07-16',
    remarks: 'ABC ID 9842-1056-7890 verified via DigiLocker.'
  },
  {
    id: 'sdoc-12',
    studentId: 'stu-1',
    studentName: 'Demo Student',
    enrollmentNo: '230101001',
    title: 'Bank Passbook / Cancelled Cheque',
    category: 'CERTIFICATE',
    fileName: 'SBI_Passbook_Front.pdf',
    fileSize: '1.3 MB',
    fileUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
    uploadDate: '2024-02-01',
    status: 'VERIFIED',
    isLocked: true,
    verifiedBy: 'University Finance Admin',
    verifiedAt: '2024-02-02',
    remarks: 'Bank account details verified for scholarship disbursements.'
  }
];

export const initialERPNotifications: ERPNotification[] = [
  {
    id: 'notif-1',
    title: 'Mid-Sem Examination Registration & Form Open',
    message: 'Regular & Remedial Examination forms for B.Tech CSE Semester 4 are now live. Verify eligibility and submit by 25th March.',
    module: 'EXAM',
    timestamp: 'Today, 10:15 AM',
    createdAt: '2026-08-11T10:15:00.000Z',
    isReadByUsers: [],
    targetRole: 'STUDENT',
    targetDepartmentId: 'dept-1',
    linkTab: 'exam-forms'
  },
  {
    id: 'notif-2',
    title: 'Mid-Sem Examination Hall Ticket Issued',
    message: 'Your exam hall ticket HT-2024-001 has been verified and issued by Controller of Examinations. Click to view/download.',
    module: 'APPROVAL',
    timestamp: 'Today, 09:30 AM',
    createdAt: '2026-08-11T09:30:00.000Z',
    isReadByUsers: [],
    targetRole: 'STUDENT',
    targetUserId: 'stu-1',
    linkTab: 'exam-hallticket'
  },
  {
    id: 'notif-3',
    title: 'New Unit Study Material Uploaded: Operating Systems',
    message: 'Unit 3: Process Scheduling Algorithms & Memory Management study notes published by Prof. Demo Faculty.',
    module: 'MATERIAL',
    timestamp: 'Yesterday, 04:20 PM',
    createdAt: '2026-08-10T16:20:00.000Z',
    isReadByUsers: [],
    targetRole: 'STUDENT',
    targetDepartmentId: 'dept-1',
    linkTab: 'materials'
  },
  {
    id: 'notif-4',
    title: 'Assignment Deadline Reminder: DBMS Lab Practical',
    message: 'DBMS SQL Indexing & Query Optimization assignment submission deadline is 28th August. Ensure submission before 11:59 PM.',
    module: 'ASSIGNMENT',
    timestamp: 'Yesterday, 02:00 PM',
    createdAt: '2026-08-10T14:00:00.000Z',
    isReadByUsers: [],
    targetRole: 'STUDENT',
    targetDepartmentId: 'dept-1',
    linkTab: 'assignments'
  },
  {
    id: 'notif-5',
    title: 'Swarrnim National Hackathon 2024 Event Registered',
    message: 'Swarrnim Startup & Innovation Incubation Center Hackathon event schedule released. Innovation Hall, Main Campus Block.',
    module: 'EVENT',
    timestamp: '10 Aug 2026',
    createdAt: '2026-08-10T11:00:00.000Z',
    isReadByUsers: [],
    targetRole: 'ALL',
    linkTab: 'events'
  },
  {
    id: 'notif-6',
    title: 'Fee Payment Settlement Confirmation',
    message: 'Tuition & Semester fee payment of ₹65,000 processed successfully. Receipt REC-2024-8841 generated.',
    module: 'FEES',
    timestamp: '09 Aug 2026',
    createdAt: '2026-08-09T15:30:00.000Z',
    isReadByUsers: [],
    targetRole: 'STUDENT',
    targetUserId: 'stu-1',
    linkTab: 'fees'
  },
  {
    id: 'notif-7',
    title: 'Exam Marks Verification Required',
    message: 'Faculty marks submissions for DBMS Practical (CS403-P) pending HOD verification and approval.',
    module: 'EXAM',
    timestamp: 'Today, 08:45 AM',
    createdAt: '2026-08-11T08:45:00.000Z',
    isReadByUsers: [],
    targetRole: 'HOD',
    targetDepartmentId: 'dept-1',
    linkTab: 'exam-marks'
  },
  {
    id: 'notif-8',
    title: 'Updated Teaching Timetable Published',
    message: 'Revised classroom timetable for CSE Division A Semester 4 updated for Room Lab 3.',
    module: 'TIMETABLE',
    timestamp: 'Yesterday, 06:15 PM',
    createdAt: '2026-08-10T18:15:00.000Z',
    isReadByUsers: [],
    targetRole: 'FACULTY',
    targetDepartmentId: 'dept-1',
    linkTab: 'timetable'
  }
];



