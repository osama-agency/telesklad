# BOT ROUTING FIX

## Проблема
Клиент писал в @strattera_test_bot, но получал ответы через @telesklad_bot. Это происходило из-за того, что оба webhook'а использовали один и тот же singleton instance `GrammyBotWorker`, который перезаписывался последним инициализированным токеном.

## Техническая причина
```typescript
// ДО - НЕПРАВИЛЬНО
static getInstance(): GrammyBotWorker {
  if (!this.instance) {
    this.instance = new GrammyBotWorker();
  }
  return this.instance; // ← Один экземпляр для всех ботов
}

// Оба webhook'а использовали один instance:
// /api/telegram/grammy-simple/webhook → grammyWorker.initialize() (client_bot_token)
// /api/telegram/telesklad-webhook → adminWorker.initialize(adminToken) (telesklad_bot_token)
// Последний токен перезаписывал предыдущий!
```

## Исправление

### 1. Обновление singleton pattern
```typescript
// ПОСЛЕ - ПРАВИЛЬНО
private static instances: Map<string, GrammyBotWorker> = new Map();

static getInstance(instanceName: string = 'default'): GrammyBotWorker {
  if (!this.instances.has(instanceName)) {
    this.instances.set(instanceName, new GrammyBotWorker());
  }
  return this.instances.get(instanceName)!;
}
```

### 2. Использование именованных экземпляров
```typescript
// Клиентский webhook
grammyWorker = GrammyBotWorker.getInstance('client');
await grammyWorker.initialize(); // Использует client_bot_token

// Админский webhook  
adminWorker = GrammyBotWorker.getInstance('admin');
await adminWorker.initialize(adminToken); // Использует telesklad_bot_token
```

## Результат
✅ **Клиент пишет в @strattera_test_bot** → получает ответ через @strattera_test_bot  
✅ **Админ пишет в @telesklad_bot** → получает ответ через @telesklad_bot  
✅ **Курьер пишет в @telesklad_bot** → получает ответ через @telesklad_bot  

## Затронутые файлы
1. `src/lib/services/grammy/GrammyBotWorker.ts` - singleton pattern
2. `src/app/api/telegram/grammy-simple/webhook/route.ts` - клиентский webhook
3. `src/app/api/telegram/telesklad-webhook/route.ts` - админский webhook

## Тестирование
Теперь можно протестировать:
1. Отправить сообщение в @strattera_test_bot как клиент
2. Проверить, что ответ приходит в том же боте
3. Отправить сообщение в @telesklad_bot как курьер/админ
4. Проверить, что ответ приходит в том же боте

---
**Дата исправления**: 25 июня 2025  
**Статус**: ✅ Исправлено и готово к тестированию 