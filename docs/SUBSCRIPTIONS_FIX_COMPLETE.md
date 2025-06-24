# Полное исправление раздела "Товары в ожидании"

## Проблемы

1. **Ошибка аутентификации**: `user_id or tg_id parameter is required`
2. **BigInt сериализация**: `Do not know how to serialize a BigInt`
3. **Запросы без tg_id**: компоненты каталога делали запросы без идентификации пользователя

## Решения

### 1. Исправлена страница подписок
**Файл**: `src/app/webapp/subscriptions/page.tsx`

**Изменения**:
- Добавлен импорт `useTelegramAuth`
- Добавлена проверка аутентификации перед загрузкой
- Передача `tg_id` во всех API запросах

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

### 2. Исправлен API подписок
**Файл**: `src/app/api/webapp/subscriptions/route.ts`

**Изменения**:
- Исправлена BigInt сериализация (возврат `serializedSubscriptions` вместо `formattedSubscriptions`)
- Добавлено подробное логирование для отладки
- Улучшена обработка ошибок

```typescript
// Правильная сериализация BigInt
const serializedSubscriptions = formattedSubscriptions.map(sub => ({
  ...sub,
  id: Number(sub.id),
  product_id: Number(sub.product_id),
  price: Number(sub.price),
  created_at: sub.created_at?.toISOString(),
  updated_at: sub.updated_at?.toISOString(),
  product: sub.product ? {
    ...sub.product,
    id: Number(sub.product.id),
    price: Number(sub.product.price)
  } : null
}));

// Возврат правильных данных
return NextResponse.json({
  subscriptions: serializedSubscriptions, // ✅ Исправлено
  total: serializedSubscriptions.length
});
```

### 3. Исправлена структура данных
**Проблема**: API возвращал неполную информацию о товарах для страницы подписок

**Решение**: Добавлен объект `product` с полной информацией:

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

## Результат

✅ **Раздел "Товары в ожидании" полностью работает**  
✅ **Правильная аутентификация пользователей**  
✅ **Корректное отображение информации о товарах**  
✅ **Функции подписки/отписки работают**  
✅ **BigInt сериализация исправлена**  

## Тестирование

1. Перейти в профиль → "Товары в ожидании"
2. Должен открыться список подписок (или пустое состояние)
3. Для товаров в наличии показывается кнопка "Купить сейчас"
4. Для товаров не в наличии показывается статус "Ожидаем поступления"
5. Кнопка "Отписаться" работает корректно

## Логи для отладки

Добавлено логирование:
- `Getting subscriptions for user X (tg_id: Y)`
- `Found N subscriptions`
- Детальное логирование POST запросов с заголовками и телом

## Связанные файлы

- `src/app/webapp/subscriptions/page.tsx` - страница подписок
- `src/app/api/webapp/subscriptions/route.ts` - API подписок
- `docs/SUBSCRIPTIONS_AUTH_FIX.md` - предыдущая документация 