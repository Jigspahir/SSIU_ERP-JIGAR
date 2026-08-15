import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ItHelpdeskService {
  constructor(private readonly prisma: PrismaService) {}

  private async nextSeq(prefix: string, countFn: () => Promise<number>): Promise<string> {
    const count = await countFn();
    const seq = String(count + 1).padStart(6, '0');
    const year = new Date().getFullYear();
    return `${prefix}-${year}-${seq}`;
  }

  async createTicket(userId: string, category: string, title: string, description: string, priority: string = 'NORMAL') {
    const ticketNo = await this.nextSeq('IT', () => this.prisma.iTTicket.count());

    return this.prisma.iTTicket.create({
      data: {
        ticketNo,
        userId,
        category: category.toUpperCase(),
        priority: priority.toUpperCase(),
        title,
        description,
        status: 'OPEN',
      },
      include: { user: true },
    });
  }

  async getTickets(category?: string, status?: string, userId?: string) {
    return this.prisma.iTTicket.findMany({
      where: {
        ...(category ? { category: category.toUpperCase() } : {}),
        ...(status ? { status: status.toUpperCase() } : {}),
        ...(userId ? { userId } : {}),
      },
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getTicketById(id: string) {
    const ticket = await this.prisma.iTTicket.findUnique({ where: { id }, include: { user: true } });
    if (!ticket) throw new NotFoundException('IT ticket not found.');
    return ticket;
  }

  async assignTechnician(id: string, assignedToUserId: string) {
    const ticket = await this.prisma.iTTicket.findUnique({ where: { id } });
    if (!ticket) throw new NotFoundException('IT ticket not found.');

    return this.prisma.iTTicket.update({
      where: { id },
      data: {
        assignedTo: assignedToUserId,
        status: 'ASSIGNED',
      },
    });
  }

  async resolveTicket(id: string, resolution: string) {
    const ticket = await this.prisma.iTTicket.findUnique({ where: { id } });
    if (!ticket) throw new NotFoundException('IT ticket not found.');

    return this.prisma.iTTicket.update({
      where: { id },
      data: {
        resolution,
        status: 'RESOLVED',
        resolvedAt: new Date(),
      },
    });
  }
}
