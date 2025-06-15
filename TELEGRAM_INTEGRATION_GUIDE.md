# 📱 Telegram интеграция для закупок - Telesklad

## 🎯 Описание системы

Полнофункциональная система Telegram интеграции для управления закупками, позволяющая:

1. **Администратору** отправлять закупки закупщику в Telegram
2. **Закупщику** редактировать количество товаров через WebApp  
3. **Закупщику** менять статус на "Готово к оплате"
4. **Администратору** получать уведомления и менять статус на "Оплачено"
5. **Закупщику** получать подтверждение и менять статус на "Передано в карго"

## ⚙️ Настройка

### 1. Переменные окружения
Добавьте в `.env` файл:

```bash
# Telegram Bot Token (получить у @BotFather)
TELEGRAM_BOT_TOKEN="your_bot_token_here"

# Chat ID закупщика (пока не используется - тестовый режим)
# TELEGRAM_SUPPLIER_CHAT_ID="7828956680"

# Chat ID администратора (все сообщения отправляются сюда для тестирования)
TELEGRAM_ADMIN_CHAT_ID="125861752"
```

### 2. Настройка бота в Telegram

1. Создайте бота через [@BotFather](https://t.me/botfather)
2. Сохраните токен в переменную `TELEGRAM_BOT_TOKEN`
3. Настройте WebApp URL:
   ```
   /setmenubutton
   /mybot
   Редактировать закупку - https://ваш-домен.com/telegram-webapp/purchase-editor.html
   ```

### 3. Настройка webhook (для production)

```bash
# Установка webhook
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://ваш-домен.com/api/telegram/webhook"}'

# Проверка webhook
curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo"
```

## 🔄 Workflow процесса

### 🧪 ТЕСТОВЫЙ РЕЖИМ
**Все сообщения отправляются администратору (ID: 125861752) для тестирования**

### Этап 1: Отправка закупки
```
Администратор → Страница закупок → Кнопка "Telegram" → Администратор получает сообщение (тест)
```

### Этап 2: Редактирование закупки
```
Администратор → Кнопка "Редактировать" → WebApp → Изменение количества → "Товар собран"
```

### Этап 3: Оплата
```
Администратор → Уведомление "Готово к оплате" → Оплата → Кнопка "Оплатил" 
```

### Этап 4: Передача в карго
```
Администратор → Уведомление "Заказ оплачен" → Кнопка "Передали в Карго"
```

## 🛠️ API Endpoints

### Отправка закупки в Telegram
```http
POST /api/purchases/{id}/send-telegram
```

### Обновление статуса закупки
```http
PUT /api/purchases/{id}/status
Content-Type: application/json

{
  "status": "ready_for_payment",
  "telegramMessageId": 123
}
```

### Telegram Webhook
```http
POST /api/telegram/webhook
```

## 📱 Telegram WebApp

WebApp доступен по адресу: `/telegram-webapp/purchase-editor.html`

### Параметры URL:
- `purchaseId` - ID закупки
- `messageId` - ID сообщения в Telegram (для обновления)

### Функции WebApp:
- ✅ Загрузка данных закупки
- ✅ Редактирование количества товаров  
- ✅ Отображение цен в турецких лирах
- ✅ Автоматический пересчет общей суммы
- ✅ Темный дизайн в стиле Telesklad
- ✅ Адаптивная верстка для мобильных устройств
- ✅ Интеграция с Telegram WebApp API

## 📋 Статусы закупок

| Статус | Описание | Кто может изменить |
|--------|----------|-------------------|
| `draft` | Черновик | Администратор |
| `sent_to_supplier` | Отправлено закупщику | Система |
| `in_progress` | В работе | Закупщик |
| `ready_for_payment` | Готово к оплате | Закупщик |
| `paid` | Оплачено | Администратор |
| `shipped_to_cargo` | Передано в карго | Закупщик |
| `cancelled` | Отменено | Любой |

## 🗃️ База данных

### Таблица `purchases`
Добавлено поле:
- `telegramMessageId` (INT, nullable) - ID сообщения в Telegram

### Миграция
```bash
npx prisma migrate dev --name add_telegram_message_id_to_purchases
```

## 🧪 Тестирование

### 1. Проверка API
```bash
# Проверка webhook
curl https://ваш-домен.com/api/telegram/webhook

# Тест отправки закупки
curl -X POST https://ваш-домен.com/api/purchases/1/send-telegram \
  -H "Authorization: Bearer your_token"
```

### 2. Проверка WebApp
Откройте в браузере:
```
https://ваш-домен.com/telegram-webapp/purchase-editor.html?purchaseId=1&messageId=123
```

## 📝 Логи и отладка

### Полезные логи:
- `console.log` в WebApp (DevTools браузера)
- Server logs в Next.js консоли
- Telegram API ошибки в `/api/telegram/webhook`

### Типичные ошибки:
1. **"Bot token is invalid"** - проверьте `TELEGRAM_BOT_TOKEN`
2. **"Chat not found"** - проверьте Chat ID и убедитесь что бот добавлен в чат
3. **"WebApp not found"** - проверьте URL WebApp в настройках бота
4. **"Failed to update message"** - проверьте права бота на редактирование сообщений

## 🔐 Безопасность

- ✅ Проверка авторизации в API endpoints
- ✅ Валидация данных перед отправкой в Telegram
- ✅ Защита от XSS в WebApp
- ✅ CSRF защита через Next.js
- ✅ Rate limiting для API вызовов

## 🚀 Развертывание

### Development:
```bash
npm run dev
```

### Production:
```bash
npm run build
npm run start
```

### Docker:
```bash
docker-compose up -d
```

## 📞 Поддержка

При возникновении проблем:
1. Проверьте логи в консоли разработчика
2. Убедитесь что все переменные окружения настроены
3. Проверьте статус Telegram API
4. Обратитесь к документации Telegram Bot API

---

## 🔄 Переключение в production режим

Когда тестирование завершено, для переключения на реального закупщика:

1. **Обновите TelegramBotService:**
```typescript
// В src/lib/services/telegram-bot.service.ts
private static readonly SUPPLIER_CHAT_ID = process.env.TELEGRAM_SUPPLIER_CHAT_ID || '7828956680'; // Реальный закупщик
```

2. **Обновите переменные окружения:**
```bash
TELEGRAM_SUPPLIER_CHAT_ID="7828956680"  # Раскомментировать
```

3. **Уберите тестовые метки:**
```typescript
// Удалить testTag из formatPurchase()
const testTag = '🧪 <i>(ТЕСТОВЫЙ РЕЖИМ)</i>';
```

## 📋 Checklist готовности к production

- [ ] Настроен `TELEGRAM_BOT_TOKEN`
- [ ] Настроены Chat ID (`TELEGRAM_SUPPLIER_CHAT_ID`, `TELEGRAM_ADMIN_CHAT_ID`)
- [ ] Webhook настроен и работает
- [ ] WebApp доступен по HTTPS
- [ ] База данных обновлена (поле `telegramMessageId`)
- [ ] Протестирован полный workflow в тестовом режиме
- [ ] Переключено на production режим (реальный закупщик)
- [ ] Настроен мониторинг логов 