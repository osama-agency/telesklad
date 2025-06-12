# Telegram WebApp для редактирования заказов

## Обзор

Создан полнофункциональный Telegram WebApp, который позволяет поставщикам редактировать заказы прямо из сообщений Telegram.

## Как это работает

1. **Создание заказа** → Отправляется уведомление в Telegram с кнопкой "✏️ Редактировать заказ"
2. **Нажатие кнопки** → Открывается WebApp с интерфейсом редактирования
3. **Редактирование** → Поставщик может изменить количество, цены, статус
4. **Сохранение** → Данные отправляются на backend, сообщение в Telegram обновляется

## Файлы

### Frontend (WebApp)
- `telegram-webapp/edit-order.html` - Интерфейс редактирования заказа
- `telegram-webapp/index.html` - Простой интерфейс изменения статуса
- `telegram-webapp/server.js` - Локальный сервер для тестирования

### Backend API
- `backend/src/controllers/purchaseController.ts` - Контроллер с новым endpoint `updatePurchaseItems`
- `backend/src/routes/purchaseRoutes.ts` - Маршрут `PUT /api/purchases/:id/items`
- `backend/src/services/telegramBot.ts` - Обновленная логика кнопок

## API Endpoints

### PUT /api/purchases/:id/items
Обновляет товары в заказе и пересчитывает общую сумму.

**Запрос:**
```json
{
  "items": [
    {
      "id": "item_id",
      "quantity": 10,
      "price": 500.00,
      "total": 5000.00
    }
  ],
  "totalCost": 15000.00
}
```

**Ответ:**
```json
{
  "success": true,
  "data": { /* обновленный заказ */ }
}
```

### PATCH /api/purchases/:id/status
Обновляет статус заказа (существующий endpoint, расширен для WebApp).

**Запрос:**
```json
{
  "status": "confirmed",
  "source": "telegram_webapp",
  "messageId": "123",
  "chatId": "-4729817036"
}
```

## WebApp URL параметры

```
/edit-order.html?orderId=xxx&currentStatus=pending&sequenceId=1&messageId=123&chatId=-4729817036&backendUrl=https://dsgrating.ru
```

- `orderId` - ID заказа в базе данных
- `currentStatus` - Текущий статус заказа
- `sequenceId` - Номер заказа для отображения
- `messageId` - ID сообщения в Telegram (для обновления)
- `chatId` - ID чата в Telegram
- `backendUrl` - URL backend API

## Функциональность WebApp

### Редактирование товаров
- ✅ Изменение количества (кнопки +/- или ввод)
- ✅ Изменение цены за единицу
- ✅ Автоматический пересчет суммы по товару
- ✅ Автоматический пересчет общей суммы заказа

### Изменение статуса
- ✅ Выпадающий список со всеми статусами
- ✅ Валидация доступных переходов
- ✅ Быстрые кнопки для критических действий

### UX/UI
- ✅ Современный дизайн с Telegram-темами
- ✅ Адаптивная верстка для мобильных устройств
- ✅ Индикаторы загрузки и ошибок
- ✅ Автоматическое закрытие после сохранения

## Telegram Bot интеграция

### Кнопки в сообщениях
- **"✏️ Редактировать заказ"** - Открывает WebApp для полного редактирования
- **Быстрые действия** - Кнопки для критических переходов статуса:
  - Pending: "✅ Подтвердить", "❌ Отменить"
  - Ready for payment: "💳 Оплачено"
  - Delivering: "📦 Получено"

### Обновление сообщений
После сохранения изменений в WebApp:
1. Backend получает данные
2. Обновляет заказ в базе данных
3. Вызывает `editMessageText` для обновления сообщения в Telegram
4. Сообщение показывает новые количества, цены и статус

## Переменные окружения

```env
# WebApp URLs
WEBAPP_URL="https://dsgrating.ru/telegram-webapp"
BACKEND_URL="https://dsgrating.ru"

# Для локальной разработки
# WEBAPP_URL="http://localhost:3001"
# BACKEND_URL="http://localhost:3011"
```

## Локальное тестирование

1. Запустить backend:
```bash
cd backend && npm run dev
```

2. Запустить WebApp сервер:
```bash
cd telegram-webapp && node server.js
```

3. Создать тестовый заказ:
```bash
curl -X POST http://localhost:3011/api/purchases \
  -H "Content-Type: application/json" \
  -d '{"totalCost": 15000, "items": [...]}'
```

4. Открыть WebApp:
```
http://localhost:3001/edit-order.html?orderId=xxx&currentStatus=pending&...
```

## Деплой на VPS

1. Файлы WebApp копируются в `/opt/telesite/telegram-webapp/`
2. Nginx проксирует запросы к WebApp
3. Backend API доступен через `https://dsgrating.ru/api/`
4. WebApp доступен через `https://dsgrating.ru/telegram-webapp/`

## Безопасность

- ✅ Валидация всех входных данных
- ✅ Проверка существования заказа перед редактированием
- ✅ Транзакции для атомарного обновления товаров
- ✅ Обработка ошибок и откат изменений
- ✅ CORS настроен для домена

## Мониторинг

Все действия логируются:
- Создание заказов
- Изменения через WebApp
- Обновления сообщений в Telegram
- Ошибки API и Telegram

## Будущие улучшения

- [ ] Добавление/удаление товаров в заказе
- [ ] Загрузка фото товаров
- [ ] Комментарии к изменениям
- [ ] История изменений заказа
- [ ] Уведомления о критических изменениях
- [ ] Интеграция с системой складского учета 
