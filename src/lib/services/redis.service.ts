import { Redis } from '@upstash/redis';
import { Redis as IORedis } from 'ioredis';

/**
 * Centralized Redis service for caching and queues
 * Поддерживает локальный Redis (приоритет) и Upstash Redis (fallback)
 */
export class RedisService {
  private static redis: Redis | IORedis | null = null;
  private static isInitialized = false;
  private static isLocalRedis = false;

  /**
   * Инициализация Redis подключения
   */
  static async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Приоритет: локальный Redis
      if (process.env.REDIS_URL || (process.env.REDIS_HOST && process.env.REDIS_PORT)) {
        const redisUrl = process.env.REDIS_URL || `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`;
        
        this.redis = new IORedis(redisUrl, {
          maxRetriesPerRequest: 3,
          lazyConnect: true,
          connectTimeout: 5000,
          commandTimeout: 5000
        });
        
        // Тестируем подключение
        await this.redis.ping();
        this.isLocalRedis = true;
        console.log('✅ Redis (Local) initialized successfully');
      }
      // Fallback: Upstash Redis
      else if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
        this.redis = new Redis({
          url: process.env.UPSTASH_REDIS_REST_URL,
          token: process.env.UPSTASH_REDIS_REST_TOKEN,
        });
        
        // Тестируем подключение
        await this.redis.ping();
        this.isLocalRedis = false;
        console.log('✅ Redis (Upstash) initialized successfully');
      } 
      else {
        console.log('⚠️ Redis credentials not found - using fallback mode');
        console.log('ℹ️ Add REDIS_URL or UPSTASH_REDIS_REST_URL to enable Redis');
        this.redis = null;
        this.isInitialized = true;
        return;
      }

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
  static async getInstance(): Promise<Redis | IORedis | null> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    return this.redis;
  }

  /**
   * Получение клиента Redis (для совместимости)
   */
  static getClient(): Redis | IORedis | null {
    return this.redis;
  }

  /**
   * Проверка доступности Redis
   */
  static isAvailable(): boolean {
    return this.redis !== null;
  }

  /**
   * Проверка типа Redis (локальный или Upstash)
   */
  static isLocal(): boolean {
    return this.isLocalRedis;
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

      if (this.isLocalRedis) {
        // Локальный Redis
        await (redis as IORedis).setex(key, ttl, serializedValue);
      } else {
        // Upstash Redis
        await (redis as Redis).setex(key, ttl, serializedValue);
      }
      
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

      let data: any;
      
      if (this.isLocalRedis) {
        // Локальный Redis
        data = await (redis as IORedis).get(key);
      } else {
        // Upstash Redis
        data = await (redis as Redis).get(key);
      }
      
      if (!data) return null;

      // Безопасная десериализация с обработкой BigInt
      if (typeof data === 'string') {
        return JSON.parse(data, (key, val) => {
          if (typeof val === 'string' && val.endsWith('n') && /^\d+n$/.test(val)) {
            return BigInt(val.slice(0, -1));
          }
          return val;
        });
      } else {
        // Уже объект - возвращаем как есть (только для Upstash)
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

      if (this.isLocalRedis) {
        await (redis as IORedis).del(key);
      } else {
        await (redis as Redis).del(key);
      }
      
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

      let keys: string[] = [];
      
      if (this.isLocalRedis) {
        keys = await (redis as IORedis).keys(pattern);
        if (keys.length > 0) {
          await (redis as IORedis).del(...keys);
        }
      } else {
        keys = await (redis as Redis).keys(pattern);
        if (keys.length > 0) {
          await (redis as Redis).del(...keys);
        }
      }
      
      return true;
    } catch (error) {
      console.error('Redis clearCachePattern error:', error);
      return false;
    }
  }

  // === ПРОСТЫЕ ОЧЕРЕДИ (ОПТИМИЗИРОВАНЫ ДЛЯ ЛОКАЛЬНОГО REDIS) ===

  /**
   * Добавить задачу в очередь (простой список)
   */
  static async addToQueue(queueName: string, job: any, delay: number = 0): Promise<boolean> {
    try {
      const redis = await this.getInstance();
      if (!redis) return false;

      const jobData = {
        id: Date.now() + Math.random(),
        data: job,
        createdAt: new Date().toISOString(),
        delay
      };

      const serializedJob = JSON.stringify(jobData);

      if (this.isLocalRedis) {
        // Локальный Redis - простая очередь FIFO
        await (redis as IORedis).rpush(queueName, serializedJob);
      } else {
        // Upstash Redis - используем sorted set для совместимости
        await (redis as Redis).zadd(
          `queue:${queueName}`,
          { score: Date.now() + delay * 1000, member: serializedJob }
        );
      }

      console.log(`📥 Job added to queue ${queueName}, delay: ${delay}s`);
      return true;
    } catch (error) {
      console.error('Redis addToQueue error:', error);
      return false;
    }
  }

  /**
   * Получить задачи из очереди
   */
  static async getQueueJobs(queueName: string, limit: number = 10): Promise<any[]> {
    try {
      const redis = await this.getInstance();
      if (!redis) return [];

      let jobs: string[] = [];

      if (this.isLocalRedis) {
        // Локальный Redis - получаем из простого списка
        jobs = await (redis as IORedis).lrange(queueName, 0, limit - 1);
      } else {
        // Upstash Redis - получаем из sorted set
        const now = Date.now();
                 const result = await (redis as Redis).zrange(
           `queue:${queueName}`,
           0,
           now,
           { byScore: true, offset: 0, count: limit }
         );
         jobs = Array.isArray(result) ? result as string[] : [];
      }

      return jobs.map((jobStr, index) => {
        try {
          const jobData = JSON.parse(jobStr);
          return {
            id: jobData.id || `job_${Date.now()}_${index}`,
            data: jobData.data || jobData,
            createdAt: jobData.createdAt,
            originalString: jobStr
          };
        } catch (error) {
          console.error('Failed to parse job:', error);
          return null;
        }
      }).filter(Boolean);
      
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

      if (this.isLocalRedis) {
        // Локальный Redis - удаляем первый элемент (FIFO)
        await (redis as IORedis).lpop(queueName);
      } else {
        // Upstash Redis - удаляем из sorted set
        const jobString = jobData.originalString || JSON.stringify(jobData);
        await (redis as Redis).zrem(`queue:${queueName}`, jobString);
      }

      return true;
    } catch (error) {
      console.error('Redis removeFromQueue error:', error);
      return false;
    }
  }

  // === ПОЛЬЗОВАТЕЛЬСКИЕ СОСТОЯНИЯ ===

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
   * Очистить состояние пользователя
   */
  static async clearUserState(userId: string): Promise<boolean> {
    return await this.deleteCache(`user_state:${userId}`);
  }

  // === СЧЕТЧИКИ ===

  /**
   * Увеличить счетчик
   */
  static async increment(key: string, ttl?: number): Promise<number | null> {
    try {
      const redis = await this.getInstance();
      if (!redis) return null;

      let result: number;
      
      if (this.isLocalRedis) {
        result = await (redis as IORedis).incr(key);
        if (ttl) {
          await (redis as IORedis).expire(key, ttl);
        }
      } else {
        result = await (redis as Redis).incr(key);
        if (ttl) {
          await (redis as Redis).expire(key, ttl);
        }
      }

      return result;
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

      let result: string | null;
      
      if (this.isLocalRedis) {
        result = await (redis as IORedis).get(key);
      } else {
        result = await (redis as Redis).get(key);
      }

      return result ? parseInt(result, 10) : 0;
    } catch (error) {
      console.error('Redis getCount error:', error);
      return 0;
    }
  }

  // === RATE LIMITING ===

  /**
   * Проверка лимита запросов
   */
  static async checkRateLimit(
    key: string,
    maxRequests: number,
    windowSeconds: number
  ): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    try {
      const redis = await this.getInstance();
      if (!redis) {
        return { allowed: true, remaining: maxRequests, resetTime: Date.now() + windowSeconds * 1000 };
      }

      const now = Date.now();
      const windowStart = now - windowSeconds * 1000;
      const rateLimitKey = `rate_limit:${key}`;

      let count: number;
      
      if (this.isLocalRedis) {
        // Локальный Redis - используем простой счетчик с TTL
        const currentCount = await (redis as IORedis).get(rateLimitKey);
        count = currentCount ? parseInt(currentCount, 10) : 0;
        
        if (count >= maxRequests) {
          const ttl = await (redis as IORedis).ttl(rateLimitKey);
          return {
            allowed: false,
            remaining: 0,
            resetTime: now + ttl * 1000
          };
        }
        
        // Увеличиваем счетчик
        const newCount = await (redis as IORedis).incr(rateLimitKey);
        if (newCount === 1) {
          await (redis as IORedis).expire(rateLimitKey, windowSeconds);
        }
        
        return {
          allowed: true,
          remaining: Math.max(0, maxRequests - newCount),
          resetTime: now + windowSeconds * 1000
        };
      } else {
        // Upstash Redis - используем sorted set
        await (redis as Redis).zremrangebyscore(rateLimitKey, 0, windowStart);
        count = await (redis as Redis).zcard(rateLimitKey);

        if (count >= maxRequests) {
          return {
            allowed: false,
            remaining: 0,
            resetTime: now + windowSeconds * 1000
          };
        }

        await (redis as Redis).zadd(rateLimitKey, { score: now, member: now });
        await (redis as Redis).expire(rateLimitKey, windowSeconds);

        return {
          allowed: true,
          remaining: Math.max(0, maxRequests - count - 1),
          resetTime: now + windowSeconds * 1000
        };
      }
    } catch (error) {
      console.error('Redis checkRateLimit error:', error);
      return { allowed: true, remaining: maxRequests, resetTime: Date.now() + windowSeconds * 1000 };
    }
  }

  // === ДИАГНОСТИКА ===

  /**
   * Проверка здоровья Redis
   */
  static async healthCheck(): Promise<{ status: string; latency?: number; error?: string }> {
    try {
      const redis = await this.getInstance();
      if (!redis) {
        return { status: 'unavailable' };
      }

      const start = Date.now();
      
      if (this.isLocalRedis) {
        await (redis as IORedis).ping();
      } else {
        await (redis as Redis).ping();
      }
      
      const latency = Date.now() - start;

      return {
        status: 'healthy',
        latency
      };
    } catch (error) {
      return {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // === ПОЛЬЗОВАТЕЛЬСКИЕ ДАННЫЕ ===

  /**
   * Получить данные пользователя из кэша
   */
  static async getUserData(userId: string): Promise<any> {
    return await this.getCache(`user:${userId}`);
  }

  /**
   * Сохранить данные пользователя в кэш
   */
  static async setUserData(userId: string, userData: any): Promise<void> {
    await this.setCache(`user:${userId}`, userData, 3600); // 1 час
  }
} 