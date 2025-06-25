# 🚀 Grammy Migration - Quick Start Guide

## ⚡ **Немедленные действия**

### 1. **Создание ветки для миграции**
```bash
# Создать feature branch
git checkout -b feature/grammy-migration

# Установить дополнительные Grammy плагины  
npm install @grammyjs/conversations @grammyjs/ratelimiter @grammyjs/runner

# Проверить текущие уязвимости
npm audit
```

### 2. **Создание базовой структуры**
```bash
# Создать директорию для Grammy
mkdir -p src/lib/services/grammy
mkdir -p src/lib/services/grammy/types
mkdir -p src/lib/services/grammy/utils
mkdir -p src/app/api/telegram/grammy

# Создать основные файлы
touch src/lib/services/grammy/GrammyBotWorker.ts
touch src/lib/services/grammy/GrammyService.ts  
touch src/lib/services/grammy/GrammyAdminService.ts
touch src/lib/services/grammy/types/grammy-types.ts
```

### 3. **Первый тест Grammy**
```typescript
// scripts/test-grammy.ts
import { Bot } from 'grammy';

async function testGrammy() {
  const token = process.env.WEBAPP_TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.error('❌ No token found');
    return;
  }

  try {
    const bot = new Bot(token);
    const botInfo = await bot.api.getMe();
    console.log('✅ Grammy works!');
    console.log('🤖 Bot info:', botInfo);
  } catch (error) {
    console.error('❌ Grammy test failed:', error);
  }
}

testGrammy();
```

```bash
# Запустить тест
npx tsx scripts/test-grammy.ts
```

---

## 📋 **Фаза 1: Создание базового GrammyBotWorker**

### **Шаг 1.1: Базовая структура**
```typescript
// src/lib/services/grammy/GrammyBotWorker.ts
import { Bot, Context, InlineKeyboard } from 'grammy';
import { conversations, createConversation } from '@grammyjs/conversations';
import { limit } from '@grammyjs/ratelimiter';

export class GrammyBotWorker {
  private bot: Bot;
  private static instance: GrammyBotWorker | null = null;

  static getInstance(): GrammyBotWorker {
    if (!this.instance) {
      this.instance = new GrammyBotWorker();
    }
    return this.instance;
  }

  async initialize(token: string): Promise<void> {
    this.bot = new Bot(token);
    
    // Базовые middleware
    this.bot.use(this.createLoggingMiddleware());
    this.bot.use(this.createErrorMiddleware());
    
    // Rate limiting
    this.bot.use(limit());
    
    // Conversations
    this.bot.use(conversations());
    
    // Handlers
    this.setupCommands();
    this.setupCallbacks();
    this.setupMessages();
    
    console.log('✅ GrammyBotWorker initialized');
  }

  private setupCommands() {
    // /start command
    this.bot.command('start', async (ctx) => {
      await ctx.reply('🎉 Grammy bot is working!', {
        reply_markup: new InlineKeyboard()
          .text('Test callback', 'test_callback')
      });
    });
  }

  private setupCallbacks() {
    // Test callback
    this.bot.callbackQuery('test_callback', async (ctx) => {
      await ctx.answerCallbackQuery('Grammy callback works!');
      await ctx.editMessageText('✅ Grammy callback successful!');
    });
  }

  private setupMessages() {
    // Echo text messages
    this.bot.on('message:text', async (ctx) => {
      if (ctx.message.text !== '/start') {
        await ctx.reply(`Echo: ${ctx.message.text}`);
      }
    });
  }

  private createLoggingMiddleware() {
    return async (ctx: Context, next: () => Promise<void>) => {
      console.log(`📨 ${ctx.updateType} from ${ctx.from?.id}`);
      await next();
    };
  }

  private createErrorMiddleware() {
    return async (ctx: Context, next: () => Promise<void>) => {
      try {
        await next();
      } catch (error) {
        console.error('❌ Grammy error:', error);
        await ctx.reply('Произошла ошибка. Попробуйте позже.');
      }
    };
  }

  // Webhook for Next.js
  getWebhookCallback() {
    return webhookCallback(this.bot, 'nextjs');
  }
}
```

### **Шаг 1.2: Создание API endpoint**
```typescript
// src/app/api/telegram/grammy/test/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { GrammyBotWorker } from '@/lib/services/grammy/GrammyBotWorker';
import { TelegramTokenService } from '@/lib/services/telegram-token.service';

const botWorker = GrammyBotWorker.getInstance();
let isInitialized = false;

async function ensureInitialized() {
  if (!isInitialized) {
    const token = await TelegramTokenService.getWebappBotToken();
    if (!token) throw new Error('No token found');
    
    await botWorker.initialize(token);
    isInitialized = true;
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureInitialized();
    
    // Grammy webhook callback
    return await botWorker.getWebhookCallback()(request);
  } catch (error) {
    console.error('❌ Grammy webhook error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    framework: 'grammY',
    mode: 'test',
    timestamp: new Date().toISOString()
  });
}
```

### **Шаг 1.3: Тестирование**
```bash
# Добавить в package.json scripts
"grammy:test": "npx tsx scripts/test-grammy.ts",
"grammy:webhook:test": "curl -X POST localhost:3000/api/telegram/grammy/test",

# Запустить тесты
npm run grammy:test
npm run grammy:webhook:test
```

---

## 🔄 **Фаза 2: Пошаговая замена функциональности**

### **Шаг 2.1: Параллельный запуск**
```typescript
// Feature flag для плавного перехода
const USE_GRAMMY = process.env.USE_GRAMMY_BOT === 'true';

export function getTelegramBotWorker() {
  if (USE_GRAMMY) {
    return GrammyBotWorker.getInstance();
  }
  return TelegramBotWorker.getInstance(); // Legacy
}
```

### **Шаг 2.2: Миграция команд**
```typescript
// Добавить в GrammyBotWorker.ts реальную логику /start
private setupCommands() {
  this.bot.command('start', async (ctx) => {
    // Логика из старого handleStartCommand
    const user = await UserService.handleTelegramStart(ctx.from);
    
    if (user.isNew) {
      await this.notifyAdminNewUser(user);
    }
    
    await this.sendWelcomeMessage(ctx);
  });
  
  this.bot.command('admin', async (ctx) => {
    if (this.isAdmin(ctx.from.id)) {
      await this.sendAdminInfo(ctx);
    }
  });
}
```

### **Шаг 2.3: Миграция callbacks**
```typescript
// Добавить реальные callback handlers
private setupCallbacks() {
  // Callback "Я оплатил"
  this.bot.callbackQuery(/^i_paid_(\d+)$/, async (ctx) => {
    const orderId = ctx.match[1];
    await this.handleIPaid(ctx, orderId);
  });
  
  // Callback "Оплата пришла" (админ)
  this.bot.callbackQuery(/^approve_payment_(\d+)$/, async (ctx) => {
    const orderId = ctx.match[1];
    await this.handleApprovePayment(ctx, orderId);
  });
}
```

---

## 🧪 **Тестирование миграции**

### **Создание тестов**
```typescript
// tests/grammy.test.ts
import { describe, test, expect } from '@jest/globals';
import { GrammyBotWorker } from '@/lib/services/grammy/GrammyBotWorker';

describe('Grammy Migration Tests', () => {
  let botWorker: GrammyBotWorker;
  
  beforeAll(async () => {
    botWorker = GrammyBotWorker.getInstance();
    await botWorker.initialize(process.env.WEBAPP_TELEGRAM_BOT_TOKEN!);
  });

  test('should handle /start command', async () => {
    // Мок контекст для тестирования
    const mockCtx = createMockContext('/start');
    await botWorker.handleCommand(mockCtx);
    
    expect(mockCtx.reply).toHaveBeenCalledWith(
      expect.stringContaining('Добро пожаловать')
    );
  });

  test('should handle i_paid callback', async () => {
    const mockCtx = createMockCallbackContext('i_paid_123');
    await botWorker.handleCallback(mockCtx);
    
    expect(mockCtx.answerCallbackQuery).toHaveBeenCalled();
  });
});
```

### **Сравнительное тестирование**
```bash
# Скрипт для сравнения производительности
# scripts/compare-performance.ts

import { TelegramBotWorker } from '@/lib/services/TelegramBotWorker';
import { GrammyBotWorker } from '@/lib/services/grammy/GrammyBotWorker';

async function comparePerformance() {
  const iterations = 100;
  
  // Тест legacy bot
  const legacyStart = performance.now();
  for (let i = 0; i < iterations; i++) {
    await legacyBot.processMessage(mockMessage);
  }
  const legacyTime = performance.now() - legacyStart;
  
  // Тест Grammy bot
  const grammyStart = performance.now();
  for (let i = 0; i < iterations; i++) {
    await grammyBot.processMessage(mockMessage);
  }
  const grammyTime = performance.now() - grammyStart;
  
  console.log(`Legacy: ${legacyTime}ms`);
  console.log(`Grammy: ${grammyTime}ms`);
  console.log(`Improvement: ${((legacyTime - grammyTime) / legacyTime * 100).toFixed(2)}%`);
}
```

---

## 📊 **Мониторинг миграции**

### **Метрики для отслеживания**
```typescript
// lib/services/grammy/GrammyMetrics.ts
export class GrammyMetrics {
  private static metrics = {
    messagesProcessed: 0,
    errorsCount: 0,
    averageResponseTime: 0,
    callbacksHandled: 0
  };

  static trackMessage(duration: number) {
    this.metrics.messagesProcessed++;
    this.updateAverageResponseTime(duration);
  }

  static trackError() {
    this.metrics.errorsCount++;
  }

  static getMetrics() {
    return { ...this.metrics };
  }
}

// Добавить в middleware
bot.use(async (ctx, next) => {
  const start = performance.now();
  
  try {
    await next();
    GrammyMetrics.trackMessage(performance.now() - start);
  } catch (error) {
    GrammyMetrics.trackError();
    throw error;
  }
});
```

### **Dashboard для мониторинга**
```typescript
// src/app/api/telegram/grammy/metrics/route.ts
export async function GET() {
  const metrics = GrammyMetrics.getMetrics();
  const legacyMetrics = LegacyMetrics.getMetrics();
  
  return NextResponse.json({
    grammy: metrics,
    legacy: legacyMetrics,
    comparison: {
      performance: `${((legacyMetrics.averageResponseTime - metrics.averageResponseTime) / legacyMetrics.averageResponseTime * 100).toFixed(2)}% faster`,
      reliability: `${((legacyMetrics.errorsCount - metrics.errorsCount) / legacyMetrics.errorsCount * 100).toFixed(2)}% fewer errors`
    }
  });
}
```

---

## 🎯 **Чеклист для запуска**

### **День 1-2: Подготовка**
- [ ] Создать feature branch `feature/grammy-migration`
- [ ] Установить Grammy и плагины
- [ ] Создать базовую структуру директорий
- [ ] Написать первый тест Grammy
- [ ] Создать базовый GrammyBotWorker

### **День 3-5: Основной функционал**
- [ ] Переписать команды (/start, /admin)
- [ ] Переписать callback handlers (i_paid, approve_payment)
- [ ] Переписать message handlers
- [ ] Добавить middleware для логирования и ошибок
- [ ] Создать тестовый webhook endpoint

### **День 6-8: Интеграция**
- [ ] Интегрировать с ReportService
- [ ] Интегрировать с UserService
- [ ] Создать GrammyService для отправки сообщений
- [ ] Создать feature flag для переключения
- [ ] Написать unit тесты

### **День 9-10: Тестирование**
- [ ] Сравнительное тестирование производительности
- [ ] Нагрузочное тестирование
- [ ] Тестирование всех сценариев использования
- [ ] Проверка совместимости с существующими API

### **День 11: Production деплой**
- [ ] Настроить мониторинг
- [ ] Включить feature flag в production
- [ ] Мониторить метрики первые 24 часа
- [ ] При успехе - удалить legacy код

---

## 🔥 **Быстрые команды**

```bash
# Начать миграцию
git checkout -b feature/grammy-migration
npm install @grammyjs/conversations @grammyjs/ratelimiter

# Тестировать Grammy
npm run grammy:test

# Запустить разработку
npm run dev

# Тестировать webhook
curl -X POST localhost:3000/api/telegram/grammy/test

# Проверить метрики
curl localhost:3000/api/telegram/grammy/metrics

# При успехе - merge в main
git checkout main
git merge feature/grammy-migration
```

**Готово! Миграция может начинаться прямо сейчас! 🚀**