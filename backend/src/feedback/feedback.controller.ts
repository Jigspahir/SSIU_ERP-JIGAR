import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Query, 
  Req, 
  UseGuards 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FeedbackService } from './feedback.service';
import { 
  SubmitFeedbackDto, 
  SubmitSuggestionDto, 
  UpdateSuggestionActionDto, 
  FeedbackFilterQueryDto 
} from './dto/feedback.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RbacGuard } from '../rbac/rbac.guard';

@ApiTags('Student Feedback & Suggestion Management')
@ApiBearerAuth()
@Controller('api/v1/feedback')
@UseGuards(JwtAuthGuard, RbacGuard)
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Get('student/targets')
  @ApiOperation({ summary: 'Get valid feedback targets (Subjects, Faculty, Mentor, HOD, HOI) for current student' })
  getStudentTargets(@Req() req: any) {
    return this.feedbackService.getStudentFeedbackTargets(req.user);
  }

  @Post('student/submit')
  @ApiOperation({ summary: 'Submit feedback across any of the 7 feedback categories' })
  submitFeedback(@Body() dto: SubmitFeedbackDto, @Req() req: any) {
    return this.feedbackService.submitFeedback(dto, req.user);
  }

  @Post('student/suggestions')
  @ApiOperation({ summary: 'Submit student improvement suggestion' })
  submitSuggestion(@Body() dto: SubmitSuggestionDto, @Req() req: any) {
    return this.feedbackService.submitSuggestion(dto, req.user);
  }

  @Get('faculty/summary')
  @ApiOperation({ summary: 'Get aggregated feedback metrics for logged in faculty' })
  getFacultySummary(@Req() req: any) {
    return this.feedbackService.getFacultyFeedbackSummary(req.user);
  }

  @Get('mentor/summary')
  @ApiOperation({ summary: 'Get aggregated mentorship feedback metrics for logged in mentor' })
  getMentorSummary(@Req() req: any) {
    return this.feedbackService.getMentorFeedbackSummary(req.user);
  }

  @Get('admin/dashboard')
  @ApiOperation({ summary: 'Get University / Departmental feedback & suggestion analytics' })
  getAdminDashboard(@Query() query: FeedbackFilterQueryDto, @Req() req: any) {
    return this.feedbackService.getAdminDashboardStats(query, req.user);
  }

  @Post('admin/suggestions/:id/action')
  @ApiOperation({ summary: 'Update suggestion status or route to department' })
  updateSuggestionAction(
    @Param('id') id: string, 
    @Body() dto: UpdateSuggestionActionDto, 
    @Req() req: any
  ) {
    return this.feedbackService.updateSuggestionAction(id, dto, req.user);
  }
}
