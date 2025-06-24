"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

export interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
  duration?: number;
  onClose: (id: string) => void;
}

const Toast = ({ id, type, title, message, duration = 5000, onClose }: ToastProps) => {
  const [isMobile, setIsMobile] = useState(false);
  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);
  const [dragX, setDragX] = useState(0);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    let progressTimer: NodeJS.Timeout;

    if (!isPaused) {
      timer = setTimeout(() => {
        onClose(id);
      }, duration * (progress / 100));

      // Прогресс-бар анимация
      progressTimer = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev - (100 / (duration / 100));
          return newProgress <= 0 ? 0 : newProgress;
        });
      }, 100);
    }

    return () => {
      if (timer) clearTimeout(timer);
      if (progressTimer) clearInterval(progressTimer);
    };
  }, [id, duration, onClose, isPaused, progress]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case 'info':
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const getStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-emerald-50/90 dark:bg-emerald-900/30',
          border: 'border-emerald-200/60 dark:border-emerald-700/50',
          icon: 'text-emerald-600 dark:text-emerald-400',
          title: 'text-emerald-900 dark:text-emerald-100',
          message: 'text-emerald-700 dark:text-emerald-200'
        };
      case 'error':
        return {
          bg: 'bg-rose-50/90 dark:bg-rose-900/30',
          border: 'border-rose-200/60 dark:border-rose-700/50',
          icon: 'text-rose-600 dark:text-rose-400',
          title: 'text-rose-900 dark:text-rose-100',
          message: 'text-rose-700 dark:text-rose-200'
        };
      case 'warning':
        return {
          bg: 'bg-amber-50/90 dark:bg-amber-900/30',
          border: 'border-amber-200/60 dark:border-amber-700/50',
          icon: 'text-amber-600 dark:text-amber-400',
          title: 'text-amber-900 dark:text-amber-100',
          message: 'text-amber-700 dark:text-amber-200'
        };
      case 'info':
      default:
        return {
          bg: 'bg-sky-50/90 dark:bg-sky-900/30',
          border: 'border-sky-200/60 dark:border-sky-700/50',
          icon: 'text-sky-600 dark:text-sky-400',
          title: 'text-sky-900 dark:text-sky-100',
          message: 'text-sky-700 dark:text-sky-200'
        };
    }
  };

  const styles = getStyles();

  return (
    <motion.div
      initial={{ 
        opacity: 0, 
        x: isMobile ? 0 : 100, 
        y: isMobile ? -50 : 0, 
        scale: 0.95 
      }}
      animate={{ 
        opacity: 1, 
        x: 0, 
        y: 0, 
        scale: 1 
      }}
      exit={{ 
        opacity: 0, 
        x: isMobile ? 0 : 100, 
        y: isMobile ? -50 : 0, 
        scale: 0.95 
      }}
            transition={{ 
        type: "spring", 
        duration: 0.4, 
        bounce: 0.3 
      }}
      drag={isMobile ? "x" : false}
      dragConstraints={{ left: -100, right: 100 }}
      onDrag={(event, info) => {
        setDragX(info.offset.x);
        if (Math.abs(info.offset.x) > 50) {
          setIsPaused(true);
        }
      }}
      onDragEnd={(event, info) => {
        if (Math.abs(info.offset.x) > 100) {
          onClose(id);
        } else {
          setDragX(0);
          setIsPaused(false);
        }
      }}
      style={{ x: dragX }}
      className={`relative w-full ${styles.bg} ${styles.border} border rounded-xl shadow-xl backdrop-blur-sm p-4 pointer-events-auto overflow-hidden cursor-pointer select-none`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      >
        <div className="flex items-start gap-3">
          <div className={`flex-shrink-0 ${styles.icon} mt-0.5`}>
            {getIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-semibold ${styles.title} leading-tight`}>
              {title}
            </p>
            {message && (
              <p className={`mt-1 text-sm ${styles.message} leading-relaxed break-words`}>
                {message}
              </p>
            )}
          </div>
          <div className="flex-shrink-0">
            <button
              onClick={() => onClose(id)}
              className={`inline-flex items-center justify-center w-6 h-6 rounded-md ${styles.icon} hover:opacity-75 hover:bg-black/5 dark:hover:bg-white/10 transition-all duration-200`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Прогресс-бар */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/10 dark:bg-white/10 rounded-b-xl overflow-hidden">
          <motion.div
            className={`h-full ${
              type === 'success' ? 'bg-emerald-500 dark:bg-emerald-400' :
              type === 'error' ? 'bg-rose-500 dark:bg-rose-400' :
              type === 'warning' ? 'bg-amber-500 dark:bg-amber-400' :
              'bg-sky-500 dark:bg-sky-400'
            }`}
            initial={{ width: '100%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.1, ease: 'linear' }}
          />
        </div>
      </motion.div>
  );
};

// Toast Container
interface ToastContainerProps {
  toasts: ToastProps[];
  onClose: (id: string) => void;
}

export const ToastContainer = ({ toasts, onClose }: ToastContainerProps) => {
  return (
    <>
      {/* Desktop и Tablet версия - справа */}
      <div className="hidden sm:block fixed top-4 right-4 z-[9999] space-y-3 w-80 max-w-sm pointer-events-none">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <Toast key={toast.id} {...toast} onClose={onClose} />
          ))}
        </AnimatePresence>
      </div>

      {/* Mobile версия - сверху по центру */}
      <div className="sm:hidden fixed top-4 left-4 right-4 z-[9999] space-y-3 pointer-events-none">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <Toast key={toast.id} {...toast} onClose={onClose} />
          ))}
        </AnimatePresence>
      </div>
    </>
  );
};

// Hook для управления toast уведомлениями
export const useToast = () => {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const addToast = (toast: Omit<ToastProps, 'id' | 'onClose'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { ...toast, id, onClose: removeToast }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const success = (title: string, message?: string) => {
    addToast({ type: 'success', title, message });
  };

  const error = (title: string, message?: string) => {
    addToast({ type: 'error', title, message });
  };

  const warning = (title: string, message?: string) => {
    addToast({ type: 'warning', title, message });
  };

  const info = (title: string, message?: string) => {
    addToast({ type: 'info', title, message });
  };

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info
  };
};
