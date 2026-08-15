import { Controller, Get, Post, Patch, Body, Param, Query, Req, UseGuards, HttpCode, HttpStatus, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { WorkManagementService } from './work-management.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('My Work & Personal Work Management')
@ApiBearerAuth()
@Controller('api/v1/my-work')
@UseGuards(JwtAuthGuard)
export class WorkManagementController {
  constructor(private readonly workService: WorkManagementService) {}

  private checkNonStudent(req: any) {
    const roles: string[] = req.user?.roles || [];
    if (roles.length === 1 && roles[0].toUpperCase() === 'STUDENT') {
      throw new ForbiddenException('Personal Work Diary module is available to University Staff & Employees only.');
    }
  }

  @Get('dashboard')
  @ApiOperation({ summary: 'Get My Work Dashboard (Tasks, Meetings, Appointments, Reminders)' })
  getWorkDashboard(@Req() req: any) {
    this.checkNonStudent(req);
    return this.workService.getWorkDashboard(req.user.id);
  }

  // ── Work Diary
  @Post('diary')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Record Daily Work Diary entry' })
  createDiaryEntry(@Req() req: any, @Body() body: any) {
    this.checkNonStudent(req);
    return this.workService.createDiaryEntry(req.user.id, body);
  }

  @Get('diary')
  @ApiOperation({ summary: 'Get Daily Work Diary entries' })
  @ApiQuery({ name: 'date', required: false })
  getDiaryEntries(@Req() req: any, @Query('date') date?: string) {
    this.checkNonStudent(req);
    return this.workService.getDiaryEntries(req.user.id, date);
  }

  // ── Tasks
  @Post('tasks')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create Work Task' })
  createTask(@Req() req: any, @Body() body: any) {
    this.checkNonStudent(req);
    return this.workService.createTask(req.user.id, body);
  }

  @Get('tasks')
  @ApiOperation({ summary: 'Get Tasks (Personal or Assigned)' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'assignedToMe', required: false })
  getTasks(@Req() req: any, @Query('status') status?: string, @Query('assignedToMe') assignedToMe?: string) {
    this.checkNonStudent(req);
    return this.workService.getTasks(req.user.id, status, assignedToMe === 'true');
  }

  @Patch('tasks/:id/status')
  @ApiOperation({ summary: 'Update Task Status & Next Action' })
  updateTaskStatus(
    @Req() req: any,
    @Param('id') id: string,
    @Body('status') status: string,
    @Body('nextAction') nextAction?: string,
    @Body('nextActionDate') nextActionDate?: string,
  ) {
    this.checkNonStudent(req);
    return this.workService.updateTaskStatus(req.user.id, id, status, nextAction, nextActionDate);
  }

  @Post('tasks/:id/delegate')
  @ApiOperation({ summary: 'Delegate Task to Team Member' })
  delegateTask(
    @Req() req: any,
    @Param('id') id: string,
    @Body('delegateToUserId') delegateToUserId: string,
    @Body('dueBy') dueBy: string,
    @Body('reason') reason?: string,
  ) {
    this.checkNonStudent(req);
    return this.workService.delegateTask(req.user.id, id, delegateToUserId, dueBy, reason);
  }

  // ── Meetings
  @Post('meetings')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Schedule Personal Meeting & Invite Participants' })
  createMeeting(@Req() req: any, @Body() body: any) {
    this.checkNonStudent(req);
    return this.workService.createMeeting(req.user.id, body);
  }

  @Get('meetings')
  @ApiOperation({ summary: 'Get Meetings' })
  getMeetings(@Req() req: any) {
    this.checkNonStudent(req);
    return this.workService.getMeetings(req.user.id);
  }

  // ── Appointments & Follow-ups
  @Post('appointments')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create Personal Appointment' })
  createAppointment(@Req() req: any, @Body() body: any) {
    this.checkNonStudent(req);
    return this.workService.createAppointment(req.user.id, body);
  }

  @Get('appointments')
  @ApiOperation({ summary: 'Get Appointments' })
  getAppointments(@Req() req: any) {
    this.checkNonStudent(req);
    return this.workService.getAppointments(req.user.id);
  }

  @Post('follow-ups')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create Follow-up Tracker' })
  createFollowUp(@Req() req: any, @Body() body: any) {
    this.checkNonStudent(req);
    return this.workService.createFollowUp(req.user.id, body);
  }

  @Get('follow-ups')
  @ApiOperation({ summary: 'Get Follow-ups' })
  getFollowUps(@Req() req: any) {
    this.checkNonStudent(req);
    return this.workService.getFollowUps(req.user.id);
  }

  // ── Notes & Calendar
  @Post('notes')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create Private Quick Note' })
  createNote(@Req() req: any, @Body() body: any) {
    this.checkNonStudent(req);
    return this.workService.createNote(req.user.id, body);
  }

  @Get('notes')
  @ApiOperation({ summary: 'Get Personal Notes' })
  @ApiQuery({ name: 'search', required: false })
  getNotes(@Req() req: any, @Query('search') search?: string) {
    this.checkNonStudent(req);
    return this.workService.getNotes(req.user.id, search);
  }

  @Get('calendar')
  @ApiOperation({ summary: 'Get Calendar Aggregated Items' })
  getCalendarItems(@Req() req: any) {
    this.checkNonStudent(req);
    return this.workService.getCalendarItems(req.user.id);
  }
}
