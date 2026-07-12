"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning" | "info";
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Yes, Remove",
  cancelText = "Cancel",
  type = "danger",
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      // Prevent body scroll
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case "danger":
        return {
          icon: "text-red-500",
          button: "bg-red-600 hover:bg-red-700 active:bg-red-800",
          border: "border-red-500/20",
          iconBg: "bg-red-500/10",
        };
      case "warning":
        return {
          icon: "text-yellow-500",
          button: "bg-yellow-600 hover:bg-yellow-700 active:bg-yellow-800",
          border: "border-yellow-500/20",
          iconBg: "bg-yellow-500/10",
        };
      case "info":
        return {
          icon: "text-blue-500",
          button: "bg-blue-600 hover:bg-blue-700 active:bg-blue-800",
          border: "border-blue-500/20",
          iconBg: "bg-blue-500/10",
        };
      default:
        return {
          icon: "text-blue-500",
          button: "bg-blue-600 hover:bg-blue-700 active:bg-blue-800",
          border: "border-blue-500/20",
          iconBg: "bg-blue-500/10",
        };
    }
  };

  const styles = getTypeStyles();

  return createPortal(
    <div className="fixed inset-0 z-[999] flex items-end justify-center p-4 sm:items-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        ref={dialogRef}
        className={`relative w-full max-w-md rounded-2xl border ${styles.border} bg-slate-900 p-5 shadow-2xl animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200`}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-white active:bg-slate-700"
          aria-label="Close dialog"
        >
          <X className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>

        {/* Icon & Title - Stacked on mobile, side by side on desktop */}
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start sm:gap-4">
          <div className={`rounded-full p-2.5 sm:p-3 ${styles.iconBg} ${styles.icon} flex-shrink-0`}>
            <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div className="text-center sm:text-left">
            <h3 className="text-lg font-bold text-white sm:text-xl">{title}</h3>
          </div>
        </div>

        {/* Message */}
        <p className="mt-3 text-center text-sm text-slate-400 sm:mt-4 sm:text-left sm:text-base">
          {message}
        </p>

        {/* Buttons - Stacked on mobile, side by side on desktop */}
        <div className="mt-4 flex flex-col gap-2 sm:mt-6 sm:flex-row sm:gap-3">
          <button
            onClick={onClose}
            className="order-2 rounded-xl border border-slate-700 px-4 py-3 font-medium text-slate-300 transition hover:bg-slate-800 active:scale-95 sm:order-1 sm:flex-1 sm:py-2.5"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`order-1 rounded-xl px-4 py-3 font-medium text-white transition active:scale-95 sm:order-2 sm:flex-1 sm:py-2.5 ${styles.button}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}