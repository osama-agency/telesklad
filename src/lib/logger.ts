/**
 * Производственно-безопасный логгер
 * Автоматически удаляет console.log в production режиме
 */

const isDevelopment = process.env.NODE_ENV === 'development';

// Типы для консольных методов
type ConsoleMethod = 'log' | 'warn' | 'error' | 'info' | 'debug';

// Безопасный логгер - убирает логи в production
export const logger = {
  log: (...args: any[]) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },
  
  warn: (...args: any[]) => {
    // Предупреждения показываем всегда
    console.warn(...args);
  },
  
  error: (...args: any[]) => {
    // Ошибки показываем всегда
    console.error(...args);
  },
  
  info: (...args: any[]) => {
    if (isDevelopment) {
      console.info(...args);
    }
  },
  
  debug: (...args: any[]) => {
    if (isDevelopment) {
      console.debug(...args);
    }
  },
  
  // Групповые логи
  group: (...args: any[]) => {
    if (isDevelopment) {
      console.group(...args);
    }
  },
  
  groupEnd: () => {
    if (isDevelopment) {
      console.groupEnd();
    }
  },
  
  // Таблицы
  table: (data: any) => {
    if (isDevelopment) {
      console.table(data);
    }
  },
  
  // Трассировка
  trace: (...args: any[]) => {
    if (isDevelopment) {
      console.trace(...args);
    }
  }
};

// Функция для форматирования API запросов
export const logAPIRequest = (method: string, url: string, data?: any) => {
  if (isDevelopment) {
    console.group(`🌐 API ${method.toUpperCase()} ${url}`);
    if (data) {
      console.log('Request Data:', data);
    }
    console.groupEnd();
  }
};

// Функция для логирования API ответов
export const logAPIResponse = (url: string, status: number, data?: any) => {
  if (isDevelopment) {
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
  console.error(errorMessage);
  
  if (isDevelopment) {
    console.error('Stack trace:', error.stack);
  }
};

// Функция для логирования производительности
export const logPerformance = (label: string, duration: number) => {
  if (isDevelopment) {
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

// Экспорт по умолчанию для совместимости
export default logger; 