"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { DateRangeProvider } from "@/context/DateRangeContext";
import { AutoSyncProvider } from "@/components/AutoSyncProvider";
import QueryProvider from "@/providers/QueryProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <div suppressHydrationWarning>
      <ThemeProvider defaultTheme="light" attribute="class">
        <SessionProvider>
          <QueryProvider>
            <DateRangeProvider>
              <AutoSyncProvider>
                {children}
              </AutoSyncProvider>
            </DateRangeProvider>
          </QueryProvider>
        </SessionProvider>
      </ThemeProvider>
    </div>
  );
}
