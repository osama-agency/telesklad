# Удаление анимации загрузки при переходе между страницами

## Описание изменения

Удалена анимация с тремя зелеными точками (LoadingWrapper), которая показывалась при переходе между страницами и загрузке данных. Теперь переходы происходят мгновенно без промежуточной анимации.

## Внесенные изменения

### 1. Страница избранного (`src/app/webapp/favorites/page.tsx`)

Заменили показ LoadingWrapper на возврат `null`:
```typescript
// Было:
if (authLoading) {
  return (
    <div className="webapp-container favorites-page">
      <LoadingWrapper />
    </div>
  );
}

// Стало:
if (authLoading) {
  return null; // Убираем анимацию загрузки
}
```

### 2. Компонент ProductSkeleton (`src/app/webapp/_components/ProductSkeleton.tsx`)

```typescript
export const ProductGridSkeleton: React.FC<ProductGridSkeletonProps> = () => {
    return null; // Убираем анимацию загрузки
};
```

### 3. Компонент SkeletonLoading (`src/app/webapp/_components/SkeletonLoading.tsx`)

```typescript
const SkeletonLoading: React.FC<SkeletonLoadingProps> = ({...}) => {
    return null; // Убираем анимацию загрузки
};
```

## Результат

- Мгновенные переходы между страницами
- Отсутствие промежуточных состояний загрузки
- Более быстрое восприятие работы приложения
- Улучшенный UX без отвлекающих анимаций

## Затронутые компоненты

- LoadingWrapper - остался без изменений (может использоваться в других местах)
- LoaderOne - остался без изменений
- Все страницы webapp теперь не показывают анимацию загрузки при переходах

## Дата

26.12.2024 