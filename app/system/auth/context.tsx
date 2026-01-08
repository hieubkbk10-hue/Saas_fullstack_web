'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

type SystemAuthContextType = {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
};

const SystemAuthContext = createContext<SystemAuthContextType | null>(null);

const SYSTEM_TOKEN_KEY = 'system_auth_token';

export function SystemAuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loginMutation = useMutation(api.auth.verifySystemLogin);
  const logoutMutation = useMutation(api.auth.logoutSystem);
  
  // Verify session on mount and token change
  const sessionResult = useQuery(
    api.auth.verifySystemSession,
    token ? { token } : "skip"
  );

  useEffect(() => {
    // Load token from localStorage on mount
    const savedToken = localStorage.getItem(SYSTEM_TOKEN_KEY);
    if (savedToken) {
      setToken(savedToken);
    }
    setIsLoading(false);
  }, []);

  // Check if session is valid
  const isAuthenticated = !!token && sessionResult?.valid === true;

  // Clear invalid token
  useEffect(() => {
    if (token && sessionResult && !sessionResult.valid) {
      localStorage.removeItem(SYSTEM_TOKEN_KEY);
      setToken(null);
    }
  }, [token, sessionResult]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const result = await loginMutation({ email, password });
      if (result.success && result.token) {
        localStorage.setItem(SYSTEM_TOKEN_KEY, result.token);
        setToken(result.token);
      }
      return { success: result.success, message: result.message };
    } catch (error) {
      return { success: false, message: 'Có lỗi xảy ra khi đăng nhập' };
    }
  }, [loginMutation]);

  const logout = useCallback(async () => {
    if (token) {
      await logoutMutation({ token });
    }
    localStorage.removeItem(SYSTEM_TOKEN_KEY);
    setToken(null);
  }, [token, logoutMutation]);

  return (
    <SystemAuthContext.Provider value={{ isAuthenticated, isLoading, login, logout }}>
      {children}
    </SystemAuthContext.Provider>
  );
}

export function useSystemAuth() {
  const context = useContext(SystemAuthContext);
  if (!context) {
    throw new Error('useSystemAuth must be used within SystemAuthProvider');
  }
  return context;
}
