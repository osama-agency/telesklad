'use client';

import React from 'react';

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
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const Spinner = () => (
    <div className={`${sizeClasses[size]} ${className}`}>
      {/* Простой вращающийся круг */}
      <div className="animate-spin rounded-full border-4 border-gray-200 border-t-[#48C928] w-full h-full"></div>
    </div>
  );

  if (variant === 'page') {
    return (
      <div className="flex items-center justify-center min-h-[60vh] w-full">
        <Spinner />
      </div>
    );
  }

  if (variant === 'overlay') {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 shadow-2xl border border-gray-100">
          <Spinner />
        </div>
      </div>
    );
  }

  return <Spinner />;
};

export default LoadingSpinner; 