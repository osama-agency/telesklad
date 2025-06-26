# Упрощение Header компонентов

## Проблема
В проекте было 3 разных header компонента и HeaderProvider для выбора между ними:
- `Header.tsx` (132 строки) - базовый компонент
- `TelegramHeader.tsx` (270 строк) - расширенный с поддержкой Telegram Design
- `TelegramDesignHeader.tsx` (254 строки) - экспериментальный, не использовался
- `HeaderProvider.tsx` - выбирал между компонентами на основе переменной окружения

Это создавало ненужную сложность и дублирование кода.

## Решение

### 1. Удалены лишние компоненты:
- `HeaderProvider.tsx` - больше не нужен
- `Header.tsx` - заменен на TelegramHeader
- `TelegramDesignHeader.tsx` - не использовался
- `TelegramDesignHeader.adaptive.tsx` - не использовался

### 2. Оставлен только `TelegramHeader.tsx`:
- Самый функциональный и полный компонент
- Поддерживает Telegram Design System
- Имеет оптимизированный scroll handler
- Поддерживает haptic feedback
- Адаптивен для low-end устройств

### 3. Упрощен оставшийся компонент:
- Удален параметр `enableDesignSystem` и все связанные проверки
- Оставлена только современная версия с Telegram Design
- Убраны условные стили и логика
- Код стал чище и понятнее (со 270 до ~160 строк)

### 4. Обновлен layout:
```typescript
// Было:
import { HeaderProvider } from "./_components/HeaderProvider";
<HeaderProvider />

// Стало:
import { TelegramHeader } from "./_components/TelegramHeader";
<TelegramHeader />
```

## Результат
- Один единственный header компонент вместо трех
- Нет сложной логики выбора между версиями
- Меньше кода для поддержки
- Проще понимать и модифицировать
- Сохранена вся функциональность

## Конфигурация отображения
Header показывается только на страницах:
- `/webapp` - главная страница каталога
- `/webapp/search` - страница поиска

На остальных страницах header скрыт.

## Дата изменения
28 января 2025 г. 