'use client';
import { useEffect } from 'react';
import { telegramSDK } from '@/lib/telegram-sdk';

export default function PerformanceMonitor() {
  useEffect(() => {
    // Мониторинг только в development и только если Telegram SDK доступен
    if (process.env.NODE_ENV !== 'development' || !telegramSDK.isAvailable()) {
      return;
    }

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'navigation') {
          const navEntry = entry as PerformanceNavigationTiming;
          if (navEntry.loadEventEnd - navEntry.loadEventStart > 2000) {
            console.warn('Slow page load detected:', navEntry.duration);
            // Можно отправить метрику в аналитику
          }
        }
      }
    });

    observer.observe({ entryTypes: ['navigation'] });

    return () => observer.disconnect();
  }, []);

  return null;
} 