import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateAssetCategoryDto,
  CreateAssetDto,
  AssignAssetDto,
  TransferAssetDto,
  CreateMaintenanceDto,
  CompleteMaintenanceDto,
  CreateDisposalDto,
} from './dto/assets.dto';

@Injectable()
export class AssetsService {
  constructor(private readonly prisma: PrismaService) {}

  private async nextSeq(prefix: string, countFn: () => Promise<number>): Promise<string> {
    const count = await countFn();
    const seq = String(count + 1).padStart(6, '0');
    const year = new Date().getFullYear();
    return `${prefix}-${year}-${seq}`;
  }

  // ── Asset Category ────────────────────────────────────────────────────────────

  async createCategory(dto: CreateAssetCategoryDto) {
    const existing = await this.prisma.assetCategory.findUnique({ where: { code: dto.code.toUpperCase() } });
    if (existing) throw new ConflictException(`Asset category code '${dto.code}' already exists.`);
    if (dto.parentId) {
      const parent = await this.prisma.assetCategory.findUnique({ where: { id: dto.parentId } });
      if (!parent) throw new NotFoundException('Parent category not found.');
    }
    return this.prisma.assetCategory.create({
      data: {
        code: dto.code.toUpperCase(),
        name: dto.name,
        description: dto.description,
        parentId: dto.parentId,
        depreciationRate: dto.depreciationRate ?? 0,
        usefulLifeYears: dto.usefulLifeYears ?? 5,
      },
    });
  }

  async getCategories() {
    return this.prisma.assetCategory.findMany({
      where: { status: 'ACTIVE' },
      include: { children: true, _count: { select: { assets: true } } },
      orderBy: { name: 'asc' },
    });
  }

  // ── Asset Master ──────────────────────────────────────────────────────────────

  async createAsset(dto: CreateAssetDto) {
    const existing = await this.prisma.asset.findUnique({ where: { assetTag: dto.assetTag.toUpperCase() } });
    if (existing) throw new ConflictException(`Asset tag '${dto.assetTag}' already exists.`);

    const category = await this.prisma.assetCategory.findUnique({ where: { id: dto.categoryId } });
    if (!category) throw new NotFoundException('Asset category not found.');

    const instId = (dto as any).instituteId || 'inst-sit';

    return this.prisma.asset.create({
      data: {
        assetTag: dto.assetTag.toUpperCase(),
        name: dto.name,
        description: dto.description,
        categoryId: dto.categoryId,
        instituteId: instId,
        serialNo: dto.serialNo,
        modelNo: dto.modelNo,
        manufacturer: dto.manufacturer,
        purchaseDate: dto.purchaseDate ? new Date(dto.purchaseDate) : undefined,
        purchasePrice: dto.purchasePrice,
        currentValue: dto.purchasePrice,
        warrantyExpiry: dto.warrantyExpiry ? new Date(dto.warrantyExpiry) : undefined,
        location: dto.location,
        buildingBlock: dto.buildingBlock,
        floor: dto.floor,
        roomNo: dto.roomNo,
        assignedDeptId: dto.assignedDeptId,
        poNo: dto.poNo,
        invoiceRef: dto.invoiceRef,
        remarks: dto.remarks ? (dto.grnNo ? `${dto.remarks} | GRN: ${dto.grnNo}` : dto.remarks) : (dto.grnNo ? `GRN: ${dto.grnNo}` : undefined),
        status: 'AVAILABLE',
      },
      include: { category: true },
    });
  }

  async getAssets(categoryId?: string, status?: string, search?: string) {
    return this.prisma.asset.findMany({
      where: {
        ...(categoryId ? { categoryId } : {}),
        ...(status ? { status } : {}),
        ...(search
          ? { OR: [{ name: { contains: search, mode: 'insensitive' } }, { assetTag: { contains: search, mode: 'insensitive' } }, { serialNo: { contains: search, mode: 'insensitive' } }] }
          : {}),
      },
      include: { category: true, assignments: { where: { status: 'ACTIVE' }, include: { assignedToUser: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAssetById(id: string) {
    const asset = await this.prisma.asset.findUnique({
      where: { id },
      include: {
        category: true,
        assignments: { include: { assignedToUser: true }, orderBy: { assignmentDate: 'desc' } },
        transfers: { orderBy: { transferDate: 'desc' } },
        maintenanceLogs: { orderBy: { reportedDate: 'desc' } },
        disposals: true,
      },
    });
    if (!asset) throw new NotFoundException('Asset not found.');
    return asset;
  }

  async getAssetByTag(tag: string) {
    const asset = await this.prisma.asset.findUnique({
      where: { assetTag: tag.toUpperCase() },
      include: { category: true, assignments: { where: { status: 'ACTIVE' } } },
    });
    if (!asset) throw new NotFoundException(`Asset with tag '${tag}' not found.`);
    return asset;
  }

  async updateAsset(id: string, data: Partial<CreateAssetDto>) {
    const asset = await this.prisma.asset.findUnique({ where: { id } });
    if (!asset) throw new NotFoundException('Asset not found.');
    return this.prisma.asset.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        serialNo: data.serialNo,
        modelNo: data.modelNo,
        manufacturer: data.manufacturer,
        location: data.location,
        buildingBlock: data.buildingBlock,
        floor: data.floor,
        roomNo: data.roomNo,
        remarks: data.remarks,
      },
      include: { category: true },
    });
  }

  // ── Asset Assignment ──────────────────────────────────────────────────────────

  async assignAsset(assetId: string, dto: AssignAssetDto, assignedByUserId: string) {
    const asset = await this.prisma.asset.findUnique({ where: { id: assetId } });
    if (!asset) throw new NotFoundException('Asset not found.');
    if (!['AVAILABLE'].includes(asset.status)) {
      throw new BadRequestException(`Asset is currently '${asset.status}' and cannot be assigned.`);
    }
    if (!dto.assignedToUserId && !dto.assignedToDeptId) {
      throw new BadRequestException('Either assignedToUserId or assignedToDeptId is required.');
    }

    return this.prisma.$transaction(async (tx) => {
      let assignedToName = 'Department Assignment';
      if (dto.assignedToUserId) {
        const u = await tx.user.findUnique({ where: { id: dto.assignedToUserId } });
        if (u) assignedToName = u.username || u.erpId;
      }

      const assignment = await tx.assetAssignment.create({
        data: {
          assetId,
          assignedToUserId: dto.assignedToUserId,
          assignedToName,
          assignedToDeptId: dto.assignedToDeptId,
          assignedByUserId,
          purpose: dto.purpose,
          remarks: dto.remarks,
          status: 'ACTIVE',
        },
        include: { assignedToUser: true },
      });
      await tx.asset.update({ where: { id: assetId }, data: { status: 'ASSIGNED' } });
      return assignment;
    });
  }

  async returnAsset(assetId: string, remarks?: string) {
    const asset = await this.prisma.asset.findUnique({ where: { id: assetId } });
    if (!asset) throw new NotFoundException('Asset not found.');

    const activeAssignment = await this.prisma.assetAssignment.findFirst({
      where: { assetId, status: 'ACTIVE' },
    });

    return this.prisma.$transaction(async (tx) => {
      if (activeAssignment) {
        await tx.assetAssignment.update({
          where: { id: activeAssignment.id },
          data: { status: 'RETURNED', returnDate: new Date(), remarks },
        });
      }
      await tx.asset.update({ where: { id: assetId }, data: { status: 'AVAILABLE' } });
    });
  }

  async getAssignments(assetId?: string, userId?: string) {
    return this.prisma.assetAssignment.findMany({
      where: {
        ...(assetId ? { assetId } : {}),
        ...(userId ? { assignedToUserId: userId } : {}),
      },
      include: { asset: { include: { category: true } }, assignedToUser: true },
      orderBy: { assignmentDate: 'desc' },
    });
  }

  // ── Asset Transfer ────────────────────────────────────────────────────────────

  async transferAsset(assetId: string, dto: TransferAssetDto, transferredByUserId: string) {
    const asset = await this.prisma.asset.findUnique({ where: { id: assetId } });
    if (!asset) throw new NotFoundException('Asset not found.');

    const transferNo = await this.nextSeq('TRF', () => this.prisma.assetTransfer.count());

    return this.prisma.$transaction(async (tx) => {
      const transfer = await tx.assetTransfer.create({
        data: {
          transferNo,
          assetId,
          fromInstituteId: asset.instituteId,
          toInstituteId: asset.instituteId,
          fromDeptId: dto.fromDeptId,
          toDeptId: dto.toDeptId,
          fromLocation: dto.fromLocation,
          toLocation: dto.toLocation,
          transferredByUserId,
          receivedByUserId: dto.receivedByUserId,
          reason: dto.reason,
          status: 'COMPLETED',
        },
      });

      await tx.asset.update({
        where: { id: assetId },
        data: {
          assignedDeptId: dto.toDeptId,
          location: dto.toLocation,
          status: 'AVAILABLE',
        },
      });

      return transfer;
    });
  }

  async getTransfers(assetId?: string) {
    return this.prisma.assetTransfer.findMany({
      where: { ...(assetId ? { assetId } : {}) },
      include: { asset: { include: { category: true } } },
      orderBy: { transferDate: 'desc' },
    });
  }

  // ── Asset Maintenance ─────────────────────────────────────────────────────────

  async createMaintenance(assetId: string, dto: CreateMaintenanceDto, userId: string) {
    const asset = await this.prisma.asset.findUnique({ where: { id: assetId } });
    if (!asset) throw new NotFoundException('Asset not found.');

    const mntNo = await this.nextSeq('MNT', () => this.prisma.assetMaintenance.count());

    return this.prisma.$transaction(async (tx) => {
      let reportedByName = 'System Staff';
      const reporter = await tx.user.findUnique({ where: { id: userId } });
      if (reporter) reportedByName = reporter.username || reporter.erpId;

      const mnt = await tx.assetMaintenance.create({
        data: {
          maintenanceNo: mntNo,
          assetId,
          maintenanceType: dto.maintenanceType,
          issueDescription: dto.description || 'Maintenance requested',
          reportedByUserId: userId,
          reportedByName,
          scheduledDate: dto.scheduledDate ? new Date(dto.scheduledDate) : undefined,
          vendorTechnician: dto.vendor,
          estimatedCost: dto.cost !== undefined ? dto.cost : undefined,
          partsReplaced: dto.partsReplaced,
          status: 'IN_PROGRESS',
          remarks: dto.remarks,
        },
      });
      await tx.asset.update({ where: { id: assetId }, data: { status: 'UNDER_MAINTENANCE' } });
      return mnt;
    });
  }

  async completeMaintenance(maintenanceId: string, dto: CompleteMaintenanceDto) {
    const mnt = await this.prisma.assetMaintenance.findUnique({ where: { id: maintenanceId } });
    if (!mnt) throw new NotFoundException('Maintenance record not found.');

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.assetMaintenance.update({
        where: { id: maintenanceId },
        data: {
          status: 'COMPLETED',
          completedDate: new Date(),
          actualCost: dto.cost !== undefined ? dto.cost : undefined,
          partsReplaced: dto.partsReplaced,
          remarks: dto.remarks,
        },
      });
      await tx.asset.update({ where: { id: mnt.assetId }, data: { status: 'AVAILABLE' } });
      return updated;
    });
  }

  async getMaintenanceLogs(assetId?: string, status?: string) {
    return this.prisma.assetMaintenance.findMany({
      where: {
        ...(assetId ? { assetId } : {}),
        ...(status ? { status } : {}),
      },
      include: { asset: { include: { category: true } } },
      orderBy: { reportedDate: 'desc' },
    });
  }

  // ── Asset Disposal ────────────────────────────────────────────────────────────

  async createDisposal(assetId: string, dto: CreateDisposalDto, requestedByUserId: string) {
    const asset = await this.prisma.asset.findUnique({ where: { id: assetId } });
    if (!asset) throw new NotFoundException('Asset not found.');

    const existingDisposal = await this.prisma.assetDisposal.findUnique({ where: { assetId } });
    if (existingDisposal) throw new ConflictException('Disposal record already exists for this asset.');

    const disposalNo = await this.nextSeq('DIS', () => this.prisma.assetDisposal.count());

    return this.prisma.assetDisposal.create({
      data: {
        disposalNo,
        assetId,
        disposalMethod: dto.disposalMethod,
        disposalValue: dto.disposalValue,
        buyerName: dto.buyerName,
        reason: dto.reason,
        approvedByUserId: requestedByUserId,
        approvedAt: new Date(),
        status: 'PENDING',
        remarks: dto.remarks,
      },
    });
  }

  async approveDisposal(disposalId: string, approvedByUserId: string) {
    const disposal = await this.prisma.assetDisposal.findUnique({ where: { id: disposalId } });
    if (!disposal) throw new NotFoundException('Disposal record not found.');

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.assetDisposal.update({
        where: { id: disposalId },
        data: { status: 'COMPLETED', approvedByUserId, approvedAt: new Date(), disposalDate: new Date() },
      });
      await tx.asset.update({ where: { id: disposal.assetId }, data: { status: 'DISPOSED' } });
      return updated;
    });
  }

  async getDisposals(status?: string) {
    return this.prisma.assetDisposal.findMany({
      where: { ...(status ? { status } : {}) },
      include: { asset: { include: { category: true } } },
      orderBy: { disposalDate: 'desc' },
    });
  }

  // ── Reports ───────────────────────────────────────────────────────────────────

  async getAssetSummary() {
    const [total, available, assigned, underMaintenance, disposed] = await Promise.all([
      this.prisma.asset.count(),
      this.prisma.asset.count({ where: { status: 'AVAILABLE' } }),
      this.prisma.asset.count({ where: { status: 'ASSIGNED' } }),
      this.prisma.asset.count({ where: { status: 'UNDER_MAINTENANCE' } }),
      this.prisma.asset.count({ where: { status: 'DISPOSED' } }),
    ]);

    const warrantyExpiring = await this.prisma.asset.findMany({
      where: {
        warrantyExpiry: { lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
        status: { not: 'DISPOSED' },
      },
      include: { category: true },
    });

    return { total, available, assigned, underMaintenance, disposed, warrantyExpiring };
  }
}
