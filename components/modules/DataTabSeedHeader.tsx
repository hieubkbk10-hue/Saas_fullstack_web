/**
 * Enhanced DataTab Header Component
 * 
 * Reusable component with quantity selector and seed controls
 */

'use client';

import React, { useState } from 'react';
import { Database, Loader2, RefreshCw, Trash2 } from 'lucide-react';
import { Card } from '@/app/admin/components/ui/card';
import { Button } from '@/app/admin/components/ui/button';
import { SeedQuantitySelector } from './SeedQuantitySelector';

interface DataTabSeedHeaderProps {
  moduleName: string;
  colorClasses: { button: string };
  onSeed: (quantity: number) => Promise<void>;
  onClear: () => Promise<void>;
  onReset: (quantity: number) => Promise<void>;
  isSeeding?: boolean;
  isClearing?: boolean;
  defaultQuantity?: number;
}

export function DataTabSeedHeader({
  moduleName,
  colorClasses,
  onSeed,
  onClear,
  onReset,
  isSeeding = false,
  isClearing = false,
  defaultQuantity = 10,
}: DataTabSeedHeaderProps) {
  const [quantity, setQuantity] = useState(defaultQuantity);

  const handleSeed = async () => {
    await onSeed(quantity);
  };

  const handleReset = async () => {
    await onReset(quantity);
  };

  const isBusy = isSeeding || isClearing;

  return (
    <Card className="p-4">
      <div className="flex flex-col gap-4">
        {/* Title & Description */}
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">
            Quản lý dữ liệu mẫu
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Seed, clear hoặc reset dữ liệu cho module {moduleName}
          </p>
        </div>

        {/* Quantity Selector */}
        <SeedQuantitySelector
          defaultQuantity={defaultQuantity}
          onQuantityChange={setQuantity}
          disabled={isBusy}
        />

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleSeed}
            disabled={isBusy}
            className="gap-2"
          >
            {isSeeding ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Database size={16} />
            )}
            Seed {quantity} records
          </Button>
          
          <Button
            variant="outline"
            onClick={onClear}
            disabled={isBusy}
            className="gap-2 text-red-500 hover:text-red-600"
          >
            {isClearing ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Trash2 size={16} />
            )}
            Clear All
          </Button>
          
          <Button
            onClick={handleReset}
            disabled={isBusy}
            className={`gap-2 ${colorClasses.button} text-white`}
          >
            <RefreshCw size={16} />
            Reset ({quantity})
          </Button>
        </div>
      </div>
    </Card>
  );
}
