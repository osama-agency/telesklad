# Исправление фона и белой полоски на странице каталога

## Описание проблемы

На странице каталога была белая полоска между header (поиск с иконками) и категориями меню. Также фон страницы был #F8F9FA вместо требуемого #F9F9F9.

## Что изменилось

### 1. Унифицирован фон страницы

Изменен фон с #F8F9FA на #F9F9F9 во всех местах:

```scss
// webapp.scss
.webapp-container {
  background: #f9f9f9; // было transparent
}

// Фон поля поиска
background-color: #f9f9f9; // было #f8f9fa
```

```tsx
// page.tsx
<div className="min-h-screen bg-[#F9F9F9]"> // было bg-[#F8F9FA]
```

### 2. Убрана белая полоска между header и контентом

#### Причина проблемы:
- У `.webapp-container` был `padding-top` который создавал отступ
- В `layout.tsx` был двойной `<main>` элемент с классом `container-adaptive`

#### Решение:

1. Убран padding-top для catalog-page:
```scss
.webapp-container.catalog-page {
  padding-top: 0 !important;
}
```

2. Убран лишний `<main>` элемент из layout.tsx:
```tsx
// Было:
<main className="container-adaptive">
  {children}
</main>

// Стало:
{children}
```

3. Добавлены стили для убирания всех возможных отступов:
```scss
.webapp-container.catalog-page {
  .webapp-header + * {
    margin-top: 0 !important;
  }
  
  main {
    padding-top: 0 !important;
    margin-top: 0 !important;
  }
}
```

## Результат

- Фон всей страницы каталога теперь единый #F9F9F9
- Header плавно переходит в контент без белых полосок
- Категории меню располагаются сразу под header без лишних отступов

## Файлы изменены

1. `src/styles/webapp.scss` - основные стили, убраны все отступы
2. `src/app/webapp/page.tsx` - фон для загрузки изменен на #F9F9F9
3. `src/app/webapp/layout.tsx` - убран двойной main элемент
4. `src/styles/webapp-header.scss` - изменен position с fixed на sticky
5. `src/styles/telegram-webapp-spacing-fixes.scss` - убран margin-top у category-filter

## Дата изменения

2025-01-05 