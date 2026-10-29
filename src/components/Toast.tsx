import React from 'react';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

interface ToastProps {
  message: string | null;
  type?: 'success' | 'error' | 'info';
  onClose?: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'success' }) => {
  if (!message) return null;

  return (
    <div className="fixed top-16 inset-x-0 z-50 flex justify-center px-4 pointer-events-none animate-slide-down">
      <div className="bg-gray-900 border border-cyan-500/50 shadow-2xl shadow-cyan-500/20 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 text-xs sm:text-sm font-medium backdrop-blur-md">
        {type === 'success' && <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0" />}
        {type === 'error' && <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />}
        {type === 'info' && <Info className="h-4 w-4 text-amber-400 shrink-0" />}
        <span>{message}</span>
      </div>
    </div>
  );
};
