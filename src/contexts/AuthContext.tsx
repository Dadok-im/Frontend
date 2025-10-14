import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { fetchWithAccess } from '../utils';

interface User {
  username: string;
  nickname: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
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
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const BACKEND_API_BASE_URL = import.meta.env.VITE_BACKEND_API_BASE_URL;

  const login = (userData: User) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  };

  const checkAuth = async () => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      setIsAuthenticated(false);
      setUser(null);
      return;
    }

    // 토큰이 있으면 일단 인증 상태로 설정
    setIsAuthenticated(true);

    try {
      const response = await fetchWithAccess(`${BACKEND_API_BASE_URL}/api/user/me`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        console.warn('사용자 정보를 가져올 수 없지만 토큰이 있으므로 인증 상태 유지');
        // 사용자 정보를 가져올 수 없어도 토큰이 있으면 인증 상태 유지
      }
    } catch (error) {
      console.error('사용자 정보 요청 실패:', error);
      // 사용자 정보 요청 실패해도 토큰이 있으면 인증 상태 유지
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated,
    login,
    logout,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
