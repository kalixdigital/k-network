"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type ToastType = "success" | "error" | "info" | "warning";

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose?: () => void;
}

interface ToastState extends ToastProps {
  id: string;
}

// Toast container component
export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastState[]>([]);

  const addToast = (toast: ToastProps) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
    
    if (toast.duration !== 0) {
      setTimeout(() => {
        removeToast(id);
      }, toast.duration || 3000);
    }
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  useEffect(() => {
    // @ts-ignore
    window.addToast = addToast;
    return () => {
      // @ts-ignore
      delete window.addToast;
    };
  }, []);

  if (toasts.length === 0) return null;

  return createPortal(
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none">
      <div className="pointer-events-auto">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </div>,
    document.body
  );
}

// Individual toast component
function Toast({ message, type = "info", onClose }: ToastProps & { onClose: () => void }) {
  const [isVisible, setIsVisible] = useState(true);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const getStyles = () => {
    switch (type) {
      case "success":
        return "bg-emerald-600 border-emerald-500";
      case "error":
        return "bg-red-600 border-red-500";
      case "warning":
        return "bg-yellow-600 border-yellow-500";
      default:
        return "bg-blue-600 border-blue-500";
    }
  };

  const getIcon = () => {
    switch (type) {
      case "success":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case "error":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      case "warning":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  return (
    <div
      className={`transform transition-all duration-300 ${isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"} mb-2`}
    >
      <div className={`rounded-lg border ${getStyles()} text-white p-4 shadow-lg flex items-start gap-3`}>
        <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>
        <p className="flex-1 text-sm font-medium">{message}</p>
        <button
          onClick={handleClose}
          className="flex-shrink-0 text-white/70 hover:text-white transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// Helper functions to show toasts
export const showToast = {
  success: (message: string, duration?: number) => {
    // @ts-ignore
    if (window.addToast) {
      // @ts-ignore
      window.addToast({ message, type: "success", duration });
    } else {
      console.log("Toast success:", message);
    }
  },
  error: (message: string, duration?: number) => {
    // @ts-ignore
    if (window.addToast) {
      // @ts-ignore
      window.addToast({ message, type: "error", duration });
    } else {
      console.error("Toast error:", message);
    }
  },
  info: (message: string, duration?: number) => {
    // @ts-ignore
    if (window.addToast) {
      // @ts-ignore
      window.addToast({ message, type: "info", duration });
    } else {
      console.log("Toast info:", message);
    }
  },
  warning: (message: string, duration?: number) => {
    // @ts-ignore
    if (window.addToast) {
      // @ts-ignore
      window.addToast({ message, type: "warning", duration });
    } else {
      console.warn("Toast warning:", message);
    }
  },
};