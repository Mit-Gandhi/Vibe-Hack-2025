import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthService, User } from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user && AuthService.isAuthenticated();

  // Load user on app start
  useEffect(() => {
    const loadUser = async () => {
      if (AuthService.isAuthenticated()) {
        try {
          const response: any = await AuthService.getCurrentUser();
          if (response?.success && (response.user || response.data?.user)) {
            const rawUser = response.user || response.data?.user;
            const role = response.role || response.data?.role || rawUser?.role; // backend sends role at top-level
            const merged = { ...rawUser, role } as User;
            setUser(merged);
          } else {
            // Token might be invalid, clear it
            AuthService.logout();
          }
        } catch (error) {
          console.error('Failed to load user:', error);
          AuthService.logout();
        }
      }
      setIsLoading(false);
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response: any = await AuthService.login({ email, password });
      if (response?.success && (response.user || response.data?.user)) {
        const rawUser = response.user || response.data?.user;
        const role = response.role || response.data?.role || rawUser?.role;
        const merged = { ...rawUser, role } as User;
        setUser(merged);
      } else {
        throw new Error(response?.message || 'Login failed');
      }
    } catch (error) {
      throw error;
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      const response = await AuthService.register({ username, email, password });
      if (!response.success) {
        throw new Error(response.message || 'Registration failed');
      }
      // Note: After registration, user needs to verify OTP before login
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    AuthService.logout();
    setUser(null);
  };

  const refreshUser = async () => {
    if (AuthService.isAuthenticated()) {
      try {
        const response: any = await AuthService.getCurrentUser();
        if (response?.success && (response.user || response.data?.user)) {
          const rawUser = response.user || response.data?.user;
          const role = response.role || response.data?.role || rawUser?.role;
          const merged = { ...rawUser, role } as User;
          setUser(merged);
        }
      } catch (error) {
        console.error('Failed to refresh user:', error);
      }
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};