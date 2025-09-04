import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Sayfa yüklendiğinde mevcut kullanıcıyı kontrol et
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log('AuthContext: Login attempt for', email);
      const response = await authService.login({ email, password });
      console.log('AuthContext: Login response', response);
      authService.saveAuth(response.token, response.user);
      setUser(response.user);
      console.log('AuthContext: User set successfully', response.user);
    } catch (error: any) {
      console.error('AuthContext: Login error', error);
      throw new Error(error.response?.data?.message || error.message || 'Giriş başarısız');
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      console.log('AuthContext: Register attempt for', email);
      const response = await authService.register({ name, email, password });
      console.log('AuthContext: Register response', response);
      authService.saveAuth(response.token, response.user);
      setUser(response.user);
      console.log('AuthContext: User registered successfully', response.user);
    } catch (error: any) {
      console.error('AuthContext: Register error', error);
      throw new Error(error.response?.data?.message || error.message || 'Kayıt başarısız');
    }
  };

  const logout = () => {
    console.log('AuthContext: Logout called');
    authService.logout();
    setUser(null);
    console.log('AuthContext: User logged out successfully');
  };

  const isAdmin = user?.email === 'admin@admin.com';

  const value = {
    user,
    isAuthenticated: !!user,
    isAdmin,
    isLoading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
