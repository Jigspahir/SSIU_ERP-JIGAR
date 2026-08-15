import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RbacGuard } from '../rbac/rbac.guard';
import { RequirePermission } from '../rbac/require-permission.decorator';

@ApiTags('Central Reporting & Export Engine')
@ApiBearerAuth()
@Controller('api/v1/reports')
@UseGuards(JwtAuthGuard, RbacGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('students')
  @RequirePermission('STUDENT', 'VIEW')
  @ApiOperation({ summary: 'Generate Student Directory Report' })
  @ApiQuery({ name: 'instituteId', required: false })
  @ApiQuery({ name: 'departmentId', required: false })
  getStudentReport(@Query('instituteId') instituteId?: string, @Query('departmentId') departmentId?: string) {
    return this.reportsService.getStudentReport(instituteId, departmentId);
  }

  @Get('faculty')
  @RequirePermission('FACULTY', 'VIEW')
  @ApiOperation({ summary: 'Generate Faculty Directory Report' })
  @ApiQuery({ name: 'instituteId', required: false })
  @ApiQuery({ name: 'departmentId', required: false })
  getFacultyReport(@Query('instituteId') instituteId?: string, @Query('departmentId') departmentId?: string) {
    return this.reportsService.getFacultyReport(instituteId, departmentId);
  }

  @Get('fees')
  @RequirePermission('FEES', 'VIEW')
  @ApiOperation({ summary: 'Generate Fee Dues & Ledger Summary Report' })
  getFeeDuesReport() {
    return this.reportsService.getFeeDuesReport();
  }

  @Get('exams')
  @RequirePermission('EXAM', 'VIEW')
  @ApiOperation({ summary: 'Generate Examination Results Summary Report' })
  @ApiQuery({ name: 'examId', required: false })
  getExamResultsReport(@Query('examId') examId?: string) {
    return this.reportsService.getExamResultsReport(examId);
  }

  @Post('export')
  @ApiOperation({ summary: 'Export authorized report data to Excel/CSV/JSON' })
  exportReport(@Body('reportType') reportType: string, @Body('format') format?: string) {
    return this.reportsService.exportReport(reportType, format);
  }
}
