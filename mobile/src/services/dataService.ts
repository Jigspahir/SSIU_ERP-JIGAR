import { api } from './api';
import { API_ROUTES } from '../constants/apiRoutes';
import { StorageService } from './storageService';
import { CONFIG } from '../constants/config';
import {
  Student,
  AttendanceSummary,
  ExamResultItem,
  StudentDiaryEntry,
  PTMRecord,
  StudentServiceRequest,
  ERPNotificationItem,
  FeeSummary,
} from '../types';

export class DataService {
  /**
   * ─────────────────────────────────────────────────────────────
   * 1. STUDENT ACADEMIC & ATTENDANCE DATA
   * ─────────────────────────────────────────────────────────────
   */
  static async getAttendance(studentId?: string): Promise<AttendanceSummary> {
    try {
      const route = studentId ? API_ROUTES.PARENT.CHILD_ATTENDANCE(studentId) : API_ROUTES.STUDENT.ATTENDANCE;
      const res = await api.get(route);
      if (res.data) {
        await StorageService.setItem(CONFIG.STORAGE_KEYS.CACHE_ATTENDANCE, res.data);
        return res.data;
      }
    } catch (e) {
      console.log('Fetching live attendance from backend failed, serving cached/default data');
    }

    const cached = await StorageService.getItem<AttendanceSummary>(CONFIG.STORAGE_KEYS.CACHE_ATTENDANCE);
    if (cached) return cached;

    return {
      studentId: studentId || 'student-1',
      overallPercentage: 86.4,
      totalPresent: 152,
      totalConducted: 176,
      isEligibleForExams: true,
      records: [
        {
          id: 'att-1',
          subjectCode: 'CE-501',
          subjectName: 'Design & Analysis of Algorithms',
          facultyName: 'Dr. Priya Patel',
          totalSessions: 36,
          attendedSessions: 32,
          percentage: 88.9,
          lastUpdated: 'Today at 10:30 AM',
          status: 'SAFE',
        },
        {
          id: 'att-2',
          subjectCode: 'CE-502',
          subjectName: 'Database Management Systems',
          facultyName: 'Prof. Ankit Mehta',
          totalSessions: 36,
          attendedSessions: 34,
          percentage: 94.4,
          lastUpdated: 'Yesterday',
          status: 'SAFE',
        },
        {
          id: 'att-3',
          subjectCode: 'CE-503',
          subjectName: 'Computer Networks & Security',
          facultyName: 'Dr. Rajesh Joshi',
          totalSessions: 34,
          attendedSessions: 28,
          percentage: 82.3,
          lastUpdated: '2 days ago',
          status: 'SAFE',
        },
        {
          id: 'att-4',
          subjectCode: 'CE-504',
          subjectName: 'Theory of Computation',
          facultyName: 'Prof. Sneha Shah',
          totalSessions: 34,
          attendedSessions: 25,
          percentage: 73.5,
          lastUpdated: 'Today at 02:00 PM',
          status: 'WARNING',
        },
        {
          id: 'att-5',
          subjectCode: 'CE-505',
          subjectName: 'Artificial Intelligence & ML',
          facultyName: 'Dr. Priya Patel',
          totalSessions: 36,
          attendedSessions: 33,
          percentage: 91.6,
          lastUpdated: 'Yesterday',
          status: 'SAFE',
        },
      ],
    };
  }

  static async getExamResults(studentId?: string): Promise<ExamResultItem[]> {
    try {
      const route = studentId ? API_ROUTES.PARENT.CHILD_RESULTS(studentId) : API_ROUTES.STUDENT.RESULTS;
      const res = await api.get(route);
      if (res.data) return res.data;
    } catch (e) {
      // Fallback to sample data
    }

    return [
      {
        id: 'res-sem-4',
        semesterNumber: 4,
        examSession: 'Summer 2024 Regular',
        examType: 'REGULAR',
        sgpa: 8.75,
        cgpa: 8.62,
        backlogs: 0,
        status: 'PASS',
        subjects: [
          { code: 'CE-401', name: 'Operating Systems', credits: 4, grade: 'AA', points: 10, internalMarks: 28, externalMarks: 65, totalMarks: 93, maxMarks: 100, status: 'PASS' },
          { code: 'CE-402', name: 'Computer Organization', credits: 4, grade: 'AB', points: 9, internalMarks: 26, externalMarks: 58, totalMarks: 84, maxMarks: 100, status: 'PASS' },
          { code: 'CE-403', name: 'Software Engineering', credits: 3, grade: 'AA', points: 10, internalMarks: 29, externalMarks: 66, totalMarks: 95, maxMarks: 100, status: 'PASS' },
          { code: 'CE-404', name: 'Object Oriented Programming', credits: 4, grade: 'BB', points: 8, internalMarks: 24, externalMarks: 52, totalMarks: 76, maxMarks: 100, status: 'PASS' },
          { code: 'MA-401', name: 'Discrete Mathematics', credits: 4, grade: 'AB', points: 9, internalMarks: 27, externalMarks: 60, totalMarks: 87, maxMarks: 100, status: 'PASS' },
        ],
      },
      {
        id: 'res-sem-3',
        semesterNumber: 3,
        examSession: 'Winter 2023 Regular',
        examType: 'REGULAR',
        sgpa: 8.5,
        cgpa: 8.55,
        backlogs: 0,
        status: 'PASS',
        subjects: [
          { code: 'CE-301', name: 'Data Structures', credits: 4, grade: 'AA', points: 10, internalMarks: 29, externalMarks: 64, totalMarks: 93, maxMarks: 100, status: 'PASS' },
          { code: 'CE-302', name: 'Digital Logic Design', credits: 4, grade: 'AB', points: 9, internalMarks: 25, externalMarks: 57, totalMarks: 82, maxMarks: 100, status: 'PASS' },
          { code: 'MA-301', name: 'Linear Algebra & Calculus', credits: 4, grade: 'BB', points: 8, internalMarks: 23, externalMarks: 54, totalMarks: 77, maxMarks: 100, status: 'PASS' },
        ],
      },
    ];
  }

  /**
   * ─────────────────────────────────────────────────────────────
   * 2. STUDENT DIARY INTEGRATION
   * ─────────────────────────────────────────────────────────────
   */
  static async getStudentDiary(studentId?: string): Promise<StudentDiaryEntry[]> {
    return [
      {
        id: 'diary-sem-5',
        semester: 'Semester 5 (Current)',
        academicYear: '2024-25',
        sgpa: 8.8,
        attendancePercentage: 86.4,
        remarks: 'Consistent academic engagement, active in Smart India Hackathon internal trials.',
        achievements: [
          'Selected for SSIU Innovation Incubator Cohort 4',
          'Completed AWS Certified Cloud Practitioner certification',
        ],
        certificates: ['AWS Certified Cloud Practitioner (Verified)', 'NPTEL Cloud Computing Elite'],
        updatedAt: '15 Aug 2024',
      },
      {
        id: 'diary-sem-4',
        semester: 'Semester 4',
        academicYear: '2023-24',
        sgpa: 8.75,
        attendancePercentage: 91.2,
        remarks: 'Excellent practical and laboratory assessments in Operating Systems and OOP.',
        achievements: ['1st Runner-Up in Swarrnim Tech Fest CodeSprint'],
        certificates: ['Python for Data Science - IBM', 'Swarrnim TechFest Certificate of Excellence'],
        updatedAt: '20 May 2024',
      },
      {
        id: 'diary-sem-3',
        semester: 'Semester 3',
        academicYear: '2023-24',
        sgpa: 8.5,
        attendancePercentage: 88.0,
        remarks: 'Demonstrated solid foundation in Data Structures and Algorithmic logic.',
        achievements: ['Participated in National Level Robotics Workshop'],
        certificates: ['Data Structures in C++ - Coursera'],
        updatedAt: '10 Dec 2023',
      },
    ];
  }

  /**
   * ─────────────────────────────────────────────────────────────
   * 3. PARENT-CHILD LINKAGES (Step 5)
   * ─────────────────────────────────────────────────────────────
   */
  static async getParentLinkedChildren(parentUserId: string): Promise<Student[]> {
    return [
      {
        id: 'student-1',
        enrollmentNo: '24010101001',
        name: 'Aarav Sharma',
        email: 'aarav.sharma@swarrnim.edu.in',
        phone: '+91 98765 11111',
        gender: 'Male',
        instituteId: 'inst-1',
        instituteName: 'Swarrnim Institute of Technology',
        departmentId: 'dept-1',
        departmentName: 'Computer Engineering',
        programId: 'prog-1',
        programName: 'B.Tech Computer Engineering',
        batchId: 'batch-2024',
        batchName: '2024-2028',
        semesterId: 'sem-5',
        semesterNumber: 5,
        divisionId: 'div-a',
        divisionName: 'Division A',
        guardianName: 'Rajesh Sharma',
        guardianPhone: '+91 98765 43210',
        mentorName: 'Prof. Ankit Mehta',
        abcId: '9842-1056-7890',
        abcIdStatus: 'VERIFIED',
        status: 'ACTIVE',
      },
      {
        id: 'student-2',
        enrollmentNo: '24020102008',
        name: 'Ananya Sharma',
        email: 'ananya.sharma@swarrnim.edu.in',
        phone: '+91 98765 22222',
        gender: 'Female',
        instituteId: 'inst-2',
        instituteName: 'Swarrnim Institute of Pharmacy',
        departmentId: 'dept-pharm',
        departmentName: 'Pharmaceutical Sciences',
        programId: 'prog-bpharm',
        programName: 'Bachelor of Pharmacy (B.Pharm)',
        batchId: 'batch-2023',
        batchName: '2023-2027',
        semesterId: 'sem-3',
        semesterNumber: 3,
        divisionId: 'div-b',
        divisionName: 'Division B',
        guardianName: 'Rajesh Sharma',
        guardianPhone: '+91 98765 43210',
        mentorName: 'Dr. Sneha Verma',
        abcId: '8712-4431-9002',
        abcIdStatus: 'VERIFIED',
        status: 'ACTIVE',
      },
    ];
  }

  /**
   * ─────────────────────────────────────────────────────────────
   * 4. PTM CONSULTATIONS & RESCHEDULING (Step 9)
   * ─────────────────────────────────────────────────────────────
   */
  static async getPTMRecords(role: string, studentId?: string): Promise<PTMRecord[]> {
    if (studentId && (studentId.includes('unlinked') || studentId.includes('external'))) {
      return [];
    }

    return [
      {
        id: 'ptm-rec-1',
        title: 'Mid-Semester Parent-Teacher Consultation',
        date: '2025-03-25',
        timeSlot: '10:30 AM - 11:00 AM',
        mode: 'OFFLINE',
        venue: 'Room 304, Academic Block A',
        facultyId: 'faculty-1',
        facultyName: 'Dr. Priya Patel (Class Coordinator)',
        studentId: studentId || 'student-1',
        studentName: 'Aarav Sharma',
        status: 'INVITED',

        facultyRemarks: 'Aarav has shown solid progress. Discussion regarding semester project milestones and elective choices.',
        actionItems: ['Review Theory of Computation attendance', 'Finalize Capstone project guide'],
      },
      {
        id: 'ptm-rec-2',
        title: 'Mentor–Mentee Bi-Monthly Review',
        date: '2025-04-10',
        timeSlot: '03:00 PM - 03:30 PM',
        mode: 'ONLINE',
        meetingLink: 'https://meet.google.com/swarrnim-ptm-consult',
        facultyId: 'mentor-1',
        facultyName: 'Prof. Ankit Mehta (Mentor)',
        studentId: studentId || 'student-1',
        studentName: 'Aarav Sharma',
        status: 'CONFIRMED',
        facultyRemarks: 'Routine progress evaluation and career mentoring for internship preparation.',
      },
      {
        id: 'ptm-rec-3',
        title: 'Semester 4 Comprehensive Review',
        date: '2024-11-20',
        timeSlot: '11:00 AM - 11:30 AM',
        mode: 'OFFLINE',
        venue: 'Faculty Lounge, 2nd Floor',
        facultyId: 'faculty-1',
        facultyName: 'Dr. Priya Patel',
        studentId: studentId || 'student-1',
        studentName: 'Aarav Sharma',
        status: 'COMPLETED',
        facultyRemarks: 'Discussed Semester 4 exam performance (SGPA: 8.75). Commended for excellent lab scores.',
        parentFeedback: 'Very satisfied with the faculty mentoring and guidance provided.',
      },
    ];
  }

  static async confirmPTMAttendance(ptmId: string): Promise<boolean> {
    try {
      await api.post(API_ROUTES.PTM.CONFIRM(ptmId));
    } catch (e) {
      console.log('Live PTM confirm failed, mock state updated');
    }
    return true;
  }

  static async requestPTMReschedule(
    ptmId: string,
    proposedDate: string,
    proposedTime: string,
    reason: string
  ): Promise<boolean> {
    try {
      await api.post(API_ROUTES.PTM.RESCHEDULE(ptmId), { proposedDate, proposedTime, reason });
    } catch (e) {
      console.log('Live PTM reschedule failed, mock state updated');
    }
    return true;
  }

  /**
   * ─────────────────────────────────────────────────────────────
   * 5. SERVICE REQUESTS & GRIEVANCE COMPLAINTS (Step 10)
   * ─────────────────────────────────────────────────────────────
   */
  static async getRequests(): Promise<StudentServiceRequest[]> {
    return [
      {
        id: 'req-001',
        ticketNumber: 'SR-2025-089',
        studentId: 'student-1',
        studentName: 'Aarav Sharma',
        enrollmentNo: '24010101001',
        category: 'CERTIFICATE',
        title: 'Bonafide Certificate Request for Passport Application',
        description: 'Need official university bonafide certificate for passport renewal process.',
        status: 'RESOLVED',
        priority: 'NORMAL',
        createdAt: '12 Feb 2025',
        updatedAt: '14 Feb 2025',
        assignedOffice: 'Student Section',
        assignedTo: 'Mr. Arvind Shah (Registrar Office)',
        responseRemarks: 'Approved. Digitally signed Bonafide Certificate generated and attached to Student Documents vault.',
        resolvedAt: '14 Feb 2025, 03:45 PM',
      },
      {
        id: 'req-002',
        ticketNumber: 'SR-2025-142',
        studentId: 'student-1',
        studentName: 'Aarav Sharma',
        enrollmentNo: '24010101001',
        category: 'ACADEMIC',
        title: 'Elective Subject Change to AI/ML Track',
        description: 'Requesting permission to switch Semester 6 open elective to Deep Learning Applications.',
        status: 'UNDER_REVIEW',
        priority: 'HIGH',
        createdAt: '18 Feb 2025',
        updatedAt: '19 Feb 2025',
        assignedOffice: 'Department of Computer Engineering',
        assignedTo: 'Dr. Rajesh Joshi (HOD)',
        responseRemarks: 'Forwarded to Academic Dean for prerequisite credit verification.',
      },
    ];
  }

  static async createServiceRequest(
    category: StudentServiceRequest['category'],
    title: string,
    description: string,
    priority: StudentServiceRequest['priority'] = 'NORMAL'
  ): Promise<StudentServiceRequest> {
    const newReq: StudentServiceRequest = {
      id: `req-${Date.now()}`,
      ticketNumber: `SR-2025-${Math.floor(100 + Math.random() * 900)}`,
      studentId: 'student-1',
      studentName: 'Aarav Sharma',
      enrollmentNo: '24010101001',
      category,
      title,
      description,
      status: 'SUBMITTED',
      priority,
      createdAt: 'Just now',
      updatedAt: 'Just now',
      assignedOffice: 'Student Section',
    };

    try {
      await api.post(API_ROUTES.STUDENT.CREATE_REQUEST, newReq);
    } catch (e) {
      console.log('Live request creation failed, mock saved');
    }

    return newReq;
  }

  /**
   * ─────────────────────────────────────────────────────────────
   * 6. NOTIFICATIONS FEED (Step 11 & 12)
   * ─────────────────────────────────────────────────────────────
   */
  static async getNotifications(): Promise<ERPNotificationItem[]> {
    return [
      {
        id: 'notif-1',
        title: 'Mid-Semester Exam Schedule Published',
        message: 'Mid-Semester timetable for Semester 5 Computer Engineering is now available in your exam portal.',
        module: 'EXAM',
        type: 'ALERT',
        priority: 'HIGH',
        isRead: false,
        createdAt: '2 hours ago',
        deepLink: 'swarrnimerp://results',
      },
      {
        id: 'notif-2',
        title: 'Upcoming PTM Invitation',
        message: 'Parent-Teacher Meeting scheduled for March 25, 2025. Please review and confirm your attendance.',
        module: 'PTM',
        type: 'ACTION_REQUIRED',
        priority: 'HIGH',
        isRead: false,
        createdAt: 'Yesterday',
        deepLink: 'swarrnimerp://ptm/ptm-rec-1',
      },
      {
        id: 'notif-3',
        title: 'Attendance Alert: Theory of Computation',
        message: 'Your current attendance in Theory of Computation is 73.5%, which is below the mandatory 75% threshold.',
        module: 'ATTENDANCE',
        type: 'REMINDER',
        priority: 'URGENT',
        isRead: false,
        createdAt: '2 days ago',
        deepLink: 'swarrnimerp://attendance',
      },
      {
        id: 'notif-4',
        title: 'Service Request SR-2025-089 Resolved',
        message: 'Your Bonafide Certificate request has been approved by the Student Section.',
        module: 'REQUEST',
        type: 'SUCCESS',
        priority: 'NORMAL',
        isRead: true,
        createdAt: '14 Feb 2025',
        deepLink: 'swarrnimerp://requests/req-001',
      },
      {
        id: 'notif-5',
        title: 'University Hackathon Registration Open',
        message: 'Registrations are open for the SSIU Annual Innovation & Startup Hackathon 2025.',
        module: 'NOTICE',
        type: 'INFO',
        priority: 'NORMAL',
        isRead: true,
        createdAt: '10 Feb 2025',
        deepLink: 'swarrnimerp://notices',
      },
    ];
  }

  /**
   * ─────────────────────────────────────────────────────────────
   * 7. PARENT FEE SUMMARY
   * ─────────────────────────────────────────────────────────────
   */
  static async getFeeSummary(studentId?: string): Promise<FeeSummary> {
    return {
      studentId: studentId || 'student-1',
      totalAnnualFee: 95000,
      paidAmount: 95000,
      pendingAmount: 0,
      dueDate: '31 Aug 2024',
      status: 'PAID',
      invoices: [
        { id: 'inv-1', invoiceNo: 'INV-2024-001', feeHead: 'Semester 5 Tuition Fee', amount: 80000, paidAmount: 80000, status: 'PAID', dueDate: '15 Jul 2024' },
        { id: 'inv-2', invoiceNo: 'INV-2024-002', feeHead: 'Examination & University Development Fee', amount: 15000, paidAmount: 15000, status: 'PAID', dueDate: '15 Jul 2024' },
      ],
    };
  }

  /**
   * ─────────────────────────────────────────────────────────────
   * 8. MENTOR & FACULTY WORKSPACE
   * ─────────────────────────────────────────────────────────────
   */
  static async getMentorMentees(): Promise<any[]> {
    return [
      {
        id: 'mentee-1',
        name: 'Aarav Sharma',
        enrollmentNo: '24010101001',
        program: 'B.Tech CE',
        semester: 'Sem 5',
        attendancePercentage: 86.4,
        cgpa: 8.62,
        riskLevel: 'LOW',
        riskFlags: [],
        guardianPhone: '+91 98765 43210',
      },
      {
        id: 'mentee-2',
        name: 'Rohan Verma',
        enrollmentNo: '24010101042',
        program: 'B.Tech CE',
        semester: 'Sem 5',
        attendancePercentage: 68.2,
        cgpa: 6.1,
        riskLevel: 'HIGH',
        riskFlags: ['Low Attendance (<70%)', 'Remedial in Maths'],
        guardianPhone: '+91 98765 88888',
      },
      {
        id: 'mentee-3',
        name: 'Diya Patel',
        enrollmentNo: '24010101018',
        program: 'B.Tech CE',
        semester: 'Sem 5',
        attendancePercentage: 74.0,
        cgpa: 7.45,
        riskLevel: 'MEDIUM',
        riskFlags: ['Borderline Attendance (<75%)'],
        guardianPhone: '+91 98765 99999',
      },
    ];
  }
}
