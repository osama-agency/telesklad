'use client';

import React, { useEffect, useRef } from 'react';
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
  const sheetRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef<number>(0);
  const currentYRef = useRef<number>(0);
  const isDraggingRef = useRef<boolean>(false);

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

  const handleTouchStart = (e: React.TouchEvent) => {
    startYRef.current = e.touches[0].clientY;
    currentYRef.current = 0;
    isDraggingRef.current = true;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingRef.current) return;

    const currentY = e.touches[0].clientY;
    const diffY = currentY - startYRef.current;

    // Только позволяем свайп вниз
    if (diffY > 0) {
      currentYRef.current = diffY;
      if (sheetRef.current) {
        sheetRef.current.style.transform = `translateY(${diffY}px)`;
      }
    }
  };

  const handleTouchEnd = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;

    // Если свайп больше 100px, закрываем модальное окно
    if (currentYRef.current > 100) {
      onClose();
    } else {
      // Возвращаем в исходное положение
      if (sheetRef.current) {
        sheetRef.current.style.transform = 'translateY(0)';
      }
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="sheet-overlay" onClick={handleBackdropClick}>
      <div 
        ref={sheetRef}
        className={`sheet-content ${className}`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Drag Handle */}
        <div className="sheet-drag-handle">
          <div className="sheet-drag-indicator" />
        </div>

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
          background-color: rgba(0, 0, 0, 0.5);
          z-index: 9999;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          animation: sheet-fade-in 0.3s ease-out;
        }

        .sheet-content {
          background: white;
          border-radius: 20px 20px 0 0;
          max-width: 500px;
          width: 100%;
          max-height: 90vh;
          overflow: hidden;
          animation: sheet-slide-up 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          transition: transform 0.2s ease-out;
        }

        .sheet-drag-handle {
          padding: 12px 0 8px;
          display: flex;
          justify-content: center;
          cursor: grab;
        }

        .sheet-drag-indicator {
          width: 40px;
          height: 4px;
          background-color: #E5E7EB;
          border-radius: 2px;
        }

        .sheet-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 20px 16px;
          border-bottom: 1px solid #F3F4F6;
        }

        .sheet-title {
          font-size: 18px;
          font-weight: 600;
          color: #1F2937;
          margin: 0;
        }

        .sheet-close-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border: none;
          background: #F9FAFB;
          border-radius: 8px;
          color: #6B7280;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .sheet-close-btn:hover {
          background: #F3F4F6;
          color: #374151;
        }

        .sheet-close-btn:active {
          transform: scale(0.95);
        }

        .sheet-body {
          padding: 20px;
          max-height: calc(90vh - 120px);
          overflow-y: auto;
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
          }
          
          .sheet-body {
            padding: 16px;
            max-height: calc(95vh - 100px);
          }
          
          .sheet-header {
            padding: 0 16px 12px;
          }
        }
      `}</style>
    </div>
  );
};

export default Sheet; 