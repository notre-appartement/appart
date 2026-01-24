'use client';

import { useState, useCallback } from 'react';
import ConfirmDialog, { ConfirmDialogType } from '@/components/ConfirmDialog';

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: ConfirmDialogType;
}

export function useConfirmDialog() {
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    options: ConfirmOptions;
    resolve: ((value: boolean) => void) | null;
  }>({
    isOpen: false,
    options: { message: '' },
    resolve: null,
  });

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setDialogState({
        isOpen: true,
        options,
        resolve,
      });
    });
  }, []);

  const handleClose = useCallback(() => {
    if (dialogState.resolve) {
      dialogState.resolve(false);
    }
    setDialogState({
      isOpen: false,
      options: { message: '' },
      resolve: null,
    });
  }, [dialogState.resolve]);

  const handleConfirm = useCallback(() => {
    if (dialogState.resolve) {
      dialogState.resolve(true);
    }
    setDialogState({
      isOpen: false,
      options: { message: '' },
      resolve: null,
    });
  }, [dialogState.resolve]);

  const Dialog = (
    <ConfirmDialog
      isOpen={dialogState.isOpen}
      onClose={handleClose}
      onConfirm={handleConfirm}
      title={dialogState.options.title || 'Confirmation'}
      message={dialogState.options.message}
      confirmText={dialogState.options.confirmText}
      cancelText={dialogState.options.cancelText}
      type={dialogState.options.type}
    />
  );

  return { confirm, Dialog };
}
