import { Controller, Get, Post, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ComplianceService } from './compliance.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RbacGuard } from '../rbac/rbac.guard';
import { RequirePermission } from '../rbac/require-permission.decorator';

@ApiTags('Compliance & Regulatory Frameworks')
@ApiBearerAuth()
@Controller('api/v1/compliance')
@UseGuards(JwtAuthGuard, RbacGuard)
export class ComplianceController {
  constructor(private readonly complianceService: ComplianceService) {}

  @Post('frameworks')
  @RequirePermission('GOVERNANCE', 'CREATE')
  @ApiOperation({ summary: 'Add Compliance Framework (NAAC, NBA, NIRF, UGC, AICTE, NEP2020, ABC, OBE)' })
  createFramework(
    @Body('code') code: string,
    @Body('name') name: string,
    @Body('authority') authority: string,
  ) {
    return this.complianceService.createFramework(code, name, authority);
  }

  @Get('frameworks')
  @ApiOperation({ summary: 'List Compliance Frameworks' })
  getFrameworks() {
    return this.complianceService.getFrameworks();
  }

  @Post('requirements')
  @RequirePermission('GOVERNANCE', 'CREATE')
  @ApiOperation({ summary: 'Add Requirement under Compliance Framework' })
  addRequirement(
    @Body('frameworkId') frameworkId: string,
    @Body('title') title: string,
    @Body('responsibleOffice') responsibleOffice: string,
    @Body('dueDate') dueDate: string,
    @Body('description') description?: string,
  ) {
    return this.complianceService.addRequirement(frameworkId, title, responsibleOffice, dueDate, description);
  }

  @Get('requirements')
  @ApiOperation({ summary: 'List Compliance Requirements' })
  @ApiQuery({ name: 'frameworkId', required: false })
  @ApiQuery({ name: 'status', required: false })
  getRequirements(@Query('frameworkId') frameworkId?: string, @Query('status') status?: string) {
    return this.complianceService.getRequirements(frameworkId, status);
  }
}
