import { Controller, Get, Post, Patch, Body, Param, Query, Req, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { HostelService } from './hostel.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RbacGuard } from '../rbac/rbac.guard';

@ApiTags('University Hostel & Accommodation Management')
@ApiBearerAuth()
@Controller('api/v1/hostel')
@UseGuards(JwtAuthGuard, RbacGuard)
export class HostelController {
  constructor(private readonly hostelService: HostelService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get Hostel Dashboard KPIs & Capacity Statistics' })
  getHostelDashboardMetrics() {
    return this.hostelService.getHostelDashboardMetrics();
  }

  // ── Hostel Master
  @Post()
  @ApiOperation({ summary: 'Create Hostel' })
  createHostel(@Body() body: any) {
    return this.hostelService.createHostel(body);
  }

  @Get()
  @ApiOperation({ summary: 'List all Hostels with rooms & beds' })
  getHostels() {
    return this.hostelService.getHostels();
  }

  @Post('rooms')
  @ApiOperation({ summary: 'Add room to Hostel' })
  createRoom(@Body() body: any) {
    return this.hostelService.createRoom(body);
  }

  @Get('rooms')
  @ApiOperation({ summary: 'List Hostel Rooms' })
  @ApiQuery({ name: 'hostelId', required: false })
  getRooms(@Query('hostelId') hostelId?: string) {
    return this.hostelService.getRooms(hostelId);
  }

  // ── Applications
  @Post('applications')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Student submits hostel application' })
  submitApplication(@Body() body: any) {
    return this.hostelService.submitApplication(body);
  }

  @Get('applications')
  @ApiOperation({ summary: 'List Hostel Applications' })
  @ApiQuery({ name: 'studentId', required: false })
  @ApiQuery({ name: 'status', required: false })
  getApplications(@Query('studentId') studentId?: string, @Query('status') status?: string) {
    return this.hostelService.getApplications(studentId, status);
  }

  @Patch('applications/:id/approve')
  @ApiOperation({ summary: 'Warden / Admin approves hostel application' })
  approveApplication(@Param('id') id: string, @Req() req: any) {
    return this.hostelService.approveApplication(id, req.user.id);
  }

  // ── Allotments & Transfers
  @Post('allotments')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Allot room and bed to student' })
  allotBed(@Body() body: any) {
    return this.hostelService.allotBed(body);
  }

  @Get('allotments')
  @ApiOperation({ summary: 'List Hostel Allotments' })
  @ApiQuery({ name: 'studentId', required: false })
  @ApiQuery({ name: 'hostelId', required: false })
  getAllotments(@Query('studentId') studentId?: string, @Query('hostelId') hostelId?: string) {
    return this.hostelService.getAllotments(studentId, hostelId);
  }

  @Post('transfers')
  @ApiOperation({ summary: 'Transfer student to another room / bed' })
  transferBed(@Body() body: any, @Req() req: any) {
    return this.hostelService.transferBed(body.allotmentId, body.toBedId, body.reason, req.user.id);
  }

  @Patch('allotments/:id/vacate')
  @ApiOperation({ summary: 'Vacate hostel room allocation' })
  vacateBed(@Param('id') id: string, @Body('remarks') remarks?: string) {
    return this.hostelService.vacateBed(id, remarks);
  }

  // ── Outpass Requests
  @Post('outpass')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Student requests Outpass / Leave' })
  requestOutpass(@Body() body: any) {
    return this.hostelService.requestOutpass(body);
  }

  @Get('outpass')
  @ApiOperation({ summary: 'List Outpass Requests' })
  @ApiQuery({ name: 'studentId', required: false })
  @ApiQuery({ name: 'status', required: false })
  getOutpasses(@Query('studentId') studentId?: string, @Query('status') status?: string) {
    return this.hostelService.getOutpasses(studentId, status);
  }

  @Patch('outpass/:id/approve')
  @ApiOperation({ summary: 'Warden approves Outpass' })
  approveOutpass(@Param('id') id: string, @Req() req: any) {
    return this.hostelService.approveOutpass(id, req.user.id);
  }

  // ── Visitors
  @Post('visitors')
  @ApiOperation({ summary: 'Log Hostel Visitor entry' })
  logVisitor(@Body() body: any) {
    return this.hostelService.logVisitor(body);
  }

  @Get('visitors')
  @ApiOperation({ summary: 'List Hostel Visitors' })
  @ApiQuery({ name: 'hostelId', required: false })
  getVisitors(@Query('hostelId') hostelId?: string) {
    return this.hostelService.getVisitors(hostelId);
  }

  @Patch('visitors/:id/checkout')
  @ApiOperation({ summary: 'Log Visitor checkout' })
  checkoutVisitor(@Param('id') id: string) {
    return this.hostelService.checkoutVisitor(id);
  }

  // ── Complaints
  @Post('complaints')
  @ApiOperation({ summary: 'Student files hostel complaint' })
  raiseComplaint(@Body() body: any) {
    return this.hostelService.raiseComplaint(body);
  }

  @Get('complaints')
  @ApiOperation({ summary: 'List Hostel Complaints' })
  @ApiQuery({ name: 'studentId', required: false })
  @ApiQuery({ name: 'hostelId', required: false })
  getComplaints(@Query('studentId') studentId?: string, @Query('hostelId') hostelId?: string) {
    return this.hostelService.getComplaints(studentId, hostelId);
  }

  @Patch('complaints/:id/resolve')
  @ApiOperation({ summary: 'Mark hostel complaint as resolved' })
  resolveComplaint(@Param('id') id: string, @Body() body: any) {
    return this.hostelService.resolveComplaint(id, body.resolution, body.assignedTo);
  }

  // ── Mess Management
  @Get('mess')
  @ApiOperation({ summary: 'Get Mess list and dining menus' })
  getMesses() {
    return this.hostelService.getMesses();
  }

  @Post('mess/enroll')
  @ApiOperation({ summary: 'Enroll student in mess meal plan' })
  enrollInMess(@Body() body: any) {
    return this.hostelService.enrollInMess(body);
  }
}
