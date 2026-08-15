import { Controller, Get, Post, Patch, Body, Param, Query, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AttendanceService } from './attendance.service';
import { 
  CreateAttendanceSessionDto, 
  CreateAttendanceCorrectionDto, 
  ReviewAttendanceCorrectionDto, 
  UpdateAttendancePolicyDto 
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
  updatePolicy(@Body() dto: UpdateAttendancePolicyDto) {
    return this.attendanceService.updatePolicy(dto);
  }
}
