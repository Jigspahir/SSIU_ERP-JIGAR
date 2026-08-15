import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ComplianceService {
  constructor(private readonly prisma: PrismaService) {}

  async createFramework(code: string, name: string, authority: string) {
    const existing = await this.prisma.complianceFramework.findUnique({ where: { code: code.toUpperCase() } });
    if (existing) throw new ConflictException(`Compliance framework '${code}' already exists.`);

    return this.prisma.complianceFramework.create({
      data: { code: code.toUpperCase(), name, authority, status: 'ACTIVE' },
    });
  }

  async getFrameworks() {
    return this.prisma.complianceFramework.findMany({
      include: { requirements: true },
      orderBy: { code: 'asc' },
    });
  }

  async addRequirement(frameworkId: string, title: string, responsibleOffice: string, dueDate: string, description?: string) {
    const framework = await this.prisma.complianceFramework.findUnique({ where: { id: frameworkId } });
    if (!framework) throw new NotFoundException('Compliance framework not found.');

    return this.prisma.complianceRequirement.create({
      data: {
        frameworkId,
        title,
        responsibleOffice,
        dueDate: new Date(dueDate),
        description,
        status: 'PENDING',
      },
    });
  }

  async getRequirements(frameworkId?: string, status?: string) {
    return this.prisma.complianceRequirement.findMany({
      where: {
        ...(frameworkId ? { frameworkId } : {}),
        ...(status ? { status: status.toUpperCase() } : {}),
      },
      include: { framework: true },
      orderBy: { dueDate: 'asc' },
    });
  }
}
