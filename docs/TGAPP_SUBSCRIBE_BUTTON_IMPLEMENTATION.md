# Реализация кнопки "Подписаться" для товаров вне наличия

## Обзор

Реализована система подписок на товары, которых нет в наличии. Когда `stock_quantity = 0`, вместо зеленой кнопки "В корзину" показывается зеленая кнопка "🔔 Подписаться".

## Компоненты

### 1. `useProductSubscription` Hook
**Файл:** `src/hooks/useProductSubscription.ts`

Централизованная логика управления подписками:
- `subscribe()` - подписаться на товар
- `unsubscribe()` - отписаться от товара
- Автоматическая отправка события `subscriptionsUpdated`

### 2. `SubscribeButton` Component
**Файл:** `src/app/webapp/_components/SubscribeButton.tsx`

Кнопка подписки с состояниями:
- **Не подписан:** Зеленая кнопка "🔔 Подписаться" 
- **Подписан:** Оранжевая кнопка "🔔 Вы подписаны"
- **Загрузка:** Спиннер с текстом "Загрузка..."

Особенности:
- Haptic feedback при нажатии
- Анимация состояний
- Обработка ошибок
- Предотвращение перезагрузки страницы при клике

### 3. `ProductActionButton` Component
**Файл:** `src/app/webapp/_components/ProductActionButton.tsx`

Универсальный компонент, который автоматически выбирает:
- **В наличии** → `AddToCartButton` (зеленая)
- **Нет в наличии** → `SubscribeButton` (зеленая/оранжевая)

### 4. `useProductsWithSubscriptions` Hook
**Файл:** `src/hooks/useProductsWithSubscriptions.ts`

Загружает товары с информацией о подписках пользователя:
- Параллельная загрузка товаров и подписок
- Объединение данных в `ProductWithSubscription`
- Автообновление при событии `subscriptionsUpdated`

## API Endpoints

### GET /api/webapp/subscriptions
Получение списка подписок пользователя
```
?tg_id={telegram_user_id}
```

### POST /api/webapp/subscriptions
Создание подписки
```json
{
  "product_id": 123,
  "tg_id": "123456789"
}
```

### DELETE /api/webapp/subscriptions
Удаление подписки
```
?product_id=123&tg_id=123456789
```

## Стили

### Цветовая схема
- **Кнопка "В корзину"**: `bg-telegram-primary` (#20C55E) - зеленая
- **Кнопка "Подписаться"**: `bg-telegram-primary` (#20C55E) - зеленая
- **Кнопка "Вы подписаны"**: `bg-orange-500` - оранжевая

### Обновленные стили AddToCartButton
- Переход с CSS классов на Tailwind
- Сохранение зеленого цвета Telegram
- Современный дизайн quantity stepper

## Использование

```tsx
// В каталоге товаров
<ProductActionButton
  productId={product.id}
  productName={product.name}
  productPrice={product.price}
  stockQuantity={product.stock_quantity || 0}
  maxQuantity={product.stock_quantity || 10}
  imageUrl={product.image_url}
  initiallySubscribed={product.isSubscribed}
/>
```

## Результат

Теперь пользователи могут:
1. Видеть зеленую кнопку "Подписаться" для товаров вне наличия
2. Подписываться одним нажатием без перезагрузки страницы
3. Видеть оранжевую кнопку "Вы подписаны" после подписки
4. Получать уведомления при поступлении товара (через Telegram Bot)
5. Управлять подписками на странице `/webapp/subscriptions` 