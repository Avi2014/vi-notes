import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType } from '../types/auth';
import {
  registerUser,
  loginUser,
  saveAuthData,
  getAuthData,
  clearAuthData
} from '../services/authService';

/**
 * Auth Context
 * Provides authentication state to the entire application
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Auth Provider Component
 * Wraps the app and provides auth context to all children
 */
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Initialize auth state from localStorage on mount
   */
  useEffect(() => {
    const { token: savedToken, user: savedUser } = getAuthData();
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(savedUser);
    }
    setIsLoading(false);
  }, []);

  /**
   * Register new user
   */
  const register = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await registerUser(email, password);
      const { token: newToken, user: newUser } = response;
      
      setToken(newToken);
      setUser(newUser);
      saveAuthData(newToken, newUser);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error || 'Registration failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Login user
   */
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await loginUser(email, password);
      const { token: newToken, user: newUser } = response;
      
      setToken(newToken);
      setUser(newUser);
      saveAuthData(newToken, newUser);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error || 'Login failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Logout user
   */
  const logout = () => {
    setToken(null);
    setUser(null);
    setError(null);
    clearAuthData();
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!token,
    register,
    login,
    logout,
    error
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * useAuth Hook
 * Use this hook to access auth context in any component
 * 
 * @returns Auth context with user, token, login, register, logout, etc.
 * 
 * @example
 * const { user, login, logout, isAuthenticated } = useAuth();
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
