import { Controller, Get, Post, Patch, Body, Param, Query, Req, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ItHelpdeskService } from './it-helpdesk.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RbacGuard } from '../rbac/rbac.guard';
import { RequirePermission } from '../rbac/require-permission.decorator';

@ApiTags('IT Helpdesk')
@ApiBearerAuth()
@Controller('api/v1/it/tickets')
@UseGuards(JwtAuthGuard, RbacGuard)
export class ItHelpdeskController {
  constructor(private readonly itService: ItHelpdeskService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create IT Helpdesk Ticket' })
  createTicket(
    @Req() req: any,
    @Body('category') category: string,
    @Body('title') title: string,
    @Body('description') description: string,
    @Body('priority') priority?: string,
  ) {
    return this.itService.createTicket(req.user.id, category, title, description, priority);
  }

  @Get()
  @ApiOperation({ summary: 'List IT Tickets' })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'my', required: false })
  getTickets(
    @Req() req: any,
    @Query('category') category?: string,
    @Query('status') status?: string,
    @Query('my') my?: string,
  ) {
    return this.itService.getTickets(category, status, my === 'true' ? req.user.id : undefined);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get IT Ticket by ID' })
  getTicketById(@Param('id') id: string) {
    return this.itService.getTicketById(id);
  }

  @Patch(':id/assign')
  @RequirePermission('IT', 'EDIT')
  @ApiOperation({ summary: 'Assign IT Ticket to technician' })
  assignTicket(@Param('id') id: string, @Body('assignedToUserId') assignedToUserId: string) {
    return this.itService.assignTechnician(id, assignedToUserId);
  }

  @Patch(':id/resolve')
  @RequirePermission('IT', 'EDIT')
  @ApiOperation({ summary: 'Resolve IT Ticket' })
  resolveTicket(@Param('id') id: string, @Body('resolution') resolution: string) {
    return this.itService.resolveTicket(id, resolution);
  }
}
