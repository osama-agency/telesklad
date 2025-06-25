# Исправление скроллбаров в Action Cards

## Проблема
После изменений в профиле пользователя стали появляться лишние скроллбары у action cards.

## Причина
В файле стилей `src/styles/webapp.scss` было глобальное правило:

```scss
.webapp-container.profile-page,
.webapp-container.profile-page * {
  overflow-x: hidden;
}
```

Селектор `*` применял `overflow-x: hidden` ко всем элементам страницы профиля, что приводило к появлению вертикальных скроллов при малейшем переполнении по ширине.

## Решение
Убрал глобальный селектор `*` и заменил его на точечные стили:

```scss
/* Action cards должны отображаться без скроллов */
.profile-page .action-cards-container {
  overflow: visible;
}

.profile-page .action-card {
  overflow: visible;
}

.profile-page .action-card-footer {
  overflow: visible;
}

/* Основной контейнер профиля - точечный подход к overflow */
.webapp-container.profile-page {
  overflow-x: hidden;
  overflow-y: hidden;
}

.profile-content-stack {
  overflow-y: auto;
  overflow-x: hidden;
}
```

## Результат
- Убраны лишние скроллбары у action cards
- Сохранена структура профиля без горизонтального скролла
- Правильное отображение карточек с многострочным текстом

## Файлы изменены
- `src/styles/webapp.scss` - исправлены стили overflow

Дата: $(date +"%Y-%m-%d %H:%M:%S")
