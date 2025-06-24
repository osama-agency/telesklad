# Telegram Back Button - Кнопка "Назад"

## Описание

Интеграция нативной кнопки "Назад" из Telegram WebApp SDK для улучшения пользовательского опыта навигации в приложении.

## Компоненты

### 1. TelegramBackButton (Компонент)

Компонент для автоматического управления кнопкой "Назад" на всех страницах.

```tsx
import { TelegramBackButton } from './_components/TelegramBackButton';

// Автоматическое управление
<TelegramBackButton />

// С кастомными параметрами
<TelegramBackButton 
  show={true}
  onBack={() => console.log('Кнопка назад нажата')}
  fallbackPath="/webapp"
/>
```

### 2. useTelegramBackButton (Хук)

Хук для кастомной логики кнопки "Назад" на отдельных страницах.

```tsx
import { useTelegramBackButton } from './_components/TelegramBackButton';

function MyPage() {
  // Базовое использование
  useTelegramBackButton();

  // С кастомной логикой
  useTelegramBackButton({
    onBack: () => {
      // Кастомная логика при нажатии назад
      router.push('/specific-page');
    },
    fallbackPath: '/webapp/catalog'
  });
}
```

## Логика работы

### Автоматическое поведение

1. **Главная страница** (`/webapp`) - кнопка скрыта
2. **Внутренние страницы** - кнопка показана автоматически
3. **По умолчанию** - возврат на предыдущую страницу или `/webapp`

### Поддерживаемые страницы

- ✅ `/webapp/products/[id]` - страница товара
- ✅ `/webapp/cart` - корзина (кастомная логика)
- ✅ `/webapp/favorites` - избранное
- ✅ `/webapp/profile` - профиль
- ✅ `/webapp/orders` - заказы
- ✅ `/webapp/search` - поиск
- ✅ `/webapp/support` - поддержка

## Интеграция

### В Layout (Глобально)

```tsx
// src/app/webapp/layout.tsx
import { TelegramBackButton } from './_components/TelegramBackButton';

export default function WebappLayout({ children }) {
  return (
    <TelegramAuthProvider>
      {/* Глобальная кнопка назад */}
      <TelegramBackButton />
      
      <div className="webapp-container">
        {children}
      </div>
    </TelegramAuthProvider>
  );
}
```

### На отдельных страницах (Кастомная логика)

```tsx
// src/app/webapp/cart/page.tsx
import { useTelegramBackButton } from '../_components/TelegramBackButton';

export default function CartPage() {
  // Кастомная кнопка назад для корзины
  useTelegramBackButton({
    onBack: () => {
      // При выходе из корзины возвращаемся на главную
      window.location.href = '/webapp';
    }
  });

  return <div>Cart content</div>;
}
```

## API Reference

### TelegramBackButtonProps

```typescript
interface TelegramBackButtonProps {
  show?: boolean;           // Показывать кнопку (по умолчанию: true)
  onBack?: () => void;      // Кастомный обработчик нажатия
  fallbackPath?: string;   // Путь по умолчанию (по умолчанию: '/webapp')
}
```

### Telegram WebApp API

Компонент использует следующие методы из Telegram WebApp SDK:

```typescript
// Показать кнопку
window.Telegram.WebApp.BackButton.show();

// Скрыть кнопку
window.Telegram.WebApp.BackButton.hide();

// Добавить обработчик
window.Telegram.WebApp.BackButton.onClick(callback);

// Удалить обработчик
window.Telegram.WebApp.BackButton.offClick(callback);
```

## Особенности реализации

### 1. Автоматическое определение страницы

```typescript
const isMainPage = pathname === '/webapp';
const shouldShow = show && !isMainPage;
```

### 2. Cleanup при размонтировании

```typescript
return () => {
  backButton.offClick(handleBackClick);
  backButton.hide();
};
```

### 3. Fallback для истории браузера

```typescript
if (window.history.length > 1) {
  router.back();
} else {
  router.push(fallbackPath);
}
```

## Типы TypeScript

```typescript
// src/types/telegram-webapp.d.ts
interface TelegramWebAppBackButton {
  isVisible: boolean;
  onClick(callback: () => void): void;
  offClick(callback: () => void): void;
  show(): void;
  hide(): void;
}
```

## Примеры использования

### 1. Страница товара

```tsx
// Автоматически управляется глобальным компонентом
// Возврат на предыдущую страницу (каталог/поиск)
```

### 2. Корзина

```tsx
useTelegramBackButton({
  onBack: () => window.location.href = '/webapp'
});
```

### 3. Форма заказа

```tsx
useTelegramBackButton({
  onBack: () => {
    if (hasUnsavedChanges) {
      showConfirmDialog();
    } else {
      router.back();
    }
  }
});
```

### 4. Отключение кнопки

```tsx
useTelegramBackButton({ show: false });
```

## Совместимость

- ✅ Telegram WebApp SDK 6.0+
- ✅ iOS Telegram
- ✅ Android Telegram  
- ✅ Desktop Telegram
- ⚠️ Graceful fallback для веб-браузеров

## Тестирование

### В Telegram

1. Откройте WebApp в Telegram
2. Перейдите на внутреннюю страницу
3. Проверьте появление кнопки "←" в заголовке
4. Нажмите кнопку и проверьте навигацию

### В браузере

1. Откройте DevTools Console
2. Проверьте отсутствие ошибок
3. Кнопка не будет видна (это нормально)

## Отладка

```typescript
// Проверка доступности API
console.log('Telegram WebApp:', window.Telegram?.WebApp);
console.log('BackButton:', window.Telegram?.WebApp?.BackButton);

// Проверка состояния кнопки
console.log('BackButton visible:', window.Telegram?.WebApp?.BackButton?.isVisible);
``` 