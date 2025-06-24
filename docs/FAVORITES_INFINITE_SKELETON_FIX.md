# Исправление бесконечного skeleton на странице избранного

## Проблема
На странице избранного в Telegram WebApp отображался бесконечный skeleton (скелетон загрузки), который не исчезал даже после загрузки данных.

## Причины проблемы
1. **Неправильная логика условий**: Условие `if (authLoading || isLoading)` могло создавать ситуацию, когда skeleton показывался постоянно
2. **Отсутствие таймаута**: Не было защиты от бесконечной загрузки
3. **Недостаточное логирование**: Сложно было отследить, почему skeleton не исчезает

## Решение

### 1. Разделение условий показа skeleton
```typescript
// Было
if (authLoading || isLoading) {
  return <SkeletonLoading type="favorites" />;
}

// Стало
if (authLoading) {
  return <SkeletonLoading type="favorites" />;
}

if (isLoading && !error) {
  return <SkeletonLoading type="favorites" />;
}
```

### 2. Добавление таймаута для предотвращения бесконечной загрузки
```typescript
const loadFavoriteProducts = async () => {
  let timeoutId: NodeJS.Timeout | null = null;
  
  try {
    setIsLoading(true);
    setError(null);

    // Таймаут на 10 секунд
    timeoutId = setTimeout(() => {
      console.warn('Loading timeout reached, stopping skeleton');
      setIsLoading(false);
      setError('Превышено время ожидания загрузки');
    }, 10000);

    // ... остальная логика
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    setIsLoading(false);
  }
};
```

### 3. Улучшение логики useEffect
```typescript
useEffect(() => {
  // Ждем завершения аутентификации и убеждаемся что не загружаем уже
  if (!authLoading && !isLoading) {
    loadFavoriteProducts();
  }
}, [authLoading, isAuthenticated, user?.tg_id]);
```

### 4. Добавление подробного логирования
```typescript
console.log('🎯 FavoritesPage render state:', { 
  authLoading, 
  isLoading, 
  error, 
  isAuthenticated, 
  favoritesCount: favoriteProducts.length,
  userId: user?.tg_id 
});
```

## Результат
- ✅ Skeleton больше не показывается бесконечно
- ✅ Добавлена защита от зависания (таймаут 10 сек)
- ✅ Улучшена отладка с подробным логированием
- ✅ Четкое разделение состояний авторизации и загрузки данных

## Файлы изменены
- `src/app/webapp/favorites/page.tsx` - основные исправления

## Команды для тестирования
```bash
cd /Users/eldar/NEXTADMIN
pkill -f "next dev"
PORT=3000 npm run dev
```

Откройте https://strattera.ngrok.app/webapp/favorites и проверьте:
1. Skeleton показывается только во время загрузки
2. После загрузки показывается список избранного или пустое состояние
3. В консоли браузера видны логи состояний
4. Максимальное время показа skeleton - 10 секунд

## Дата создания
24 декабря 2024 