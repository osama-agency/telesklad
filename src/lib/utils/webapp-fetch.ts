// Утилитарная функция для fetch запросов в веб-приложении
// Автоматически добавляет заголовок X-Telegram-Init-Data если доступен

interface WebAppFetchOptions extends RequestInit {
  headers?: HeadersInit;
}

export function webAppFetch(url: string, options: WebAppFetchOptions = {}): Promise<Response> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {})
  };

  // Добавляем Telegram initData если доступен
  if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp?.initData) {
    headers['X-Telegram-Init-Data'] = (window as any).Telegram.WebApp.initData;
  }

  return fetch(url, {
    ...options,
    headers
  });
}

// Хук для получения заголовков Telegram
export function useTelegramHeaders(): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  // Добавляем Telegram initData если доступен
  if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp?.initData) {
    headers['X-Telegram-Init-Data'] = (window as any).Telegram.WebApp.initData;
  }

  return headers;
} 