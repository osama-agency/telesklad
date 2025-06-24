# Исправление загрузки изображений в Telegram WebApp

## 🔍 Проблема
В Telegram WebApp изображения товаров загружались в каталоге и карточке товара, но не отображались в:
- Избранном (`/webapp/favorites`)
- Товарах в ожидании (`/webapp/subscriptions`) 
- Истории заказов (`/webapp/orders`)

## 🎯 Причина
API для избранного, подписок и заказов не загружали изображения из `active_storage_attachments`, в отличие от основного каталога товаров. Они возвращали только поле `image_url` из таблицы `products`, которое часто было `null`.

## ✅ Решение

### 1. Исправлен API избранного
**Файл**: `src/app/api/webapp/favorites/route.ts`

Добавлена логика загрузки изображений из `active_storage_attachments`:

```typescript
// Получаем изображения для всех товаров одним запросом
const productIds = favorites.map(fav => Number(fav.products?.id)).filter(Boolean);
const attachments = await prisma.active_storage_attachments.findMany({
  where: {
    record_type: 'Product',
    record_id: { in: productIds },
    name: 'image'
  },
  include: {
    active_storage_blobs: true
  }
});

// Создаем карту product_id -> blob_key
const imageMap = new Map<number, string>();
attachments.forEach(attachment => {
  imageMap.set(Number(attachment.record_id), attachment.active_storage_blobs.key);
});

// Приоритет image_url из базы, затем из S3
let imageUrl = product?.image_url;
if (!imageUrl && blobKey) {
  imageUrl = S3Service.getImageUrl(blobKey);
}
```

### 2. Исправлен API подписок
**Файл**: `src/app/api/webapp/subscriptions/route.ts`

Добавлена аналогичная логика загрузки изображений.

### 3. Исправлен API заказов
**Файл**: `src/app/api/webapp/orders/route.ts`

Добавлена логика загрузки изображений для товаров в заказах:

```typescript
// Получаем изображения для всех товаров одним запросом
const allProductIds = orders.flatMap(order => 
  order.order_items.map(item => Number(item.products?.id)).filter(Boolean)
);
const uniqueProductIds = [...new Set(allProductIds)];

const attachments = await prisma.active_storage_attachments.findMany({
  where: {
    record_type: 'Product',
    record_id: { in: uniqueProductIds },
    name: 'image'
  },
  include: {
    active_storage_blobs: true
  }
});
```

## 🔄 Логика работы

1. **Приоритет загрузки изображений**:
   - Сначала проверяется поле `image_url` в таблице `products`
   - Если оно пустое, загружается изображение из `active_storage_attachments`
   - Используется `S3Service.getImageUrl(blobKey)` для формирования URL

2. **Оптимизация**:
   - Все изображения загружаются одним запросом для всех товаров
   - Создается карта `product_id -> blob_key` для быстрого поиска
   - Избегается N+1 проблема запросов

## 📊 Результат

### До исправления:
```json
{
  "id": 27,
  "name": "Arislow 2 mg",
  "image_url": null
}
```

### После исправления:
```json
{
  "id": 27,
  "name": "Arislow 2 mg", 
  "image_url": "https://s3.ru1.storage.beget.cloud/2c11548b454d-eldar-agency/products/ncdvmsgwad4ssjxrx0i98r7ntqsr"
}
```

## 🧪 Тестирование

### API избранного:
```bash
curl -s "https://strattera.ngrok.app/api/webapp/favorites?tg_id=125861752" | jq '.favorites[] | {id: .product_id, name: .title, image_url: .image_url}'
```

### API подписок:
```bash
curl -s "https://strattera.ngrok.app/api/webapp/subscriptions?tg_id=125861752" | jq '.subscriptions[] | {id: .product_id, name: .title, image_url: .image_url}'
```

### API заказов:
```bash
curl -s "https://strattera.ngrok.app/api/webapp/orders?tg_id=125861752" | jq '.orders[0].items[] | {id: .product_id, name: .product_name, image_url: .image_url}'
```

## 🔧 Технические детали

### Структура S3 URL:
```
https://s3.ru1.storage.beget.cloud/2c11548b454d-eldar-agency/products/{blob_key}
```

### Связи в базе данных:
```
products -> active_storage_attachments -> active_storage_blobs
```

### Сервисы:
- `S3Service.getImageUrl(key)` - формирование URL изображения
- `UserService.getUserByTelegramId(tgId)` - получение пользователя

## ✨ Дополнительные улучшения

1. **Логирование**: Добавлены подробные логи для отладки загрузки изображений
2. **Fallback**: Если `image_url` в базе пустой, используется S3
3. **Производительность**: Одним запросом загружаются все изображения
4. **Совместимость**: Работает со всеми существующими компонентами фронтенда

## 🎉 Заключение

Теперь изображения товаров корректно отображаются во всех разделах Telegram WebApp:
- ✅ Каталог товаров
- ✅ Карточка товара  
- ✅ Избранное
- ✅ Товары в ожидании (подписки)
- ✅ История заказов

Все API используют единую логику загрузки изображений из `active_storage_attachments` с fallback на поле `image_url` из таблицы `products`. 