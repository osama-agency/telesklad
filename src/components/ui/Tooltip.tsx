"use client";

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
  delay?: number;
}

export const Tooltip: React.FC<TooltipProps> = ({ 
  content, 
  children, 
  position = 'top',
  className = '',
  delay = 500
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const updatePosition = () => {
    if (!triggerRef.current) return;

    const rect = triggerRef.current.getBoundingClientRect();
    const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;

    let x = 0;
    let y = 0;

    switch (position) {
      case 'top':
        x = rect.left + rect.width / 2 + scrollX;
        y = rect.top + scrollY - 10;
        break;
      case 'bottom':
        x = rect.left + rect.width / 2 + scrollX;
        y = rect.bottom + scrollY + 10;
        break;
      case 'left':
        x = rect.left + scrollX - 10;
        y = rect.top + rect.height / 2 + scrollY;
        break;
      case 'right':
        x = rect.right + scrollX + 10;
        y = rect.top + rect.height / 2 + scrollY;
        break;
    }

    setTooltipPosition({ x, y });
  };

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
      updatePosition();
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  useEffect(() => {
    if (isVisible) {
      const handleScroll = () => updatePosition();
      const handleResize = () => updatePosition();
      
      window.addEventListener('scroll', handleScroll);
      window.addEventListener('resize', handleResize);
      
      return () => {
        window.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [isVisible]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const getTooltipClasses = () => {
    const baseClasses = "bg-gray-900 text-white text-sm rounded-xl py-3 px-4 max-w-xs whitespace-normal shadow-2xl border border-gray-600 font-medium leading-relaxed pointer-events-none transition-all duration-200 backdrop-blur-sm";
    
    switch (position) {
      case 'top':
        return `${baseClasses} transform -translate-x-1/2 -translate-y-full`;
      case 'bottom':
        return `${baseClasses} transform -translate-x-1/2`;
      case 'left':
        return `${baseClasses} transform -translate-x-full -translate-y-1/2`;
      case 'right':
        return `${baseClasses} transform -translate-y-1/2`;
      default:
        return baseClasses;
    }
  };

  const getArrowClasses = () => {
    const baseArrowClasses = "absolute w-0 h-0";
    
    switch (position) {
      case 'top':
        return `${baseArrowClasses} top-full left-1/2 transform -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900`;
      case 'bottom':
        return `${baseArrowClasses} bottom-full left-1/2 transform -translate-x-1/2 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-gray-900`;
      case 'left':
        return `${baseArrowClasses} left-full top-1/2 transform -translate-y-1/2 border-t-4 border-b-4 border-l-4 border-t-transparent border-b-transparent border-l-gray-900`;
      case 'right':
        return `${baseArrowClasses} right-full top-1/2 transform -translate-y-1/2 border-t-4 border-b-4 border-r-4 border-t-transparent border-b-transparent border-r-gray-900`;
      default:
        return baseArrowClasses;
    }
  };

  const tooltipElement = isVisible && typeof window !== 'undefined' ? (
    <div
      className="fixed z-[99999] animate-in fade-in-0 zoom-in-95 duration-200"
      style={{
        left: tooltipPosition.x,
        top: tooltipPosition.y,
      }}
    >
      <div className={getTooltipClasses()}>
        {content}
        <div className={getArrowClasses()}></div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <div 
        ref={triggerRef}
        className={`relative inline-block ${className}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </div>
      {tooltipElement && createPortal(tooltipElement, document.body)}
    </>
  );
}; 