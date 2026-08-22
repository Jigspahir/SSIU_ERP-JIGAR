import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, Student } from '../types';
import { AuthService } from '../services/authService';
import { StorageService } from '../services/storageService';
import { DataService } from '../services/dataService';
import { CONFIG } from '../constants/config';
import { PushNotificationService } from '../services/notificationService';

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  activeRole: UserRole | null;
  isLoading: boolean;
  linkedChildren: Student[];
  selectedChild: Student | null;
  setSelectedChild: (child: Student) => void;
  setActiveRole: (role: UserRole) => void;
  login: (identifier: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  reloadProfile: () => Promise<void>;
  hasAccess: (allowedRoles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [activeRole, setActiveRoleState] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [linkedChildren, setLinkedChildren] = useState<Student[]>([]);
  const [selectedChild, setSelectedChildState] = useState<Student | null>(null);

  // Restore session on app startup & verify token validity
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const session = await AuthService.getCurrentSession();
        if (session.user) {
          setUser(session.user);
          const savedActiveRole = await StorageService.getItem<UserRole>(CONFIG.STORAGE_KEYS.ACTIVE_ROLE);
          const effective = savedActiveRole || session.user.role;
          setActiveRoleState(effective);

          // If Parent, load linked children
          if (session.user.role === 'PARENT') {
            const childrenList = await DataService.getParentLinkedChildren(session.user.id);
            setLinkedChildren(childrenList);
            const savedChildId = await StorageService.getItem<string>(CONFIG.STORAGE_KEYS.SELECTED_CHILD_ID);
            const initialChild = childrenList.find((c) => c.id === savedChildId) || childrenList[0] || null;
            setSelectedChildState(initialChild);
          }

          // Register push notifications
          PushNotificationService.registerForPushNotificationsAsync();
        }
      } catch (e) {
        console.error('Session restoration failed:', e);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = async (identifier: string, password?: string) => {
    setIsLoading(true);
    try {
      const res = await AuthService.login(identifier, password);
      if (res.success && res.user) {
        setUser(res.user);
        setActiveRoleState(res.user.role);

        if (res.user.role === 'PARENT') {
          const childrenList = await DataService.getParentLinkedChildren(res.user.id);
          setLinkedChildren(childrenList);
          const initialChild = childrenList[0] || null;
          setSelectedChildState(initialChild);
          if (initialChild) {
            await StorageService.setItem(CONFIG.STORAGE_KEYS.SELECTED_CHILD_ID, initialChild.id);
          }
        }

        // Register push token
        PushNotificationService.registerForPushNotificationsAsync();
        return { success: true };
      }
      return { success: false, error: res.error || 'Authentication failed.' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await AuthService.logout();
      setUser(null);
      setActiveRoleState(null);
      setLinkedChildren([]);
      setSelectedChildState(null);
    } finally {
      setIsLoading(false);
    }
  };

  const setActiveRole = async (newRole: UserRole) => {
    // Only allow switching to authorized roles for this user
    if (user) {
      const userRoles = user.roles || [user.role];
      if (user.role === 'SUPER_ADMIN' || userRoles.includes(newRole)) {
        setActiveRoleState(newRole);
        await StorageService.setItem(CONFIG.STORAGE_KEYS.ACTIVE_ROLE, newRole);
      } else {
        console.warn(`User ${user.username} unauthorized to switch to role: ${newRole}`);
      }
    }
  };

  const setSelectedChild = async (child: Student) => {
    // Verify that the child is legitimately linked to this parent
    const isChildLinked = linkedChildren.some((c) => c.id === child.id);
    if (isChildLinked || user?.role === 'SUPER_ADMIN') {
      setSelectedChildState(child);
      await StorageService.setItem(CONFIG.STORAGE_KEYS.SELECTED_CHILD_ID, child.id);
    } else {
      console.warn('Unauthorized attempt to switch to unlinked student record.');
    }
  };

  const hasAccess = (allowedRoles: UserRole[]): boolean => {
    if (!user) return false;
    if (user.role === 'SUPER_ADMIN') return true;
    const currentEffectiveRole = activeRole || user.role;
    return allowedRoles.includes(currentEffectiveRole);
  };

  const reloadProfile = async () => {
    if (user?.id) {
      if (user.role === 'PARENT') {
        const childrenList = await DataService.getParentLinkedChildren(user.id);
        setLinkedChildren(childrenList);
      }
    }
  };

  const effectiveRole = activeRole || (user ? user.role : null);

  return (
    <AuthContext.Provider
      value={{
        user,
        role: effectiveRole,
        activeRole: effectiveRole,
        isLoading,
        linkedChildren,
        selectedChild,
        setSelectedChild,
        setActiveRole,
        login,
        logout,
        reloadProfile,
        hasAccess,
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
