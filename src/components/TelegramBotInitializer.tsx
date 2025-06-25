'use client';

import { useEffect } from 'react';
import { logger } from '@/lib/logger';

export function TelegramBotInitializer() {
  useEffect(() => {
    // Инициализация происходит только на сервере через API route
    logger.debug('TelegramBotInitializer mounted', undefined, 'TelegramBot');
  }, []);

  return null;
} 