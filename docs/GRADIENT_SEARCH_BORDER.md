# Градиентная обводка поисковых полей

## 📋 Описание

Реализована градиентная обводка для всех поисковых полей в Telegram WebApp, соответствующая стилю кнопок "В корзину" для создания единообразного дизайна.

## 🎯 Цель

- Создать визуальную согласованность между поисковыми полями и кнопками действий
- Использовать фирменный градиент во всех интерактивных элементах
- Улучшить пользовательский опыт через единый стиль дизайна

## 🎨 Градиент

Используется тот же градиент, что и в кнопках "В корзину":
```scss
linear-gradient(135deg, #48C928 0%, #3AA120 100%)
```

## 🔧 Внесенные изменения

### 1. Основное поисковое поле (.header-search input)

**Было:**
```scss
&:focus {
  border-color: #48C928;
  background-color: white;
  box-shadow: 0 0 0 3px rgba(72, 201, 40, 0.1);
}
```

**Стало:**
```scss
&:focus {
  border: 2px solid transparent;
  background: linear-gradient(white, white) padding-box,
              linear-gradient(135deg, #48C928 0%, #3AA120 100%) border-box;
  box-shadow: 0 0 0 3px rgba(72, 201, 40, 0.1);
}
```

### 2. Альтернативное поле поиска (.search-field)

**Было:**
```scss
&:focus-within {
  background: #fff;
  border-color: #48C928;
  box-shadow: 0 0 0 3px rgba(72, 201, 40, 0.1);
  transform: translateY(-1px);
}
```

**Стало:**
```scss
&:focus-within {
  border: 2px solid transparent;
  background: linear-gradient(#fff, #fff) padding-box,
              linear-gradient(135deg, #48C928 0%, #3AA120 100%) border-box;
  box-shadow: 0 0 0 3px rgba(72, 201, 40, 0.1);
  transform: translateY(-1px);
}
```

### 3. Поиск в оверлее (.search-input-wrapper)

**Было:**
```scss
&:focus-within {
  background: #fff;
  border-color: #48C928;
  box-shadow: 0 0 0 3px rgba(72, 201, 40, 0.1);
}
```

**Стало:**
```scss
&:focus-within {
  border: 2px solid transparent;
  background: linear-gradient(#fff, #fff) padding-box,
              linear-gradient(135deg, #48C928 0%, #3AA120 100%) border-box;
  box-shadow: 0 0 0 3px rgba(72, 201, 40, 0.1);
}
```

### 4. Иконка поиска

**Было:**
```scss
&:focus-within .search-icon {
  color: #48C928;
}
```

**Стало:**
```scss
&:focus-within .search-icon {
  background: linear-gradient(135deg, #48C928 0%, #3AA120 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

## 💡 Техническая реализация

### Градиентная обводка

Для создания градиентной обводки используется техника с двумя фонами:
- `padding-box` - внутренний фон поля (белый)
- `border-box` - внешний фон для создания градиентной обводки

### Прозрачная граница

```scss
border: 2px solid transparent;
```
Позволяет фону `border-box` проявиться как обводка.

### Кроссбраузерность

Градиент в тексте иконки поддерживается:
- `-webkit-background-clip: text` - для WebKit браузеров
- `background-clip: text` - стандартное свойство

## 🔄 Обратная совместимость

- Все существующие поисковые поля обновлены
- Сохранены все анимации и эффекты наведения
- Box-shadow остался без изменений для согласованности

## 📱 Адаптивность

Градиентная обводка работает на всех размерах экранов:
- Мобильные устройства (320px+)
- Планшеты (768px+)
- Десктоп (1024px+)

## ✅ Результаты

1. **Визуальная согласованность** - все поисковые поля используют фирменный градиент
2. **Единый стиль** - соответствие кнопкам "В корзину" и активным элементам
3. **Улучшенный UX** - пользователи видят последовательный дизайн
4. **Современный вид** - градиентные обводки создают премиальное ощущение

## 🔧 Файлы изменены

- `src/styles/webapp.scss` - основные стили поисковых полей

---

Градиентная обводка поисковых полей создает цельный визуальный опыт и подчеркивает принадлежность всех элементов к единой дизайн-системе NEXTADMIN. 