'use client';

import React, { createContext, useContext, useMemo } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

type AdminModule = {
  key: string;
  name: string;
  enabled: boolean;
  icon: string;
  category: string;
};

type AdminModulesContextType = {
  modules: AdminModule[];
  isLoading: boolean;
  isModuleEnabled: (key: string) => boolean;
  getEnabledModules: () => AdminModule[];
};

const AdminModulesContext = createContext<AdminModulesContextType | null>(null);

export function AdminModulesProvider({ children }: { children: React.ReactNode }) {
  const modulesData = useQuery(api.admin.modules.listModules);
  
  const isLoading = modulesData === undefined;
  
  const modules = useMemo(() => {
    if (!modulesData) return [];
    return modulesData.map(m => ({
      key: m.key,
      name: m.name,
      enabled: m.enabled,
      icon: m.icon,
      category: m.category,
    }));
  }, [modulesData]);

  const isModuleEnabled = (key: string): boolean => {
    const module = modules.find(m => m.key === key);
    return module?.enabled ?? false;
  };

  const getEnabledModules = () => modules.filter(m => m.enabled);

  return (
    <AdminModulesContext.Provider value={{ modules, isLoading, isModuleEnabled, getEnabledModules }}>
      {children}
    </AdminModulesContext.Provider>
  );
}

export function useAdminModules() {
  const context = useContext(AdminModulesContext);
  if (!context) {
    throw new Error('useAdminModules must be used within AdminModulesProvider');
  }
  return context;
}
