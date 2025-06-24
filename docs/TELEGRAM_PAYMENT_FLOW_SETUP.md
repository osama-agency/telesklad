# Настройка системы оплаты через Telegram

## Обзор системы

Система автоматической обработки платежей через Telegram состоит из:

1. **Тестовый бот** (@strattera_test_bot) - для клиентских уведомлений в development
2. **Основной бот** (@strattera_bot) - для админских уведомлений и production
3. **WebApp** - интерфейс для создания заказов
4. **Webhook система** - обработка callback'ов от кнопок

## Настройка webhook'ов

### 1. Основной бот (админ уведомления)

```bash
curl -X POST "https://api.telegram.org/bot7612206140:AAHA6sV7VZLyUu0Ua1DAoULiFYehAkAjJK4/setWebhook" \
-H "Content-Type: application/json" \
-d '{"url": "https://strattera.ngrok.app/api/telegram/webhook", "allowed_updates": ["message", "callback_query"]}'
```

### 2. Тестовый бот (клиент уведомления)

```bash
curl -X POST "https://api.telegram.org/bot7754514670:AAFswWZxch4OwaLcmQp7LMzr6E3AdJ5woPg/setWebhook" \
-H "Content-Type: application/json" \
-d '{"url": "https://strattera.ngrok.app/api/telegram/webapp-webhook", "allowed_updates": ["message", "callback_query"]}'
```

## Процесс оплаты

### 1. Создание заказа (WebApp → Backend)

```
POST /api/webapp/orders
{
  "items": [{"product_id": 20, "quantity": 1}],
  "delivery_address": "...",
  "user_data": {...}
}
```

**Что происходит:**
- Создается заказ со статусом 0 (unpaid)
- Автоматически выбирается банковская карта (ротация)
- Добавляется доставка 500₽
- Вызывается `ReportService.handleOrderStatusChange()`

### 2. Уведомление клиента (ReportService.onUnpaid)

**Отправляется через тестовый бот:**
```
🎉 Ваш заказ №24477 принят.

📌 Проверьте заказ перед оплатой:

Состав заказа:
• Atominex 18 mg — 1шт. — 5200₽
• Доставка — услуга — 500₽

Данные для доставки:
👤 Тест Тестов Иванович

🏠 199106, г Санкт-Петербург, ул Шевченко, дом 16, корп. 2, кв. 999

📞 +7 (999) 999-99-99

Сумма к оплате: 5700₽

✅ Дальнейшие действия:
1. Сделайте перевод:
ВНИМАНИЕ, ОПЛАЧИВАЙТЕ ИМЕННО НА
ВТБ БАНК
Гульнара С.
+79046092695.

2. Нажмите кнопку «Я оплатил», чтобы мы проверили поступление и отправили ваш заказ.

❗️ Если заметили ошибку — нажмите «Изменить заказ».
```

**Кнопки:**
- [Я оплатил] → callback_data: "i_paid"
- [Изменить заказ] → url: webapp
- [Задать вопрос] → url: support

### 3. Клиент нажимает "Я оплатил"

**Webhook:** `POST /api/telegram/webapp-webhook`
```json
{
  "callback_query": {
    "data": "i_paid",
    "from": {"id": 125861752},
    "message": {"text": "🎉 Ваш заказ №24477 принят..."}
  }
}
```

**Обработка:** `TelegramBotWorker.handleIPaid()`
- Парсит номер заказа из сообщения
- Обновляет статус на 1 (paid)
- Вызывает `ReportService.handleOrderStatusChange()`
- Отвечает клиенту: "Спасибо! Ожидайте подтверждения оплаты."

### 4. Уведомления при оплате (ReportService.onPaid)

**Клиенту (тестовый бот):**
```
⏳ Идет проверка вашего перевода в нашей системе.

Пожалуйста, ожидайте - как только мы подтвердим оплату, вы получите уведомление здесь.

Примерное время ожидания: от 5 до 30 минут.
```

**Админу (основной бот, ID: 125861752):**
```
Надо проверить оплату по заказу №24477

Итого отправил клиент: 5700₽

Банк: ВТБ БАНК — Гульнара С. — +79046092695

📄 Состав заказа:
• Atominex 18 mg — 1шт. — 5200₽,
• Доставка — услуга — 500₽

📍 Адрес:
199106, г Санкт-Петербург, ул Шевченко, дом 16, корп. 2, кв. 999

👤 ФИО:
Тест Тестов Иванович

📱 Телефон:
+7 (999) 999-99-99
```

**Кнопка админу:**
- [Оплата пришла] → callback_data: "approve_payment"

### 5. Админ подтверждает оплату

**Webhook:** `POST /api/telegram/webhook`
```json
{
  "callback_query": {
    "data": "approve_payment", 
    "from": {"id": 125861752},
    "message": {"text": "Надо проверить оплату по заказу №24477..."}
  }
}
```

**Обработка:** `TelegramBotWorker.handleApprovePayment()`
- Парсит номер заказа
- Обновляет статус на 2 (processing)
- Устанавливает `paid_at: new Date()`
- Удаляет сообщение из чата админа
- Вызывает `ReportService.handleOrderStatusChange()`

### 6. Уведомления при обработке (ReportService.onProcessing)

**Клиенту:**
```
❤️ Благодарим вас за покупку!

🚚 Заказ №24477 находится у курьера и готовится к отправке.

Как только посылка будет отправлена, мы незамедлительно вышлем вам трек-номер для отслеживания.

Процесс отправки занимает от 5 до 48 часов.

Будем признательны за ваше терпение!
```

**Курьеру (ID: courier):**
```
👀 Нужно отправить заказ №24477

📄 Состав заказа:
• Atominex 18 mg — 1шт. — 5200₽

📍 Адрес:
199106, г Санкт-Петербург, ул Шевченко, дом 16, корп. 2, кв. 999

📍 Индекс: 199106

👤 ФИО:
Тест Тестов Иванович

📱 Телефон:
+7 (999) 999-99-99

🌟━━━━━━━━━━━━🌟
```

**Кнопка курьеру:**
- [Привязать трек] → callback_data: "submit_tracking"

## Архитектура компонентов

### ReportService
**Файл:** `src/lib/services/ReportService.ts`

Основной сервис для обработки изменений статуса заказа:
- `onUnpaid()` - отправка реквизитов клиенту
- `onPaid()` - уведомления о необходимости проверки
- `onProcessing()` - уведомления о подтверждении оплаты
- `onShipped()` - отправка трек-номера
- `onCancelled()` - уведомление об отмене

### AdminTelegramService  
**Файл:** `src/lib/services/AdminTelegramService.ts`

Специальный сервис для отправки сообщений админу через основной бот:
- Использует токен: `7612206140:AAHA6sV7VZLyUu0Ua1DAoULiFYehAkAjJK4`
- Отправляет на ID: `125861752`
- Поддерживает inline клавиатуры
- Добавляет префикс "Development" в dev режиме

### TelegramService
**Файл:** `src/lib/services/TelegramService.ts`

Основной сервис для клиентских уведомлений:
- В development использует тестовый бот
- В production использует основной бот
- Поддерживает все типы кнопок и разметки

### TelegramBotWorker
**Файл:** `src/lib/services/TelegramBotWorker.ts`

Обработчик webhook'ов:
- `handleIPaid()` - обработка "Я оплатил"
- `handleApprovePayment()` - обработка "Оплата пришла"
- `handleSubmitTracking()` - запрос трек-номера
- `parseOrderNumber()` - парсинг номера заказа из сообщений

## Настройки базы данных

### Банковские карты
Система автоматически выбирает карту из `bank_cards` где `is_active = true`:
- Ротация по `updated_at` (самая старая первая)
- Обновление `updated_at` при выборе карты
- Формат: "Банк - ФИО - Телефон"

### Статусы заказов
```
-1 = creating (промежуточный)
0 = unpaid (ожидает оплаты)
1 = paid (оплачен, ждет подтверждения)
2 = processing (подтвержден, в обработке)
3 = shipped (отправлен)
4 = cancelled (отменен)
5 = refunded (возвращен)
```

## Команды для разработки

### Проверка webhook'ов
```bash
# Основной бот
curl "https://api.telegram.org/bot7612206140:AAHA6sV7VZLyUu0Ua1DAoULiFYehAkAjJK4/getWebhookInfo"

# Тестовый бот  
curl "https://api.telegram.org/bot7754514670:AAFswWZxch4OwaLcmQp7LMzr6E3AdJ5woPg/getWebhookInfo"
```

### Удаление webhook'ов
```bash
# Основной бот
curl -X POST "https://api.telegram.org/bot7612206140:AAHA6sV7VZLyUu0Ua1DAoULiFYehAkAjJK4/deleteWebhook"

# Тестовый бот
curl -X POST "https://api.telegram.org/bot7754514670:AAFswWZxch4OwaLcmQp7LMzr6E3AdJ5woPg/deleteWebhook"
```

### Тестирование системы
```bash
# Запуск сервера
PORT=3000 npm run dev

# Запуск ngrok
ngrok http --domain=strattera.ngrok.app 3000

# Настройка webhook'ов (выполнить команды выше)

# Открыть WebApp
open https://strattera.ngrok.app/webapp
```

## Мониторинг и отладка

### Логи сервера
- `📊 Order X status changed: Y -> Z` - изменение статуса
- `📤 TelegramService.call:` - отправка через тестовый бот
- `📤 AdminTelegramService.sendToAdmin:` - отправка админу
- `📲 Callback: i_paid from X` - обработка callback'а
- `✅ Message sent to X, ID: Y` - успешная отправка

### Проверка базы данных
```sql
-- Последние заказы
SELECT id, status, total_amount, deliverycost, created_at 
FROM orders 
ORDER BY created_at DESC 
LIMIT 10;

-- Активные банковские карты
SELECT id, name, fio, number, updated_at 
FROM bank_cards 
WHERE is_active = true 
ORDER BY updated_at ASC;
```

## Возможные проблемы

### 1. Callback не обрабатывается
- Проверить webhook: `getWebhookInfo`
- Убедиться что ngrok запущен
- Проверить логи сервера на ошибки

### 2. Сообщения не отправляются
- Проверить токены ботов в базе данных
- Убедиться что пользователь не заблокировал бота
- Проверить лимиты API Telegram

### 3. Неправильный парсинг заказа
- Проверить формат сообщения в `formatOrderItems`
- Убедиться что номер заказа присутствует в тексте
- Проверить регулярное выражение в `parseOrderNumber`

### 4. Дублирование уведомлений
- Проверить что webhook настроен только на один URL
- Убедиться что нет polling режима
- Проверить логику обновления статуса

## Планы развития

1. **Очереди уведомлений** - использование Redis для надежной доставки
2. **Шаблоны сообщений** - вынос текстов в базу данных
3. **Аналитика платежей** - отчеты по конверсии
4. **Автоматическая отмена** - отмена неоплаченных заказов через 72 часа
 