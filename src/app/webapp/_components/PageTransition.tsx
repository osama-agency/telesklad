'use client';

import React, { useEffect, useRef } from 'react';

interface PageTransitionProps {
  children: React.ReactNode;
}

const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Сначала устанавливаем начальное состояние (как в Sheet)
    element.style.opacity = '0';
    element.style.transform = 'translateY(50px)'; // Больше смещение для эффекта "снизу вверх"

    // Запускаем анимацию в следующем кадре
    requestAnimationFrame(() => {
      element.style.transition = 'opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
      element.style.opacity = '1';
      element.style.transform = 'translateY(0)';
    });

    return () => {
      if (element) {
        element.style.transition = '';
        element.style.opacity = '';
        element.style.transform = '';
      }
    };
  }, []);

  return (
    <div ref={ref} style={{ width: '100%' }}>
      {children}
    </div>
  );
};

export default PageTransition;
