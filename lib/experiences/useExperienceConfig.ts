import { useEffect, useMemo, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';

interface UseExperienceConfigResult<T> {
  config: T;
  setConfig: Dispatch<SetStateAction<T>>;
  serverConfig: T;
  isLoading: boolean;
  hasChanges: boolean;
}

/**
 * Hook để quản lý experience config state với sync từ server
 * @param serverConfig - Config từ server (đã computed với fallbacks)
 * @param defaultConfig - Default config nếu chưa có
 * @param isLoading - Loading state từ queries
 */
export function useExperienceConfig<T>(
  serverConfig: T,
  defaultConfig: T,
  isLoading: boolean
): UseExperienceConfigResult<T> {
  const [config, setConfig] = useState<T>(defaultConfig);

  // Sync với server config khi load xong
  useEffect(() => {
    if (!isLoading) {
      setConfig(serverConfig);
    }
  }, [isLoading, serverConfig]);

  // Detect changes
  const hasChanges = useMemo(
    () => JSON.stringify(config) !== JSON.stringify(serverConfig),
    [config, serverConfig]
  );

  return {
    config,
    hasChanges,
    isLoading,
    serverConfig,
    setConfig,
  };
}
