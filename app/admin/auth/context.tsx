'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

type AdminUser = {
  id: string;
  name: string;
  email: string;
  roleId: string;
  isSuperAdmin: boolean;
  permissions: Record<string, string[]>;
};

type AdminAuthContextType = {
  isAuthenticated: boolean;
  isLoading: boolean;
  isSessionVerified: boolean; // true khi đã verify session xong (dù valid hay invalid)
  user: AdminUser | null;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  hasPermission: (moduleKey: string, action: string) => boolean;
};

const AdminAuthContext = createContext<AdminAuthContextType | null>(null);

const ADMIN_TOKEN_KEY = 'admin_auth_token';

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(ADMIN_TOKEN_KEY);
  });

  const loginMutation = useMutation(api.auth.verifyAdminLogin);
  const logoutMutation = useMutation(api.auth.logoutAdmin);
  
  // Verify session on mount and token change
  const sessionResult = useQuery(
    api.auth.verifyAdminSession,
    token ? { token } : "skip"
  );

  const activeToken = sessionResult?.valid === false ? null : token;

  // Check if session is valid
  // isSessionVerified: true khi không có token HOẶC sessionResult đã có data (dù valid hay không)
  const isSessionVerified = !activeToken || sessionResult !== undefined;
  const isAuthenticated = !!activeToken && sessionResult?.valid === true;
  const isLoading = !!activeToken && sessionResult === undefined;
  const user = sessionResult?.user ? {
    id: sessionResult.user.id,
    name: sessionResult.user.name,
    email: sessionResult.user.email,
    roleId: sessionResult.user.roleId,
    isSuperAdmin: sessionResult.user.isSuperAdmin,
    permissions: sessionResult.user.permissions,
  } : null;

  // Clear invalid token
  useEffect(() => {
    if (token && sessionResult && !sessionResult.valid) {
      localStorage.removeItem(ADMIN_TOKEN_KEY);
    }
  }, [token, sessionResult]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const result = await loginMutation({ email, password });
      if (result.success && result.token) {
        localStorage.setItem(ADMIN_TOKEN_KEY, result.token);
        setToken(result.token);
      }
      return { success: result.success, message: result.message };
    } catch {
      return { success: false, message: 'Có lỗi xảy ra khi đăng nhập' };
    }
  }, [loginMutation]);

  const logout = useCallback(async () => {
    if (token) {
      await logoutMutation({ token });
    }
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    setToken(null);
  }, [token, logoutMutation]);

  const hasPermission = (moduleKey: string, action: string) => {
    if (!user) return false;
    if (user.isSuperAdmin) return true;
    
    const permissions = user.permissions;
    
    // Check wildcard
    if (permissions["*"]?.includes("*") || permissions["*"]?.includes(action)) {
      return true;
    }
    
    // Check module-specific permission
    if (permissions[moduleKey]?.includes("*") || permissions[moduleKey]?.includes(action)) {
      return true;
    }
    
    return false;
  };

  return (
    <AdminAuthContext.Provider value={{ isAuthenticated, isLoading, isSessionVerified, user, login, logout, hasPermission }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
}
