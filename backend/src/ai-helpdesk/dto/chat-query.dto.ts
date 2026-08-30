import { IsNotEmpty, IsString, MaxLength, ValidateIf } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChatQueryDto {
  @ApiProperty({
    description: 'Student question or inquiry for the AI Helpdesk',
    example: 'Mari ketli fees baki chhe?',
    maxLength: 1000,
  })
  @IsString()
  @IsNotEmpty({ message: 'Chat message prompt cannot be empty.' })
  @MaxLength(1000, { message: 'Chat message cannot exceed 1000 characters.' })
  message: string;

  // Strict Security: Explicitly disallow arbitrary studentId injections in the payload
  @ValidateIf(() => false, {
    message: 'Client-supplied studentId is forbidden. Identity is derived strictly from authentication session.',
  })
  studentId?: never;

  @ValidateIf(() => false, {
    message: 'Client-supplied erpId is forbidden.',
  })
  erpId?: never;
}
