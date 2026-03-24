/**
 * Authentication Types
 * Defines the shape of auth-related data
 */

export interface User {
  id: string;
  email: string;
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  register: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  error: string | null;
}
