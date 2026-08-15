import { Controller, Get, Post, Body, Param, Query, Req, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ResearchService } from './research.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RbacGuard } from '../rbac/rbac.guard';
import { RequirePermission } from '../rbac/require-permission.decorator';

@ApiTags('Research & R&D Management')
@ApiBearerAuth()
@Controller('api/v1/research')
@UseGuards(JwtAuthGuard, RbacGuard)
export class ResearchController {
  constructor(private readonly researchService: ResearchService) {}

  @Post('projects')
  @RequirePermission('RESEARCH', 'CREATE')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Submit new Research Project proposal' })
  createProject(@Body() body: any, @Req() req: any) {
    return this.researchService.createProject(body, req.user.id);
  }

  @Get('projects')
  @ApiOperation({ summary: 'List Research Projects' })
  @ApiQuery({ name: 'departmentId', required: false })
  @ApiQuery({ name: 'status', required: false })
  getProjects(@Query('departmentId') departmentId?: string, @Query('status') status?: string) {
    return this.researchService.getProjects(departmentId, status);
  }

  @Get('projects/:id')
  @ApiOperation({ summary: 'Get Research Project details by ID' })
  getProjectById(@Param('id') id: string) {
    return this.researchService.getProjectById(id);
  }

  @Post('grants')
  @RequirePermission('RESEARCH', 'CREATE')
  @ApiOperation({ summary: 'Register Research Grant / Funding' })
  createGrant(@Body() body: any) {
    return this.researchService.createGrant(body);
  }

  @Get('grants')
  @ApiOperation({ summary: 'List Research Grants' })
  @ApiQuery({ name: 'projectId', required: false })
  getGrants(@Query('projectId') projectId?: string) {
    return this.researchService.getGrants(projectId);
  }

  @Post('publications')
  @RequirePermission('RESEARCH', 'CREATE')
  @ApiOperation({ summary: 'Record Research Publication' })
  createPublication(@Body() body: any) {
    return this.researchService.createPublication(body);
  }

  @Get('publications')
  @ApiOperation({ summary: 'List Publications' })
  @ApiQuery({ name: 'projectId', required: false })
  getPublications(@Query('projectId') projectId?: string) {
    return this.researchService.getPublications(projectId);
  }

  @Post('patents')
  @RequirePermission('RESEARCH', 'CREATE')
  @ApiOperation({ summary: 'Register Patent / IP' })
  createPatent(@Body() body: any) {
    return this.researchService.createPatent(body);
  }

  @Get('patents')
  @ApiOperation({ summary: 'List Patents' })
  @ApiQuery({ name: 'projectId', required: false })
  getPatents(@Query('projectId') projectId?: string) {
    return this.researchService.getPatents(projectId);
  }
}
