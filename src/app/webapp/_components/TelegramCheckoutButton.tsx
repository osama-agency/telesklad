'use client';

import { useEffect, useRef } from 'react';
import { useTelegramHaptic } from '@/hooks/useTelegramHaptic';
import { telegramSDK } from '@/lib/telegram-sdk';

interface TelegramCheckoutButtonProps {
  total: number;
  isLoading: boolean;
  isDisabled: boolean;
  onCheckout: () => void;
}

export default function TelegramCheckoutButton({ 
  total, 
  isLoading, 
  isDisabled, 
  onCheckout 
}: TelegramCheckoutButtonProps) {
  const { impactMedium, notificationSuccess } = useTelegramHaptic();
  const cleanupRef = useRef<(() => void) | null>(null);
  const isConfiguredRef = useRef(false);

  // Настройка MainButton только один раз при монтировании
  useEffect(() => {
    if (!telegramSDK.isAvailable() || isConfiguredRef.current) {
      return;
    }

    console.log('🚀 Настройка Telegram MainButton');

    // Принудительно устанавливаем светлую тему для всего приложения
    telegramSDK.setLightTheme();

    const handleClick = () => {
      if (isLoading || isDisabled) {
        console.log('🚫 Кнопка заблокирована:', { isLoading, isDisabled });
        return;
      }
      
      console.log('🎯 Клик по MainButton');
      impactMedium();
      onCheckout();
      
      // Уведомление об успехе через короткое время
      setTimeout(() => {
        notificationSuccess();
      }, 100);
    };

    // Настраиваем MainButton со светлыми цветами
    const cleanup = telegramSDK.configureMainButton({
      text: `Оформить заказ (${total.toLocaleString('ru-RU')} ₽)`,
      color: '#48C928',     // Зеленый фон кнопки
      textColor: '#FFFFFF', // Белый текст
      onClick: handleClick,
      show: true,
      enable: !isDisabled && !isLoading
    });
    
    // Дополнительно устанавливаем цвета напрямую через WebApp API
    const tg = (window as any).Telegram?.WebApp;
    if (tg?.MainButton) {
      try {
        // Принудительно устанавливаем цвета MainButton после показа
        setTimeout(() => {
          tg.MainButton.color = '#48C928';
          tg.MainButton.textColor = '#FFFFFF';
          
          // КРИТИЧЕСКИ ВАЖНО: Устанавливаем цвет нижней панели
          if (tg.setBottomBarColor) {
            tg.setBottomBarColor('#FFFFFF');
            console.log('🎯 Цвет нижней панели установлен в TelegramCheckoutButton');
          }
          
          console.log('🎨 Цвета MainButton установлены напрямую');
        }, 100);
      } catch (error) {
        console.warn('Не удалось установить цвета MainButton напрямую:', error);
      }
    }

    cleanupRef.current = cleanup;
    isConfiguredRef.current = true;

    console.log('✅ MainButton настроена со светлой темой');

    // Очистка при размонтировании
    return () => {
      console.log('🧹 Очистка MainButton');
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
      isConfiguredRef.current = false;
    };
  }, []); // Пустой массив зависимостей - настройка только один раз

  // Обновление состояния кнопки при изменении пропсов
  useEffect(() => {
    if (!telegramSDK.isAvailable() || !isConfiguredRef.current) {
      return;
    }

    const tg = (window as any).Telegram?.WebApp;
    if (!tg?.MainButton) return;

    console.log('🔄 Обновление состояния MainButton:', { total, isLoading, isDisabled });

    try {
      // Обновляем текст
      const buttonText = isLoading 
        ? 'Оформляем заказ...' 
        : `Оформить заказ (${total.toLocaleString('ru-RU')} ₽)`;
      
      tg.MainButton.setText(buttonText);

      // Обновляем состояние активности
      if (isDisabled || isLoading) {
        tg.MainButton.disable();
      } else {
        tg.MainButton.enable();
      }

      // Обновляем прогресс
      if (isLoading) {
        tg.MainButton.showProgress(false);
      } else {
        tg.MainButton.hideProgress();
      }

      console.log('✅ Состояние обновлено');
    } catch (error) {
      console.error('❌ Ошибка обновления MainButton:', error);
    }
  }, [total, isLoading, isDisabled]); // Только необходимые зависимости

  // Fallback кнопка для обычного браузера
  if (!telegramSDK.isAvailable()) {
    return (
      <div className="checkout-button-fallback">
        <button 
          onClick={onCheckout}
          disabled={isLoading || isDisabled}
          className="checkout-button-custom-styled"
          style={{
            backgroundColor: '#48C928',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            padding: '16px 24px',
            fontSize: '16px',
            fontWeight: '600',
            width: '100%',
            cursor: isDisabled || isLoading ? 'not-allowed' : 'pointer',
            opacity: isDisabled || isLoading ? 0.6 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.2s ease',
            position: 'fixed',
            bottom: '20px',
            left: '16px',
            right: '16px',
            zIndex: 1000,
            boxShadow: '0 4px 12px rgba(72, 201, 40, 0.3)'
          }}
        >
          {isLoading && (
            <div 
              style={{
                width: '20px',
                height: '20px',
                border: '2px solid rgba(255,255,255,0.3)',
                borderTop: '2px solid white',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}
            />
          )}
          {isLoading 
            ? 'Оформляем заказ...' 
            : `Оформить заказ (${total.toLocaleString('ru-RU')} ₽)`
          }
        </button>
        
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          .checkout-button-custom-styled:hover:not(:disabled) {
            background-color: #3ba220 !important;
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(72, 201, 40, 0.4) !important;
          }
          
          .checkout-button-custom-styled:active:not(:disabled) {
            transform: translateY(0);
          }
        `}</style>
      </div>
    );
  }

  // В Telegram используем только MainButton (возвращаем null)
  return null;
}
