import { Controller, Get, Post, Patch, Body, Param, Query, Req, Res, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Response } from 'express';
import { AttendanceService } from './attendance.service';
import { 
  CreateAttendanceSessionDto, 
  CreateAttendanceCorrectionDto, 
  ReviewAttendanceCorrectionDto, 
  UpdateAttendancePolicyDto,
  CreateAttendanceApplicationDto,
  AttendanceReviewActionDto,
  AttendanceApplicationQueryDto,
  AttendanceEligibilityQueryDto
} from './dto/attendance.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RbacGuard } from '../rbac/rbac.guard';

@ApiTags('Attendance Management & Analytics Engine')
@ApiBearerAuth()
@Controller('api/v1/attendance')
@UseGuards(JwtAuthGuard, RbacGuard)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Get role-scoped attendance summary and dashboard KPIs' })
  getSummary(@Req() req: any) {
    return this.attendanceService.getSummary(req.user);
  }

  @Get('student/:id?')
  @ApiOperation({ summary: 'Get student attendance stats (self or authorized)' })
  getStudentAttendance(@Param('id') id: string, @Req() req: any) {
    const targetId = id || req.user?.id;
    return this.attendanceService.getStudentAttendance(targetId, req.user);
  }

  @Get('subject/:id')
  @ApiOperation({ summary: 'Get subject attendance analytics' })
  @ApiQuery({ name: 'divisionId', required: false })
  getSubjectAttendance(@Param('id') id: string, @Query('divisionId') divisionId?: string) {
    return this.attendanceService.getSubjectAttendance(id, divisionId);
  }

  @Get('faculty/:id?')
  @ApiOperation({ summary: 'Get faculty attendance marking performance' })
  getFacultyAttendance(@Param('id') id: string, @Req() req: any) {
    const targetId = id || req.user?.id;
    return this.attendanceService.getFacultyAttendance(targetId);
  }

  @Get('department/:id?')
  @ApiOperation({ summary: 'Get HOD department attendance dashboard' })
  getDepartmentAttendance(@Param('id') id: string, @Req() req: any) {
    const deptId = id || req.user?.departmentId || 'dept-1';
    return this.attendanceService.getDepartmentAttendance(deptId);
  }

  @Get('institute/:id?')
  @ApiOperation({ summary: 'Get HOI institute attendance dashboard' })
  getInstituteAttendance(@Param('id') id: string, @Req() req: any) {
    const instId = id || req.user?.instituteId || 'inst-1';
    return this.attendanceService.getInstituteAttendance(instId);
  }

  @Get('university')
  @ApiOperation({ summary: 'Get university-wide higher authority attendance dashboard' })
  getUniversityAttendance() {
    return this.attendanceService.getUniversityAttendance();
  }

  @Get('trends')
  @ApiOperation({ summary: 'Get attendance trend line/area data points' })
  @ApiQuery({ name: 'range', required: false, enum: ['7D', '30D', 'SEMESTER', 'YEAR'] })
  getTrends(@Query('range') range?: string) {
    return this.attendanceService.getTrends(range);
  }

  @Get('low-attendance')
  @ApiOperation({ summary: 'Get students below required attendance threshold' })
  @ApiQuery({ name: 'threshold', required: false, type: Number })
  getLowAttendance(@Query('threshold') threshold?: number) {
    return this.attendanceService.getLowAttendance(threshold ? Number(threshold) : 75);
  }

  @Get('shortage-calc')
  @ApiOperation({ summary: 'Calculate additional classes required to recover target attendance' })
  @ApiQuery({ name: 'present', required: true, type: Number })
  @ApiQuery({ name: 'total', required: true, type: Number })
  @ApiQuery({ name: 'required', required: false, type: Number })
  calculateShortage(
    @Query('present') present: number,
    @Query('total') total: number,
    @Query('required') required?: number
  ) {
    return this.attendanceService.calculateShortage(Number(present), Number(total), required ? Number(required) : 75);
  }

  @Get('policy')
  @ApiOperation({ summary: 'Get university/institute attendance policy thresholds' })
  getPolicy() {
    return this.attendanceService.getPolicy();
  }

  @Patch('policy')
  @ApiOperation({ summary: 'Update attendance policy threshold configuration' })
  updatePolicy(@Body() dto: UpdateAttendancePolicyDto, @Req() req: any) {
    return this.attendanceService.updatePolicy(dto, req.user);
  }

  // ─── 4-TIER SEQUENTIAL ATTENDANCE CONDONATION APPROVAL WORKFLOW ───────────

  @Post('applications')
  @ApiOperation({ summary: 'Student creates attendance condonation application for shortage (< 75%)' })
  createApplication(@Body() dto: CreateAttendanceApplicationDto, @Req() req: any) {
    return this.attendanceService.createAttendanceApplication(dto, req.user);
  }

  @Get('applications')
  @ApiOperation({ summary: 'Get role-scoped attendance applications queue (Student, Faculty, Mentor, HOD, HOI)' })
  getApplications(@Query() query: AttendanceApplicationQueryDto, @Req() req: any) {
    return this.attendanceService.getApplicationsQueue(query, req.user);
  }

  @Get('applications/:id')
  @ApiOperation({ summary: 'Get attendance application details and audit timeline' })
  getApplicationById(@Param('id') id: string, @Req() req: any) {
    return this.attendanceService.getApplicationById(id, req.user);
  }

  @Post('applications/:id/faculty-review')
  @ApiOperation({ summary: 'Step 1: Subject Faculty review (Approve -> Mentor, Reject, More Info)' })
  facultyReview(@Param('id') id: string, @Body() dto: AttendanceReviewActionDto, @Req() req: any) {
    return this.attendanceService.facultyReview(id, dto, req.user);
  }

  @Post('applications/:id/mentor-review')
  @ApiOperation({ summary: 'Step 2: Student Mentor review (Approve -> HOD, Reject, More Info)' })
  mentorReview(@Param('id') id: string, @Body() dto: AttendanceReviewActionDto, @Req() req: any) {
    return this.attendanceService.mentorReview(id, dto, req.user);
  }

  @Post('applications/:id/hod-review')
  @ApiOperation({ summary: 'Step 3: Department HOD review (Approve -> HOI, Reject, More Info)' })
  hodReview(@Param('id') id: string, @Body() dto: AttendanceReviewActionDto, @Req() req: any) {
    return this.attendanceService.hodReview(id, dto, req.user);
  }

  @Post('applications/:id/hoi-review')
  @ApiOperation({ summary: 'Step 4: Institute HOI (Principal) final review (Grant Exam Eligibility / Reject)' })
  hoiReview(@Param('id') id: string, @Body() dto: AttendanceReviewActionDto, @Req() req: any) {
    return this.attendanceService.hoiReview(id, dto, req.user);
  }

  @Get('eligibility-matrix')
  @ApiOperation({ summary: 'Institutional Exam Eligibility Matrix for Exam Controller / Staff' })
  getEligibilityMatrix(@Query() query: AttendanceEligibilityQueryDto, @Req() req: any) {
    return this.attendanceService.getExamEligibilityMatrix(query, req.user);
  }

  @Get('reports/export-xlsx')
  @ApiOperation({ summary: 'Export official attendance and exam eligibility report to Excel (.xlsx)' })
  async exportReportXlsx(@Query() query: AttendanceEligibilityQueryDto, @Req() req: any, @Res() res: Response) {
    const buffer = await this.attendanceService.exportAttendanceReportXlsx(query, req.user);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="SSIU_Attendance_Exam_Eligibility_${Date.now()}.xlsx"`);
    res.send(buffer);
  }
}

