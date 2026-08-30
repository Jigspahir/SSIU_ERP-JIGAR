import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { AiHelpdeskService, ChatResponse } from './ai-helpdesk.service';
import { ChatQueryDto } from './dto/chat-query.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AiRateLimitGuard } from './guards/ai-rate-limit.guard';

@ApiTags('AI Student Helpdesk & Conversational Assistant')
@ApiBearerAuth()
@Controller('api/v1/ai-helpdesk')
@UseGuards(JwtAuthGuard, AiRateLimitGuard)
export class AiHelpdeskController {
  constructor(private readonly aiHelpdeskService: AiHelpdeskService) {}

  @Post('chat')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
  @ApiOperation({
    summary: 'Submit student question to 24/7 AI Student Helpdesk (Strictly authenticated & scoped to caller)',
  })
  @ApiResponse({
    status: 200,
    description: 'AI answer synthesized safely from verified backend tools.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized — valid student JWT session required.',
  })
  @ApiResponse({
    status: 429,
    description: 'Too Many Requests — 20 queries/minute rate limit exceeded.',
  })
  async chatWithHelpdesk(
    @Req() req: any,
    @Body() dto: ChatQueryDto,
  ): Promise<ChatResponse> {
    // Identity comes exclusively from authenticated req.user
    const user = req.user;
    return this.aiHelpdeskService.processStudentQuery(user, dto.message);
  }
}
