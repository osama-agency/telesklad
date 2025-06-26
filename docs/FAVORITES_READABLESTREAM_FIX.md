# Исправление ошибки "ReadableStream is locked" на странице избранного

## Проблема

При переходе на страницу избранного (`/webapp/favorites`) появлялась ошибка:
```
[Error: failed to pipe response] {
  [cause]: [TypeError: Invalid state: The ReadableStream is locked] {
    code: 'ERR_INVALID_STATE'
  }
}
```

## Причина

1. **Множественные одновременные запросы**: При переходе на страницу избранного несколько компонентов одновременно делали запросы к API:
   - `FavoritesContext` - при изменении `pathname` 
   - `FavoritesPage` - при монтировании компонента
   - Возможно другие компоненты в иерархии

2. **Проблема с дедупликацией**: Функция `dedupeRequest` в `/api/webapp/favorites` возвращала один и тот же Promise с `NextResponse`. Проблема в том, что `NextResponse` создает ReadableStream, который может быть прочитан только один раз. Когда первый клиент читал stream, он блокировался для остальных запросов.

## Решение

### 1. Исправление механизма дедупликации в API

**Файл**: `src/app/api/webapp/favorites/route.ts`

Изменили функцию `dedupeRequest` чтобы она возвращала данные, а не `NextResponse`:

```typescript
// До:
return await dedupeRequest(`favorites:${tgId}`, async () => {
  // ...
  return NextResponse.json(cached);
});

// После:
const data = await dedupeRequest<FavoritesResult>(`favorites:${tgId}`, async () => {
  // ...
  return cached; // Возвращаем данные, а не Response
});

// Возвращаем новый Response для каждого вызова
return NextResponse.json(data);
```

### 2. Оптимизация FavoritesContext

**Файл**: `src/context/FavoritesContext.tsx`

Добавили проверку, чтобы контекст не делал лишний запрос при переходе на страницу избранного:

```typescript
useEffect(() => {
  // Не загружаем количество на странице избранного - страница сама загрузит и обновит контекст
  if (pathname === '/webapp/favorites') {
    console.log('🔄 FavoritesContext: Skipping load on favorites page');
    return;
  }
  
  loadFavoritesCount();
}, [isAuthenticated, user?.tg_id, pathname]);
```

## Результат

1. Ошибка "ReadableStream is locked" больше не появляется
2. Количество дублирующихся запросов к API сокращено
3. Механизм дедупликации работает корректно - возвращает отдельный Response для каждого клиента
4. Производительность улучшена за счет уменьшения количества запросов

## Технические детали

- ReadableStream в Web API может быть прочитан только один раз
- NextResponse создает ReadableStream при формировании ответа
- При дедупликации запросов важно возвращать клонированные данные, а не один и тот же stream
- TypeScript требует правильной типизации для generic функций

## Дата исправления

28 января 2025 г. 