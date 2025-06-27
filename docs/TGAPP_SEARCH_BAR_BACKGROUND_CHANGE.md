# TgApp Search Bar Background Change

## Изменения

Изменен цвет фона поисковой строки в светлой теме на странице каталога `/tgapp/catalog`

### Что было сделано:

1. В файле `/src/app/tgapp/styles/catalog.css` изменен фон для `.tgapp-search-bar`:
   - Старый фон: `var(--tg-secondary-bg-color)` (который равен `#f8f9fa`)
   - Новый фон: `#F6F9FC !important`

2. Добавлен `!important` для обеспечения приоритета стиля

### Измененный код:

```css
/* Search Bar */
.tgapp-search-bar {
  background: #F6F9FC !important;
  /* остальные стили... */
}

.tg-dark .tgapp-search-bar {
  background: var(--tg-secondary-bg-color) !important;
  /* темная тема сохраняет свой фон */
}
```

## Проверка изменений

1. **Очистите кэш браузера**:
   - Mac: Cmd + Shift + R
   - Windows/Linux: Ctrl + Shift + R

2. **Перезапустите сервер разработки**:
   ```bash
   pkill -f "next dev" && PORT=3000 npm run dev
   ```

3. **Откройте страницу каталога**:
   - https://strattera.ngrok.app/tgapp/catalog

4. **Проверьте в DevTools**:
   - Откройте инспектор элементов
   - Найдите элемент с классом `tgapp-search-bar`
   - Убедитесь, что применен стиль `background: #F6F9FC !important`

## Возможные проблемы

Если изменения все еще не видны:

1. **Проверьте, что CSS файл загружается**:
   - В DevTools → Network → проверьте, что catalog.css загружается
   - Проверьте содержимое файла в Sources

2. **Убедитесь, что нет ошибок в консоли**

3. **Проверьте, что вы на правильной странице**:
   - URL должен быть `/tgapp/catalog`
   - Не `/webapp/catalog`

## Результат

Поисковая строка в светлой теме теперь имеет фон цвета `#F6F9FC` вместо более темного `#f8f9fa`. 