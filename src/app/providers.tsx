"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { DateRangeProvider } from "@/context/DateRangeContext";
import { AutoSyncProvider } from "@/components/AutoSyncProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <div suppressHydrationWarning>
      <ThemeProvider defaultTheme="light" attribute="class">
        <SessionProvider>
          <DateRangeProvider>
            <AutoSyncProvider>
              {children}
            </AutoSyncProvider>
          </DateRangeProvider>
        </SessionProvider>
      </ThemeProvider>
    </div>
  );
}
