import { useState, useCallback } from 'react';
import { webAppFetch } from '@/lib/utils/webapp-fetch';
import { useTelegramAuth } from '@/context/TelegramAuthContext';

/**
 * Хук управления подпиской на поступление товара
 * @param productId ID товара
 * @param initiallySubscribed true, если пользователь уже подписан
 */
export function useProductSubscription(productId: number, initiallySubscribed = false) {
  const { user } = useTelegramAuth();
  const [subscribed, setSubscribed] = useState(initiallySubscribed);
  const tgId = user?.tg_id;

  /** Подписаться на товар */
  const subscribe = useCallback(async () => {
    if (!tgId) return false;
    try {
      const res = await webAppFetch('/api/webapp/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId, tg_id: tgId })
      });
      if (res.ok) {
        setSubscribed(true);
        window.dispatchEvent(new Event('subscriptionsUpdated'));
        return true;
      }
    } catch (e) {
      console.error('Subscription POST error', e);
    }
    return false;
  }, [productId, tgId]);

  /** Отписаться от товара */
  const unsubscribe = useCallback(async () => {
    if (!tgId) return false;
    try {
      const res = await webAppFetch(`/api/webapp/subscriptions?product_id=${productId}&tg_id=${tgId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setSubscribed(false);
        window.dispatchEvent(new Event('subscriptionsUpdated'));
        return true;
      }
    } catch (e) {
      console.error('Subscription DELETE error', e);
    }
    return false;
  }, [productId, tgId]);

  return { subscribed, subscribe, unsubscribe };
} 