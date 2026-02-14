import React, { useEffect } from 'react';
import { CheckCircle, X, RotateCcw } from 'lucide-react';

interface NotificationToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  onUndo?: () => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  message,
  isVisible,
  onClose,
  onUndo
}) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, 5000); // Auto close after 5s
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[70] flex items-center gap-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-5 py-3.5 rounded-xl shadow-xl animate-in slide-in-from-bottom-5 duration-300">
      <CheckCircle size={20} className="text-emerald-400 dark:text-emerald-600" />
      <span className="text-sm font-medium pr-2">{message}</span>
      {onUndo && (
        <>
          <div className="w-px h-4 bg-white/20 dark:bg-slate-900/20 mx-1"></div>
          <button 
            onClick={() => { onUndo(); onClose(); }} 
            className="text-xs font-bold text-indigo-300 dark:text-indigo-600 hover:text-white dark:hover:text-indigo-800 transition-colors flex items-center gap-1.5 px-1"
          >
            <RotateCcw size={14} /> Undo
          </button>
        </>
      )}
      <button onClick={onClose} className="ml-2 text-slate-400 hover:text-white dark:text-slate-500 dark:hover:text-slate-900 transition-colors">
        <X size={16} />
      </button>
    </div>
  );
};