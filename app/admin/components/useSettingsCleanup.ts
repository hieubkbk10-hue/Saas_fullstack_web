import { useCallback } from 'react';
import { toast } from 'sonner';

interface CleanupResult {
  deleted: number;
  files: string[];
}

export function useSettingsCleanup() {
  const cleanupUnusedImages = useCallback(async (
    folder: string,
    usedUrls: string[]
  ): Promise<CleanupResult | null> => {
    try {
      // Filter to only include local uploads
      const localUrls = usedUrls.filter(url => url?.startsWith('/uploads/'));

      const response = await fetch('/api/upload/cleanup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folder, usedUrls: localUrls }),
      });

      if (!response.ok) {
        throw new Error('Cleanup failed');
      }

      const result: CleanupResult = await response.json();

      if (result.deleted > 0) {
        toast.success(`Đã xóa ${result.deleted} ảnh không sử dụng`);
      }

      return result;
    } catch (error) {
      console.error('Cleanup error:', error);
      toast.error('Không thể dọn dẹp ảnh');
      return null;
    }
  }, []);

  return { cleanupUnusedImages };
}
