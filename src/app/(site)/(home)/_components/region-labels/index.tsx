"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

const MapComponent = dynamic(() => import("./map"), {
  ssr: false,
  loading: () => (
    <div className="h-[422px] flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg animate-pulse">
      <div className="text-center p-8">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mx-auto mb-2"></div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-48 mx-auto"></div>
      </div>
    </div>
  )
});

export function RegionLabels() {
  return (
    <div className="col-span-12 rounded-[10px] bg-white p-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card xl:col-span-7">
      <h2 className="mb-7 text-body-2xlg font-bold text-dark dark:text-white">
        Региональные метки
      </h2>
      <Suspense 
        fallback={
          <div className="h-[422px] flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Загрузка карты...</p>
            </div>
          </div>
        }
      >
        <MapComponent />
      </Suspense>
    </div>
  );
}
