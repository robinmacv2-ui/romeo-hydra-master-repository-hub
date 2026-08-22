import React from 'react';
import { Toast } from '../types';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

interface ToastContainerProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none font-mono text-xs">
      {toasts.map((toast) => {
        const getIcon = () => {
          switch (toast.type) {
            case 'success':
              return <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />;
            case 'warning':
              return <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />;
            case 'error':
              return <XCircle className="w-5 h-5 text-rose-400 shrink-0" />;
            case 'info':
              return <Info className="w-5 h-5 text-cyan-400 shrink-0" />;
          }
        };

        const getStyles = () => {
          switch (toast.type) {
            case 'success':
              return 'bg-slate-900 border-emerald-500/50 text-slate-100 shadow-[0_0_20px_rgba(16,185,129,0.2)]';
            case 'warning':
              return 'bg-slate-900 border-amber-500/50 text-slate-100 shadow-[0_0_20px_rgba(245,158,11,0.2)]';
            case 'error':
              return 'bg-slate-900 border-rose-500/50 text-slate-100 shadow-[0_0_20px_rgba(239,68,68,0.2)]';
            case 'info':
              return 'bg-slate-900 border-cyan-500/50 text-slate-100 shadow-[0_0_20px_rgba(6,182,212,0.2)]';
          }
        };

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-3 rounded-xl border flex items-start gap-3 shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-5 duration-200 ${getStyles()}`}
          >
            {getIcon()}
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-xs truncate">{toast.title}</h4>
              <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">{toast.message}</p>
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="text-slate-500 hover:text-slate-300 p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
