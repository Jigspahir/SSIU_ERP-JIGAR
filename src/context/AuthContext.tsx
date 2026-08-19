import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { db } from '../services/db';
import { securityAuditService } from '../services/securityAuditService';
import { AUTH_STORAGE_KEY, SESSION_TIMEOUT_MS, INACTIVITY_EVENTS, DEMO_ACCOUNTS } from '../constants';

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
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
        return JSON.parse(savedUser) as User;
      }
    } catch (e) {
      console.error('Error reading auth user:', e);
    }
    return null;
  });

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
        password === 'Admin@123';

      if (!isDemoPassMatch) {
        securityAuditService.trackLoginFailure(identifier, 'Invalid password credentials');
        return { success: false, error: 'Incorrect Password. Please check your User ID and Password.' };
      }
    }

    setUser(foundUser);
    securityAuditService.trackLoginSuccess(foundUser);
    return { success: true };
  };

  const logout = () => {
    if (user) {
      securityAuditService.trackLogout(user);
    }
    setUser(null);
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
    if (user.role === 'SUPER_ADMIN') return true;
    return allowedRoles.includes(user.role);
  };

  const canMutate = (): boolean => {
    if (!user) return false;
    return [
      'SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'PRINCIPAL', 'HOD',
      'REGISTRAR', 'IQAC', 'EXAM_CELL', 'STUDENT_SECTION',
      'HOSTEL_ADMIN', 'LIBRARY_ADMIN', 'TRANSPORT_ADMIN', 'MAINTENANCE_ADMIN'
    ].includes(user.role);
  };

  const resetSystemDatabase = () => {
    db.resetToDefaultSeed();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user ? user.role : null,
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
