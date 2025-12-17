import React, { createContext, useState, useCallback, useEffect } from 'react';
import { UserPublic, LoginRequest, SignupRequest } from '@/lib/types';

export interface AuthContextType {
  user: UserPublic | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  verifyToken: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const TOKEN_KEY = 'fittrack_auth_token';
const USER_KEY = 'fittrack_user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserPublic | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const savedToken = localStorage.getItem(TOKEN_KEY);
        const savedUser = localStorage.getItem(USER_KEY);

        if (savedToken && savedUser) {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
          // Try to verify token is still valid
          await verifyTokenFn(savedToken);
        }
      } catch (error) {
        console.error('Session restore failed:', error);
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  const verifyTokenFn = useCallback(async (tokenToVerify: string) => {
    try {
      const response = await fetch(`${API_BASE}/auth/verify`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${tokenToVerify}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Token verification failed');
      }

      const data = await response.json();
      return data.user;
    } catch (error) {
      throw error;
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Login failed');
      }

      const data = await response.json();
      const { user: newUser, token: newToken } = data;

      setUser(newUser);
      setToken(newToken);
      localStorage.setItem(TOKEN_KEY, newToken);
      localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    } catch (error) {
      throw error;
    }
  }, []);

  const signup = useCallback(async (email: string, password: string, name: string) => {
    try {
      const response = await fetch(`${API_BASE}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Signup failed');
      }

      const data = await response.json();
      const { user: newUser, token: newToken } = data;

      setUser(newUser);
      setToken(newToken);
      localStorage.setItem(TOKEN_KEY, newToken);
      localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    } catch (error) {
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }, []);

  const verifyToken = useCallback(async () => {
    if (!token) return;
    try {
      const verifiedUser = await verifyTokenFn(token);
      setUser(verifiedUser);
    } catch (error) {
      logout();
      throw error;
    }
  }, [token, verifyTokenFn]);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user && !!token,
    isLoading,
    token,
    login,
    signup,
    logout,
    verifyToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
