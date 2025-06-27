# Исправление загрузки товаров в каталоге TgApp

## Проблема
Страница каталога `/tgapp/catalog` показывала бесконечную загрузку (скелетоны) вместо товаров, хотя API успешно возвращал данные.

## Найденные проблемы

### 1. Неправильный путь к каталогу
Изначально работали с `/webapp/catalog` вместо `/tgapp/catalog`.

### 2. Отсутствие поддержки поиска в хуке
Хук `useProductsWithSubscriptions` не принимал параметры для поиска товаров.

### 3. Отсутствие поддержки поиска в API
API endpoint `/api/webapp/products` не поддерживал фильтрацию по поисковому запросу.

### 4. Лишняя зависимость в useEffect
Объект `cache` в зависимостях `useEffect` вызывал бесконечные перерендеры.

### 5. Категории отображались как товары
В базе данных категории и товары хранятся в одной таблице `products`. Категории имеют `ancestry = null` или просто число, а товары имеют `ancestry` содержащий "/" (например, "20/3").

## Внесенные изменения

### 1. Обновлен хук `useProductsWithSubscriptions`
```typescript
// Добавлены параметры category и search
export function useProductsWithSubscriptions(category?: string, search?: string) {
  // ...
  
  // Обновлена логика построения URL с параметрами
  const params = new URLSearchParams();
  if (user?.tg_id) params.append('tg_id', user.tg_id);
  if (search) params.append('search', search);
  
  // Убрана зависимость cache из useEffect
  }, [user?.tg_id, search]); // было: [cache, user?.tg_id, search]
```

### 2. Обновлен API endpoint
```typescript
// Добавлена поддержка поиска
const search = searchParams.get('search');

// Добавлен фильтр поиска в запрос к БД
where: {
  show_in_webapp: true,
  deleted_at: null,
  ...(search && {
    name: {
      contains: search,
      mode: 'insensitive',
    },
  }),
}

// Убрано ограничение на 10 товаров
// take: 10, // удалено

// Добавлен фильтр для исключения категорий
ancestry: {
  contains: '/',
}
```

### 3. Добавлена обработка ошибок в компоненте
```typescript
// Добавлено отображение ошибок
if (error) {
  return (
    <div className="text-center py-8 text-red-500">
      <p>Ошибка загрузки товаров: {error}</p>
    </div>
  );
}
```

### 4. Добавлен скрипт Prisma Studio
В `package.json`:
```json
"prisma:studio": "npx prisma studio"
```

## Результат
- Каталог корректно загружает и отображает товары
- Поддерживается поиск товаров
- Устранены бесконечные перерендеры
- Добавлена обработка ошибок

## Проверка работоспособности
```bash
# API возвращает товары
curl -s http://localhost:3000/api/webapp/products | jq

# Запуск Prisma Studio для просмотра БД
npm run prisma:studio
```

## Важные моменты
1. Убедитесь, что в БД есть товары с `show_in_webapp = true`
2. Проверьте консоль браузера на наличие ошибок
3. При необходимости очистите кэш браузера 