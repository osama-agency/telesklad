# Исправление темного фона под MainButton в Telegram WebApp

## Проблема

В Telegram WebApp кнопка MainButton отображается с правильными цветами (зеленый фон #48C928 с белым текстом), но область под кнопкой остается темной, даже когда приложение принудительно использует светлую тему.

## Причина

MainButton - это нативный элемент Telegram, который отображается в отдельном слое "bottom bar" поверх WebView. Фон этой области контролируется отдельно от основного WebView и не подчиняется CSS стилям приложения.

## Решение

Использован новый метод `setBottomBarColor()`, добавленный в Bot API 7.10+, который специально предназначен для контроля цвета области под MainButton.

### Изменения в коде

#### 1. Обновлены типы TypeScript

Добавлен новый метод и поле темы в `src/types/telegram-webapp.d.ts`:

```typescript
interface TelegramWebAppThemeParams {
  // ... существующие поля
  bottom_bar_bg_color?: string; // Bot API 7.10+
}

interface TelegramWebApp {
  // ... существующие методы
  setBottomBarColor?(color: string): void; // Bot API 7.10+
}
```

#### 2. Обновлен TelegramSDK

В `src/lib/telegram-sdk.ts` добавлен вызов нового метода:

```typescript
setLightTheme() {
  // ... существующий код
  
  // КРИТИЧЕСКИ ВАЖНО: Устанавливаем цвет нижней панели (Bot API 7.10+)
  // Это контролирует фон области под MainButton
  if (tg.setBottomBarColor) {
    tg.setBottomBarColor('#FFFFFF');
    console.log('✅ Цвет нижней панели установлен на белый');
  } else {
    console.warn('⚠️ setBottomBarColor не поддерживается в этой версии Telegram');
  }
  
  // Обновляем themeParams
  if (tg.themeParams) {
    tg.themeParams.bottom_bar_bg_color = '#FFFFFF';
  }
}
```

## Результат

После применения исправления:
- Кнопка MainButton остается зеленой (#48C928) с белым текстом
- Область под кнопкой становится белой вместо темной
- Весь интерфейс имеет единообразную светлую тему

## Совместимость

- **Bot API 7.10+**: Полная поддержка `setBottomBarColor()`
- **Более старые версии**: Метод недоступен, отображается предупреждение в консоли
- **Обратная совместимость**: Обеспечена через опциональный вызов метода

## Техническая информация

- **Метод**: `setBottomBarColor(color: string)`
- **Добавлен в**: Bot API 7.10 (сентябрь 2024)
- **Тип**: Опциональный метод (может отсутствовать в старых версиях)
- **Параметры темы**: `bottom_bar_bg_color` в `themeParams`

## Дополнительные ресурсы

- [Telegram Mini Apps Documentation](https://docs.telegram-mini-apps.com/platform/theming)
- [Bot API 7.10 Changelog](https://core.telegram.org/bots/api#september-6-2024)
- [GitHub Issue #25765](https://github.com/telegramdesktop/tdesktop/issues/25765) - поддержка методов цветов в Telegram Desktop

## Статус

✅ **ИСПРАВЛЕНО** - Темный фон под MainButton заменен на светлый через `setBottomBarColor()`. 