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

  // Update the getTypeStyles function
const getTypeStyles = () => {
  switch (type) {
    case "danger":
      return {
        icon: "text-red-500",
        button: "bg-red-600 hover:bg-red-700",
        border: "border-red-500/20",
        iconBg: "bg-red-500/10",
      };
    case "warning":
      return {
        icon: "text-yellow-500",
        button: "bg-yellow-600 hover:bg-yellow-700",
        border: "border-yellow-500/20",
        iconBg: "bg-yellow-500/10",
      };
    case "info":
      return {
        icon: "text-blue-500",
        button: "bg-blue-600 hover:bg-blue-700",
        border: "border-blue-500/20",
        iconBg: "bg-blue-500/10",
      };
    default:
      return {
        icon: "text-blue-500",
        button: "bg-blue-600 hover:bg-blue-700",
        border: "border-blue-500/20",
        iconBg: "bg-blue-500/10",
      };
  }
};

  const styles = getTypeStyles();

  return createPortal(
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        ref={dialogRef}
        className={`relative w-full max-w-md rounded-2xl border ${styles.border} bg-slate-900 p-6 shadow-2xl animate-in zoom-in-95 duration-200`}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 transition hover:bg-slate-800 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Icon */}
        <div className="flex items-center gap-4">
          <div className={`rounded-full bg-slate-800 p-3 ${styles.icon}`}>
            <AlertTriangle className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold text-white">{title}</h3>
        </div>

        {/* Message */}
        <p className="mt-4 text-slate-400">{message}</p>

        {/* Buttons */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-700 px-4 py-2.5 font-medium text-slate-300 transition hover:bg-slate-800"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`flex-1 rounded-xl px-4 py-2.5 font-medium text-white transition active:scale-95 ${styles.button}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}