"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export type ToastType = "success" | "error" | "info" | "gold";

export interface Toast {
  id: string;
  title: string;
  message?: string;
  type: ToastType;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextType {
  showToast: (
    title: string,
    message?: string,
    type?: ToastType,
    action?: { label: string; onClick: () => void }
  ) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback(
    (
      title: string,
      message?: string,
      type: ToastType = "gold",
      action?: { label: string; onClick: () => void }
    ) => {
      const id = `${Date.now()}-${Math.random()}`;
      setToasts((prev) => [...prev, { id, title, message, type, action }]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4500);
    },
    []
  );

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-20 lg:bottom-6 right-0 sm:right-6 left-0 sm:left-auto z-50 flex flex-col gap-3 max-w-[calc(100vw-2rem)] sm:max-w-md w-full pointer-events-none px-4 sm:px-0 mx-auto sm:mx-0">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-2xl backdrop-blur-xl border transition-all ${
                toast.type === "gold"
                  ? "bg-[#16161a]/95 border-[#d4af37]/40 text-[#FAF8F5] shadow-[#d4af37]/10"
                  : toast.type === "success"
                  ? "bg-[#121a14]/95 border-emerald-500/40 text-emerald-100 shadow-emerald-500/10"
                  : toast.type === "error"
                  ? "bg-[#1f1214]/95 border-rose-500/40 text-rose-100 shadow-rose-500/10"
                  : "bg-[#18181c]/95 border-zinc-700 text-zinc-100 shadow-black/50"
              }`}
            >
              <div className="shrink-0 mt-0.5">
                {toast.type === "gold" && <CheckCircle2 className="w-5 h-5 text-[#d4af37]" />}
                {toast.type === "success" && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                {toast.type === "error" && <AlertCircle className="w-5 h-5 text-rose-400" />}
                {toast.type === "info" && <Info className="w-5 h-5 text-blue-400" />}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm tracking-wide">{toast.title}</p>
                {toast.message && (
                  <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">{toast.message}</p>
                )}
                {toast.action && (
                  <div className="mt-2.5 flex items-center gap-2">
                    <button
                      onClick={() => {
                        toast.action?.onClick();
                        removeToast(toast.id);
                      }}
                      className="px-3 py-1 rounded-lg bg-[#D4AF37] hover:bg-[#E5C365] text-black font-bold text-xs uppercase tracking-wider transition-colors shadow"
                    >
                      {toast.action.label}
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={() => removeToast(toast.id)}
                className="shrink-0 text-zinc-500 hover:text-zinc-300 transition-colors p-2.5 -m-1.5 flex items-center justify-center"
                aria-label="Close notification"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    return { showToast: () => {} };
  }
  return context;
}
