# Изменение цвета кнопок категорий на белые

## Описание изменения

По запросу пользователя кнопки категорий в навигации каталога изменены с зеленого фона на белый фон с зеленым текстом и границей.

## Визуальные изменения

### До (зеленые кнопки):
- **Неактивные кнопки**: зеленый фон, белый текст
- **Активная кнопка**: насыщенный зеленый фон, белый текст
- **Hover**: более насыщенный зеленый фон

### После (белые кнопки):
- **Неактивные кнопки**: белый фон, зеленый текст, зеленая граница
- **Активная кнопка**: зеленый фон, белый текст (без изменений)
- **Hover**: легкий зеленый фон, более темная зеленая граница

## Технические изменения

### 1. Основные стили кнопок (.catalog-nav li button)

#### Изменено:
```scss
/* БЫЛО */
border: none;
color: white;
background: rgba(72, 201, 40, 0.8);

/* СТАЛО */
border: 2px solid rgba(72, 201, 40, 0.3);
color: #48C928;
background: white;
```

### 2. Активное состояние (.catalog-nav li button.active)

#### Изменено:
```scss
/* БЫЛО */
.catalog-nav li button.active {
  background: #48C928;
  color: white;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(72, 201, 40, 0.3);
}

/* СТАЛО */
.catalog-nav li button.active {
  background: #48C928;
  color: white;
  font-weight: 600;
  border-color: #48C928; /* Добавлена цветная граница */
  box-shadow: 0 2px 8px rgba(72, 201, 40, 0.3);
}
```

### 3. Hover эффект (.catalog-nav li button:not(.active):hover)

#### Изменено:
```scss
/* БЫЛО */
.catalog-nav li button:not(.active):hover {
  background: rgba(72, 201, 40, 0.9);
  transform: translateY(-1px);
}

/* СТАЛО */
.catalog-nav li button:not(.active):hover {
  background: rgba(72, 201, 40, 0.1);
  border-color: rgba(72, 201, 40, 0.5);
  transform: translateY(-1px);
}
```

## Полный код стилей

```scss
/* Minimalist Category Navigation Buttons */
.catalog-nav li button {
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  font-size: clamp(13px, 3vw, 14px);
  border: 2px solid rgba(72, 201, 40, 0.3);
  color: #48C928;
  border-radius: clamp(8px, 2vw, 10px);
  padding: clamp(6px, 1.5vw, 8px) clamp(12px, 3vw, 16px);
  min-height: 32px;
  text-decoration: none;
  white-space: nowrap;
  scroll-snap-align: start;
  cursor: pointer;
  transition: all 0.2s ease;
  
  /* Белый фон для всех кнопок */
  background: white;
  
  /* Touch feedback */
  &:active {
    transform: scale(0.95);
    transition-duration: 0.1s;
  }
}

/* Активное состояние - зеленый фон, белый текст */
.catalog-nav li button.active {
  background: #48C928;
  color: white;
  font-weight: 600;
  border-color: #48C928;
  box-shadow: 0 2px 8px rgba(72, 201, 40, 0.3);
}

/* Hover эффект для неактивных кнопок */
.catalog-nav li button:not(.active):hover {
  background: rgba(72, 201, 40, 0.1);
  border-color: rgba(72, 201, 40, 0.5);
  transform: translateY(-1px);
}
```

## Файлы изменены

- `src/styles/webapp.scss` - обновлены стили категорий навигации (строки 393-430)

## Дизайн принципы

### ✅ Улучшена контрастность
- Белый фон лучше контрастирует с содержимым
- Зеленый текст хорошо читается на белом фоне

### ✅ Сохранена акцентная кнопка
- Активная категория остается выделенной зеленым фоном
- Четкое визуальное разделение активного/неактивного состояния

### ✅ Плавные переходы
- Hover эффекты показывают интерактивность
- Легкий зеленый фон при наведении

### ✅ Адаптивность
- Все размеры остались адаптивными
- Touch-friendly для мобильных устройств

## Цветовая схема

- **Основной зеленый**: `#48C928`
- **Граница неактивных**: `rgba(72, 201, 40, 0.3)`
- **Граница при hover**: `rgba(72, 201, 40, 0.5)`
- **Фон при hover**: `rgba(72, 201, 40, 0.1)`
- **Белый фон**: `white`

## Совместимость

- ✅ Safari (iOS/macOS)
- ✅ Chrome (Android/Desktop)
- ✅ Firefox
- ✅ Edge  
- ✅ Telegram WebApp

## Откат изменений (при необходимости)

Для отката можно восстановить резервную копию:
```bash
cp src/styles/webapp.scss.backup src/styles/webapp.scss
```

Дата изменения: 2024-12-30  
Автор: Claude AI Assistant
