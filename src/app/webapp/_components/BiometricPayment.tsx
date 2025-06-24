'use client';
import { useState } from 'react';

export default function BiometricPayment({ onSuccess }: { onSuccess: () => void }) {
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const authenticateWithBiometric = () => {
    const tg = window.Telegram?.WebApp;
    if (!tg?.BiometricManager?.isInited) return;

    setIsAuthenticating(true);
    
    tg.BiometricManager.authenticate({
      reason: 'Подтвердите оплату с помощью биометрии'
    }, (isAuthenticated) => {
      setIsAuthenticating(false);
      if (isAuthenticated) {
        onSuccess();
      }
    });
  };

  return (
    <button 
      onClick={authenticateWithBiometric}
      disabled={isAuthenticating}
      className="biometric-pay-btn"
    >
      🔐 {isAuthenticating ? 'Аутентификация...' : 'Оплатить по Touch ID'}
    </button>
  );
} 