// Вся синхронизация заказов с внешним API отключена
export function getOrderSyncService() {
  return {};
}

export async function initOrderSync() {
  return {};
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

// Функция для остановки синхронизации
export function stopOrderSync() {
  if (orderSyncService) {
    orderSyncService.stopAutoSync();
  }
}

// Экспорт для использования в API routes
export { OrderSyncService }; 