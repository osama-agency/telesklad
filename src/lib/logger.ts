/**
 * Производственно-безопасный логгер
 * Автоматически удаляет console.log в production режиме
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  data?: any;
  timestamp: string;
  component?: string;
}

class Logger {
  public isDevelopment = process.env.NODE_ENV === 'development';
  private isEnabled = this.isDevelopment || process.env.ENABLE_LOGGING === 'true';

  private formatMessage(level: LogLevel, message: string, component?: string): string {
    const timestamp = new Date().toISOString();
    const prefix = component ? `[${component}]` : '';
    return `${timestamp} [${level.toUpperCase()}] ${prefix} ${message}`;
  }

  private shouldLog(level: LogLevel): boolean {
    if (!this.isEnabled) return false;
    
    // В продакшене логируем только warn и error
    if (!this.isDevelopment) {
      return level === 'warn' || level === 'error';
    }
    
    return true;
  }
  
  debug(message: string, data?: any, component?: string): void {
    if (this.shouldLog('debug')) {
      console.debug(this.formatMessage('debug', message, component), data || '');
    }
  }

  info(message: string, data?: any, component?: string): void {
    if (this.shouldLog('info')) {
      console.info(this.formatMessage('info', message, component), data || '');
    }
  }

  warn(message: string, data?: any, component?: string): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message, component), data || '');
    }
  }

  error(message: string, data?: any, component?: string): void {
    if (this.shouldLog('error')) {
      console.error(this.formatMessage('error', message, component), data || '');
    }
  }

  // Для совместимости с существующим кодом
  log(message: string, data?: any, component?: string): void {
    this.info(message, data, component);
  }
}

export const logger = new Logger();
export default logger;

// Функция для форматирования API запросов
export const logAPIRequest = (method: string, url: string, data?: any) => {
  if (logger.isDevelopment) {
    console.group(`🌐 API ${method.toUpperCase()} ${url}`);
    if (data) {
      console.log('Request Data:', data);
    }
    console.groupEnd();
  }
};

// Функция для логирования API ответов
export const logAPIResponse = (url: string, status: number, data?: any) => {
  if (logger.isDevelopment) {
    const statusEmoji = status >= 200 && status < 300 ? '✅' : '❌';
    console.group(`${statusEmoji} API Response ${status} ${url}`);
    if (data) {
      console.log('Response Data:', data);
    }
    console.groupEnd();
  }
};

// Функция для логирования ошибок с контекстом
export const logError = (error: Error, context?: string) => {
  const errorMessage = `❌ Error${context ? ` in ${context}` : ''}: ${error.message}`;
  logger.error(errorMessage);
  
  if (logger.isDevelopment) {
    console.error('Stack trace:', error.stack);
  }
};

// Функция для логирования производительности
export const logPerformance = (label: string, duration: number) => {
  if (logger.isDevelopment) {
    const emoji = duration < 100 ? '🚀' : duration < 500 ? '⚡' : '🐌';
    console.log(`${emoji} Performance ${label}: ${duration.toFixed(2)}ms`);
  }
};

// Утилита для замера времени выполнения
export const measureTime = <T>(label: string, fn: () => T): T => {
  const start = performance.now();
  const result = fn();
  const duration = performance.now() - start;
  logPerformance(label, duration);
  return result;
};

// Асинхронная версия замера времени
export const measureTimeAsync = async <T>(label: string, fn: () => Promise<T>): Promise<T> => {
  const start = performance.now();
  const result = await fn();
  const duration = performance.now() - start;
  logPerformance(label, duration);
  return result;
};