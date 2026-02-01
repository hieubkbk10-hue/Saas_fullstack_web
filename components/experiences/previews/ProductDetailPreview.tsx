import React from 'react';
import { Heart, ShoppingCart, Star } from 'lucide-react';

type ProductDetailPreviewProps = {
  layoutStyle: 'classic' | 'modern' | 'minimal';
  showRating: boolean;
  showWishlist: boolean;
  showAddToCart: boolean;
  showClassicHighlights: boolean;
};

export function ProductDetailPreview({
  layoutStyle,
  showRating,
  showWishlist,
  showAddToCart,
  showClassicHighlights,
}: ProductDetailPreviewProps) {
  return (
    <div className="space-y-3 text-xs">
      {/* Layout indicator */}
      <div className="bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800 rounded p-2">
        <span className="font-medium text-cyan-700 dark:text-cyan-400">Layout: {layoutStyle}</span>
      </div>

      {/* Classic layout */}
      {layoutStyle === 'classic' && (
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-slate-200 dark:bg-slate-700 rounded aspect-square flex items-center justify-center text-slate-500">
            Gallery
          </div>
          <div className="space-y-2">
            <div className="bg-slate-200 dark:bg-slate-700 rounded h-4" />
            <div className="bg-slate-200 dark:bg-slate-700 rounded h-3 w-3/4" />
            {showRating && (
              <div className="flex items-center gap-1 text-amber-500">
                <Star size={10} fill="currentColor" />
                <Star size={10} fill="currentColor" />
                <Star size={10} fill="currentColor" />
              </div>
            )}
            {showWishlist && (
              <div className="flex items-center gap-1 text-pink-500">
                <Heart size={10} />
                <span>Wishlist</span>
              </div>
            )}
            {showAddToCart && (
              <div className="bg-cyan-500 text-white rounded p-1 flex items-center gap-1 justify-center">
                <ShoppingCart size={10} />
                <span>Add to Cart</span>
              </div>
            )}
            {showClassicHighlights && (
              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded p-1 text-amber-700 dark:text-amber-400">
                Highlights
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modern layout */}
      {layoutStyle === 'modern' && (
        <div className="space-y-2">
          <div className="bg-slate-200 dark:bg-slate-700 rounded h-20 flex items-center justify-center text-slate-500">
            Hero Banner
          </div>
          <div className="grid grid-cols-3 gap-1">
            <div className="bg-slate-200 dark:bg-slate-700 rounded h-3" />
            <div className="bg-slate-200 dark:bg-slate-700 rounded h-3" />
            <div className="bg-slate-200 dark:bg-slate-700 rounded h-3" />
          </div>
          <div className="flex justify-between items-center">
            {showWishlist && <Heart size={10} className="text-pink-500" />}
            {showRating && (
              <div className="flex gap-0.5 text-amber-500">
                <Star size={8} fill="currentColor" />
                <Star size={8} fill="currentColor" />
              </div>
            )}
            {showAddToCart && <ShoppingCart size={10} className="text-cyan-500" />}
          </div>
        </div>
      )}

      {/* Minimal layout */}
      {layoutStyle === 'minimal' && (
        <div className="space-y-2">
          <div className="bg-slate-200 dark:bg-slate-700 rounded aspect-video flex items-center justify-center text-slate-500">
            Product Image
          </div>
          <div className="space-y-1">
            <div className="bg-slate-200 dark:bg-slate-700 rounded h-3 w-2/3" />
            {showRating && (
              <div className="flex gap-0.5 text-amber-500">
                <Star size={8} fill="currentColor" />
                <Star size={8} fill="currentColor" />
                <Star size={8} fill="currentColor" />
              </div>
            )}
            <div className="flex gap-1">
              {showWishlist && (
                <div className="border border-pink-300 dark:border-pink-700 text-pink-500 rounded px-1 py-0.5 flex items-center gap-0.5">
                  <Heart size={8} />
                </div>
              )}
              {showAddToCart && (
                <div className="bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-800 rounded px-1 py-0.5 flex-1 flex items-center justify-center gap-0.5">
                  <ShoppingCart size={8} />
                  <span>Buy</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
