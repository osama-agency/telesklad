"use client";

import { useState } from 'react';
import { useProductSubscription } from '@/hooks/useProductSubscription';
import { useTelegramHaptic } from '@/hooks/useTelegramHaptic';

interface SubscribeButtonProps {
  productId: number;
  initiallySubscribed?: boolean;
  className?: string;
}

export function SubscribeButton({ 
  productId, 
  initiallySubscribed = false,
  className = ""
}: SubscribeButtonProps) {
  const { subscribed, subscribe, unsubscribe } = useProductSubscription(productId, initiallySubscribed);
  const [isLoading, setIsLoading] = useState(false);
  const { impactMedium, notificationSuccess, notificationError } = useTelegramHaptic();

  const handleToggleSubscription = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsLoading(true);
    impactMedium();

    try {
      let success = false;
      
      if (subscribed) {
        success = await unsubscribe();
        if (success) {
          notificationSuccess();
        }
      } else {
        success = await subscribe();
        if (success) {
          notificationSuccess();
        }
      }

      if (!success) {
        notificationError();
      }
    } catch (error) {
      console.error('Subscription toggle error:', error);
      notificationError();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggleSubscription}
      disabled={isLoading}
      className={`
        w-full py-2.5 px-4 
        ${subscribed 
          ? 'bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700' 
          : 'bg-telegram-primary hover:bg-telegram-primary/90 dark:bg-telegram-primary dark:hover:bg-telegram-primary/90'
        }
        text-white font-medium text-sm 
        rounded-lg 
        transition-all duration-200 
        active:scale-95 
        disabled:opacity-60 disabled:cursor-not-allowed
        shadow-sm hover:shadow-md dark:shadow-black/20
        flex items-center justify-center gap-2
        ${isLoading ? 'animate-pulse' : ''}
        ${className}
      `}
    >
      {isLoading ? (
        <>
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <span>Загрузка...</span>
        </>
      ) : subscribed ? (
        <>
          <span>🔔</span>
          <span>Вы подписаны</span>
        </>
      ) : (
        <>
          <span>🔔</span>
          <span>Подписаться</span>
        </>
      )}
    </button>
  );
} 