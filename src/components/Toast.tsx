import React, { useEffect } from 'react';
import { AlertCircle, CheckCircle, X, AlertTriangle } from 'lucide-react';
import { cn } from '../utils/cn';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  id: string;
  type: ToastType;
  message: string;
  onClose: (id: string) => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({ id, type, message, onClose, duration = 5000 }) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [id, duration, onClose]);

  const icons = {
    success: <CheckCircle className="h-5 w-5 text-green-400" />,
    error: <AlertCircle className="h-5 w-5 text-red-400" />,
    warning: <AlertTriangle className="h-5 w-5 text-yellow-400" />,
    info: <AlertCircle className="h-5 w-5 text-blue-400" />,
  };

  const styles = {
    success: 'bg-green-900/90 border-green-500/50',
    error: 'bg-red-900/90 border-red-500/50',
    warning: 'bg-yellow-900/90 border-yellow-500/50',
    info: 'bg-blue-900/90 border-blue-500/50',
  };

  return (
    <div
      className={cn(
        'flex items-start space-x-3 p-4 rounded-lg border backdrop-blur-sm shadow-lg',
        'animate-in slide-in-from-right-full duration-300',
        styles[type]
      )}
    >
      <div className="flex-shrink-0 mt-0.5">{icons[type]}</div>
      <div className="flex-1 text-sm text-gray-100">{message}</div>
      <button
        onClick={() => onClose(id)}
        className="flex-shrink-0 text-gray-400 hover:text-gray-200 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

interface ToastContainerProps {
  toasts: Array<{ id: string; type: ToastType; message: string }>;
  onClose: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onClose }) => {
  return (
    <div className="fixed top-20 right-6 z-[100] flex flex-col space-y-3 max-w-md">
      {toasts.map(toast => (
        <Toast key={toast.id} {...toast} onClose={onClose} />
      ))}
    </div>
  );
};

