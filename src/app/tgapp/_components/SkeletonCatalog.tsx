"use client";

import { Skeleton } from "@/components/ui/skeleton";

export default function SkeletonCatalog() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4" aria-label="Загрузка каталога">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-gray-800/60 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700/50 backdrop-blur-sm"
        >
          <Skeleton className="w-full aspect-square rounded-lg mb-3 dark:bg-gray-700/50" />
          <Skeleton className="h-4 w-3/4 mb-2 dark:bg-gray-700/50" />
          <Skeleton className="h-5 w-1/2 mb-3 dark:bg-gray-700/50" />
          <Skeleton className="h-10 w-full rounded-lg dark:bg-gray-700/50" />
        </div>
      ))}
    </div>
  );
}
