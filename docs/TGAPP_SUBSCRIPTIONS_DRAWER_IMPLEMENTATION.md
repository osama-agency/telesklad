# Реализация выезжающего окна "Товары в ожидании" в TGAPP

## Описание

Добавлена функциональность выезжающего снизу модального окна "Товары в ожидании" на странице профиля Telegram WebApp с полной поддержкой светлой и темной тем и единым стилем с дизайн-системой профиля.

## Изменения

### 1. Страница профиля TGAPP (`src/app/tgapp/profile/page.tsx`)

**Добавлено:**
- Импорт компонента `SubscriptionsSheet` из webapp
- Состояние `isSubscriptionsOpen` для управления модальным окном
- Обработчик клика на карточку "Товары в ожидании"
- Рендер модального окна `SubscriptionsSheet`

```typescript
import SubscriptionsSheet from "@/app/webapp/_components/SubscriptionsSheet";

const [isSubscriptionsOpen, setIsSubscriptionsOpen] = useState(false);

// Карточка с обработчиком открытия
<div
  className="tgapp-action-card"
  onClick={() => setIsSubscriptionsOpen(true)}
>
  {/* Контент карточки */}
</div>

// Модальное окно
<SubscriptionsSheet
  isOpen={isSubscriptionsOpen}
  onClose={() => setIsSubscriptionsOpen(false)}
/>
```

### 2. Компонент SubscriptionsSheet (`src/app/webapp/_components/SubscriptionsSheet.tsx`)

**Полностью обновлены стили для соответствия дизайн-системе TGAPP:**
- Использованы переменные из `tgapp.css`: `--tg-secondary-bg-color`, `--tg-border-color`, `--tg-text-color`, `--tg-hint-color`, `--tg-button-color`
- Заменена анимация `pulse` на `tgapp-shimmer` для skeleton loading
- Приведены размеры, отступы и скругления в соответствие с профилем
- Обновлены цвета кнопок и ошибок
- Добавлены стили для темной темы с `.tg-dark` классом

**Основные изменения стилей:**
```scss
// Было (webapp стиль)
background: var(--tg-surface, #F9FAFB);
color: var(--tg-text, #374151);
gap: 16px;
padding: 16px;

// Стало (tgapp стиль)
background: var(--tg-secondary-bg-color, #f8f9fa);
color: var(--tg-text-color, #000000);
gap: 0.75rem;
padding: 1rem;
```

### 3. Компонент Sheet (`src/components/ui/sheet.tsx`)

**Обновлены стили для поддержки тем:**
- Фон оверлея адаптируется под тему
- Цвета контента используют CSS переменные
- Добавлены границы с адаптивными цветами

### 4. Layout TGAPP (`src/app/tgapp/layout.tsx`)

**Добавлено:**
- Импорт `telegram-adaptive-theme.scss`
- Атрибут `data-theme` для корректной работы CSS переменных

```typescript
import "@/styles/telegram-adaptive-theme.scss";

<div 
  className={`min-h-screen max-w-[600px] mx-auto tg-theme-container ${isDark ? 'tg-dark dark' : 'tg-light'}`}
  data-theme={isDark ? 'dark' : 'light'}
>
```

## Дизайн-система TGAPP

### CSS переменные
```scss
:root {
  /* Основные цвета */
  --tg-bg-color: #ffffff;
  --tg-secondary-bg-color: #f8f9fa;
  --tg-text-color: #000000;
  --tg-hint-color: #999999;
  --tg-link-color: #20C55E;
  --tg-button-color: #20C55E;
  --tg-border-color: #e5e5ea;
  
  /* Тени */
  --tg-shadow-light: 0 1px 3px rgba(0, 0, 0, 0.1);
  --tg-shadow-medium: 0 4px 6px rgba(0, 0, 0, 0.1);
  --tg-shadow-heavy: 0 10px 15px rgba(0, 0, 0, 0.1);
}

.tg-dark {
  /* Темная тема */
  --tg-bg-color: #1c1c1e;
  --tg-secondary-bg-color: rgba(30, 30, 30, 0.6);
  --tg-text-color: rgba(255, 255, 255, 0.9);
  --tg-hint-color: rgba(255, 255, 255, 0.6);
  --tg-border-color: rgba(255, 255, 255, 0.08);
}
```

### Размеры и отступы
- **Скругления**: 12px для карточек, 16px для больших блоков
- **Отступы**: 0.75rem (12px) между элементами, 1rem (16px) внутри карточек
- **Размеры кнопок**: 24x24px для маленьких действий, 40x40px для иконок
- **Шрифты**: 0.875rem для основного текста, 0.75rem для вторичного

### Анимации
- **Skeleton**: `tgapp-shimmer` вместо `pulse`
- **Переходы**: `all 0.2s ease` для быстрых действий, `all 0.3s ease` для общих
- **Hover эффекты**: `translateY(-1px)` для карточек

## Функциональность

### Основные возможности
- **Просмотр подписок**: Список товаров, на которые подписан пользователь
- **Отписка**: Удаление товара из списка ожидания с анимацией
- **Haptic feedback**: Виброотклик при взаимодействии (на поддерживаемых устройствах)
- **Skeleton loading**: Анимированная загрузка в стиле TGAPP
- **Empty state**: Красивое состояние для пустого списка
- **Error handling**: Обработка ошибок с возможностью повтора

### Единый дизайн
- **Карточки**: Такие же как в профиле - скругления 12px, тени, отступы
- **Типографика**: Размеры шрифтов соответствуют профилю
- **Цвета**: Используются переменные TGAPP для полного соответствия
- **Кнопки**: Стиль кнопок совпадает с другими элементами интерфейса
- **Состояния**: Loading, error, empty используют тот же дизайн

### Адаптивность
- Полная поддержка мобильных устройств
- Автоматическое переключение тем
- Плавные анимации и переходы
- Блокировка скролла фона при открытом модальном окне

## Технические детали

### Skeleton Loading
```scss
.skeleton-image {
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
  background-size: 200% 100%;
  animation: tgapp-shimmer 1.5s infinite;
}

.tg-dark .skeleton-image {
  background: linear-gradient(90deg, #161b22 25%, #21262d 50%, #161b22 75%);
}
```

### Карточки товаров
```scss
.subscription-item {
  background: var(--tg-secondary-bg-color, #f8f9fa);
  border-radius: 12px;
  padding: 1rem;
  gap: 0.75rem;
  box-shadow: var(--tg-shadow-light, 0 1px 3px rgba(0, 0, 0, 0.1));
}

.tg-dark .subscription-item {
  background: var(--tg-secondary-bg-color, #2d2d2d);
  backdrop-filter: blur(10px);
}
```

### Интеграция с Telegram
- Использует `useTelegramTheme` для определения темы
- Поддерживает Haptic Feedback API
- Адаптируется под цвета Telegram WebApp

## Использование

1. Откройте профиль в Telegram WebApp
2. Нажмите на карточку "Товары в ожидании"
3. Просматривайте список подписок в едином стиле с профилем
4. Отписывайтесь от товаров кнопкой удаления
5. Закрывайте окно кнопкой или тапом по оверлею

## Совместимость

- ✅ Светлая тема Telegram (полное соответствие дизайну профиля)
- ✅ Темная тема Telegram (полное соответствие дизайну профиля)
- ✅ iOS WebApp
- ✅ Android WebApp
- ✅ Desktop Telegram
- ✅ Haptic Feedback (где поддерживается)

---

**Дата создания**: 2024
**Компоненты**: SubscriptionsSheet, Sheet, TgApp Profile
**Стили**: Единая дизайн-система TGAPP, адаптивные CSS переменные 