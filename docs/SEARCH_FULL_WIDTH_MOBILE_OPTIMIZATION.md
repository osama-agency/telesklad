# Оптимизация поиска для мобильных устройств в Telegram WebApp

## Описание изменений

Выполнена полная оптимизация поискового компонента для мобильных устройств с фокусом на Telegram WebApp:

### 1. Полная ширина экрана
- Поиск теперь занимает всю ширину экрана на странице каталога
- Использована техника `left: 50%; margin-left: -50vw; width: 100vw` для выхода за границы родительского контейнера
- Добавлены safe-area отступы для iPhone с notch

### 2. Улучшенные стили поискового поля

**Файл**: `src/styles/algolia-modern-search-light.scss`

#### Основные улучшения:
- **Touch-friendly размеры**: минимальная высота 48px (52px в full-width режиме)
- **Современный дизайн**: серый фон (#f8f9fa) с переходом в белый при фокусе
- **Увеличенные радиусы**: от 14px до 20px для более современного вида
- **Улучшенные тени**: более мягкие тени с зеленым акцентом при фокусе
- **Системные шрифты**: использование SF Pro Display для iOS

#### Адаптивные размеры:
```scss
.algolia-search-box {
  min-height: 48px; /* Базовый размер */
  border-radius: clamp(14px, 3.5vw, 18px);
  
  .catalog-header.full-width & {
    min-height: 52px; /* Увеличенный для каталога */
    border-radius: clamp(16px, 4vw, 20px);
  }
}
```

### 3. Оптимизированное поле ввода

#### Мобильные оптимизации:
- **Предотвращение zoom на iOS**: font-size: 16px
- **Убрана подсветка tap**: -webkit-tap-highlight-color: transparent
- **Улучшенная типографика**: SF Pro Display, font-weight: 500
- **Увеличенные отступы**: больше места для пальцев

#### Специальные стили для Telegram WebApp:
```scss
.catalog-header.full-width .search-input {
  padding: clamp(16px, 4vw, 18px) clamp(52px, 13vw, 56px);
  font-size: clamp(16px, 4vw, 17px);
  font-weight: 500;
}
```

### 4. Улучшенное выпадающее меню

#### Мобильные адаптации:
- **Увеличенная высота**: до 70vh на мобильных
- **Современные радиусы**: до 24px на маленьких экранах
- **Backdrop blur**: эффект размытия фона
- **Улучшенные тени**: более глубокие тени для лучшего восприятия

#### Адаптивная высота:
```scss
.search-dropdown {
  max-height: 60vh; /* Базовая */
  
  .catalog-header.full-width & {
    max-height: 65vh; /* Для каталога */
  }
  
  @media (max-width: 480px) {
    max-height: 70vh; /* Мобильные */
  }
}
```

### 5. Структура стилей каталога

**Файл**: `src/styles/webapp.scss`

#### Полная ширина экрана:
```scss
.catalog-header.full-width {
  /* Техника выхода за границы родителя */
  position: relative;
  left: 50%;
  right: 50%;
  margin-left: -50vw;
  margin-right: -50vw;
  width: 100vw;
  
  /* Safe area для iPhone */
  padding-left: max(env(safe-area-inset-left), clamp(16px, 4vw, 20px));
  padding-right: max(env(safe-area-inset-right), clamp(16px, 4vw, 20px));
}
```

## Технические особенности

### 1. Viewport адаптация
- Использование `100vw` для полной ширины
- Safe area insets для iPhone с notch
- Clamp() функции для плавного масштабирования

### 2. Touch оптимизации
- Минимальные размеры 48px для touch targets
- Убрана подсветка tap на WebKit
- Touch-action: manipulation для лучшего отклика

### 3. Производительность
- Backdrop-filter с hardware acceleration
- Оптимизированные анимации с cubic-bezier
- Z-index: 1000 для правильного наложения

### 4. Кроссбраузерность
- Префиксы для WebKit
- Fallback для старых браузеров
- Системные шрифты с fallback

## Результат

✅ **Поиск занимает всю ширину экрана**  
✅ **Оптимизирован для touch интерфейса**  
✅ **Современный дизайн в стиле iOS**  
✅ **Плавные анимации и переходы**  
✅ **Адаптивность для всех размеров экрана**  
✅ **Специальная оптимизация для Telegram WebApp**

Поиск теперь выглядит как нативный компонент iOS приложения с идеальной адаптацией для мобильных устройств.