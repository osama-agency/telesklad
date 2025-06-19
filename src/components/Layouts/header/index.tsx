"use client";

import DateRangePicker from "@/components/ui/DateRangePicker";
import { Logo } from "@/components/logo";
import { Notification } from "./notification";
import { ThemeToggleSwitch } from "./theme-toggle";
import { UserInfo } from "./user-info";
import { NavigationTabs } from "./navigation-tabs";

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-stroke bg-white dark:border-stroke-dark dark:bg-gray-dark">
      {/* Основная часть header с табами в центре */}
      <div className="flex items-center justify-between px-4 py-4 md:px-5 2xl:px-10">
        {/* Левая часть - Логотип */}
        <div className="flex items-center flex-shrink-0">
          <Logo />
        </div>

        {/* Центральная часть - Навигационные табы */}
        <div className="flex-1 flex justify-center mx-8">
          <NavigationTabs />
        </div>

        {/* Правая часть - Утилиты */}
        <div className="flex items-center gap-x-2 sm:gap-x-3 flex-shrink-0">
          <DateRangePicker />
          <ThemeToggleSwitch />
          <div className="hidden sm:block">
            <Notification />
          </div>
          <UserInfo />
        </div>
      </div>
    </header>
  );
}
