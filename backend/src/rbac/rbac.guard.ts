import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSION_KEY, RequiredPermission } from './require-permission.decorator';
import { RbacService } from './rbac.service';

@Injectable()
export class RbacGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly rbacService: RbacService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermission = this.reflector.getAllAndOverride<RequiredPermission>(PERMISSION_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermission) {
      return true; // No explicit permission annotation required
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User context missing or unauthenticated. Access denied.');
    }

    const resourceMeta = {
      instituteId: request.params?.instituteId || request.query?.instituteId || request.body?.instituteId,
      departmentId: request.params?.departmentId || request.query?.departmentId || request.body?.departmentId,
      studentId: request.params?.studentId || request.query?.studentId || request.body?.studentId,
      facultyId: request.params?.facultyId || request.query?.facultyId || request.body?.facultyId,
    };

    const authCheck = await this.rbacService.checkPermission(
      user.id,
      requiredPermission.module,
      requiredPermission.action,
      resourceMeta,
    );

    if (!authCheck.granted) {
      throw new ForbiddenException(`Forbidden: ${authCheck.reason || 'Access denied by RBAC Engine.'}`);
    }

    return true;
  }
}
