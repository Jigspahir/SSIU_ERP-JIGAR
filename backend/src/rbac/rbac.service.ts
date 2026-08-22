import { Injectable, NotFoundException, ForbiddenException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { AssignPermissionsDto } from './dto/assign-permissions.dto';
import { AssignUserRoleDto } from './dto/assign-user-role.dto';

export interface CheckPermissionResult {
  granted: boolean;
  reason?: string;
  userAuthorityLevel?: number;
  userScope?: string;
}

@Injectable()
export class RbacService {
  private readonly logger = new Logger(RbacService.name);

  constructor(private readonly prisma: PrismaService) {}

  // 1. Role Master CRUD
  async getRoles() {
    return this.prisma.role.findMany({
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
        _count: {
          select: { userRoles: true },
        },
      },
      orderBy: { authorityLevel: 'desc' },
    });
  }

  async createRole(dto: CreateRoleDto, performedByUserId?: string) {
    const existing = await this.prisma.role.findUnique({ where: { code: dto.code.trim().toUpperCase() } });
    if (existing) throw new BadRequestException(`Role with code '${dto.code}' already exists.`);

    const role = await this.prisma.role.create({
      data: {
        code: dto.code.trim().toUpperCase(),
        name: dto.name.trim(),
        description: dto.description,
        authorityLevel: dto.authorityLevel,
      },
    });

    await this.logRbacAudit(performedByUserId, null, role.id, 'ROLE_CREATED', `Created role ${role.code} with authority level ${role.authorityLevel}`);
    return role;
  }

  async updateRole(roleId: string, dto: UpdateRoleDto, performedByUserId?: string) {
    const role = await this.prisma.role.findUnique({ where: { id: roleId } });
    if (!role) throw new NotFoundException('Role not found.');

    const updated = await this.prisma.role.update({
      where: { id: roleId },
      data: {
        name: dto.name ? dto.name.trim() : role.name,
        description: dto.description !== undefined ? dto.description : role.description,
        authorityLevel: dto.authorityLevel !== undefined ? dto.authorityLevel : role.authorityLevel,
        status: dto.status || role.status,
      },
    });

    await this.logRbacAudit(performedByUserId, null, roleId, 'ROLE_UPDATED', `Updated role ${role.code}`);
    return updated;
  }

  // 2. Permission Assignment
  async assignPermissionsToRole(roleId: string, permissionIds: string[], performedByUserId?: string) {
    const role = await this.prisma.role.findUnique({ where: { id: roleId } });
    if (!role) throw new NotFoundException('Role not found.');

    await this.prisma.rolePermission.deleteMany({ where: { roleId } });

    if (permissionIds && permissionIds.length > 0) {
      await this.prisma.rolePermission.createMany({
        data: permissionIds.map((pId) => ({
          roleId,
          permissionId: pId,
        })),
      });
    }

    await this.logRbacAudit(performedByUserId, null, roleId, 'PERMISSIONS_UPDATED', `Updated permissions for role ${role.code}`);
    return this.getRoleById(roleId);
  }

  async getRoleById(roleId: string) {
    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
    });
    if (!role) throw new NotFoundException('Role not found.');
    return role;
  }

  async getAllPermissions() {
    return this.prisma.permission.findMany({
      orderBy: [{ module: 'asc' }, { action: 'asc' }],
    });
  }

  // 3. User Role Assignment with Authority Level Checks
  async assignRoleToUser(dto: AssignUserRoleDto, performedByUserId: string) {
    const { userId: targetUserId, roleId, scopeType, scopeId } = dto;

    const targetUser = await this.prisma.user.findUnique({ where: { id: targetUserId } });
    if (!targetUser) throw new NotFoundException('Target user not found.');

    const roleToAssign = await this.prisma.role.findUnique({ where: { id: roleId } });
    if (!roleToAssign) throw new NotFoundException('Role to assign not found.');

    // Hierarchy Check: Performer authority level must be >= role being assigned unless performer is SYSTEM_ADMIN
    if (performedByUserId) {
      const performer = await this.prisma.user.findUnique({
        where: { id: performedByUserId },
        include: { userRoles: { include: { role: true } } },
      });

      if (performer) {
        const isSysAdmin = performer.userRoles.some((ur) => ur.role.code === 'SYSTEM_ADMIN');
        const maxPerfAuthority = Math.max(0, ...performer.userRoles.map((ur) => ur.role.authorityLevel));

        if (!isSysAdmin && maxPerfAuthority < roleToAssign.authorityLevel) {
          throw new ForbiddenException(
            `Hierarchy Violation: You (Level ${maxPerfAuthority}) cannot assign a role with higher authority level (${roleToAssign.authorityLevel}) than your own.`
          );
        }
      }
    }

    const userRole = await this.prisma.userRole.upsert({
      where: { userId_roleId: { userId: targetUserId, roleId } },
      update: { scopeType: scopeType || 'UNIVERSITY', scopeId, assignedBy: performedByUserId },
      create: {
        userId: targetUserId,
        roleId,
        scopeType: scopeType || 'UNIVERSITY',
        scopeId,
        assignedBy: performedByUserId,
      },
    });

    await this.logRbacAudit(performedByUserId, targetUserId, roleId, 'ROLE_ASSIGNED', `Assigned role ${roleToAssign.code} to user ${targetUser.erpId}`);
    return userRole;
  }

  async revokeRoleFromUser(targetUserId: string, roleId: string, performedByUserId: string) {
    const roleToRevoke = await this.prisma.role.findUnique({ where: { id: roleId } });
    if (!roleToRevoke) throw new NotFoundException('Role not found.');

    // Hierarchy Check
    if (performedByUserId) {
      const performer = await this.prisma.user.findUnique({
        where: { id: performedByUserId },
        include: { userRoles: { include: { role: true } } },
      });

      if (performer) {
        const isSysAdmin = performer.userRoles.some((ur) => ur.role.code === 'SYSTEM_ADMIN');
        const maxPerfAuthority = Math.max(0, ...performer.userRoles.map((ur) => ur.role.authorityLevel));

        if (!isSysAdmin && maxPerfAuthority < roleToRevoke.authorityLevel) {
          throw new ForbiddenException(
            `Hierarchy Violation: Cannot revoke role with authority level (${roleToRevoke.authorityLevel}) exceeding your own level (${maxPerfAuthority}).`
          );
        }
      }
    }

    await this.prisma.userRole.deleteMany({
      where: { userId: targetUserId, roleId },
    });

    await this.logRbacAudit(performedByUserId, targetUserId, roleId, 'ROLE_REMOVED', `Revoked role ${roleToRevoke.code} from user ${targetUserId}`);
    return { message: `Role ${roleToRevoke.code} revoked successfully.` };
  }

  async getUserEffectivePermissions(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        userRoles: {
          include: { role: { include: { rolePermissions: { include: { permission: true } } } } },
        },
      },
    });

    if (!user) throw new NotFoundException('User not found.');

    const activeRoles = user.userRoles.map((ur) => ur.role);
    const permissionMap = new Map<string, any>();
    let maxAuthority = 0;

    for (const r of activeRoles) {
      if (r.authorityLevel > maxAuthority) maxAuthority = r.authorityLevel;
      for (const rp of r.rolePermissions) {
        permissionMap.set(rp.permission.code, rp.permission);
      }
    }

    return {
      userId: user.id,
      erpId: user.erpId,
      maxAuthorityLevel: maxAuthority,
      activeRoleCodes: activeRoles.map((r) => r.code),
      effectivePermissions: Array.from(permissionMap.values()),
    };
  }

  // 4. Central Authorization Check Service (checkPermission)
  async checkPermission(
    userId: string,
    module: string,
    action: string,
    resourceMeta?: {
      instituteId?: string;
      departmentId?: string;
      studentId?: string;
      facultyId?: string;
    }
  ): Promise<CheckPermissionResult> {
    let user;
    try {
      user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          userRoles: {
            include: { role: { include: { rolePermissions: { include: { permission: true } } } } },
          },
          student: true,
          faculty: true,
        },
      });
    } catch (e) {
      return { granted: false, reason: 'User lookup failed.' };
    }

    if (!user || user.accountStatus !== 'ACTIVE') {
      return { granted: false, reason: 'User account is inactive or not found.' };
    }

    const activeRoles = user.userRoles.map((ur) => ur.role);
    if (activeRoles.some((r) => ['SYSTEM_ADMIN', 'SUPER_ADMIN', 'PRESIDENT', 'VICE_PRESIDENT', 'PROVOST', 'UNIVERSITY_ADMIN'].includes(r.code))) {
      return { granted: true, userAuthorityLevel: 100, userScope: 'UNIVERSITY' };
    }

    let hasPermission = false;
    let maxAuthority = 0;

    for (const r of activeRoles) {
      if (r.authorityLevel > maxAuthority) maxAuthority = r.authorityLevel;
      const matched = r.rolePermissions.some(
        (rp) => rp.permission.module === module && rp.permission.action === action
      );
      if (matched) hasPermission = true;
    }

    if (!hasPermission) {
      return { granted: false, reason: `Missing required permission ${module}:${action}` };
    }

    return { granted: true, userAuthorityLevel: maxAuthority, userScope: 'UNIVERSITY' };
  }

  private async logRbacAudit(performedByUserId: string | null | undefined, targetUserId: string | null, targetRoleId: string | null, action: string, details: string) {
    try {
      await this.prisma.rbacAudit.create({
        data: {
          performedByUserId: performedByUserId || undefined,
          targetUserId: targetUserId || undefined,
          targetRoleId: targetRoleId || undefined,
          action,
          details,
        },
      });
    } catch (err) {
      this.logger.error('Failed to log RBAC Audit:', err);
    }
  }
}
