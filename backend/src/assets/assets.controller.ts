import { Controller, Get, Post, Patch, Body, Param, Query, Req, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AssetsService } from './assets.service';
import { CreateAssetCategoryDto, CreateAssetDto, AssignAssetDto, TransferAssetDto, CreateMaintenanceDto, CompleteMaintenanceDto, CreateDisposalDto } from './dto/assets.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RbacGuard } from '../rbac/rbac.guard';
import { RequirePermission } from '../rbac/require-permission.decorator';

@ApiTags('Asset Management')
@ApiBearerAuth()
@Controller('api/v1/assets')
@UseGuards(JwtAuthGuard, RbacGuard)
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  // ── Asset Categories
  @Post('categories')
  @RequirePermission('ASSET', 'CREATE')
  @ApiOperation({ summary: 'Create Asset Category (IT, Furniture, Vehicle, etc.)' })
  createCategory(@Body() dto: CreateAssetCategoryDto) {
    return this.assetsService.createCategory(dto);
  }

  @Get('categories')
  @ApiOperation({ summary: 'List Asset Categories with count' })
  getCategories() {
    return this.assetsService.getCategories();
  }

  // ── Asset Master
  @Post()
  @RequirePermission('ASSET', 'CREATE')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register new Asset with unique Asset Tag' })
  createAsset(@Body() dto: CreateAssetDto) {
    return this.assetsService.createAsset(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List Assets (with current assignment)' })
  @ApiQuery({ name: 'categoryId', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'search', required: false })
  getAssets(
    @Query('categoryId') categoryId?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.assetsService.getAssets(categoryId, status, search);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Asset dashboard summary (counts + warranty expiry alerts)' })
  getSummary() {
    return this.assetsService.getAssetSummary();
  }

  @Get('tag/:tag')
  @ApiOperation({ summary: 'Find Asset by Tag ID (barcode/QR scan)' })
  getByTag(@Param('tag') tag: string) {
    return this.assetsService.getAssetByTag(tag);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get full Asset history (assignments, transfers, maintenance, disposal)' })
  getAssetById(@Param('id') id: string) {
    return this.assetsService.getAssetById(id);
  }

  @Patch(':id')
  @RequirePermission('ASSET', 'EDIT')
  @ApiOperation({ summary: 'Update Asset details' })
  updateAsset(@Param('id') id: string, @Body() dto: Partial<CreateAssetDto>) {
    return this.assetsService.updateAsset(id, dto);
  }

  // ── Assignments
  @Post(':id/assign')
  @RequirePermission('ASSET', 'EDIT')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Assign Asset to user or department' })
  assignAsset(@Param('id') id: string, @Body() dto: AssignAssetDto, @Req() req: any) {
    return this.assetsService.assignAsset(id, dto, req.user.id);
  }

  @Patch(':id/return')
  @RequirePermission('ASSET', 'EDIT')
  @ApiOperation({ summary: 'Return Asset (marks as AVAILABLE again)' })
  returnAsset(@Param('id') id: string, @Body('remarks') remarks?: string) {
    return this.assetsService.returnAsset(id, remarks);
  }

  @Get('assignments/list')
  @RequirePermission('ASSET', 'VIEW')
  @ApiOperation({ summary: 'List all Asset Assignments' })
  @ApiQuery({ name: 'assetId', required: false })
  @ApiQuery({ name: 'userId', required: false })
  getAssignments(@Query('assetId') assetId?: string, @Query('userId') userId?: string) {
    return this.assetsService.getAssignments(assetId, userId);
  }

  // ── Transfers
  @Post(':id/transfer')
  @RequirePermission('ASSET', 'EDIT')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Transfer Asset between departments/locations' })
  transferAsset(@Param('id') id: string, @Body() dto: TransferAssetDto, @Req() req: any) {
    return this.assetsService.transferAsset(id, dto, req.user.id);
  }

  @Get('transfers/list')
  @RequirePermission('ASSET', 'VIEW')
  @ApiOperation({ summary: 'List Asset Transfers' })
  @ApiQuery({ name: 'assetId', required: false })
  getTransfers(@Query('assetId') assetId?: string) {
    return this.assetsService.getTransfers(assetId);
  }

  // ── Maintenance
  @Post(':id/maintenance')
  @RequirePermission('ASSET', 'EDIT')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Log maintenance/repair request for an Asset' })
  createMaintenance(@Param('id') id: string, @Body() dto: CreateMaintenanceDto, @Req() req: any) {
    return this.assetsService.createMaintenance(id, dto, req.user.id);
  }

  @Patch('maintenance/:maintenanceId/complete')
  @RequirePermission('ASSET', 'EDIT')
  @ApiOperation({ summary: 'Mark maintenance as completed' })
  completeMaintenance(@Param('maintenanceId') id: string, @Body() dto: CompleteMaintenanceDto) {
    return this.assetsService.completeMaintenance(id, dto);
  }

  @Get('maintenance/list')
  @RequirePermission('ASSET', 'VIEW')
  @ApiOperation({ summary: 'List Maintenance Logs' })
  @ApiQuery({ name: 'assetId', required: false })
  @ApiQuery({ name: 'status', required: false })
  getMaintenanceLogs(@Query('assetId') assetId?: string, @Query('status') status?: string) {
    return this.assetsService.getMaintenanceLogs(assetId, status);
  }

  // ── Disposal
  @Post(':id/dispose')
  @RequirePermission('ASSET', 'APPROVE')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Initiate Asset Disposal (auction, scrap, donate, write-off)' })
  createDisposal(@Param('id') id: string, @Body() dto: CreateDisposalDto, @Req() req: any) {
    return this.assetsService.createDisposal(id, dto, req.user.id);
  }

  @Patch('disposals/:disposalId/approve')
  @RequirePermission('ASSET', 'APPROVE')
  @ApiOperation({ summary: 'Approve and complete Asset Disposal' })
  approveDisposal(@Param('disposalId') id: string, @Req() req: any) {
    return this.assetsService.approveDisposal(id, req.user.id);
  }

  @Get('disposals/list')
  @RequirePermission('ASSET', 'VIEW')
  @ApiOperation({ summary: 'List Asset Disposals' })
  @ApiQuery({ name: 'status', required: false })
  getDisposals(@Query('status') status?: string) {
    return this.assetsService.getDisposals(status);
  }
}
