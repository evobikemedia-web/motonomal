import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (role: UserRole) => void;
  logout: () => void;
  hasPermission: (moduleName: string) => boolean;
}

const defaultUser: UserProfile = {
  uid: 'user-admin-1',
  email: 'admin@motonomad.ma',
  displayName: 'Mehdi Ouhssain (Admin)',
  role: 'ADMIN',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
};

const AuthContext = createContext<AuthContextType>({
  user: defaultUser,
  loading: false,
  login: () => {},
  logout: () => {},
  hasPermission: () => true,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('motonomad_active_user');
    return saved ? JSON.parse(saved) : defaultUser;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('motonomad_active_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('motonomad_active_user');
    }
  }, [user]);

  const login = (role: UserRole) => {
    let displayName = 'Motonomad User';
    let email = 'user@motonomad.ma';

    if (role === 'ADMIN') {
      displayName = 'Mehdi Ouhssain (Admin)';
      email = 'admin@motonomad.ma';
    } else if (role === 'MANAGER') {
      displayName = 'Siham Oubaha (Manager)';
      email = 'manager@motonomad.ma';
    } else if (role === 'STAFF') {
      displayName = 'Tarik Ouhssain (Staff)';
      email = 'tarik@motonomad.ma';
    } else if (role === 'ACCOUNTING') {
      displayName = 'Youssef Bennani (Accounting)';
      email = 'accounting@motonomad.ma';
    }

    const newUser: UserProfile = {
      uid: `user-${role.toLowerCase()}-${Date.now()}`,
      email,
      displayName,
      role,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    };
    setUser(newUser);
  };

  const logout = () => {
    setUser(null);
  };

  // Role-Based Permissions
  const hasPermission = (moduleName: string): boolean => {
    if (!user) return false;
    if (user.role === 'ADMIN') return true;

    switch (moduleName) {
      case 'dashboard':
        return ['ADMIN', 'MANAGER', 'ACCOUNTING'].includes(user.role);
      case 'clients':
      case 'reservations':
      case 'fleet':
        return ['ADMIN', 'MANAGER', 'STAFF'].includes(user.role);
      case 'maintenance':
        return ['ADMIN', 'MANAGER', 'STAFF'].includes(user.role);
      case 'tours':
        return ['ADMIN', 'MANAGER'].includes(user.role);
      case 'finance':
      case 'accounting':
        return ['ADMIN', 'MANAGER', 'ACCOUNTING'].includes(user.role);
      case 'investments':
        return ['ADMIN', 'MANAGER'].includes(user.role);
      case 'equipment':
        return ['ADMIN', 'MANAGER', 'STAFF'].includes(user.role);
      case 'agencies':
      case 'suppliers':
        return ['ADMIN', 'MANAGER', 'ACCOUNTING'].includes(user.role);
      case 'reports':
        return ['ADMIN', 'MANAGER', 'ACCOUNTING'].includes(user.role);
      case 'settings':
      case 'audit':
        return user.role === 'ADMIN';
      default:
        return true;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
