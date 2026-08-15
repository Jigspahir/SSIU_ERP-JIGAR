import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RbacGuard } from '../rbac/rbac.guard';
import { AnalyticsService } from './analytics.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Dashboard & Analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RbacGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get role-scoped dashboard metrics' })
  async getDashboard(@Req() req: any) {
    const role = req.user?.role || 'STUDENT';
    const userId = req.user?.sub || req.user?.id;
    return this.analyticsService.getDashboardMetrics(role, userId);
  }

  @Get('overview')
  @ApiOperation({ summary: 'Get consolidated university overview analytics' })
  async getOverview(@Query() query: any) {
    return this.analyticsService.getOverviewAnalytics(query);
  }

  @Get('academic')
  @ApiOperation({ summary: 'Get academic and attendance analytics' })
  async getAcademic(@Query() query: any) {
    return this.analyticsService.getAcademicAnalytics(query);
  }

  @Get('finance')
  @ApiOperation({ summary: 'Get finance and fee collection analytics' })
  async getFinance() {
    return this.analyticsService.getFinanceAnalytics();
  }

  @Get('library')
  @ApiOperation({ summary: 'Get library inventory and circulation analytics' })
  async getLibrary() {
    return this.analyticsService.getLibraryAnalytics();
  }
}
