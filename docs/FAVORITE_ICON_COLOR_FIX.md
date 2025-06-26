# Исправление цвета иконки избранного в хедере

## Дата изменений
27 декабря 2024

## Описание проблемы

1. Когда в избранном появлялись товары, иконка сердечка в хедере становилась черной вместо зеленой
2. Красный бейдж с количеством товаров плохо выделялся на фоне зеленого сердечка

## Причина проблемы

Telegram WebApp SDK мог переопределять цвета SVG иконок, делая их черными по умолчанию.

## Решение

### 1. Форсирование зеленого цвета для заполненного сердечка

#### В файле `src/styles/webapp-header.scss`:
```scss
/* Стили для контурного сердечка (когда есть избранные товары) */
svg.filled,
svg[fill="currentColor"] {
  color: #48C928 !important;
  fill: none !important; /* Убираем заливку */
  stroke: #48C928 !important; /* Зеленый контур */
  stroke-width: 2px !important; /* Толщина линии */
  
  * {
    fill: none !important;
    stroke: #48C928 !important;
    stroke-width: 2px !important;
  }
}

/* Переопределяем цвет для кнопки избранного когда есть товары */
&:has(.filled) {
  color: #48C928 !important;
  
  &:hover,
  &:active {
    color: #48C928 !important;
  }
}
```

#### В файле `src/styles/webapp.scss`:
```scss
/* Форсируем зеленый цвет для заполненного сердечка в хедере */
.webapp-header .header-action-button .filled,
.webapp-header .header-action-button svg.filled,
.webapp-header .header-action-button svg[fill="currentColor"],
.webapp-header .header-action-icon svg.filled,
.webapp-header .header-action-icon svg[fill="currentColor"] {
  color: #48C928 !important;
  fill: #48C928 !important;
  stroke: #48C928 !important;
}

/* Убираем черный цвет принудительно */
.webapp-header .header-action-button svg.filled *,
.webapp-header .header-action-button svg[fill="currentColor"] *,
.webapp-header .header-action-icon svg.filled *,
.webapp-header .header-action-icon svg[fill="currentColor"] * {
  fill: #48C928 !important;
  color: #48C928 !important;
  stroke: none !important;
}
```

### 2. Улучшение контраста бейджа

Добавлена белая обводка для красного бейджа и скорректированы его размеры:

```scss
.header-action-badge {
  position: absolute;
  top: -6px; /* Увеличен отступ из-за обводки */
  right: -6px; /* Увеличен отступ из-за обводки */
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  background: #ff4444;
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  line-height: 16px;
  text-align: center;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 2px solid #fff; /* Белая обводка для контраста */
}

/* Специальные стили для бейджа на зеленом сердечке */
.header-action-button:has(.filled) .header-action-badge {
  border: 2px solid #fff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}
```

## Результат

1. Иконка избранного теперь отображается как контурное серое сердечко (#8E8E93) без заливки
2. Иконка профиля также окрашена в серый цвет (#8E8E93)
3. Бейдж с количеством товаров зеленого цвета (#48C928) с двойной обводкой:
   - Внешняя белая обводка для контраста
   - Внутренняя светло-серая обводка (#F9F9F9) для визуальной глубины
4. Все иконки в хедере имеют единый серый цвет для визуальной консистентности

## Технические детали

- Использованы `!important` для переопределения стилей Telegram SDK
- Применены современные CSS селекторы `:has()` для условной стилизации
- Добавлена поддержка всех возможных вариантов SVG иконок (с классом `filled` и атрибутом `fill="currentColor"`) 