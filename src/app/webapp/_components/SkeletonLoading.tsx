'use client';

import React from 'react';

interface SkeletonLoadingProps {
  type: 'subscription' | 'order' | 'product';
  count?: number;
}

const SkeletonLoading: React.FC<SkeletonLoadingProps> = ({
  type,
  count = 3
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

  const getSkeletonComponent = () => {
    switch (type) {
      case 'subscription':
        return renderSubscriptionSkeleton;
      case 'order':
        return renderOrderSkeleton;
      case 'product':
        return renderProductSkeleton;
      default:
        return renderSubscriptionSkeleton;
    }
  };

  const SkeletonComponent = getSkeletonComponent();

  return (
    <div className="skeleton-container">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="skeleton-item">
          <SkeletonComponent />
        </div>
      ))}
      
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

        .skeleton-item:nth-child(1) {
          animation-delay: 0s, 0.6s;
        }

        .skeleton-item:nth-child(2) {
          animation-delay: 0.1s, 0.7s;
        }

        .skeleton-item:nth-child(3) {
          animation-delay: 0.2s, 0.8s;
        }

        .skeleton-item:nth-child(4) {
          animation-delay: 0.3s, 0.9s;
        }

        .skeleton-item:nth-child(5) {
          animation-delay: 0.4s, 1s;
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

        .skeleton-shimmer {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 2.5s infinite;
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
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 4px;
          width: 70%;
        }

        .skeleton-title-small {
          height: 14px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 4px;
          width: 50%;
        }

        .skeleton-price {
          height: 18px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 4px;
          width: 40%;
        }

        .skeleton-status {
          height: 12px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 4px;
          width: 60%;
        }

        .skeleton-action {
          width: 32px;
          height: 32px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
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
        }
      `}</style>
    </div>
  );
};

export default SkeletonLoading; 