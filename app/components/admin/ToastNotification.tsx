'use client';

import { AlertCircle, CheckCircle2, Info, X, XCircle } from 'lucide-react';
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
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm w-full px-4 pointer-events-none">
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
          bg: 'bg-emerald-950/90 border-emerald-500/30 text-emerald-100 shadow-emerald-950/50',
          iconBg: 'bg-emerald-500/20 text-emerald-400',
          IconComponent: CheckCircle2,
        };
      case 'error':
        return {
          bg: 'bg-rose-950/90 border-rose-500/30 text-rose-100 shadow-rose-950/50',
          iconBg: 'bg-rose-500/20 text-rose-400',
          IconComponent: XCircle,
        };
      case 'warning':
        return {
          bg: 'bg-amber-950/90 border-amber-500/30 text-amber-100 shadow-amber-950/50',
          iconBg: 'bg-amber-500/20 text-amber-400',
          IconComponent: AlertCircle,
        };
      case 'info':
      default:
        return {
          bg: 'bg-cyan-950/90 border-cyan-500/30 text-cyan-100 shadow-cyan-950/50',
          iconBg: 'bg-cyan-500/20 text-cyan-400',
          IconComponent: Info,
        };
    }
  };

  const style = getStyle();
  const Icon = style.IconComponent;

  return (
    <div

      className={`pointer-events-auto flex items-start gap-3.5 p-4 rounded-2xl border backdrop-blur-xl shadow-2xl transition-all duration-300 transform ${
        exiting ? 'opacity-0 translate-y-2 scale-95' : 'opacity-100 translate-y-0 scale-100'
      } ${style.bg}`}
    >
      <div className={`flex items-center justify-center w-8 h-8 rounded-xl shrink-0 ${style.iconBg}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 pt-0.5">
        <h4 className="text-xs font-bold uppercase tracking-wider">{toast.title}</h4>
        {toast.message && <p className="mt-1 text-xs opacity-85 leading-relaxed font-normal">{toast.message}</p>}
      </div>
      <button
        onClick={handleClose}
        className="text-slate-400 hover:text-white transition p-1 shrink-0 rounded-lg hover:bg-white/10"
        title="Fermer"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
