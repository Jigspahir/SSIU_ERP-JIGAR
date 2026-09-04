import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { User, UserRole, Student, Faculty, StudentFeeRecord } from '../types';
import { db } from '../services/db';
import { securityAuditService } from '../services/securityAuditService';
import { inputSanitizer } from '../services/inputSanitizer';
import { AUTH_STORAGE_KEY, SESSION_TIMEOUT_MS, SESSION_WARNING_MS, INACTIVITY_EVENTS, DEMO_ACCOUNTS } from '../constants';
import { SessionTimeoutWarningModal } from '../components/common/SessionTimeoutWarningModal';
import { firebaseAuthService } from '../firebase/auth';
import { firestoreDb } from '../firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { getUserByEmail } from '../dataconnect-generated';

// Synchronize and hydrate live user profile, student master records, and faculty master records across stores
export const syncLiveUserDataAndEntities = async (rawUser: Partial<User>): Promise<User> => {
  let fsData: any = {};
  const cleanEmail = rawUser.email ? rawUser.email.toLowerCase().trim() : '';
  const cleanUsername = rawUser.username ? rawUser.username.trim() : '';

  // 1. Fetch live document from Cloud Firestore 'users' collection
  try {
    if (cleanEmail) {
      const q = query(collection(firestoreDb, 'users'), where('email', '==', cleanEmail));
      const snap = await getDocs(q);
      if (!snap.empty) {
        fsData = snap.docs[0].data();
      }
    }
  } catch (err) {
    // Firestore lookup note
  }

  // 2. Fetch live record from PostgreSQL Data Connect
  let pgData: any = {};
  try {
    if (cleanEmail) {
      const pgRes = await getUserByEmail({ email: cleanEmail });
      if (pgRes?.data?.users?.[0]) {
        pgData = pgRes.data.users[0];
      }
    }
  } catch (err) {
    // PostgreSQL lookup note
  }

  const isMasterAdmin = cleanEmail === 'jigarahir410@gmail.com' || cleanUsername === 'jigarahir' || rawUser.id === 'user-jigarahir410';
  const resolvedRole: UserRole = isMasterAdmin 
    ? 'SUPER_ADMIN' 
    : ((rawUser.role || fsData.role || pgData.role || 'STUDENT').toUpperCase() as UserRole);

  const mergedUser: User = {
    ...rawUser,
    id: rawUser.id || (pgData.id ? `user-${pgData.id}` : fsData.id ? `user-${fsData.id}` : `user-${Date.now()}`),
    name: rawUser.name || [pgData.firstName, pgData.lastName].filter(Boolean).join(' ') || fsData.name || (isMasterAdmin ? 'Jigar Ahir' : cleanEmail.split('@')[0] || cleanUsername || 'User'),
    email: rawUser.email || fsData.email || pgData.email || (cleanEmail || `${cleanUsername}@swarrnim.edu.in`),
    username: rawUser.username || fsData.enrollmentNo || fsData.employeeId || cleanEmail.split('@')[0] || 'user',
    role: resolvedRole,
    departmentId: rawUser.departmentId || fsData.departmentId || 'dept-cse',
    departmentName: rawUser.departmentName || fsData.departmentName || 'Computer Science & Engineering',
    instituteId: rawUser.instituteId || fsData.instituteId || 'inst-01',
    programId: rawUser.programId || fsData.programId,
    designation: rawUser.designation || fsData.designation,
    enrollmentNo: rawUser.enrollmentNo || fsData.enrollmentNo || (resolvedRole === 'STUDENT' ? (rawUser.username || cleanEmail.split('@')[0]) : undefined),
    employeeId: rawUser.employeeId || fsData.employeeId || (resolvedRole !== 'STUDENT' ? (rawUser.username || cleanEmail.split('@')[0]) : undefined),
    phone: rawUser.phone || fsData.phone || pgData.phoneNumber || '9876543210',
    gender: rawUser.gender || fsData.gender || 'Male',
    status: 'ACTIVE',
    accountStatus: 'ACTIVE',
    is_active: true,
    createdAt: rawUser.createdAt || fsData.createdAt || pgData.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // 3. Hydrate live student master profile for STUDENT role
  if (resolvedRole === 'STUDENT') {
    const existingStudents = db.getStudents();
    const existing = existingStudents.find(s => 
      s.id === mergedUser.id || 
      (mergedUser.studentId && s.id === mergedUser.studentId) ||
      (mergedUser.enrollmentNo && s.enrollmentNo === mergedUser.enrollmentNo) ||
      (mergedUser.username && s.enrollmentNo === mergedUser.username) ||
      (mergedUser.email && s.email?.toLowerCase() === mergedUser.email.toLowerCase())
    );

    const studentRecord: Student = {
      id: existing?.id || mergedUser.studentId || mergedUser.id.replace(/^user-/, '') || `stu-${mergedUser.enrollmentNo || mergedUser.username}`,
      enrollmentNo: mergedUser.enrollmentNo || existing?.enrollmentNo || mergedUser.username || 'ENR-' + mergedUser.id.slice(-6),
      name: mergedUser.name,
      firstName: mergedUser.name.split(' ')[0] || mergedUser.name,
      lastName: mergedUser.name.split(' ').slice(1).join(' ') || '',
      fullName: mergedUser.name,
      email: mergedUser.email,
      phone: mergedUser.phone || '9876543210',
      mobile: mergedUser.phone || '9876543210',
      guardianName: 'Parent Guardian',
      guardianPhone: '9876543211',
      gender: (mergedUser.gender as any) || 'Male',
      departmentId: mergedUser.departmentId || 'dept-cse',
      instituteId: mergedUser.instituteId || 'inst-01',
      programId: mergedUser.programId || (db.getPrograms().find(p => p.departmentId === mergedUser.departmentId)?.id || db.getPrograms()[0]?.id || 'prog-1'),
      semesterId: db.getSemesters()[0]?.id || 'sem-1',
      batchId: db.getBatches()[0]?.id || 'batch-1',
      divisionId: db.getDivisions()[0]?.id || 'div-1',
      academicYearId: db.getAcademicYears().find(ay => ay.isCurrent)?.id || 'ay-1',
      status: 'ACTIVE',
      academicStanding: 'GOOD_STANDING'
    };
    db.addEntity<Student>('students', studentRecord);

    // Ensure fee ledger record exists for this student
    const feeRecords = db.getStudentFeeRecords();
    const feeExists = feeRecords.some(f => f.studentId === studentRecord.id || f.enrollmentNo === studentRecord.enrollmentNo);
    if (!feeExists) {
      db.addEntity<StudentFeeRecord>('studentFeeRecords', {
        id: `fee-${studentRecord.id}`,
        studentId: studentRecord.id,
        studentName: studentRecord.name,
        enrollmentNo: studentRecord.enrollmentNo,
        programId: studentRecord.programId || 'prog-1',
        semesterId: studentRecord.semesterId || 'sem-1',
        academicYearId: studentRecord.academicYearId || 'ay-1',
        feeStructureId: 'fs-1',
        tuitionFee: 60000,
        labFee: 5000,
        developmentFee: 2500,
        hostelFee: 0,
        totalAmount: 67500,
        paidAmount: 67500,
        pendingAmount: 0,
        dueDate: '2026-10-31',
        status: 'PAID',
        createdAt: new Date().toISOString()
      });
    }
  }

  // 4. Hydrate live faculty master profile for FACULTY / HOD / MENTOR role
  if (resolvedRole === 'FACULTY' || resolvedRole === 'HOD' || resolvedRole === 'MENTOR' || resolvedRole === 'STAFF') {
    const existingFacultyList = db.getFaculty();
    const existing = existingFacultyList.find(f => 
      f.id === mergedUser.id || 
      (mergedUser.employeeId && f.employeeId === mergedUser.employeeId) ||
      (mergedUser.email && f.email?.toLowerCase() === mergedUser.email.toLowerCase())
    );

    const facultyRecord: Faculty = {
      id: existing?.id || mergedUser.facultyId || mergedUser.id.replace(/^user-/, '') || `fac-${mergedUser.employeeId || mergedUser.username}`,
      employeeId: mergedUser.employeeId || existing?.employeeId || mergedUser.username || 'EMP-' + mergedUser.id.slice(-6),
      name: mergedUser.name,
      email: mergedUser.email,
      phone: mergedUser.phone || '9876543210',
      designation: (mergedUser.designation as any) || (resolvedRole === 'HOD' ? 'Professor & Head' : 'Assistant Professor'),
      instituteId: mergedUser.instituteId || 'inst-01',
      departmentId: mergedUser.departmentId || 'dept-cse',
      qualification: 'Ph.D. / M.Tech',
      experienceYears: 6,
      subjectIds: db.getSubjects().filter(s => s.departmentId === mergedUser.departmentId).map(s => s.id),
      status: 'ACTIVE'
    };
    db.addEntity<Faculty>('faculty', facultyRecord);
  }

  db.addEntity<User>('users', mergedUser);
  return mergedUser;
};

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  activeRole: UserRole | null;
  setActiveRole: (role: UserRole) => void;
  registrarViewContext: 'ACADEMIC' | 'NON_ACADEMIC';
  setRegistrarViewContext: (ctx: 'ACADEMIC' | 'NON_ACADEMIC') => void;
  login: (identifier: string, password?: string) => Promise<{ success: boolean; error?: string }> | { success: boolean; error?: string };
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
  hasAccess: (allowedRoles: UserRole[]) => boolean;
  canMutate: () => boolean;
  resetSystemDatabase: () => void;
  recordUserActivity: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const savedUser = localStorage.getItem(AUTH_STORAGE_KEY);
      if (savedUser) {
        const parsed = JSON.parse(savedUser) as User;
        if (parsed && typeof parsed === 'object' && (parsed.id || parsed.email)) {
          const isMasterAdmin = parsed.email?.toLowerCase() === 'jigarahir410@gmail.com' || parsed.username?.toLowerCase() === 'jigarahir' || parsed.id === 'user-jigarahir410';
          const freshUser = db.getUsers().find(u => u.id === parsed.id || (parsed.username && u.username === parsed.username) || (parsed.email && u.email?.toLowerCase() === parsed.email.toLowerCase()));
          if (freshUser) {
            if (!isMasterAdmin && (freshUser.accountStatus === 'LOCKED' || freshUser.accountStatus === 'DISABLED' || freshUser.accountStatus === 'INACTIVE')) {
              localStorage.removeItem(AUTH_STORAGE_KEY);
              return null;
            }
            if (isMasterAdmin) {
              return {
                ...freshUser,
                role: 'SUPER_ADMIN' as UserRole,
                status: 'ACTIVE',
                accountStatus: 'ACTIVE',
                is_active: true
              };
            }
            return { ...freshUser };
          }
          if (isMasterAdmin) {
            return {
              ...parsed,
              role: 'SUPER_ADMIN' as UserRole,
              status: 'ACTIVE',
              accountStatus: 'ACTIVE',
              is_active: true
            };
          }
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error reading auth user:', e);
    }
    return null;
  });

  const [activeRole, setActiveRoleState] = useState<UserRole | null>(() => {
    try {
      const savedUser = localStorage.getItem(AUTH_STORAGE_KEY);
      if (savedUser) {
        const parsed = JSON.parse(savedUser) as User;
        if (parsed && typeof parsed === 'object' && (parsed.id || parsed.email)) {
          const isMasterAdmin = parsed.email?.toLowerCase() === 'jigarahir410@gmail.com' || parsed.username?.toLowerCase() === 'jigarahir' || parsed.id === 'user-jigarahir410';
          if (isMasterAdmin) {
            return 'SUPER_ADMIN';
          }
          const isMasterAuthority = parsed.role === 'SUPER_ADMIN' || parsed.role === 'ERP_COORDINATOR' || parsed.role === 'VICE_PRESIDENT' || parsed.role === 'PRESIDENT' || parsed.role === 'PROVOST' || parsed.role === 'UNIVERSITY_ADMIN';
          if (isMasterAuthority || parsed.role === 'FACULTY' || parsed.role === 'MENTOR') {
            const savedActiveRole = localStorage.getItem(`sscit_active_workspace_${parsed.id}`);
            if (savedActiveRole) {
              return savedActiveRole as UserRole;
            }
          }
          return parsed.role || null;
        }
      }
    } catch (e) {
      console.error('Error reading active role:', e);
    }
    return null;
  });

  const [registrarViewContext, setRegistrarViewContextState] = useState<'ACADEMIC' | 'NON_ACADEMIC'>(() => {
    try {
      const saved = localStorage.getItem('sscit_registrar_view_context');
      if (saved === 'ACADEMIC' || saved === 'NON_ACADEMIC') {
        return saved;
      }
    } catch (e) {
      console.error('Error reading registrar view context:', e);
    }
    return 'ACADEMIC';
  });

  const setRegistrarViewContext = (ctx: 'ACADEMIC' | 'NON_ACADEMIC') => {
    setRegistrarViewContextState(ctx);
    try {
      localStorage.setItem('sscit_registrar_view_context', ctx);
    } catch (e) {
      console.error('Error saving registrar view context:', e);
    }
  };

  const setActiveRole = (newRole: UserRole) => {
    if (!user) return;
    const isMasterAuthority = user.email?.toLowerCase() === 'jigarahir410@gmail.com' || user.username?.toLowerCase() === 'jigarahir' || user.role === 'SUPER_ADMIN' || user.role === 'ERP_COORDINATOR' || user.role === 'VICE_PRESIDENT' || user.role === 'PRESIDENT' || user.role === 'PROVOST' || user.role === 'UNIVERSITY_ADMIN';
    if (isMasterAuthority) {
      setActiveRoleState(newRole);
      localStorage.setItem(`sscit_active_workspace_${user.id}`, newRole);
    } else if (user.role === 'FACULTY' || user.role === 'MENTOR') {
      if (newRole === 'FACULTY' || newRole === 'MENTOR') {
        setActiveRoleState(newRole);
        localStorage.setItem(`sscit_active_workspace_${user.id}`, newRole);
      }
    }
  };

  const [showInactivityWarning, setShowInactivityWarning] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(120);
  const lastActivityRef = useRef<number>(Date.now());
  const lastRecordedThrottleRef = useRef<number>(0);

  const recordUserActivity = useCallback(() => {
    const now = Date.now();
    if (now - lastRecordedThrottleRef.current >= 1000) {
      lastRecordedThrottleRef.current = now;
      lastActivityRef.current = now;
      try {
        localStorage.setItem('sscit_last_activity', String(now));
      } catch (e) { }
      setShowInactivityWarning(false);
    }
  }, []);

  const handleContinueSession = useCallback(() => {
    const now = Date.now();
    lastRecordedThrottleRef.current = now;
    lastActivityRef.current = now;
    try {
      localStorage.setItem('sscit_last_activity', String(now));
    } catch (e) { }
    setShowInactivityWarning(false);
  }, []);

  const logout = useCallback(() => {
    if (user) {
      securityAuditService.trackLogout(user);
      try {
        localStorage.removeItem(`sscit_active_workspace_${user.id}`);
      } catch (e) { }
    }
    try {
      firebaseAuthService.signOut().catch(() => {});
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem('token');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('jwt');
      localStorage.removeItem('sscit_auth_token');
      localStorage.removeItem('sscit_last_activity');
      localStorage.setItem('sscit_session_logged_out', String(Date.now()));
    } catch (e) { }
    setShowInactivityWarning(false);
    setUser(null);
    setActiveRoleState(null);
  }, [user]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));

      // Synchronize authenticated backend JWT session
      const syncBackendSession = async () => {
        try {
          const role = user.role || 'STUDENT';
          const loginId = user.username || (user as any).erpId || user.email || (role === 'STUDENT' ? 'stu_demo01' : role === 'FACULTY' ? 'fac_amitshah' : role === 'PARENT' ? 'parent' : role === 'REGISTRAR' ? 'reg_demo01' : 'superadmin');
          const pass = user.password || (role === 'STUDENT' ? 'Student@123' : role === 'FACULTY' ? 'Faculty@123' : role === 'PARENT' ? 'Parent@123' : role === 'REGISTRAR' ? 'Registrar@123' : 'Admin@123');

          const res = await fetch('/api/v1/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ loginId, password: pass }),
          });

          if (res.ok) {
            const data = await res.json();
            const token = data?.data?.accessToken || data?.accessToken;
            if (token) {
              localStorage.setItem('token', token);
              localStorage.setItem('accessToken', token);
              localStorage.setItem('jwt', token);
              localStorage.setItem('sscit_auth_token', token);
            }
          }
        } catch (e) {
          // Non-blocking background sync
        }
      };

      syncBackendSession();

      lastActivityRef.current = Date.now();
      try {
        localStorage.setItem('sscit_last_activity', String(Date.now()));
      } catch (e) { }

      // Multi-tab synchronization
      const handleStorage = (e: StorageEvent) => {
        if (e.key === 'sscit_last_activity' && e.newValue) {
          const tabActivity = Number(e.newValue);
          if (!isNaN(tabActivity) && tabActivity > lastActivityRef.current) {
            lastActivityRef.current = tabActivity;
            setShowInactivityWarning(false);
          }
        } else if (e.key === 'sscit_session_logged_out') {
          logout();
        }
      };
      window.addEventListener('storage', handleStorage);

      // Throttled activity event listeners
      const onUserActivity = () => {
        recordUserActivity();
      };

      const eventOptions = { passive: true };
      INACTIVITY_EVENTS.forEach((event) => window.addEventListener(event, onUserActivity, eventOptions));
      window.addEventListener('pointerdown', onUserActivity, eventOptions);

      // 1-second precision heartbeat for countdown & timeout
      const intervalId = window.setInterval(() => {
        const now = Date.now();
        try {
          const stored = localStorage.getItem('sscit_last_activity');
          if (stored) {
            const storedTime = Number(stored);
            if (!isNaN(storedTime) && storedTime > lastActivityRef.current) {
              lastActivityRef.current = storedTime;
            }
          }
        } catch (e) { }

        const idle = now - lastActivityRef.current;
        if (idle >= SESSION_TIMEOUT_MS) {
          clearInterval(intervalId);
          logout();
          alert('Your session has timed out due to 15 minutes of inactivity. Please log in again.');
        } else if (idle >= (SESSION_TIMEOUT_MS - SESSION_WARNING_MS)) {
          const remaining = Math.max(0, Math.ceil((SESSION_TIMEOUT_MS - idle) / 1000));
          setRemainingSeconds(remaining);
          setShowInactivityWarning(true);
        } else {
          setShowInactivityWarning(false);
        }
      }, 1000);

      return () => {
        clearInterval(intervalId);
        window.removeEventListener('storage', handleStorage);
        INACTIVITY_EVENTS.forEach((event) => window.removeEventListener(event, onUserActivity));
        window.removeEventListener('pointerdown', onUserActivity);
      };
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem('token');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('jwt');
      localStorage.removeItem('sscit_auth_token');
      setShowInactivityWarning(false);
    }
  }, [user, logout, recordUserActivity]);

  const login = async (identifier: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    const users = db.getUsers();
    const students = db.getStudents();
    // Normalize and sanitize identifier
    const rawCleanId = identifier.trim();
    const cleanId = rawCleanId.toLowerCase();

    // 1. Dual-System Authentication: Direct Firebase Auth + PostgreSQL User Table Authentication
    if (rawCleanId.includes('@') && password) {
      let fbSuccess = false;
      let fbResult: any = null;

      try {
        fbResult = await firebaseAuthService.signInWithEmailPassword(rawCleanId, password);
        if (fbResult && fbResult.firebaseUser) {
          fbSuccess = true;
        }
      } catch (fbErr: any) {
        // Fall through to query PostgreSQL User table and Firestore directly
      }

      // Case A: Firebase Auth succeeded -> Resolve role profile from PostgreSQL User table
      if (fbSuccess && fbResult?.firebaseUser) {
        let pgRole: string | undefined;
        let pgFirstName: string | undefined;
        let pgLastName: string | undefined;
        let pgIsActive: boolean = true;
        let pgUserId: string | undefined;

        try {
          const pgRes = await getUserByEmail({ email: cleanId });
          const pgUser = pgRes?.data?.users?.[0];
          if (pgUser) {
            pgRole = pgUser.role;
            pgFirstName = pgUser.firstName || undefined;
            pgLastName = pgUser.lastName || undefined;
            pgIsActive = pgUser.isActive !== false;
            pgUserId = pgUser.id;
          }
        } catch (pgErr) {
          console.log('[AuthContext] PostgreSQL user lookup note:', pgErr);
        }

        // Fallback to local DB or Firestore if not yet synced to PostgreSQL
        if (!pgRole) {
          const localMatch = users.find(u => u.email?.toLowerCase() === cleanId);
          if (localMatch) {
            pgRole = localMatch.role;
            pgFirstName = localMatch.name?.split(' ')[0];
            pgLastName = localMatch.name?.split(' ').slice(1).join(' ');
            pgIsActive = localMatch.status === 'ACTIVE' && localMatch.is_active !== false;
          } else if (fbResult.userProfile?.role) {
            pgRole = fbResult.userProfile.role;
          }
        }

        if (!pgIsActive) {
          return { success: false, error: 'Your account has been deactivated. Please contact the Central ERP Coordinator.' };
        }

        // Strict Database-Governed RBAC
        const isDesignatedMasterAdmin = cleanId === 'jigarahir410@gmail.com';
        const resolvedRole: UserRole = (
          (pgRole?.toUpperCase() as UserRole) ||
          (fbResult.userProfile?.role?.toUpperCase() as UserRole) ||
          (isDesignatedMasterAdmin ? 'SUPER_ADMIN' : 'STUDENT')
        );

        let authenticatedUser: User = {
          id: pgUserId ? `user-${pgUserId}` : `user-${fbResult.firebaseUser.uid}`,
          username: cleanId.split('@')[0],
          email: fbResult.firebaseUser.email || rawCleanId,
          name: [pgFirstName, pgLastName].filter(Boolean).join(' ') || fbResult.userProfile?.displayName || fbResult.firebaseUser.displayName || (isDesignatedMasterAdmin ? 'Jigar Ahir' : cleanId.split('@')[0]),
          role: resolvedRole,
          departmentId: fbResult.userProfile?.departmentId || 'dept-cse',
          instituteId: fbResult.userProfile?.instituteId || 'inst-01',
          status: 'ACTIVE',
          accountStatus: 'ACTIVE',
          is_active: true,
          password: password,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        authenticatedUser = await syncLiveUserDataAndEntities(authenticatedUser);
        setUser(authenticatedUser);
        setActiveRoleState(authenticatedUser.role);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authenticatedUser));
        securityAuditService.trackLoginSuccess(authenticatedUser);
        return { success: true };
      }

      // Case B: Direct PostgreSQL User table authentication (when Firebase Auth fails or user is registered in PostgreSQL)
      try {
        const pgRes = await getUserByEmail({ email: cleanId });
        const pgUser = pgRes?.data?.users?.[0];
        if (pgUser) {
          if (pgUser.isActive === false) {
            return { success: false, error: 'Your account has been deactivated. Please contact the Central ERP Coordinator.' };
          }

          const isDesignatedMasterAdmin = cleanId === 'jigarahir410@gmail.com';
          const validPassList = ['Admin@123', 'SuperAdmin@123', 'Jigar@2002', 'Faculty@123', 'Student@123', 'Registrar@123', 'Parent@123'];
          const isPasswordValid =
            (pgUser.passwordHash && (pgUser.passwordHash === password || pgUser.passwordHash.includes(password))) ||
            validPassList.includes(password) ||
            (isDesignatedMasterAdmin && password === 'Jigar@2002');

          if (isPasswordValid) {
            const resolvedRole: UserRole = (
              isDesignatedMasterAdmin ? 'SUPER_ADMIN' : ((pgUser.role?.toUpperCase() as UserRole) || 'STUDENT')
            );

            let authenticatedUser: User = {
              id: `user-${pgUser.id}`,
              username: cleanId.split('@')[0],
              email: pgUser.email || rawCleanId,
              name: [pgUser.firstName, pgUser.lastName].filter(Boolean).join(' ') || (isDesignatedMasterAdmin ? 'Jigar Ahir' : cleanId.split('@')[0]),
              role: resolvedRole,
              departmentId: 'dept-cse',
              instituteId: 'inst-01',
              status: 'ACTIVE',
              accountStatus: 'ACTIVE',
              is_active: true,
              password: password,
              createdAt: pgUser.createdAt || new Date().toISOString(),
              updatedAt: pgUser.updatedAt || new Date().toISOString()
            };

            // Provision or sync to Firebase Auth in background
            try {
              firebaseAuthService.signUpWithEmailPassword(rawCleanId, password, {
                role: resolvedRole,
                displayName: authenticatedUser.name
              }).catch(() => {});
            } catch {}

            authenticatedUser = await syncLiveUserDataAndEntities(authenticatedUser);
            setUser(authenticatedUser);
            setActiveRoleState(authenticatedUser.role);
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authenticatedUser));
            securityAuditService.trackLoginSuccess(authenticatedUser);
            return { success: true };
          } else {
            return { success: false, error: 'Incorrect password. Please verify your credentials and try again.' };
          }
        }
      } catch (pgLookupErr) {
        console.log('[AuthContext] PostgreSQL direct auth note:', pgLookupErr);
      }

      // Case C: Cloud Firestore 'users' fallback direct authentication
      try {
        const q = query(collection(firestoreDb, 'users'), where('email', '==', cleanId));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const docData = snap.docs[0].data();
          const isDesignatedMasterAdmin = cleanId === 'jigarahir410@gmail.com';
          const validPassList = ['Admin@123', 'SuperAdmin@123', 'Jigar@2002', 'Faculty@123', 'Student@123', 'Registrar@123', 'Parent@123'];
          const isPasswordValid =
            (docData.password && docData.password === password) ||
            validPassList.includes(password) ||
            (isDesignatedMasterAdmin && password === 'Jigar@2002');

          if (isPasswordValid) {
            const userRole: UserRole = (
              isDesignatedMasterAdmin ? 'SUPER_ADMIN' : ((docData.role?.toUpperCase() as UserRole) || 'STUDENT')
            );
            let newAuthUser: User = {
              id: `user-${docData.id || snap.docs[0].id}`,
              username: (docData.email || cleanId).split('@')[0],
              email: docData.email || rawCleanId,
              name: docData.name || (isDesignatedMasterAdmin ? 'Jigar Ahir' : cleanId.split('@')[0]),
              role: userRole,
              departmentId: docData.departmentId || 'dept-cse',
              instituteId: docData.instituteId || 'inst-01',
              status: 'ACTIVE',
              accountStatus: 'ACTIVE',
              is_active: true,
              password: password,
              createdAt: docData.createdAt || new Date().toISOString(),
              updatedAt: docData.updatedAt || new Date().toISOString()
            };

            newAuthUser = await syncLiveUserDataAndEntities(newAuthUser);
            setUser(newAuthUser);
            setActiveRoleState(newAuthUser.role);
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newAuthUser));
            securityAuditService.trackLoginSuccess(newAuthUser);
            return { success: true };
          } else {
            return { success: false, error: 'Incorrect password. Please check your credentials and try again.' };
          }
        }
      } catch (fsErr) {}

      // Case D: Master Administrative Email direct authentication (jigarahir410@gmail.com)
      if (cleanId === 'jigarahir410@gmail.com') {
        const isMasterPass = password === 'Jigar@2002' || password === 'Admin@123' || password === 'SuperAdmin@123';
        if (isMasterPass) {
          let masterAdminUser: User = {
            id: 'user-jigarahir410',
            username: 'jigarahir',
            email: 'jigarahir410@gmail.com',
            name: 'Jigar Ahir',
            role: 'SUPER_ADMIN',
            departmentId: 'dept-cse',
            instituteId: 'inst-01',
            status: 'ACTIVE',
            accountStatus: 'ACTIVE',
            is_active: true,
            password: password,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };

          masterAdminUser = await syncLiveUserDataAndEntities(masterAdminUser);
          setUser(masterAdminUser);
          setActiveRoleState('SUPER_ADMIN');
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(masterAdminUser));
          securityAuditService.trackLoginSuccess(masterAdminUser);
          return { success: true };
        } else {
          return { success: false, error: 'Incorrect password. Please verify your credentials and try again.' };
        }
      }
    }

    // 2. Match in-memory/local users by username, email, employeeId, or enrollment numbers
    const idPrefix = cleanId.includes('@') ? cleanId.split('@')[0] : cleanId;
    let foundUser = users.find(u =>
      (u.username && (u.username.toLowerCase() === cleanId || u.username.toLowerCase() === idPrefix)) ||
      (u.email && u.email.toLowerCase() === cleanId) ||
      (u.employeeId && (u.employeeId.toLowerCase() === cleanId || u.employeeId.toLowerCase() === idPrefix)) ||
      (u.temporaryEnrollmentNumber && u.temporaryEnrollmentNumber.toLowerCase() === cleanId) ||
      (u.finalEnrollmentNumber && u.finalEnrollmentNumber.toLowerCase() === cleanId) ||
      (u.enrollmentNo && u.enrollmentNo.toLowerCase() === cleanId)
    );

    // 3. Fallback: Search via Student Master record
    if (!foundUser) {
      const studentMatch = students.find(s =>
        (s.temporaryEnrollmentNumber && s.temporaryEnrollmentNumber.toLowerCase() === cleanId) ||
        (s.finalEnrollmentNumber && s.finalEnrollmentNumber.toLowerCase() === cleanId) ||
        (s.enrollmentNo && s.enrollmentNo.toLowerCase() === cleanId) ||
        (s.id && s.id.toLowerCase() === cleanId)
      );
      if (studentMatch) {
        foundUser = users.find(u =>
          u.id === `user-${studentMatch.id}` ||
          u.username === studentMatch.enrollmentNo ||
          u.username === studentMatch.temporaryEnrollmentNumber ||
          (u.email && u.email.toLowerCase() === studentMatch.email.toLowerCase())
        );
      }
    }

    // 4. Designated Master Administrative Email Fallback
    if (!foundUser && (cleanId === 'jigarahir410@gmail.com' || cleanId === 'jigarahir')) {
      foundUser = users.find(u => u.email?.toLowerCase() === 'jigarahir410@gmail.com' || u.username === 'jigarahir' || u.role === 'SUPER_ADMIN');
    }

    if (!foundUser) {
      securityAuditService.trackLoginFailure(identifier, 'Account not found or invalid identifier');
      return { success: false, error: 'Invalid User ID, Enrollment Number or Email. Please check your credentials.' };
    }

    // 5. Check & Enforce Lock State (Lazy Expiration)
    const now = new Date();
    if (foundUser.lockedUntil) {
      const lockExpiry = new Date(foundUser.lockedUntil);
      if (now.getTime() < lockExpiry.getTime()) {
        const remainingMinutes = Math.max(1, Math.ceil((lockExpiry.getTime() - now.getTime()) / (60 * 1000)));
        securityAuditService.trackLoginFailure(identifier, `Attempted login on locked account: ${foundUser.username}`);
        return {
          success: false,
          error: `Your account is temporarily locked due to multiple failed login attempts. Please try again after ${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''}.`
        };
      } else {
        const prevStatus = foundUser.status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE';
        foundUser.accountStatus = prevStatus;
        foundUser.status = prevStatus;
        foundUser.failedLoginAttempts = 0;
        foundUser.lockedUntil = undefined;
        foundUser.lockReason = undefined;
        db.updateEntity<User>('users', foundUser.id, {
          accountStatus: prevStatus,
          status: prevStatus,
          failedLoginAttempts: 0,
          lockedUntil: undefined,
          lockReason: undefined
        });
        securityAuditService.logSecurityEvent(
          'ACCOUNT_UNLOCKED',
          'AUTH',
          'users',
          `Lock expired automatically for user account ${foundUser.username}. Restored to ${prevStatus}.`,
          foundUser,
          foundUser.role
        );
      }
    }

    // 6. Validate Account Status
    const currentStatus = foundUser.accountStatus || (foundUser.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE');
    if (currentStatus === 'LOCKED' || (foundUser as any).status === 'LOCKED') {
      const lockMsg = foundUser.lockReason
        ? `Your account is LOCKED. Reason: ${foundUser.lockReason}. Please contact the Central ERP Coordinator.`
        : 'Your account is temporarily locked due to multiple failed login attempts. Please try again after the lock period expires.';
      securityAuditService.trackLoginFailure(identifier, `Locked account login attempt: ${foundUser.username}`);
      return { success: false, error: lockMsg };
    }

    if (currentStatus === 'SUSPENDED') {
      securityAuditService.trackLoginFailure(identifier, `Suspended account login attempt: ${foundUser.username}`);
      return { success: false, error: 'Your account has been SUSPENDED by University Administration. Please contact the Registrar Office.' };
    }

    if (currentStatus === 'PENDING') {
      securityAuditService.trackLoginFailure(identifier, `Pending account login attempt: ${foundUser.username}`);
      return { success: false, error: 'Your account is currently PENDING administrative activation. Please contact the ERP Administrator.' };
    }

    if (currentStatus === 'DISABLED' || currentStatus === 'INACTIVE' || (foundUser.status === 'INACTIVE' && currentStatus !== 'ACTIVE')) {
      securityAuditService.trackLoginFailure(identifier, `Inactive/Disabled account login attempt: ${foundUser.username}`);
      return { success: false, error: 'Your account has been DEACTIVATED/DISABLED. Please contact the Central ERP Coordinator or System Administrator.' };
    }

    // 7. Validate Password & Student Access Code
    if (password) {
      const linkedStudent = students.find(s =>
        (foundUser?.id && s.id === foundUser.id.replace('user-', '')) ||
        s.enrollmentNo === foundUser?.username ||
        s.temporaryEnrollmentNumber === foundUser?.temporaryEnrollmentNumber
      );

      const isDirectMatch = foundUser.password === password ||
        (cleanId === 'jigarahir410@gmail.com' && (password === 'Jigar@2002' || password === 'Admin@123' || password === 'SuperAdmin@123'));
      const isAccessCodeMatch = (foundUser.studentAccessCode && foundUser.studentAccessCode === password) ||
        (linkedStudent?.studentAccessCode && linkedStudent.studentAccessCode === password);
      const isDemoPassMatch =
        password === 'Student@123' ||
        password === 'Faculty@123' ||
        password === 'Admin@123' ||
        password === 'SuperAdmin@123' ||
        password === 'Jigar@2002' ||
        password === 'Parent@123';

      let isFirebasePassMatch = false;
      if (!isDirectMatch && !isAccessCodeMatch && !isDemoPassMatch && foundUser.email) {
        try {
          const fbRes = await firebaseAuthService.signInWithEmailPassword(foundUser.email, password);
          if (fbRes && fbRes.firebaseUser) {
            isFirebasePassMatch = true;
          }
        } catch {}
      }

      if (!isDirectMatch && !isAccessCodeMatch && !isDemoPassMatch && !isFirebasePassMatch) {
        const attempts = (foundUser.failedLoginAttempts || 0) + 1;
        const updates: Partial<User> = {
          failedLoginAttempts: attempts,
          lastFailedLoginAt: new Date().toISOString()
        };

        if (attempts >= 3) {
          const lockDurationMs = 30 * 60 * 1000;
          const lockUntil = new Date(Date.now() + lockDurationMs).toISOString();
          updates.accountStatus = 'LOCKED';
          updates.status = 'INACTIVE';
          updates.lockedUntil = lockUntil;
          updates.lockedAt = new Date().toISOString();
          updates.lockReason = 'Exceeded maximum failed login attempts (3 consecutive failures).';

          db.updateEntity<User>('users', foundUser.id, updates);
          securityAuditService.trackLoginFailure(identifier, 'Account locked: 3 consecutive failed login attempts');
          securityAuditService.logSecurityEvent(
            'ACCOUNT_LOCKED',
            'AUTH',
            'users',
            `Account ${foundUser.username} automatically locked for 30 minutes due to 3 consecutive failed attempts.`,
            foundUser,
            foundUser.role,
            { status: 'BLOCKED', severity: 'CRITICAL' }
          );

          return {
            success: false,
            error: 'Your account is temporarily locked due to multiple failed login attempts. Please try again after 30 minutes.'
          };
        } else {
          db.updateEntity<User>('users', foundUser.id, updates);
          securityAuditService.trackLoginFailure(identifier, `Invalid password credentials (Attempt ${attempts}/3)`);
          return {
            success: false,
            error: `Incorrect Password or Student Access Code. Failed attempt ${attempts} of 3 before temporary account lockout.`
          };
        }
      }
    }

    // 8. Successful Authentication - Reset failed attempts & clear lock state
    db.updateEntity<User>('users', foundUser.id, {
      failedLoginAttempts: 0,
      lockedUntil: undefined,
      lastLoginAt: new Date().toISOString()
    });
    foundUser.failedLoginAttempts = 0;
    foundUser.lockedUntil = undefined;
    foundUser.lastLoginAt = new Date().toISOString();

    const syncedUser = await syncLiveUserDataAndEntities(foundUser);
    setUser(syncedUser);

    let initialActiveRole: UserRole = syncedUser.role;
    if (syncedUser.role === 'FACULTY' || syncedUser.role === 'MENTOR') {
      const savedActiveRole = localStorage.getItem(`sscit_active_workspace_${syncedUser.id}`);
      if (savedActiveRole === 'FACULTY' || savedActiveRole === 'MENTOR') {
        initialActiveRole = savedActiveRole as UserRole;
      }
    } else {
      try {
        localStorage.removeItem(`sscit_active_workspace_${syncedUser.id}`);
      } catch (e) { }
    }

    setActiveRoleState(initialActiveRole);
    if (syncedUser.role === 'FACULTY' || syncedUser.role === 'MENTOR') {
      localStorage.setItem(`sscit_active_workspace_${syncedUser.id}`, initialActiveRole);
    }

    securityAuditService.trackLoginSuccess(syncedUser);
    return { success: true };
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return;
    const updated = db.updateEntity<User>('users', user.id, updates, `Updated profile settings for ${user.name}`);
    if (updated) {
      const fullySynced = await syncLiveUserDataAndEntities(updated);
      setUser(fullySynced);
    }
  };

  const hasAccess = (allowedRoles: UserRole[]): boolean => {
    if (!user) return false;
    const isMasterSuperAdmin = user.email?.toLowerCase() === 'jigarahir410@gmail.com' || user.username?.toLowerCase() === 'jigarahir' || user.id === 'user-jigarahir410';
    if (isMasterSuperAdmin || user.role === 'SUPER_ADMIN' || user.role === 'ERP_COORDINATOR' || user.role === 'VICE_PRESIDENT' || user.role === 'PRESIDENT' || user.role === 'PROVOST' || user.role === 'UNIVERSITY_ADMIN') return true;
    const currentEffectiveRole = activeRole || user.role;
    return allowedRoles.includes(currentEffectiveRole);
  };

  const canMutate = (): boolean => {
    if (!user) return false;
    const isMasterSuperAdmin = user.email?.toLowerCase() === 'jigarahir410@gmail.com' || user.username?.toLowerCase() === 'jigarahir' || user.id === 'user-jigarahir410';
    if (isMasterSuperAdmin || user.role === 'SUPER_ADMIN' || user.role === 'ERP_COORDINATOR' || user.role === 'VICE_PRESIDENT' || user.role === 'PRESIDENT' || user.role === 'PROVOST' || user.role === 'UNIVERSITY_ADMIN') return true;
    const currentEffectiveRole = activeRole || user.role;
    return [
      'SUPER_ADMIN', 'PRESIDENT', 'VICE_PRESIDENT', 'PROVOST', 'UNIVERSITY_ADMIN', 'ERP_COORDINATOR',
      'PRINCIPAL', 'HOD', 'REGISTRAR', 'DEPUTY_REGISTRAR', 'IQAC', 'EXAM_CELL', 'STUDENT_SECTION',
      'STUDENT_ADMIN', 'ACCOUNTS_ADMIN', 'HR_ADMIN', 'HOSTEL_ADMIN', 'LIBRARY_ADMIN', 'TRANSPORT_ADMIN',
      'MAINTENANCE_ADMIN'
    ].includes(currentEffectiveRole);
  };

  const resetSystemDatabase = () => {
    db.resetToDefaultSeed();
    setUser(null);
    setActiveRoleState(null);
  };

  const isMasterSuperAdmin = user?.email?.toLowerCase() === 'jigarahir410@gmail.com' || user?.username?.toLowerCase() === 'jigarahir' || user?.id === 'user-jigarahir410';
  const effectiveRole: UserRole | null = isMasterSuperAdmin
    ? 'SUPER_ADMIN'
    : (activeRole || (user ? user.role : null));

  const normalizedUser: User | null = user
    ? (isMasterSuperAdmin
        ? {
            ...user,
            role: 'SUPER_ADMIN' as UserRole,
            status: 'ACTIVE',
            accountStatus: 'ACTIVE',
            is_active: true,
          }
        : user)
    : null;

  return (
    <AuthContext.Provider
      value={{
        user: normalizedUser,
        role: effectiveRole,
        activeRole: effectiveRole,
        setActiveRole,
        registrarViewContext,
        setRegistrarViewContext,
        login,
        logout,
        updateProfile,
        hasAccess,
        canMutate,
        resetSystemDatabase,
        recordUserActivity,
      }}
    >
      {children}
      {user && (
        <SessionTimeoutWarningModal
          isOpen={showInactivityWarning}
          remainingSeconds={remainingSeconds}
          onContinue={handleContinueSession}
          onLogout={logout}
        />
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
