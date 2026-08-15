import { IsNotEmpty, IsString, IsOptional, IsDateString, IsEnum, IsNumber, Min, IsInt } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateExamTypeDto {
  @ApiProperty({ example: 'INTERNAL' })
  @IsNotEmpty()
  @IsString()
  code: string;

  @ApiProperty({ example: 'Internal Examination' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}

export class CreateExamDto {
  @ApiProperty({ example: 'EXAM-CSE-SEM1-2024' })
  @IsNotEmpty()
  @IsString()
  code: string;

  @ApiProperty({ example: 'Semester 1 Examination 2024' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'ExamType ID' })
  @IsNotEmpty()
  @IsString()
  examTypeId: string;

  @ApiProperty({ description: 'Program ID' })
  @IsNotEmpty()
  @IsString()
  programId: string;

  @ApiProperty({ example: '2024-25' })
  @IsNotEmpty()
  @IsString()
  academicYearCode: string;

  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  semesterNumber: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class CreateExamFormWindowDto {
  @ApiProperty({ description: 'Exam ID' })
  @IsNotEmpty()
  @IsString()
  examId: string;

  @ApiProperty({ example: '2024-10-01T00:00:00Z' })
  @IsNotEmpty()
  @IsDateString()
  windowOpen: string;

  @ApiProperty({ example: '2024-10-15T23:59:59Z' })
  @IsNotEmpty()
  @IsDateString()
  windowClose: string;

  @ApiPropertyOptional({ example: '2024-10-20T23:59:59Z' })
  @IsOptional()
  @IsDateString()
  lateWindowClose?: string;

  @ApiPropertyOptional({ example: 500 })
  @IsOptional()
  @IsNumber()
  examFee?: number;

  @ApiPropertyOptional({ example: 200 })
  @IsOptional()
  @IsNumber()
  lateFee?: number;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @IsInt()
  maxAttempts?: number;
}

export class SubmitExamFormDto {
  @ApiProperty({ description: 'Exam ID' })
  @IsNotEmpty()
  @IsString()
  examId: string;

  @ApiProperty({ description: 'Exam Form Window ID' })
  @IsNotEmpty()
  @IsString()
  examFormWindowId: string;

  @ApiProperty({ description: 'Semester ID' })
  @IsNotEmpty()
  @IsString()
  semesterId: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  attemptNumber?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  remarks?: string;
}

export class CreateExamScheduleDto {
  @ApiProperty({ description: 'Exam ID' })
  @IsNotEmpty()
  @IsString()
  examId: string;

  @ApiProperty({ description: 'Subject ID' })
  @IsNotEmpty()
  @IsString()
  subjectId: string;

  @ApiProperty({ description: 'Semester ID' })
  @IsNotEmpty()
  @IsString()
  semesterId: string;

  @ApiProperty({ example: '2024-11-05T00:00:00Z' })
  @IsNotEmpty()
  @IsDateString()
  examDate: string;

  @ApiProperty({ example: '10:00' })
  @IsNotEmpty()
  @IsString()
  startTime: string;

  @ApiProperty({ example: '13:00' })
  @IsNotEmpty()
  @IsString()
  endTime: string;

  @ApiPropertyOptional({ example: 'Hall A - Block 1' })
  @IsOptional()
  @IsString()
  venue?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  invigilator?: string;
}

export class EnterResultDto {
  @ApiProperty({ description: 'Exam Form ID' })
  @IsNotEmpty()
  @IsString()
  examFormId: string;

  @ApiProperty({ description: 'Subject ID' })
  @IsNotEmpty()
  @IsString()
  subjectId: string;

  @ApiPropertyOptional({ description: 'Exam Schedule ID' })
  @IsOptional()
  @IsString()
  examScheduleId?: string;

  @ApiPropertyOptional({ example: 78.5 })
  @IsOptional()
  @IsNumber()
  marksObtained?: number;

  @ApiPropertyOptional({ example: 100 })
  @IsOptional()
  @IsNumber()
  maxMarks?: number;

  @ApiPropertyOptional({ example: 'A+' })
  @IsOptional()
  @IsString()
  grade?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  isAbsent?: boolean;
}
