# Реализация страницы "История заказов" для TgApp

## Обзор

Реализована полноценная страница истории заказов для Telegram WebApp (`/tgapp/orders`) с поддержкой светлой и тёмной тем, соответствующая дизайну страницы профиля.

## Ключевые особенности

### 1. Архитектура компонента

```typescript
// Оптимизированная загрузка данных с useCallback
const loadOrders = useCallback(async () => {
  // Проверка авторизации
  // Обработка ошибок
  // Загрузка через webAppFetch с автоматической передачей initData
}, [user?.tg_id]);

// Виброотклик при копировании
if (window.Telegram?.WebApp?.HapticFeedback) {
  window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
}
```

### 2. Стилизация

- Использованы базовые стили из `tgapp.css`
- Создан отдельный файл `orders.css` для специфичных стилей
- Полная поддержка светлой и тёмной тем через `.tg-dark`

### 3. Компоненты страницы

#### Заголовок (как на странице профиля)
```html
<div className="tgapp-profile-header">
  <h1 className="tgapp-profile-greeting">История заказов</h1>
</div>
```

#### Карточка заказа
```html
<div className="tgapp-order-card">
  <!-- Шапка с номером и датой -->
  <!-- Сумма и статус -->
  <!-- Список товаров с изображениями -->
  <!-- Детали: трек-номер, даты, бонусы -->
</div>
```

### 4. Функциональность

- **Копирование трек-номера** с виброоткликом и tooltip
- **Открытие трекинга** в новой вкладке
- **Адаптивный дизайн** для мобильных устройств
- **Skeleton loading** во время загрузки
- **Empty states** для разных сценариев

### 5. Визуальные особенности

#### Светлая тема
- Белые карточки с тенями `box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04)`
- Серые границы `border: 1px solid #f0f0f0`
- Зелёный акцентный цвет `#20C55E`

#### Тёмная тема
- Полупрозрачные карточки с `backdrop-filter: blur(10px)`
- Адаптированные цвета для тёмного фона
- Усиленные тени для глубины

### 6. Статусы заказов

```typescript
const statusMap = {
  unpaid: { label: "Ожидает оплаты", color: "#D97706", bgColor: "#FEF3C7" },
  paid: { label: "Проверка оплаты", color: "#2563EB", bgColor: "#DBEAFE" },
  processing: { label: "Обрабатывается", color: "#7C3AED", bgColor: "#EDE9FE" },
  shipped: { label: "Отправлен", color: "#059669", bgColor: "#D1FAE5" },
  delivered: { label: "Доставлен", color: "#059669", bgColor: "#D1FAE5" },
  cancelled: { label: "Отменён", color: "#DC2626", bgColor: "#FEE2E2" },
};
```

### 7. Оптимизации

- Использование `useCallback` для предотвращения лишних рендеров
- Ленивая загрузка изображений через Next.js Image
- Оптимизированные анимации через CSS
- Минимальное использование JavaScript для анимаций

## Структура файлов

```
/src/app/tgapp/orders/
├── page.tsx      # Основной компонент страницы
└── orders.css    # Стили для страницы заказов
```

## Навигация

Добавлен пункт "Заказы" в нижнюю навигацию:

```typescript
// BottomNavigation.tsx
import { Home, Star, User, ShoppingBag } from "lucide-react";

const navItems = [
  { href: "/tgapp/catalog", icon: Home, label: "Каталог" },
  { href: "/tgapp/orders", icon: ShoppingBag, label: "Заказы" },
  { href: "/tgapp/favorites", icon: Star, label: "Избранное" },
  { href: "/tgapp/profile", icon: User, label: "Профиль" },
];
```

## Интеграция с Telegram WebApp

- Кнопка "Назад" через `useBackButton`
- Виброотклик при взаимодействии
- Автоматическая передача `initData` через `webAppFetch`
- Адаптация под размер WebApp окна

## Дальнейшие улучшения

1. Добавить пагинацию для большого количества заказов
2. Реализовать фильтрацию по статусам
3. Добавить возможность повторного заказа
4. Интегрировать с push-уведомлениями о статусе заказа