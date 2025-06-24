# Исправление проблемы с подписками на уведомления

## Описание проблемы

При нажатии кнопки "Уведомить о поступлении" в Telegram WebApp возникала ошибка:
- Console Error: `Failed to subscribe: {}`
- API возвращал 400 ошибку: `POST /api/webapp/subscriptions 400 in 9ms`

## Причина проблемы

1. **Отсутствие идентификации пользователя**: API endpoint `/api/webapp/subscriptions` требует `tg_id` или `user_id`, но клиент не передавал эти данные.

2. **Неправильная структура запроса**: Компонент отправлял только `product_id`:
   ```typescript
   body: JSON.stringify({
     product_id: product.id  // Недостаточно!
   })
   ```

3. **Неиспользование контекста аутентификации**: Компонент не использовал данные пользователя из `TelegramAuthContext`.

## Решение

### 1. Исправление страницы продукта (/webapp/products/[id]/page.tsx) ✅

### 2. Исправление каталога (ProductGrid.tsx) ✅

### 3. Исправление страницы избранного (favorites/page.tsx) ✅

### Детали исправления:

#### 1. Добавление использования контекста аутентификации

```typescript
import { useTelegramAuth } from '@/context/TelegramAuthContext'

export default function ProductDetailPage() {
  const { user } = useTelegramAuth() // Получаем данные пользователя
  // ...
}
```

### 2. Передача tg_id в запросах

**POST запрос (создание подписки):**
```typescript
body: JSON.stringify({
  product_id: product.id,
  tg_id: user.tg_id  // Добавлен tg_id
})
```

**GET запрос (проверка статуса):**
```typescript
const response = await fetch(`/api/webapp/subscriptions?tg_id=${user.tg_id}`)
```

**DELETE запрос (отмена подписки):**
```typescript
const response = await fetch(`/api/webapp/subscriptions?product_id=${product.id}&tg_id=${user.tg_id}`, {
  method: 'DELETE'
});
```

### 3. Исправление структуры компонента

Вынесли функцию `checkSubscriptionStatus` из `useEffect` наружу для корректного использования в других `useEffect`:

```typescript
const checkSubscriptionStatus = async () => {
  if (!user) return;
  
  try {
    const response = await fetch(`/api/webapp/subscriptions?tg_id=${user.tg_id}`)
    // ...
  } catch (err) {
    console.error('Failed to check subscription status:', err)
  }
}
```

### 4. Добавление проверок пользователя

```typescript
const handleNotificationToggle = async () => {
  if (isNotificationLoading || !product || !user) return; // Проверяем user
  // ...
}
```

## Результат

После исправления:
- ✅ Кнопка "Уведомить о поступлении" работает корректно
- ✅ API корректно создает подписки с привязкой к пользователю
- ✅ Статус подписки корректно отображается при загрузке страницы
- ✅ Отмена подписки работает правильно

## Файлы, которые были изменены

- `src/app/webapp/products/[id]/page.tsx` - основные исправления в компоненте продукта

## API Endpoint

API endpoint `/api/webapp/subscriptions` корректно обрабатывает:
- `GET ?tg_id=123` - получение подписок пользователя
- `POST {product_id: 1, tg_id: "123"}` - создание подписки
- `DELETE ?product_id=1&tg_id=123` - удаление подписки

Также поддерживается извлечение пользователя из заголовка `X-Telegram-Init-Data`, но для надежности рекомендуется явно передавать `tg_id` в параметрах.

## Полное решение - все компоненты исправлены

### Исправленные компоненты:

1. **`/webapp/products/[id]/page.tsx`** - страница товара ✅
2. **`/webapp/_components/ProductGrid.tsx`** - каталог товаров ✅  
3. **`/webapp/favorites/page.tsx`** - страница избранного ✅

### Ключевые изменения во всех компонентах:

```typescript
// Раньше (НЕ работало):
body: JSON.stringify({
  product_id: product.id  // Только ID товара
})

// Теперь (работает):
body: JSON.stringify({
  product_id: product.id,
  tg_id: user.tg_id       // + ID пользователя
})
```

Теперь кнопка "Уведомить о поступлении" работает корректно во всех местах приложения!

## Дополнительные исправления

### Исправление ошибки BigInt сериализации

**Проблема**: `TypeError: Do not know how to serialize a BigInt`

**Решение**: Преобразование BigInt в Number при сериализации JSON:
```typescript
const serializedSubscriptions = formattedSubscriptions.map(sub => ({
  ...sub,
  id: Number(sub.id),
  product_id: Number(sub.product_id),
  price: Number(sub.price),
  created_at: sub.created_at?.toISOString(),
  updated_at: sub.updated_at?.toISOString()
}));
```

### Исправление дублирования подписок

**Проблема**: `POST /api/webapp/subscriptions 409` при повторном нажатии

**Решение**: Возврат 200 вместо 409 для существующих подписок:
```typescript
if (existingSubscription) {
  return NextResponse.json({ 
    success: true,
    message: 'Subscription already exists'
  }, { status: 200 });
}
```

Все проблемы решены! ✅ 