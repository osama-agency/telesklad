'use client';

import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  text?: string;
  variant?: 'default' | 'centered' | 'overlay';
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  text = 'Загрузка...',
  variant = 'centered',
  className = ''
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'w-6 h-6';
      case 'large':
        return 'w-12 h-12';
      default:
        return 'w-8 h-8';
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'small':
        return 'text-sm';
      case 'large':
        return 'text-lg';
      default:
        return 'text-base';
    }
  };

  const SpinnerIcon = () => (
    <div className={`loading-spinner-icon ${getSizeClasses()}`}>
      <div className="spinner-ring"></div>
      <div className="spinner-ring"></div>
      <div className="spinner-ring"></div>
    </div>
  );

  if (variant === 'overlay') {
    return (
      <div className={`loading-overlay ${className}`}>
        <div className="loading-content">
          <SpinnerIcon />
          {text && <p className={`loading-text ${getTextSize()}`}>{text}</p>}
        </div>
        
        <style jsx>{`
          .loading-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(255, 255, 255, 0.9);
            backdrop-filter: blur(4px);
            z-index: 9998;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: fade-in 0.2s ease-out;
          }

          .loading-content {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 16px;
            background: white;
            padding: 24px;
            border-radius: 16px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          }

          @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        `}</style>
      </div>
    );
  }

  const containerClass = variant === 'centered' 
    ? 'loading-container-centered' 
    : 'loading-container-inline';

  return (
    <div className={`${containerClass} ${className}`}>
      <SpinnerIcon />
      {text && <p className={`loading-text ${getTextSize()}`}>{text}</p>}
      
      <style jsx>{`
        .loading-container-centered {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          text-align: center;
          min-height: 200px;
        }

        .loading-container-inline {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 20px;
        }

        .loading-spinner-icon {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .spinner-ring {
          position: absolute;
          border-radius: 50%;
          border: 2px solid transparent;
          border-top-color: #48C928;
          animation: spin 1.2s linear infinite;
        }

        .spinner-ring:nth-child(1) {
          width: 100%;
          height: 100%;
          border-width: 3px;
          animation-duration: 1.2s;
        }

        .spinner-ring:nth-child(2) {
          width: 75%;
          height: 75%;
          border-width: 2px;
          border-top-color: #3AA120;
          animation-duration: 1s;
          animation-direction: reverse;
        }

        .spinner-ring:nth-child(3) {
          width: 50%;
          height: 50%;
          border-width: 2px;
          border-top-color: #48C928;
          animation-duration: 0.8s;
          opacity: 0.7;
        }

        .loading-text {
          color: #6B7280;
          font-weight: 500;
          margin: 16px 0 0 0;
          line-height: 1.5;
        }

        .loading-container-inline .loading-text {
          margin: 0;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Пульсация для текста */
        .loading-text {
          animation: pulse-text 2s ease-in-out infinite;
        }

        @keyframes pulse-text {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 1; }
        }

        /* Hover эффект для интерактивности */
        .loading-spinner-icon:hover .spinner-ring {
          animation-duration: 0.6s;
        }

        /* Адаптивность */
        @media (max-width: 640px) {
          .loading-container-centered {
            padding: 40px 16px;
            min-height: 160px;
          }
          
          .loading-text {
            font-size: 14px;
          }
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner; 