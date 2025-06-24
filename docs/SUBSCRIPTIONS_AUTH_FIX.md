# Исправление аутентификации в разделе "Товары в ожидании"

## Проблема
При переходе в раздел "Товары в ожидании" из профиля показывалась ошибка:
```
user_id or tg_id parameter is required
```

## Причина
Страница подписок (`/webapp/subscriptions`) использовала функцию `webAppFetch` без передачи параметра `tg_id`, что приводило к ошибке 400 в API `/api/webapp/subscriptions`.

## Решение

### 1. Исправлена страница подписок
**Файл**: `src/app/webapp/subscriptions/page.tsx`

Добавлено:
- Импорт `useTelegramAuth` контекста
- Проверка аутентификации перед загрузкой данных
- Передача `tg_id` в API запросах

```typescript
const { user, isAuthenticated, isLoading: authLoading } = useTelegramAuth();

const loadSubscriptions = async () => {
  // Проверяем аутентификацию
  if (!isAuthenticated || !user?.tg_id) {
    console.warn('User not authenticated, cannot load subscriptions');
    setSubscriptions([]);
    setLoading(false);
    return;
  }
  
  const response = await webAppFetch(`/api/webapp/subscriptions?tg_id=${user.tg_id}`);
  // ...
};
```

### 2. Улучшен API подписок
**Файл**: `src/app/api/webapp/subscriptions/route.ts`

Добавлено:
- Полная информация о товаре в ответе API
- Правильная сериализация BigInt для объекта product

```typescript
product: {
  id: product?.id,
  name: product?.name,
  price: product?.price,
  old_price: null,
  quantity: product?.stock_quantity || 0,
  available: (product?.stock_quantity || 0) > 0,
  image_url: product?.image_url
}
```

### 3. Исправлена функция отписки
Добавлена передача `tg_id` в DELETE запросы:

```typescript
const handleUnsubscribe = async (productId: number) => {
  if (!user?.tg_id) return;

  const response = await webAppFetch(
    `/api/webapp/subscriptions?product_id=${productId}&tg_id=${user.tg_id}`, 
    { method: 'DELETE' }
  );
  // ...
};
```

## Результат
✅ Раздел "Товары в ожидании" теперь корректно загружает подписки пользователя  
✅ Отображается правильная информация о товарах  
✅ Функция отписки работает корректно  
✅ Нет ошибок аутентификации

## Тестирование
1. Войти в профиль в Telegram WebApp
2. Нажать на кнопку "Товары в ожидании"
3. Проверить что список подписок загружается без ошибок
4. Проверить что можно отписаться от товаров

## Связанные файлы
- `src/app/webapp/subscriptions/page.tsx` - страница подписок
- `src/app/api/webapp/subscriptions/route.ts` - API подписок
- `src/context/TelegramAuthContext.tsx` - контекст аутентификации
- `src/lib/utils/webapp-fetch.ts` - утилита для API запросов 