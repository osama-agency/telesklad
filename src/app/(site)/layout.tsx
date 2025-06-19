"use client";

import { Header } from "@/components/Layouts/header";
import { usePathname } from "next/navigation";
import { type PropsWithChildren } from "react";
import ToastContext from "../context/ToastContext";

export default function Layout({ children }: PropsWithChildren) {
  const pathname = usePathname();

  // Do not render header on these pages
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
      <div className="min-h-screen bg-main">
        <Header />

        <main className="w-full px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <div className="mx-auto max-w-screen-xl xl:max-w-[90vw] 2xl:max-w-[95vw] py-6 md:py-8 lg:py-10 xl:py-12">
            {children}
          </div>
        </main>
      </div>

      <ToastContext />
    </>
  );
}
