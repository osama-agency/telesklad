# 🧪 Руководство по тестированию WebApp кнопок в Telegram

## 🎯 Проблема
WebApp кнопки работают **ТОЛЬКО в приватных чатах** между пользователем и ботом. В групповых чатах они автоматически становятся обычными URL кнопками.

## 📋 Шаги для тестирования

### 1. Узнайте свой Telegram ID
Отправьте любое сообщение боту @userinfobot в приватном чате. Он вернет ваш ID (например: `123456789`).

### 2. Отправьте тестовый заказ в приватный чат
```bash
curl -X POST http://localhost:3011/api/purchases/test-webapp/ВАШ_TELEGRAM_ID
```

Пример:
```bash
curl -X POST http://localhost:3011/api/purchases/test-webapp/123456789
```

### 3. Проверьте результат
- В приватном чате с ботом должно появиться сообщение с заказом
- Кнопка "✏️ Редактировать заказ" должна быть **WebApp кнопкой** (открывается внутри Telegram)
- При нажатии должен открыться интерфейс редактирования внутри Telegram

## 🔧 Готовый код для Telegraf

```typescript
import { Telegraf } from 'telegraf'

const bot = new Telegraf(process.env.BOT_TOKEN!)

// Отправка сообщения с WebApp кнопкой (только для приватных чатов)
async function sendWebAppMessage(chatId: string, orderId: string) {
  const webAppUrl = `https://dsgrating.ru/telegram-webapp/edit-order.html?orderId=${orderId}`
  
  await bot.telegram.sendMessage(chatId, 'Ваш заказ готов к редактированию:', {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: '✏️ Редактировать заказ',
            web_app: { url: webAppUrl }  // ← WebApp кнопка
          }
        ]
      ]
    }
  })
}

// Отправка сообщения с URL кнопкой (для групповых чатов)
async function sendUrlMessage(chatId: string, orderId: string) {
  const webAppUrl = `https://dsgrating.ru/telegram-webapp/edit-order.html?orderId=${orderId}`
  
  await bot.telegram.sendMessage(chatId, 'Ваш заказ готов к редактированию:', {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: '✏️ Редактировать заказ',
            url: webAppUrl  // ← Обычная URL кнопка
          }
        ]
      ]
    }
  })
}

// Адаптивная функция (автоматически выбирает тип кнопки)
async function sendAdaptiveMessage(chatId: string, orderId: string) {
  const isPrivateChat = !chatId.startsWith('-')
  const webAppUrl = `https://dsgrating.ru/telegram-webapp/edit-order.html?orderId=${orderId}`
  
  const button = isPrivateChat 
    ? { text: '✏️ Редактировать заказ', web_app: { url: webAppUrl } }
    : { text: '✏️ Редактировать заказ', url: webAppUrl }
  
  await bot.telegram.sendMessage(chatId, 'Ваш заказ готов к редактированию:', {
    reply_markup: {
      inline_keyboard: [[button]]
    }
  })
}
```

## ⚠️ Важные моменты

1. **WebApp кнопки** - только в приватных чатах (ID > 0)
2. **URL кнопки** - в групповых чатах (ID < 0)
3. **BotFather регистрация** - URL должен быть зарегистрирован через `/setmenubutton`
4. **HTTPS обязательно** - WebApp работает только по HTTPS

## 🚀 Результат
- **Приватный чат**: WebApp открывается внутри Telegram (без браузера)
- **Групповой чат**: URL открывается в браузере с подтверждением 
