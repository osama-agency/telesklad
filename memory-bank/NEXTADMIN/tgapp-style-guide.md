# TGAPP Style Guide & Architecture

## 🎯 ТЕКУЩИЙ ПРОЕКТ: /tgapp
- **Основной проект:** `/tgapp` - новое Telegram WebApp приложение
- **Устаревший проект:** `/webapp` - будет удален в будущем
- **Фокус разработки:** Все новые функции только в `/tgapp`

## 🎨 ОБЯЗАТЕЛЬНЫЙ СТИЛЬ TGAPP

### Цветовая схема
- **Основные цвета:** bg-green-500, text-green-600, bg-telegram-primary
- **Фон:** bg-gray-50 (светлая тема), bg-gray-900 (темная тема)
- **Текст:** text-gray-900 (светлая), text-gray-200 (темная)
- **Границы:** border-gray-100 (светлая), border-gray-700 (темная)

### UI Компоненты
- **Кнопки:** rounded-lg, активные состояния с active:scale-95
- **Карточки:** rounded-xl, shadow-sm, border border-gray-100
- **Анимации:** transition-all duration-200
- **Состояния загрузки:** animate-pulse

## 🏗️ АРХИТЕКТУРНЫЕ ПРИНЦИПЫ

### Структура файлов
- **Компоненты:** `src/app/tgapp/_components/`
- **Страницы:** `src/app/tgapp/[page]/`
- **Стили:** `src/app/tgapp/styles/`

### Импорты
- ✅ **ПРАВИЛЬНО:** `import { Component } from "./_components/Component"`
- ❌ **НЕПРАВИЛЬНО:** `import { Component } from "../../webapp/_components/Component"`
- ❌ **НЕПРАВИЛЬНО:** `import { Component } from "../../.webapp/_components/Component"`

### API и данные
- **API:** Используем общие `/api/webapp/*` endpoints
- **localStorage ключи:** 
  - Корзина: `'webapp_cart'`
  - Избранное: `'tgapp_favorites'`

## 🎮 TELEGRAM WEBAPP ИНТЕГРАЦИЯ

### Обязательные компоненты
- **TelegramAuthProvider** - аутентификация через Telegram
- **FavoritesProvider** - управление избранными товарами
- **Haptic feedback** - тактильная обратная связь для всех кнопок

### UX Принципы
- **Оптимистичные обновления:** UI меняется мгновенно, затем API вызов
- **Haptic feedback:** Для всех интерактивных элементов
- **Анимации:** Плавные переходы между состояниями
- **Адаптивность:** Приоритет мобильным устройствам

## 🔧 КЛЮЧЕВЫЕ КОМПОНЕНТЫ

### FavoriteButton
- Оптимистичные обновления состояния
- Haptic feedback при нажатии
- Анимация сердечка (пустое ↔ красное)

### ProductActionButton
- Условный рендер: AddToCartButton (в наличии) или SubscribeButton (нет в наличии)
- Haptic feedback для всех действий

### AddToCartButton
- Quantity stepper с long press поддержкой
- Мгновенные UI обновления
- localStorage синхронизация

## 🚨 ВАЖНЫЕ ПРАВИЛА

1. **НЕ импортируй из webapp** - все компоненты должны быть независимыми
2. **Используй зеленую цветовую схему** - это фирменный стиль tgapp
3. **Добавляй haptic feedback** - обязательно для всех кнопок
4. **Оптимистичные обновления** - UI сначала, API потом
5. **Следуй Telegram WebApp гайдлайнам** - ready(), expand(), haptic feedback

## 📝 ПРОМТ ДЛЯ РАЗРАБОТКИ

При любой задаче добавляй фразу: **"Следуй стилю tgapp"** или **"Сохрани консистентность с новым приложением"**

Это автоматически применит все вышеуказанные принципы.

## 🗂️ АРХИТЕКТУРА ПРОЕКТА

```
/tgapp/
├── _components/           # Независимые компоненты
│   ├── FavoriteButton.tsx
│   ├── ProductActionButton.tsx
│   ├── AddToCartButton.tsx
│   ├── SubscribeButton.tsx
│   └── ...
├── catalog/              # Каталог товаров
├── products/[id]/        # Карточка товара
├── favorites/            # Избранные товары
├── profile/              # Профиль пользователя
├── cart/                 # Корзина
└── styles/               # Стили приложения
```

## 🎨 CSS КЛАССЫ СТИЛЯ TGAPP

```css
/* Основные цвета */
.tgapp-primary { @apply bg-green-500 text-white; }
.tgapp-secondary { @apply bg-gray-100 text-gray-900; }
.tgapp-accent { @apply bg-telegram-primary text-white; }

/* Кнопки */
.tgapp-button { @apply rounded-lg py-2.5 px-4 font-medium transition-all duration-200 active:scale-95; }
.tgapp-button-primary { @apply bg-green-500 hover:bg-green-600 text-white; }

/* Карточки */
.tgapp-card { @apply rounded-xl shadow-sm border border-gray-100 bg-white; }
.tgapp-card-dark { @apply bg-gray-800 border-gray-700; }
```

---

**Дата создания:** 27.12.2024  
**Статус:** Активный проект  
**Следующие шаги:** Постепенная миграция всех функций из `/webapp` в `/tgapp` 