import { RedisService } from './redis.service';
import { prisma } from '@/libs/prismaDb';

/**
 * Service for caching frequently accessed data
 * Использует Redis для кэширования с fallback на базу данных
 */
export class CacheService {
  
  // === ПРОДУКТЫ ===

  /**
   * Получить продукты с кэшированием
   */
  static async getProducts(options: {
    showInWebapp?: boolean;
    categoryId?: number;
    search?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<any[]> {
    const cacheKey = `products:${JSON.stringify(options)}`;
    const cacheTtl = 300; // 5 минут

    try {
      // Пытаемся получить из кэша
      const cached = await RedisService.getCache(cacheKey);
      if (cached) {
        console.log('📦 Products loaded from cache');
        return cached;
      }

      console.log('🔍 Loading products from database');
      
      // Строим запрос к базе данных
      const where: any = {};
      
      if (options.showInWebapp !== undefined) {
        where.show_in_webapp = options.showInWebapp;
      }
      
      if (options.categoryId) {
        where.category_id = options.categoryId;
      }
      
      if (options.search) {
        where.OR = [
          { name: { contains: options.search, mode: 'insensitive' } },
          { description: { contains: options.search, mode: 'insensitive' } }
        ];
      }

      const products = await prisma.products.findMany({
        where,
        orderBy: { created_at: 'desc' },
        take: options.limit || 50,
        skip: options.offset || 0
      });

      // Сохраняем в кэш
      await RedisService.setCache(cacheKey, products, cacheTtl);
      
      return products;
    } catch (error) {
      console.error('❌ Error loading products:', error);
      return [] as any[];
    }
  }

  /**
   * Получить продукт по ID с кэшированием
   */
  static async getProductById(id: number): Promise<any | null> {
    const cacheKey = `product:${id}`;
    const cacheTtl = 600; // 10 минут

    try {
      // Пытаемся получить из кэша
      const cached = await RedisService.getCache(cacheKey);
      if (cached) {
        console.log(`📦 Product ${id} loaded from cache`);
        return cached;
      }

      console.log(`🔍 Loading product ${id} from database`);
      
      const product = await prisma.products.findUnique({
        where: { id: BigInt(id) }
      });

      if (product) {
        // Сохраняем в кэш
        await RedisService.setCache(cacheKey, product, cacheTtl);
      }
      
      return product;
    } catch (error) {
      console.error(`❌ Error loading product ${id}:`, error);
      return null;
    }
  }

  /**
   * Очистить кэш продуктов
   */
  static async clearProductsCache(): Promise<void> {
    try {
      await RedisService.clearCachePattern('products:*');
      await RedisService.clearCachePattern('product:*');
      console.log('🧹 Products cache cleared');
    } catch (error) {
      console.error('❌ Error clearing products cache:', error);
    }
  }

  // === ПОЛЬЗОВАТЕЛИ ===

  /**
   * Получить пользователя по Telegram ID с кэшированием
   */
  static async getUserByTelegramId(tgId: string): Promise<any | null> {
    const cacheKey = `user:tg:${tgId}`;
    const cacheTtl = 300; // 5 минут

    try {
      // Пытаемся получить из кэша
      const cached = await RedisService.getCache(cacheKey);
      if (cached) {
        console.log(`👤 User ${tgId} loaded from cache`);
        return cached;
      }

      console.log(`🔍 Loading user ${tgId} from database`);
      
      const user = await prisma.users.findUnique({
        where: { tg_id: BigInt(tgId) },
        include: {
          account_tiers: true
        }
      });

      if (user) {
        // Сохраняем в кэш
        await RedisService.setCache(cacheKey, user, cacheTtl);
      }
      
      return user;
    } catch (error) {
      console.error(`❌ Error loading user ${tgId}:`, error);
      return null;
    }
  }

  /**
   * Создать или обновить пользователя в кэше
   */
  static async updateUserCache(user: any): Promise<void> {
    if (!user.tg_id) return;
    
    const cacheKey = `user:tg:${user.tg_id.toString()}`;
    await RedisService.setCache(cacheKey, user, 300);
  }

  /**
   * Очистить кэш пользователя
   */
  static async clearUserCache(tgId: string): Promise<void> {
    const cacheKey = `user:tg:${tgId}`;
    await RedisService.deleteCache(cacheKey);
  }

  // === НАСТРОЙКИ БОТА ===

  /**
   * Получить настройки бота с кэшированием
   */
  static async getBotSettings(): Promise<Record<string, string>> {
    const cacheKey = 'bot:settings';
    const cacheTtl = 600; // 10 минут

    try {
      // Пытаемся получить из кэша
      const cached = await RedisService.getCache<Record<string, string>>(cacheKey);
      if (cached) {
        console.log('⚙️ Bot settings loaded from cache');
        return cached;
      }

      console.log('🔍 Loading bot settings from database');
      
      const settings = await prisma.settings.findMany();
      const settingsMap = settings.reduce((acc, setting) => {
        if (setting.variable && setting.value) {
          acc[setting.variable] = setting.value;
        }
        return acc;
      }, {} as Record<string, string>);

      // Сохраняем в кэш
      await RedisService.setCache(cacheKey, settingsMap, cacheTtl);
      
      return settingsMap;
    } catch (error) {
      console.error('❌ Error loading bot settings:', error);
      return {} as Record<string, string>;
    }
  }

  /**
   * Очистить кэш настроек бота
   */
  static async clearBotSettingsCache(): Promise<void> {
    await RedisService.deleteCache('bot:settings');
    console.log('🧹 Bot settings cache cleared');
  }

  // === ЗАКАЗЫ ===

  /**
   * Получить заказ по ID с кэшированием
   */
  static async getOrderById(id: number): Promise<any | null> {
    const cacheKey = `order:${id}`;
    const cacheTtl = 180; // 3 минуты (заказы меняются часто)

    try {
      // Пытаемся получить из кэша
      const cached = await RedisService.getCache(cacheKey);
      if (cached) {
        console.log(`📋 Order ${id} loaded from cache`);
        return cached;
      }

      console.log(`🔍 Loading order ${id} from database`);
      
      const order = await prisma.orders.findUnique({
        where: { id: BigInt(id) },
        include: {
          order_items: {
            include: {
              products: true
            }
          },
          users: true,
          bank_cards: true
        }
      });

      if (order) {
        // Сохраняем в кэш
        await RedisService.setCache(cacheKey, order, cacheTtl);
      }
      
      return order;
    } catch (error) {
      console.error(`❌ Error loading order ${id}:`, error);
      return null;
    }
  }

  /**
   * Очистить кэш заказа
   */
  static async clearOrderCache(id: number): Promise<void> {
    await RedisService.deleteCache(`order:${id}`);
  }

  // === КАТЕГОРИИ (ОТКЛЮЧЕНО - НЕТ В СХЕМЕ) ===
  
  /**
   * Очистить кэш категорий
   */
  static async clearCategoriesCache(): Promise<void> {
    await RedisService.deleteCache('categories:all');
    console.log('🧹 Categories cache cleared');
  }

  // === СТАТИСТИКА И СЧЕТЧИКИ ===

  /**
   * Инкремент счетчика активности пользователя
   */
  static async incrementUserActivity(userId: string): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    const key = `activity:${today}:${userId}`;
    await RedisService.increment(key, 86400); // TTL 1 день
  }

  /**
   * Получить статистику активности за день
   */
  static async getDailyActivityStats(date: string = new Date().toISOString().split('T')[0]): Promise<number> {
    const pattern = `activity:${date}:*`;
    
    try {
      const redis = await RedisService.getInstance();
      if (!redis) return 0;

      const keys = await redis.keys(pattern);
      return keys.length;
    } catch (error) {
      console.error('❌ Error getting activity stats:', error);
      return 0;
    }
  }

  // === ОЧИСТКА ВСЕГО КЭША ===

  /**
   * Полная очистка кэша
   */
  static async clearAllCache(): Promise<void> {
    try {
      await Promise.all([
        this.clearProductsCache(),
        this.clearBotSettingsCache(),
        this.clearCategoriesCache(),
        RedisService.clearCachePattern('user:*'),
        RedisService.clearCachePattern('order:*'),
        RedisService.clearCachePattern('activity:*')
      ]);
      
      console.log('🧹 All cache cleared');
    } catch (error) {
      console.error('❌ Error clearing all cache:', error);
    }
  }
} 