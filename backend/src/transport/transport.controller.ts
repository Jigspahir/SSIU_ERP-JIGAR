import { Controller, Get, Post, Patch, Body, Param, Query, Req, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { TransportService } from './transport.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RbacGuard } from '../rbac/rbac.guard';

@ApiTags('University Transport & Fleet Management')
@ApiBearerAuth()
@Controller('api/v1/transport')
@UseGuards(JwtAuthGuard, RbacGuard)
export class TransportController {
  constructor(private readonly transportService: TransportService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get Transport Dashboard KPIs & Fleet Statistics' })
  getTransportDashboardMetrics() {
    return this.transportService.getTransportDashboardMetrics();
  }

  // ── Vehicles
  @Post('vehicles')
  @ApiOperation({ summary: 'Add new Vehicle to fleet' })
  createVehicle(@Body() body: any) {
    return this.transportService.createVehicle(body);
  }

  @Get('vehicles')
  @ApiOperation({ summary: 'List all Fleet Vehicles' })
  getVehicles() {
    return this.transportService.getVehicles();
  }

  // ── Drivers
  @Post('drivers')
  @ApiOperation({ summary: 'Register Driver profile' })
  createDriver(@Body() body: any) {
    return this.transportService.createDriver(body);
  }

  @Get('drivers')
  @ApiOperation({ summary: 'List Drivers' })
  getDrivers() {
    return this.transportService.getDrivers();
  }

  // ── Routes
  @Post('routes')
  @ApiOperation({ summary: 'Create Transport Route' })
  createRoute(@Body() body: any) {
    return this.transportService.createRoute(body);
  }

  @Get('routes')
  @ApiOperation({ summary: 'List Transport Routes with Stops' })
  getRoutes() {
    return this.transportService.getRoutes();
  }

  // ── Applications
  @Post('applications')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Submit Transport application' })
  submitApplication(@Body() body: any) {
    return this.transportService.submitApplication(body);
  }

  @Get('applications')
  @ApiOperation({ summary: 'List Transport applications' })
  @ApiQuery({ name: 'studentId', required: false })
  @ApiQuery({ name: 'status', required: false })
  getApplications(@Query('studentId') studentId?: string, @Query('status') status?: string) {
    return this.transportService.getApplications(studentId, status);
  }

  @Patch('applications/:id/approve')
  @ApiOperation({ summary: 'Approve Transport application' })
  approveApplication(@Param('id') id: string, @Req() req: any) {
    return this.transportService.approveApplication(id, req.user.id);
  }

  // ── Allotments & Passes
  @Post('allotments')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Allot transport & generate digital QR Pass' })
  allotTransport(@Body() body: any) {
    return this.transportService.allotTransport(body);
  }

  @Get('allotments')
  @ApiOperation({ summary: 'List Transport Allotments' })
  @ApiQuery({ name: 'studentId', required: false })
  @ApiQuery({ name: 'routeId', required: false })
  getAllotments(@Query('studentId') studentId?: string, @Query('routeId') routeId?: string) {
    return this.transportService.getAllotments(studentId, routeId);
  }

  @Get('passes')
  @ApiOperation({ summary: 'Get Transport Passes' })
  @ApiQuery({ name: 'studentId', required: false })
  getPasses(@Query('studentId') studentId?: string) {
    return this.transportService.getPasses(studentId);
  }

  // ── Trips
  @Post('trips')
  @ApiOperation({ summary: 'Schedule daily bus trip' })
  createTrip(@Body() body: any) {
    return this.transportService.createTrip(body);
  }

  @Get('trips')
  @ApiOperation({ summary: 'List Transport Trips' })
  getTrips() {
    return this.transportService.getTrips();
  }

  // ── Maintenance
  @Post('maintenance')
  @ApiOperation({ summary: 'Log vehicle maintenance order' })
  createMaintenance(@Body() body: any) {
    return this.transportService.createMaintenance(body);
  }

  @Get('maintenance')
  @ApiOperation({ summary: 'List vehicle maintenance logs' })
  getMaintenances() {
    return this.transportService.getMaintenances();
  }

  // ── Complaints
  @Post('complaints')
  @ApiOperation({ summary: 'Submit transport complaint' })
  raiseComplaint(@Body() body: any) {
    return this.transportService.raiseComplaint(body);
  }

  @Get('complaints')
  @ApiOperation({ summary: 'List transport complaints' })
  @ApiQuery({ name: 'studentId', required: false })
  getComplaints(@Query('studentId') studentId?: string) {
    return this.transportService.getComplaints(studentId);
  }
}
