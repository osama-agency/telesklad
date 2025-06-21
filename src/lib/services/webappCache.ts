/**
 * Сервис кэширования для webapp
 * Оптимизирует API запросы и localStorage операции
 */

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

class WebappCacheService {
  private cache = new Map<string, CacheItem<any>>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 минут
  private readonly STORAGE_PREFIX = 'webapp_cache_';

  /**
   * Получить данные из кэша
   */
  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) return null;
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }

  /**
   * Сохранить данные в кэш
   */
  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiry: Date.now() + ttl
    });
  }

  /**
   * Кэшированный API запрос
   */
  async fetchCached<T>(
    url: string, 
    options?: RequestInit,
    ttl: number = this.DEFAULT_TTL
  ): Promise<T> {
    const cacheKey = `api_${url}_${JSON.stringify(options || {})}`;
    
    // Проверяем кэш
    const cached = this.get<T>(cacheKey);
    if (cached) {
      return cached;
    }

    // Делаем запрос
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    
    // Сохраняем в кэш
    this.set(cacheKey, data, ttl);
    
    return data;
  }

  /**
   * Очистить кэш по ключу или паттерну
   */
  clear(pattern?: string): void {
    if (!pattern) {
      this.cache.clear();
      return;
    }

    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Инвалидировать кэш связанный с продуктами
   */
  invalidateProducts(): void {
    this.clear('products');
    this.clear('categories');
  }

  /**
   * Инвалидировать кэш подписок
   */
  invalidateSubscriptions(): void {
    this.clear('subscriptions');
  }

  /**
   * Получить размер кэша
   */
  getSize(): number {
    return this.cache.size;
  }

  /**
   * Очистить устаревшие записи
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key);
      }
    }
  }
}

// Singleton instance
export const webappCache = new WebappCacheService();

// Автоматическая очистка каждые 10 минут
if (typeof window !== 'undefined') {
  setInterval(() => {
    webappCache.cleanup();
  }, 10 * 60 * 1000);
} 