import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async getStudentReport(instituteId?: string, departmentId?: string) {
    const students = await this.prisma.student.findMany({
      where: {
        ...(instituteId ? { instituteId } : {}),
        ...(departmentId ? { departmentId } : {}),
      },
      include: { institute: true, department: true, batch: true },
      take: 200,
    });

    return {
      totalCount: students.length,
      reportType: 'STUDENT_DIRECTORY',
      generatedAt: new Date(),
      data: students.map((s) => ({
        enrollmentNo: s.enrollmentNo,
        name: `${s.firstName} ${s.lastName}`,
        email: s.email,
        institute: s.institute?.name,
        department: s.department?.name,
        status: s.status,
      })),
    };
  }

  async getFacultyReport(instituteId?: string, departmentId?: string) {
    const facultyList = await this.prisma.faculty.findMany({
      where: {
        ...(instituteId ? { instituteId } : {}),
        ...(departmentId ? { departmentId } : {}),
      },
      include: { institute: true, department: true },
      take: 200,
    });

    return {
      totalCount: facultyList.length,
      reportType: 'FACULTY_DIRECTORY',
      generatedAt: new Date(),
      data: facultyList.map((f) => ({
        employeeCode: f.employeeCode,
        name: `${f.firstName} ${f.lastName}`,
        email: f.email,
        designation: f.designation,
        institute: f.institute?.name,
        department: f.department?.name,
        status: f.status,
      })),
    };
  }

  async getFeeDuesReport() {
    const accounts = await this.prisma.studentFeeAccount.findMany({
      include: { student: true, feeStructure: true },
      take: 200,
    });

    return {
      totalCount: accounts.length,
      reportType: 'FEE_DUES_SUMMARY',
      generatedAt: new Date(),
      data: accounts.map((a) => ({
        studentId: a.studentId,
        studentName: a.student ? `${a.student.firstName} ${a.student.lastName}` : 'N/A',
        totalFee: Number(a.totalDue || 0),
        paidFee: Number(a.totalPaid || 0),
        dueBalance: Number(a.balanceDue || 0),
        status: a.status,
      })),
    };
  }

  async getExamResultsReport(examId?: string) {
    const results = await this.prisma.examResult.findMany({
      include: { examForm: { include: { student: true, exam: true } }, subject: true },
      take: 200,
    });

    return {
      totalCount: results.length,
      reportType: 'EXAM_RESULT_SUMMARY',
      generatedAt: new Date(),
      data: results.map((r) => ({
        enrollmentNo: r.examForm?.student?.enrollmentNo,
        studentName: r.examForm?.student ? `${r.examForm.student.firstName} ${r.examForm.student.lastName}` : 'N/A',
        examName: r.examForm?.exam?.name,
        subjectCode: r.subject?.code,
        marksObtained: Number(r.marksObtained),
        maxMarks: Number(r.maxMarks),
        grade: r.grade,
        resultStatus: r.resultStatus,
      })),
    };
  }

  async exportReport(reportType: string, format: string = 'JSON') {
    let reportData: any;
    switch (reportType.toUpperCase()) {
      case 'STUDENTS':
        reportData = await this.getStudentReport();
        break;
      case 'FACULTY':
        reportData = await this.getFacultyReport();
        break;
      case 'FEES':
        reportData = await this.getFeeDuesReport();
        break;
      case 'EXAMS':
        reportData = await this.getExamResultsReport();
        break;
      default:
        reportData = await this.getStudentReport();
    }

    return {
      format: format.toUpperCase(),
      reportType: reportType.toUpperCase(),
      exportedAt: new Date(),
      content: reportData,
    };
  }
}
