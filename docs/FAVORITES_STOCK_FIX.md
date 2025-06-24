# Исправление отображения наличия товаров в избранном

## Проблема
Товары в избранном показывались как "Нет в наличии", хотя они были в наличии в каталоге.

## Причина
API избранного (`/api/webapp/favorites`) не возвращал поле `stock_quantity` в данных товаров, из-за чего фронтенд не мог определить реальное количество товара.

## Решение

### 1. Исправлен API избранного
**Файл**: `src/app/api/webapp/favorites/route.ts`

Добавлено поле `stock_quantity` в возвращаемые данные:

```typescript
const result = favorites
  .filter(fav => fav.products?.show_in_webapp)
  .map(favorite => {
    const product = favorite.products;
    return {
      id: Number(favorite.id),
      product_id: Number(product?.id),
      title: product?.name,
      price: product?.price,
      old_price: product?.old_price,
      stock_quantity: product?.stock_quantity || 0, // ✅ Добавлено
      is_in_stock: (product?.stock_quantity || 0) > 0,
      image_url: product?.image_url,
      created_at: favorite.created_at
    };
  });
```

### 2. Обновлен маппинг данных на фронтенде
**Файл**: `src/app/webapp/favorites/page.tsx`

Исправлен маппинг данных из API:

```typescript
const products = data.favorites.map((item: any) => ({
  id: item.product_id,
  name: item.title,
  price: item.price,
  old_price: item.old_price,
  stock_quantity: item.stock_quantity || 0, // ✅ Используем из API
  image_url: item.image_url,
  favorited_at: item.created_at
}));
```

### 3. Добавлено логирование для отладки
Добавлены логи для отслеживания данных о товарах:

```typescript
console.log(`📦 Product ${product?.id}: stock_quantity = ${product?.stock_quantity}, name = ${product?.name}`);
```

## Результат
✅ Товары в избранном теперь корректно показывают реальное состояние наличия  
✅ Кнопки "В корзину" появляются для товаров в наличии  
✅ Кнопки "Уведомить о поступлении" показываются только для товаров без наличия

## Тестирование
1. Добавьте товар в наличии в избранное
2. Перейдите в раздел "Избранное"
3. Убедитесь, что товар показывает правильную цену и кнопку "В корзину"
4. Для товаров без наличия должна показываться кнопка "Уведомить о поступлении"

## Связанные файлы
- `src/app/api/webapp/favorites/route.ts` - API избранного
- `src/app/webapp/favorites/page.tsx` - Страница избранного
- `src/app/webapp/_components/ProductGrid.tsx` - Сетка товаров (если используется) 