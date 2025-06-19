"use client";

import { Suspense, useEffect } from "react";

import { SmartProductsTable } from "../(home)/_components/SmartProductsTableWithQuery";

export default function ProductsPage() {
  // Set document title
  useEffect(() => {
    document.title = "Товары | NextAdmin - Next.js Dashboard Kit";
  }, []);

  return (
    <div className="min-h-screen bg-main">
      {/* Content */}
      <div className="mx-auto max-w-screen-xl xl:max-w-[90vw] 2xl:max-w-[95vw] p-4 md:p-6 2xl:p-10">
        <Suspense fallback={
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1A6DFF]"></div>
            <span className="ml-3 text-[#64748B] dark:text-gray-300">Загрузка аналитики...</span>
          </div>
        }>
          <SmartProductsTable />
        </Suspense>
      </div>
    </div>
  );
} 