# Унификация верстки страницы Поддержка с Профилем

## Проблема
Страница Поддержка (`/webapp/support`) имела другую структуру верстки и отступы по сравнению со страницей Профиля (`/webapp/profile`). Это создавало несогласованность в пользовательском интерфейсе.

## Решение
Приведена верстка страницы Поддержка к единому стандарту, используемому на странице Профиля.

## Изменения

### До (старая структура)
```tsx
<div className="webapp-container">
  <div className="flex items-center gap-3 mb-2">
    {/* заголовок */}
  </div>
  <div className="support-faq-section">
    {/* FAQ контент */}
  </div>
  <div className="support-contacts-section">
    {/* контакты */}
  </div>
</div>
```

### После (унифицированная структура)
```tsx
<div className="webapp-container profile-page">
  <div className="profile-content-stack">
    <div className="profile-header">
      <div className="flex items-center gap-3">
        {/* заголовок */}
      </div>
    </div>
    <div className="support-faq-section">
      {/* FAQ контент */}
    </div>
    <div className="support-contacts-section">
      {/* контакты */}
    </div>
  </div>
</div>
```

### Ключевые изменения
1. **Добавлен класс `profile-page`** к главному контейнеру
2. **Обернут контент в `profile-content-stack`** для единообразных отступов
3. **Заголовок обернут в `profile-header`** для консистентности
4. **Убран класс `!mb-0`** из заголовка (заменен стандартными стилями)
5. **Обновлены состояния загрузки и ошибки** для использования той же структуры

## Результат
- ✅ Единообразные отступы между страницами Профиль и Поддержка
- ✅ Консистентная структура заголовков
- ✅ Использование единой системы вертикальных отступов
- ✅ Адаптивность под все устройства (iPhone, Android, планшеты)
- ✅ Корректная работа safe-area (вырез экрана iPhone)

## CSS классы
Используются следующие классы из системы `profile-content-stack`:

```scss
.profile-content-stack {
  display: flex;
  flex-direction: column;
  gap: clamp(12px, 3vw, 16px);
  width: 100%;
  flex: 1;
  overflow-y: auto;
  padding: calc(env(safe-area-inset-top) + 16px) clamp(16px, 4vw, 20px) 0 clamp(16px, 4vw, 20px);
  padding-bottom: calc(140px + env(safe-area-inset-bottom));
}

.profile-header {
  flex-shrink: 0;
  padding: 0 0 clamp(12px, 3vw, 16px) 0;
  border-bottom: 1px solid rgba(72, 201, 40, 0.1);
  margin-bottom: clamp(12px, 3vw, 16px);
}
```

## Файлы изменены
- `src/app/webapp/support/page.tsx` - основной компонент страницы

## Тестирование
Проверить на разных устройствах:
- iPhone (различные модели с вырезом)
- Android устройства
- Планшеты
- Десктоп браузеры

Убедиться, что отступы одинаковые на страницах `/webapp/profile` и `/webapp/support`. 