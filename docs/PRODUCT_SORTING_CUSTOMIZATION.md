# Пользовательская сортировка товаров в Virtual Catalog

## Обзор

Реализована пользовательская сортировка товаров в Telegram WebApp для отображения товаров в определенном порядке по брендам с учетом дозировки.

## Порядок сортировки

1. **Atominex** - сортировка по возрастанию дозировки (от 18 мг до максимального)
2. **Attex** - все товары этого бренда
3. **Abilify** - все товары этого бренда
4. **Arislow** - все товары этого бренда
5. **Все остальные товары** - в конце списка

## Технические детали

### Измененный файл
- `/src/app/api/webapp/products/route.ts`

### Реализация

Добавлена пользовательская функция сортировки после получения товаров из базы данных:

```typescript
// Функция для извлечения числа мг из названия
const extractMg = (name: string | null): number => {
  if (!name) return 0;
  const match = name.match(/(\d+)\s*mg/i);
  return match ? parseInt(match[1]) : 0;
};

// Определяем приоритет брендов
const getBrandPriority = (name: string | null): number => {
  if (!name) return 5;
  const nameLower = name.toLowerCase();
  if (nameLower.includes('atominex')) return 1;
  if (nameLower.includes('attex')) return 2;
  if (nameLower.includes('abilify')) return 3;
  if (nameLower.includes('arislow')) return 4;
  return 5; // Все остальные
};
```

### Особенности

1. **Приоритет брендов**: Каждому бренду присваивается числовой приоритет (1-5)
2. **Сортировка по дозировке**: Для Atominex товары сортируются по возрастанию дозировки
3. **Извлечение дозировки**: Используется регулярное выражение для извлечения числа мг из названия товара
4. **Обработка null значений**: Добавлены проверки на null для безопасности типов

## Логирование

Добавлен лог для отслеживания результатов сортировки:
```typescript
console.log('[API_PRODUCTS] Products after custom sorting:', result.map(p => `${p.name}`).join(', '));
```

## Тестирование

1. Откройте Telegram WebApp: https://strattera.ngrok.app/tgapp/catalog
2. Проверьте порядок отображения товаров
3. Убедитесь, что Atominex товары отсортированы от 18 мг до максимального
4. Проверьте, что остальные бренды следуют в правильном порядке

## Дата создания
2025-01-27