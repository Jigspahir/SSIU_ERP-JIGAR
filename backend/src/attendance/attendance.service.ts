import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { 
  CreateAttendanceSessionDto, 
  CreateAttendanceCorrectionDto, 
  ReviewAttendanceCorrectionDto, 
  UpdateAttendancePolicyDto 
} from './dto/attendance.dto';

@Injectable()
export class AttendanceService {
  constructor(private readonly prisma: PrismaService) {}

  // In-memory synced policy fallback
  private policy = {
    requiredPercentage: 75,
    warningThreshold: 80,
    criticalThreshold: 65,
    autoLockHours: 24,
    allowCorrectionDays: 7,
    updatedAt: new Date().toISOString()
  };

  // 1. Overall Summary with RBAC Scoping
  async getSummary(user: any) {
    const role = user?.role || 'STUDENT';
    const userId = user?.id || 'stu-1';

    if (role === 'STUDENT') {
      return this.getStudentAttendance(userId, user);
    } else if (role === 'FACULTY') {
      return this.getFacultyAttendance(userId);
    } else if (role === 'HOD') {
      const deptId = user?.departmentId || 'dept-1';
      return this.getDepartmentAttendance(deptId);
    } else if (role === 'HOI' || role === 'DEAN') {
      const instId = user?.instituteId || 'inst-1';
      return this.getInstituteAttendance(instId);
    } else {
      return this.getUniversityAttendance();
    }
  }

  // 2. Student Attendance
  async getStudentAttendance(studentId: string, user: any) {
    const requiredPercentage = this.policy.requiredPercentage;
    const totalClasses = 200;
    const presentClasses = 185;
    const absentClasses = 15;
    const percentage = Number(((presentClasses / totalClasses) * 100).toFixed(1));

    const subjects = [
      {
        subjectId: 'sub-dbms',
        subjectName: 'Database Management Systems',
        subjectCode: 'CSE-402',
        conducted: 40,
        present: 38,
        absent: 2,
        percentage: 95.0,
        status: 'GOOD',
        bufferOrShortage: 20.0,
        classesRequiredToRecover: 0
      },
      {
        subjectId: 'sub-cn',
        subjectName: 'Computer Networks',
        subjectCode: 'CSE-405',
        conducted: 40,
        present: 34,
        absent: 6,
        percentage: 85.0,
        status: 'GOOD',
        bufferOrShortage: 10.0,
        classesRequiredToRecover: 0
      },
      {
        subjectId: 'sub-dsa',
        subjectName: 'Data Structures & Algorithms',
        subjectCode: 'CSE-401',
        conducted: 40,
        present: 28,
        absent: 12,
        percentage: 70.0,
        status: 'LOW',
        bufferOrShortage: -5.0,
        classesRequiredToRecover: 8
      },
      {
        subjectId: 'sub-webtech',
        subjectName: 'Modern Web Architecture',
        subjectCode: 'CSE-403',
        conducted: 40,
        present: 37,
        absent: 3,
        percentage: 92.5,
        status: 'GOOD',
        bufferOrShortage: 17.5,
        classesRequiredToRecover: 0
      },
      {
        subjectId: 'sub-ai',
        subjectName: 'AI Foundations',
        subjectCode: 'CSE-404',
        conducted: 40,
        present: 36,
        absent: 4,
        percentage: 90.0,
        status: 'GOOD',
        bufferOrShortage: 15.0,
        classesRequiredToRecover: 0
      }
    ];

    return {
      studentId,
      overall: {
        totalClasses,
        presentClasses,
        absentClasses,
        percentage,
        requiredPercentage,
        bufferOrShortage: Number((percentage - requiredPercentage).toFixed(1)),
        classesRequiredToRecover: percentage < requiredPercentage ? 8 : 0,
        status: percentage >= requiredPercentage ? 'GOOD' : 'LOW'
      },
      subjects
    };
  }

  // 3. Subject-wise Analytics
  async getSubjectAttendance(subjectId: string, divisionId?: string) {
    const conducted = 40;
    const totalStudentSlots = 320;
    const present = 285;
    const absent = 25;
    const leave = 10;
    const percentage = Number(((present / totalStudentSlots) * 100).toFixed(1));

    return {
      subjectId,
      divisionId: divisionId || 'ALL',
      conducted,
      totalStudentSlots,
      present,
      absent,
      leave,
      attendancePercentage: percentage,
      requiredPercentage: this.policy.requiredPercentage,
      bufferOrShortage: Number((percentage - this.policy.requiredPercentage).toFixed(1)),
      status: percentage >= this.policy.requiredPercentage ? 'GOOD' : 'LOW'
    };
  }

  // 4. Faculty Analytics
  async getFacultyAttendance(facultyId: string) {
    return {
      facultyId,
      todaysClasses: 6,
      attendanceCompletedToday: 5,
      attendancePendingToday: 1,
      averageClassAttendance: 89.4,
      totalConducted: 124,
      subjects: [
        { subjectId: 'sub-dbms', name: 'Database Management Systems', classes: 40, averageAttendance: 95.0 },
        { subjectId: 'sub-webtech', name: 'Modern Web Architecture', classes: 40, averageAttendance: 92.5 }
      ]
    };
  }

  // 5. HOD Analytics
  async getDepartmentAttendance(departmentId: string) {
    return {
      departmentId,
      departmentName: 'Computer Engineering',
      totalStudents: 450,
      totalClasses: 320,
      totalSlots: 4680,
      presentCount: 4250,
      absentCount: 430,
      attendancePercentage: 90.8,
      requiredPercentage: this.policy.requiredPercentage,
      studentsBelowRequirement: 42,
      pendingAttendanceCount: 4
    };
  }

  // 6. HOI Analytics
  async getInstituteAttendance(instituteId: string) {
    return {
      instituteId,
      instituteName: 'SSIT - School of Technology',
      totalStudents: 1250,
      totalClasses: 940,
      overallAttendancePercentage: 91.4,
      presentCount: 11425,
      absentCount: 1075,
      lowAttendanceStudents: 86,
      pendingAttendanceCount: 8,
      departmentComparisons: [
        { department: 'Computer Engineering', percentage: 91.2 },
        { department: 'Information Technology', percentage: 89.8 },
        { department: 'Electronics & Communication', percentage: 92.0 },
        { department: 'Civil Engineering', percentage: 88.5 }
      ]
    };
  }

  // 7. University Analytics
  async getUniversityAttendance() {
    return {
      universityAttendance: {
        totalStudents: 13200,
        present: 12450,
        absent: 750,
        percentage: 94.3,
        lowAttendanceStudents: 184,
        pendingClasses: 12
      },
      instituteComparisons: [
        { institute: 'School of Technology (SSIT)', percentage: 92.4 },
        { institute: 'School of Management (SSIM)', percentage: 88.0 },
        { institute: 'School of Pharmacy (SSIP)', percentage: 90.0 },
        { institute: 'School of Computer Applications (SSCA)', percentage: 93.5 }
      ]
    };
  }

  // 8. Trends
  async getTrends(range = '30D') {
    const daysCount = range === '7D' ? 7 : range === '30D' ? 30 : 60;
    const trends = [];
    const now = new Date();

    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      if (d.getDay() !== 0) {
        const pct = Number((88 + (Math.sin(i) * 6) + (i % 3)).toFixed(1));
        trends.push({
          date: d.toISOString().split('T')[0],
          label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          percentage: Math.min(99, Math.max(70, pct)),
          present: Math.round(180 * (pct / 100)),
          absent: Math.round(180 * ((100 - pct) / 100))
        });
      }
    }

    return trends;
  }

  // 9. Low Attendance List
  async getLowAttendance(threshold = 75) {
    return [
      {
        studentId: 'stu-4',
        studentName: 'Demo Student Four',
        enrollmentNo: '240101001',
        program: 'B.Tech CSE',
        semester: 4,
        subject: 'Computer Networks',
        present: 26,
        total: 40,
        percentage: 65.0,
        shortage: 10.0,
        requiredPercentage: threshold,
        classesRequiredToRecover: 16
      },
      {
        studentId: 'stu-1',
        studentName: 'ABC Student 1',
        enrollmentNo: 'STUDENT-001',
        program: 'B.Tech CSE',
        semester: 4,
        subject: 'Data Structures & Algorithms',
        present: 28,
        total: 40,
        percentage: 70.0,
        shortage: 5.0,
        requiredPercentage: threshold,
        classesRequiredToRecover: 8
      },
      {
        studentId: 'stu-3',
        studentName: 'Demo Student Three',
        enrollmentNo: '230101003',
        program: 'B.Tech CSE',
        semester: 4,
        subject: 'Operating Systems',
        present: 27,
        total: 40,
        percentage: 67.5,
        shortage: 7.5,
        requiredPercentage: threshold,
        classesRequiredToRecover: 12
      }
    ];
  }

  // 10. Shortage Calculator
  calculateShortage(present: number, total: number, requiredPercentage = 75) {
    const currentPercentage = total > 0 ? Number(((present / total) * 100).toFixed(1)) : 100;
    const reqDec = requiredPercentage / 100;
    let classesRequiredToRecover = 0;

    if (currentPercentage < requiredPercentage) {
      classesRequiredToRecover = Math.max(0, Math.ceil((reqDec * total - present) / (1 - reqDec)));
    }

    return {
      present,
      total,
      currentPercentage,
      requiredPercentage,
      shortagePercentage: Number((requiredPercentage - currentPercentage).toFixed(1)),
      classesRequiredToRecover
    };
  }

  // 11. Policy Management
  getPolicy() {
    return this.policy;
  }

  updatePolicy(dto: UpdateAttendancePolicyDto) {
    this.policy = {
      ...this.policy,
      ...dto,
      updatedAt: new Date().toISOString()
    };
    return this.policy;
  }
}
