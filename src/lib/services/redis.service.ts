import { Redis } from '@upstash/redis';

/**
 * Centralized Redis service for caching and queues
 * Поддерживает как локальный Redis, так и Upstash Redis
 */
export class RedisService {
  private static redis: Redis | null = null;
  private static isInitialized = false;

  /**
   * Инициализация Redis подключения
   */
  static async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Попытка подключения к Upstash Redis (приоритет)
      if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
        this.redis = new Redis({
          url: process.env.UPSTASH_REDIS_REST_URL,
          token: process.env.UPSTASH_REDIS_REST_TOKEN,
        });
        console.log('✅ Redis (Upstash) initialized successfully');
      } 
      // Fallback - пока только Upstash поддерживается
      else {
        console.log('⚠️ Redis credentials not found - using fallback mode');
        console.log('ℹ️ Add UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN to enable Redis');
        this.redis = null;
        this.isInitialized = true;
        return;
      }

      // Тестируем подключение
      await this.redis.ping();
      this.isInitialized = true;
      
    } catch (error) {
      console.error('❌ Failed to initialize Redis:', error);
      console.log('⚠️ Running without Redis - caching disabled');
      this.redis = null;
      this.isInitialized = true;
    }
  }

  /**
   * Получение экземпляра Redis
   */
  static async getInstance(): Promise<Redis | null> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    return this.redis;
  }

  /**
   * Проверка доступности Redis
   */
  static isAvailable(): boolean {
    return this.redis !== null;
  }

  // === КЭШИРОВАНИЕ ===

  /**
   * Сохранить данные в кэш
   */
  static async setCache(key: string, value: any, ttl: number = 3600): Promise<boolean> {
    try {
      const redis = await this.getInstance();
      if (!redis) return false;

      // Безопасная сериализация с обработкой BigInt и циклических ссылок
      const serializedValue = JSON.stringify(value, (key, val) => {
        if (typeof val === 'bigint') {
          return val.toString() + 'n';
        }
        return val;
      });

      await redis.setex(key, ttl, serializedValue);
      return true;
    } catch (error) {
      console.error('Redis setCache error:', error);
      return false;
    }
  }

  /**
   * Получить данные из кэша
   */
  static async getCache<T>(key: string): Promise<T | null> {
    try {
      const redis = await this.getInstance();
      if (!redis) return null;

      const data = await redis.get(key);
      if (!data) return null;

      // Upstash может возвращать уже парсенные объекты или строки
      if (typeof data === 'string') {
        // Безопасная десериализация с обработкой BigInt
        return JSON.parse(data, (key, val) => {
          if (typeof val === 'string' && val.endsWith('n') && /^\d+n$/.test(val)) {
            return BigInt(val.slice(0, -1));
          }
          return val;
        });
              } else {
          // Уже объект - возвращаем как есть
          return data as T;
        }
    } catch (error) {
      console.error('Redis getCache error:', error);
      return null;
    }
  }

  /**
   * Удалить из кэша
   */
  static async deleteCache(key: string): Promise<boolean> {
    try {
      const redis = await this.getInstance();
      if (!redis) return false;

      await redis.del(key);
      return true;
    } catch (error) {
      console.error('Redis deleteCache error:', error);
      return false;
    }
  }

  /**
   * Очистить кэш по паттерну
   */
  static async clearCachePattern(pattern: string): Promise<boolean> {
    try {
      const redis = await this.getInstance();
      if (!redis) return false;

      // Получаем все ключи по паттерну
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
      return true;
    } catch (error) {
      console.error('Redis clearCachePattern error:', error);
      return false;
    }
  }

  // === ОЧЕРЕДИ УВЕДОМЛЕНИЙ ===

  /**
   * Добавить задачу в очередь
   */
  static async addToQueue(queueName: string, job: any, delay: number = 0): Promise<boolean> {
    try {
      const redis = await this.getInstance();
      if (!redis) return false;

      const jobData = {
        id: Date.now() + Math.random(),
        data: job,
        createdAt: new Date().toISOString(),
        executeAt: new Date(Date.now() + delay * 1000).toISOString()
      };

      // Добавляем в отсортированный set с временем выполнения как score
      await redis.zadd(
        `queue:${queueName}`,
        { score: Date.now() + delay * 1000, member: JSON.stringify(jobData) }
      );

      console.log(`📥 Job added to queue ${queueName}, delay: ${delay}s`);
      return true;
    } catch (error) {
      console.error('Redis addToQueue error:', error);
      return false;
    }
  }

  /**
   * Получить задачи из очереди (готовые к выполнению)
   */
  static async getQueueJobs(queueName: string, limit: number = 10): Promise<any[]> {
    try {
      const redis = await this.getInstance();
      if (!redis) return [];

      const now = Date.now();
      
      // Получаем задачи, которые готовы к выполнению
      const jobs = await redis.zrange(
        `queue:${queueName}`,
        0,
        now,
        { byScore: true, offset: 0, count: limit }
      );

      // Upstash Redis может возвращать уже парсенные объекты или строки
      return jobs.map((job: any) => {
        if (typeof job === 'string') {
          try {
            return JSON.parse(job, (key, val) => {
              if (typeof val === 'string' && val.endsWith('n') && /^\d+n$/.test(val)) {
                return BigInt(val.slice(0, -1));
              }
              return val;
            });
          } catch (error) {
            console.error('Error parsing queue job string:', job, error);
            return null;
          }
        } else {
          // Уже объект - возвращаем как есть
          return job;
        }
      }).filter(job => job !== null);
    } catch (error) {
      console.error('Redis getQueueJobs error:', error);
      return [];
    }
  }

  /**
   * Удалить задачу из очереди
   */
  static async removeFromQueue(queueName: string, jobData: any): Promise<boolean> {
    try {
      const redis = await this.getInstance();
      if (!redis) return false;

      await redis.zrem(`queue:${queueName}`, JSON.stringify(jobData));
      return true;
    } catch (error) {
      console.error('Redis removeFromQueue error:', error);
      return false;
    }
  }

  // === СОСТОЯНИЯ ПОЛЬЗОВАТЕЛЕЙ ===

  /**
   * Сохранить состояние пользователя
   */
  static async setUserState(userId: string, state: any, ttl: number = 1800): Promise<boolean> {
    return await this.setCache(`user_state:${userId}`, state, ttl);
  }

  /**
   * Получить состояние пользователя
   */
  static async getUserState<T>(userId: string): Promise<T | null> {
    return await this.getCache<T>(`user_state:${userId}`);
  }

  /**
   * Удалить состояние пользователя
   */
  static async clearUserState(userId: string): Promise<boolean> {
    return await this.deleteCache(`user_state:${userId}`);
  }

  // === СЧЕТЧИКИ И СТАТИСТИКА ===

  /**
   * Инкремент счетчика
   */
  static async increment(key: string, ttl?: number): Promise<number | null> {
    try {
      const redis = await this.getInstance();
      if (!redis) return null;

      const count = await redis.incr(key);
      if (ttl) {
        await redis.expire(key, ttl);
      }
      return count;
    } catch (error) {
      console.error('Redis increment error:', error);
      return null;
    }
  }

  /**
   * Получить значение счетчика
   */
  static async getCount(key: string): Promise<number> {
    try {
      const redis = await this.getInstance();
      if (!redis) return 0;

      const count = await redis.get(key);
      return count ? parseInt(count as string) : 0;
    } catch (error) {
      console.error('Redis getCount error:', error);
      return 0;
    }
  }

  // === RATE LIMITING ===

  /**
   * Проверить rate limit
   */
  static async checkRateLimit(
    key: string,
    maxRequests: number,
    windowSeconds: number
  ): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    try {
      const redis = await this.getInstance();
      if (!redis) {
        return { allowed: true, remaining: maxRequests, resetTime: 0 };
      }

      const now = Date.now();
      const window = windowSeconds * 1000;
      const windowStart = now - window;

      // Используем sorted set для хранения временных меток
      const pipeline = redis.pipeline();
      
      // Удаляем старые записи
      pipeline.zremrangebyscore(`rate_limit:${key}`, 0, windowStart);
      
      // Добавляем текущий запрос
      pipeline.zadd(`rate_limit:${key}`, { score: now, member: now.toString() });
      
      // Устанавливаем TTL
      pipeline.expire(`rate_limit:${key}`, windowSeconds);
      
      // Считаем текущее количество запросов
      pipeline.zcard(`rate_limit:${key}`);
      
      const results = await pipeline.exec();
      const currentCount = results[3] as number;

      const allowed = currentCount <= maxRequests;
      const remaining = Math.max(0, maxRequests - currentCount);
      const resetTime = now + window;

      return { allowed, remaining, resetTime };
    } catch (error) {
      console.error('Redis checkRateLimit error:', error);
      return { allowed: true, remaining: maxRequests, resetTime: 0 };
    }
  }

  // === ЗДОРОВЬЕ СИСТЕМЫ ===

  /**
   * Проверка здоровья Redis
   */
  static async healthCheck(): Promise<{ status: string; latency?: number; error?: string }> {
    try {
      const redis = await this.getInstance();
      if (!redis) {
        return { status: 'unavailable', error: 'Redis not initialized' };
      }

      const start = Date.now();
      await redis.ping();
      const latency = Date.now() - start;

      return { status: 'healthy', latency };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return { status: 'unhealthy', error: errorMessage };
    }
  }
} 