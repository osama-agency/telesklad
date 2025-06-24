'use client';

import React from 'react';

interface SkeletonLoadingProps {
  type: 'subscription' | 'order' | 'product' | 'catalog' | 'page' | 'profile' | 'search' | 'reviews' | 'cart' | 'favorites';
  count?: number;
  className?: string;
}

const SkeletonLoading: React.FC<SkeletonLoadingProps> = ({
  type,
  count = 3,
  className = ''
}) => {
  const renderSubscriptionSkeleton = () => (
    <div className="subscription-skeleton">
      <div className="skeleton-image skeleton-shimmer"></div>
      <div className="skeleton-content">
        <div className="skeleton-title skeleton-shimmer"></div>
        <div className="skeleton-title-small skeleton-shimmer"></div>
        <div className="skeleton-price skeleton-shimmer"></div>
        <div className="skeleton-status skeleton-shimmer"></div>
      </div>
      <div className="skeleton-action skeleton-shimmer"></div>
    </div>
  );

  const renderOrderSkeleton = () => (
    <div className="order-skeleton">
      <div className="skeleton-header">
        <div className="skeleton-order-number">
          <div className="skeleton-label"></div>
          <div className="skeleton-value"></div>
        </div>
        <div className="skeleton-date"></div>
      </div>
      
      <div className="skeleton-order-content">
        <div className="skeleton-order-info">
          <div className="skeleton-amount"></div>
          <div className="skeleton-items"></div>
          <div className="skeleton-address"></div>
        </div>
        <div className="skeleton-status-badge"></div>
      </div>
      
      <div className="skeleton-actions">
        <div className="skeleton-btn"></div>
        <div className="skeleton-btn"></div>
      </div>
    </div>
  );

  const renderProductSkeleton = () => (
    <div className="product-skeleton">
      <div className="skeleton-product-image"></div>
      <div className="skeleton-product-content">
        <div className="skeleton-product-title"></div>
        <div className="skeleton-product-title-small"></div>
        <div className="skeleton-product-price"></div>
        <div className="skeleton-product-button"></div>
      </div>
    </div>
  );

  const renderCatalogSkeleton = () => (
    <div className="catalog-skeleton">
      <div className="catalog-grid">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="catalog-item-skeleton">
            <div className="skeleton-product-image"></div>
            <div className="skeleton-product-content">
              <div className="skeleton-product-title"></div>
              <div className="skeleton-product-price"></div>
              <div className="skeleton-product-button"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPageSkeleton = () => (
    <div className="page-skeleton">
      <div className="skeleton-header">
        <div className="skeleton-back-button"></div>
        <div className="skeleton-page-title"></div>
        <div className="skeleton-menu-button"></div>
      </div>
      <div className="skeleton-content">
        <div className="skeleton-section">
          <div className="skeleton-section-title"></div>
          <div className="skeleton-text-lines">
            <div className="skeleton-text-line"></div>
            <div className="skeleton-text-line"></div>
            <div className="skeleton-text-line short"></div>
          </div>
        </div>
        <div className="skeleton-section">
          <div className="skeleton-section-title"></div>
          <div className="skeleton-text-lines">
            <div className="skeleton-text-line"></div>
            <div className="skeleton-text-line"></div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderProfileSkeleton = () => (
    <div className="profile-skeleton">
      <div className="skeleton-avatar"></div>
      <div className="skeleton-profile-info">
        <div className="skeleton-name"></div>
        <div className="skeleton-email"></div>
        <div className="skeleton-phone"></div>
      </div>
      <div className="skeleton-stats">
        <div className="skeleton-stat-item">
          <div className="skeleton-stat-value"></div>
          <div className="skeleton-stat-label"></div>
        </div>
        <div className="skeleton-stat-item">
          <div className="skeleton-stat-value"></div>
          <div className="skeleton-stat-label"></div>
        </div>
        <div className="skeleton-stat-item">
          <div className="skeleton-stat-value"></div>
          <div className="skeleton-stat-label"></div>
        </div>
      </div>
    </div>
  );

  const renderSearchSkeleton = () => (
    <div className="search-skeleton">
      <div className="skeleton-search-bar"></div>
      <div className="skeleton-filters">
        <div className="skeleton-filter-chip"></div>
        <div className="skeleton-filter-chip"></div>
        <div className="skeleton-filter-chip"></div>
      </div>
      <div className="skeleton-search-results">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="skeleton-search-item">
            <div className="skeleton-search-image"></div>
            <div className="skeleton-search-content">
              <div className="skeleton-search-title"></div>
              <div className="skeleton-search-price"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderReviewsSkeleton = () => (
    <div className="reviews-skeleton">
      {Array.from({ length: 3 }, (_, index) => (
        <div key={index} className="review-skeleton">
          <div className="skeleton-review-header">
            <div className="skeleton-review-avatar"></div>
            <div className="skeleton-review-info">
              <div className="skeleton-review-name"></div>
              <div className="skeleton-review-rating"></div>
            </div>
            <div className="skeleton-review-date"></div>
          </div>
          <div className="skeleton-review-text">
            <div className="skeleton-text-line"></div>
            <div className="skeleton-text-line"></div>
            <div className="skeleton-text-line short"></div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderCartSkeleton = () => (
    <div className="cart-skeleton">
      <div className="skeleton-cart-header">
        <div className="skeleton-cart-title"></div>
        <div className="skeleton-cart-count"></div>
      </div>
      {Array.from({ length: 3 }, (_, index) => (
        <div key={index} className="cart-item-skeleton">
          <div className="skeleton-cart-image"></div>
          <div className="skeleton-cart-content">
            <div className="skeleton-cart-name"></div>
            <div className="skeleton-cart-price"></div>
            <div className="skeleton-cart-quantity"></div>
          </div>
          <div className="skeleton-cart-remove"></div>
        </div>
      ))}
      <div className="skeleton-cart-total">
        <div className="skeleton-total-line"></div>
        <div className="skeleton-total-line"></div>
        <div className="skeleton-checkout-button"></div>
      </div>
    </div>
  );

  const renderFavoritesSkeleton = () => (
    <div className="favorites-skeleton">
      <div className="skeleton-favorites-header">
        <div className="skeleton-favorites-title"></div>
        <div className="skeleton-favorites-count"></div>
      </div>
      <div className="favorites-grid">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="favorite-item-skeleton">
            <div className="skeleton-favorite-image"></div>
            <div className="skeleton-favorite-content">
              <div className="skeleton-favorite-title"></div>
              <div className="skeleton-favorite-price"></div>
              <div className="skeleton-favorite-button"></div>
            </div>
            <div className="skeleton-favorite-heart"></div>
          </div>
        ))}
      </div>
    </div>
  );

  const getSkeletonComponent = () => {
    switch (type) {
      case 'subscription':
        return renderSubscriptionSkeleton;
      case 'order':
        return renderOrderSkeleton;
      case 'product':
        return renderProductSkeleton;
      case 'catalog':
        return renderCatalogSkeleton;
      case 'page':
        return renderPageSkeleton;
      case 'profile':
        return renderProfileSkeleton;
      case 'search':
        return renderSearchSkeleton;
      case 'reviews':
        return renderReviewsSkeleton;
      case 'cart':
        return renderCartSkeleton;
      case 'favorites':
        return renderFavoritesSkeleton;
      default:
        return renderSubscriptionSkeleton;
    }
  };

  const SkeletonComponent = getSkeletonComponent();

  return (
    <div className={`skeleton-container ${className}`}>
      {/* Для каталога и других специальных типов не используем count */}
      {['catalog', 'page', 'profile', 'search', 'cart', 'favorites'].includes(type) ? (
        <SkeletonComponent />
      ) : (
        Array.from({ length: count }, (_, index) => (
          <div key={index} className="skeleton-item" style={{ animationDelay: `${index * 0.1}s` }}>
            <SkeletonComponent />
          </div>
        ))
      )}
      
      <style jsx>{`
        .skeleton-container {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 16px 0;
        }

        .skeleton-item {
          animation: skeleton-fade-in 0.6s ease-out forwards, skeleton-pulse 2s ease-in-out infinite;
          opacity: 0;
        }

        /* Базовые стили скелетонов */
        .skeleton-shimmer {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 2.5s infinite;
        }

        /* Subscription Skeleton */
        .subscription-skeleton {
          display: flex;
          align-items: center;
          gap: 12px;
          background: white;
          border-radius: 16px;
          padding: 16px;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
          border: 1px solid #f0f0f0;
        }

        .skeleton-image {
          width: 60px;
          height: 60px;
          border-radius: 8px;
          flex-shrink: 0;
        }

        .skeleton-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .skeleton-title {
          height: 16px;
          border-radius: 4px;
          width: 70%;
        }

        .skeleton-title-small {
          height: 14px;
          border-radius: 4px;
          width: 50%;
        }

        .skeleton-price {
          height: 18px;
          border-radius: 4px;
          width: 40%;
        }

        .skeleton-status {
          height: 12px;
          border-radius: 4px;
          width: 60%;
        }

        .skeleton-action {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          flex-shrink: 0;
        }

        /* Order Skeleton */
        .order-skeleton {
          background: white;
          border-radius: 16px;
          padding: 16px;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
          border: 1px solid #f0f0f0;
        }

        .skeleton-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          padding-bottom: 8px;
          border-bottom: 1px solid #F3F4F6;
        }

        .skeleton-order-number {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .skeleton-label {
          height: 12px;
          width: 40px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 4px;
        }

        .skeleton-value {
          height: 16px;
          width: 100px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 4px;
        }

        .skeleton-date {
          height: 12px;
          width: 80px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 4px;
        }

        .skeleton-order-content {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 16px;
        }

        .skeleton-order-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .skeleton-amount {
          height: 20px;
          width: 120px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 4px;
        }

        .skeleton-items {
          height: 12px;
          width: 80px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 4px;
        }

        .skeleton-address {
          height: 12px;
          width: 150px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 4px;
        }

        .skeleton-status-badge {
          width: 80px;
          height: 24px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 12px;
          margin-left: 12px;
        }

        .skeleton-actions {
          display: flex;
          gap: 8px;
        }

        .skeleton-btn {
          flex: 1;
          height: 32px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 8px;
        }

        /* Product Skeleton */
        .product-skeleton {
          background: white;
          border-radius: 20px;
          padding: 12px;
          box-shadow: 0px 4px 16px 0px #3D44531A, 0px 0px 8px 0px #3D44530D;
        }

        .skeleton-product-image {
          height: 172px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 12px;
          margin-bottom: 12px;
        }

        .skeleton-product-content {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .skeleton-product-title {
          height: 16px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 4px;
          width: 90%;
        }

        .skeleton-product-title-small {
          height: 16px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 4px;
          width: 70%;
        }

        .skeleton-product-price {
          height: 20px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 4px;
          width: 60%;
          margin: 4px 0;
        }

        .skeleton-product-button {
          height: 48px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 16px;
          margin-top: 8px;
        }

        /* Catalog Skeleton */
        .catalog-skeleton {
          padding: 16px;
        }

        .catalog-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }

        .catalog-item-skeleton {
          background: white;
          border-radius: 20px;
          padding: 12px;
          box-shadow: 0px 4px 16px 0px #3D44531A, 0px 0px 8px 0px #3D44530D;
          animation: skeleton-fade-in 0.6s ease-out forwards;
          opacity: 0;
        }

        .catalog-item-skeleton:nth-child(1) { animation-delay: 0s; }
        .catalog-item-skeleton:nth-child(2) { animation-delay: 0.1s; }
        .catalog-item-skeleton:nth-child(3) { animation-delay: 0.2s; }
        .catalog-item-skeleton:nth-child(4) { animation-delay: 0.3s; }
        .catalog-item-skeleton:nth-child(5) { animation-delay: 0.4s; }
        .catalog-item-skeleton:nth-child(6) { animation-delay: 0.5s; }

        /* Page Skeleton */
        .page-skeleton {
          padding: 16px;
        }

        .skeleton-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 1px solid #f0f0f0;
        }

        .skeleton-back-button,
        .skeleton-menu-button {
          width: 32px;
          height: 32px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 8px;
        }

        .skeleton-page-title {
          height: 24px;
          width: 160px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 6px;
        }

        .skeleton-content {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .skeleton-section {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .skeleton-section-title {
          height: 18px;
          width: 120px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 4px;
        }

        .skeleton-text-lines {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .skeleton-text-line {
          height: 14px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 4px;
          width: 100%;
        }

        .skeleton-text-line.short {
          width: 70%;
        }

        /* Profile Skeleton */
        .profile-skeleton {
          padding: 24px 16px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
        }

        .skeleton-avatar {
          width: 80px;
          height: 80px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 50%;
        }

        .skeleton-profile-info {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .skeleton-name {
          height: 20px;
          width: 140px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 4px;
        }

        .skeleton-email {
          height: 14px;
          width: 180px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 4px;
        }

        .skeleton-phone {
          height: 14px;
          width: 120px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 4px;
        }

        .skeleton-stats {
          display: flex;
          gap: 24px;
          width: 100%;
          justify-content: center;
        }

        .skeleton-stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
        }

        .skeleton-stat-value {
          height: 24px;
          width: 40px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 4px;
        }

        .skeleton-stat-label {
          height: 12px;
          width: 60px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 4px;
        }

        /* Search Skeleton */
        .search-skeleton {
          padding: 16px;
        }

        .skeleton-search-bar {
          height: 44px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 22px;
          margin-bottom: 16px;
        }

        .skeleton-filters {
          display: flex;
          gap: 8px;
          margin-bottom: 16px;
          overflow-x: auto;
        }

        .skeleton-filter-chip {
          height: 32px;
          width: 80px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 16px;
          flex-shrink: 0;
        }

        .skeleton-search-results {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .skeleton-search-item {
          display: flex;
          gap: 12px;
          background: white;
          padding: 12px;
          border-radius: 16px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        }

        .skeleton-search-image {
          width: 60px;
          height: 60px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 8px;
          flex-shrink: 0;
        }

        .skeleton-search-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 8px;
        }

        .skeleton-search-title {
          height: 16px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 4px;
          width: 80%;
        }

        .skeleton-search-price {
          height: 14px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 4px;
          width: 50%;
        }

        /* Reviews Skeleton */
        .reviews-skeleton {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .review-skeleton {
          background: white;
          padding: 16px;
          border-radius: 16px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        }

        .skeleton-review-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }

        .skeleton-review-avatar {
          width: 40px;
          height: 40px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .skeleton-review-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .skeleton-review-name {
          height: 14px;
          width: 100px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 4px;
        }

        .skeleton-review-rating {
          height: 12px;
          width: 80px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 4px;
        }

        .skeleton-review-date {
          height: 12px;
          width: 60px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 4px;
        }

        .skeleton-review-text {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        /* Cart Skeleton */
        .cart-skeleton {
          padding: 16px;
        }

        .skeleton-cart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .skeleton-cart-title {
          height: 24px;
          width: 120px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 6px;
        }

        .skeleton-cart-count {
          height: 20px;
          width: 60px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 4px;
        }

        .cart-item-skeleton {
          display: flex;
          gap: 12px;
          background: white;
          padding: 16px;
          border-radius: 16px;
          margin-bottom: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        }

        .skeleton-cart-image {
          width: 80px;
          height: 80px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 12px;
          flex-shrink: 0;
        }

        .skeleton-cart-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .skeleton-cart-name {
          height: 16px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 4px;
          width: 90%;
        }

        .skeleton-cart-price {
          height: 18px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 4px;
          width: 60%;
          margin: 8px 0;
        }

        .skeleton-cart-quantity {
          height: 32px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 8px;
          width: 100px;
        }

        .skeleton-cart-remove {
          width: 32px;
          height: 32px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 8px;
          align-self: center;
        }

        .skeleton-cart-total {
          background: white;
          padding: 20px;
          border-radius: 16px;
          margin-top: 20px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        }

        .skeleton-total-line {
          height: 16px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 4px;
          margin-bottom: 12px;
        }

        .skeleton-total-line:first-child {
          width: 60%;
        }

        .skeleton-total-line:last-child {
          width: 80%;
        }

        .skeleton-checkout-button {
          height: 52px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 16px;
          margin-top: 16px;
        }

        /* Favorites Skeleton */
        .favorites-skeleton {
          padding: 16px;
        }

        .skeleton-favorites-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .skeleton-favorites-title {
          height: 24px;
          width: 140px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 6px;
        }

        .skeleton-favorites-count {
          height: 20px;
          width: 80px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 4px;
        }

        .favorites-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }

        .favorite-item-skeleton {
          background: white;
          border-radius: 20px;
          padding: 12px;
          box-shadow: 0px 4px 16px 0px #3D44531A, 0px 0px 8px 0px #3D44530D;
          position: relative;
          animation: skeleton-fade-in 0.6s ease-out forwards;
          opacity: 0;
        }

        .favorite-item-skeleton:nth-child(1) { animation-delay: 0s; }
        .favorite-item-skeleton:nth-child(2) { animation-delay: 0.1s; }
        .favorite-item-skeleton:nth-child(3) { animation-delay: 0.2s; }
        .favorite-item-skeleton:nth-child(4) { animation-delay: 0.3s; }

        .skeleton-favorite-image {
          height: 140px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 12px;
          margin-bottom: 12px;
        }

        .skeleton-favorite-content {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .skeleton-favorite-title {
          height: 16px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 4px;
          width: 85%;
        }

        .skeleton-favorite-price {
          height: 18px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 4px;
          width: 60%;
          margin: 4px 0;
        }

        .skeleton-favorite-button {
          height: 40px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 12px;
          margin-top: 8px;
        }

        .skeleton-favorite-heart {
          position: absolute;
          top: 16px;
          right: 16px;
          width: 28px;
          height: 28px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 50%;
        }

        /* Анимации */
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }

        @keyframes skeleton-fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes skeleton-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.85; }
        }

        /* Адаптивность */
        @media (max-width: 640px) {
          .subscription-skeleton {
            padding: 12px;
          }
          
          .skeleton-image {
            width: 50px;
            height: 50px;
          }
          
          .order-skeleton {
            padding: 14px;
          }
          
          .skeleton-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 4px;
          }
          
          .skeleton-order-content {
            flex-direction: column;
            gap: 12px;
          }
          
          .skeleton-status-badge {
            margin-left: 0;
            align-self: flex-start;
          }
          
          .skeleton-actions {
            flex-direction: column;
          }

          .catalog-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 8px;
          }

          .favorites-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 8px;
          }

          .skeleton-stats {
            gap: 16px;
          }

          .search-skeleton,
          .cart-skeleton,
          .favorites-skeleton,
          .reviews-skeleton,
          .profile-skeleton,
          .page-skeleton {
            padding: 12px;
          }
        }
      `}</style>
    </div>
  );
};

export default SkeletonLoading; 