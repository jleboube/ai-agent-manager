import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '../services/api';

interface User {
  id: string;
  email: string;
  name?: string;
  picture?: string;
  hasSubscription: boolean;
  generationsUsed: number;
  subscription?: {
    plan: string;
    status: string;
    currentPeriodEnd: string;
    cancelAtPeriodEnd: boolean;
  };
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
  canGenerate: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const userData = await authApi.getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      setUser(null);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);

      // Check for OAuth callback success/error
      const params = new URLSearchParams(window.location.search);
      const authStatus = params.get('auth');

      if (authStatus === 'success' || authStatus === 'error') {
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);

        if (authStatus === 'error') {
          console.error('OAuth authentication failed');
        }
      }

      // Fetch user data (will use cookie set by backend)
      await refreshUser();
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async () => {
    try {
      const { url } = await authApi.getGoogleAuthUrl();
      window.location.href = url;
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const canGenerate = user
    ? user.generationsUsed === 0 || user.hasSubscription
    : false;

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    refreshUser,
    canGenerate,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
