# План полной миграции на Catalyst UI Kit + Tailwind CSS Plus

## 🎯 **Цель**
Полностью заменить все компоненты на профессиональные из Catalyst UI Kit и Tailwind CSS Plus для создания единого современного дизайна.

## 🗂 **Структура новых компонентов**

### 📂 **Catalyst Components** (`src/components/catalyst/`)
- `Button.tsx` - Базовая кнопка из Catalyst
- `Input.tsx` - Поле ввода
- `Card.tsx` - Карточки товаров
- `Badge.tsx` - Индикаторы и значки
- `Dialog.tsx` - Модальные окна
- `Dropdown.tsx` - Выпадающие меню
- `Avatar.tsx` - Аватары пользователей
- `Text.tsx` - Типографика
- `Heading.tsx` - Заголовки

### 🛒 **Tailwind Plus Components** (`src/components/ecommerce/`)
- `ProductGrid.tsx` - Сетка товаров
- `ProductCard.tsx` - Карточка товара
- `ShoppingCart.tsx` - Корзина покупок
- `CheckoutForm.tsx` - Форма оформления заказа
- `UserProfile.tsx` - Профиль пользователя
- `OrderHistory.tsx` - История заказов
- `CategoryNavigation.tsx` - Навигация по категориям
- `SearchResults.tsx` - Результаты поиска

### 📱 **Telegram WebApp Components** (`src/components/telegram/`)
- `TelegramLayout.tsx` - Основной layout
- `TelegramHeader.tsx` - Header с поиском
- `TelegramNavigation.tsx` - Нижняя навигация
- `TelegramButton.tsx` - Кнопки в стиле Telegram
- `HapticFeedback.tsx` - Тактильная обратная связь

## 🚀 **Этапы миграции**

### **Этап 1: Подготовка**
1. ✅ Создать структуру папок
2. ✅ Скопировать Catalyst компоненты
3. ✅ Адаптировать для Next.js
4. ✅ Настроить импорты

### **Этап 2: Базовые компоненты**
1. 🔄 Заменить все Button на Catalyst Button
2. 🔄 Заменить Input компоненты
3. 🔄 Обновить Card компоненты
4. 🔄 Заменить Badge и индикаторы

### **Этап 3: Ecommerce компоненты**
1. 🔄 Создать новый ProductGrid из Tailwind Plus
2. 🔄 Обновить ProductCard с современным дизайном
3. 🔄 Переделать корзину покупок
4. 🔄 Обновить форму checkout

### **Этап 4: Telegram интеграция**
1. 🔄 Адаптировать компоненты под Telegram WebApp
2. 🔄 Добавить зелёную цветовую схему
3. 🔄 Интегрировать haptic feedback
4. 🔄 Оптимизировать для мобильных устройств

### **Этап 5: Очистка**
1. 🔄 Удалить старые компоненты
2. 🔄 Очистить неиспользуемые стили
3. 🔄 Обновить импорты
4. 🔄 Протестировать функциональность

## 🎨 **Дизайн-система**

### **Цветовая схема**
- **Активные элементы**: `bg-green-500` (#22c55e) - стиль Telegram
- **Фон**: `bg-gray-50` (#ffffff) - светлый
- **Текст**: `text-gray-900` для основного, `text-gray-600` для второстепенного
- **Границы**: `border-gray-200`

### **Типографика**
- **Шрифт**: Inter (уже настроен)
- **Заголовки**: Catalyst Heading компонент
- **Текст**: Catalyst Text компонент
- **Размеры**: sm, base, lg, xl, 2xl

### **Компоненты**
- **Кнопки**: Rounded, с тенями, зелёные для primary
- **Карточки**: Белый фон, тени, скруглённые углы
- **Поля ввода**: Современный дизайн с focus состояниями
- **Навигация**: Горизонтальный скролл с pill кнопками

## 📋 **Компоненты для замены**

### **Удалить полностью:**
- `ActionCards.tsx` и все варианты
- `BonusBlock.tsx`
- `DeliveryForm.tsx` (заменить на Catalyst формы)
- `SearchComponent.tsx` (заменить на Tailwind Plus)
- `AlgoliaSearchPage.tsx` (уже заменено на MiniSearch)
- Все skeleton компоненты (заменить на Catalyst)

### **Переписать с Catalyst:**
- `TelegramHeader.tsx`
- `CategoriesMenu.tsx`
- `ProductGrid.tsx`
- `CartItemComponent.tsx`
- `ProfileForm.tsx`
- `ReviewForm.tsx`

### **Адаптировать из Tailwind Plus:**
- Списки товаров
- Карточки товаров
- Формы checkout
- Профиль пользователя
- Корзина покупок

## 🛠 **Технические требования**

### **Зависимости**
- React 18+ ✅
- Next.js 15+ ✅
- Tailwind CSS ✅
- Headless UI (из Catalyst)
- Framer Motion (для анимаций)

### **Совместимость**
- Telegram WebApp API ✅
- Touch устройства ✅
- Мобильные браузеры ✅
- Haptic feedback ✅

## 📊 **Ожидаемые результаты**

### **Улучшения**
- 🎨 Единый профессиональный дизайн
- 📱 Лучшая адаптивность
- ⚡ Улучшенная производительность
- 🔧 Лёгкая поддержка и развитие
- 🎯 Соответствие современным стандартам

### **Метрики**
- Уменьшение количества компонентов на 60%
- Унификация дизайна на 100%
- Улучшение UX на основе профессиональных паттернов
- Ускорение разработки новых функций

---

**Начинаем с Этапа 1: Подготовка структуры и копирование Catalyst компонентов** 