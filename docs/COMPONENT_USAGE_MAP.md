# 📊 Component Usage Map - Карта использования компонентов

## 🎯 **ПРИОРИТИЗАЦИЯ МИГРАЦИИ**

### 🔴 **ВЫСОКИЙ ПРИОРИТЕТ** (Часто используемые)

#### 1. `.main-block` - Основные блоки контента
**Использование: 12+ экземпляров**
- ✅ `cart/page.tsx` - блок товаров в корзине
- ✅ `orders/page.tsx` - блок заказов  
- ✅ `favorites/page.tsx` - блок избранного
- ✅ `subscriptions/page.tsx` - блоки подписок (2 места)
- ✅ `profile/delivery/page.tsx` - блок доставки
- ✅ `_components/DeliveryForm.tsx` - формы доставки (2 места)
- ✅ `_components/ProfileForm.tsx` - форма профиля

**Стратегия миграции:**
```scss
// Новый namespace
.content-block { /* стили main-block */ }

// Алиас для совместимости  
.main-block { @extend .content-block; }
```

#### 2. `.action-card-*` - Карточки действий
**Использование: 20+ экземпляров**
- ✅ `_components/ActionCards.tsx` - основной компонент
- ✅ Используется на всех страницах профиля
- ✅ Навигационные карточки

**Стратегия миграции:**
```scss
// Новый namespace
.action-* { /* стили action-card-* */ }

// Алиасы сохраняются в exact-copy.scss
```

#### 3. `.no-items-*` - Empty states
**Использование: 6+ экземпляров**
- ✅ `_components/ProductCatalog.tsx` - пустой каталог
- ✅ `_components/OptimizedProductCatalog.tsx` - оптимизированная версия
- ✅ `_components/OptimizedProductGrid.tsx` - сетка товаров

**Стратегия миграции:**
```scss
// Новый namespace
.empty-state-* { /* стили no-items-* */ }
```

### 🟡 **СРЕДНИЙ ПРИОРИТЕТ** (Специфичные страницы)

#### 4. `.card-main-block` - Карточки товаров
**Использование: 1 экземпляр**
- ✅ `products/[id]/page.tsx` - страница товара

#### 5. `.cart-items-block` - Блок товаров корзины
**Использование: 1 экземпляр**
- ✅ `cart/page.tsx` - специфичный блок

### 🟢 **НИЗКИЙ ПРИОРИТЕТ** (Редко используемые)

#### 6. Backup файлы
- ❌ `cart/page.backup.tsx`
- ❌ `cart/page.20250626_132736.backup.tsx` 
- ❌ `backups/` директория

## 📋 **ПЛАН МИГРАЦИИ ПО СТРАНИЦАМ**

### 1. Главная страница (`/webapp`)
- **Компоненты**: ProductCatalog, OptimizedProductCatalog
- **Классы**: `.no-items-wrapper`, `.no-items-title`
- **Приоритет**: 🔴 Высокий

### 2. Профиль (`/webapp/profile`)  
- **Компоненты**: ActionCards, ProfileForm
- **Классы**: `.action-card-*`, `.main-block`
- **Приоритет**: 🔴 Высокий

### 3. Корзина (`/webapp/cart`)
- **Компоненты**: CartItems
- **Классы**: `.main-block`, `.cart-items-block`
- **Приоритет**: 🟡 Средний

### 4. Избранное (`/webapp/favorites`)
- **Компоненты**: FavoritesList
- **Классы**: `.main-block`
- **Приоритет**: 🟡 Средний

### 5. Заказы (`/webapp/orders`)
- **Компоненты**: OrdersList
- **Классы**: `.main-block`
- **Приоритет**: 🟡 Средний

### 6. Товар (`/webapp/products/[id]`)
- **Компоненты**: ProductDetails
- **Классы**: `.card-main-block`
- **Приоритет**: 🟢 Низкий

## 🔄 **ПОРЯДОК МИГРАЦИИ**

### Этап 1: Action Cards (1-2 дня)
1. ✅ Стили уже созданы в `components/action-cards.scss`
2. ✅ Алиасы работают в `exact-copy.scss`
3. 🔄 Обновить HTML классы в `ActionCards.tsx`
4. 🔄 Тестировать визуальное соответствие

### Этап 2: Main Blocks (2-3 дня)
1. 🔄 Создать `.content-block` в новой системе
2. 🔄 Добавить алиас `.main-block`
3. 🔄 Обновить все 12+ использований
4. 🔄 Тестировать на всех страницах

### Этап 3: Empty States (1 день)
1. 🔄 Создать `.empty-state-*` компоненты
2. 🔄 Обновить ProductCatalog компоненты
3. 🔄 Тестировать пустые состояния

### Этап 4: Специфичные блоки (1 день)
1. 🔄 Мигрировать `.card-main-block`
2. 🔄 Мигрировать `.cart-items-block`
3. 🔄 Убрать backup файлы

## 📊 **СТАТИСТИКА**

- **Всего файлов для миграции**: 8 активных
- **Всего классов для замены**: 4 основных
- **Приоритетных компонентов**: 3
- **Расчетное время**: 5-7 дней

## 🎯 **СЛЕДУЮЩИЙ ШАГ**

**Начинаем с Action Cards** - самый используемый и уже готовый компонент! 