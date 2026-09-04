'use client';

import { useEffect, useState } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export type ToastMessage = {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
};

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-3 max-w-sm w-full px-4 pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onDismiss }: { toast: ToastMessage; onDismiss: (id: string) => void }) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(() => onDismiss(toast.id), 300);
    }, 4000);

    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const handleClose = () => {
    setExiting(true);
    setTimeout(() => onDismiss(toast.id), 300);
  };

  const getStyle = () => {
    switch (toast.type) {
      case 'success':
        return {
          bg: 'bg-emerald-950/90 border-emerald-500/40 text-emerald-100',
          iconBg: 'bg-emerald-500/20 text-emerald-400',
          icon: '✓',
        };
      case 'error':
        return {
          bg: 'bg-rose-950/90 border-rose-500/40 text-rose-100',
          iconBg: 'bg-rose-500/20 text-rose-400',
          icon: '✕',
        };
      case 'warning':
        return {
          bg: 'bg-amber-950/90 border-amber-500/40 text-amber-100',
          iconBg: 'bg-amber-500/20 text-amber-400',
          icon: '⚠️',
        };
      case 'info':
      default:
        return {
          bg: 'bg-cyan-950/90 border-cyan-500/40 text-cyan-100',
          iconBg: 'bg-cyan-500/20 text-cyan-400',
          icon: 'ℹ️',
        };
    }
  };

  const style = getStyle();

  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border backdrop-blur-xl shadow-2xl transition-all duration-300 transform ${
        exiting ? 'opacity-0 translate-y-2 scale-95' : 'opacity-100 translate-y-0 scale-100'
      } ${style.bg}`}
    >
      <div className={`flex items-center justify-center w-8 h-8 rounded-xl font-bold text-sm shrink-0 ${style.iconBg}`}>
        {style.icon}
      </div>
      <div className="flex-1 pt-0.5">
        <h4 className="text-sm font-bold tracking-wide">{toast.title}</h4>
        {toast.message && <p className="mt-1 text-xs opacity-90 leading-relaxed">{toast.message}</p>}
      </div>
      <button
        onClick={handleClose}
        className="text-xs opacity-60 hover:opacity-100 transition p-1 shrink-0"
        title="Fermer"
      >
        ✕
      </button>
    </div>
  );
}
