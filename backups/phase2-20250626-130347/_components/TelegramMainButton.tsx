'use client';
import { useEffect } from 'react';
import { useTelegramHaptic } from '@/hooks/useTelegramHaptic';

interface TelegramMainButtonProps {
  text: string;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  color?: string;
}

export default function TelegramMainButton({ 
  text, 
  onClick, 
  disabled = false, 
  loading = false,
  color = '#007AFF'
}: TelegramMainButtonProps) {
  const { impactMedium, notificationSuccess } = useTelegramHaptic();

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (!tg) return;

    // Настраиваем главную кнопку
    tg.MainButton.text = loading ? 'Загрузка...' : text;
    tg.MainButton.color = color;
    
    if (disabled || loading) {
      tg.MainButton.disable();
    } else {
      tg.MainButton.enable();
      tg.MainButton.show();
    }

    const handleClick = () => {
      impactMedium();
      onClick();
    };

    tg.MainButton.onClick(handleClick);

    return () => {
      tg.MainButton.offClick(handleClick);
      tg.MainButton.hide();
    };
  }, [text, disabled, loading, color, onClick]);

  return null; // Используем нативную кнопку Telegram
} 