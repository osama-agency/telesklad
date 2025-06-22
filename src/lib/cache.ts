/**
 * Утилиты для управления кэшированием API-роутов
 */

export interface CacheOptions {
  sMaxAge: number;
  staleRevalidate: number;
  isPrivate?: boolean;
}

/**
 * Генерирует заголовки Cache-Control для HTTP-ответов
 */
export const cacheHeaders = (options: CacheOptions) => {
  const cacheType = options.isPrivate ? 'private' : 'public';
  return {
    'Content-Type': 'application/json',
    'Cache-Control': `${cacheType}, s-maxage=${options.sMaxAge}, stale-while-revalidate=${options.staleRevalidate}`
  };
};

/**
 * Предустановленные настройки кэширования для разных типов данных
 */
export const CachePresets = {
  // Публичные данные (продукты, категории) - редко изменяются
  PUBLIC_STATIC: {
    sMaxAge: 300, // 5 минут свежий кэш
    staleRevalidate: 600, // 10 минут устаревший кэш
    isPrivate: false
  },

  // Публичные данные (продукты с ценами) - могут изменяться чаще
  PUBLIC_DYNAMIC: {
    sMaxAge: 60, // 1 минута свежий кэш
    staleRevalidate: 300, // 5 минут устаревший кэш
    isPrivate: false
  },

  // Персональные данные (профиль, настройки) - изменяются редко
  PRIVATE_STATIC: {
    sMaxAge: 30, // 30 секунд свежий кэш
    staleRevalidate: 60, // 1 минута устаревший кэш
    isPrivate: true
  },

  // Персональные данные (заказы, корзина) - изменяются часто
  PRIVATE_DYNAMIC: {
    sMaxAge: 15, // 15 секунд свежий кэш
    staleRevalidate: 30, // 30 секунд устаревший кэш
    isPrivate: true
  },

  // Очень динамичные данные (лояльность, бонусы)
  REAL_TIME: {
    sMaxAge: 10, // 10 секунд свежий кэш
    staleRevalidate: 30, // 30 секунд устаревший кэш
    isPrivate: true
  }
} as const;

/**
 * Создает Response с кэшированием
 */
export const createCachedResponse = (
  data: any,
  cacheOptions: CacheOptions,
  status: number = 200
): Response => {
  const headers = cacheHeaders(cacheOptions);
  return new Response(JSON.stringify(data), { status, headers });
};

/**
 * Типы данных для автоматического выбора настроек кэширования
 */
export enum CacheType {
  PRODUCTS = 'products',
  CATEGORIES = 'categories',
  PROFILE = 'profile',
  ORDERS = 'orders',
  FAVORITES = 'favorites',
  LOYALTY = 'loyalty'
}

/**
 * Автоматический выбор настроек кэширования по типу данных
 */
export const getCachePreset = (type: CacheType): CacheOptions => {
  switch (type) {
    case CacheType.CATEGORIES:
      return CachePresets.PUBLIC_STATIC;
    case CacheType.PRODUCTS:
      return CachePresets.PUBLIC_DYNAMIC;
    case CacheType.PROFILE:
      return CachePresets.PRIVATE_STATIC;
    case CacheType.ORDERS:
    case CacheType.FAVORITES:
      return CachePresets.PRIVATE_DYNAMIC;
    case CacheType.LOYALTY:
      return CachePresets.REAL_TIME;
    default:
      return CachePresets.PUBLIC_DYNAMIC;
  }
}; 