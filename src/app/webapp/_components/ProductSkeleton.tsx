export function ProductSkeleton({ outOfStock = false }: { outOfStock?: boolean }) {
  return (
    <div className="product-card">
      <div className={`product-wrapper product-skeleton ${outOfStock ? 'out-of-stock' : ''}`}>
        {/* Skeleton for favorite button */}
        <div className="absolute right-3 top-3 z-10">
          <div className="fav-btn skeleton" style={{ width: '20px', height: '20px', borderRadius: '50%' }}></div>
        </div>

        {/* Skeleton for product image */}
        <div className="product-img-skeleton"></div>

        {/* Skeleton for product title */}
        <div className="product-title-skeleton"></div>
        <div className="product-title-skeleton-2"></div>

        {/* Skeleton for price */}
        <div className="product-price-skeleton"></div>

        {outOfStock && (
          /* Skeleton for "out of stock" badge */
          <div className="skeleton" style={{ 
            height: '32px', 
            borderRadius: 'clamp(6px, 1.5vw, 8px)', 
            marginBottom: 'clamp(8px, 2vw, 12px)' 
          }}></div>
        )}

        {/* Skeleton for button */}
        <div className="product-button-skeleton"></div>
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="product-grid">
      {Array.from({ length: count }, (_, index) => (
        <ProductSkeleton key={index} />
      ))}
    </div>
  );
} 