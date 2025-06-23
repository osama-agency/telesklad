# Единая система Telegram-ботов

## Обзор архитектуры

Система использует **webhook-подход** вместо polling для обработки сообщений от Telegram.

### Структура ботов

1. **Бот для закупок**: `7612206140:AAHA6sV7VZLyUu0Ua1DAoULiFYehAkAjJK4`
   - Группа закупщиков: `-4729817036`
   - Отправляет уведомления о новых закупках

2. **Основной бот для клиентов**: `7097447176:AAEcDyjXUEIjZ0-iNSE5BZMGjaiuyDQWiqg` (продакшен)
3. **Тестовый бот для клиентов**: `7754514670:AAFswWZxch4OwaLcmQp7LMzr6E3AdJ5woPg` (разработка)

4. **Курьер**: `821810448`

## Ключевые компоненты

### 1. TelegramService
**Файл**: `src/lib/services/TelegramService.ts`

Точная копия Rails TelegramService с поддержкой:
- MarkdownV2 экранирования
- Разбивки длинных сообщений
- Inline клавиатур
- Маппинга кнопок

```typescript
// Быстрая отправка сообщения
await TelegramService.call('Сообщение', 'chat_id', { markup: 'i_paid' });
```

### 2. TelegramBotWorker
**Файл**: `src/lib/services/TelegramBotWorker.ts`

Главный обработчик webhook'ов:
- Singleton паттерн
- Обработка callback'ов
- Кэширование состояний пользователей
- Парсинг команд и сообщений

```typescript
const worker = TelegramBotWorker.getInstance();
await worker.processWebhookUpdate(update);
```

### 3. TelegramBotService
**Файл**: `src/lib/services/TelegramBotService.ts`

Упрощенный сервис для закупок:
- Отправка в группу закупщиков
- Конвертация валют
- Уведомления об оплате

```typescript
await TelegramBotService.sendPurchaseToSupplier(purchase);
```

### 4. ReportService
**Файл**: `src/lib/services/report.service.ts`

Обработчик изменений статуса заказов:
- Автоматические уведомления
- Шаблоны сообщений
- Планирование отзывов

## Webhook конфигурация

### Настройка webhook

```bash
npm run telegram:webhook:setup
```

### Удаление webhook

```bash
npm run telegram:webhook:delete
```

### Информация о webhook

```bash
npm run telegram:webhook:info
```

## Переменные окружения

```env
# Основные токены (управляются через TelegramTokenService)
TELEGRAM_BOT_TOKEN=7754514670:AAFswWZxch4OwaLcmQp7LMzr6E3AdJ5woPg

# Webhook настройки
TELEGRAM_WEBHOOK_URL=https://strattera.ngrok.app/api/telegram/webhook
TELEGRAM_WEBHOOK_SECRET=your_secret_token

# ID пользователей
TELEGRAM_ADMIN_CHAT_ID=125861752
TELEGRAM_COURIER_ID=821810448
TELEGRAM_GROUP_CHAT_ID=-4729817036
```

## Обработка статусов заказов

### Статусы заказов

| Статус | Число | Описание |
|--------|-------|----------|
| unpaid | 0 | Создан, ожидает оплаты |
| paid | 1 | Клиент оплатил |
| processing | 2 | Оплата подтверждена |
| shipped | 3 | Отправлен с трек-номером |
| delivered | 4 | Доставлен |
| cancelled | 5 | Отменен |
| refunded | 6 | Возврат средств |
| overdue | 7 | Просрочен |

### Поток сообщений

#### 1. UNPAID (0) - Заказ создан
- **Клиенту**: Детали заказа + кнопка "Я оплатил"
- **Шаблон**: `unpaid_msg` + `unpaid_main`

#### 2. PAID (1) - Клиент нажал "Я оплатил"
- **Клиенту**: "Идет проверка оплаты"
- **Админу**: Запрос подтверждения + кнопка "Подтвердить оплату"

#### 3. PROCESSING (2) - Оплата подтверждена
- **Клиенту**: "Заказ в обработке"
- **Курьеру**: Задание на отправку + кнопка "Привязать трек-номер"

#### 4. SHIPPED (3) - Заказ отправлен
- **Клиенту**: Трек-номер
- **Курьеру**: Подтверждение отправки

#### 5. CANCELLED (5) - Заказ отменен
- **Клиенту**: Уведомление об отмене

## API интеграция

### Обновление статуса заказа

```typescript
// PUT /api/orders/[id]/status
{
  "status": "paid" // или число 1
}
```

### Webhook обработчик

```typescript
// POST /api/telegram/webhook
// Автоматически обрабатывает все обновления от Telegram
```

## Callback кнопки

### Основные callback'ы

- `i_paid` - Клиент оплатил
- `approve_payment` - Админ подтвердил оплату
- `submit_tracking` - Курьер отправляет трек-номер

### Динамические callback'ы

- `order_paid_{id}` - Оплата заказа
- `order_approve_{id}` - Подтверждение оплаты
- `order_cancel_{id}` - Отмена заказа
- `order_track_{id}` - Привязка трек-номера

## Состояния пользователей

Система кэширует состояния в памяти:

```typescript
// Ожидание трек-номера от курьера
userStates.set(`user_${chatId}_state`, {
  order_id: BigInt(orderId),
  msg_id: messageId,
  h_msg: helpMessageId,
  timestamp: Date.now()
});
```

## Безопасность

- Проверка секретного токена webhook
- Валидация прав доступа для callback'ов
- Rate limiting (планируется)

## Мониторинг

- Логирование всех операций
- Обработка ошибок отправки
- Уведомления админа об ошибках

## Развертывание

1. Настроить переменные окружения
2. Запустить приложение
3. Настроить webhook: `npm run telegram:webhook:setup`
4. Проверить статус: `npm run telegram:webhook:info`

## Отладка

### Проверка webhook

```bash
curl -X GET https://strattera.ngrok.app/api/telegram/webhook
```

### Логи в разработке

```bash
# В режиме разработки все сообщения логируются
NODE_ENV=development npm run dev
```

### Тестирование статусов

```bash
curl -X PUT https://strattera.ngrok.app/api/orders/123/status \
  -H "Content-Type: application/json" \
  -d '{"status": "paid"}'
```

## Планы развития

- [ ] Redis для кэширования состояний
- [ ] Очереди задач для уведомлений
- [ ] Метрики и мониторинг
- [ ] Rate limiting
- [ ] Автоматические тесты