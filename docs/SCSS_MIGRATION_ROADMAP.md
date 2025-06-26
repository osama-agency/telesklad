# 🎯 SCSS Migration Roadmap - Поэтапный план

## ✅ **ЭТАП 1 - ЗАВЕРШЕН**
- [x] Создана система точного копирования стилей
- [x] Файл `main-exact.scss` работает стабильно
- [x] Сохранен полный дизайн приложения
- [x] Нет ошибок компиляции

## 🚧 **ЭТАП 2 - АНАЛИЗ И ПОДГОТОВКА** (Текущий)

### 2.1 Анализ использования классов
```bash
# Найти все используемые классы в компонентах
grep -r "className.*main-block" src/app/webapp/
grep -r "className.*action-card" src/app/webapp/
grep -r "className.*no-items" src/app/webapp/
```

### 2.2 Создание карты компонентов
- [ ] Каталог товаров (`/webapp`)
- [ ] Профиль (`/webapp/profile`) 
- [ ] Корзина (`/webapp/cart`)
- [ ] Избранное (`/webapp/favorites`)
- [ ] Заказы (`/webapp/orders`)

### 2.3 Приоритизация миграции
1. **Высокий приоритет**: Часто используемые компоненты
2. **Средний приоритет**: Специфичные страницы
3. **Низкий приоритет**: Редко используемые элементы

## 🎨 **ЭТАП 3 - СОЗДАНИЕ НОВЫХ КОМПОНЕНТОВ**

### 3.1 Модульная архитектура
```scss
src/styles/
├── core/
│   ├── variables.scss     ✅ Создан
│   ├── mixins.scss       ✅ Создан  
│   ├── utilities.scss    ✅ Создан
│   └── reset.scss        ✅ Создан
├── components/
│   ├── product-card.scss ✅ Создан
│   ├── action-cards.scss ✅ Создан
│   ├── header.scss       ✅ Создан
│   ├── search.scss       ✅ Создан
│   └── empty-state.scss  ✅ Создан
├── modules/
│   ├── catalog.scss      ✅ Создан
│   └── profile.scss      ✅ Создан
└── telegram/
    ├── design-system.scss ✅ Создан
    ├── adaptive-theme.scss ✅ Создан
    └── webapp-base.scss   ✅ Создан
```

### 3.2 Namespace система
- `.product-*` для товаров
- `.action-*` для action cards
- `.header-*` для header
- `.search-*` для поиска
- `.profile-*` для профиля
- `.tg-*` для Telegram специфики

## 🔄 **ЭТАП 4 - ПОСТЕПЕННАЯ ЗАМЕНА**

### 4.1 Стратегия замены
1. **Создать новый класс** с namespace
2. **Добавить алиас** в `exact-copy.scss`
3. **Протестировать** визуальное соответствие
4. **Обновить HTML** в компонентах
5. **Убрать алиас** после полной миграции

### 4.2 Пример миграции
```scss
// Старый способ
.main-block { /* стили */ }

// Новый способ  
.product-card { /* те же стили с улучшениями */ }

// Алиас для совместимости
.main-block { @extend .product-card; }
```

## 📊 **ЭТАП 5 - ОПТИМИЗАЦИЯ**

### 5.1 Удаление дублирования
- [ ] Убрать неиспользуемые стили из `webapp.scss`
- [ ] Объединить похожие компоненты
- [ ] Оптимизировать размер CSS

### 5.2 Производительность
- [ ] Минификация CSS
- [ ] Удаление мертвого кода
- [ ] Оптимизация селекторов

## 🎯 **ЭТАП 6 - ПОЛНАЯ МИГРАЦИЯ**

### 6.1 Переход на main-new.scss
```scss
// Финальная версия
@import './core/variables';
@import './core/reset';
@import './core/mixins';
@import './core/utilities';

@import './components/header';
@import './components/search';
@import './components/product-card';
@import './components/action-cards';
@import './components/empty-state';

@import './modules/catalog';
@import './modules/profile';

@import './telegram/design-system';
@import './telegram/adaptive-theme';
@import './telegram/webapp-base';
```

### 6.2 Удаление legacy файлов
- [ ] Убрать `webapp.scss`
- [ ] Убрать `exact-copy.scss`
- [ ] Убрать `main-exact.scss`

## 📈 **МЕТРИКИ УСПЕХА**

### Производительность
- [ ] Размер CSS: < 150KB (сейчас ~200KB)
- [ ] Время компиляции: < 2 сек
- [ ] Время загрузки: < 100ms

### Качество кода
- [ ] 0 дублирований
- [ ] 100% namespace изоляция
- [ ] 0 !important хаков

### Совместимость
- [ ] 100% визуальное соответствие
- [ ] 0 багов дизайна
- [ ] Работа во всех браузерах

## 🛠 **ИНСТРУМЕНТЫ ДЛЯ МИГРАЦИИ**

### Автоматизация
```bash
# Поиск использований классов
npm run find-classes

# Проверка дублирования
npm run check-duplicates

# Валидация CSS
npm run validate-css
```

### Тестирование
- Visual regression тесты
- Lighthouse аудит
- Cross-browser тестирование

---

## 📝 **ТЕКУЩИЙ СТАТУС**

✅ **Этап 1**: Завершен - стабильная база создана  
🚧 **Этап 2**: В процессе - анализ и подготовка  
⏳ **Этап 3-6**: Запланированы

**Следующий шаг**: Анализ использования классов в компонентах 