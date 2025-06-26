'use client';

import React from 'react';

interface ButtonSpinnerProps {
  size?: 'sm' | 'md';
  className?: string;
}

const ButtonSpinner: React.FC<ButtonSpinnerProps> = ({ 
  size = 'md',
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5'
  };

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <div className="relative">
        {/* Основное кольцо */}
        <div className="animate-spin rounded-full border-2 border-white/30 border-t-white w-full h-full"></div>
        
        {/* Центральная точка */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-white rounded-full animate-pulse"></div>
      </div>
    </div>
  );
};

export default ButtonSpinner; 