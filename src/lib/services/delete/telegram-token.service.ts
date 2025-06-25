import { prisma } from '@/libs/prismaDb';

// Типы токенов
type TokenType = 'tg_token' | 'webapp_telegram_bot_token' | 'telesklad_bot_token';

/**
 * Централизованный сервис для управления токенами Telegram ботов
 */
export class TelegramTokenService {
  
  // Кэш для токенов (обновляется каждые 5 минут)
  private static tokenCache: {
    tg_token?: string;
    webapp_telegram_bot_token?: string;
    telesklad_bot_token?: string;
    lastUpdated: number;
  } = { lastUpdated: 0 };

  private static readonly CACHE_TTL = 5 * 60 * 1000; // 5 минут

  /**
   * Получить токен бота для закупок и админа (@telesklad_bot)
   */
  static async getTelegramBotToken(): Promise<string | null> {
    try {
      // Проверяем кэш
      if (this.isCacheValid() && this.tokenCache.telesklad_bot_token) {
        return this.tokenCache.telesklad_bot_token;
      }

      // Получаем токен из базы данных
      const setting = await prisma.settings.findFirst({
        where: { variable: 'telesklad_bot_token' }
      });
      
      if (setting?.value) {
        console.log('🔑 Using telesklad_bot_token from database');
        // Обновляем кэш
        this.updateCache('telesklad_bot_token', setting.value);
        return setting.value;
      }
      
      // Fallback к переменной окружения
      const envToken = process.env.TELESKLAD_BOT_TOKEN || null;
      if (envToken) {
        console.log('🔑 Using TELESKLAD_BOT_TOKEN from environment variables');
        // Обновляем кэш
        this.updateCache('telesklad_bot_token', envToken);
      }
      return envToken;
    } catch (error) {
      console.warn('⚠️ Failed to get telesklad bot token:', error);
      return process.env.TELESKLAD_BOT_TOKEN || null;
    }
  }

  /**
   * Получить токен клиентского бота (CLIENT_BOT_TOKEN)
   * Используется для WebApp и коммуникации с клиентами
   */
  static async getWebappBotToken(): Promise<string | null> {
    try {
      // Проверяем кэш
      if (this.isCacheValid() && this.tokenCache.webapp_telegram_bot_token) {
        return this.tokenCache.webapp_telegram_bot_token;
      }

      // Получаем из старой таблицы settings (пока используем старую логику)
      const setting = await prisma.settings.findUnique({
        where: { variable: 'webapp_telegram_bot_token' }
      });

      let token: string | null = null;

      if (setting && setting.value && !this.isMaskedToken(setting.value)) {
        token = setting.value;
        console.log('🔑 Using CLIENT_BOT_TOKEN (webapp_telegram_bot_token) from settings table');
      } else {
        // Fallback к переменной окружения
        token = process.env.WEBAPP_TELEGRAM_BOT_TOKEN || null;
        if (token) {
          console.log('🔑 Using WEBAPP_TELEGRAM_BOT_TOKEN from environment variables');
        }
      }

      // Обновляем кэш
      this.updateCache('webapp_telegram_bot_token', token);

      return token;
    } catch (error) {
      console.error('❌ Error getting webapp bot token:', error);
      return process.env.WEBAPP_TELEGRAM_BOT_TOKEN || null;
    }
  }

  /**
   * Получить токен основного бота (@strattera_bot)
   * Этот бот работает на Rails сервере, поэтому здесь только для справки
   */
  static async getMainBotToken(): Promise<string | null> {
    try {
      // Проверяем кэш
      if (this.isCacheValid() && this.tokenCache.tg_token) {
        return this.tokenCache.tg_token;
      }

      // Получаем из базы данных
      const setting = await prisma.settings.findUnique({
        where: { variable: 'tg_token' }
      });

      let token: string | null = null;

      if (setting && setting.value && !this.isMaskedToken(setting.value)) {
        token = setting.value;
        console.log('🔑 Using tg_token (@strattera_bot) from database');
      }

      // Обновляем кэш
      this.updateCache('tg_token', token);

      return token;
    } catch (error) {
      console.error('❌ Error getting main bot token:', error);
      return null;
    }
  }

  /**
   * Получить оба токена одновременно
   */
  static async getAllTokens(): Promise<{
    telegram_bot_token: string | null;
    webapp_telegram_bot_token: string | null;
  }> {
    const [telegramToken, webappToken] = await Promise.all([
      this.getTelegramBotToken(),
      this.getWebappBotToken()
    ]);

    return {
      telegram_bot_token: telegramToken,
      webapp_telegram_bot_token: webappToken
    };
  }

  /**
   * Получить API URL для основного бота
   */
  static async getTelegramApiUrl(): Promise<string | null> {
    const token = await this.getTelegramBotToken();
    return token ? `https://api.telegram.org/bot${token}` : null;
  }

  /**
   * Получить API URL для WebApp бота
   */
  static async getWebappApiUrl(): Promise<string | null> {
    const token = await this.getWebappBotToken();
    return token ? `https://api.telegram.org/bot${token}` : null;
  }

  /**
   * Проверить валидность токена через Telegram API
   */
  static async validateToken(token: string): Promise<{
    valid: boolean;
    botInfo?: any;
    error?: string;
  }> {
    try {
      const response = await fetch(`https://api.telegram.org/bot${token}/getMe`);
      const result = await response.json();

      if (result.ok) {
        return {
          valid: true,
          botInfo: result.result
        };
      } else {
        return {
          valid: false,
          error: result.description || 'Invalid token'
        };
      }
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Network error'
      };
    }
  }

  /**
   * Обновить токен в базе данных
   */
  static async updateToken(tokenType: 'telegram_bot_token' | 'webapp_telegram_bot_token', token: string): Promise<boolean> {
    try {
      // Сначала валидируем токен
      const validation = await this.validateToken(token);
      if (!validation.valid) {
        throw new Error(`Invalid token: ${validation.error}`);
      }

      // Сохраняем в базу данных
      await prisma.settings.upsert({
        where: { variable: tokenType },
        update: { 
          value: token,
          updated_at: new Date()
        },
        create: {
          variable: tokenType,
          value: token,
          description: `Telegram bot token for ${tokenType.includes('webapp') ? 'WebApp bot' : 'main bot'}`,
          created_at: new Date(),
          updated_at: new Date()
        }
      });

      // Сбрасываем кэш
      this.clearCache();

      console.log(`✅ ${tokenType} updated successfully`);
      return true;
    } catch (error) {
      console.error(`❌ Error updating ${tokenType}:`, error);
      return false;
    }
  }

  /**
   * Очистить кэш токенов (принудительно перезагрузить из БД)
   */
  static clearCache(): void {
    this.tokenCache = { lastUpdated: 0 };
    console.log('🧹 Token cache cleared');
  }

  /**
   * Получить статус токенов (для диагностики)
   */
  static async getTokensStatus(): Promise<{
    telegram_bot: {
      source: 'database' | 'environment' | 'none';
      valid: boolean;
      botInfo?: any;
      masked?: string;
    };
    webapp_bot: {
      source: 'database' | 'environment' | 'none';
      valid: boolean;
      botInfo?: any;
      masked?: string;
    };
  }> {
    const result: {
      telegram_bot: {
        source: 'database' | 'environment' | 'none';
        valid: boolean;
        botInfo?: any;
        masked?: string;
      };
      webapp_bot: {
        source: 'database' | 'environment' | 'none';
        valid: boolean;
        botInfo?: any;
        masked?: string;
      };
    } = {
      telegram_bot: { source: 'none', valid: false },
      webapp_bot: { source: 'none', valid: false }
    };

    // Проверяем основной бот
    try {
      const telegramToken = await this.getTelegramBotToken();
      if (telegramToken) {
        const dbSetting = await prisma.settings.findUnique({
          where: { variable: 'telegram_bot_token' }
        });
        
        result.telegram_bot.source = (dbSetting && dbSetting.value && !this.isMaskedToken(dbSetting.value)) 
          ? 'database' 
          : 'environment';
        
        const validation = await this.validateToken(telegramToken);
        result.telegram_bot.valid = validation.valid;
        result.telegram_bot.botInfo = validation.botInfo;
        result.telegram_bot.masked = this.maskToken(telegramToken);
      }
    } catch (error) {
      console.error('Error checking telegram bot status:', error);
    }

    // Проверяем WebApp бот
    try {
      const webappToken = await this.getWebappBotToken();
      if (webappToken) {
        const dbSetting = await prisma.settings.findUnique({
          where: { variable: 'webapp_telegram_bot_token' }
        });
        
        result.webapp_bot.source = (dbSetting && dbSetting.value && !this.isMaskedToken(dbSetting.value)) 
          ? 'database' 
          : 'environment';
        
        const validation = await this.validateToken(webappToken);
        result.webapp_bot.valid = validation.valid;
        result.webapp_bot.botInfo = validation.botInfo;
        result.webapp_bot.masked = this.maskToken(webappToken);
      }
    } catch (error) {
      console.error('Error checking webapp bot status:', error);
    }

    return result;
  }

  // Приватные методы

  /**
   * Обновить значение в кэше
   */
  private static updateCache(tokenType: TokenType, value: string | null): void {
    this.tokenCache[tokenType] = value || undefined;
    this.tokenCache.lastUpdated = Date.now();
  }

  /**
   * Проверить актуальность кэша
   */
  private static isCacheValid(): boolean {
    return Date.now() - this.tokenCache.lastUpdated < this.CACHE_TTL;
  }

  /**
   * Проверить, является ли токен замаскированным
   */
  private static isMaskedToken(token: string): boolean {
    return token.includes('***') || token.includes('...');
  }

  private static maskToken(token: string): string {
    if (token.length < 15) return token;
    return `${token.substring(0, 10)}...${token.slice(-4)}`;
  }
} 