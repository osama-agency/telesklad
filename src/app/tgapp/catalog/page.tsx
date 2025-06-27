"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { useBackButton } from "../_components/useBackButton";
import CategoryFilterHorizontal from "../_components/CategoryFilterHorizontal";
import { Skeleton } from "@/components/ui/skeleton";

const SearchBar = dynamic(() => import("../_components/SearchBar"), { ssr: false });
// @ts-ignore – динамический импорт клиентского компонента
const VirtualProductCatalog = dynamic(() => import("../_components/VirtualProductCatalog"), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col gap-4 p-4">
      {[1, 2, 3, 4].map(i => (
        <Skeleton key={i} className="h-32 w-full" />
      ))}
    </div>
  )
});
// Skeleton for catalog loading
const SkeletonCatalog = dynamic(() => import("../_components/SkeletonCatalog"), { ssr: false });
import { Suspense } from "react";

export default function CatalogPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") ?? "";
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Скрываем кнопку "Назад" на главной странице каталога
  useBackButton(false);

  useEffect(() => {
    document.title = "Каталог товаров";
  }, []);

  return (
    <div className="tgapp-catalog">
      {/* Search */}
      <div className="px-4 py-3 bg-white dark:bg-transparent border-b border-gray-100 dark:border-gray-700">
        <div className="max-w-[600px] mx-auto">
          <SearchBar onSearch={(q) => {
            if (typeof window !== "undefined") {
              const url = new URL(window.location.href);
              if (q) url.searchParams.set("q", q);
              else url.searchParams.delete("q");
              window.history.replaceState({}, "", url.toString());
            }
          }} />
        </div>
      </div>

      {/* Category Filter - Full Width */}
      <CategoryFilterHorizontal
        onCategoryChange={setSelectedCategory}
        selectedCategory={selectedCategory}
      />

      {/* Catalog */}
      <div className="px-4 pb-4 pt-4">
        <div className="max-w-[600px] mx-auto">
          <Suspense fallback={<SkeletonCatalog />}>
            <VirtualProductCatalog search={query} category={selectedCategory} debugMode={false} />
          </Suspense>
        </div>
      </div>
    </div>
  );
} 