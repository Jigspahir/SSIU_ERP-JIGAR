import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsArray, IsEnum, Min, Max } from 'class-validator';

export enum AttendanceStatusEnum {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  LATE = 'LATE',
  LEAVE = 'LEAVE',
  EXCUSED = 'EXCUSED'
}

export enum AttendanceSessionStatusEnum {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  VERIFIED = 'VERIFIED',
  LOCKED = 'LOCKED'
}

export class StudentAttendanceRecordDto {
  @ApiProperty({ example: 'stu-1' })
  @IsString()
  @IsNotEmpty()
  studentId: string;

  @ApiPropertyOptional({ example: 'ABC Student 1' })
  @IsOptional()
  @IsString()
  studentName?: string;

  @ApiPropertyOptional({ example: 'STUDENT-001' })
  @IsOptional()
  @IsString()
  enrollmentNo?: string;

  @ApiProperty({ enum: AttendanceStatusEnum, example: AttendanceStatusEnum.PRESENT })
  @IsEnum(AttendanceStatusEnum)
  status: AttendanceStatusEnum;

  @ApiPropertyOptional({ example: 'Approved medical slip' })
  @IsOptional()
  @IsString()
  remarks?: string;
}

export class CreateAttendanceSessionDto {
  @ApiProperty({ example: '2026-08-14' })
  @IsString()
  @IsNotEmpty()
  date: string;

  @ApiProperty({ example: 'sub-dbms' })
  @IsString()
  @IsNotEmpty()
  subjectId: string;

  @ApiProperty({ example: 'div-cse-4a' })
  @IsString()
  @IsNotEmpty()
  divisionId: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @Min(1)
  @Max(12)
  lectureNo: number;

  @ApiPropertyOptional({ example: '09:00 AM - 10:00 AM' })
  @IsOptional()
  @IsString()
  timeSlot?: string;

  @ApiPropertyOptional({ example: 'B+ Tree Indexing & Query Optimization' })
  @IsOptional()
  @IsString()
  topicTaught?: string;

  @ApiPropertyOptional({ example: 'ay-2024' })
  @IsOptional()
  @IsString()
  academicYearId?: string;

  @ApiPropertyOptional({ example: 4 })
  @IsOptional()
  @IsNumber()
  semester?: number;

  @ApiPropertyOptional({ example: 'dept-1' })
  @IsOptional()
  @IsString()
  departmentId?: string;

  @ApiPropertyOptional({ example: 'inst-1' })
  @IsOptional()
  @IsString()
  instituteId?: string;

  @ApiProperty({ type: [StudentAttendanceRecordDto] })
  @IsArray()
  records: StudentAttendanceRecordDto[];

  @ApiPropertyOptional({ enum: AttendanceSessionStatusEnum, default: AttendanceSessionStatusEnum.SUBMITTED })
  @IsOptional()
  @IsEnum(AttendanceSessionStatusEnum)
  status?: AttendanceSessionStatusEnum;
}

export class CreateAttendanceCorrectionDto {
  @ApiProperty({ example: 'att-12' })
  @IsString()
  @IsNotEmpty()
  sessionId: string;

  @ApiProperty({ example: 'stu-1' })
  @IsString()
  @IsNotEmpty()
  studentId: string;

  @ApiProperty({ enum: AttendanceStatusEnum, example: AttendanceStatusEnum.PRESENT })
  @IsEnum(AttendanceStatusEnum)
  newStatus: AttendanceStatusEnum;

  @ApiProperty({ example: 'Student was present in laboratory session' })
  @IsString()
  @IsNotEmpty()
  reason: string;
}

export class ReviewAttendanceCorrectionDto {
  @ApiProperty({ enum: ['APPROVED', 'REJECTED'], example: 'APPROVED' })
  @IsString()
  @IsNotEmpty()
  decision: 'APPROVED' | 'REJECTED';

  @ApiPropertyOptional({ example: 'Verified lab attendance log' })
  @IsOptional()
  @IsString()
  remarks?: string;
}

export class UpdateAttendancePolicyDto {
  @ApiPropertyOptional({ example: 75 })
  @IsOptional()
  @IsNumber()
  @Min(50)
  @Max(100)
  requiredPercentage?: number;

  @ApiPropertyOptional({ example: 80 })
  @IsOptional()
  @IsNumber()
  warningThreshold?: number;

  @ApiPropertyOptional({ example: 65 })
  @IsOptional()
  @IsNumber()
  criticalThreshold?: number;

  @ApiPropertyOptional({ example: 24 })
  @IsOptional()
  @IsNumber()
  autoLockHours?: number;

  @ApiPropertyOptional({ example: 7 })
  @IsOptional()
  @IsNumber()
  allowCorrectionDays?: number;
}
