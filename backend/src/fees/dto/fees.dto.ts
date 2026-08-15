import { IsNotEmpty, IsString, IsOptional, IsNumber, Min, IsEnum, IsInt, IsDateString, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFeeHeadDto {
  @ApiProperty({ example: 'TUITION' })
  @IsNotEmpty()
  @IsString()
  code: string;

  @ApiProperty({ example: 'Tuition Fee' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isOptional?: boolean;
}

export class FeeStructureItemDto {
  @ApiProperty({ description: 'FeeHead ID' })
  @IsNotEmpty()
  @IsString()
  feeHeadId: string;

  @ApiProperty({ example: 45000 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isOptional?: boolean;
}

export class CreateFeeStructureDto {
  @ApiProperty({ description: 'Program ID' })
  @IsNotEmpty()
  @IsString()
  programId: string;

  @ApiProperty({ description: 'Semester ID' })
  @IsNotEmpty()
  @IsString()
  semesterId: string;

  @ApiProperty({ example: '2024-25' })
  @IsNotEmpty()
  @IsString()
  academicYearCode: string;

  @ApiProperty({ example: 'CSE Semester 1 Fee 2024-25' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ type: [FeeStructureItemDto] })
  @IsNotEmpty()
  items: FeeStructureItemDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dueDate?: string;
}

export class CreateStudentFeeAccountDto {
  @ApiProperty({ description: 'Student ID' })
  @IsNotEmpty()
  @IsString()
  studentId: string;

  @ApiProperty({ description: 'Fee Structure ID' })
  @IsNotEmpty()
  @IsString()
  feeStructureId: string;

  @ApiProperty({ example: '2024-25' })
  @IsNotEmpty()
  @IsString()
  academicYearCode: string;
}

export class RecordPaymentDto {
  @ApiProperty({ description: 'Fee Account ID (StudentFeeAccount)' })
  @IsNotEmpty()
  @IsString()
  feeAccountId: string;

  @ApiProperty({ example: 25000 })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiProperty({ example: 'ONLINE', enum: ['CASH', 'CHEQUE', 'DD', 'ONLINE', 'UPI', 'NEFT', 'RTGS'] })
  @IsNotEmpty()
  @IsString()
  paymentMode: string;

  @ApiPropertyOptional({ example: 'TXN123456789' })
  @IsOptional()
  @IsString()
  transactionRef?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  remarks?: string;

  @ApiPropertyOptional({ description: 'Breakdown by fee heads' })
  @IsOptional()
  items?: { feeHeadId: string; amount: number }[];
}

export class ApplyDiscountDto {
  @ApiProperty({ description: 'Fee Account ID' })
  @IsNotEmpty()
  @IsString()
  feeAccountId: string;

  @ApiProperty({ example: 'SCHOLARSHIP', enum: ['SCHOLARSHIP', 'MERIT', 'STAFF_WARD', 'GOVERNMENT', 'MANAGEMENT', 'OTHER'] })
  @IsNotEmpty()
  @IsString()
  discountType: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 10000 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  amount: number;
}

export class CreateRefundDto {
  @ApiProperty({ description: 'Fee Account ID' })
  @IsNotEmpty()
  @IsString()
  feeAccountId: string;

  @ApiProperty({ description: 'Payment ID to refund against' })
  @IsNotEmpty()
  @IsString()
  paymentId: string;

  @ApiProperty({ example: 5000 })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  refundAmount: number;

  @ApiProperty({ example: 'Withdrawal from course' })
  @IsNotEmpty()
  @IsString()
  reason: string;

  @ApiPropertyOptional({ example: 'ONLINE' })
  @IsOptional()
  @IsString()
  refundMode?: string;
}
