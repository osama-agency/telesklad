"use client";

import { Header } from "@/components/Layouts/header";
import { Sidebar } from "@/components/Layouts/sidebar";
import { SidebarProvider } from "@/components/Layouts/sidebar/sidebar-context";
import { usePathname } from "next/navigation";
import { type PropsWithChildren } from "react";
import ToastContext from "../context/ToastContext";

export default function Layout({ children }: PropsWithChildren) {
  const pathname = usePathname();

  // Do not render sidebar and header on these pages
  if (
    ["/coming-soon", "/two-step-verification", "/under-maintenance"].some(
      (value) => pathname.endsWith(value),
    )
  ) {
    return (
      <>
        {children}
        <ToastContext />
      </>
    );
  }

  return (
    <>
      <SidebarProvider>
        <div className="flex min-h-screen">
          <Sidebar />

          <div className="w-full bg-gray-2 dark:bg-[#020d1a]">
            <Header />

            <main className="mx-auto w-full max-w-screen-2xl overflow-hidden p-4 md:p-6 2xl:p-10">
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>

      <ToastContext />
    </>
  );
}
