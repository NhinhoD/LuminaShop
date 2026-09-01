"use client";

import { useToastStore, ToastItem, ToastType } from "@/presentation/hooks/useToastStore";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from "lucide-react";
import React from "react";

const TOAST_CONFIGS: Record<
  ToastType,
  {
    icon: React.ComponentType<{ size?: number; className?: string }>;
    iconColor: string;
    bgColor: string;
    borderColor: string;
    badgeColor: string;
    progressBarColor: string;
  }
> = {
  success: {
    icon: CheckCircle2,
    iconColor: "text-emerald-500",
    bgColor: "bg-white/95 dark:bg-slate-900/95",
    borderColor: "border-emerald-500/30",
    badgeColor: "bg-emerald-500/10 text-emerald-600",
    progressBarColor: "bg-emerald-500",
  },
  error: {
    icon: AlertCircle,
    iconColor: "text-red-500",
    bgColor: "bg-white/95 dark:bg-slate-900/95",
    borderColor: "border-red-500/30",
    badgeColor: "bg-red-500/10 text-red-600",
    progressBarColor: "bg-red-500",
  },
  warning: {
    icon: AlertTriangle,
    iconColor: "text-amber-500",
    bgColor: "bg-white/95 dark:bg-slate-900/95",
    borderColor: "border-amber-500/30",
    badgeColor: "bg-amber-500/10 text-amber-600",
    progressBarColor: "bg-amber-500",
  },
  info: {
    icon: Info,
    iconColor: "text-[#0051d5]",
    bgColor: "bg-white/95 dark:bg-slate-900/95",
    borderColor: "border-blue-500/30",
    badgeColor: "bg-blue-500/10 text-[#0051d5]",
    progressBarColor: "bg-[#0051d5]",
  },
};

function ToastMessage({ toast, onRemove }: { toast: ToastItem; onRemove: (id: string) => void }) {
  const config = TOAST_CONFIGS[toast.type] || TOAST_CONFIGS.info;
  const IconComponent = config.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 400, damping: 28 }}
      className={`relative overflow-hidden w-full sm:w-[380px] p-4 rounded-2xl shadow-2xl backdrop-blur-xl border ${config.borderColor} ${config.bgColor} font-manrope pointer-events-auto flex items-start gap-3.5 group`}
    >
      {/* Icon Container */}
      <div className={`p-2 rounded-xl ${config.badgeColor} flex-shrink-0 mt-0.5`}>
        <IconComponent size={20} className={config.iconColor} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pr-4">
        <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-xs md:text-sm leading-snug">
          {toast.title}
        </h4>
        {toast.description && (
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 leading-relaxed line-clamp-2">
            {toast.description}
          </p>
        )}
      </div>

      {/* Close Button */}
      <button
        onClick={() => onRemove(toast.id)}
        className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex-shrink-0 cursor-pointer"
        aria-label="Close notification"
        type="button"
      >
        <X size={14} />
      </button>

      {/* Animated Progress Bar */}
      {toast.duration && toast.duration > 0 && (
        <motion.div
          initial={{ width: "100%" }}
          animate={{ width: "0%" }}
          transition={{ duration: toast.duration / 1000, ease: "linear" }}
          className={`absolute bottom-0 left-0 h-[2.5px] ${config.progressBarColor} opacity-70`}
        />
      )}
    </motion.div>
  );
}

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div
      aria-live="polite"
      className="fixed top-5 right-5 z-[99999] flex flex-col items-end gap-3 max-w-full pointer-events-none p-4 sm:p-0"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((item) => (
          <ToastMessage key={item.id} toast={item} onRemove={removeToast} />
        ))}
      </AnimatePresence>
    </div>
  );
}
