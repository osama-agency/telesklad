'use client';

import React from 'react';
import SkeletonLoading from './SkeletonLoading';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'page' | 'overlay';
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  variant = 'default',
  className = '' 
}) => {
  // Маппим старые props на новые типы скелетонов
  const getSkeletonType = () => {
    if (variant === 'page') return 'page';
    return 'catalog';
  };

  if (variant === 'overlay') {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 shadow-2xl border border-gray-100">
          <SkeletonLoading type="page" className={className} />
        </div>
      </div>
    );
  }

  if (variant === 'page') {
    return (
      <div className="flex items-center justify-center min-h-[60vh] w-full">
        <SkeletonLoading type="page" className={className} />
      </div>
    );
  }

  return <SkeletonLoading type="catalog" className={className} />;
};

export default LoadingSpinner; 