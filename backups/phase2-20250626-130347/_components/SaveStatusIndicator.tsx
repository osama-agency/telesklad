'use client';

import React from 'react';

interface SaveStatusIndicatorProps {
  status: 'idle' | 'saving' | 'saved';
  className?: string;
}

const SaveStatusIndicator: React.FC<SaveStatusIndicatorProps> = ({ 
  status, 
  className = '' 
}) => {
  if (status === 'idle') return null;

  return (
    <span className={`save-status ${status} ${className}`}>
      {status === 'saving' && (
        <>
          <div className="spinner"></div>
          Сохранение...
        </>
      )}
      {status === 'saved' && (
        <>
          ✓ Сохранено
        </>
      )}
    </span>
  );
};

export default SaveStatusIndicator;
