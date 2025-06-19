// Система кэширования для аналитических данных TeleSklad
// Использует Map для in-memory кэширования с TTL

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // время жизни в миллисекундах
}

interface CacheOptions {
  ttl?: number; // время жизни в миллисекундах (по умолчанию 5 минут)
  maxSize?: number; // максимальный размер кэша (по умолчанию 100 записей)
}

class AnalyticsCache {
  private cache = new Map<string, CacheEntry<any>>();
  private defaultTTL = 5 * 60 * 1000; // 5 минут
  private maxSize = 100;

  constructor(options: CacheOptions = {}) {
    this.defaultTTL = options.ttl || this.defaultTTL;
    this.maxSize = options.maxSize || this.maxSize;
    
    // Очистка устаревших записей каждую минуту
    setInterval(() => this.cleanup(), 60 * 1000);
  }

  /**
   * Получить данные из кэша
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Проверяем, не истек ли TTL
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Сохранить данные в кэш
   */
  set<T>(key: string, data: T, ttl?: number): void {
    // Если кэш переполнен, удаляем самые старые записи
    if (this.cache.size >= this.maxSize) {
      this.evictOldest();
    }

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL
    };

    this.cache.set(key, entry);
  }

  /**
   * Удалить запись из кэша
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Очистить весь кэш
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Получить размер кэша
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Получить статистику кэша
   */
  getStats() {
    const now = Date.now();
    let validEntries = 0;
    let expiredEntries = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp <= entry.ttl) {
        validEntries++;
      } else {
        expiredEntries++;
      }
    }

    return {
      totalEntries: this.cache.size,
      validEntries,
      expiredEntries,
      maxSize: this.maxSize,
      defaultTTL: this.defaultTTL
    };
  }

  /**
   * Очистка устаревших записей
   */
  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key));

    if (keysToDelete.length > 0) {
      console.log(`🧹 Analytics cache: cleaned up ${keysToDelete.length} expired entries`);
    }
  }

  /**
   * Удаление самых старых записей при переполнении
   */
  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTimestamp = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTimestamp) {
        oldestTimestamp = entry.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      console.log(`🗑️ Analytics cache: evicted oldest entry ${oldestKey}`);
    }
  }

  /**
   * Получить или вычислить значение с кэшированием
   */
  async getOrCompute<T>(
    key: string, 
    computeFn: () => Promise<T>, 
    ttl?: number
  ): Promise<T> {
    // Пытаемся получить из кэша
    const cached = this.get<T>(key);
    if (cached !== null) {
      console.log(`📦 Analytics cache: HIT for ${key}`);
      return cached;
    }

    // Вычисляем значение
    console.log(`🔄 Analytics cache: MISS for ${key}, computing...`);
    const startTime = Date.now();
    
    try {
      const result = await computeFn();
      const computeTime = Date.now() - startTime;
      
      // Сохраняем в кэш
      this.set(key, result, ttl);
      
      console.log(`✅ Analytics cache: computed ${key} in ${computeTime}ms`);
      return result;
    } catch (error) {
      console.error(`❌ Analytics cache: failed to compute ${key}:`, error);
      throw error;
    }
  }

  /**
   * Инвалидировать кэш по паттерну
   */
  invalidatePattern(pattern: string): number {
    const regex = new RegExp(pattern);
    const keysToDelete: string[] = [];

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key));
    
    if (keysToDelete.length > 0) {
      console.log(`🔄 Analytics cache: invalidated ${keysToDelete.length} entries matching pattern ${pattern}`);
    }

    return keysToDelete.length;
  }
}

// Создаем глобальный экземпляр кэша
export const analyticsCache = new AnalyticsCache({
  ttl: 5 * 60 * 1000, // 5 минут для аналитики
  maxSize: 200 // больше места для аналитических данных
});

// Специальные методы для разных типов аналитики
export const AnalyticsCacheHelpers = {
  /**
   * Кэш для аналитики продуктов
   */
  getProductsAnalytics: (period: number) => 
    analyticsCache.getOrCompute(
      `products-analytics-${period}`,
      async () => {
        // Этот метод будет вызван из API
        throw new Error('Should be called from API with actual compute function');
      },
      10 * 60 * 1000 // 10 минут для аналитики продуктов
    ),

  /**
   * Кэш для списка закупок
   */
  getPurchases: (page: number, limit: number, filters?: string) => 
    analyticsCache.getOrCompute(
      `purchases-${page}-${limit}-${filters || 'all'}`,
      async () => {
        throw new Error('Should be called from API with actual compute function');
      },
      2 * 60 * 1000 // 2 минуты для списков
    ),

  /**
   * Кэш для курсов валют
   */
  getExchangeRate: (currency: string) => 
    analyticsCache.getOrCompute(
      `exchange-rate-${currency}`,
      async () => {
        throw new Error('Should be called from API with actual compute function');
      },
      30 * 60 * 1000 // 30 минут для курсов валют
    ),

  /**
   * Инвалидация связанных кэшей при изменении данных
   */
  invalidateOnPurchaseUpdate: () => {
    analyticsCache.invalidatePattern('^purchases-');
    analyticsCache.invalidatePattern('^products-analytics-');
    console.log('🔄 Invalidated purchase-related caches');
  },

  invalidateOnProductUpdate: () => {
    analyticsCache.invalidatePattern('^products-analytics-');
    console.log('🔄 Invalidated product-related caches');
  },

  invalidateOnOrderUpdate: () => {
    analyticsCache.invalidatePattern('^products-analytics-');
    console.log('🔄 Invalidated order-related caches');
  }
};

// Экспорт для использования в API
export default analyticsCache; 