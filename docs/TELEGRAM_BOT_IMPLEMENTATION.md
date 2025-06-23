# Реализация Telegram-бота для Next.js проекта

## Текущее состояние реализации

### Уже реализовано:
1. **Аутентификация через Telegram WebApp**:
   - `src/context/TelegramAuthContext.tsx` - контекст для управления состоянием
   - `src/app/api/webapp/auth/telegram/route.ts` - API для обработки initData
   - Полная интеграция с базой данных через Prisma

2. **Модели данных**:
   ```prisma:prisma/schema.prisma
   model User {
     id               String   @id @default(uuid())
     tg_id            String?  @unique
     telegramData     Json?
     // ... другие поля
   }
   ```

3. **Пользовательский интерфейс**:
   - Весь интерфейс WebApp в `src/app/webapp/`
   - Специализированные компоненты в `src/components/webapp/`

4. **Базовые уведомления**:
   - `src/hooks/useToast.ts` - система toast-уведомлений
   - `src/components/ui/Toast.tsx` - компонент отображения

### Что нужно реализовать:

## 1. Ядро Telegram-бота

### Файл: `src/lib/services/telegram-bot.service.ts`
```typescript
import TelegramBot from 'node-telegram-bot-api';
import { prisma } from '@/lib/prisma';
import { OrderStatus } from '@/types';

const token = process.env.TELEGRAM_BOT_TOKEN!;
export const bot = new TelegramBot(token, { polling: false });

// Обработка входящих сообщений
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const user = await prisma.user.findFirst({
    where: { telegram_chat_id: chatId.toString() }
  });

  if (!user) {
    bot.sendMessage(chatId, 'Пожалуйста, привяжите аккаунт через веб-интерфейс');
    return;
  }

  switch (msg.text) {
    case '/start':
      await handleStartCommand(chatId, user);
      break;
    case '/orders':
      await handleOrdersCommand(chatId, user);
      break;
    case '/cart':
      await handleCartCommand(chatId, user);
      break;
    default:
      bot.sendMessage(chatId, 'Неизвестная команда. Используйте /help для списка команд');
  }
});

// Обработка callback-запросов
bot.on('callback_query', async (callbackQuery) => {
  const message = callbackQuery.message!;
  const chatId = message.chat.id;
  const data = callbackQuery.data!;
  
  if (data.startsWith('confirm_order_')) {
    const orderId = data.split('_')[2];
    await handleOrderConfirmation(chatId, orderId);
  }
});

// Пример обработки команды /orders
async function handleOrdersCommand(chatId: number, user: any) {
  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 5
  });

  if (orders.length === 0) {
    bot.sendMessage(chatId, 'У вас нет активных заказов');
    return;
  }

  const message = orders.map(order => 
    `#${order.id}: ${order.status} - ${order.total} руб`
  ).join('\n');

  bot.sendMessage(chatId, `Ваши последние заказы:\n${message}`, {
    reply_markup: {
      inline_keyboard: [
        [{ text: '🔄 Обновить', callback_data: 'refresh_orders' }],
        [{ text: '📝 Создать заказ', callback_data: 'create_order' }]
      ]
    }
  });
}
```

## 2. Вебхук-обработчик

### Файл: `src/app/api/telegram/webhook/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { bot } from '@/lib/services/telegram-bot.service';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const update = await req.json();
    bot.processUpdate(update);
    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('Telegram webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

## 3. Интеграция с системой заказов

### Обновление хука заказов: `src/hooks/useOrders.ts`
```typescript
// Добавить функцию отправки уведомления
export const sendTelegramOrderNotification = async (order: Order) => {
  const user = await prisma.user.findUnique({
    where: { id: order.userId },
    include: { telegram: true }
  });
  
  if (user?.telegram?.chat_id) {
    const message = `🛒 Статус заказа #${order.id} изменен: ${order.status}\n` +
                   `💰 Сумма: ${order.total} руб\n` +
                   `📅 Дата обновления: ${new Date().toLocaleString()}`;
    
    bot.sendMessage(user.telegram.chat_id, message, {
      reply_markup: {
        inline_keyboard: [
          [{ text: '👀 Подробнее', url: `${process.env.NEXTAUTH_URL}/orders/${order.id}` }]
        ]
      }
    });
  }
};

// Использовать в существующих функциях
export const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: { status }
  });
  
  await sendTelegramOrderNotification(updatedOrder);
  return updatedOrder;
};
```

## 4. Настройка окружения

### Файл: `.env.local`
```env
# Telegram Bot
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_WEBHOOK_URL=https://your-domain.com/api/telegram/webhook
```

### Установка зависимостей:
```bash
npm install node-telegram-bot-api
```

## 5. Регистрация вебхука

### Скрипт: `scripts/set-telegram-webhook.ts`
```typescript
import { bot } from '@/lib/services/telegram-bot.service';

async function setWebhook() {
  const webhookUrl = process.env.TELEGRAM_WEBHOOK_URL!;
  await bot.setWebHook(webhookUrl);
  console.log(`Webhook установлен на ${webhookUrl}`);
}

setWebhook();
```

## Примеры сообщений и кнопок (на основе старого проекта)

### 1. Уведомления о заказах

**Создание нового заказа:**

## Этапы внедрения

### Неделя 1: Базовый функционал
1. Реализовать ядро бота (`telegram-bot.service.ts`)
2. Настроить вебхук-обработчик
3. Реализовать команды:
   - `/start` - приветствие и проверка регистрации
   - `/help` - список доступных команд
   - `/orders` - просмотр последних заказов

### Неделя 2: Интеграция с бизнес-процессами
1. Реализовать уведомления о:
   - Создании заказа
   - Изменении статуса заказа
   - Доставке заказа
2. Добавить интерактивные кнопки:
   - Подтверждение заказа
   - Отмена заказа
   - Ссылки на детали

### Неделя 3: Расширенные функции
1. Реализовать управление корзиной:
   - `/cart view` - просмотр корзины
   - `/cart add [product]` - добавление товара
   - `/cart remove [product]` - удаление товара
2. Добавить систему сессий для многошаговых операций
3. Реализовать напоминания о брошенных корзинах

### Неделя 4: Оптимизация и тестирование
1. Добавить Redis для кеширования состояний
2. Реализовать систему повторных отправок
3. Написать тесты для ключевых сценариев
4. Провести нагрузочное тестирование

## Мониторинг
- **Логирование**: Winston с разделением по уровням
- **Трассировка**: OpenTelemetry для отслеживания запросов
- **Метрики**: Prometheus + Grafana для мониторинга:
  - Количество входящих сообщений
  - Время обработки запросов
  - Ошибки обработки

## Безопасность
1. Валидация входящих данных вебхука
2. Проверка подписи Telegram WebApp
3. Ограничение частоты запросов
4. Шифрование чувствительных данных в БД 