# Исправление загрузки товаров на странице каталога

## Проблема
Страница каталога `/webapp/catalog` не загружала реальные товары из базы данных, хотя API `/api/webapp/products` успешно возвращал данные.

## Причина
Компонент `CatalogPage` использовал моковые данные вместо реальных товаров из API:

```typescript
// Старый код с моковыми данными
const mockProducts = [
  { id: '1', name: 'Atominex 18 mg', image: '/placeholder.jpg', price: 5200, oldPrice: 6200 },
  // ... другие моковые товары
];
```

## Решение

### 1. Интеграция с API
Обновлен компонент `src/app/webapp/catalog/page.tsx`:
- Добавлен импорт хука `useTelegramAuth` для получения данных пользователя
- Реализована функция `fetchProducts` для загрузки товаров из API
- Добавлен `useEffect` для автоматической загрузки при монтировании компонента
- Преобразование данных из API в нужный формат для компонентов

### 2. Добавлен скрипт Prisma Studio
В `package.json` добавлен скрипт для удобной работы с базой данных:
```json
"prisma:studio": "npx prisma studio"
```

Теперь можно запускать:
```bash
npm run prisma:studio
```

## Изменения в коде

### src/app/webapp/catalog/page.tsx
```typescript
// Новый код с загрузкой из API
const fetchProducts = async () => {
  try {
    setLoading(true);
    setError(false);
    
    const response = await fetch(`/api/webapp/products${user?.tg_id ? `?tg_id=${user.tg_id}` : ''}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }
    
    const data = await response.json();
    
    // Преобразуем данные в нужный формат
    const formattedProducts = data.products.map((product: any) => ({
      id: product.id.toString(),
      name: product.name,
      image: product.image_url || '/placeholder.jpg',
      price: product.price,
      oldPrice: product.old_price,
      description: product.description,
      inStock: product.in_stock,
      hasSubscription: product.hasSubscription
    }));
    
    setProducts(formattedProducts);
  } catch (err) {
    console.error('Error fetching products:', err);
    setError(true);
  } finally {
    setLoading(false);
  }
};
```

## Результат
- Страница каталога теперь загружает реальные товары из базы данных
- При загрузке отображается скелетон
- При ошибке показывается сообщение с возможностью повторить попытку
- Товары отображаются с реальными данными: названиями, ценами, изображениями

## Дополнительные улучшения
1. Добавлена обработка ошибок
2. Реализован механизм повторной загрузки при ошибке
3. Товары загружаются с учетом `tg_id` пользователя для персонализации (подписки)

## Важно
После внесения изменений необходимо:
1. Перезапустить сервер разработки: `pkill -f "next dev" && PORT=3000 npm run dev`
2. Очистить кэш браузера или открыть страницу в режиме инкогнито
3. Убедиться, что ngrok туннель активен для тестирования в Telegram