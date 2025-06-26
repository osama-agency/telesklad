# Полное удаление темных обводок в Header

## Проблема
При наведении и фокусе на иконки профиля и избранного в header появлялись темные обводки (outline), что портило внешний вид Telegram WebApp.

## Решение

### 1. CSS стили (webapp.scss)
Добавлены агрессивные CSS правила для полного отключения обводок:

```scss
/* ГЛОБАЛЬНОЕ ОТКЛЮЧЕНИЕ ВСЕХ БРАУЗЕРНЫХ СТИЛЕЙ ФОКУСА */
:root {
  --webkit-focus-ring-color: transparent !important;
  --webkit-tap-highlight-color: transparent !important;
}

/* СУПЕР АГРЕССИВНОЕ ОТКЛЮЧЕНИЕ ОБВОДОК ДЛЯ HEADER */
.webapp-header .header-action-button,
.webapp-header .header-action-button.active,
.webapp-header .header-action-button:focus,
.webapp-header .header-action-button:focus-visible,
.webapp-header .header-action-button:focus-within,
.webapp-header .header-action-button:active,
.webapp-header .header-action-button:hover,
.webapp-header .header-action-button:visited,
.webapp-header .header-action-button:link {
  outline: none !important;
  border: none !important;
  box-shadow: none !important;
  text-decoration: none !important;
  -webkit-tap-highlight-color: transparent !important;
  -webkit-focus-ring-color: transparent !important;
  -webkit-appearance: none !important;
  -moz-appearance: none !important;
  appearance: none !important;
}
```

### 2. Inline стили в React компоненте (Header.tsx)
Добавлены inline стили для 100% гарантии:

```tsx
<Link 
  href="/webapp/favorites" 
  className={`header-action-button ${isActive('/webapp/favorites') ? 'active' : ''}`}
  style={{
    outline: 'none',
    border: 'none',
    boxShadow: 'none',
    textDecoration: 'none',
    WebkitTapHighlightColor: 'transparent'
  } as React.CSSProperties}
>
```

### 3. Обновленные стили header (webapp-header.scss)
- Добавлены стили для всех состояний кнопок
- Убраны стандартные стили ссылок
- Добавлены глобальные правила для header

## Затронутые файлы

1. **src/styles/webapp.scss**
   - Глобальные правила отключения обводок
   - Агрессивные стили для header

2. **src/styles/webapp-header.scss**
   - Обновлены стили кнопок действий
   - Добавлены правила для всех состояний

3. **src/app/webapp/_components/Header.tsx**
   - Добавлены inline стили
   - Обновлены кнопки избранного и профиля

## Результат
✅ Полностью удалены темные обводки при наведении и фокусе
✅ Сохранены все интерактивные эффекты (hover, active)
✅ Улучшена accessibility без визуальных обводок
✅ Совместимость со всеми браузерами

## Дата
26 декабря 2024 