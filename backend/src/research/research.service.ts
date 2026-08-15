import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ResearchService {
  constructor(private readonly prisma: PrismaService) {}

  private async nextSeq(prefix: string, countFn: () => Promise<number>): Promise<string> {
    const count = await countFn();
    const seq = String(count + 1).padStart(6, '0');
    const year = new Date().getFullYear();
    return `${prefix}-${year}-${seq}`;
  }

  // ── Research Projects ───────────────────────────────────────────────────────

  async createProject(data: {
    title: string;
    abstract?: string;
    projectType?: string;
    researchArea?: string;
    piFacultyId: string;
    departmentId: string;
    instituteId: string;
    startDate: string;
    endDate?: string;
    totalBudget?: number;
  }, userId: string) {
    const code = await this.nextSeq('PRJ', () => this.prisma.researchProject.count());

    return this.prisma.researchProject.create({
      data: {
        projectCode: code,
        title: data.title,
        abstract: data.abstract,
        projectType: data.projectType || 'INTERNAL',
        researchArea: data.researchArea,
        piFacultyId: data.piFacultyId,
        departmentId: data.departmentId,
        instituteId: data.instituteId,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        totalBudget: Number(data.totalBudget || 0),
        status: 'SUBMITTED',
        createdByUserId: userId,
        members: {
          create: {
            facultyId: data.piFacultyId,
            role: 'PI',
          },
        },
      },
      include: { department: true, institute: true, members: { include: { faculty: true } } },
    });
  }

  async getProjects(departmentId?: string, status?: string) {
    return this.prisma.researchProject.findMany({
      where: {
        ...(departmentId ? { departmentId } : {}),
        ...(status ? { status } : {}),
      },
      include: {
        department: true,
        institute: true,
        members: { include: { faculty: true } },
        grants: true,
        publications: true,
        patents: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getProjectById(id: string) {
    const project = await this.prisma.researchProject.findUnique({
      where: { id },
      include: {
        department: true,
        institute: true,
        members: { include: { faculty: true } },
        milestones: true,
        grants: true,
        publications: true,
        patents: true,
      },
    });
    if (!project) throw new NotFoundException('Research project not found.');
    return project;
  }

  // ── Grants, Publications, Patents ─────────────────────────────────────────

  async createGrant(data: { projectId: string; fundingAgency: string; proposedAmount: number; approvedAmount?: number }) {
    const grantNo = await this.nextSeq('GRT', () => this.prisma.researchGrant.count());

    return this.prisma.researchGrant.create({
      data: {
        grantNo,
        projectId: data.projectId,
        fundingAgency: data.fundingAgency,
        proposedAmount: Number(data.proposedAmount),
        approvedAmount: Number(data.approvedAmount || 0),
        status: data.approvedAmount ? 'APPROVED' : 'PROPOSED',
      },
    });
  }

  async getGrants(projectId?: string) {
    return this.prisma.researchGrant.findMany({
      where: { ...(projectId ? { projectId } : {}) },
      include: { project: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createPublication(data: { projectId?: string; title: string; authors: string; journalName: string; publicationType?: string; year: number; doi?: string; indexing?: string }) {
    return this.prisma.publication.create({
      data: {
        projectId: data.projectId,
        title: data.title,
        authors: data.authors,
        journalName: data.journalName,
        publicationType: data.publicationType || 'JOURNAL',
        year: data.year,
        doi: data.doi,
        indexing: data.indexing,
        status: 'PUBLISHED',
      },
    });
  }

  async getPublications(projectId?: string) {
    return this.prisma.publication.findMany({
      where: { ...(projectId ? { projectId } : {}) },
      orderBy: { year: 'desc' },
    });
  }

  async createPatent(data: { projectId?: string; title: string; inventors: string; applicationNumber: string; filingDate: string }) {
    const existing = await this.prisma.patent.findUnique({ where: { applicationNumber: data.applicationNumber } });
    if (existing) throw new ConflictException(`Patent application '${data.applicationNumber}' already exists.`);

    return this.prisma.patent.create({
      data: {
        projectId: data.projectId,
        title: data.title,
        inventors: data.inventors,
        applicationNumber: data.applicationNumber,
        filingDate: new Date(data.filingDate),
        status: 'FILED',
      },
    });
  }

  async getPatents(projectId?: string) {
    return this.prisma.patent.findMany({
      where: { ...(projectId ? { projectId } : {}) },
      orderBy: { filingDate: 'desc' },
    });
  }
}
