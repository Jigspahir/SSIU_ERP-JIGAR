import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { db } from '../services/db';
import { securityAuditService } from '../services/securityAuditService';
import { AUTH_STORAGE_KEY, SESSION_TIMEOUT_MS, INACTIVITY_EVENTS, DEMO_ACCOUNTS } from '../constants';

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  activeRole: UserRole | null;
  setActiveRole: (role: UserRole) => void;
  registrarViewContext: 'ACADEMIC' | 'NON_ACADEMIC';
  setRegistrarViewContext: (ctx: 'ACADEMIC' | 'NON_ACADEMIC') => void;
  login: (identifier: string, password?: string) => { success: boolean; error?: string };
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
  hasAccess: (allowedRoles: UserRole[]) => boolean;
  canMutate: () => boolean;
  resetSystemDatabase: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const savedUser = localStorage.getItem(AUTH_STORAGE_KEY);
      if (savedUser) {
        const parsed = JSON.parse(savedUser) as User;
        if (parsed && typeof parsed === 'object' && parsed.id) {
          const freshUser = db.getUsers().find(u => u.id === parsed.id || (parsed.username && u.username === parsed.username));
          if (freshUser) {
            if (freshUser.accountStatus === 'LOCKED' || freshUser.accountStatus === 'DISABLED' || freshUser.accountStatus === 'INACTIVE') {
              localStorage.removeItem(AUTH_STORAGE_KEY);
              return null;
            }
            return { ...freshUser };
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
        if (parsed && typeof parsed === 'object' && parsed.id) {
          // Strictly restrict workspace switcher to authentic FACULTY / MENTOR accounts only
          if (parsed.role === 'FACULTY' || parsed.role === 'MENTOR') {
            const savedActiveRole = localStorage.getItem(`sscit_active_workspace_${parsed.id}`);
            if (savedActiveRole === 'FACULTY' || savedActiveRole === 'MENTOR') {
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
    // Guard: Only authentic FACULTY or MENTOR accounts can toggle view
    if (user.role === 'FACULTY' || user.role === 'MENTOR') {
      if (newRole === 'FACULTY' || newRole === 'MENTOR') {
        setActiveRoleState(newRole);
        localStorage.setItem(`sscit_active_workspace_${user.id}`, newRole);
      }
    }
  };

  useEffect(() => {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));

      let timeoutId: number;

      const resetTimer = () => {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = window.setTimeout(() => {
          logout();
          alert('Your session has timed out due to inactivity. Please log in again.');
        }, SESSION_TIMEOUT_MS);
      };

      INACTIVITY_EVENTS.forEach(event => window.addEventListener(event, resetTimer));
      resetTimer();

      return () => {
        if (timeoutId) clearTimeout(timeoutId);
        INACTIVITY_EVENTS.forEach(event => window.removeEventListener(event, resetTimer));
      };
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [user]);

  const login = (identifier: string, password?: string) => {
    const users = db.getUsers();
    const students = db.getStudents();
    const cleanId = identifier.trim().toLowerCase();

    // 1. Match by username, email, temporaryEnrollmentNumber, or finalEnrollmentNumber
    let foundUser = users.find(u => 
      (u.username && u.username.toLowerCase() === cleanId) ||
      (u.email && u.email.toLowerCase() === cleanId) ||
      (u.temporaryEnrollmentNumber && u.temporaryEnrollmentNumber.toLowerCase() === cleanId) ||
      (u.finalEnrollmentNumber && u.finalEnrollmentNumber.toLowerCase() === cleanId) ||
      (u.enrollmentNo && u.enrollmentNo.toLowerCase() === cleanId)
    );

    // 2. Fallback: Search via Student Master record
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
          u.email.toLowerCase() === studentMatch.email.toLowerCase()
        );
      }
    }

    // 3. Fallback role keyword match for demo accounts (e.g. "admin", "faculty", "student")
    if (!foundUser) {
      if (cleanId === 'admin') {
        foundUser = users.find(u => u.role === 'SUPER_ADMIN') || users.find(u => u.role === 'UNIVERSITY_ADMIN');
      } else if (cleanId === 'faculty') {
        foundUser = users.find(u => u.role === 'FACULTY');
      } else if (cleanId === 'student') {
        foundUser = users.find(u => u.role === 'STUDENT');
      } else if (cleanId === 'registrar') {
        foundUser = users.find(u => u.role === 'REGISTRAR');
      } else if (cleanId === 'deputyregistrar' || cleanId === 'deputy_registrar') {
        foundUser = users.find(u => u.role === 'DEPUTY_REGISTRAR');
      } else if (cleanId === 'iqac') {
        foundUser = users.find(u => u.role === 'IQAC');
      } else if (cleanId === 'examcell') {
        foundUser = users.find(u => u.role === 'EXAM_CELL');
      } else if (cleanId === 'studentsection') {
        foundUser = users.find(u => u.role === 'STUDENT_SECTION');
      } else if (cleanId === 'hosteladmin') {
        foundUser = users.find(u => u.role === 'HOSTEL_ADMIN');
      } else if (cleanId === 'hod') {
        foundUser = users.find(u => u.role === 'HOD');
      } else if (cleanId === 'principal') {
        foundUser = users.find(u => u.role === 'PRINCIPAL');
      } else if (cleanId === 'parent' || cleanId === 'parent2' || cleanId === 'parent3') {
        foundUser = users.find(u => u.role === 'PARENT' && (u.username === cleanId || cleanId === 'parent'));
      }
    }

    if (!foundUser) {
      securityAuditService.trackLoginFailure(identifier, 'Account not found or invalid identifier');
      return { success: false, error: 'Invalid User ID, Temporary Enrollment Number or Email. Please enter a valid account ID.' };
    }

    // 4. Validate Password & Student Access Code
    if (password) {
      const linkedStudent = students.find(s => 
        (foundUser?.id && s.id === foundUser.id.replace('user-', '')) || 
        s.enrollmentNo === foundUser?.username ||
        s.temporaryEnrollmentNumber === foundUser?.temporaryEnrollmentNumber
      );

      const isDirectMatch = foundUser.password === password;
      const isAccessCodeMatch = (foundUser.studentAccessCode && foundUser.studentAccessCode === password) ||
                                (linkedStudent?.studentAccessCode && linkedStudent.studentAccessCode === password);
      const isDemoPassMatch = 
        password === 'Student@123' ||
        password === 'Faculty@123' ||
        password === 'Admin@123' ||
        password === 'Parent@123';

      if (!isDirectMatch && !isAccessCodeMatch && !isDemoPassMatch) {
        securityAuditService.trackLoginFailure(identifier, 'Invalid password credentials or access code');
        return { success: false, error: 'Incorrect Password or Student Access Code. Please check your credentials.' };
      }
    }

    // 5. Validate Account Status (Active vs Locked vs Disabled)
    if (foundUser.accountStatus === 'LOCKED' || (foundUser as any).status === 'LOCKED') {
      const lockMsg = foundUser.lockReason 
        ? `Your account is LOCKED. Reason: ${foundUser.lockReason}. Please contact the Central ERP Coordinator.`
        : 'Your account is LOCKED for security reasons. Please contact the Central ERP Coordinator.';
      securityAuditService.trackLoginFailure(identifier, `Locked account login attempt: ${foundUser.username}`);
      return { success: false, error: lockMsg };
    }

    if (foundUser.accountStatus === 'DISABLED' || foundUser.accountStatus === 'INACTIVE' || (foundUser.status === 'INACTIVE' && foundUser.accountStatus !== 'ACTIVE')) {
      securityAuditService.trackLoginFailure(identifier, `Inactive/Disabled account login attempt: ${foundUser.username}`);
      return { success: false, error: 'Your account has been DEACTIVATED/DISABLED. Please contact the Central ERP Coordinator or System Administrator.' };
    }

    setUser(foundUser);
    
    // Strict role resolution: Non-faculty accounts (REGISTRAR, PRINCIPAL, HOD, etc.) MUST NEVER resolve as FACULTY
    let initialActiveRole: UserRole = foundUser.role;
    if (foundUser.role === 'FACULTY' || foundUser.role === 'MENTOR') {
      const savedActiveRole = localStorage.getItem(`sscit_active_workspace_${foundUser.id}`);
      if (savedActiveRole === 'FACULTY' || savedActiveRole === 'MENTOR') {
        initialActiveRole = savedActiveRole as UserRole;
      }
    } else {
      // Clear any stale workspace cache for non-faculty accounts
      try {
        localStorage.removeItem(`sscit_active_workspace_${foundUser.id}`);
      } catch (e) {}
    }

    setActiveRoleState(initialActiveRole);
    if (foundUser.role === 'FACULTY' || foundUser.role === 'MENTOR') {
      localStorage.setItem(`sscit_active_workspace_${foundUser.id}`, initialActiveRole);
    }

    securityAuditService.trackLoginSuccess(foundUser);
    return { success: true };
  };

  const logout = () => {
    if (user) {
      securityAuditService.trackLogout(user);
      try {
        localStorage.removeItem(`sscit_active_workspace_${user.id}`);
      } catch (e) {}
    }
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (e) {}
    setUser(null);
    setActiveRoleState(null);
  };

  const updateProfile = (updates: Partial<User>) => {
    if (!user) return;
    const updated = db.updateEntity<User>('users', user.id, updates, `Updated profile settings for ${user.name}`);
    if (updated) {
      setUser(updated);
    }
  };

  const hasAccess = (allowedRoles: UserRole[]): boolean => {
    if (!user) return false;
    if (user.role === 'SUPER_ADMIN' || user.role === 'VICE_PRESIDENT' || user.role === 'PRESIDENT') return true;
    const currentEffectiveRole = activeRole || user.role;
    return allowedRoles.includes(currentEffectiveRole);
  };

  const canMutate = (): boolean => {
    if (!user) return false;
    const currentEffectiveRole = activeRole || user.role;
    return [
      'SUPER_ADMIN', 'PRESIDENT', 'VICE_PRESIDENT', 'PROVOST', 'UNIVERSITY_ADMIN', 'PRINCIPAL', 'HOD',
      'REGISTRAR', 'IQAC', 'EXAM_CELL', 'STUDENT_SECTION',
      'HOSTEL_ADMIN', 'LIBRARY_ADMIN', 'TRANSPORT_ADMIN', 'MAINTENANCE_ADMIN'
    ].includes(currentEffectiveRole);
  };

  const resetSystemDatabase = () => {
    db.resetToDefaultSeed();
    setUser(null);
    setActiveRoleState(null);
  };

  const effectiveRole = activeRole || (user ? user.role : null);

  return (
    <AuthContext.Provider
      value={{
        user,
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
        resetSystemDatabase
      }}
    >
      {children}
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
