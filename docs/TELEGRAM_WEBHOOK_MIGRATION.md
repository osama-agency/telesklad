# Миграция Telegram бота с Polling на Webhook

## Обзор изменений

Мы успешно мигрировали Telegram бота с polling режима на webhook режим. Это обеспечивает:

- ✅ Лучшую производительность (нет постоянных запросов к API)
- ✅ Совместимость с serverless платформами (Vercel)
- ✅ Надёжность доставки сообщений
- ✅ Безопасность через проверку подписи

## Что было изменено

### 1. TelegramBotWorker (`src/lib/services/telegram-bot-worker.service.ts`)

**Было (Polling режим):**
```typescript
// Инициализация с polling
this.bot = new TelegramBot(token, { polling: true });

// Методы start/stop для управления polling
async start(): Promise<void> { ... }
async stop(): Promise<void> { ... }
```

**Стало (Webhook режим):**
```typescript
// Инициализация без polling
this.bot = new TelegramBot(token, { polling: false });

// Новые методы для webhook
async processWebhookUpdate(update: any): Promise<void> { ... }
async setupWebhook(webhookUrl: string, secretToken?: string): Promise<boolean> { ... }
async deleteWebhook(): Promise<boolean> { ... }
async getWebhookInfo(): Promise<any> { ... }
```

### 2. Webhook Handler (`src/app/api/telegram/webhook/route.ts`)

Обновлён для:
- Проверки подписи webhook
- Вызова `processWebhookUpdate` вместо ручной обработки
- Всегда возвращает 200 OK (требование Telegram)

### 3. Новые API endpoints

#### `/api/telegram/webhook/setup`
- GET - получить информацию о webhook
- POST - установить webhook
- DELETE - удалить webhook

### 4. Скрипты управления

- `npm run telegram:webhook:setup` - установить webhook
- `npm run telegram:webhook:delete` - удалить webhook
- `npm run telegram:webhook:info` - информация о webhook

## Настройка для разработки

### 1. Установите ngrok (если ещё не установлен):
```bash
brew install ngrok
```

### 2. Запустите ngrok:
```bash
ngrok http --domain=strattera.ngrok.app 3000
```

### 3. Добавьте в `.env`:
```env
TELEGRAM_WEBHOOK_SECRET=your-secret-token-here
```

### 4. Установите webhook:
```bash
npm run telegram:webhook:setup
```

### 5. Проверьте статус:
```bash
npm run telegram:webhook:info
```

## Настройка для продакшена

### 1. Убедитесь, что в `.env` указан правильный домен:
```env
NEXTAUTH_URL=https://your-domain.com
TELEGRAM_WEBHOOK_SECRET=strong-secret-token-here
```

### 2. Установите webhook:
```bash
npm run telegram:webhook:setup -- --prod
```

### 3. Проверьте в Vercel, что переменные окружения настроены

## Откат на polling (если нужно)

### 1. Удалите webhook:
```bash
npm run telegram:webhook:delete
```

### 2. Измените инициализацию в `telegram-bot-worker.service.ts`:
```typescript
// Вернуть polling: true
this.bot = new TelegramBot(token, { polling: true });
```

### 3. Восстановите методы start/stop

## Проверка работоспособности

### 1. Отправьте сообщение боту
### 2. Проверьте логи:
```bash
# Локально
npm run dev

# На Vercel
vercel logs
```

### 3. Проверьте ошибки webhook:
```bash
npm run telegram:webhook:info
```

## Безопасность

### 1. Всегда используйте TELEGRAM_WEBHOOK_SECRET
### 2. Проверяйте подпись в webhook handler
### 3. Используйте HTTPS для webhook URL
### 4. Регулярно меняйте secret token

## FAQ

**Q: Можно ли использовать и polling, и webhook одновременно?**
A: Нет, Telegram API не позволяет это. Нужно выбрать один режим.

**Q: Что делать, если webhook не работает?**
A: Проверьте:
- URL доступен извне (ngrok работает)
- Нет ошибок в `npm run telegram:webhook:info`
- Логи приложения на наличие ошибок
- Правильный secret token

**Q: Как переключаться между dev и prod?**
A: Используйте разные боты для dev и prod с разными токенами.