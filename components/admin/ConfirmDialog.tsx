"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, X, CheckCircle, Info } from "lucide-react";

type ConfirmDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning" | "info" | "success";
};

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "danger",
}: ConfirmDialogProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

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
      case "success":
        return {
          icon: "text-green-500",
          button: "bg-green-600 hover:bg-green-700",
          border: "border-green-500/20",
          iconBg: "bg-green-500/10",
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

  const getIcon = () => {
    switch (type) {
      case "danger":
        return <AlertTriangle className="h-6 w-6" />;
      case "warning":
        return <AlertTriangle className="h-6 w-6" />;
      case "success":
        return <CheckCircle className="h-6 w-6" />;
      default:
        return <Info className="h-6 w-6" />;
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className={`relative w-full max-w-md rounded-2xl border ${styles.border} bg-slate-900 p-6 shadow-2xl`}>
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 transition hover:bg-slate-800 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-4">
          <div className={`rounded-full bg-slate-800 p-3 ${styles.icon}`}>
            {getIcon()}
          </div>
          <h3 className="text-xl font-bold text-white">{title}</h3>
        </div>

        <p className="mt-4 text-slate-400">{message}</p>

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