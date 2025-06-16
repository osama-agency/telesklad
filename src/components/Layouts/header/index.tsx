"use client";

import DateRangePicker from "@/components/ui/DateRangePicker";
import { Logo } from "@/components/logo";
import { Notification } from "./notification";
import { ThemeToggleSwitch } from "./theme-toggle";
import { UserInfo } from "./user-info";

export function Header() {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-stroke bg-white px-4 py-5 dark:border-stroke-dark dark:bg-gray-dark md:px-5 2xl:px-10">
      <div className="flex items-center">
        <Logo />
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
