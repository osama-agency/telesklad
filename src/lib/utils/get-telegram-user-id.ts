import { NextRequest } from 'next/server';

/**
 * Извлекает Telegram User ID из запроса.
 * Сначала ищет в search-параметрах, затем в заголовках.
 * @param request - объект NextRequest
 * @returns Telegram User ID или null
 */
export function getTelegramUserId(request: NextRequest): string | null {
  const { searchParams } = new URL(request.url);
  
  // 1. Проверяем search-параметры (например, ?tg_id=...)
  const tgIdFromQuery = searchParams.get('tg_id');
  if (tgIdFromQuery) {
    return tgIdFromQuery;
  }
  
  // 2. Проверяем заголовки (например, x-telegram-user-id)
  const tgIdFromHeaders = request.headers.get('x-telegram-user-id');
  if (tgIdFromHeaders) {
    return tgIdFromHeaders;
  }

  return null;
} 