"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "info";

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
}

interface ToastContextType {
  toasts: ToastItem[];
  showToast: (type: ToastType, title: string, description?: string, duration?: number) => void;
  removeToast: (id: string) => void;
  success: (title: string, description?: string, duration?: number) => void;
  error: (title: string, description?: string, duration?: number) => void;
  info: (title: string, description?: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

function ToastCard({
  item,
  onDismiss,
}: {
  item: ToastItem;
  onDismiss: (id: string) => void;
}) {
  const { id, type, title, description, duration = 4000 } = item;

  useEffect(() => {
    if (duration <= 0) return;
    const timer = setTimeout(() => {
      onDismiss(id);
    }, duration);
    return () => clearTimeout(timer);
  }, [id, duration, onDismiss]);

  const typeConfig = {
    success: {
      border: "border-emerald-500/40 dark:border-emerald-500/40",
      bg: "bg-white/95 dark:bg-slate-900/95",
      iconBg: "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400",
      icon: CheckCircle2,
      accent: "bg-emerald-500",
    },
    error: {
      border: "border-rose-500/40 dark:border-rose-500/40",
      bg: "bg-white/95 dark:bg-slate-900/95",
      iconBg: "bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400",
      icon: AlertCircle,
      accent: "bg-rose-500",
    },
    info: {
      border: "border-blue-500/40 dark:border-blue-500/40",
      bg: "bg-white/95 dark:bg-slate-900/95",
      iconBg: "bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400",
      icon: Info,
      accent: "bg-blue-500",
    },
  };

  const config = typeConfig[type];
  const IconComponent = config.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 15, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 450, damping: 30 }}
      role={type === "error" ? "alert" : "status"}
      aria-live="polite"
      className={`pointer-events-auto relative overflow-hidden flex items-start gap-3 p-4 rounded-xl border shadow-xl backdrop-blur-md transition-colors ${config.bg} ${config.border}`}
    >
      <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${config.iconBg}`}>
        <IconComponent className="w-5 h-5" />
      </div>

      <div className="flex-1 min-w-0 pr-2">
        <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-snug">
          {title}
        </h4>
        {description && (
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed break-words">
            {description}
          </p>
        )}
      </div>

      <button
        onClick={() => onDismiss(id)}
        className="flex-shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 rounded-md"
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Subtle indicator bar */}
      <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${config.accent} opacity-60`} />
    </motion.div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (type: ToastType, title: string, description?: string, duration = 4000) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      setToasts((prev) => [...prev, { id, type, title, description, duration }]);
    },
    []
  );

  const success = useCallback(
    (title: string, description?: string, duration = 4000) => {
      showToast("success", title, description, duration);
    },
    [showToast]
  );

  const error = useCallback(
    (title: string, description?: string, duration = 4000) => {
      showToast("error", title, description, duration);
    },
    [showToast]
  );

  const info = useCallback(
    (title: string, description?: string, duration = 4000) => {
      showToast("info", title, description, duration);
    },
    [showToast]
  );

  return (
    <ToastContext.Provider
      value={{
        toasts,
        showToast,
        removeToast,
        success,
        error,
        info,
      }}
    >
      {children}
      {/* Toast container portal/viewport */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        <AnimatePresence mode="popLayout">
          {toasts.map((item) => (
            <ToastCard key={item.id} item={item} onDismiss={removeToast} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }

  const toastMethods = {
    success: context.success,
    error: context.error,
    info: context.info,
  };

  return {
    toast: toastMethods,
    success: context.success,
    error: context.error,
    info: context.info,
    toasts: context.toasts,
    removeToast: context.removeToast,
  };
}
