import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

export interface JwtPayload {
  sub: string;
  erpId: string;
  username: string;
  role?: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'ssiu_erp_jwt_super_secret_key_2026',
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
        userRoles: {
          include: { role: true },
        },
        student: {
          select: {
            id: true,
            enrollmentNo: true,
            firstName: true,
            lastName: true,
            email: true,
            instituteId: true,
            departmentId: true,
          },
        },
        faculty: {
          select: {
            id: true,
            employeeCode: true,
            firstName: true,
            lastName: true,
            email: true,
            designation: true,
            instituteId: true,
            departmentId: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('User account no longer exists.');
    }

    if (user.accountStatus !== 'ACTIVE') {
      throw new UnauthorizedException(`Account is currently ${user.accountStatus}. Login denied.`);
    }

    const primaryRole = user.userRoles[0]?.role;

    return {
      id: user.id,
      erpId: user.erpId,
      username: user.username,
      accountStatus: user.accountStatus,
      role: primaryRole?.code || 'USER',
      authorityLevel: primaryRole?.authorityLevel || 10,
      userRoles: user.userRoles,
      student: user.student,
      faculty: user.faculty,
    };
  }
}
