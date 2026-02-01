import React from 'react';
import { Heart, X } from 'lucide-react';

type WishlistPreviewProps = {
  layoutStyle: 'grid' | 'list';
  showWishlistButton: boolean;
  showNote: boolean;
  showNotification: boolean;
};

export function WishlistPreview({
  layoutStyle,
  showNote,
  showNotification,
}: WishlistPreviewProps) {
  const items = [1, 2, 3];

  return (
    <div className="space-y-3 text-xs">
      <div className="bg-pink-50 dark:bg-pink-950/30 border border-pink-200 dark:border-pink-800 rounded p-2">
        <span className="font-medium text-pink-700 dark:text-pink-400">Layout: {layoutStyle}</span>
      </div>

      {layoutStyle === 'grid' && (
        <div className="grid grid-cols-2 gap-2">
          {items.map((i) => (
            <div key={i} className="border border-slate-200 dark:border-slate-700 rounded p-2 space-y-1">
              <div className="bg-slate-200 dark:bg-slate-700 rounded aspect-square" />
              <div className="bg-slate-200 dark:bg-slate-700 rounded h-2 w-3/4" />
              <div className="flex justify-between items-center">
                <Heart size={10} className="text-pink-500" fill="currentColor" />
                <X size={10} className="text-slate-400" />
              </div>
              {showNote && (
                <div className="bg-slate-100 dark:bg-slate-800 rounded p-1 text-slate-500">
                  Note
                </div>
              )}
              {showNotification && (
                <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                  <div className="w-1 h-1 rounded-full bg-amber-500" />
                  <span>Notify</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {layoutStyle === 'list' && (
        <div className="space-y-2">
          {items.map((i) => (
            <div key={i} className="border border-slate-200 dark:border-slate-700 rounded p-2 flex gap-2">
              <div className="bg-slate-200 dark:bg-slate-700 rounded w-12 h-12" />
              <div className="flex-1 space-y-1">
                <div className="bg-slate-200 dark:bg-slate-700 rounded h-2 w-2/3" />
                <div className="bg-slate-200 dark:bg-slate-700 rounded h-2 w-1/3" />
                {showNote && (
                  <div className="bg-slate-100 dark:bg-slate-800 rounded p-1 text-slate-500">
                    Note: Cần mua khi giảm giá
                  </div>
                )}
                {showNotification && (
                  <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                    <div className="w-1 h-1 rounded-full bg-amber-500" />
                    <span>Thông báo khi giảm giá</span>
                  </div>
                )}
              </div>
              <div className="flex flex-col justify-between items-end">
                <X size={10} className="text-slate-400" />
                <Heart size={10} className="text-pink-500" fill="currentColor" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
