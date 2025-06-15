import { OrderSyncService } from './orderSync';

class AutoSyncService {
  private static instance: AutoSyncService;
  private syncInterval: NodeJS.Timeout | null = null;
  private lastLoginSync: Date | null = null;
  private lastHourlySync: Date | null = null;

  private constructor() {}

  static getInstance(): AutoSyncService {
    if (!AutoSyncService.instance) {
      AutoSyncService.instance = new AutoSyncService();
    }
    return AutoSyncService.instance;
  }

  // Синхронизация при входе в аккаунт (последние 10 дней)
  async syncOnLogin(): Promise<void> {
    try {
      console.log('🔄 Запуск синхронизации при входе в аккаунт (последние 10 дней)...');
      
      // Проверяем, была ли синхронизация в последние 30 минут
      if (this.lastLoginSync && Date.now() - this.lastLoginSync.getTime() < 30 * 60 * 1000) {
        console.log('⏭️ Синхронизация при входе пропущена (недавно выполнялась)');
        return;
      }

      const response = await fetch('/api/orders/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          syncType: 'login',
          days: 10
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Синхронизация при входе завершена:', result);
        this.lastLoginSync = new Date();
      } else {
        console.error('❌ Ошибка синхронизации при входе:', response.statusText);
      }
    } catch (error) {
      console.error('❌ Ошибка синхронизации при входе:', error);
    }
  }

  // Синхронизация каждый час (последний час)
  async syncHourly(): Promise<void> {
    try {
      console.log('🔄 Запуск почасовой синхронизации (последний час)...');

      const response = await fetch('/api/orders/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          syncType: 'hourly',
          hours: 1
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Почасовая синхронизация завершена:', result);
        this.lastHourlySync = new Date();
      } else {
        console.error('❌ Ошибка почасовой синхронизации:', response.statusText);
      }
    } catch (error) {
      console.error('❌ Ошибка почасовой синхронизации:', error);
    }
  }

  // Запуск автоматической синхронизации
  startAutoSync(): void {
    // Останавливаем предыдущий интервал, если есть
    this.stopAutoSync();

    // Запускаем синхронизацию при входе
    this.syncOnLogin();

    // Устанавливаем интервал для почасовой синхронизации
    this.syncInterval = setInterval(() => {
      this.syncHourly();
    }, 60 * 60 * 1000); // Каждый час

    console.log('🚀 Автоматическая синхронизация запущена');
  }

  // Остановка автоматической синхронизации
  stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      console.log('⏹️ Автоматическая синхронизация остановлена');
    }
  }

  // Получение статуса синхронизации
  getSyncStatus() {
    return {
      isRunning: this.syncInterval !== null,
      lastLoginSync: this.lastLoginSync,
      lastHourlySync: this.lastHourlySync,
      nextHourlySync: this.syncInterval ? new Date(Date.now() + 60 * 60 * 1000) : null
    };
  }
}

export const autoSyncService = AutoSyncService.getInstance(); 