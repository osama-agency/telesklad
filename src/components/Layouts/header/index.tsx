"use client";

import { MenuIcon } from "@/assets/icons";
import { useSidebarContext } from "../sidebar/sidebar-context";
import { Notification } from "./notification";
import { ThemeToggleSwitch } from "./theme-toggle";
import { UserInfo } from "./user-info";
import DateRangePicker from "@/components/ui/DateRangePicker";

export function Header() {
  const { toggleSidebar } = useSidebarContext();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-stroke bg-white px-3 py-4 dark:border-[#334155] dark:bg-[#111827] sm:px-4 sm:py-5 md:px-5 2xl:px-10">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="rounded-lg border px-1.5 py-1 dark:border-[#334155] dark:bg-[#1F2937] hover:dark:bg-[#374151] lg:hidden"
        >
          <MenuIcon />
          <span className="sr-only">Toggle Sidebar</span>
        </button>

        <div className="hidden xl:block">
          <div className="mb-0.5 text-heading-5 font-bold text-dark dark:text-[#F9FAFB]">
            Панель управления
          </div>
          <p className="font-medium text-gray-600 dark:text-[#94A3B8]">Аналитика, учёт и управление поставками</p>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-x-2 sm:gap-x-3">
        <DateRangePicker />

        <ThemeToggleSwitch />

        <div className="hidden sm:block">
          <Notification />
        </div>

        <UserInfo />
      </div>
    </header>
  );
}
