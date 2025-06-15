import { SyncResult } from '@/types/order';

class OrderSyncService {
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning = false;
  private lastSyncResult: SyncResult | null = null;

  // Интервал синхронизации (5 минут)
  private readonly SYNC_INTERVAL = 5 * 60 * 1000;

  constructor() {
    this.init();
  }

  private init() {
    // Запуск автоматической синхронизации только в продакшене
    if (process.env.NODE_ENV === 'production') {
      this.startAutoSync();
    }
  }

  // Запуск автоматической синхронизации
  startAutoSync() {
    if (this.intervalId) {
      console.log('Auto sync already running');
      return;
    }

    console.log('Starting auto sync for orders...');
    
    // Первая синхронизация сразу
    this.syncOrders();
    
    // Затем каждые 5 минут
    this.intervalId = setInterval(() => {
      this.syncOrders();
    }, this.SYNC_INTERVAL);
  }

  // Остановка автоматической синхронизации
  stopAutoSync() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('Auto sync stopped');
    }
  }

  // Синхронизация заказов
  async syncOrders(): Promise<SyncResult | null> {
    if (this.isRunning) {
      console.log('Sync already in progress, skipping...');
      return null;
    }

    this.isRunning = true;
    console.log('Starting orders sync...');

    try {
      const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3001'}/api/orders/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: SyncResult = await response.json();
      this.lastSyncResult = result;

      console.log('Orders sync completed:', {
        processed: result.ordersProcessed,
        created: result.ordersCreated,
        updated: result.ordersUpdated,
        errors: result.errors.length,
        duration: result.duration,
      });

      return result;
    } catch (error) {
      console.error('Error in auto sync:', error);
      return null;
    } finally {
      this.isRunning = false;
    }
  }

  // Получение статуса синхронизации
  getStatus() {
    return {
      isRunning: this.isRunning,
      isAutoSyncActive: !!this.intervalId,
      lastSyncResult: this.lastSyncResult,
      nextSyncIn: this.intervalId ? this.SYNC_INTERVAL : null,
    };
  }

  // Принудительная синхронизация
  async forcSync(): Promise<SyncResult | null> {
    return await this.syncOrders();
  }
}

// Создаем глобальный экземпляр сервиса
let orderSyncService: OrderSyncService | null = null;

// Получение экземпляра сервиса (Singleton)
export function getOrderSyncService(): OrderSyncService {
  if (!orderSyncService) {
    orderSyncService = new OrderSyncService();
  }
  return orderSyncService;
}

// Функция для запуска синхронизации в серверном контексте
export async function initOrderSync() {
  const service = getOrderSyncService();
  
  // В продакшене запускаем автоматическую синхронизацию
  if (process.env.NODE_ENV === 'production') {
    service.startAutoSync();
  }
  
  return service;
}

// Функция для остановки синхронизации
export function stopOrderSync() {
  if (orderSyncService) {
    orderSyncService.stopAutoSync();
  }
}

// Экспорт для использования в API routes
export { OrderSyncService }; 