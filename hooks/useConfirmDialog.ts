"use client";

import { useState, useCallback } from "react";

interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning" | "info";
}

export function useConfirmDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions>({
    title: "",
    message: "",
    confirmText: "Yes, Remove",
    cancelText: "Cancel",
    type: "danger",
  });
  const [resolveFn, setResolveFn] = useState<((value: boolean) => void) | null>(null);

  const showConfirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setOptions(options);
      setIsOpen(true);
      setResolveFn(() => resolve);
    });
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    if (resolveFn) {
      resolveFn(false);
      setResolveFn(null);
    }
  }, [resolveFn]);

  const handleConfirm = useCallback(() => {
    setIsOpen(false);
    if (resolveFn) {
      resolveFn(true);
      setResolveFn(null);
    }
  }, [resolveFn]);

  return {
    showConfirm,
    isOpen,
    handleClose,
    handleConfirm,
    options,
  };
}