import { Controller, Get, Post, Body, Param, Req, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { StudentServicesService } from './student-services.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RbacGuard } from '../rbac/rbac.guard';

@ApiTags('Digital Student Services & Certificates')
@Controller('api/v1/student-services')
export class StudentServicesController {
  constructor(private readonly servicesService: StudentServicesService) {}

  @Get('catalog')
  @ApiOperation({ summary: 'Get Configurable Digital Student Service Catalog' })
  getServiceCatalog() {
    return this.servicesService.getServiceCatalog();
  }

  @Post('requests')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RbacGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Submit Digital Student Service Request' })
  createServiceRequest(@Req() req: any, @Body() body: any) {
    return this.servicesService.createServiceRequest(req.user.id, body);
  }

  @Get('requests')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RbacGuard)
  @ApiOperation({ summary: 'Get Student Service Requests' })
  getStudentRequests(@Req() req: any) {
    const isStudent = (req.user?.roles || []).includes('STUDENT');
    return this.servicesService.getStudentRequests(req.user.id, isStudent);
  }

  @Get('requests/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RbacGuard)
  @ApiOperation({ summary: 'Get Service Request Details by ID' })
  getRequestById(@Param('id') id: string, @Req() req: any) {
    const isStudent = (req.user?.roles || []).includes('STUDENT');
    return this.servicesService.getRequestById(id, req.user.id, isStudent);
  }

  @Post('requests/:id/cancel')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RbacGuard)
  @ApiOperation({ summary: 'Cancel Service Request' })
  cancelRequest(@Param('id') id: string, @Req() req: any) {
    return this.servicesService.cancelRequest(id, req.user.id);
  }

  @Post('requests/:id/generate-certificate')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RbacGuard)
  @ApiOperation({ summary: 'Generate Digital Certificate upon Request Approval' })
  generateCertificate(@Param('id') id: string, @Body('signatoryTitle') signatoryTitle?: string) {
    return this.servicesService.generateCertificate(id, signatoryTitle);
  }

  @Get('certificates')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RbacGuard)
  @ApiOperation({ summary: 'Get Student Certificates' })
  getCertificates(@Req() req: any) {
    const isStudent = (req.user?.roles || []).includes('STUDENT');
    return this.servicesService.getCertificates(req.user.id, isStudent);
  }

  @Get('certificates/verify/:certificateNumber')
  @ApiOperation({ summary: 'Public Digital Certificate Verification Endpoint' })
  verifyCertificate(@Param('certificateNumber') certificateNumber: string) {
    return this.servicesService.verifyCertificate(certificateNumber);
  }
}
