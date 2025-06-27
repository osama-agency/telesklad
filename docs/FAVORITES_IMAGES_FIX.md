# Исправление загрузки изображений в избранном

## 📋 Обзор проблемы

В странице избранного (`/tgapp/favorites`) изображения товаров не загружались корректно, хотя в каталоге работали нормально.

### Симптомы:
- ✅ **Каталог**: Изображения загружаются из S3 корректно
- ❌ **Избранное**: Показываются заглушки или изображения не загружаются
- 🔍 **В логах**: Разная логика обработки изображений в API

## 🔧 Техническая причина

### Проблема в API избранного (`/api/webapp/favorites`)

**Неправильная логика приоритета изображений:**

```typescript
// ❌ НЕПРАВИЛЬНО (было):
let imageUrl = product?.image_url;
if (!imageUrl && blobKey) {
  imageUrl = S3Service.getImageUrl(blobKey);
}
```

**Правильная логика из API продуктов:**

```typescript
// ✅ ПРАВИЛЬНО (стало):
const activeStorageUrl = imageMap.get(productId);
const imageUrl = activeStorageUrl || product?.image_url;
```

### Различия в обработке данных

| Аспект | API продуктов | API избранного (было) | API избранного (стало) |
|--------|---------------|----------------------|----------------------|
| **Приоритет изображений** | ActiveStorage → image_url | image_url → ActiveStorage | ActiveStorage → image_url |
| **Создание URL** | `S3Service.getImageUrl(key)` | `S3Service.getImageUrl(key)` | `S3Service.getImageUrl(key)` |
| **Логирование** | Подробное | Минимальное | Подробное |
| **Кэширование** | Нет | Есть (2 мин) | Есть (2 мин) |

## 🛠️ Решение

### 1. Унификация логики получения изображений

**До:**
```typescript
// Создаем карту product_id -> blob_key
const imageMap = new Map<number, string>();
attachments.forEach(attachment => {
  imageMap.set(Number(attachment.record_id), attachment.active_storage_blobs.key);
});

// В маппинге товаров:
const blobKey = imageMap.get(productId);
let imageUrl = product?.image_url;
if (!imageUrl && blobKey) {
  imageUrl = S3Service.getImageUrl(blobKey);
}
```

**После:**
```typescript
// Создаем мапу изображений по product_id (как в API продуктов)
const imageMap = new Map<number, string>();
console.log(`📦 Found ${attachments.length} attachments for favorites`);
attachments.forEach(attachment => {
  const imageUrl = S3Service.getImageUrl(attachment.active_storage_blobs.key);
  const productId = Number(attachment.record_id);
  console.log(`📦 Mapping favorite product ${productId} to image: ${imageUrl}`);
  imageMap.set(productId, imageUrl);
});

// В маппинге товаров:
// Используем ту же логику что и в API продуктов:
// Приоритет: ActiveStorage изображение, затем image_url из таблицы
const activeStorageUrl = imageMap.get(productId);
const imageUrl = activeStorageUrl || product?.image_url;
```

### 2. Улучшенное логирование

Добавлено подробное логирование для отладки:

```typescript
console.log(`📦 Found ${attachments.length} attachments for favorites`);
console.log(`📦 Mapping favorite product ${productId} to image: ${imageUrl}`);
```

### 3. Очистка кэша

```bash
redis-cli DEL "webapp:favorites:125861752"
```

## 📱 Результат

### До исправления:
- Изображения в избранном: заглушки или не загружаются
- Разная логика в API продуктов и избранного
- Неправильный приоритет источников изображений

### После исправления:
- ✅ Единая логика получения изображений
- ✅ Правильный приоритет: ActiveStorage → image_url
- ✅ Подробное логирование для отладки
- ✅ Изображения загружаются корректно

## 🔍 Тестирование

### Проверочный список:

- [x] Изображения в избранном загружаются корректно
- [x] Изображения соответствуют тем, что в каталоге
- [x] Логи показывают правильные URL изображений
- [x] Кэширование работает корректно
- [x] Fallback на image_url работает при отсутствии ActiveStorage

### Команды для тестирования:

```bash
# Очистить кэш избранного
redis-cli DEL "webapp:favorites:*"

# Проверить логи API
curl "http://localhost:3000/api/webapp/favorites?tg_id=125861752"

# Сравнить с API продуктов
curl "http://localhost:3000/api/webapp/products?tg_id=125861752"
```

## 📁 Измененные файлы

### `src/app/api/webapp/favorites/route.ts`
- Унифицирована логика получения изображений с API продуктов
- Изменен приоритет: ActiveStorage → image_url
- Добавлено подробное логирование
- Исправлено создание мапы изображений

## 🚀 Влияние на производительность

### Положительное влияние:
- **Консистентность**: Единая логика во всех API
- **Надежность**: Правильный fallback при отсутствии изображений
- **Отладка**: Подробные логи для диагностики

### Без изменений:
- **Кэширование**: Остается на том же уровне (2 минуты)
- **Скорость**: Та же производительность запросов
- **Память**: Без дополнительных затрат

## 🔮 Предотвращение повторения

### Рекомендации:
1. **Единая функция**: Вынести логику получения изображений в отдельный сервис
2. **Тесты**: Добавить unit-тесты для проверки URL изображений
3. **Типизация**: Улучшить типизацию для предотвращения ошибок
4. **Документация**: Задокументировать приоритет источников изображений

---

**Дата создания:** 2025-01-27  
**Автор:** AI Assistant  
**Статус:** ✅ Завершено 