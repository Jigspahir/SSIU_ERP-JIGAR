import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { db } from '../services/db';

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

const AUTH_USER_KEY = 'SWARRNIM_ERP_AUTH_USER_V2';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const savedUser = localStorage.getItem(AUTH_USER_KEY);
      if (savedUser) {
        const u = JSON.parse(savedUser);
        // Enforce dummy names and emails across demo accounts
        if (u.role === 'SUPER_ADMIN' || u.role === 'UNIVERSITY_ADMIN' || u.username === 'admin') {
          u.name = 'Demo Admin';
          u.email = 'demo.admin@university.edu';
        } else if (u.role === 'FACULTY' || u.username === 'faculty') {
          u.name = 'Prof. Demo Faculty';
          u.email = 'demo.faculty@university.edu';
        } else if (u.role === 'STUDENT' || u.username === 'student') {
          u.name = 'Demo Student';
          u.email = 'demo.student@university.edu';
        }
        return u;
      }
    } catch (e) {
      console.error('Error reading auth user:', e);
    }
    return null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));

      // 15-minute Inactivity Session Timeout
      let timeoutId: number;

      const resetTimer = () => {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = window.setTimeout(() => {
          logout();
          alert('Your session has timed out due to inactivity. Please log in again.');
        }, 15 * 60 * 1000); // 15 minutes
      };

      const events = ['mousemove', 'keydown', 'mousedown', 'touchstart', 'click'];
      events.forEach(event => window.addEventListener(event, resetTimer));
      resetTimer();

      return () => {
        if (timeoutId) clearTimeout(timeoutId);
        events.forEach(event => window.removeEventListener(event, resetTimer));
      };
    } else {
      localStorage.removeItem(AUTH_USER_KEY);
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
      }
    }

    if (!foundUser) {
      return { success: false, error: 'Invalid User ID or Email. Please enter a valid account ID.' };
    }

    if (password && foundUser.password && foundUser.password !== password) {
      const isDemoPassMatch = 
        (cleanId === 'student' && password === 'Student@123') ||
        (cleanId === 'faculty' && password === 'Faculty@123') ||
        (cleanId === 'admin' && password === 'Admin@123');

      if (!isDemoPassMatch) {
        return { success: false, error: 'Incorrect Password. Please check your User ID and Password.' };
      }
    }

    // Sanitize user name and email to strictly enforce dummy credentials
    if (foundUser.role === 'SUPER_ADMIN' || foundUser.role === 'UNIVERSITY_ADMIN' || foundUser.username === 'admin') {
      foundUser.name = 'Demo Admin';
      foundUser.email = 'demo.admin@university.edu';
    } else if (foundUser.role === 'FACULTY' || foundUser.username === 'faculty') {
      foundUser.name = 'Prof. Demo Faculty';
      foundUser.email = 'demo.faculty@university.edu';
    } else if (foundUser.role === 'STUDENT' || foundUser.username === 'student') {
      foundUser.name = 'Demo Student';
      foundUser.email = 'demo.student@university.edu';
    }

    setUser(foundUser);
    db.logAudit('LOGIN', 'Authentication', `User ${foundUser.name} (${foundUser.username || foundUser.role}) logged in successfully`, foundUser.name, foundUser.role);
    return { success: true };
  };

  const logout = () => {
    if (user) {
      db.logAudit('LOGOUT', 'Authentication', `User ${user.name} logged out`, user.name, user.role);
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
