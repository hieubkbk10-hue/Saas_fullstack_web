import { useCallback, useMemo, useState } from 'react';
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
  const [draftConfig, setDraftConfig] = useState<T | null>(null);

  const resolvedConfig = useMemo(() => {
    if (draftConfig) {return draftConfig;}
    if (!isLoading) {return serverConfig;}
    return defaultConfig;
  }, [defaultConfig, draftConfig, isLoading, serverConfig]);

  const setConfig: Dispatch<SetStateAction<T>> = useCallback((next) => {
    setDraftConfig(prevDraft => {
      const baseConfig = prevDraft ?? (!isLoading ? serverConfig : defaultConfig);
      if (typeof next === 'function') {
        return (next as (prevState: T) => T)(baseConfig);
      }
      return next;
    });
  }, [defaultConfig, isLoading, serverConfig]);

  // Detect changes
  const hasChanges = useMemo(
    () => JSON.stringify(resolvedConfig) !== JSON.stringify(serverConfig),
    [resolvedConfig, serverConfig]
  );

  return {
    config: resolvedConfig,
    hasChanges,
    isLoading,
    serverConfig,
    setConfig,
  };
}
