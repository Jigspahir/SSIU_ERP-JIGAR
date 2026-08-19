import { Injectable, UnauthorizedException, BadRequestException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(loginDto: LoginDto, reqMeta: { ip?: string; userAgent?: string }) {
    const { loginId, password } = loginDto;

    // 1. Search by ERP ID or Username
    let user;
    try {
      user = await this.prisma.user.findFirst({
        where: {
          OR: [
            { erpId: loginId.trim().toUpperCase() },
            { username: loginId.trim() },
          ],
        },
        include: {
          userRoles: { include: { role: true } },
          student: { select: { id: true, enrollmentNo: true, firstName: true, lastName: true, email: true } },
          faculty: { select: { id: true, employeeCode: true, firstName: true, lastName: true, email: true, designation: true } },
        },
      });
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : String(e);
      this.logger.warn(`Database query failed during login check: ${errMsg}`);
      throw new UnauthorizedException('Database service is currently offline or unreachable. Please start PostgreSQL on port 5432.');
    }

    if (!user) {
      await this.logAudit(null, loginId, 'LOGIN_FAILED', false, reqMeta, 'User not found');
      throw new UnauthorizedException('Invalid ERP ID / Username or Password.');
    }

    // 2. Lockout Check
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      await this.logAudit(user.id, user.username, 'LOGIN_FAILED', false, reqMeta, 'Account locked');
      throw new UnauthorizedException(`Account is locked due to repeated failed attempts. Try again after ${user.lockedUntil.toLocaleTimeString()}.`);
    }

    // Reset lock if expired
    if (user.lockedUntil && user.lockedUntil <= new Date()) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { failedLoginAttempts: 0, lockedUntil: null, accountStatus: 'ACTIVE' },
      });
    }

    if (user.accountStatus !== 'ACTIVE') {
      await this.logAudit(user.id, user.username, 'LOGIN_FAILED', false, reqMeta, `Account status: ${user.accountStatus}`);
      throw new UnauthorizedException(`Account status is ${user.accountStatus}. Access denied.`);
    }

    // 3. Password Check
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      const attempts = user.failedLoginAttempts + 1;
      const dataToUpdate: any = { failedLoginAttempts: attempts };

      if (attempts >= 5) {
        dataToUpdate.accountStatus = 'LOCKED';
        dataToUpdate.lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 min lock
        this.logger.warn(`Account ${user.erpId} locked due to 5 consecutive failed login attempts.`);
      }

      await this.prisma.user.update({
        where: { id: user.id },
        data: dataToUpdate,
      });

      await this.logAudit(user.id, user.username, 'LOGIN_FAILED', false, reqMeta, 'Invalid password');
      throw new UnauthorizedException('Invalid ERP ID / Username or Password.');
    }

    // 4. Successful Login
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
      },
    });

    await this.logAudit(user.id, user.username, 'LOGIN_SUCCESS', true, reqMeta);

    const primaryRole = user.userRoles[0]?.role;

    // 5. Generate Tokens
    const payload = {
      sub: user.id,
      erpId: user.erpId,
      username: user.username,
      role: primaryRole?.code || 'USER',
    };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = crypto.randomBytes(40).toString('hex');
    const refreshExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: refreshToken,
        expiresAt: refreshExpiresAt,
      },
    });

    const email = user.student?.email || user.faculty?.email || `${user.username}@swarrnim.edu.in`;

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: 900,
      user: {
        id: user.id,
        erpId: user.erpId,
        username: user.username,
        email,
        role: primaryRole?.code || 'USER',
        authorityLevel: primaryRole?.authorityLevel || 10,
        student: user.student,
        faculty: user.faculty,
        lastLoginAt: user.lastLoginAt,
      },
    };
  }

  async logout(userId: string, refreshToken?: string, reqMeta?: { ip?: string; userAgent?: string }) {
    if (refreshToken) {
      await this.prisma.refreshToken.updateMany({
        where: { userId, tokenHash: refreshToken },
        data: { isRevoked: true },
      });
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (user) {
      await this.logAudit(user.id, user.username, 'LOGOUT', true, reqMeta || {});
    }

    return { message: 'Logged out successfully.' };
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    const { refreshToken } = refreshTokenDto;

    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { tokenHash: refreshToken },
      include: { user: { include: { userRoles: { include: { role: true } } } } },
    });

    if (!storedToken || storedToken.isRevoked || storedToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token is invalid or expired.');
    }

    const primaryRole = storedToken.user.userRoles[0]?.role;

    const payload = {
      sub: storedToken.user.id,
      erpId: storedToken.user.erpId,
      username: storedToken.user.username,
      role: primaryRole?.code || 'USER',
    };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });

    return {
      accessToken,
      tokenType: 'Bearer',
      expiresIn: 900,
    };
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        userRoles: { include: { role: true } },
        student: {
          include: {
            institute: { select: { code: true, name: true } },
            department: { select: { code: true, name: true } },
            batch: { select: { code: true } },
          },
        },
        faculty: {
          include: {
            institute: { select: { code: true, name: true } },
            department: { select: { code: true, name: true } },
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('User profile not found.');
    }

    const primaryRole = user.userRoles[0]?.role;
    const email = user.student?.email || user.faculty?.email || `${user.username}@swarrnim.edu.in`;

    return {
      id: user.id,
      erpId: user.erpId,
      username: user.username,
      email,
      accountStatus: user.accountStatus,
      lastLoginAt: user.lastLoginAt,
      role: {
        code: primaryRole?.code || 'USER',
        name: primaryRole?.name || 'User',
        authorityLevel: primaryRole?.authorityLevel || 10,
      },
      student: user.student,
      faculty: user.faculty,
    };
  }

  async changePassword(userId: string, dto: ChangePasswordDto, reqMeta: { ip?: string; userAgent?: string }) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found.');

    const isMatch = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!isMatch) {
      throw new BadRequestException('Current password provided is incorrect.');
    }

    const newHash = await bcrypt.hash(dto.newPassword, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newHash },
    });

    await this.logAudit(user.id, user.username, 'PASSWORD_CHANGE', true, reqMeta);

    return { message: 'Password changed successfully.' };
  }

  async forgotPassword(dto: ForgotPasswordDto, reqMeta: { ip?: string; userAgent?: string }) {
    let user;
    try {
      user = await this.prisma.user.findFirst({
        where: {
          OR: [
            { erpId: dto.identifier.trim().toUpperCase() },
            { username: dto.identifier.trim() },
          ],
        },
      });

      if (user) {
        const resetToken = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        await this.prisma.passwordResetToken.create({
          data: {
            userId: user.id,
            tokenHash: resetToken,
            expiresAt,
          },
        });

        await this.logAudit(user.id, user.username, 'PASSWORD_RESET_REQUEST', true, reqMeta);
        this.logger.log(`Password reset token generated for ${user.erpId}: ${resetToken}`);
      }
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : String(e);
      this.logger.warn(`Forgot password lookup failed: ${errMsg}`);
    }

    return {
      message: 'If an account exists matching the provided identifier, password reset instructions have been dispatched.',
    };
  }

  async resetPassword(dto: ResetPasswordDto, reqMeta: { ip?: string; userAgent?: string }) {
    const resetRecord = await this.prisma.passwordResetToken.findUnique({
      where: { tokenHash: dto.token },
      include: { user: true },
    });

    if (!resetRecord || resetRecord.isUsed || resetRecord.expiresAt < new Date()) {
      throw new BadRequestException('Password reset token is invalid, used, or expired.');
    }

    const newHash = await bcrypt.hash(dto.newPassword, 10);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: resetRecord.userId },
        data: {
          passwordHash: newHash,
          failedLoginAttempts: 0,
          lockedUntil: null,
          accountStatus: 'ACTIVE',
        },
      }),
      this.prisma.passwordResetToken.update({
        where: { id: resetRecord.id },
        data: { isUsed: true },
      }),
    ]);

    await this.logAudit(resetRecord.user.id, resetRecord.user.username, 'PASSWORD_RESET', true, reqMeta);

    return { message: 'Password reset completed successfully. You may now login with your new password.' };
  }

  private async logAudit(userId: string | null, username: string, action: string, success: boolean, reqMeta: { ip?: string; userAgent?: string }, reason?: string) {
    try {
      await this.prisma.loginAudit.create({
        data: {
          userId,
          username,
          success,
          reason,
          ipAddress: reqMeta.ip || '127.0.0.1',
          userAgent: reqMeta.userAgent || 'Unknown Agent',
        },
      });
    } catch (e) {
      this.logger.error('Failed to record login audit log:', e);
    }
  }
}
