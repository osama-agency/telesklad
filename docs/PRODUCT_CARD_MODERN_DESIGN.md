# 🎨 Современный дизайн карточек товаров

## Дата: 2025-01-17

### Описание проблемы
Карточки товаров в каталоге использовали устаревший glassmorphism дизайн с прозрачными фонами и сложными эффектами, что ухудшало читаемость и общий UX. Требовалось обновить дизайн на более современный и чистый.

### Требования
- Светлая подложка bg-white с мягкой тенью
- Скругления rounded-2xl (адаптивные для мобильных)
- Увеличенные внутренние отступы для воздуха
- Видимые тени без обрезания (overflow-visible)
- Учет UX для мобильных устройств

### Решение

#### 1. Обновлен основной стиль карточек (.product-wrapper)
```scss
.product-wrapper {
  /* Clean White Background */
  background: #ffffff;
  
  /* Modern Border with subtle color */
  border: 1px solid rgba(0, 0, 0, 0.06);
  
  /* Adaptive Border Radius */
  border-radius: clamp(12px, 3vw, 20px);
  
  /* Modern Shadow Stack */
  box-shadow: 
    0 4px 16px rgba(0, 0, 0, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04),
    var(--product-hover-shadow, 0 0 0 0 transparent);
  
  /* Generous Padding */
  padding: clamp(16px, 4vw, 24px);
  
  /* Ensure shadows are visible */
  overflow: visible;
}
```

#### 2. Упрощены интерактивные состояния
- **Hover**: Подъем на 3px с усиленными тенями
- **Active**: Масштабирование до 0.98 с уменьшенными тенями
- **Out-of-stock**: Серый фон #f8f8f8 с приглушенными тенями

#### 3. Обновлена сетка товаров
```scss
.product-grid {
  gap: clamp(12px, 3vw, 20px); /* Увеличен gap */
  padding: 4px; /* Padding для теней */
  overflow: visible;
}
```

### Результат
- ✅ Современный минималистичный дизайн
- ✅ Отличная читаемость на всех устройствах
- ✅ Видимые тени без обрезания по краям
- ✅ Больше "воздуха" между элементами
- ✅ Плавные анимации и переходы
- ✅ Адаптивность для мобильных устройств

### Технические детали
- Использованы только Tailwind-совместимые значения
- clamp() функции для адаптивности
- CSS переменные для гибкости
- overflow: visible на всех уровнях для теней

### Обновление от 2025-01-17
#### Исправление двойного фона
Обнаружена и исправлена проблема с двойным фоном у карточек:
- Удален белый фон из `.product-card` в `webapp-critical.scss`
- Добавлен `background: transparent` для контейнера
- Теперь виден только один белый фон от `.product-wrapper`
- Детали в [PRODUCT_CARD_DOUBLE_BACKGROUND_FIX.md](./PRODUCT_CARD_DOUBLE_BACKGROUND_FIX.md)

### Файлы изменены
- `src/styles/webapp.scss` - основные стили карточек
- `src/styles/webapp-catalog-optimization.scss` - оптимизация контейнеров
- `src/styles/webapp-critical.scss` - удалены конфликтующие стили

### Скриншоты
До: Glassmorphism с прозрачными фонами и сложными эффектами
После: Чистый белый фон с мягкими тенями и современным дизайном 