import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { AdmissionService } from './admission.service';
import {
  CreateLeadDto,
  UpdateLeadDto,
  AssignLeadDto,
  UpdateLeadStatusDto,
  RecordFollowUpDto,
  CreateApplicationDto,
  DocumentAttachmentDto,
  VerifyDocumentDto,
  VerifyApplicationDto,
  ApproveAdmissionDto,
  RejectAdmissionDto,
  EnrollStudentDto,
  LeadQueryDto,
  ApplicationQueryDto,
} from './dto/admission.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RbacGuard } from '../rbac/rbac.guard';

@ApiTags('Admission & Enrollment Management')
@ApiBearerAuth()
@Controller('api/v1/admission')
export class AdmissionController {
  constructor(private readonly admissionService: AdmissionService) {}

  @Get('dashboard')
  @UseGuards(JwtAuthGuard, RbacGuard)
  @ApiOperation({ summary: 'Get Admission Funnel & Dashboard Metrics' })
  getAdmissionDashboardMetrics() {
    return this.admissionService.getAdmissionDashboardMetrics();
  }

  // ── 1. Admission Cycles ───────────────────────────────────────────────────

  @Get('cycles')
  @ApiOperation({ summary: 'Get Active Admission Cycles' })
  getAdmissionCycles() {
    return this.admissionService.getAdmissionCycles();
  }

  @Post('cycles')
  @UseGuards(JwtAuthGuard, RbacGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new Admission Cycle' })
  createAdmissionCycle(@Body() body: any) {
    return this.admissionService.createAdmissionCycle(body);
  }

  // ── 2. Leads & Inquiries ──────────────────────────────────────────────────

  @Post('inquiries')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register Applicant Inquiry / Lead (Public or Counselor)' })
  createInquiry(@Body() body: CreateLeadDto) {
    return this.admissionService.createInquiry(body);
  }

  @Get('inquiries')
  @UseGuards(JwtAuthGuard, RbacGuard)
  @ApiOperation({ summary: 'Get Leads / Inquiries with status, source, counselor filtering, pagination and search' })
  getInquiries(@Req() req: any, @Query() query: LeadQueryDto) {
    return this.admissionService.getInquiries(req.user, query);
  }

  @Get('inquiries/:id')
  @UseGuards(JwtAuthGuard, RbacGuard)
  @ApiOperation({ summary: 'Get Lead details and complete counselling history' })
  getInquiryById(@Param('id') id: string) {
    return this.admissionService.getInquiryById(id);
  }

  @Patch('inquiries/:id')
  @UseGuards(JwtAuthGuard, RbacGuard)
  @ApiOperation({ summary: 'Update Lead details' })
  updateInquiry(@Param('id') id: string, @Body() body: UpdateLeadDto) {
    return this.admissionService.updateInquiry(id, body);
  }

  @Post('inquiries/:id/assign')
  @UseGuards(JwtAuthGuard, RbacGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Assign Lead to Counselor' })
  assignLead(@Param('id') id: string, @Body() body: AssignLeadDto) {
    return this.admissionService.assignLead(id, body);
  }

  @Patch('inquiries/:id/status')
  @UseGuards(JwtAuthGuard, RbacGuard)
  @ApiOperation({ summary: 'Update Lead Status in conversion workflow' })
  updateLeadStatus(@Param('id') id: string, @Body() body: UpdateLeadStatusDto) {
    return this.admissionService.updateLeadStatus(id, body);
  }

  @Post('counselling')
  @UseGuards(JwtAuthGuard, RbacGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Record Student Counselling Notes & Follow-up' })
  recordCounselling(@Req() req: any, @Body() body: RecordFollowUpDto) {
    return this.admissionService.recordCounselling(body, req.user.id);
  }

  @Get('inquiries/:id/follow-ups')
  @UseGuards(JwtAuthGuard, RbacGuard)
  @ApiOperation({ summary: 'Get Follow-up history for a Lead' })
  getFollowUpHistory(@Param('id') id: string) {
    return this.admissionService.getFollowUpHistory(id);
  }

  // ── 3. Applications & Documents ───────────────────────────────────────────

  @Post('applications')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Submit Admission Application' })
  createApplication(@Body() body: CreateApplicationDto) {
    return this.admissionService.createApplication(body);
  }

  @Get('applications')
  @UseGuards(JwtAuthGuard, RbacGuard)
  @ApiOperation({ summary: 'Get Admission Applications with pagination and filtering' })
  getApplications(@Query() query: ApplicationQueryDto) {
    return this.admissionService.getApplications(query);
  }

  @Get('applications/:id')
  @UseGuards(JwtAuthGuard, RbacGuard)
  @ApiOperation({ summary: 'Get Admission Application Details by ID' })
  getApplicationById(@Param('id') id: string) {
    return this.admissionService.getApplicationById(id);
  }

  @Post('applications/:id/documents')
  @UseGuards(JwtAuthGuard, RbacGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Upload document attachment to admission application' })
  uploadDocument(@Param('id') id: string, @Body() body: DocumentAttachmentDto) {
    return this.admissionService.uploadApplicationDocument(id, body);
  }

  @Post('applications/:id/verify-document')
  @UseGuards(JwtAuthGuard, RbacGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify single Application Document' })
  verifyDocument(@Param('id') id: string, @Req() req: any, @Body() body: VerifyDocumentDto) {
    return this.admissionService.verifyDocument(body.documentId, req.user.id, body.isApproved, body.remarks);
  }

  @Post('applications/:id/verify')
  @UseGuards(JwtAuthGuard, RbacGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify Application and confirm document completeness' })
  verifyApplication(@Param('id') id: string, @Req() req: any, @Body() body: VerifyApplicationDto) {
    return this.admissionService.verifyApplication(id, req.user.id, body);
  }

  @Post('applications/:id/approve')
  @UseGuards(JwtAuthGuard, RbacGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Approve Admission Application (Admit Student)' })
  approveApplication(@Param('id') id: string, @Req() req: any, @Body() body?: ApproveAdmissionDto) {
    const roleCode = (req.user?.roles || ['ADMISSION_MANAGER'])[0];
    return this.admissionService.approveApplication(id, req.user.id, roleCode, body);
  }

  @Post('applications/:id/reject')
  @UseGuards(JwtAuthGuard, RbacGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reject Admission Application with mandatory reason' })
  rejectApplication(@Param('id') id: string, @Req() req: any, @Body() body: RejectAdmissionDto) {
    return this.admissionService.rejectApplication(id, req.user.id, body);
  }

  @Post('applications/:id/confirm-fee')
  @UseGuards(JwtAuthGuard, RbacGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Confirm Admission Fee Payment' })
  confirmFeePayment(@Param('id') id: string, @Body() body: any) {
    return this.admissionService.confirmFeePayment(id, body.feeAmount, body.receiptNo);
  }

  @Post('applications/:id/enroll')
  @UseGuards(JwtAuthGuard, RbacGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Enroll Student: Generate Enrollment No, ERP ID, Student Master & User Login' })
  enrollStudent(@Param('id') id: string, @Req() req: any, @Body() body?: EnrollStudentDto) {
    return this.admissionService.enrollStudent(id, req.user.id, body);
  }

  // ── 4. Admission Reports ──────────────────────────────────────────────────

  @Get('reports/programs')
  @UseGuards(JwtAuthGuard, RbacGuard)
  @ApiOperation({ summary: 'Program-wise Admission statistics report' })
  getProgramReport() {
    return this.admissionService.getProgramAdmissionsReport();
  }

  @Get('reports/sources')
  @UseGuards(JwtAuthGuard, RbacGuard)
  @ApiOperation({ summary: 'Lead Source Effectiveness and conversion report' })
  getSourceReport() {
    return this.admissionService.getSourceEffectivenessReport();
  }
}
