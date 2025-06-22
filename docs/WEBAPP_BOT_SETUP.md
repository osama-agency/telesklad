# 🤖 Настройка Webapp Telegram Bot

Полная интеграция второго бота для webapp с уведомлениями клиентов и курьеров.
**ВАЖНО**: Все тексты сообщений теперь хранятся в базе данных (как в старом Rails проекте).

## 📋 **Обзор системы**

### **Два бота:**
- **Бот #1**: Закупки (уже существует) - `telegram-bot.service.ts`
- **Бот #2**: Webapp + клиенты + курьеры - `webapp-telegram-bot.service.ts`

### **Токен webapp бота:**
```
7754514670:AAFswWZxch4OwaLcmQp7LMzr6E3AdJ5woPg
```

### **🔥 НОВАЯ СИСТЕМА ШАБЛОНОВ:**
- Все тексты сообщений хранятся в таблице `settings` (как в Rails)
- Шаблоны используют плейсхолдеры `%{param}` (точно как Rails I18n)
- Поддержка кэширования для быстродействия
- API для управления шаблонами

---

## 🗄️ **Система шаблонов сообщений**

### **Инициализация шаблонов:**
```bash
curl -X POST http://localhost:3009/api/telegram/message-templates \
-H "Content-Type: application/json" \
-d '{"action": "init_defaults", "key": "dummy", "template": "dummy"}'
```

### **Просмотр всех шаблонов:**
```bash
curl http://localhost:3009/api/telegram/message-templates
```

### **Доступные шаблоны:**
- `unpaid_msg` - Заголовок для нового заказа
- `unpaid_main` - Детали нового заказа
- `paid_client` - Уведомление клиенту о проверке оплаты
- `paid_admin` - Уведомление админу о необходимости проверки
- `on_processing_client` - Клиенту об обработке заказа
- `on_processing_courier` - Курьеру о новом заказе
- `on_shipped_courier` - Клиенту с трек-номером
- `track_num_save` - Курьеру подтверждение трек-номера
- `cancel` - Клиенту об отмене заказа
- `unpaid_reminder_one` - Первое напоминание об оплате
- `unpaid_reminder_two` - Второе напоминание об оплате
- `unpaid_reminder_overdue` - Уведомление о просрочке
- `review` - Запрос отзыва
- `review_mirena` - Специальный запрос отзыва для Mirena
- `set_track_num` - Запрос трек-номера у курьера
- `error_data` - Ошибка данных
- `approved_pay` - Подтверждение платежа

### **Параметры для шаблонов:**
```typescript
{
  order: number,           // Номер заказа
  price: number,           // Сумма
  items: string,           // Список товаров
  fio: string,             // ФИО клиента
  address: string,         // Адрес доставки
  postal_code: string,     // Почтовый индекс
  phone: string,           // Телефон
  card: string,            // Банковская карта
  track: string,           // Трек-номер
  product: string          // Название товара
}
```

---

## 🔧 **Настройка Webhook**

### 1. **Установить webhook для webapp бота:**

```bash
curl -X POST "https://api.telegram.org/bot7754514670:AAFswWZxch4OwaLcmQp7LMzr6E3AdJ5woPg/setWebhook" \
-H "Content-Type: application/json" \
-d '{
  "url": "https://yourdomain.com/api/telegram/webapp-webhook",
  "allowed_updates": ["message", "callback_query"]
}'
```

### 2. **Проверить webhook:**

```bash
curl "https://api.telegram.org/bot7754514670:AAFswWZxch4OwaLcmQp7LMzr6E3AdJ5woPg/getWebhookInfo"
```

---

## 🏗️ **Архитектура файлов**

### **Новые файлы:**

```
src/lib/services/webapp-telegram-bot.service.ts           # Сервис webapp бота
src/lib/services/telegram-message-templates.service.ts   # Сервис шаблонов ⭐ НОВОЕ
src/app/api/telegram/webapp-webhook/route.ts             # Webhook для webapp бота
src/app/api/webapp/orders/[id]/status/route.ts           # API обновления статуса
src/app/api/webapp/orders/[id]/tracking/route.ts         # API добавления трек-номера
src/app/api/telegram/webapp-bot/info/route.ts            # Тестирование бота
src/app/api/telegram/message-templates/route.ts          # API для шаблонов ⭐ НОВОЕ
```

### **Измененные файлы:**

```
src/app/api/webapp/orders/route.ts                       # Интеграция уведомлений
```

---

## 🔄 **Workflow заказов**

### **1. 🎉 UNPAID - Создание заказа**
```
Клиент оформляет заказ → API создает заказ → Webapp Bot отправляет уведомление клиенту
```

**Шаблоны:**
- `unpaid_msg`: "🎉 Ваш заказ №%{order} принят."
- `unpaid_main`: Полные детали заказа с реквизитами

**Кнопки:** "Я оплатил", "📝 Изменить заказ", "❓ Задать вопрос"

### **2. 💳 PAID - Клиент сообщает об оплате**
```
Клиент нажимает "Я оплатил" → Webapp Bot уведомляет админа о проверке
```

**Шаблоны:**
- `paid_client`: "⏳ Идет проверка вашего перевода..."
- `paid_admin`: "Надо проверить оплату по заказу №%{order}..."

### **3. ✅ PROCESSING - Админ подтверждает оплату**
```
Админ нажимает "Оплата пришла" → Webapp Bot уведомляет клиента и курьера
```

**Шаблоны:**
- `on_processing_client`: "❤️ Благодарим вас за покупку!..."
- `on_processing_courier`: "👀 Нужно отправить заказ №%{order}..."

### **4. 📦 SHIPPED - Курьер добавляет трек-номер**
```
Курьер нажимает "Привязать трек-номер" → Вводит трек → Webapp Bot уведомляет клиента
```

**Шаблоны:**
- `on_shipped_courier`: "✅ Заказ №%{order}... Ваш трек-номер: %{track}..."
- `track_num_save`: "✅ Готово! Трек-номер отправлен клиенту..."

### **5. ❌ CANCELLED - Отмена заказа**
```
Админ отменяет заказ → Webapp Bot уведомляет клиента
```

**Шаблон:**
- `cancel`: "❌ Ваш заказ №%{order} отменён..."

### **6. ⏰ НАПОМИНАНИЯ ОБ ОПЛАТЕ**
```
3 часа → Первое напоминание → 6 часов → Второе напоминание → 24 часа → Отмена
```

**Шаблоны:**
- `unpaid_reminder_one`: "⏰ Напоминаем об оплате заказа №%{order}..."
- `unpaid_reminder_two`: "⚠️ Ваш заказ №%{order} может быть отменён..."
- `unpaid_reminder_overdue`: "❌ Ваш заказ №%{order} отменён..."

### **7. 📝 ЗАПРОС ОТЗЫВОВ (через 10 дней)**
```
10 дней после доставки → Автоматический запрос отзыва
```

**Шаблоны:**
- `review`: "Здравствуйте! Все ли прошло хорошо с доставкой %{product}?..."
- `review_mirena`: Специальный шаблон для товара Mirena

---

## 🎯 **API Endpoints**

### **Webhook:**
```
POST /api/telegram/webapp-webhook
```

### **Управление заказами:**
```
PUT /api/webapp/orders/{id}/status
PUT /api/webapp/orders/{id}/tracking
```

### **Управление шаблонами:** ⭐ НОВОЕ
```
GET /api/telegram/message-templates          # Получить все шаблоны
POST /api/telegram/message-templates         # Создать/обновить шаблон
DELETE /api/telegram/message-templates       # Очистить кэш
```

### **Тестирование бота:**
```
GET /api/telegram/webapp-bot/info
POST /api/telegram/webapp-bot/info
```

---

## 🔐 **Переменные окружения**

```env
# Webapp Bot Configuration
WEBAPP_ADMIN_CHAT_ID=125861752
WEBAPP_COURIER_CHAT_ID=7828956680
WEBAPP_GROUP_CHAT_ID=-4729817036

# Bot Settings
WEBAPP_BOT_USERNAME=strattera_test_bot
BANK_CARD_DETAILS=1234 5678 9012 3456
```

---

## 🧪 **Тестирование**

### **1. Проверить бота:**
```bash
curl http://localhost:3009/api/telegram/webapp-bot/info
```

### **2. Инициализировать шаблоны:**
```bash
curl -X POST http://localhost:3009/api/telegram/message-templates \
-H "Content-Type: application/json" \
-d '{"action": "init_defaults", "key": "dummy", "template": "dummy"}'
```

### **3. Просмотреть шаблоны:**
```bash
curl http://localhost:3009/api/telegram/message-templates
```

### **4. Отправить тестовое сообщение:**
```bash
curl -X POST http://localhost:3009/api/telegram/webapp-bot/info \
-H "Content-Type: application/json" \
-d '{"test_user_id": "125861752", "message": "Тест!"}'
```

### **5. Тестировать статусы заказов:**
```bash
# Клиент нажал "Я оплатил"
curl -X PUT http://localhost:3009/api/webapp/orders/1/status \
-H "Content-Type: application/json" \
-d '{"status": "paid"}'

# Админ подтвердил оплату
curl -X PUT http://localhost:3009/api/webapp/orders/1/status \
-H "Content-Type: application/json" \
-d '{"status": "processing"}'

# Добавить трек-номер
curl -X PUT http://localhost:3009/api/webapp/orders/1/tracking \
-H "Content-Type: application/json" \
-d '{"tracking_number": "ABC123456789"}'
```

---

## 📝 **Редактирование шаблонов**

### **Обновить шаблон:**
```bash
curl -X POST http://localhost:3009/api/telegram/message-templates \
-H "Content-Type: application/json" \
-d '{
  "key": "unpaid_msg",
  "template": "🎉 Новый текст для заказа №%{order}!",
  "description": "Обновленное сообщение о заказе"
}'
```

### **Очистить кэш после изменений:**
```bash
curl -X DELETE http://localhost:3009/api/telegram/message-templates
```

---

## 🎨 **Настройка UI**

### **Кнопки для webapp:**
- **Web App кнопки**: Открывают webapp напрямую
- **Callback кнопки**: Обрабатываются через webhook
- **URL кнопки**: Ссылки на поддержку

### **Форматирование сообщений:**
- **HTML разметка** для большинства сообщений
- **Markdown** для курьерских сообщений (поддержка `code` блоков)
- **Эмодзи** для лучшего UX
- **Плейсхолдеры %{param}** точно как в Rails

---

## 🔍 **Логирование**

Все действия логируются с префиксами:
- `📨 [WEBAPP BOT]` - Входящие webhook'и
- `📤 [WEBAPP BOT]` - Исходящие сообщения  
- `🔄 [WEBAPP BOT]` - Обработка callback'ов
- `✅ [WEBAPP BOT]` - Успешные операции
- `❌ [WEBAPP BOT]` - Ошибки
- `📝 [TEMPLATES]` - Работа с шаблонами

---

## 🚀 **Следующие шаги**

1. **Настроить webhook** для вашего домена
2. **Инициализировать шаблоны** через API
3. **Добавить переменные окружения**
4. **Протестировать все статусы заказов**
5. **Настроить права доступа** (админ, курьер)
6. **Настроить напоминания и отзывы** (cron jobs)
7. **Добавить админку для редактирования шаблонов**

---

## 🔗 **Совместимость с Rails**

✅ **100% идентичные шаблоны** с оригинальным Rails проектом
✅ **Та же система плейсхолдеров** `%{param}`
✅ **Аналогичная логика напоминаний** и жизненного цикла заказов
✅ **Хранение в базе данных** вместо файлов локализации
✅ **Кэширование** для производительности
✅ **API для управления** шаблонами

---

## 📞 **Поддержка**

При возникновении проблем проверьте:
1. Webhook настроен корректно
2. Шаблоны инициализированы в базе данных
3. Переменные окружения заданы
4. У пользователей есть `tg_id` в базе данных
5. Логи для диагностики ошибок 