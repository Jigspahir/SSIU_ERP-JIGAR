import { Controller, Get, Post, Body, Param, Query, Req, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AdmissionService } from './admission.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RbacGuard } from '../rbac/rbac.guard';

@ApiTags('Admission & Enrollment Management')
@Controller('api/v1/admission')
export class AdmissionController {
  constructor(private readonly admissionService: AdmissionService) {}

  @Get('dashboard')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RbacGuard)
  @ApiOperation({ summary: 'Get Admission Funnel & Dashboard Metrics' })
  getAdmissionDashboardMetrics() {
    return this.admissionService.getAdmissionDashboardMetrics();
  }

  // ── Cycles
  @Get('cycles')
  @ApiOperation({ summary: 'Get Active Admission Cycles' })
  getAdmissionCycles() {
    return this.admissionService.getAdmissionCycles();
  }

  @Post('cycles')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RbacGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new Admission Cycle' })
  createAdmissionCycle(@Body() body: any) {
    return this.admissionService.createAdmissionCycle(body);
  }

  // ── Inquiries & Leads
  @Post('inquiries')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register Applicant Inquiry / Lead' })
  createInquiry(@Body() body: any) {
    return this.admissionService.createInquiry(body);
  }

  @Get('inquiries')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RbacGuard)
  @ApiOperation({ summary: 'Get Inquiries' })
  @ApiQuery({ name: 'counsellorUserId', required: false })
  @ApiQuery({ name: 'status', required: false })
  getInquiries(@Query('counsellorUserId') counsellorUserId?: string, @Query('status') status?: string) {
    return this.admissionService.getInquiries(counsellorUserId, status);
  }

  @Post('counselling')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RbacGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Record Student Counselling Notes & Follow-up' })
  recordCounselling(@Req() req: any, @Body() body: any) {
    return this.admissionService.recordCounselling({
      ...body,
      counsellorUserId: req.user.id,
    });
  }

  // ── Applications
  @Post('applications')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Submit Admission Application' })
  createApplication(@Body() body: any) {
    return this.admissionService.createApplication(body);
  }

  @Get('applications')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RbacGuard)
  @ApiOperation({ summary: 'Get Admission Applications' })
  @ApiQuery({ name: 'instituteId', required: false })
  @ApiQuery({ name: 'programId', required: false })
  @ApiQuery({ name: 'status', required: false })
  getApplications(@Query() filters: any) {
    return this.admissionService.getApplications(filters);
  }

  @Get('applications/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RbacGuard)
  @ApiOperation({ summary: 'Get Admission Application Details by ID' })
  getApplicationById(@Param('id') id: string) {
    return this.admissionService.getApplicationById(id);
  }

  @Post('applications/:id/verify-document')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RbacGuard)
  @ApiOperation({ summary: 'Verify Application Document' })
  verifyDocument(@Param('id') id: string, @Req() req: any, @Body() body: any) {
    return this.admissionService.verifyDocument(body.documentId, req.user.id, body.isApproved, body.remarks);
  }

  @Post('applications/:id/approve')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RbacGuard)
  @ApiOperation({ summary: 'Approve Admission Application' })
  approveApplication(@Param('id') id: string, @Req() req: any, @Body() body: any) {
    const roleCode = (req.user?.roles || ['ADMISSION_MANAGER'])[0];
    return this.admissionService.approveApplication(id, req.user.id, roleCode, body.comments);
  }

  @Post('applications/:id/confirm-fee')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RbacGuard)
  @ApiOperation({ summary: 'Confirm Admission Fee Payment' })
  confirmFeePayment(@Param('id') id: string, @Body() body: any) {
    return this.admissionService.confirmFeePayment(id, body.feeAmount, body.receiptNo);
  }

  @Post('applications/:id/enroll')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RbacGuard)
  @ApiOperation({ summary: 'Enroll Student and Generate Student & User Master Records' })
  enrollStudent(@Param('id') id: string, @Req() req: any, @Body() body: any) {
    return this.admissionService.enrollStudent(id, req.user.id, body.batchId, body.divisionId);
  }
}
