import { Injectable, Logger, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { FirebaseAdminService } from '../firebase/firebase-admin.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedFirebaseUserSession, FirebaseERPRole } from './firebase-session.types';

@Injectable()
export class FirebaseAuthService {
  private readonly logger = new Logger(FirebaseAuthService.name);

  constructor(
    private readonly firebaseAdmin: FirebaseAdminService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Verify Firebase ID Token using Firebase Admin SDK
   */
  public async verifyIdToken(token: string): Promise<any> {
    try {
      const decodedToken = await this.firebaseAdmin.getAuth().verifyIdToken(token);
      return decodedToken;
    } catch (err: any) {
      this.logger.warn(`[FirebaseAuthService] Token verification failed: ${err.message}`);
      throw new UnauthorizedException(`Invalid or expired Firebase authentication token: ${err.message}`);
    }
  }

  /**
   * Centralized user lookup by Firebase Auth UID from PostgreSQL / Prisma (Primary) with Firestore fallback
   */
  public async getUserByFirebaseUid(uid: string, email?: string): Promise<AuthenticatedFirebaseUserSession | null> {
    const cleanUid = uid.replace(/^fb-uid-/, '').replace(/^firebase-uid-/, '');
    const searchEmail = email?.trim().toLowerCase();

    // 1. Primary Resolution: PostgreSQL Database via Prisma
    try {
      const orConditions: any[] = [
        { id: uid },
        { id: cleanUid },
        { erpId: uid },
        { erpId: cleanUid },
        { erpId: cleanUid.toUpperCase() },
        { username: uid },
        { username: cleanUid },
        { temporaryEnrollmentNumber: cleanUid },
        { finalEnrollmentNumber: cleanUid },
      ];

      if (searchEmail) {
        orConditions.push(
          { username: searchEmail },
          { student: { email: searchEmail } },
          { faculty: { email: searchEmail } },
        );
      }

      orConditions.push(
        { student: { enrollmentNo: cleanUid } },
        { student: { temporaryEnrollmentNumber: cleanUid } },
        { student: { finalEnrollmentNumber: cleanUid } },
        { faculty: { employeeCode: cleanUid } },
      );

      const erpUser = await this.prisma.user.findFirst({
        where: { OR: orConditions },
        include: {
          userRoles: { include: { role: true } },
          student: {
            select: {
              id: true,
              enrollmentNo: true,
              firstName: true,
              lastName: true,
              email: true,
              instituteId: true,
              departmentId: true,
              currentDivisionId: true,
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

      if (erpUser) {
        const u = erpUser as any;
        const primaryRole = (u.userRoles?.[0]?.role?.code || 'STUDENT') as FirebaseERPRole;
        const roles = (u.userRoles?.map((ur: any) => ur.role?.code as FirebaseERPRole) || []).filter(Boolean);
        const active = u.accountStatus === 'ACTIVE';

        const displayName = u.student
          ? `${u.student.firstName || ''} ${u.student.lastName || ''}`.trim()
          : u.faculty
            ? `${u.faculty.firstName || ''} ${u.faculty.lastName || ''}`.trim()
            : u.username;

        const resolvedEmail = u.student?.email || u.faculty?.email || u.email || searchEmail || (u.username?.includes('@') ? u.username : `${u.username}@swarrnim.edu.in`);

        const session: AuthenticatedFirebaseUserSession = {
          uid,
          email: resolvedEmail,
          displayName: displayName || u.username,
          role: primaryRole,
          roles: roles.length > 0 ? roles : [primaryRole],
          active,
          status: u.accountStatus as any,
          isSuperAdmin: primaryRole === 'SUPER_ADMIN' || primaryRole === 'UNIVERSITY_ADMIN' || roles.includes('SUPER_ADMIN'),
          employeeId: u.faculty?.employeeCode || u.facultyId || undefined,
          studentId: u.student?.enrollmentNo || u.studentId || undefined,
          instituteId: u.student?.instituteId || u.faculty?.instituteId || undefined,
          departmentId: u.student?.departmentId || u.faculty?.departmentId || undefined,
          divisionId: u.student?.currentDivisionId || undefined,
          permissions: (u.userRoles || []).flatMap((ur: any) => ur.role?.permissions || []),
        };

        return session;
      }
    } catch (err: any) {
      this.logger.debug(`[FirebaseAuthService] Prisma lookup note: ${err.message}`);
    }

    // 2. Secondary Resolution: Cloud Firestore users collection
    try {
      const firestore = this.firebaseAdmin.getFirestore();
      const userDoc = await firestore.collection('users').doc(uid).get();

      if (userDoc.exists) {
        const data = userDoc.data() || {};
        const role = (data.role || 'STUDENT') as FirebaseERPRole;
        const roles: FirebaseERPRole[] = data.roles || [role];
        const active = data.active !== false && data.status !== 'DISABLED' && data.status !== 'LOCKED' && data.status !== 'SUSPENDED';

        const session: AuthenticatedFirebaseUserSession = {
          uid: data.uid || uid,
          email: data.email || searchEmail || '',
          displayName: data.displayName || data.name || data.email || '',
          role,
          roles,
          active,
          status: data.status || (active ? 'ACTIVE' : 'DISABLED'),
          isSuperAdmin: role === 'SUPER_ADMIN' || roles.includes('SUPER_ADMIN') || role === 'UNIVERSITY_ADMIN',
          employeeId: data.employeeId,
          studentId: data.studentId,
          parentStudentIds: data.parentStudentIds || [],
          instituteId: data.instituteId,
          departmentId: data.departmentId,
          programId: data.programId,
          semesterId: data.semesterId,
          divisionId: data.divisionId,
          mentorId: data.mentorId,
          permissions: data.permissions || []
        };

        return session;
      }
    } catch (err: any) {
      this.logger.debug(`[FirebaseAuthService] Firestore lookup note: ${err.message}`);
    }

    return null;
  }

  /**
   * Validate and authenticate request token and return authoritative user session
   */
  public async authenticateToken(token: string): Promise<AuthenticatedFirebaseUserSession> {
    const decodedToken = await this.verifyIdToken(token);
    const uid = decodedToken.uid;
    const email = decodedToken.email;

    if (!uid) {
      throw new UnauthorizedException('Token payload missing valid Firebase UID.');
    }

    let userSession = await this.getUserByFirebaseUid(uid, email);

    // If user record doesn't exist in PostgreSQL or Firestore, construct session with safe unprivileged defaults
    if (!userSession) {
      userSession = {
        uid,
        email: email || '',
        displayName: decodedToken.name || email || 'ERP User',
        role: 'STUDENT',
        roles: ['STUDENT'],
        active: true,
        status: 'ACTIVE',
        isSuperAdmin: false,
        employeeId: undefined,
        studentId: undefined,
        parentStudentIds: [],
        instituteId: undefined,
        departmentId: undefined,
        tokenIssuedAt: decodedToken.iat,
        tokenExpiresAt: decodedToken.exp
      };
    }

    if (!userSession.active || userSession.status === 'LOCKED' || userSession.status === 'DISABLED' || userSession.status === 'SUSPENDED') {
      throw new ForbiddenException(`Account access denied: Account status is ${userSession.status}. Contact your administrator.`);
    }

    return userSession;
  }
}
