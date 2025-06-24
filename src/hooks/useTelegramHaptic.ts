import { useCallback } from 'react';
import { telegramSDK } from '@/lib/telegram-sdk';

export const useTelegramHaptic = () => {
  const hapticFeedback = useCallback((type: 'light' | 'medium' | 'heavy' | 'success' | 'error' = 'light') => {
    telegramSDK.hapticFeedback(type);
  }, []);

  return {
    impactLight: () => hapticFeedback('light'),
    impactMedium: () => hapticFeedback('medium'),
    impactHeavy: () => hapticFeedback('heavy'),
    notificationSuccess: () => hapticFeedback('success'),
    notificationError: () => hapticFeedback('error')
  };
}; 