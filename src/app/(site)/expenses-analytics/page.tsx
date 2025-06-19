"use client";

import { useEffect } from "react";

import { ExpensesTable } from "../(home)/_components/ExpensesTableWithQuery";

export default function ExpensesAnalyticsPage() {
  // Set document title
  useEffect(() => {
    document.title = "Аналитика расходов | NextAdmin - Next.js Dashboard Kit";
  }, []);

  return (
    <div className="min-h-screen bg-main">
      {/* Content */}
      <div className="mx-auto max-w-screen-xl xl:max-w-[90vw] 2xl:max-w-[95vw] p-4 md:p-6 2xl:p-10">
        <ExpensesTable />
      </div>
    </div>
  );
} 