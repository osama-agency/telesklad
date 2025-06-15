"use client";

import { MenuIcon } from "@/assets/icons";
import Image from "next/image";
import Link from "next/link";
import { useSidebarContext } from "../sidebar/sidebar-context";
import { Notification } from "./notification";

import { ThemeToggleSwitch } from "./theme-toggle";
import { UserInfo } from "./user-info";
import DateRangePicker from "@/components/ui/DateRangePicker";

export function Header() {
  const { toggleSidebar, isMobile } = useSidebarContext();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-stroke bg-white px-4 py-5 dark:border-[#334155] dark:bg-[#111827] md:px-5 2xl:px-10">
      <button
        onClick={toggleSidebar}
        className="rounded-lg border px-1.5 py-1 dark:border-[#334155] dark:bg-[#1F2937] hover:dark:bg-[#374151] lg:hidden"
      >
        <MenuIcon />
        <span className="sr-only">Toggle Sidebar</span>
      </button>

      {isMobile && (
        <Link href={"/"} className="ml-2 max-[430px]:hidden min-[375px]:ml-4">
          <svg width="32" height="32" viewBox="0 0 221 221" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="headerLogoGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#1B6EF3" />
                <stop offset="100%" stopColor="#3EB5EA" />
              </linearGradient>
            </defs>
            <path d="M77.259 0.609375H0.767578V77.1008H77.259V0.609375Z" fill="url(#headerLogoGradient)"/>
            <path d="M220.366 5.63159V77.1053H148.719V220.646H147.644C108.775 220.646 77.2654 189.136 77.2654 150.267V76.0103C77.2654 37.1413 108.775 5.63159 147.644 5.63159H220.366Z" fill="url(#headerLogoGradient)"/>
          </svg>
        </Link>
      )}

      <div className="max-xl:hidden">
        <div className="mb-0.5 text-heading-5 font-bold text-dark dark:text-[#F9FAFB]">
          Панель управления
        </div>
        <p className="font-medium text-gray-600 dark:text-[#94A3B8]">Аналитика, учёт и управление поставками</p>
      </div>

      <div className="ml-auto flex items-center gap-2 min-[375px]:gap-4">
        <DateRangePicker />

        <ThemeToggleSwitch />

        <Notification />

        <UserInfo />
      </div>
    </header>
  );
}
