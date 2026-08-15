import { Controller, Get, Post, Patch, Body, Param, Query, Req, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ExamService } from './exam.service';
import { CreateExamTypeDto, CreateExamDto, CreateExamFormWindowDto, SubmitExamFormDto, CreateExamScheduleDto, EnterResultDto } from './dto/exam.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RbacGuard } from '../rbac/rbac.guard';

@ApiTags('University Examination, Evaluation & Result Management')
@ApiBearerAuth()
@Controller('api/v1/exams')
@UseGuards(JwtAuthGuard, RbacGuard)
export class ExamController {
  constructor(private readonly examService: ExamService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get Examination KPI metrics & dashboard statistics' })
  getExamDashboardMetrics() {
    return this.examService.getExamDashboardMetrics();
  }

  // ── Exam Types
  @Post('types')
  @ApiOperation({ summary: 'Create Exam Type (REGULAR, BACKLOG, ATKT, REMEDIAL, etc.)' })
  createExamType(@Body() dto: CreateExamTypeDto) {
    return this.examService.createExamType(dto);
  }

  @Get('types')
  @ApiOperation({ summary: 'List all Exam Types' })
  getExamTypes() {
    return this.examService.getExamTypes();
  }

  // ── Exam Sessions
  @Post()
  @ApiOperation({ summary: 'Create new Exam session' })
  createExam(@Body() dto: CreateExamDto, @Req() req: any) {
    return this.examService.createExam(dto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'List Exams' })
  @ApiQuery({ name: 'programId', required: false })
  @ApiQuery({ name: 'status', required: false })
  getExams(@Query('programId') programId?: string, @Query('status') status?: string) {
    return this.examService.getExams(programId, status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get Exam by ID' })
  getExamById(@Param('id') id: string) {
    return this.examService.getExamById(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update Exam status (ACTIVE, COMPLETED, CANCELLED)' })
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.examService.updateExamStatus(id, status);
  }

  // ── Form Windows
  @Post('windows')
  @ApiOperation({ summary: 'Create Exam Form Window (open/close dates, fees)' })
  createWindow(@Body() dto: CreateExamFormWindowDto) {
    return this.examService.createFormWindow(dto);
  }

  @Get('windows/active')
  @ApiOperation({ summary: 'Get Active Exam Form Windows' })
  getActiveWindows() {
    return this.examService.getActiveFormWindows();
  }

  // ── Exam Forms
  @Post('forms/submit')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Student submits exam form' })
  submitForm(@Body() dto: SubmitExamFormDto, @Req() req: any) {
    return this.examService.submitExamForm(dto, req.user.id);
  }

  @Get('forms')
  @ApiOperation({ summary: 'Get all exam forms' })
  @ApiQuery({ name: 'examId', required: false })
  @ApiQuery({ name: 'studentId', required: false })
  @ApiQuery({ name: 'status', required: false })
  getForms(@Query('examId') examId?: string, @Query('studentId') studentId?: string, @Query('status') status?: string) {
    return this.examService.getExamForms(examId, studentId, status);
  }

  @Patch('forms/:id/approve')
  @ApiOperation({ summary: 'Approve exam form' })
  approveForm(@Param('id') id: string, @Body('feePaid') feePaid: boolean) {
    return this.examService.approveExamForm(id, feePaid);
  }

  // ── Hall Tickets
  @Post('forms/:id/generate-hall-ticket')
  @ApiOperation({ summary: 'Generate official Hall Ticket upon form approval & fee clearance' })
  generateHallTicket(@Param('id') id: string) {
    return this.examService.generateHallTicket(id);
  }

  @Get('hall-tickets')
  @ApiOperation({ summary: 'Get Hall Tickets' })
  getHallTickets(@Req() req: any) {
    const isStudent = (req.user?.roles || []).includes('STUDENT');
    return this.examService.getHallTickets(isStudent ? req.user.id : undefined);
  }

  // ── Exam Centres & Rooms
  @Get('centres')
  @ApiOperation({ summary: 'Get Exam Centres and Rooms' })
  getExamCentres() {
    return this.examService.getExamCentres();
  }

  @Post('centres')
  @ApiOperation({ summary: 'Create Exam Centre' })
  createExamCentre(@Body() body: any) {
    return this.examService.createExamCentre(body);
  }

  // ── Invigilation & Exam Attendance
  @Post('invigilators')
  @ApiOperation({ summary: 'Assign Invigilator duty to Faculty' })
  assignInvigilator(@Body() body: any) {
    return this.examService.assignInvigilator(body);
  }

  @Post('attendance')
  @ApiOperation({ summary: 'Record student Exam Attendance (PRESENT, ABSENT, MALPRACTICE, etc.)' })
  recordAttendance(@Req() req: any, @Body() body: any) {
    return this.examService.recordExamAttendance({
      ...body,
      markedByUserId: req.user.id,
    });
  }

  // ── Exam Schedule
  @Post('schedules')
  @ApiOperation({ summary: 'Create Exam Schedule (subject-wise timetable)' })
  createSchedule(@Body() dto: CreateExamScheduleDto) {
    return this.examService.createSchedule(dto);
  }

  @Get(':examId/schedules')
  @ApiOperation({ summary: 'Get Exam Timetable for an Exam' })
  getSchedules(@Param('examId') examId: string) {
    return this.examService.getSchedules(examId);
  }

  // ── Marks & Result Processing
  @Post('results/enter')
  @ApiOperation({ summary: 'Enter/update marks for a student-subject' })
  enterResult(@Body() dto: EnterResultDto, @Req() req: any) {
    return this.examService.enterResult(dto, req.user.id);
  }

  @Post(':examId/calculate-results')
  @ApiOperation({ summary: 'Calculate SGPA, CGPA, Backlogs, Lock and Publish Results' })
  calculateAndPublishResults(@Param('examId') examId: string) {
    return this.examService.calculateAndPublishResults(examId);
  }

  @Get('results/my')
  @ApiOperation({ summary: 'Get student results and marksheets' })
  getMyResults(@Req() req: any) {
    return this.examService.getStudentResults(req.user.id);
  }

  // ── Revaluation
  @Post('revaluation/apply')
  @ApiOperation({ summary: 'Student applies for Revaluation / Rechecking' })
  applyRevaluation(@Req() req: any, @Body() body: any) {
    return this.examService.applyRevaluation(body, req.user.id);
  }

  @Get('revaluations')
  @ApiOperation({ summary: 'Get Revaluation Requests' })
  getRevaluations() {
    return this.examService.getRevaluations();
  }
}
