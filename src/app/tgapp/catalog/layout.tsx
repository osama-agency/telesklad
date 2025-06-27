import { Suspense } from "react";

export default function CatalogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div>Загрузка...</div>}>
      {children}
    </Suspense>
  );
} 