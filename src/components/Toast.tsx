import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';
import { ToastNotification } from '../types';

interface ToastProps {
  toasts: ToastNotification[];
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          const type = toast.type || 'info';
          let borderBg = 'bg-[#1e293b] text-white border-amber-400';
          let Icon = Info;
          let badgeColor = 'bg-amber-400 text-black';

          if (type === 'success') {
            borderBg = 'bg-[#102a1d] text-emerald-100 border-emerald-400';
            Icon = CheckCircle2;
            badgeColor = 'bg-emerald-400 text-black';
          } else if (type === 'error') {
            borderBg = 'bg-[#2d1215] text-rose-100 border-rose-500';
            Icon = XCircle;
            badgeColor = 'bg-rose-500 text-white';
          } else if (type === 'warning') {
            borderBg = 'bg-[#2e2305] text-amber-100 border-amber-400';
            Icon = AlertTriangle;
            badgeColor = 'bg-amber-400 text-black';
          }

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.9 }}
              className={`pointer-events-auto flex items-start justify-between gap-3 p-4 border-3 shadow-[5px_5px_0px_0px_#000000] rounded-none ${borderBg}`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-1.5 font-bold ${badgeColor}`}>
                  <Icon className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm uppercase tracking-wide leading-tight">
                    {toast.title}
                  </h4>
                  {toast.message && (
                    <p className="text-xs font-mono mt-1 opacity-90">{toast.message}</p>
                  )}
                </div>
              </div>

              <button
                onClick={() => onDismiss(toast.id)}
                className="p-1 hover:bg-black/30 transition-colors border border-transparent hover:border-white/20"
                aria-label="Close notification"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
