"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  onClose: (id: string) => void;
}

const Toast = ({ id, type, title, message, duration = 5000, onClose }: ToastProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const startTime = Date.now();
    
    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, duration - elapsed);
      const progressValue = (remaining / duration) * 100;
      setProgress(progressValue);
      
      if (remaining > 0) {
        requestAnimationFrame(updateProgress);
      }
    };
    
    updateProgress();
    
    const timer = setTimeout(() => {
      onClose(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case 'info':
      default:
        return (
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const getColorClasses = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800';
      case 'warning':
        return 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800';
      case 'info':
      default:
        return 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.95 }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.2}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={(_, info) => {
        setIsDragging(false);
        // Если свайп достаточно сильный, закрываем toast
        if (Math.abs(info.offset.x) > 100 || Math.abs(info.velocity.x) > 500) {
          onClose(id);
        }
      }}
             className={`w-full max-w-sm sm:max-w-md shadow-lg rounded-lg border ${getColorClasses()} pointer-events-auto backdrop-blur-sm cursor-grab active:cursor-grabbing ${isDragging ? 'scale-105' : ''} transition-transform relative overflow-hidden`}
    >
               <div className="p-3 sm:p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm sm:text-base font-medium text-[#1E293B] dark:text-white">
              {title}
            </p>
            {message && (
              <p className="mt-1 text-xs sm:text-sm text-[#64748B] dark:text-gray-400">
                {message}
              </p>
            )}
          </div>
          <div className="ml-2 sm:ml-4 flex-shrink-0 flex">
            <button
              className="inline-flex text-[#64748B] dark:text-gray-400 hover:text-[#1E293B] dark:hover:text-white focus:outline-none focus:text-[#1E293B] dark:focus:text-white transition-colors p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/5"
              onClick={() => onClose(id)}
            >
              <span className="sr-only">Закрыть</span>
              <svg className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Прогресс бар */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/10 dark:bg-white/10 rounded-b-lg overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-[#1A6DFF] to-[#00C5FF]"
            initial={{ width: "100%" }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.1, ease: "linear" }}
          />
        </div>
      </div>
    </motion.div>
  );
};

// Компонент контейнера для тостов
export const ToastContainer = ({ toasts, onClose }: { toasts: ToastProps[]; onClose: (id: string) => void }) => {
  return (
    <>
      {/* Десктоп версия - справа вверху */}
      <div className="hidden sm:block fixed top-4 right-4 z-[9999] space-y-2 max-w-sm">
        <AnimatePresence>
          {toasts.map((toast) => (
            <Toast key={toast.id} {...toast} onClose={onClose} />
          ))}
        </AnimatePresence>
      </div>
      
      {/* Мобильная версия - по центру вверху */}
      <div className="sm:hidden fixed top-4 left-4 right-4 z-[9999] space-y-2" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <AnimatePresence>
          {toasts.map((toast, index) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -30, x: 0 }}
              animate={{ opacity: 1, y: 0, x: 0 }}
              exit={{ opacity: 0, y: -30, x: 0 }}
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 30,
                delay: index * 0.1 
              }}
              className="w-full"
            >
              <Toast {...toast} onClose={onClose} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  );
};

export default Toast; 