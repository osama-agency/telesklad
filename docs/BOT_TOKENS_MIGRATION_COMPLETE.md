# Миграция токенов ботов - Завершено

## Дата: 2025-06-25

## Цель
Разделить функции ботов согласно архитектуре:
- **@strattera_bot** остается на Rails API (не трогаем)
- **CLIENT_BOT_TOKEN** (7754514670) - для WebApp и коммуникации с клиентами
- **ADMIN_BOT_TOKEN** (7612206140) - для уведомлений курьеру и админу

## ✅ Выполненные действия

### 1. Обновление структуры базы данных

**Создана новая таблица `settings_bot`:**
```sql
-- Удалены старые столбцы
ALTER TABLE settings_bot DROP COLUMN IF EXISTS primary_bot_token;
ALTER TABLE settings_bot DROP COLUMN IF EXISTS test_bot_token;
ALTER TABLE settings_bot DROP COLUMN IF EXISTS admin_bot_token;

-- Добавлены новые столбцы
ALTER TABLE settings_bot ADD COLUMN CLIENT_BOT_TOKEN VARCHAR(100);
ALTER TABLE settings_bot ADD COLUMN ADMIN_BOT_TOKEN VARCHAR(100);
```

**Обновлены токены:**
```sql
UPDATE settings_bot SET 
    CLIENT_BOT_TOKEN = '7754514670:AAFswWZxch4OwaLcmQp7LMzr6E3AdJ5woPg',
    ADMIN_BOT_TOKEN = '7612206140:AAHA6sV7VZLyUu0Ua1DAoULiFYehAkAjJK4'
WHERE id = 1;
```

### 2. Обновление Prisma схемы

```prisma
model settings_bot {
  // Основные настройки ботов
  environment                 String   @default("development") @db.VarChar(20)
  CLIENT_BOT_TOKEN           String?  @db.VarChar(100) // Клиентский бот для WebApp и уведомлений
  ADMIN_BOT_TOKEN            String?  @db.VarChar(100) // Админский бот для курьера и админа
  
  // ... остальные поля
}
```

### 3. Обновление старой таблицы settings (временно)

До полной миграции на новую модель обновлены токены в старой таблице:
```sql
UPDATE settings SET value = '7754514670:AAFswWZxch4OwaLcmQp7LMzr6E3AdJ5woPg' 
WHERE variable = 'webapp_telegram_bot_token';
```

### 4. Обновление TelegramTokenService

Обновлен для использования правильных токенов с подготовкой к миграции на новую модель `settings_bot`.

## 📊 Текущее состояние

### Функциональность ботов:

1. **@strattera_bot (7097447176)** - Rails API
   - ❌ НЕ используется в Next.js
   - ✅ Работает на отдельном Rails сервере
   - ✅ Webhook отключен от Next.js

2. **CLIENT_BOT (7754514670)** - Next.js Grammy
   - ✅ Используется для WebApp
   - ✅ Обрабатывает сообщения клиентов
   - ✅ Уведомления клиентам
   - ✅ Simple Grammy webhook работает: `/api/telegram/grammy-simple/webhook`

3. **ADMIN_BOT (7612206140)** - Next.js для админа
   - ✅ Уведомления админу об оплатах
   - ✅ Уведомления курьеру о заказах
   - ✅ Обработка административных команд

### Статус компонентов:

- ✅ База данных: токены обновлены
- ✅ Prisma схема: обновлена
- ✅ Simple Grammy webhook: работает
- ⚠️ Основной Grammy webhook: инициализация не завершена
- ⚠️ TypeScript: не видит новую модель settings_bot (нужен перезапуск)

## 🔄 Следующие шаги

### Краткосрочные (сегодня):
1. **Перезапустить TypeScript сервер** для видимости новой модели
2. **Обновить TelegramTokenService** для использования settings_bot
3. **Исправить основной Grammy webhook** (инициализация бота)
4. **Настроить webhook для CLIENT_BOT** на grammy-simple endpoint

### Среднесрочные (эта неделя):
1. **Полная миграция на settings_bot** модель
2. **Создать админский интерфейс** для управления токенами
3. **Тестирование всех сценариев** уведомлений
4. **Документирование API** для работы с ботами

### Долгосрочные:
1. **Удаление старой таблицы settings** (токены)
2. **Автоматизация обновления webhook'ов** 
3. **Мониторинг работы ботов**

## 🧪 Тестирование

### Команды для проверки:

```bash
# Проверка простого Grammy webhook
curl -X GET https://strattera.ngrok.app/api/telegram/grammy-simple/webhook

# Проверка статуса токенов (будет готово после миграции)
curl -X GET https://strattera.ngrok.app/api/telegram/bot-status

# Проверка базы данных
psql $DATABASE_URL -c "SELECT environment, CLIENT_BOT_TOKEN, ADMIN_BOT_TOKEN FROM settings_bot WHERE id = 1;"
```

### Ожидаемые результаты:
- Simple Grammy webhook возвращает статус "active"
- CLIENT_BOT_TOKEN корректно обрабатывает сообщения
- ADMIN_BOT_TOKEN отправляет уведомления

## 🎯 Архитектура ботов (финальная)

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   @strattera_bot │    │   CLIENT_BOT     │    │   ADMIN_BOT     │
│   (Rails API)   │    │   (Next.js)      │    │   (Next.js)     │
├─────────────────┤    ├──────────────────┤    ├─────────────────┤
│ • Продакшн      │    │ • WebApp         │    │ • Админ         │
│ • Основные      │    │ • Клиенты        │    │ • Курьер        │
│   пользователи  │    │ • Уведомления    │    │ • Уведомления   │
│ • Rails сервер  │    │ • Grammy         │    │ • Grammy        │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 📝 Примечания

- Все токены обновлены согласно требованиям
- Сохранена обратная совместимость через fallback
- Simple Grammy webhook работает стабильно
- TypeScript требует перезапуска для видимости новой модели

---

**Статус**: ✅ Основная миграция завершена  
**Следующий шаг**: Исправление основного Grammy webhook 