import { IsString, IsNotEmpty, IsOptional, IsEnum, IsBoolean, IsNumber, IsObject, IsArray, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum FeedbackCategoryEnum {
  SUBJECT = 'SUBJECT',
  FACULTY = 'FACULTY',
  MENTOR = 'MENTOR',
  HOD = 'HOD',
  HOI = 'HOI',
  CAMPUS = 'CAMPUS',
  GENERAL_UNIVERSITY = 'GENERAL_UNIVERSITY'
}

export enum CampusFacilityEnum {
  CAMPUS_INFRASTRUCTURE = 'CAMPUS_INFRASTRUCTURE',
  CLASSROOMS = 'CLASSROOMS',
  LABORATORIES = 'LABORATORIES',
  LIBRARY = 'LIBRARY',
  HOSTEL = 'HOSTEL',
  FOOD_CAFETERIA = 'FOOD_CAFETERIA',
  TRANSPORT = 'TRANSPORT',
  SPORTS_FACILITIES = 'SPORTS_FACILITIES',
  CLEANLINESS = 'CLEANLINESS',
  SECURITY = 'SECURITY',
  WIFI_INTERNET = 'WIFI_INTERNET',
  PARKING = 'PARKING',
  STUDENT_SERVICES = 'STUDENT_SERVICES',
  OTHER = 'OTHER'
}

export enum SuggestionCategoryEnum {
  ACADEMIC = 'ACADEMIC',
  TEACHING = 'TEACHING',
  CAMPUS = 'CAMPUS',
  INFRASTRUCTURE = 'INFRASTRUCTURE',
  TECHNOLOGY = 'TECHNOLOGY',
  STUDENT_SERVICES = 'STUDENT_SERVICES',
  HOSTEL = 'HOSTEL',
  TRANSPORT = 'TRANSPORT',
  EVENTS = 'EVENTS',
  CLUBS = 'CLUBS',
  LIBRARY = 'LIBRARY',
  SPORTS = 'SPORTS',
  CAFETERIA = 'CAFETERIA',
  OTHER = 'OTHER'
}

export class SubmitFeedbackDto {
  @ApiProperty({ enum: FeedbackCategoryEnum, description: 'Category of feedback' })
  @IsEnum(FeedbackCategoryEnum)
  category: FeedbackCategoryEnum;

  @ApiPropertyOptional({ enum: CampusFacilityEnum, description: 'Facility sub-category if Campus feedback' })
  @IsOptional()
  @IsEnum(CampusFacilityEnum)
  campusFacilityCategory?: CampusFacilityEnum;

  @ApiPropertyOptional({ description: 'Subject ID if Subject Feedback' })
  @IsOptional()
  @IsString()
  subjectId?: string;

  @ApiPropertyOptional({ description: 'Faculty Member ID if Faculty Feedback' })
  @IsOptional()
  @IsString()
  facultyId?: string;

  @ApiProperty({ description: 'Category-specific criteria breakdown ratings (1 to 5)', type: Object })
  @IsObject()
  ratings: Record<string, number>;

  @ApiProperty({ description: 'Overall Rating (1 to 5)', minimum: 1, maximum: 5 })
  @IsNumber()
  @Min(1)
  @Max(5)
  overallRating: number;

  @ApiPropertyOptional({ description: 'Qualitative comments / remarks' })
  @IsOptional()
  @IsString()
  comments?: string;

  @ApiPropertyOptional({ description: 'Improvement suggestions' })
  @IsOptional()
  @IsString()
  suggestions?: string;

  @ApiPropertyOptional({ description: 'Anonymous submission toggle' })
  @IsOptional()
  @IsBoolean()
  isAnonymous?: boolean;
}

export class SubmitSuggestionDto {
  @ApiProperty({ enum: SuggestionCategoryEnum, description: 'Category of suggestion' })
  @IsEnum(SuggestionCategoryEnum)
  category: SuggestionCategoryEnum;

  @ApiProperty({ description: 'Suggestion Title' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Detailed Description of the Suggestion' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({ description: 'Expected Improvement or Benefit' })
  @IsOptional()
  @IsString()
  expectedImprovement?: string;

  @ApiPropertyOptional({ description: 'Attachment file URL' })
  @IsOptional()
  @IsString()
  attachmentUrl?: string;

  @ApiPropertyOptional({ description: 'Anonymous submission toggle' })
  @IsOptional()
  @IsBoolean()
  isAnonymous?: boolean;
}

export class UpdateSuggestionActionDto {
  @ApiProperty({ description: 'New Status for the suggestion' })
  @IsString()
  @IsNotEmpty()
  status: string;

  @ApiPropertyOptional({ description: 'Department to route/assign suggestion' })
  @IsOptional()
  @IsString()
  assignedDepartment?: string;

  @ApiPropertyOptional({ description: 'Administrative response to student' })
  @IsOptional()
  @IsString()
  adminResponse?: string;

  @ApiPropertyOptional({ description: 'Action taken description' })
  @IsOptional()
  @IsString()
  actionTaken?: string;
}

export class FeedbackFilterQueryDto {
  @ApiPropertyOptional({ description: 'Category filter' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Institute ID filter' })
  @IsOptional()
  @IsString()
  instituteId?: string;

  @ApiPropertyOptional({ description: 'Department ID filter' })
  @IsOptional()
  @IsString()
  departmentId?: string;

  @ApiPropertyOptional({ description: 'Semester ID filter' })
  @IsOptional()
  @IsString()
  semesterId?: string;

  @ApiPropertyOptional({ description: 'Academic Year ID filter' })
  @IsOptional()
  @IsString()
  academicYearId?: string;
}
