import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { AuthenticatedFirebaseUserSession, FirebaseERPRole } from '../firebase-session.types';

@Injectable()
export class FirebaseRolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<FirebaseERPRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as AuthenticatedFirebaseUserSession;

    if (!user) {
      throw new ForbiddenException('Access denied: Unauthenticated user.');
    }

    // Super Admin and University Admin have universal authorization bypass
    if (user.isSuperAdmin || user.role === 'SUPER_ADMIN' || user.role === 'UNIVERSITY_ADMIN' || user.roles?.includes('SUPER_ADMIN')) {
      return true;
    }

    const userRoles = user.roles || [user.role];
    const hasRequiredRole = requiredRoles.some((role) => userRoles.includes(role));

    if (!hasRequiredRole) {
      throw new ForbiddenException(
        `Access denied: Required role(s) [${requiredRoles.join(', ')}]. Current role: [${user.role}].`
      );
    }

    return true;
  }
}
