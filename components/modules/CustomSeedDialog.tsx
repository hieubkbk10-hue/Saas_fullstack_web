/**
 * Custom Seed Dialog Component
 * 
 * Allows users to customize seed configuration for multiple modules
 */

'use client';

import React, { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { toast } from 'sonner';
import { 
  AlertCircle,
  CheckCircle2,
  Database, 
  Info,
  Loader2,
  X,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/app/admin/components/ui/dialog';
import { Button } from '@/app/admin/components/ui/button';
import { Checkbox } from '@/app/admin/components/ui/checkbox';
import { Input } from '@/app/admin/components/ui/input';
import { Label } from '@/app/admin/components/ui/label';
import { ScrollArea } from '@/app/admin/components/ui/scroll-area';
import { Badge } from '@/app/admin/components/ui/badge';

interface CustomSeedDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete?: () => void;
}

const MODULE_GROUPS = [
  {
    category: 'content',
    label: 'Content',
    modules: [
      { defaultQty: 5, key: 'postCategories', name: 'Post Categories' },
      { defaultQty: 20, key: 'posts', name: 'Posts' },
      { defaultQty: 5, key: 'serviceCategories', name: 'Service Categories' },
      { defaultQty: 15, key: 'services', name: 'Services' },
    ],
  },
  {
    category: 'commerce',
    label: 'Commerce',
    modules: [
      { defaultQty: 5, key: 'productCategories', name: 'Product Categories' },
      { defaultQty: 50, key: 'products', name: 'Products' },
      { defaultQty: 30, key: 'orders', name: 'Orders' },
    ],
  },
  {
    category: 'user',
    label: 'Users',
    modules: [
      { defaultQty: 20, key: 'customers', name: 'Customers' },
    ],
  },
];

export function CustomSeedDialog({
  open,
  onOpenChange,
  onComplete,
}: CustomSeedDialogProps) {
  const [selectedModules, setSelectedModules] = useState<Set<string>>(new Set());
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [isSeeding, setIsSeeding] = useState(false);
  const [force, setForce] = useState(false);

  const seedBulk = useMutation(api.seedManager.seedBulk);

  // Initialize quantities when dialog opens
  React.useEffect(() => {
    if (open && Object.keys(quantities).length === 0) {
      const initialQty: Record<string, number> = {};
      MODULE_GROUPS.forEach(group => {
        group.modules.forEach(module => {
          initialQty[module.key] = module.defaultQty;
        });
      });
      setQuantities(initialQty);
    }
  }, [open, quantities]);

  const handleToggleModule = (moduleKey: string, checked: boolean) => {
    setSelectedModules(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(moduleKey);
      } else {
        newSet.delete(moduleKey);
      }
      return newSet;
    });
  };

  const handleSelectAll = (group: typeof MODULE_GROUPS[0]) => {
    setSelectedModules(prev => {
      const newSet = new Set(prev);
      group.modules.forEach(m => newSet.add(m.key));
      return newSet;
    });
  };

  const handleDeselectAll = (group: typeof MODULE_GROUPS[0]) => {
    setSelectedModules(prev => {
      const newSet = new Set(prev);
      group.modules.forEach(m => newSet.delete(m.key));
      return newSet;
    });
  };

  const handleSeed = async () => {
    if (selectedModules.size === 0) {
      toast.error('Chọn ít nhất 1 module để seed');
      return;
    }

    setIsSeeding(true);
    
    try {
      const configs = Array.from(selectedModules).map(module => ({
        force,
        module,
        quantity: quantities[module] || 10,
      }));

      const toastId = toast.loading(`Đang seed ${configs.length} modules...`);
      
      const results = await seedBulk({ configs });
      
      const successCount = results.filter(r => !r.errors || r.errors.length === 0).length;
      const totalCreated = results.reduce((sum, r) => sum + r.created, 0);
      
      toast.success(
        `✅ Seed hoàn tất!\n${successCount}/${configs.length} modules • ${totalCreated} records`,
        { id: toastId }
      );
      
      onComplete?.();
      onOpenChange(false);
      
      // Reset selections
      setSelectedModules(new Set());
      
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Seed thất bại');
    } finally {
      setIsSeeding(false);
    }
  };

  const totalModules = selectedModules.size;
  const totalRecords = Array.from(selectedModules).reduce(
    (sum, key) => sum + (quantities[key] || 0),
    0
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="w-5 h-5 text-cyan-500" />
            Custom Seed Configuration
          </DialogTitle>
          <DialogDescription>
            Chọn modules và cấu hình số lượng records cần seed
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6">
            {MODULE_GROUPS.map(group => (
              <div key={group.category} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                    {group.label}
                  </h4>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSelectAll(group)}
                      className="h-7 text-xs"
                    >
                      Select All
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeselectAll(group)}
                      className="h-7 text-xs"
                    >
                      Deselect
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  {group.modules.map(module => {
                    const isSelected = selectedModules.has(module.key);
                    return (
                      <div
                        key={module.key}
                        className={`
                          flex items-center gap-3 p-3 rounded-lg border transition-colors
                          ${isSelected 
                            ? 'bg-cyan-50 dark:bg-cyan-950/20 border-cyan-200 dark:border-cyan-800' 
                            : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                          }
                        `}
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) => 
                            handleToggleModule(module.key, checked as boolean)
                          }
                          disabled={isSeeding}
                        />
                        
                        <Label 
                          htmlFor={module.key}
                          className="flex-1 cursor-pointer"
                        >
                          {module.name}
                        </Label>
                        
                        <Input
                          type="number"
                          min={1}
                          max={10000}
                          value={quantities[module.key] || module.defaultQty}
                          onChange={(e) =>
                            setQuantities(prev => ({
                              ...prev,
                              [module.key]: parseInt(e.target.value) || 0,
                            }))
                          }
                          disabled={!isSelected || isSeeding}
                          className="w-24 text-center"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Force option */}
            <div className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
              <Checkbox
                checked={force}
                onCheckedChange={(checked) => setForce(checked as boolean)}
                disabled={isSeeding}
              />
              <div className="flex-1">
                <Label className="cursor-pointer font-medium text-amber-900 dark:text-amber-100">
                  Force Clear & Re-seed
                </Label>
                <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                  Xóa data cũ trước khi seed mới
                </p>
              </div>
            </div>

            {/* Info box */}
            <div className="flex gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800 dark:text-blue-300">
                <strong className="block mb-1">Auto-dependencies:</strong>
                <p>
                  Dependencies sẽ được seed tự động nếu chưa có data. 
                  Ví dụ: Khi seed Orders, hệ thống sẽ tự động seed Products và Customers nếu cần.
                </p>
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="border-t pt-4">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-4 text-sm">
              {totalModules > 0 && (
                <>
                  <Badge variant="secondary" className="gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    {totalModules} modules
                  </Badge>
                  <Badge variant="secondary" className="gap-1">
                    <Database className="w-3 h-3" />
                    ~{totalRecords} records
                  </Badge>
                </>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSeeding}
              >
                Hủy
              </Button>
              <Button
                onClick={handleSeed}
                disabled={isSeeding || totalModules === 0}
                className="gap-2"
              >
                {isSeeding ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Đang seed...
                  </>
                ) : (
                  <>
                    <Database className="w-4 h-4" />
                    Seed {totalModules} modules
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
