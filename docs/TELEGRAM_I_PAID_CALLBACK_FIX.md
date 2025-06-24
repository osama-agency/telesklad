# Исправление обработки callback "Я оплатил"

## Проблема

Клиент нажимал кнопку **"Я оплатил"**, но не получал уведомления:
1. ❌ Клиенту не приходило: "⏳ Идет проверка вашего перевода в нашей системе..."
2. ❌ Админу не приходило уведомление в @telesklad_bot с кнопкой "Оплата пришла"

## Причина проблемы

В логах было видно:
```
📲 Callback: i_paid from 125861752
📬 Added order_status_change notification job to queue
```

Но дальше обработки не было по **ДВУМ ПРИЧИНАМ**:

### 1. Отсутствовал обработчик в RedisQueueService
В **RedisQueueService** отсутствовал обработчик для типа `order_status_change`.

### 2. Redis Worker не запускался
Redis Worker находился в статусе `stopped`, хотя в логах было `🚀 Starting Redis Queue Worker`.

## Исправление

### 1. Добавлен обработчик в RedisQueueService

**Файл**: `src/lib/services/redis-queue.service.ts`

```typescript
// В методе handleNotificationJob добавлен новый case:
case 'order_status_change':
  await this.handleOrderStatusChange(data);
  break;

// Добавлен новый метод:
private static async handleOrderStatusChange(data: any): Promise<void> {
  try {
    const { order, previousStatus } = data;
    
    console.log(`📋 Processing order status change: ${order.id} (${previousStatus} -> ${order.status})`);
    
    // Импортируем ReportService динамически для избежания циклических зависимостей
    const { ReportService } = await import('./ReportService');
    
    // Вызываем ReportService.handleOrderStatusChange
    await ReportService.handleOrderStatusChange(order, previousStatus);
    
    console.log(`✅ Order status change processed for order ${order.id}`);
    
  } catch (error) {
    console.error('❌ Error handling order status change:', error);
    throw error;
  }
}
```

### 2. Исправлен запуск Redis Worker

**Команда для перезапуска Worker**:
```bash
curl -X POST http://localhost:3000/api/redis/status \
  -H "Content-Type: application/json" \
  -d '{"action": "restart_worker"}'
```

**Проверка статуса**:
```bash
curl http://localhost:3000/api/redis/status
```

Должен показать: `"worker": {"running": true, "status": "active"}`

## Теперь работает

После исправлений при нажатии **"Я оплатил"**:

1. ✅ Callback принимается: `📲 Callback: i_paid from 125861752`
2. ✅ Задача добавляется: `📬 Added order_status_change notification job to queue`  
3. ✅ Redis Worker обрабатывает: `📋 Processing order status change: 24524 (0 -> 1)`
4. ✅ ReportService отправляет уведомления:
   - Клиенту: "⏳ Идет проверка вашего перевода..."
   - Админу в @telesklad_bot: "Надо проверить оплату по заказу №24524" с кнопкой "Оплата пришла"

## Мониторинг

Проверить статус Redis Worker:
```bash
curl http://localhost:3000/api/redis/status
```

Ожидаемый результат:
```json
{
  "redis": {
    "available": true,
    "worker": {
      "running": true, 
      "status": "active"
    }
  },
  "queues": {
    "notifications": 0
  }
}
```

## Примечания

⚠️ **База данных**: В логах видны ошибки подключения к PostgreSQL `89.169.38.127:5433`. Если проблемы с БД продолжаются, ReportService может не работать корректно.

✅ **Разделение ролей**: @telesklad_bot используется только для курьера и админа, @strattera_test_bot - для клиентов.

## Последовательность работы

1. Клиент нажимает **"Я оплатил"** → `TelegramBotWorker.handleIPaid()`
2. Статус заказа меняется на `1` (paid) → `RedisQueueService.addNotificationJob('order_status_change')`
3. Redis Queue обрабатывает задачу → `handleOrderStatusChange()`
4. Вызывается `ReportService.onPaid()` → отправляются уведомления клиенту и админу

## Команды для тестирования

```bash
# 1. Перезапустить сервер
pkill -f "next dev" && PORT=3000 npm run dev

# 2. Протестировать в @strattera_test_bot:
#    - Создать заказ через WebApp
#    - Нажать "Я оплатил"
#    - Проверить уведомления

# 3. Проверить логи на наличие:
# "📋 Processing order status change"
# "✅ Order status change processed"
```

## Дата исправления

24 января 2025 