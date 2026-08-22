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
            return { ...parsed, name: freshUser.name, designation: freshUser.designation };
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
          const savedActiveRole = localStorage.getItem(`sscit_active_workspace_${parsed.id}`);
          if (savedActiveRole && (savedActiveRole === 'FACULTY' || savedActiveRole === 'MENTOR' || savedActiveRole === parsed.role)) {
            return savedActiveRole as UserRole;
          }
          return parsed.role || null;
        }
      }
    } catch (e) {
      console.error('Error reading active role:', e);
    }
    return null;
  });

  const setActiveRole = (newRole: UserRole) => {
    setActiveRoleState(newRole);
    if (user) {
      localStorage.setItem(`sscit_active_workspace_${user.id}`, newRole);
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
    const cleanId = identifier.trim().toLowerCase();

    // Match by username, email, or role keyword
    let foundUser = users.find(u => 
      (u.username && u.username.toLowerCase() === cleanId) ||
      u.email.toLowerCase() === cleanId
    );

    // Fallback role keyword match for demo accounts (e.g. "admin", "faculty", "student")
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
      return { success: false, error: 'Invalid User ID or Email. Please enter a valid account ID.' };
    }

    if (password && foundUser.password && foundUser.password !== password) {
      const isDemoPassMatch = 
        password === 'Student@123' ||
        password === 'Faculty@123' ||
        password === 'Admin@123' ||
        password === 'Parent@123';

      if (!isDemoPassMatch) {
        securityAuditService.trackLoginFailure(identifier, 'Invalid password credentials');
        return { success: false, error: 'Incorrect Password. Please check your User ID and Password.' };
      }
    }

    setUser(foundUser);
    const savedActiveRole = localStorage.getItem(`sscit_active_workspace_${foundUser.id}`);
    const initialActiveRole = (savedActiveRole && (savedActiveRole === 'FACULTY' || savedActiveRole === 'MENTOR'))
      ? (savedActiveRole as UserRole)
      : foundUser.role;
    setActiveRoleState(initialActiveRole);
    localStorage.setItem(`sscit_active_workspace_${foundUser.id}`, initialActiveRole);

    securityAuditService.trackLoginSuccess(foundUser);
    return { success: true };
  };

  const logout = () => {
    if (user) {
      securityAuditService.trackLogout(user);
    }
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
