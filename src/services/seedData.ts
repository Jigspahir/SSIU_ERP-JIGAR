import { 
  University, Institute, Department, Program, AcademicYear, Batch, Semester, Division, Subject, 
  Faculty, Student, User, AuditLog, AttendanceSession, TimetableEntry, 
  SessionPlanTopic, UnitMaterial, Assignment, AssignmentSubmission, AcademicCalendarEvent,
  FeeStructure, StudentFeeRecord, FeePaymentTransaction,
  CRMLead, AdmissionApplication,
  Exam, ExamTimetable, ExamForm, StudentMarks, StudentResult, StudentFeedback, SupportTicket, StudentDocument,
  ERPNotification, InwardOutwardRecord, RegistrarFileMovement, ApprovalRequest, EdpDuty,
  NaacCriterion, NaacKeyIndicator, NaacMetric, NaacDataSubmission, ResearchProject, PublicationRecord, PatentRecord,
  Employee, PayrollRecord, EmployeeLeaveApplication, PerformanceAppraisal, TrainingFdpRecord
} from '../types';

export const initialUniversity: University = {
  id: 'univ-ssiu',
  code: 'SSIU',
  name: 'Swarrnim Startup & Innovation University',
  tagline: 'Where Ideas Become Reality • First Innovation University of India',
  establishedYear: 2017,
  chancellorName: 'Shri Risabh Jain',
  viceChancellorName: 'Dr. K. L. Shivaprasad',
  registrarName: 'Demo Registrar 1',
  location: 'Gandhinagar, Gujarat',
  address: 'Bhuyan Rathod, Opposite IFFCO, Near Adalaj Flyover, Gandhinagar - Ahmedabad Highway, Gujarat 382421',
  email: 'registrar@swarrnim.edu.in',
  phone: '+91 79 2328 1000',
  website: 'https://swarrnim.edu.in'
};

export const initialInstitutes: Institute[] = [
  {
    id: 'inst-1',
    code: 'SSCIT',
    name: 'Swarrnim School of Computer & IT',
    universityId: 'univ-ssiu',
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
    name: 'Swarrnim School of Business & Management',
    type: 'Management',
    establishedYear: 2017,
    principalName: 'Demo Principal Three',
    email: 'demo.principal3@university.edu',
    phone: '+91 79 2328 1003',
    location: 'Management Block, Swarrnim Campus, Gandhinagar',
    status: 'ACTIVE'
  },
  {
    id: 'inst-4',
    code: 'SIHSP',
    name: 'Swarrnim Institute of Health Sciences & Pharmacy',
    type: 'Pharmacy',
    establishedYear: 2019,
    principalName: 'Demo Principal 4',
    email: 'demo.principal4@ssiu-demo.ac.in',
    phone: '+91 00000 00054',
    location: 'Health Sciences Wing, Swarrnim Campus, Gandhinagar',
    status: 'ACTIVE'
  },
  {
    id: 'inst-5',
    code: 'SISA',
    name: 'Swarrnim Institute of Science & Agriculture',
    type: 'Science',
    establishedYear: 2020,
    principalName: 'Demo Principal 5',
    email: 'demo.principal5@ssiu-demo.ac.in',
    phone: '+91 00000 00055',
    location: 'Agri-Tech Park, Swarrnim Campus, Gandhinagar',
    status: 'ACTIVE'
  },
  {
    id: 'inst-6',
    code: 'SSAP',
    name: 'Swarrnim School of Architecture & Planning',
    type: 'Architecture',
    establishedYear: 2019,
    principalName: 'Demo Principal 6',
    email: 'demo.principal6@ssiu-demo.ac.in',
    phone: '+91 00000 00056',
    location: 'Architecture Studio, Swarrnim Campus, Gandhinagar',
    status: 'ACTIVE'
  }
];

export const initialDepartments: Department[] = [
  {
    id: 'dept-1',
    code: 'CSE',
    name: 'Computer Science & Engineering',
    instituteId: 'inst-1',
    hodName: 'Demo HOD 1',
    email: 'demo.hod1@ssiu-demo.ac.in',
    phone: '+91 00000 10004',
    status: 'ACTIVE'
  },
  {
    id: 'dept-2',
    code: 'IT',
    name: 'Information Technology',
    instituteId: 'inst-1',
    hodName: 'Demo HOD 2',
    email: 'demo.hod2@ssiu-demo.ac.in',
    phone: '+91 00000 10005',
    status: 'ACTIVE'
  },
  {
    id: 'dept-3',
    code: 'AI-ML',
    name: 'Artificial Intelligence & Machine Learning',
    instituteId: 'inst-1',
    hodName: 'Demo HOD 3',
    email: 'demo.hod3@ssiu-demo.ac.in',
    phone: '+91 00000 10006',
    status: 'ACTIVE'
  },
  {
    id: 'dept-4',
    code: 'UID',
    name: 'User Interface & Interaction Design',
    instituteId: 'inst-2',
    hodName: 'Demo HOD 4',
    email: 'demo.hod4@ssiu-demo.ac.in',
    phone: '+91 00000 10007',
    status: 'ACTIVE'
  },
  {
    id: 'dept-5',
    code: 'ENT',
    name: 'Innovation & Entrepreneurship',
    instituteId: 'inst-3',
    hodName: 'Demo HOD 5',
    email: 'demo.hod5@ssiu-demo.ac.in',
    phone: '+91 00000 10008',
    status: 'ACTIVE'
  },
  {
    id: 'dept-6',
    code: 'PHARM',
    name: 'Pharmaceutical Sciences & Research',
    instituteId: 'inst-4',
    hodName: 'Demo HOD 6',
    email: 'demo.hod6@ssiu-demo.ac.in',
    phone: '+91 00000 10009',
    status: 'ACTIVE'
  },
  {
    id: 'dept-7',
    code: 'NUR',
    name: 'Nursing & Allied Health Care',
    instituteId: 'inst-4',
    hodName: 'Demo HOD 7',
    email: 'demo.hod7@ssiu-demo.ac.in',
    phone: '+91 00000 10010',
    status: 'ACTIVE'
  },
  {
    id: 'dept-8',
    code: 'AGRI',
    name: 'Agronomy & Plant Biotechnology',
    instituteId: 'inst-5',
    hodName: 'Demo HOD 8',
    email: 'demo.hod8@ssiu-demo.ac.in',
    phone: '+91 00000 10011',
    status: 'ACTIVE'
  },
  {
    id: 'dept-9',
    code: 'ARCH',
    name: 'Architecture & Environmental Design',
    instituteId: 'inst-6',
    hodName: 'Demo HOD 9',
    email: 'demo.hod9@ssiu-demo.ac.in',
    phone: '+91 00000 10012',
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
    code: 'B-PHARM',
    name: 'Bachelor of Pharmacy (B.Pharm)',
    degreeType: 'B.Pharm',
    durationYears: 4,
    totalSemesters: 8,
    intakeCapacity: 100,
    departmentId: 'dept-6',
    instituteId: 'inst-4',
    status: 'ACTIVE'
  },
  {
    id: 'prog-8',
    code: 'BSC-AGRI',
    name: 'B.Sc (Hons.) in Agriculture & Bio-Tech',
    degreeType: 'B.Tech',
    durationYears: 4,
    totalSemesters: 8,
    intakeCapacity: 60,
    departmentId: 'dept-8',
    instituteId: 'inst-5',
    status: 'ACTIVE'
  },
  {
    id: 'prog-9',
    code: 'B-ARCH',
    name: 'Bachelor of Architecture (B.Arch)',
    degreeType: 'B.Arch',
    durationYears: 5,
    totalSemesters: 10,
    intakeCapacity: 40,
    departmentId: 'dept-9',
    instituteId: 'inst-6',
    status: 'ACTIVE'
  },
  {
    id: 'prog-10',
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
    employeeId: 'FACULTY-001',
    name: 'Demo Faculty 1',
    email: 'demo.faculty1@ssiu-demo.ac.in',
    phone: '+91 00000 10001',
    photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80',
    designation: 'Associate Professor',
    instituteId: 'inst-1',
    departmentId: 'dept-1',
    qualification: 'Ph.D. in Computer Science & Engineering',
    specialization: 'Database Systems, Data Structures & Web Architecture',
    joiningDate: '2019-01-10',
    dateOfBirth: '1985-09-24',
    bloodGroup: 'B+',
    address: 'Demo Staff Housing Block 1, SSIU Demo Campus',
    experienceYears: 9,
    subjectIds: ['sub-dsa', 'sub-dbms', 'sub-webtech'],
    status: 'ACTIVE'
  },
  {
    id: 'fac-2',
    employeeId: 'FACULTY-002',
    name: 'Demo Faculty 2',
    email: 'demo.faculty2@ssiu-demo.ac.in',
    phone: '+91 00000 10002',
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80',
    designation: 'Professor',
    instituteId: 'inst-1',
    departmentId: 'dept-1',
    qualification: 'Ph.D. in AI & Data Science',
    specialization: 'Artificial Intelligence & Operating Systems',
    joiningDate: '2017-06-15',
    dateOfBirth: '1980-04-12',
    bloodGroup: 'O+',
    address: 'Demo Staff Housing Block 2, SSIU Demo Campus',
    experienceYears: 14,
    subjectIds: ['sub-os', 'sub-ai'],
    status: 'ACTIVE'
  },
  {
    id: 'fac-3',
    employeeId: 'FACULTY-003',
    name: 'Demo Faculty 3',
    email: 'demo.faculty3@ssiu-demo.ac.in',
    phone: '+91 00000 10003',
    photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    designation: 'Assistant Professor',
    instituteId: 'inst-1',
    departmentId: 'dept-1',
    qualification: 'M.Tech in Software Engineering',
    specialization: 'Computer Architecture & Microprocessors',
    joiningDate: '2021-08-01',
    dateOfBirth: '1990-11-05',
    bloodGroup: 'A+',
    address: 'Demo Staff Housing Block 3, SSIU Demo Campus',
    experienceYears: 5,
    subjectIds: ['sub-ca'],
    status: 'ACTIVE'
  },
  {
    id: 'fac-4',
    employeeId: 'HOD-001',
    name: 'Demo HOD 1',
    email: 'demo.hod1@ssiu-demo.ac.in',
    phone: '+91 00000 10004',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    designation: 'Professor',
    instituteId: 'inst-3',
    departmentId: 'dept-5',
    qualification: 'Ph.D in Entrepreneurship',
    specialization: 'Venture Capital, Startup Incubation, Business Strategy',
    joiningDate: '2018-07-20',
    dateOfBirth: '1978-02-18',
    bloodGroup: 'AB+',
    address: 'Demo Staff Housing Block 4, SSIU Demo Campus',
    experienceYears: 16,
    subjectIds: ['sub-ent'],
    status: 'ACTIVE'
  }
];

export const initialStudents: Student[] = [
  {
    id: 'stu-1',
    enrollmentNo: 'STUDENT-001',
    name: 'ABC Student 1',
    email: 'abc.student1@ssiu-demo.ac.in',
    phone: '+91 00000 20001',
    photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80',
    gender: 'Male',
    dateOfBirth: '2004-03-15',
    bloodGroup: 'B+',
    address: 'Demo Student Hostel Block A Room 101, SSIU Demo Campus',
    admissionDate: '2023-07-15',
    instituteId: 'inst-1',
    departmentId: 'dept-1',
    programId: 'prog-1',
    academicYearId: 'ay-2024',
    batchId: 'batch-2023-2027',
    semesterId: 'sem-cse-4',
    divisionId: 'div-cse-4a',
    guardianName: 'Demo Guardian 1',
    guardianPhone: '+91 00000 30001',
    mentorId: 'fac-1',
    abcId: '9842-1056-7890',
    abcIdStatus: 'VERIFIED',
    academicLifecycleStatus: 'PURSUING',
    academicHistory: [
      {
        id: 'hist-stu1-sem1',
        academicYearId: 'ay-2023',
        academicYearName: '2023-2024',
        semesterId: 'sem-cse-1',
        semesterNumber: 1,
        batchId: 'batch-2023-2027',
        divisionId: 'div-cse-1a',
        divisionName: 'Division A',
        spi: 8.4,
        cpi: 8.4,
        attendancePercentage: 92,
        feeClearanceStatus: 'CLEARED',
        status: 'PROMOTED',
        completedDate: '2023-12-20',
        remarks: 'Semester 1 completed with First Class Distinction'
      },
      {
        id: 'hist-stu1-sem2',
        academicYearId: 'ay-2023',
        academicYearName: '2023-2024',
        semesterId: 'sem-cse-2',
        semesterNumber: 2,
        batchId: 'batch-2023-2027',
        divisionId: 'div-cse-2a',
        divisionName: 'Division A',
        spi: 8.7,
        cpi: 8.55,
        attendancePercentage: 89,
        feeClearanceStatus: 'CLEARED',
        status: 'PROMOTED',
        completedDate: '2024-05-18',
        remarks: 'Semester 2 completed successfully'
      },
      {
        id: 'hist-stu1-sem3',
        academicYearId: 'ay-2024',
        academicYearName: '2024-2025',
        semesterId: 'sem-cse-3',
        semesterNumber: 3,
        batchId: 'batch-2023-2027',
        divisionId: 'div-cse-3a',
        divisionName: 'Division A',
        spi: 8.9,
        cpi: 8.66,
        attendancePercentage: 94,
        feeClearanceStatus: 'CLEARED',
        status: 'PROMOTED',
        completedDate: '2024-12-15',
        remarks: 'Semester 3 completed with Outstanding Honors'
      }
    ],
    status: 'ACTIVE'
  },
  {
    id: 'stu-2',
    enrollmentNo: 'STUDENT-002',
    name: 'ABC Student 2',
    email: 'abc.student2@ssiu-demo.ac.in',
    phone: '+91 00000 20002',
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
    gender: 'Female',
    dateOfBirth: '2004-08-22',
    bloodGroup: 'O+',
    address: 'Demo Student Hostel Block A Room 102, SSIU Demo Campus',
    admissionDate: '2023-07-16',
    instituteId: 'inst-1',
    departmentId: 'dept-1',
    programId: 'prog-1',
    academicYearId: 'ay-2024',
    batchId: 'batch-2023-2027',
    semesterId: 'sem-cse-4',
    divisionId: 'div-cse-4a',
    guardianName: 'Demo Guardian 2',
    guardianPhone: '+91 00000 30002',
    mentorId: 'fac-1',
    abcId: '8712-4509-3321',
    abcIdStatus: 'PENDING_VERIFICATION',
    academicLifecycleStatus: 'PURSUING',
    academicHistory: [
      {
        id: 'hist-stu2-sem1',
        academicYearId: 'ay-2023',
        academicYearName: '2023-2024',
        semesterId: 'sem-cse-1',
        semesterNumber: 1,
        batchId: 'batch-2023-2027',
        divisionId: 'div-cse-1a',
        divisionName: 'Division A',
        spi: 8.1,
        cpi: 8.1,
        attendancePercentage: 86,
        feeClearanceStatus: 'CLEARED',
        status: 'PROMOTED',
        completedDate: '2023-12-20'
      },
      {
        id: 'hist-stu2-sem2',
        academicYearId: 'ay-2023',
        academicYearName: '2023-2024',
        semesterId: 'sem-cse-2',
        semesterNumber: 2,
        batchId: 'batch-2023-2027',
        divisionId: 'div-cse-2a',
        divisionName: 'Division A',
        spi: 8.4,
        cpi: 8.25,
        attendancePercentage: 88,
        feeClearanceStatus: 'CLEARED',
        status: 'PROMOTED',
        completedDate: '2024-05-18'
      }
    ],
    status: 'ACTIVE'
  },
  {
    id: 'stu-3',
    enrollmentNo: 'STUDENT-003',
    name: 'XYZ Student 1',
    email: 'xyz.student1@ssiu-demo.ac.in',
    phone: '+91 00000 20003',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    gender: 'Male',
    dateOfBirth: '2003-12-10',
    bloodGroup: 'A+',
    address: 'Demo Student Residency Block B Room 201, SSIU Demo Campus',
    admissionDate: '2023-07-18',
    instituteId: 'inst-1',
    departmentId: 'dept-1',
    programId: 'prog-1',
    academicYearId: 'ay-2024',
    batchId: 'batch-2023-2027',
    semesterId: 'sem-cse-4',
    divisionId: 'div-cse-4b',
    guardianName: 'Demo Guardian 3',
    guardianPhone: '+91 00000 30003',
    mentorId: 'fac-2',
    academicLifecycleStatus: 'PURSUING',
    academicHistory: [
      {
        id: 'hist-stu3-sem1',
        academicYearId: 'ay-2023',
        academicYearName: '2023-2024',
        semesterId: 'sem-cse-1',
        semesterNumber: 1,
        batchId: 'batch-2023-2027',
        divisionId: 'div-cse-1b',
        divisionName: 'Division B',
        spi: 7.8,
        cpi: 7.8,
        attendancePercentage: 82,
        feeClearanceStatus: 'CLEARED',
        status: 'PROMOTED',
        completedDate: '2023-12-20'
      }
    ],
    status: 'ACTIVE'
  },
  {
    id: 'stu-4',
    enrollmentNo: 'STUDENT-004',
    name: 'XYZ Student 2',
    email: 'xyz.student2@ssiu-demo.ac.in',
    phone: '+91 00000 20004',
    photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
    gender: 'Female',
    dateOfBirth: '2005-05-19',
    bloodGroup: 'AB+',
    address: 'Demo Student Residency Block B Room 202, SSIU Demo Campus',
    admissionDate: '2024-07-10',
    instituteId: 'inst-1',
    departmentId: 'dept-1',
    programId: 'prog-1',
    academicYearId: 'ay-2024',
    batchId: 'batch-2024-2028',
    semesterId: 'sem-cse-4',
    divisionId: 'div-cse-4a',
    guardianName: 'Demo Guardian 4',
    guardianPhone: '+91 00000 30004',
    mentorId: 'fac-1',
    academicLifecycleStatus: 'ADMITTED',
    academicHistory: [],
    status: 'ACTIVE'
  }
];

export const initialUsers: User[] = [
  {
    id: 'user-superadmin',
    name: 'Demo Admin 1',
    username: 'admin',
    email: 'demo.admin1@ssiu-demo.ac.in',
    password: 'Admin@123',
    role: 'SUPER_ADMIN',
    designation: 'University Super Admin & System Controller',
    phone: '+91 00000 00001',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    status: 'ACTIVE',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'user-univadmin',
    name: 'Demo Univ Admin 1',
    username: 'univadmin',
    email: 'demo.univadmin1@ssiu-demo.ac.in',
    password: 'Admin@123',
    role: 'UNIVERSITY_ADMIN',
    designation: 'Vice Chancellor, Swarrnim University',
    phone: '+91 00000 00002',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    status: 'ACTIVE',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'user-principal-1',
    name: 'Demo Principal 1',
    username: 'principal',
    email: 'demo.principal1@ssiu-demo.ac.in',
    password: 'Admin@123',
    role: 'PRINCIPAL',
    instituteId: 'inst-1',
    phone: '+91 00000 00008',
    designation: 'Principal, Swarrnim School of Computer & IT',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    status: 'ACTIVE',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'user-hod-1',
    name: 'Demo HOD 1',
    username: 'hod',
    email: 'demo.hod1@ssiu-demo.ac.in',
    password: 'Faculty@123',
    role: 'HOD',
    instituteId: 'inst-1',
    departmentId: 'dept-1',
    phone: '+91 00000 10004',
    designation: 'HOD, Computer Engineering',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
    status: 'ACTIVE',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'user-faculty-1',
    name: 'Demo Faculty 1',
    username: 'faculty',
    email: 'demo.faculty1@ssiu-demo.ac.in',
    password: 'Faculty@123',
    role: 'FACULTY',
    instituteId: 'inst-1',
    departmentId: 'dept-1',
    employeeId: 'FACULTY-001',
    phone: '+91 00000 10001',
    designation: 'Associate Professor & Student Mentor',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80',
    status: 'ACTIVE',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'user-student-1',
    name: 'ABC Student 1',
    username: 'student',
    email: 'abc.student1@ssiu-demo.ac.in',
    password: 'Student@123',
    role: 'STUDENT',
    instituteId: 'inst-1',
    departmentId: 'dept-1',
    programId: 'prog-1',
    enrollmentNo: 'STUDENT-001',
    phone: '+91 00000 20001',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80',
    status: 'ACTIVE',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'user-registrar',
    name: 'Demo Registrar 1',
    username: 'registrar',
    email: 'demo.registrar1@ssiu-demo.ac.in',
    password: 'Admin@123',
    role: 'REGISTRAR',
    designation: 'University Registrar',
    phone: '+91 00000 00003',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80',
    status: 'ACTIVE',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'user-iqac',
    name: 'Demo IQAC Director 1',
    username: 'iqac',
    email: 'demo.iqac1@ssiu-demo.ac.in',
    password: 'Admin@123',
    role: 'IQAC',
    designation: 'Director, IQAC Cell',
    phone: '+91 00000 00004',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    status: 'ACTIVE',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'user-examcell',
    name: 'Demo Controller 1',
    username: 'examcell',
    email: 'demo.examcontroller1@ssiu-demo.ac.in',
    password: 'Admin@123',
    role: 'EXAM_CELL',
    designation: 'Controller of Examinations',
    phone: '+91 00000 00005',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    status: 'ACTIVE',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'user-studentsection',
    name: 'Demo Officer 1',
    username: 'studentsection',
    email: 'demo.officer1@ssiu-demo.ac.in',
    password: 'Admin@123',
    role: 'STUDENT_SECTION',
    designation: 'Head, Student Affairs Section',
    phone: '+91 00000 00006',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
    status: 'ACTIVE',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'user-hosteladmin',
    name: 'Demo Warden 1',
    username: 'hosteladmin',
    email: 'demo.warden1@ssiu-demo.ac.in',
    password: 'Admin@123',
    role: 'HOSTEL_ADMIN',
    designation: 'Chief Hostel Warden',
    phone: '+91 00000 00007',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
    status: 'ACTIVE',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'user-librarian',
    name: 'Demo Librarian 1',
    username: 'librarian',
    email: 'demo.librarian1@ssiu-demo.ac.in',
    password: 'Admin@123',
    role: 'LIBRARY_ADMIN',
    designation: 'Head Librarian',
    phone: '+91 00000 00009',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80',
    status: 'ACTIVE',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'user-transport',
    name: 'Demo Transport Officer 1',
    username: 'transport',
    email: 'demo.transport1@ssiu-demo.ac.in',
    password: 'Admin@123',
    role: 'TRANSPORT_ADMIN',
    designation: 'Transport Fleet Manager',
    phone: '+91 00000 00010',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    status: 'ACTIVE',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'user-maintenance',
    name: 'Demo Maintenance Officer 1',
    username: 'maintenance',
    email: 'demo.maintenance1@ssiu-demo.ac.in',
    password: 'Admin@123',
    role: 'MAINTENANCE_ADMIN',
    designation: 'Campus Estate Manager',
    phone: '+91 00000 00011',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
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
    name: 'Demo Candidate 1',
    email: 'demo.candidate1@ssiu-demo.ac.in',
    phone: '+91 00000 40001',
    source: 'Website',
    status: 'FOLLOW_UP',
    counsellorId: 'fac-1',
    counsellorName: 'Demo Faculty 1',
    programId: 'prog-1',
    createdAt: '2024-06-01',
    remarks: 'Enquired about B.Tech CSE eligibility criteria and placement packages.',
    followUps: [
      { id: 'f-1', date: '2024-06-02', notes: 'Called candidate, explained eligibility guidelines. Asked to visit university campus.', counsellorName: 'Demo Faculty 1' },
      { id: 'f-2', date: '2024-06-08', notes: 'Candidate requested more details on start-up incubation benefits.', counsellorName: 'Demo Faculty 1' }
    ]
  },
  {
    id: 'lead-2',
    name: 'Demo Candidate 2',
    email: 'demo.candidate2@ssiu-demo.ac.in',
    phone: '+91 00000 40002',
    source: 'Walk-in',
    status: 'INTERESTED',
    counsellorId: 'fac-2',
    counsellorName: 'Demo Faculty 2',
    programId: 'prog-5',
    createdAt: '2024-06-10',
    remarks: 'Visited campus with parents. Highly interested in UX Design portfolio programs.',
    followUps: [
      { id: 'f-3', date: '2024-06-11', notes: 'Explained fee structures and design studio laboratory setups. Candidate planning to apply soon.', counsellorName: 'Demo Faculty 2' }
    ]
  },
  {
    id: 'lead-3',
    name: 'Demo Candidate 3',
    email: 'demo.candidate3@ssiu-demo.ac.in',
    phone: '+91 00000 40003',
    source: 'Social Media',
    status: 'CONVERTED',
    counsellorId: 'fac-1',
    counsellorName: 'Demo Faculty 1',
    programId: 'prog-1',
    createdAt: '2024-06-12',
    remarks: 'Leads converted successfully. Registered an admission application.',
    followUps: [
      { id: 'f-4', date: '2024-06-13', notes: 'Sent application link via SMS. Guided candidate in uploading document credentials.', counsellorName: 'Demo Faculty 1' }
    ]
  }
];

export const initialAdmissionApplications: AdmissionApplication[] = [
  {
    id: 'app-1',
    leadId: 'lead-3',
    applicantName: 'Demo Candidate 3',
    email: 'demo.candidate3@ssiu-demo.ac.in',
    phone: '+91 00000 40003',
    gender: 'Male',
    dateOfBirth: '2005-08-14',
    bloodGroup: 'B+',
    address: 'Demo Address Block 3, SSIU Demo Campus',
    guardianName: 'Demo Guardian 3',
    guardianPhone: '+91 00000 30003',
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
    applicantName: 'Demo Candidate 4',
    email: 'demo.candidate4@ssiu-demo.ac.in',
    phone: '+91 00000 40004',
    gender: 'Female',
    dateOfBirth: '2005-11-20',
    bloodGroup: 'O+',
    address: 'Demo Address Block 4, SSIU Demo Campus',
    guardianName: 'Demo Guardian 4',
    guardianPhone: '+91 00000 30004',
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
    applicantName: 'ABC Student 1',
    email: 'abc.student1@ssiu-demo.ac.in',
    phone: '+91 00000 20001',
    gender: 'Male',
    dateOfBirth: '2004-03-15',
    bloodGroup: 'B+',
    address: 'Demo Student Hostel Block A, SSIU Demo Campus',
    guardianName: 'Demo Guardian 1',
    guardianPhone: '+91 00000 30001',
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
    facultyName: 'Demo Faculty 1',
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
    studentName: 'ABC Student 1',
    enrollmentNo: 'STUDENT-001',
    departmentId: 'dept-1',
    assignedFacultyId: 'fac-1',
    assignedFacultyName: 'Demo Faculty 1',
    category: 'ACADEMIC',
    subject: 'Clarification regarding Data Structures Unit 3 Lab Assignment',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    messages: [
      {
        id: 'msg-1',
        senderId: 'stu-1',
        senderName: 'ABC Student 1',
        senderRole: 'STUDENT',
        message: 'Respected Sir, I have a doubt regarding the binary tree traversal recursion logic in Question 4. Could you please review my implementation?',
        createdAt: '2024-03-02 10:30 AM'
      },
      {
        id: 'msg-2',
        senderId: 'fac-1',
        senderName: 'Demo Faculty 1',
        senderRole: 'FACULTY',
        message: 'Hello ABC Student 1. Make sure your base case handles the null node pointer before making recursive calls on left and right children. I will review it during tomorrow\'s lab session.',
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
    studentName: 'ABC Student 2',
    enrollmentNo: 'STUDENT-002',
    departmentId: 'dept-1',
    assignedFacultyId: 'fac-2',
    assignedFacultyName: 'Demo Faculty 2',
    category: 'FEE_FINANCE',
    subject: 'Online Exam Fee Receipt Download Query',
    priority: 'MEDIUM',
    status: 'RESOLVED',
    messages: [
      {
        id: 'msg-3',
        senderId: 'stu-2',
        senderName: 'ABC Student 2',
        senderRole: 'STUDENT',
        message: 'Ma\'am, my payment of ₹500 was deducted via UPI but the fee status still shows pending in portal.',
        createdAt: '2024-03-04 11:00 AM'
      },
      {
        id: 'msg-4',
        senderId: 'fac-2',
        senderName: 'Demo Faculty 2',
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
    studentName: 'ABC Student 1',
    enrollmentNo: 'STUDENT-001',
    title: 'Aadhaar Card',
    category: 'IDENTITY',
    fileName: 'Aadhaar_Card_ABCStudent1.pdf',
    fileSize: '1.4 MB',
    fileUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
    uploadDate: '2023-07-15',
    status: 'VERIFIED',
    isLocked: true,
    verifiedBy: 'Demo Registrar 1',
    verifiedAt: '2023-07-16',
    remarks: 'Aadhaar 12-digit UID verified against UIDAI database.'
  },
  {
    id: 'sdoc-2',
    studentId: 'stu-1',
    studentName: 'ABC Student 1',
    enrollmentNo: 'STUDENT-001',
    title: 'Passport Size Photo',
    category: 'IDENTITY',
    fileName: 'Student_Photo_ABCStudent1.jpg',
    fileSize: '0.4 MB',
    fileUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80',
    uploadDate: '2023-07-15',
    status: 'VERIFIED',
    isLocked: true,
    verifiedBy: 'Demo Registrar 1',
    verifiedAt: '2023-07-16',
    remarks: 'Approved for Smart Card ID generation.'
  },
  {
    id: 'sdoc-3',
    studentId: 'stu-1',
    studentName: 'ABC Student 1',
    enrollmentNo: 'STUDENT-001',
    title: 'Student Signature',
    category: 'IDENTITY',
    fileName: 'Student_Signature.png',
    fileSize: '0.2 MB',
    fileUrl: 'https://images.unsplash.com/photo-1583521214690-73421a1829a9?auto=format&fit=crop&w=400&q=80',
    uploadDate: '2023-07-15',
    status: 'VERIFIED',
    isLocked: true,
    verifiedBy: 'Demo Registrar 1',
    verifiedAt: '2023-07-16',
    remarks: 'Official specimen signature registered for exams.'
  },
  {
    id: 'sdoc-4',
    studentId: 'stu-1',
    studentName: 'ABC Student 1',
    enrollmentNo: 'STUDENT-001',
    title: '10th Marksheet',
    category: 'ACADEMIC',
    fileName: '10th_Marksheet_ABCStudent1.pdf',
    fileSize: '2.1 MB',
    fileUrl: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=600&q=80',
    uploadDate: '2023-07-15',
    status: 'VERIFIED',
    isLocked: true,
    verifiedBy: 'Demo Registrar 1',
    verifiedAt: '2023-07-16',
    remarks: 'Verified against GSEB Board Records.'
  },
  {
    id: 'sdoc-5',
    studentId: 'stu-1',
    studentName: 'ABC Student 1',
    enrollmentNo: 'STUDENT-001',
    title: '12th Marksheet',
    category: 'ACADEMIC',
    fileName: '12th_Marksheet_ABCStudent1.pdf',
    fileSize: '2.8 MB',
    fileUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=600&q=80',
    uploadDate: '2023-07-15',
    status: 'VERIFIED',
    isLocked: true,
    verifiedBy: 'Demo Registrar 1',
    verifiedAt: '2023-07-16',
    remarks: 'Verified against GSEB HSC Board Records.'
  },
  {
    id: 'sdoc-6',
    studentId: 'stu-1',
    studentName: 'ABC Student 1',
    enrollmentNo: 'STUDENT-001',
    title: 'Diploma Marksheet',
    category: 'ACADEMIC',
    fileName: 'Diploma_Marksheet.pdf',
    fileSize: '3.1 MB',
    fileUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=600&q=80',
    uploadDate: '2023-07-18',
    status: 'VERIFIED',
    isLocked: true,
    verifiedBy: 'Demo Registrar 1',
    verifiedAt: '2023-07-19',
    remarks: 'Lateral entry diploma transcript verified.'
  },
  {
    id: 'sdoc-7',
    studentId: 'stu-1',
    studentName: 'ABC Student 1',
    enrollmentNo: 'STUDENT-001',
    title: 'Transfer Certificate (TC)',
    category: 'ADMISSION',
    fileName: 'Transfer_Certificate.pdf',
    fileSize: '1.2 MB',
    fileUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80',
    uploadDate: '2023-07-20',
    status: 'VERIFIED',
    isLocked: true,
    verifiedBy: 'Demo Registrar 1',
    verifiedAt: '2023-07-21',
    remarks: 'Original TC submitted and verified.'
  },
  {
    id: 'sdoc-8',
    studentId: 'stu-1',
    studentName: 'ABC Student 1',
    enrollmentNo: 'STUDENT-001',
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
    studentName: 'ABC Student 1',
    enrollmentNo: 'STUDENT-001',
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
    studentName: 'ABC Student 1',
    enrollmentNo: 'STUDENT-001',
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
    studentName: 'ABC Student 1',
    enrollmentNo: 'STUDENT-001',
    title: 'ABC ID',
    category: 'CERTIFICATE',
    fileName: 'ABC_ID_DigiLocker.pdf',
    fileSize: '0.8 MB',
    fileUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80',
    uploadDate: '2023-07-15',
    status: 'VERIFIED',
    isLocked: true,
    verifiedBy: 'Demo Registrar 1',
    verifiedAt: '2023-07-16',
    remarks: 'ABC ID 9842-1056-7890 verified via DigiLocker.'
  },
  {
    id: 'sdoc-12',
    studentId: 'stu-1',
    studentName: 'ABC Student 1',
    enrollmentNo: 'STUDENT-001',
    title: 'Bank Passbook / Cancelled Cheque',
    category: 'CERTIFICATE',
    fileName: 'SBI_Passbook_Front.pdf',
    fileSize: '1.3 MB',
    fileUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
    uploadDate: '2024-02-01',
    status: 'VERIFIED',
    isLocked: true,
    verifiedBy: 'Demo Admin 1',
    verifiedAt: '2024-02-02',
    remarks: 'Bank account details verified for scholarship disbursements.'
  }
];

export const initialInwardOutwardRecords: InwardOutwardRecord[] = [
  {
    id: 'in-1',
    type: 'INWARD',
    dispatchNo: 'INW/2024/0481',
    senderOrRecipient: 'University Grants Commission (UGC), New Delhi',
    subject: 'Mandatory Implementation of Academic Bank of Credits (ABC) & NEP 2020 Guidelines',
    category: 'UGC_AICTE',
    mode: 'SPEED_POST',
    trackingNo: 'SP984210452IN',
    assignedSection: 'Academic Affairs Section',
    receivedOrDispatchedDate: '2024-02-10',
    status: 'PROCESSING',
    remarks: 'Forwarded to Deans & IQAC for compliance report.'
  },
  {
    id: 'in-2',
    type: 'INWARD',
    dispatchNo: 'INW/2024/0512',
    senderOrRecipient: 'Department of Higher Education, Govt. of Gujarat',
    subject: 'State Scholarship Portal Verification & Freeship Card Approvals 2024',
    category: 'GOVT_DIRECTIVE',
    mode: 'EMAIL',
    trackingNo: 'GUJ/EDU/2024/781',
    assignedSection: 'Student Welfare & Scholarship Section',
    receivedOrDispatchedDate: '2024-02-18',
    status: 'DISPOSED',
    remarks: 'Action completed and portal updated.'
  },
  {
    id: 'out-1',
    type: 'OUTWARD',
    dispatchNo: 'OUT/2024/0210',
    senderOrRecipient: 'All Constituent Institute Directors & Principals',
    subject: 'Notification for End Semester Examination Series & Approval Schedule',
    category: 'GENERAL',
    mode: 'EMAIL',
    trackingNo: 'EML-SSIU-REG-0982',
    assignedSection: 'Examination Section',
    receivedOrDispatchedDate: '2024-03-01',
    status: 'DISPOSED',
    remarks: 'Circulated electronically to all institute heads.'
  }
];

export const initialRegistrarFileMovements: RegistrarFileMovement[] = [
  {
    id: 'fm-1',
    fileNo: 'SSIU/FILE/2024/ACAD-01',
    fileTitle: 'Proposal for New B.Tech Artificial Intelligence & Data Science Program Sanction',
    initiatingSection: 'Swarrnim School of Computer & IT',
    currentCustodian: 'Registrar Office',
    movementDate: '2024-03-05',
    priority: 'HIGH',
    status: 'UNDER_REVIEW',
    remarks: 'Pending Academic Council ratification.'
  },
  {
    id: 'fm-2',
    fileNo: 'SSIU/FILE/2024/ESTATE-04',
    fileTitle: 'Annual Campus Infrastructure Renewal & Solar Power Installation Contract',
    initiatingSection: 'Estate & Maintenance Department',
    currentCustodian: 'Finance Office',
    movementDate: '2024-03-08',
    priority: 'MEDIUM',
    status: 'IN_MOVEMENT',
    remarks: 'Sent for financial sanction.'
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
    message: 'Unit 3: Process Scheduling Algorithms & Memory Management study notes published by Demo Faculty 1.',
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

export const initialApprovalRequests: ApprovalRequest[] = [
  {
    id: 'app-req-101',
    requestNo: 'SSIU-REQ-2024-001',
    applicantId: 'stu-1',
    applicantName: 'ABC Student 1',
    applicantRole: 'STUDENT',
    applicantEmail: 'abc.student1@ssiu-demo.ac.in',
    applicantPhone: '+91 00000 20001',
    applicantEnrollmentOrEmpId: 'STUDENT-001',
    departmentId: 'dept-1',
    instituteId: 'inst-1',
    category: 'BONAFIDE_CERTIFICATE',
    title: 'Urgent Bonafide Certificate Request for Higher Education Loan',
    description: 'Require an official signed Bonafide Certificate for Nationalised Bank Student Education Loan disbursement.',
    priority: 'HIGH',
    targetOffice: 'STUDENT_SECTION',
    currentOffice: 'STUDENT_SECTION',
    status: 'PENDING',
    deadlineDate: '2026-08-15',
    attachments: [
      {
        id: 'att-1',
        fileName: 'Bank_Loan_Requirement_Letter.pdf',
        fileSize: '1.2 MB',
        fileType: 'PDF',
        fileUrl: '#',
        uploadedAt: '2026-08-11T10:00:00.000Z'
      }
    ],
    remarksHistory: [
      {
        id: 'rem-1',
        actionByUserId: 'stu-1',
        actionByUserName: 'ABC Student 1',
        actionByUserRole: 'STUDENT',
        office: 'STUDENT_SECTION',
        action: 'PENDING',
        remarks: 'Application submitted along with bank loan requirement letter.',
        timestamp: '2026-08-11 10:00 AM'
      }
    ],
    createdAt: '2026-08-11T10:00:00.000Z',
    updatedAt: '2026-08-11T10:00:00.000Z'
  },
  {
    id: 'app-req-102',
    requestNo: 'SSIU-REQ-2024-002',
    applicantId: 'stu-2',
    applicantName: 'ABC Student 2',
    applicantRole: 'STUDENT',
    applicantEmail: 'abc.student2@ssiu-demo.ac.in',
    applicantPhone: '+91 00000 20002',
    applicantEnrollmentOrEmpId: 'STUDENT-002',
    departmentId: 'dept-1',
    instituteId: 'inst-1',
    category: 'RE_EVALUATION',
    title: 'Re-evaluation & Verification of Mid-Sem Examination Answer Sheet',
    description: 'Requesting answer script re-checking for Subject CSE-101 Data Structures Mid-Sem Exam.',
    priority: 'MEDIUM',
    targetOffice: 'EXAM_CELL',
    currentOffice: 'EXAM_CELL',
    status: 'UNDER_REVIEW',
    deadlineDate: '2026-08-18',
    attachments: [
      {
        id: 'att-2',
        fileName: 'Fee_Receipt_Rechecking.pdf',
        fileSize: '450 KB',
        fileType: 'PDF',
        fileUrl: '#',
        uploadedAt: '2026-08-10T14:30:00.000Z'
      }
    ],
    remarksHistory: [
      {
        id: 'rem-2a',
        actionByUserId: 'stu-2',
        actionByUserName: 'ABC Student 2',
        actionByUserRole: 'STUDENT',
        office: 'EXAM_CELL',
        action: 'PENDING',
        remarks: 'Submitted re-evaluation form with paid receipt fee.',
        timestamp: '2026-08-10 02:30 PM'
      },
      {
        id: 'rem-2b',
        actionByUserId: 'user-examcell',
        actionByUserName: 'Demo Controller 1',
        actionByUserRole: 'EXAM_CELL',
        office: 'EXAM_CELL',
        action: 'UNDER_REVIEW',
        remarks: 'Forwarded answer script copy to Subject Expert Evaluator.',
        timestamp: '2026-08-11 11:15 AM'
      }
    ],
    createdAt: '2026-08-10T14:30:00.000Z',
    updatedAt: '2026-08-11T11:15:00.000Z'
  },
  {
    id: 'app-req-103',
    requestNo: 'SSIU-REQ-2024-003',
    applicantId: 'fac-1',
    applicantName: 'Demo Faculty 1',
    applicantRole: 'FACULTY',
    applicantEmail: 'demo.faculty1@ssiu-demo.ac.in',
    applicantPhone: '+91 00000 10001',
    applicantEnrollmentOrEmpId: 'FACULTY-001',
    departmentId: 'dept-1',
    instituteId: 'inst-1',
    category: 'RESEARCH_GRANT',
    title: 'GUJCOST Sponsored AI & Cyber Security Workshop Grant Sanction',
    description: 'Proposing 3-day state level technical workshop on Generative AI & Quantum Cryptography with GUJCOST funding.',
    priority: 'HIGH',
    targetOffice: 'IQAC',
    currentOffice: 'REGISTRAR',
    status: 'FORWARDED',
    deadlineDate: '2026-08-20',
    attachments: [
      {
        id: 'att-3',
        fileName: 'GUJCOST_Proposal_Budget.pdf',
        fileSize: '3.4 MB',
        fileType: 'PDF',
        fileUrl: '#',
        uploadedAt: '2026-08-08T09:00:00.000Z'
      }
    ],
    remarksHistory: [
      {
        id: 'rem-3a',
        actionByUserId: 'fac-1',
        actionByUserName: 'Demo Faculty 1',
        actionByUserRole: 'FACULTY',
        office: 'IQAC',
        action: 'PENDING',
        remarks: 'Proposal submitted for IQAC Quality Assessment & Clearance.',
        timestamp: '2026-08-08 09:00 AM'
      },
      {
        id: 'rem-3b',
        actionByUserId: 'user-iqac',
        actionByUserName: 'Demo IQAC Director 1',
        actionByUserRole: 'IQAC',
        office: 'IQAC',
        action: 'FORWARDED',
        remarks: 'IQAC quality criteria verified and benchmarked. Forwarded to Registrar Office for statutory approval and fund release.',
        timestamp: '2026-08-09 04:00 PM'
      }
    ],
    createdAt: '2026-08-08T09:00:00.000Z',
    updatedAt: '2026-08-09T16:00:00.000Z'
  },
  {
    id: 'app-req-104',
    requestNo: 'SSIU-REQ-2024-004',
    applicantId: 'stu-3',
    applicantName: 'XYZ Student 1',
    applicantRole: 'STUDENT',
    applicantEmail: 'xyz.student1@ssiu-demo.ac.in',
    applicantPhone: '+91 00000 20003',
    applicantEnrollmentOrEmpId: 'STUDENT-003',
    departmentId: 'dept-1',
    instituteId: 'inst-1',
    category: 'HOSTEL_NO_DUES',
    title: 'Hostel No-Dues Clearance for Semester End Certificate Release',
    description: 'Requesting Hostel Clearance Certificate after clearing all mess and accommodation dues for Block B Room 204.',
    priority: 'LOW',
    targetOffice: 'HOSTEL_ADMIN',
    currentOffice: 'HOSTEL_ADMIN',
    status: 'APPROVED',
    deadlineDate: '2026-08-14',
    attachments: [],
    remarksHistory: [
      {
        id: 'rem-4a',
        actionByUserId: 'stu-3',
        actionByUserName: 'XYZ Student 1',
        actionByUserRole: 'STUDENT',
        office: 'HOSTEL_ADMIN',
        action: 'PENDING',
        remarks: 'Submitted hostel clearance request.',
        timestamp: '2026-08-07 11:30 AM'
      },
      {
        id: 'rem-4b',
        actionByUserId: 'user-hosteladmin',
        actionByUserName: 'Demo Warden 1',
        actionByUserRole: 'HOSTEL_ADMIN',
        office: 'HOSTEL_ADMIN',
        action: 'APPROVED',
        remarks: 'All mess dues and room inventory verified. No dues certificate issued.',
        timestamp: '2026-08-08 10:15 AM'
      }
    ],
    createdAt: '2026-08-07T11:30:00.000Z',
    updatedAt: '2026-08-08T10:15:00.000Z',
    completedAt: '2026-08-08T10:15:00.000Z'
  },
  {
    id: 'app-req-105',
    requestNo: 'SSIU-REQ-2024-005',
    applicantId: 'stu-1',
    applicantName: 'ABC Student 1',
    applicantRole: 'STUDENT',
    applicantEmail: 'abc.student1@ssiu-demo.ac.in',
    applicantPhone: '+91 00000 20001',
    applicantEnrollmentOrEmpId: 'STUDENT-001',
    departmentId: 'dept-1',
    instituteId: 'inst-1',
    category: 'LEAVE_APPLICATION',
    title: 'Academic Duty Leave Request for Smart India Hackathon Grand Finale',
    description: 'Requesting 3 days academic duty leave to represent SSIU at Smart India Hackathon National Finals.',
    priority: 'HIGH',
    targetOffice: 'HOD_ACADEMIC',
    currentOffice: 'HOD_ACADEMIC',
    status: 'PENDING',
    deadlineDate: '2026-08-16',
    attachments: [
      {
        id: 'att-5',
        fileName: 'SIH_Finalist_Selection_Letter.pdf',
        fileSize: '890 KB',
        fileType: 'PDF',
        fileUrl: '#',
        uploadedAt: '2026-08-12T08:00:00.000Z'
      }
    ],
    remarksHistory: [
      {
        id: 'rem-5a',
        actionByUserId: 'stu-1',
        actionByUserName: 'ABC Student 1',
        actionByUserRole: 'STUDENT',
        office: 'HOD_ACADEMIC',
        action: 'PENDING',
        remarks: 'Duty leave application submitted with SIH selection letter.',
        timestamp: '2026-08-12 08:00 AM'
      }
    ],
    createdAt: '2026-08-12T08:00:00.000Z',
    updatedAt: '2026-08-12T08:00:00.000Z'
  },
  {
    id: 'app-req-106',
    requestNo: 'SSIU-REQ-2024-006',
    applicantId: 'user-hod-1',
    applicantName: 'Demo HOD 1',
    applicantRole: 'HOD',
    applicantEmail: 'demo.hod1@ssiu-demo.ac.in',
    applicantPhone: '+91 00000 10004',
    applicantEnrollmentOrEmpId: 'HOD-001',
    departmentId: 'dept-1',
    instituteId: 'inst-1',
    category: 'INFRASTRUCTURE_MAINTENANCE',
    title: 'High Performance AI Lab Server Procurement Sanction',
    description: 'Departmental requisition for 4 NVIDIA RTX GPU Workstations for AI & Deep Learning Research Lab.',
    priority: 'URGENT',
    targetOffice: 'REGISTRAR',
    currentOffice: 'REGISTRAR',
    status: 'PENDING',
    deadlineDate: '2026-08-25',
    attachments: [
      {
        id: 'att-6',
        fileName: 'GPU_Server_Quotation_Specs.pdf',
        fileSize: '2.8 MB',
        fileType: 'PDF',
        fileUrl: '#',
        uploadedAt: '2026-08-12T09:30:00.000Z'
      }
    ],
    remarksHistory: [
      {
        id: 'rem-6a',
        actionByUserId: 'user-hod-1',
        actionByUserName: 'Demo HOD 1',
        actionByUserRole: 'HOD',
        office: 'REGISTRAR',
        action: 'PENDING',
        remarks: 'Procurement requisition submitted to Registrar Office for administrative and financial sanction.',
        timestamp: '2026-08-12 09:30 AM'
      }
    ],
    createdAt: '2026-08-12T09:30:00.000Z',
    updatedAt: '2026-08-12T09:30:00.000Z'
  }
];

export const initialEdpDuties: EdpDuty[] = [
  {
    id: 'edp-101',
    dutyCode: 'EDP-2024-001',
    eventName: 'Annual University Convocation 2024',
    eventType: 'CONVOCATION',
    dutyRole: 'STAGE_MANAGER',
    assignedUserId: 'fac-1',
    assignedUserName: 'Demo Faculty 1',
    assignedUserRole: 'FACULTY',
    assignedUserDesignation: 'Associate Professor',
    instituteId: 'inst-1',
    departmentId: 'dept-1',
    dutyDate: '2026-08-15',
    startTime: '09:00 AM',
    endTime: '02:00 PM',
    venue: 'Swarrnim Auditorium Main Stage',
    responsibilityDetails: 'Stage coordination, degree certificate scroll distribution, and VIP guest dais management.',
    status: 'VERIFIED',
    reportsNotes: 'Convocation stage proceedings executed smoothly without delay. All 450 degree scrolls verified.',
    evidenceList: [
      {
        id: 'ev-101a',
        photoUrl: 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=600&q=80',
        latitude: 23.0225,
        longitude: 72.5714,
        locationAddress: 'Swarrnim Main Auditorium, Swarrnim Campus, Gandhinagar, Gujarat 382421',
        capturedAt: '2026-08-15T09:15:00Z',
        deviceInfo: 'Samsung Galaxy Tab S9 - Android 14 GPS Verified',
        remarks: 'Morning stage setup inspection completed with Convocation Committee.'
      }
    ],
    verifiedByAdminId: 'user-registrar',
    verifiedByAdminName: 'Demo Registrar 1',
    verifiedAt: '2026-08-15T15:00:00Z',
    verificationRemarks: 'Duty verified. Stage protocol adhered to standards.',
    createdAt: '2026-08-10T10:00:00Z',
    updatedAt: '2026-08-15T15:00:00Z'
  },
  {
    id: 'edp-102',
    dutyCode: 'EDP-2024-002',
    eventName: 'National AI & Quantum Computing Hackathon',
    eventType: 'WORKSHOP',
    dutyRole: 'TECHNICAL_LEAD',
    assignedUserId: 'user-hod-1',
    assignedUserName: 'Demo HOD 1',
    assignedUserRole: 'HOD',
    assignedUserDesignation: 'HOD Computer Engineering',
    instituteId: 'inst-1',
    departmentId: 'dept-1',
    dutyDate: '2026-08-18',
    startTime: '10:00 AM',
    endTime: '05:00 PM',
    venue: 'SSCIT High Performance Computer Lab 301',
    responsibilityDetails: 'Manage GPU server access, high-speed Wi-Fi network, and technical judging criteria.',
    status: 'ASSIGNED',
    evidenceList: [],
    createdAt: '2026-08-11T11:00:00Z',
    updatedAt: '2026-08-11T11:00:00Z'
  },
  {
    id: 'edp-103',
    dutyCode: 'EDP-2024-003',
    eventName: 'Semester Mid-Term Examination Invigilation',
    eventType: 'EXAM_INVIGILATION',
    dutyRole: 'VENUE_INCHARGE',
    assignedUserId: 'fac-2',
    assignedUserName: 'Demo Faculty 2',
    assignedUserRole: 'FACULTY',
    assignedUserDesignation: 'Professor',
    instituteId: 'inst-1',
    departmentId: 'dept-1',
    dutyDate: '2026-08-20',
    startTime: '10:30 AM',
    endTime: '01:30 PM',
    venue: 'Exam Hall 204 (Block A)',
    responsibilityDetails: 'Exam hall seating verification, question paper distribution, and invigilation log sign-off.',
    status: 'ASSIGNED',
    evidenceList: [],
    createdAt: '2026-08-12T08:30:00Z',
    updatedAt: '2026-08-12T08:30:00Z'
  }
];

// ─── NAAC & IQAC FRAMEWORK SEED DATA ────────────────────────────────────────

export const initialNaacCriteria: NaacCriterion[] = [
  { id: 'c1', number: 1, code: 'C1', title: 'Curricular Aspects', description: 'Curriculum design, academic flexibility, feedback system', weightage: 100, keyIndicatorsCount: 3 },
  { id: 'c2', number: 2, code: 'C2', title: 'Teaching-Learning & Evaluation', description: 'Student enrollment, teacher profile, evaluation process & learning outcomes', weightage: 350, keyIndicatorsCount: 7 },
  { id: 'c3', number: 3, code: 'C3', title: 'Research, Innovations & Extension', description: 'Resource mobilization for research, innovation ecosystem, publications & awards', weightage: 250, keyIndicatorsCount: 7 },
  { id: 'c4', number: 4, code: 'C4', title: 'Infrastructure & Learning Resources', description: 'Physical facilities, library resources, IT infrastructure & campus maintenance', weightage: 100, keyIndicatorsCount: 4 },
  { id: 'c5', number: 5, code: 'C5', title: 'Student Support & Progression', description: 'Student support, scholarships, placement, alumni engagement & activities', weightage: 100, keyIndicatorsCount: 4 },
  { id: 'c6', number: 6, code: 'C6', title: 'Governance, Leadership & Management', description: 'Institutional vision, strategy, faculty empowerment, financial management & IQAC', weightage: 100, keyIndicatorsCount: 5 },
  { id: 'c7', number: 7, code: 'C7', title: 'Institutional Values & Best Practices', description: 'Gender equity, environmental sustainability, best practices & distinctiveness', weightage: 100, keyIndicatorsCount: 3 }
];

export const initialNaacKeyIndicators: NaacKeyIndicator[] = [
  { id: 'ki-1-1', criterionId: 'c1', code: '1.1', title: 'Curriculum Design & Development', weightage: 50 },
  { id: 'ki-1-2', criterionId: 'c1', code: '1.2', title: 'Academic Flexibility', weightage: 30 },
  { id: 'ki-1-3', criterionId: 'c1', code: '1.3', title: 'Curriculum Enrichment', weightage: 20 },
  { id: 'ki-2-4', criterionId: 'c2', code: '2.4', title: 'Teacher Profile & Quality', weightage: 80 },
  { id: 'ki-2-6', criterionId: 'c2', code: '2.6', title: 'Student Performance & Learning Outcomes', weightage: 90 },
  { id: 'ki-3-2', criterionId: 'c3', code: '3.2', title: 'Resource Mobilization for Research', weightage: 50 },
  { id: 'ki-3-4', criterionId: 'c3', code: '3.4', title: 'Research Publications & Awards', weightage: 100 },
  { id: 'ki-5-1', criterionId: 'c5', code: '5.1', title: 'Student Support & Scholarships', weightage: 40 }
];

export const initialNaacMetrics: NaacMetric[] = [
  {
    id: 'm-1-1-1',
    keyIndicatorId: 'ki-1-1',
    criterionId: 'c1',
    code: '1.1.1',
    title: 'Curricula developed & implemented for all programs with focus on employability & entrepreneurship',
    type: 'QlM',
    weightage: 20,
    requiredEvidence: ['Syllabus Copies', 'Board of Studies Minutes', 'Academic Council Approval']
  },
  {
    id: 'm-2-4-1',
    keyIndicatorId: 'ki-2-4',
    criterionId: 'c2',
    code: '2.4.1',
    title: 'Percentage of full-time teachers appointed against sanctioned posts during the academic year',
    type: 'QnM',
    weightage: 20,
    formulaDescription: '(Full-Time Appointed Faculty / Sanctioned Posts) * 100',
    autoErpSource: 'FACULTY_COUNT',
    requiredEvidence: ['Sanctioned Post Orders', 'Faculty Appointment Letters', 'Joined Roster']
  },
  {
    id: 'm-2-4-2',
    keyIndicatorId: 'ki-2-4',
    criterionId: 'c2',
    code: '2.4.2',
    title: 'Percentage of full-time teachers with NET/SET/SLET/Ph.D / D.Sc. degree qualifications',
    type: 'QnM',
    weightage: 30,
    formulaDescription: '(Faculty with Ph.D or NET / Total Faculty) * 100',
    autoErpSource: 'FACULTY_PHD_COUNT',
    requiredEvidence: ['Ph.D Degree Certificates', 'NET/SLET Qualification Certificates']
  },
  {
    id: 'm-2-6-3',
    keyIndicatorId: 'ki-2-6',
    criterionId: 'c2',
    code: '2.6.3',
    title: 'Pass percentage of final year students in university semester examinations',
    type: 'QnM',
    weightage: 30,
    formulaDescription: '(Passed Final Year Students / Appeared Students) * 100',
    autoErpSource: 'PASS_PERCENTAGE',
    requiredEvidence: ['Controller of Examinations Gazette', 'Semester Tabulation Sheets']
  },
  {
    id: 'm-3-2-1',
    keyIndicatorId: 'ki-3-2',
    criterionId: 'c3',
    code: '3.2.1',
    title: 'Extramural research grants sanctioned by government and non-government agencies',
    type: 'QnM',
    weightage: 25,
    formulaDescription: 'Total Research Grant Amount Sanctioned (in Lakhs INR)',
    autoErpSource: 'RESEARCH_PAPERS',
    requiredEvidence: ['Government Sanction Letters', 'Fund Utilization Certificates']
  },
  {
    id: 'm-3-4-3',
    keyIndicatorId: 'ki-3-4',
    criterionId: 'c3',
    code: '3.4.3',
    title: 'Number of research papers published per teacher in UGC CARE / Scopus / Web of Science journals',
    type: 'QnM',
    weightage: 50,
    formulaDescription: 'Total Scopus/UGC CARE Journal Papers / Total Faculty Count',
    autoErpSource: 'RESEARCH_PAPERS',
    requiredEvidence: ['Journal Publication Copies', 'DOI Web Links', 'Scopus Indexing Proof']
  },
  {
    id: 'm-5-1-1',
    keyIndicatorId: 'ki-5-1',
    criterionId: 'c5',
    code: '5.1.1',
    title: 'Percentage of students benefited by scholarships, freeships & fee waivers provided by institution',
    type: 'QnM',
    weightage: 20,
    formulaDescription: '(Benefited Scholarship Students / Total Students) * 100',
    autoErpSource: 'STUDENTS_COUNT',
    requiredEvidence: ['Scholarship Sanction Lists', 'Student Bank Fee Receipts']
  }
];

export const initialResearchProjects: ResearchProject[] = [
  {
    id: 'res-proj-1',
    projectCode: 'RES-GUJCOST-2024-01',
    title: 'High-Performance Generative AI Architectures for Smart Agriculture & Crop Disease Detection',
    principalInvestigatorId: 'fac-1',
    principalInvestigatorName: 'Demo Faculty 1',
    departmentId: 'dept-1',
    instituteId: 'inst-1',
    fundingAgency: 'GUJCOST, Department of Science & Technology, Govt. of Gujarat',
    sanctionedAmount: 1250000,
    sanctionYear: 2024,
    durationYears: 2,
    status: 'ONGOING'
  },
  {
    id: 'res-proj-2',
    projectCode: 'RES-DST-2023-04',
    title: 'Quantum Key Distribution & Cyber Security Defense Mechanisms for Cloud Infrastructures',
    principalInvestigatorId: 'user-hod-1',
    principalInvestigatorName: 'Demo HOD 1',
    departmentId: 'dept-1',
    instituteId: 'inst-1',
    fundingAgency: 'DST SERB, New Delhi',
    sanctionedAmount: 1800000,
    sanctionYear: 2023,
    durationYears: 3,
    status: 'ONGOING'
  }
];

export const initialPublicationRecords: PublicationRecord[] = [
  {
    id: 'pub-1',
    title: 'Distributed Generative AI Models for Real-Time Academic ERP Optimization',
    authors: 'Demo Faculty 1, Demo HOD 1',
    facultyId: 'fac-1',
    departmentId: 'dept-1',
    journalOrConferenceName: 'IEEE Transactions on Cloud & Educational Computing',
    indexing: 'Scopus',
    issnIsbn: 'ISSN: 1941-0123',
    publicationYear: 2024,
    doiUrl: 'https://doi.org/10.1109/TETC.2024.3391024'
  },
  {
    id: 'pub-2',
    title: 'Secure Blockchain-Based Academic Credentials & Degree Certificate Verification System',
    authors: 'Demo HOD 1, Demo Faculty 2',
    facultyId: 'user-hod-1',
    departmentId: 'dept-1',
    journalOrConferenceName: 'Journal of Network and Computer Applications',
    indexing: 'Web of Science',
    issnIsbn: 'ISSN: 1084-8045',
    publicationYear: 2024,
    doiUrl: 'https://doi.org/10.1016/j.jnca.2024.103980'
  }
];

export const initialPatentRecords: PatentRecord[] = [
  {
    id: 'pat-1',
    applicationNo: '202441098412-A',
    title: 'IoT-Enabled Geo-Tagged Duty Verification & Real-Time Attendance Badge Apparatus',
    inventors: 'Demo Faculty 1, Demo HOD 1, Demo Principal 1',
    facultyId: 'fac-1',
    departmentId: 'dept-1',
    status: 'PUBLISHED',
    filedDate: '2024-01-15'
  }
];

export const initialNaacDataSubmissions: NaacDataSubmission[] = [
  {
    id: 'naac-sub-101',
    metricId: 'm-2-4-1',
    metricCode: '2.4.1',
    criterionId: 'c2',
    departmentId: 'dept-1',
    instituteId: 'inst-1',
    academicYearId: 'ay-2024',
    quantitativeValue: 94.5,
    dataFields: { totalFaculty: 45, sanctionedPosts: 48, percentage: '93.75%' },
    evidenceUrls: ['https://swarrnim.edu.in/naac/Sanctioned_Post_Roster_2024.pdf'],
    geoTaggedPhotoUrls: ['https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=600&q=80'],
    websiteLinks: ['https://swarrnim.edu.in/faculty-directory'],
    status: 'APPROVED',
    currentApproverRole: 'REGISTRAR',
    submittedByUserId: 'user-hod-1',
    submittedByUserName: 'Demo HOD 1',
    submittedAt: '2024-03-01',
    remarksHistory: [
      { id: 'r-1', actionByUserId: 'user-hod-1', actionByUserName: 'Demo HOD 1', actionByUserRole: 'HOD', office: 'HOD_ACADEMIC', action: 'APPROVED', remarks: 'Submitted with verified appointment letters.', timestamp: '2024-03-01' },
      { id: 'r-2', actionByUserId: 'user-iqac', actionByUserName: 'Demo IQAC Director 1', actionByUserRole: 'IQAC', office: 'IQAC', action: 'APPROVED', remarks: 'IQAC Audit completed. Metric benchmark verified.', timestamp: '2024-03-05' }
    ],
    updatedAt: '2024-03-05',
    lockedAt: '2024-03-05'
  },
  {
    id: 'naac-sub-102',
    metricId: 'm-3-4-3',
    metricCode: '3.4.3',
    criterionId: 'c3',
    departmentId: 'dept-1',
    instituteId: 'inst-1',
    academicYearId: 'ay-2024',
    quantitativeValue: 2.4,
    dataFields: { totalPublications: 108, totalFaculty: 45, averagePerTeacher: '2.40' },
    evidenceUrls: ['https://swarrnim.edu.in/naac/Scopus_Publication_List_2024.pdf'],
    websiteLinks: ['https://scopus.com/affil/swarrnim'],
    status: 'UNDER_REVIEW',
    currentApproverRole: 'IQAC',
    submittedByUserId: 'fac-1',
    submittedByUserName: 'Demo Faculty 1',
    submittedAt: '2024-03-10',
    remarksHistory: [
      { id: 'r-3', actionByUserId: 'fac-1', actionByUserName: 'Demo Faculty 1', actionByUserRole: 'FACULTY', office: 'HOD_ACADEMIC', action: 'SUBMITTED', remarks: 'Submitted Scopus & Web of Science indexed publication records.', timestamp: '2024-03-10' }
    ],
    updatedAt: '2024-03-10'
  }
];

// ─── HR MANAGEMENT MODULE SEED DATA ─────────────────────────────────────────

export const initialEmployees: Employee[] = [
  {
    id: 'emp-101',
    employeeId: 'EMP-2024-001',
    name: 'Demo Faculty 1',
    email: 'demo.faculty1@ssiu-demo.ac.in',
    phone: '+91 00000 10002',
    designation: 'Assistant Professor',
    employeeType: 'FACULTY',
    instituteId: 'inst-1',
    departmentId: 'dept-1',
    joiningDate: '2021-07-15',
    salary: 75000,
    bankAccountNo: 'SBIN00010482910',
    panNo: 'ABCDE1234F',
    aadhaarNo: '1234-5678-9012',
    qualification: 'M.Tech, Ph.D (Pursuing)',
    experienceYears: 6,
    status: 'ACTIVE'
  },
  {
    id: 'emp-102',
    employeeId: 'EMP-2024-002',
    name: 'Demo HOD 1',
    email: 'demo.hod1@ssiu-demo.ac.in',
    phone: '+91 00000 10004',
    designation: 'Professor & HOD',
    employeeType: 'FACULTY',
    instituteId: 'inst-1',
    departmentId: 'dept-1',
    joiningDate: '2018-06-01',
    salary: 135000,
    bankAccountNo: 'HDFC0002849102',
    panNo: 'FGHIJ5678K',
    aadhaarNo: '9876-5432-1098',
    qualification: 'Ph.D in Computer Engineering',
    experienceYears: 14,
    status: 'ACTIVE'
  },
  {
    id: 'emp-103',
    employeeId: 'EMP-2024-003',
    name: 'Demo Officer 1',
    email: 'demo.officer1@ssiu-demo.ac.in',
    phone: '+91 00000 10007',
    designation: 'Senior Registrar Officer',
    employeeType: 'ADMIN_STAFF',
    instituteId: 'inst-1',
    departmentId: 'dept-1',
    joiningDate: '2019-03-10',
    salary: 95000,
    bankAccountNo: 'ICIC0003920194',
    panNo: 'KLMNO9012P',
    aadhaarNo: '4567-8901-2345',
    qualification: 'MBA Higher Education Management',
    experienceYears: 10,
    status: 'ACTIVE'
  }
];

export const initialPayrollRecords: PayrollRecord[] = [
  {
    id: 'pay-aug-101',
    employeeId: 'emp-101',
    employeeName: 'Demo Faculty 1',
    month: 'August 2026',
    year: 2026,
    basicPay: 45000,
    hra: 18000,
    da: 9000,
    specialAllowance: 3000,
    grossSalary: 75000,
    pfDeduction: 5400,
    taxDeduction: 2500,
    netSalary: 67100,
    status: 'PAID',
    paidDate: '2026-08-01'
  },
  {
    id: 'pay-aug-102',
    employeeId: 'emp-102',
    employeeName: 'Demo HOD 1',
    month: 'August 2026',
    year: 2026,
    basicPay: 81000,
    hra: 32400,
    da: 16200,
    specialAllowance: 5400,
    grossSalary: 135000,
    pfDeduction: 9720,
    taxDeduction: 8500,
    netSalary: 116780,
    status: 'PAID',
    paidDate: '2026-08-01'
  }
];

export const initialLeaveApplications: EmployeeLeaveApplication[] = [
  {
    id: 'lv-101',
    employeeId: 'emp-101',
    employeeName: 'Demo Faculty 1',
    departmentId: 'dept-1',
    leaveType: 'CASUAL',
    startDate: '2026-08-20',
    endDate: '2026-08-21',
    totalDays: 2,
    reason: 'Attending IEEE International Conference on AI Architecture as Speaker',
    status: 'APPROVED',
    approvedByUserName: 'Demo HOD 1',
    appliedDate: '2026-08-10'
  }
];

export const initialPerformanceAppraisals: PerformanceAppraisal[] = [
  {
    id: 'pbas-2024-101',
    employeeId: 'emp-101',
    employeeName: 'Demo Faculty 1',
    academicYearId: 'ay-2024',
    teachingRating: 4.8,
    researchRating: 4.6,
    administrativeRating: 4.7,
    overallScore: 4.70,
    feedback: 'Exceptional teaching performance, high student rating & Scopus paper publication.',
    status: 'APPROVED'
  }
];

export const initialTrainingFdpRecords: TrainingFdpRecord[] = [
  {
    id: 'fdp-101',
    employeeId: 'emp-101',
    employeeName: 'Demo Faculty 1',
    title: 'AICTE Training & Learning (ATAL) FDP on Generative AI & Deep Learning',
    organizer: 'IIT Gandhinagar & AICTE',
    startDate: '2024-01-10',
    endDate: '2024-01-15',
    certificateUrl: 'https://swarrnim.edu.in/docs/FDP_AICTE_Cert.pdf',
    status: 'VERIFIED'
  }
];





