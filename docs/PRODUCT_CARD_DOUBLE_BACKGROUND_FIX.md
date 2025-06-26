# 🐛 Исправление двойного фона у карточек товаров

## Дата: 2025-01-17

### Описание проблемы
У карточек товаров в каталоге был виден прямоугольный белый фон с острыми углами за основной подложкой со скругленными углами. Это создавало визуальный артефакт, как будто два элемента наложены друг на друга.

### Причина
В файле `webapp-critical.scss` были определены базовые стили для `.product-card`:
```scss
.product-card {
  background: white;
  border-radius: 12px;
  padding: 12px;
  // ...
}
```

Эти стили применялись к контейнеру карточки, а внутри него был `.product-wrapper` со своими скругленными углами и белым фоном. В результате получалось два слоя с разными радиусами скругления.

### Решение

#### 1. Удален фон из webapp-critical.scss
```scss
// Было:
.product-card {
  background: white;
  border-radius: 12px;
  padding: 12px;
  // ...
}

// Стало:
.product-card {
  display: flex;
  flex-direction: column;
  position: relative;
  transition: transform 0.2s ease;
  // Убран background, border-radius и padding
}
```

#### 2. Добавлены стили прозрачности в webapp.scss
```scss
.product-card {
  width: 100%;
  overflow: visible;
  background: transparent;
  border-radius: 0;
  padding: 0;
}
```

#### 3. Финальные переопределения
В конце `webapp.scss` добавлены финальные стили с высоким приоритетом:
```scss
/* Убираем фон у product-card контейнера */
.webapp-container.catalog-page .product-grid .product-card,
.product-catalog:not(.search-page) .product-grid .product-card {
  background: transparent !important;
  border-radius: 0 !important;
  padding: 0 !important;
  box-shadow: none !important;
  border: none !important;
}
```

### Результат
- ✅ Убран белый прямоугольный фон за карточками
- ✅ Виден только один белый фон со скругленными углами от `.product-wrapper`
- ✅ Чистый современный дизайн без визуальных артефактов
- ✅ Тени корректно отображаются вокруг скругленных углов

### Технические детали
- Использован принцип разделения ответственности: `.product-card` - только структура, `.product-wrapper` - визуальное оформление
- Финальные переопределения обеспечивают приоритет над любыми другими стилями
- Сохранена совместимость с поиском Algolia

### Файлы изменены
- `src/styles/webapp-critical.scss` - удалены стили фона
- `src/styles/webapp.scss` - добавлены стили прозрачности и финальные переопределения 