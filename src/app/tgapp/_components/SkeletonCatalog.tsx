"use client";

export default function SkeletonCatalog() {
  return (
    <div className="tgapp-product-grid" aria-label="Загрузка каталога">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="tgapp-product-skeleton">
          <div className="tgapp-skeleton-element tgapp-skeleton-image" />
          <div className="tgapp-skeleton-element tgapp-skeleton-text" />
          <div className="tgapp-skeleton-element tgapp-skeleton-text short" />
          <div className="tgapp-skeleton-element tgapp-skeleton-price" />
          <div className="tgapp-skeleton-element tgapp-skeleton-button" />
        </div>
      ))}
    </div>
  );
}
