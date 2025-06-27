'use client';

import React, { useEffect } from 'react';
import { IconComponent } from '@/components/webapp/IconComponent';

interface SheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

const Sheet: React.FC<SheetProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  className = '' 
}) => {
  useEffect(() => {
    if (isOpen) {
      // Предотвращаем скролл body когда модальное окно открыто
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="sheet-overlay" onClick={handleBackdropClick}>
      <div 
        className={`sheet-content ${className}`}
      >
        {/* Header */}
        {title && (
          <div className="sheet-header">
            <h3 className="sheet-title">{title}</h3>
            <button 
              onClick={onClose}
              className="sheet-close-btn"
              aria-label="Закрыть"
            >
              <IconComponent name="close" size={20} />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="sheet-body">
          {children}
        </div>
      </div>

      <style jsx>{`
        .sheet-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: var(--tg-overlay-bg, rgba(0, 0, 0, 0.5));
          z-index: 9999;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          animation: sheet-fade-in 0.3s ease-out;
        }

        .sheet-content {
          background: var(--tg-background, white);
          border-radius: 24px 24px 0 0;
          max-width: 500px;
          width: 100%;
          max-height: 90vh;
          overflow: hidden;
          animation: sheet-slide-up 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border: 1px solid var(--tg-border, transparent);
          border-bottom: none;
          box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
        }

        .sheet-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 24px 24px 20px;
          border-bottom: 1px solid var(--tg-border, #F3F4F6);
          background: var(--tg-background, white);
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .sheet-title {
          font-size: 20px;
          font-weight: 600;
          color: var(--tg-text, #1F2937);
          margin: 0;
          line-height: 1.2;
        }

        .sheet-close-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border: none;
          background: var(--tg-surface, #F9FAFB);
          border-radius: 10px;
          color: var(--tg-text-secondary, #6B7280);
          cursor: pointer;
          transition: all var(--tg-transition-fast, 0.2s ease);
          flex-shrink: 0;
          margin-left: 16px;
        }

        .sheet-close-btn:hover {
          background: var(--tg-border, #F3F4F6);
          color: var(--tg-text, #374151);
          transform: scale(1.05);
        }

        .sheet-close-btn:active {
          transform: scale(0.95);
        }

        .sheet-body {
          padding: 24px;
          padding-bottom: 32px;
          max-height: calc(90vh - 80px);
          overflow-y: auto;
          color: var(--tg-text, inherit);
          -webkit-overflow-scrolling: touch;
        }

        /* Стили скроллбара */
        .sheet-body::-webkit-scrollbar {
          width: 6px;
        }

        .sheet-body::-webkit-scrollbar-track {
          background: transparent;
        }

        .sheet-body::-webkit-scrollbar-thumb {
          background: var(--tg-border, #E5E7EB);
          border-radius: 3px;
        }

        .sheet-body::-webkit-scrollbar-thumb:hover {
          background: var(--tg-text-secondary, #9CA3AF);
        }

        @keyframes sheet-fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes sheet-slide-up {
          from {
            opacity: 0;
            transform: translateY(100%);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Адаптивность */
        @media (max-width: 640px) {
          .sheet-content {
            max-height: 95vh;
            border-radius: 20px 20px 0 0;
          }
          
          .sheet-header {
            padding: 20px 20px 16px;
          }
          
          .sheet-title {
            font-size: 18px;
          }
          
          .sheet-close-btn {
            width: 32px;
            height: 32px;
          }
          
          .sheet-body {
            padding: 20px;
            padding-bottom: 28px;
            max-height: calc(95vh - 72px);
          }
        }

        /* Безопасные отступы для iOS */
        @supports (padding-bottom: env(safe-area-inset-bottom)) {
          .sheet-body {
            padding-bottom: calc(32px + env(safe-area-inset-bottom));
          }
          
          @media (max-width: 640px) {
            .sheet-body {
              padding-bottom: calc(28px + env(safe-area-inset-bottom));
            }
          }
        }

        /* Дополнительные переменные для темной темы */
        :root {
          --tg-overlay-bg: rgba(0, 0, 0, 0.5);
        }

        [data-theme="dark"],
        .tg-dark {
          --tg-overlay-bg: rgba(0, 0, 0, 0.7);
        }
        
        .tg-dark .sheet-content {
          box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.3);
        }
      `}</style>
    </div>
  );
};

export default Sheet; 