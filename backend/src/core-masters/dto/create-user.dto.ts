import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEmail, IsOptional, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ description: 'Username / Login ID', example: 'jigar.ahir' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  username: string;

  @ApiProperty({ description: 'Official Email address', example: 'jigar.ahir@swarrnim.edu.in' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'Full legal name', example: 'Jigar Ahir' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'Password or temporary password', example: 'User@123' })
  @IsString()
  @IsOptional()
  password?: string;

  @ApiProperty({ description: 'User Role code', example: 'SUPER_ADMIN' })
  @IsString()
  @IsNotEmpty()
  role: string;

  @ApiPropertyOptional({ description: 'Employee Code', example: 'EMP1001' })
  @IsString()
  @IsOptional()
  employeeId?: string;

  @ApiPropertyOptional({ description: 'Student Enrollment Number', example: 'ENR2024001' })
  @IsString()
  @IsOptional()
  enrollmentNo?: string;

  @ApiPropertyOptional({ description: 'Contact Phone Number', example: '+91 9876543210' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ description: 'Institute ID UUID', example: 'inst-1' })
  @IsString()
  @IsOptional()
  instituteId?: string;

  @ApiPropertyOptional({ description: 'Department ID UUID', example: 'dept-1' })
  @IsString()
  @IsOptional()
  departmentId?: string;

  @ApiPropertyOptional({ description: 'Department Name', example: 'Computer Science' })
  @IsString()
  @IsOptional()
  departmentName?: string;

  @ApiPropertyOptional({ description: 'Designation', example: 'Senior Faculty' })
  @IsString()
  @IsOptional()
  designation?: string;

  @ApiPropertyOptional({ description: 'Account Status', example: 'ACTIVE' })
  @IsString()
  @IsOptional()
  accountStatus?: string;
}
