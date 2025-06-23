'use client';

import { useEffect } from 'react';

export function TelegramBotInitializer() {
  useEffect(() => {
    // Инициализация происходит только на сервере через API route
    console.log('TelegramBotInitializer mounted');
  }, []);

  return null;
} 