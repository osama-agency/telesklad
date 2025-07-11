# Исправления в истории заказов Telegram WebApp

## 🔍 Проблемы, которые были исправлены

### 1. **Проблема с ценами товаров**
- **Симптом**: В истории заказов показывалось "0₽" вместо реальных цен товаров
- **Причина**: API не рассчитывал `total` для каждого товара (quantity × price)
- **Решение**: Добавлен расчет `total = price * quantity` для каждого товара в API

### 2. **Проблема со статусами заказов**
- **Симптом**: Показывался статус "Неизвестно" вместо правильного статуса
- **Причина**: API возвращал числовой статус без преобразования в строковый формат
- **Решение**: 
  - Добавлено преобразование числовых статусов в строковые
  - Исправлен текст статуса: "Не оплачен" → "Ожидает оплаты"

### 3. **Проблема с изображениями товаров**
- **Симптом**: Изображения не загружались в избранном, подписках и истории заказов
- **Причина**: API не загружал изображения из `active_storage_attachments`
- **Решение**: Добавлена загрузка изображений из S3 во все API endpoints

## ✅ Результат исправлений

### Статусы заказов:
- `0` → "Ожидает оплаты" (оранжевый)
- `1` → "Оплачен" (синий)
- `2` → "Обрабатывается" (фиолетовый)
- `3` → "Отправлен" (зеленый)
- `4` → "Доставлен" (зеленый)
- `5` → "Отменен" (красный)

### Цены товаров:
- Корректно рассчитывается `total = price × quantity`
- Отображается цена за единицу и общая стоимость
- Правильно форматируется в рублях

### Изображения товаров:
- Загружаются из S3 через `active_storage_attachments`
- Отображаются во всех разделах WebApp
- Fallback на `image_url` из базы данных

## 🔧 Измененные файлы

1. **`src/app/api/webapp/orders/route.ts`**
   - Добавлен расчет цен товаров
   - Добавлено преобразование статусов
   - Добавлена загрузка изображений из S3

2. **`src/app/api/webapp/favorites/route.ts`**
   - Добавлена загрузка изображений из S3

3. **`src/app/api/webapp/subscriptions/route.ts`**
   - Добавлена загрузка изображений из S3

4. **`src/app/webapp/orders/page.tsx`**
   - Обновлен текст статуса "Ожидает оплаты"

## 🧪 Тестирование

Создан тестовый заказ #24465 для проверки:
```json
{
  "id": 24465,
  "status": "unpaid",
  "status_label": "Ожидает оплаты",
  "total_amount": 3600,
  "items": [{
    "name": "Arislow 2 mg",
    "price": 3600,
    "quantity": 1,
    "total": 3600
  }]
}
```

Все исправления работают корректно! 🎉 