import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  IdTokenResult,
  Unsubscribe
} from 'firebase/auth';
import { auth } from './config';
import { UserRole, User } from '../types';
import { firebaseUserService } from './services/userService';
import { FirestoreUser } from './types';

/**
 * Supported ERP Access Roles
 * Preserves all active ERP role definitions
 */
export const SUPPORTED_ERP_ROLES: readonly UserRole[] = [
  'SUPER_ADMIN',
  'PRESIDENT',
  'VICE_PRESIDENT',
  'PROVOST',
  'UNIVERSITY_ADMIN',
  'ERP_COORDINATOR',
  'PRINCIPAL',
  'HOD',
  'FACULTY',
  'STAFF',
  'MENTOR',
  'STUDENT_ADMIN',
  'STUDENT',
  'PARENT',
  'REGISTRAR',
  'DEPUTY_REGISTRAR',
  'IQAC',
  'EXAM_CELL',
  'STUDENT_SECTION',
  'HOSTEL_ADMIN',
  'HOSTEL_WARDEN',
  'SECURITY',
  'LIBRARY_ADMIN',
  'TRANSPORT_ADMIN',
  'MAINTENANCE_ADMIN',
  'ACCOUNTS_ADMIN',
  'HR_ADMIN',
  'HR_OFFICER'
] as const;

export type SupportedERPRole = UserRole;

/**
 * Custom claims structure attached to Firebase Auth ID Tokens
 */
export interface ERPCustomClaims {
  role?: UserRole;
  roles?: UserRole[];
  departmentId?: string;
  instituteId?: string;
  studentId?: string;
  employeeId?: string;
  parentStudentIds?: string[];
  permissions?: string[];
}

export interface FirebaseResolvedUserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  active: boolean;
  status: 'ACTIVE' | 'DISABLED' | 'LOCKED' | 'SUSPENDED';
  employeeId?: string;
  studentId?: string;
  parentStudentIds?: string[];
  departmentId?: string;
  instituteId?: string;
  programId?: string;
  semesterId?: string;
  divisionId?: string;
  mentorId?: string;
  phone?: string;
  avatar?: string;
  designation?: string;
  customPermissions?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

/**
 * Phase 2 Centralized Firebase Authentication Integration Layer
 * Maps Firebase Auth UID -> Firestore users/{uid} -> ERP User Profile -> ERP Role -> Permissions
 */
export class FirebaseAuthService {
  /**
   * Get the current Firebase Auth instance
   */
  public getAuthInstance() {
    return auth;
  }

  /**
   * Get currently signed-in Firebase user (if any)
   */
  public getCurrentUser(): FirebaseUser | null {
    return auth.currentUser;
  }

  /**
   * Listen for Firebase Auth state changes
   */
  public onAuthStateChange(callback: (user: FirebaseUser | null) => void): Unsubscribe {
    return onAuthStateChanged(auth, callback);
  }

  /**
   * Sign in using Firebase Email & Password credentials
   */
  public async signInWithEmailPassword(email: string, password: string): Promise<{
    firebaseUser: FirebaseUser;
    userProfile: FirebaseResolvedUserProfile | null;
  }> {
    const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
    const userProfile = await this.getUserByFirebaseUid(cred.user.uid);

    if (userProfile && (!userProfile.active || userProfile.status === 'LOCKED' || userProfile.status === 'DISABLED' || userProfile.status === 'SUSPENDED')) {
      await this.signOut();
      throw new Error(`Account access restricted: Account status is ${userProfile.status}. Please contact the ERP Administrator.`);
    }

    return {
      firebaseUser: cred.user,
      userProfile
    };
  }

  /**
   * Register or provision new Firebase user with email and password
   */
  public async signUpWithEmailPassword(
    email: string,
    password: string,
    profileData?: { role?: UserRole; displayName?: string; departmentId?: string; instituteId?: string }
  ): Promise<{ firebaseUser: FirebaseUser; userProfile: FirebaseResolvedUserProfile | null }> {
    const { createUserWithEmailAndPassword, updateProfile } = await import('firebase/auth');
    const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
    if (profileData?.displayName) {
      try {
        await updateProfile(cred.user, { displayName: profileData.displayName });
      } catch {}
    }
    const userProfile: FirebaseResolvedUserProfile = {
      uid: cred.user.uid,
      email: cred.user.email || email,
      displayName: profileData?.displayName || email.split('@')[0],
      role: profileData?.role || 'STUDENT',
      active: true,
      status: 'ACTIVE',
      departmentId: profileData?.departmentId || 'dept-cse',
      instituteId: profileData?.instituteId || 'inst-01',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    try {
      await firebaseUserService.saveUser({
        uid: cred.user.uid,
        email: cred.user.email || email,
        displayName: userProfile.displayName,
        role: userProfile.role,
        active: true,
        status: 'ACTIVE',
        departmentId: userProfile.departmentId,
        instituteId: userProfile.instituteId,
        createdAt: userProfile.createdAt,
        updatedAt: userProfile.updatedAt
      });
    } catch {}
    return { firebaseUser: cred.user, userProfile };
  }

  /**
   * Extract ERP role and claims from Firebase ID Token Result
   */
  public async getUserClaims(forceRefresh = false): Promise<ERPCustomClaims | null> {
    const user = auth.currentUser;
    if (!user) return null;
    try {
      const tokenResult: IdTokenResult = await user.getIdTokenResult(forceRefresh);
      return {
        role: tokenResult.claims.role as UserRole,
        roles: tokenResult.claims.roles as UserRole[] | undefined,
        departmentId: tokenResult.claims.departmentId as string | undefined,
        instituteId: tokenResult.claims.instituteId as string | undefined,
        studentId: tokenResult.claims.studentId as string | undefined,
        employeeId: tokenResult.claims.employeeId as string | undefined,
        parentStudentIds: tokenResult.claims.parentStudentIds as string[] | undefined,
        permissions: tokenResult.claims.permissions as string[] | undefined
      };
    } catch (err) {
      console.warn('[FirebaseAuthService] Could not retrieve ID token claims:', err);
      return null;
    }
  }

  /**
   * Obtain fresh ID token for backend Authorization header
   */
  public async getIdToken(forceRefresh = false): Promise<string | null> {
    const user = auth.currentUser;
    if (!user) return null;
    return user.getIdToken(forceRefresh);
  }

  /**
   * Centralized lookup: Firebase UID -> Firestore users/{uid} -> ERP User Profile
   */
  public async getUserByFirebaseUid(uid: string): Promise<FirebaseResolvedUserProfile | null> {
    try {
      const firestoreUser: FirestoreUser | null = await firebaseUserService.getUser(uid);
      if (!firestoreUser) return null;

      const profile: FirebaseResolvedUserProfile = {
        uid: firestoreUser.uid || uid,
        email: firestoreUser.email,
        displayName: firestoreUser.displayName || firestoreUser.email,
        role: firestoreUser.role,
        active: firestoreUser.active !== false && firestoreUser.status === 'ACTIVE',
        status: firestoreUser.status || (firestoreUser.active ? 'ACTIVE' : 'DISABLED'),
        employeeId: firestoreUser.employeeId,
        studentId: firestoreUser.studentId,
        parentStudentIds: firestoreUser.parentStudentIds,
        departmentId: firestoreUser.departmentId,
        instituteId: firestoreUser.instituteId,
        programId: firestoreUser.programId,
        semesterId: firestoreUser.semesterId,
        divisionId: firestoreUser.divisionId,
        mentorId: firestoreUser.mentorId,
        phone: firestoreUser.phone,
        avatar: firestoreUser.avatar,
        designation: firestoreUser.designation,
        customPermissions: firestoreUser.customPermissions,
        createdAt: firestoreUser.createdAt,
        updatedAt: firestoreUser.updatedAt
      };

      return profile;
    } catch (err) {
      console.error(`[FirebaseAuthService] Error resolving user by UID ${uid}:`, err);
      return null;
    }
  }

  /**
   * Check whether a role string matches any canonical ERP role
   */
  public isSupportedRole(role: string): role is UserRole {
    return SUPPORTED_ERP_ROLES.includes(role as UserRole);
  }

  /**
   * Sign out from Firebase Auth and clear session state
   */
  public async signOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (err) {
      console.warn('[FirebaseAuthService] Firebase signOut notice:', err);
    }
  }
}

export const firebaseAuthService = new FirebaseAuthService();
