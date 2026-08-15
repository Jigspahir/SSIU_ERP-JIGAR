import { Controller, Get, Post, Body, Param, Query, Req, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { FeesService } from './fees.service';
import { CreateFeeHeadDto, CreateFeeStructureDto, CreateStudentFeeAccountDto, RecordPaymentDto, ApplyDiscountDto, CreateRefundDto } from './dto/fees.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RbacGuard } from '../rbac/rbac.guard';
import { RequirePermission } from '../rbac/require-permission.decorator';

@ApiTags('Student Fees Management')
@ApiBearerAuth()
@Controller('api/v1')
@UseGuards(JwtAuthGuard, RbacGuard)
export class FeesController {
  constructor(private readonly feesService: FeesService) {}

  // ── Fee Heads
  @Post('fee-heads')
  @RequirePermission('FEES', 'CREATE')
  @ApiOperation({ summary: 'Create Fee Head (TUITION, HOSTEL, LAB, etc.)' })
  createFeeHead(@Body() dto: CreateFeeHeadDto) {
    return this.feesService.createFeeHead(dto);
  }

  @Get('fee-heads')
  @ApiOperation({ summary: 'List all Fee Heads' })
  getFeeHeads() {
    return this.feesService.getFeeHeads();
  }

  // ── Fee Structures
  @Post('fee-structures')
  @RequirePermission('FEES', 'CREATE')
  @ApiOperation({ summary: 'Create Fee Structure for Program + Semester' })
  createFeeStructure(@Body() dto: CreateFeeStructureDto) {
    return this.feesService.createFeeStructure(dto);
  }

  @Get('fee-structures')
  @ApiOperation({ summary: 'List Fee Structures' })
  @ApiQuery({ name: 'programId', required: false })
  getFeeStructures(@Query('programId') programId?: string) {
    return this.feesService.getFeeStructures(programId);
  }

  @Get('fee-structures/:id')
  @ApiOperation({ summary: 'Get Fee Structure detail by ID' })
  getFeeStructureById(@Param('id') id: string) {
    return this.feesService.getFeeStructureById(id);
  }

  // ── Student Fee Accounts
  @Post('student-fees/accounts')
  @RequirePermission('FEES', 'CREATE')
  @ApiOperation({ summary: 'Create Student Fee Account (assign fee structure to student)' })
  createAccount(@Body() dto: CreateStudentFeeAccountDto) {
    return this.feesService.createStudentFeeAccount(dto);
  }

  @Get('student-fees/my')
  @ApiOperation({ summary: 'View my own fee account (student)' })
  getMyAccount(@Req() req: any) {
    return this.feesService.getMyFeeAccount(req.user.id);
  }

  @Get('student-fees/accounts')
  @RequirePermission('FEES', 'VIEW')
  @ApiOperation({ summary: 'List all student fee accounts' })
  @ApiQuery({ name: 'status', required: false })
  getAllAccounts(@Query('status') status?: string) {
    return this.feesService.getAllFeeAccounts(status);
  }

  @Get('student-fees/:studentId')
  @RequirePermission('FEES', 'VIEW')
  @ApiOperation({ summary: 'Get all fee accounts for a specific student' })
  getStudentFeeAccount(@Param('studentId') studentId: string) {
    return this.feesService.getStudentFeeAccount(studentId);
  }

  // ── Payments
  @Post('fee-payments')
  @RequirePermission('FEES', 'CREATE')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Record a fee payment (generates receipt)' })
  recordPayment(@Body() dto: RecordPaymentDto, @Req() req: any) {
    return this.feesService.recordPayment(dto, req.user.id);
  }

  @Get('fee-payments/:feeAccountId')
  @RequirePermission('FEES', 'VIEW')
  @ApiOperation({ summary: 'Get payment history for a fee account' })
  getPaymentHistory(@Param('feeAccountId') feeAccountId: string) {
    return this.feesService.getPaymentHistory(feeAccountId);
  }

  // ── Discounts / Scholarships
  @Post('fee-discounts')
  @RequirePermission('FEES', 'APPROVE')
  @ApiOperation({ summary: 'Apply discount/scholarship to a student fee account' })
  applyDiscount(@Body() dto: ApplyDiscountDto, @Req() req: any) {
    return this.feesService.applyDiscount(dto, req.user.id);
  }

  // ── Refunds
  @Post('fee-refunds')
  @RequirePermission('FEES', 'APPROVE')
  @ApiOperation({ summary: 'Create fee refund request' })
  createRefund(@Body() dto: CreateRefundDto) {
    return this.feesService.createRefund(dto);
  }

  // ── Reports
  @Get('fees/reports/dues')
  @RequirePermission('FEES', 'VIEW')
  @ApiOperation({ summary: 'Get outstanding dues report' })
  getDuesReport() {
    return this.feesService.getDuesReport();
  }
}
