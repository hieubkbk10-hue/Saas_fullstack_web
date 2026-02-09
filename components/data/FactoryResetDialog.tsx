import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
} from '@/app/admin/components/ui';

interface FactoryResetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<boolean>;
  isLoading: boolean;
}

export function FactoryResetDialog({ open, onOpenChange, onConfirm, isLoading }: FactoryResetDialogProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [confirmText, setConfirmText] = useState('');

  useEffect(() => {
    if (!open) {
      setStep(1);
      setConfirmText('');
    }
  }, [open]);

  const isValidConfirm = useMemo(() => {
    return confirmText.trim().toLowerCase() === 'chac chan';
  }, [confirmText]);

  const handleConfirm = async () => {
    const success = await onConfirm();
    if (success) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-rose-600">
            <AlertTriangle size={18} /> Factory Reset
          </DialogTitle>
          <DialogDescription>
            Hành động này sẽ xóa sạch toàn bộ dữ liệu trong hệ thống. Không thể hoàn tác.
          </DialogDescription>
        </DialogHeader>

        {step === 1 ? (
          <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
            <p>Bạn chắc chắn muốn tiếp tục?</p>
            <p className="text-rose-600 font-medium">Tất cả bảng dữ liệu sẽ bị xóa sạch.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Nhập <span className="font-semibold text-rose-600">CHAC CHAN</span> để xác nhận.
            </p>
            <Input
              value={confirmText}
              onChange={(event) => setConfirmText(event.target.value)}
              placeholder="CHAC CHAN"
              className="uppercase"
              disabled={isLoading}
            />
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Hủy
          </Button>
          {step === 1 ? (
            <Button type="button" variant="destructive" onClick={() => setStep(2)}>
              Tiếp tục
            </Button>
          ) : (
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirm}
              disabled={!isValidConfirm || isLoading}
            >
              Xóa sạch
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
