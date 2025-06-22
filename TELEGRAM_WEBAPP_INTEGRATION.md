# Telegram WebApp Integration

## Описание

Добавлена интеграция с Telegram WebApp SDK для корзины. При оформлении заказа:

1. **Отправляется уведомление** в Telegram бот с данными заказа
2. **Закрывается WebApp** автоматически 
3. **Клиент получает уведомление** о заказе в чате с ботом

## Что было добавлено

### 1. Подключение SDK в layout

В `src/app/webapp/layout.tsx`:
- Добавлен `Script` компонент для загрузки Telegram WebApp SDK
- SDK загружается с стратегией `beforeInteractive`

### 2. Функционал в корзине

В `src/app/webapp/cart/page.tsx`:
- Добавлены типы для Telegram WebApp API
- Инициализация WebApp при загрузке страницы
- Обработка оформления заказа с отправкой данных в бот
- Автоматическое закрытие WebApp после оформления

## Как работает

### При оформлении заказа:

1. **Создается заказ** через существующий API `/api/webapp/orders`
2. **Отправляются данные в бот** через `window.Telegram.WebApp.sendData()`:
   ```json
   {
     "action": "order_placed",
     "order_id": 12345,
     "total": 2500,
     "items_count": 3,
     "delivery_address": "Москва, ул. Ленина, 10",
     "customer_name": "Иван Петров",
     "customer_phone": "+7900123456"
   }
   ```
3. **Закрывается WebApp** через `window.Telegram.WebApp.close()`

### Fallback для браузера:
- Если WebApp SDK недоступен, показывается обычный alert
- Происходит редирект на страницу заказов

## Настройка бота

Бот должен обрабатывать данные от WebApp в обработчике `web_app_data`:

```python
@bot.message_handler(content_types=['web_app_data'])
def handle_web_app_data(message):
    data = json.loads(message.web_app_data.data)
    
    if data['action'] == 'order_placed':
        # Отправить уведомление клиенту
        bot.send_message(
            message.chat.id,
            f"✅ Заказ #{data['order_id']} оформлен!\n"
            f"💰 Сумма: {data['total']} ₽\n"
            f"📦 Товаров: {data['items_count']}\n"
            f"📍 Адрес: {data['delivery_address']}\n"
            f"📞 Телефон: {data['customer_phone']}"
        )
```

## Тестирование

### В Telegram:
1. Открыть WebApp через кнопку в боте
2. Добавить товары в корзину  
3. Заполнить данные доставки
4. Нажать "Оформить заказ"
5. WebApp закроется, придет уведомление в чат

### В браузере:
1. Открыть `/webapp/cart`
2. Добавить товары и заполнить форму
3. При оформлении заказа - обычный alert и редирект

## Файлы изменены

- `src/app/webapp/layout.tsx` - подключение SDK
- `src/app/webapp/cart/page.tsx` - основной функционал
- `TELEGRAM_WEBAPP_INTEGRATION.md` - эта документация

## Совместимость

- ✅ Работает в Telegram WebApp
- ✅ Работает в обычном браузере (fallback)
- ✅ Не ломает существующий функционал
- ✅ Сохраняет текущий дизайн 