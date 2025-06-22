"use client";

import { useState, useEffect } from 'react';

export interface HeaderBreakpoints {
  isMobile: boolean;
  isTablet: boolean;
  isSmallDesktop: boolean;
  isMediumDesktop: boolean;
  isLargeDesktop: boolean;
  isDesktop: boolean;
  width: number;
  // Специальные состояния для элементов header
  showFullDatePicker: boolean;
  showCompactDatePicker: boolean;
  showNotifications: boolean;
  showFullNavigation: boolean;
  showCompactNavigation: boolean;
}

export function useHeaderResponsive() {
  const [breakpoints, setBreakpoints] = useState<HeaderBreakpoints>({
    isMobile: false,
    isTablet: false,
    isSmallDesktop: false,
    isMediumDesktop: false,
    isLargeDesktop: true,
    isDesktop: true,
    width: 1024,
    showFullDatePicker: true,
    showCompactDatePicker: false,
    showNotifications: true,
    showFullNavigation: true,
    showCompactNavigation: false
  });
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const updateBreakpoints = () => {
      const width = window.innerWidth;
      
      // Основные breakpoints
      const isMobile = width < 640;
      const isTablet = width >= 640 && width < 1024;
      const isSmallDesktop = width >= 1024 && width < 1200;
      const isMediumDesktop = width >= 1200 && width < 1440;
      const isLargeDesktop = width >= 1440;
      const isDesktop = width >= 1024;
      
      // Логика для элементов header
      const showFullDatePicker = width >= 1200; // Полный DatePicker только на больших экранах
      const showCompactDatePicker = width >= 900 && width < 1200; // Компактный на средних
      const showNotifications = width >= 768; // Уведомления на планшетах и выше
      const showFullNavigation = width >= 1024; // Полная навигация на десктопах
      const showCompactNavigation = width >= 768 && width < 1024; // Компактная на планшетах
      
      setBreakpoints({
        isMobile,
        isTablet,
        isSmallDesktop,
        isMediumDesktop,
        isLargeDesktop,
        isDesktop,
        width,
        showFullDatePicker,
        showCompactDatePicker,
        showNotifications,
        showFullNavigation,
        showCompactNavigation
      });
    };

    // Initial check
    updateBreakpoints();
    
    // Add event listener with throttling
    let timeoutId: NodeJS.Timeout;
    const throttledUpdate = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateBreakpoints, 100);
    };
    
    window.addEventListener('resize', throttledUpdate);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', throttledUpdate);
      clearTimeout(timeoutId);
    };
  }, []);

  // Close mobile menu when switching to desktop
  useEffect(() => {
    if (breakpoints.isDesktop && isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  }, [breakpoints.isDesktop, isMobileMenuOpen]);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return {
    ...breakpoints,
    isMobileMenuOpen,
    toggleMobileMenu,
    closeMobileMenu
  };
}