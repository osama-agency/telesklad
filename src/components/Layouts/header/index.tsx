"use client";

import DateRangePicker from "@/components/ui/DateRangePicker";
import { Logo } from "@/components/logo";
import { Notification } from "./notification";
import { ThemeToggleSwitch } from "./theme-toggle";
import { UserInfo } from "./user-info";
import { NavigationTabs } from "./navigation-tabs";
import { MobileMenu, MobileMenuButton } from "./mobile-menu";
import { useHeaderResponsive } from "@/hooks/useHeaderResponsive";

export function Header() {
  const { 
    isMobile, 
    isTablet, 
    isSmallDesktop,
    isMediumDesktop,
    isLargeDesktop,
    isDesktop, 
    showFullDatePicker,
    showCompactDatePicker,
    showNotifications,
    showFullNavigation,
    showCompactNavigation,
    isMobileMenuOpen, 
    toggleMobileMenu, 
    closeMobileMenu,
    width
  } = useHeaderResponsive();

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-stroke bg-white dark:border-stroke-dark dark:bg-gray-dark transition-all duration-300">
        <div className={`flex items-center justify-between px-4 py-4 md:px-5 2xl:px-10 ${
          isSmallDesktop ? 'gap-2' : 'gap-4'
        }`}>
          
          {/* Левая часть - Логотип и мобильное меню */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Мобильное меню кнопка */}
            {isMobile && (
              <MobileMenuButton 
                isOpen={isMobileMenuOpen}
                onClick={toggleMobileMenu}
              />
            )}
            
            {/* Логотип - адаптивный размер */}
            <div className={`transition-all duration-300 ${
              isSmallDesktop ? 'scale-90' : 'scale-100'
            }`}>
              <Logo />
            </div>
          </div>

          {/* Центральная часть - Навигация */}
          <div className={`flex-1 flex justify-center transition-all duration-300 ${
            isSmallDesktop ? 'mx-2' : 'mx-4 sm:mx-8'
          }`}>
            {showFullNavigation && <NavigationTabs />}
            {showCompactNavigation && (
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                {/* Компактная навигация для планшетов */}
                <NavigationTabs />
              </div>
            )}
          </div>

          {/* Правая часть - Утилиты */}
          <div className={`flex items-center flex-shrink-0 transition-all duration-300 ${
            isSmallDesktop ? 'gap-x-1.5' : 'gap-x-2 sm:gap-x-3'
          }`}>
            
            {/* DateRangePicker - всегда функциональный, но с разными размерами */}
            <div className={`transition-all duration-300 ${
              isSmallDesktop ? 'scale-90' : 'scale-100'
            }`}>
              <DateRangePicker />
            </div>
            
            {/* Theme Toggle - всегда видим */}
            <div className={`transition-all duration-300 ${
              isSmallDesktop ? 'scale-90' : 'scale-100'
            }`}>
              <ThemeToggleSwitch />
            </div>
            
            {/* Notification - адаптивное отображение */}
            {showNotifications && (
              <div className={`transition-all duration-300 ${
                isSmallDesktop ? 'scale-90' : 'scale-100'
              }`}>
                <Notification />
              </div>
            )}
            
            {/* User Info - всегда видим, но адаптивный размер */}
            <div className={`transition-all duration-300 ${
              isSmallDesktop ? 'scale-90' : 'scale-100'
            }`}>
              <UserInfo />
            </div>
          </div>
        </div>
        
      </header>

      {/* Мобильное меню */}
      <MobileMenu 
        isOpen={isMobileMenuOpen}
        onClose={closeMobileMenu}
      />
    </>
  );
} 