# Система создания закупки и уведомлений

## Обзор

Система обеспечивает полный цикл работы с закупками - от создания до получения товара, включая автоматические уведомления на каждом этапе.

## Архитектура системы

### Основные компоненты

1. **API для работы с закупками**
   - `src/app/api/purchases/create/route.ts` - создание закупки
   - `src/app/api/purchases/[id]/send-to-supplier/route.ts` - отправка поставщику
   - `src/app/api/purchases/[id]/mark-paid/route.ts` - отметка об оплате
   - `src/app/api/purchases/[id]/receive/route.ts` - оприходование

2. **Сервисы уведомлений**
   - `src/lib/services/TelegramBotService.ts` - Telegram уведомления для закупок
   - `src/lib/services/notification-scheduler.service.ts` - планирование уведомлений
   - `src/lib/services/notification-executor.service.ts` - выполнение уведомлений

3. **Пользовательский интерфейс**
   - `src/components/Purchases/CreatePurchaseForm.tsx` - форма создания
   - `src/components/Purchases/PurchasesModernInterface.tsx` - управление закупками

## Процесс создания закупки

### 1. Создание закупки (статус: draft)

#### Пользовательский интерфейс
```typescript
// src/components/Purchases/CreatePurchaseForm.tsx
const handleSubmit = (e: React.FormEvent) => {
  const purchaseData = {
    items: items.map(item => ({
      productId: item.productId,
      productName: item.productName,
      quantity: item.quantity,
      costPrice: item.costPrice,
      total: item.total
    })),
    totalAmount: calculateTotal(),
    isUrgent,
    currency,
    supplierName,
    notes
  };
  
  onSubmit(purchaseData);
};
```

#### API обработка
```typescript
// src/app/api/purchases/create/route.ts
export async function POST(request: NextRequest) {
  const purchase = await prisma.$transaction(async (tx) => {
    // Создание основной записи закупки
    const newPurchase = await tx.purchases.create({
      data: {
        suppliername: supplierName,
        totalamount: totalRUB,
        status: 'draft', // Начальный статус
        notes: notes || '',
        userid: user.id,
      },
    });

    // Создание позиций закупки
    const purchaseItems = await Promise.all(
      items.map(item => 
        tx.purchase_items.create({
          data: {
            purchaseid: newPurchase.id,
            productid: BigInt(item.id),
            quantity: item.quantity,
            unitcostrub: item.costPrice,
            unitcosttry: item.costPriceTRY,
            // ...другие поля
          },
        })
      )
    );

    return { ...newPurchase, items: purchaseItems };
  });
}
```

**Особенности:**
- Закупка создается в статусе `draft`
- Уведомления НЕ отправляются при создании
- Поддерживаются разные валюты (RUB, TRY)
- Автоматически рассчитывается курс валют

### 2. Отправка поставщику (статус: sent_to_supplier)

#### Смена статуса
```typescript
// src/app/api/purchases/[id]/send-to-supplier/route.ts
export async function POST(request: NextRequest, { params }) {
  // Проверка статуса
  if (purchase.status !== 'draft') {
    return NextResponse.json({ error: `Purchase is already in status: ${purchase.status}` }, { status: 400 });
  }

  // Отправка в Telegram группу
  const telegramResult = await TelegramService.call(message, process.env.TELEGRAM_GROUP_ID);

  // Обновление статуса
  const updatedPurchase = await prisma.purchases.update({
    where: { id: purchaseId },
    data: {
      status: 'sent_to_supplier',
      telegrammessageid: telegramResult,
      telegramchatid: process.env.TELEGRAM_GROUP_CHAT_ID,
      updatedat: new Date()
    }
  });
}
```

#### Telegram уведомление
```typescript
// src/lib/services/TelegramBotService.ts
static async sendPurchaseToSupplier(purchase: Purchase) {
  const urgentTag = purchase.isUrgent ? '🔴 <b>СРОЧНАЯ ЗАКУПКА!</b>\n\n' : '';
  
  const message = `${urgentTag}📋 <b>Новая закупка #${purchase.id}</b>

<b>Товары и цены:</b>
${itemsText}

💰 <b>Общая сумма: ${totalPrimeCostTry.toFixed(2)} ₺</b>

📅 <b>Дата создания:</b> ${formattedDate}
🏪 <b>Поставщик:</b> ${purchase.supplierName}

<i>Закупка отправлена в группу для обработки</i>`;

  return await this.sendMessage({ 
    chat_id: this.GROUP_CHAT_ID, 
    text: message, 
    parse_mode: 'HTML' 
  });
}
```

### 3. Отметка об оплате (статус: paid)

#### API обработка
```typescript
// src/app/api/purchases/[id]/mark-paid/route.ts
export async function POST(request: NextRequest, { params }) {
  // Получение актуального курса с буфером 5%
  const latestRate = await ExchangeRateService.getLatestRate('TRY');
  const tryRateWithBuffer = Number(latestRate.rateWithBuffer);

  // Обновление статуса с сохранением курса оплаты
  const updatedPurchase = await prisma.purchases.update({
    where: { id: purchaseId },
    data: {
      status: 'paid',
      paiddate: new Date(),
      paidexchangerate: new Decimal(tryRateWithBuffer),
      updatedat: new Date()
    }
  });

  // Отправка уведомления об оплате
  const telegramResult = await TelegramService.call(message, process.env.TELEGRAM_GROUP_ID);
}
```

#### Telegram уведомление об оплате
```typescript
// src/lib/services/TelegramBotService.ts
static async sendPaymentNotification(purchaseId: number, purchaseData) {
  const paymentMessage = `💰 <b>Закупка #${purchaseId} - оплачена!</b>

📦 <b>Товары (${purchaseData.items.length} поз.):</b>
${itemsList}

💵 <b>Итого: ${totalInTry.toFixed(2)} ₺</b>

✅ Статус изменен на "Оплачено"`;

  // Интерактивная кнопка для смены статуса
  const replyMarkup = {
    inline_keyboard: [[
      { text: "🚚 Отправлено в Карго", callback_data: `shipped_${purchaseId}` }
    ]]
  };

  return await this.sendSimpleMessage(paymentMessage, true, replyMarkup);
}
```

### 4. Статусы закупки

```typescript
// Конфигурация статусов
const statusConfig = {
  draft: {
    label: 'Черновик',
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-200',
    actions: ['send', 'delete']
  },
  sent_to_supplier: {
    label: 'Отправлено поставщику',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-200',
    actions: ['mark-paid', 'delete']
  },
  paid: {
    label: 'Оплачено',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-200',
    actions: ['mark-in-transit', 'receive']
  },
  in_transit: {
    label: 'В пути',
    color: 'text-amber-600',
    bgColor: 'bg-amber-100',
    borderColor: 'border-amber-200',
    actions: ['receive']
  },
  received: {
    label: 'Получено',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100',
    borderColor: 'border-emerald-200',
    actions: []
  }
};
```

## Система уведомлений

### 1. Архитектура уведомлений

#### Планирование уведомлений
```typescript
// src/lib/services/notification-scheduler.service.ts
static async schedulePaymentReminder(orderId: number, userId: number) {
  const settings = await this.getNotificationSettings();
  
  // Первое напоминание (через 48 часов)
  await prisma.notification_jobs.create({
    data: {
      job_type: 'payment_reminder_first',
      target_id: BigInt(orderId),
      user_id: BigInt(userId),
      scheduled_at: new Date(now.getTime() + settings.payment_reminder_first_hours * 60 * 60 * 1000),
      data: { reminder_type: 'first', order_id: orderId }
    }
  });

  // Финальное напоминание (через 51 час)
  await prisma.notification_jobs.create({
    data: {
      job_type: 'payment_reminder_final',
      target_id: BigInt(orderId),
      user_id: BigInt(userId),
      scheduled_at: new Date(now.getTime() + settings.payment_reminder_final_hours * 60 * 60 * 1000),
      data: { reminder_type: 'final', order_id: orderId }
    }
  });
}
```

#### Выполнение уведомлений
```typescript
// src/lib/services/notification-executor.service.ts
static async executePaymentReminder(jobId: number, jobData: any) {
  const { order_id, reminder_type } = jobData;
  
  // Получение заказа
  const order = await prisma.orders.findUnique({
    where: { id: BigInt(order_id) },
    include: { users: true }
  });

  // Проверка статуса (если уже оплачен - пропускаем)
  if (order.status !== 0) {
    console.log(`Order ${order_id} already paid, skipping reminder`);
    return;
  }

  // Формирование сообщения
  let message = '';
  switch (reminder_type) {
    case 'first':
      message = `🕐 Напоминание об оплате заказа №${order_id}...`;
      break;
    case 'final':
      message = `⚠️ ПОСЛЕДНЕЕ ПРЕДУПРЕЖДЕНИЕ - Заказ №${order_id}...`;
      break;
    case 'cancel':
      // Отмена заказа
      await prisma.orders.update({
        where: { id: BigInt(order_id) },
        data: { status: 4 } // CANCELLED
      });
      message = `❌ Заказ №${order_id} отменен...`;
      break;
  }

  // Отправка уведомления
  await this.sendTelegramNotification(user.tg_id.toString(), message, inlineKeyboard);
}
```

### 2. Типы уведомлений

#### Уведомления о заказах
- **Напоминание об оплате** - через 48 часов
- **Финальное предупреждение** - через 51 час
- **Автоматическая отмена** - через 72 часа

#### Уведомления о бонусах
```typescript
static async executeBonusNotification(jobId: number, jobData: any) {
  const message = `🎁 Бонусы начислены!

За заказ №${order_id} на сумму ${order.total_amount}₽ вам начислено ${bonus_amount} бонусов!

💎 Ваш уровень: ${tierName}
💰 Баланс бонусов: ${user.bonus_balance} бонусов`;

  const inlineKeyboard = {
    inline_keyboard: [
      [{ text: "🛒 Продолжить покупки", url: "..." }],
      [{ text: "👤 Профиль с бонусами", url: "..." }]
    ]
  };
}
```

#### Уведомления о поступлении товара
```typescript
static async executeRestockNotification(jobId: number, jobData: any) {
  const message = `📦 Товар поступил на склад!

"${product.name}" снова доступен для заказа!

💰 Цена: ${product.price}₽

Не упустите возможность - количество ограничено!`;

  // Удаление подписки после отправки уведомления
  await prisma.product_subscriptions.deleteMany({
    where: { user_id: user.id, product_id: BigInt(product_id) }
  });
}
```

### 3. Cron задачи для уведомлений

```typescript
// src/lib/cron/notification-cron.ts
export class NotificationCron {
  static async processNotifications() {
    // Получение задач готовых к выполнению
    const pendingJobs = await prisma.notification_jobs.findMany({
      where: {
        status: 'pending',
        scheduled_at: { lte: new Date() }
      },
      take: 100
    });

    for (const job of pendingJobs) {
      try {
        await NotificationExecutorService.executeJob(job);
      } catch (error) {
        console.error(`Failed to execute job ${job.id}:`, error);
      }
    }
  }
}
```

## Интеграция с Telegram

### 1. Боты для разных целей

#### Бот для закупок
```typescript
// src/lib/services/TelegramBotService.ts
class TelegramBotService {
  private static readonly PURCHASE_BOT_TOKEN = process.env.TELEGRAM_PURCHASE_BOT_TOKEN;
  private static readonly GROUP_CHAT_ID = process.env.TELEGRAM_GROUP_CHAT_ID;

  static async sendPurchaseToSupplier(purchase: Purchase) {
    // Отправка в группу закупщиков
  }

  static async sendPaymentNotification(purchaseId: number, purchaseData: any) {
    // Уведомление об оплате с интерактивными кнопками
  }
}
```

#### Бот для клиентов
```typescript
// src/lib/services/notification-executor.service.ts
private static async sendTelegramNotification(telegramId: string, message: string, replyMarkup?: any) {
  // Получение токена из базы данных
  const webappBotToken = await TelegramTokenService.getWebappBotToken();
  
  const requestBody = {
    chat_id: telegramId,
    text: message,
    parse_mode: 'HTML',
    reply_markup: replyMarkup
  };

  await fetch(`https://api.telegram.org/bot${webappBotToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody)
  });
}
```

### 2. Интерактивные кнопки

#### Кнопки для уведомлений об оплате
```typescript
const inlineKeyboard = {
  inline_keyboard: [
    [{ text: "💳 Оплатить заказ", url: `${WEBAPP_URL}/orders/${order_id}` }],
    [
      { text: "📋 Мои заказы", url: `${WEBAPP_URL}/orders` },
      { text: "🛒 Продолжить покупки", url: `${WEBAPP_URL}` }
    ]
  ]
};
```

#### Кнопки для закупок
```typescript
const replyMarkup = {
  inline_keyboard: [[
    { text: "🚚 Отправлено в Карго", callback_data: `shipped_${purchaseId}` }
  ]]
};
```

## Обработка валют

### 1. Курсы валют с буфером

```typescript
// src/lib/services/exchange-rate.service.ts
export class ExchangeRateService {
  static async getLatestRate(currency: string) {
    // Получение текущего курса
    const currentRate = await this.fetchCurrentRate(currency);
    
    // Добавление буфера 5%
    const rateWithBuffer = currentRate * 1.05;
    
    return {
      rate: currentRate,
      rateWithBuffer: rateWithBuffer,
      currency: currency,
      timestamp: new Date()
    };
  }
}
```

### 2. Отображение сумм

```typescript
// src/components/Purchases/PurchaseAmountDisplay.tsx
const PurchaseAmountDisplay = ({ purchase }) => {
  if (purchase.status === 'paid' && purchase.paidExchangeRate) {
    // Показываем сумму по курсу оплаты
    const totalInTry = purchase.totalAmount / purchase.paidExchangeRate;
    return (
      <div>
        <div className="text-lg font-bold">{totalInTry.toFixed(2)} ₺</div>
        <div className="text-sm text-gray-500">{purchase.totalAmount} ₽</div>
      </div>
    );
  }
  
  // Для неоплаченных показываем текущий курс
  return <div className="text-lg font-bold">{purchase.totalAmount} ₽</div>;
};
```

## Мониторинг и отладка

### 1. Логирование

```typescript
// Примеры логирования в системе
console.log(`📦 Sending purchase #${purchaseId} to group via Telegram`);
console.log(`✅ Purchase #${purchaseId} sent to supplier successfully`);
console.log(`💰 Purchase #${purchaseId} marked as paid with exchange rate: ${tryRateWithBuffer}`);
console.log(`🔔 Executing payment reminder job ${jobId}`);
```

### 2. Статистика уведомлений

```typescript
// src/lib/services/notification-scheduler.service.ts
static async getJobsStats() {
  const stats = await prisma.notification_jobs.groupBy({
    by: ['status', 'job_type'],
    _count: true
  });
  return stats;
}
```

### 3. Очистка старых задач

```typescript
static async cleanupOldJobs() {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  
  const result = await prisma.notification_jobs.deleteMany({
    where: {
      status: { in: ['executed', 'failed', 'cancelled'] },
      executed_at: { lt: sevenDaysAgo }
    }
  });
  
  return result.count;
}
```

## Особенности и ограничения

### 1. Режим разработки

- В development режиме Telegram уведомления имитируются
- Реальные уведомления отправляются только в production
- Группа закупщиков получает реальные уведомления в любом режиме

### 2. Обработка ошибок

- Ошибки Telegram API не блокируют основную логику
- Повторные попытки для критических уведомлений
- Детальное логирование для отладки

### 3. Производительность

- Пагинация для больших списков закупок
- Ленивая загрузка данных
- Кэширование курсов валют

## Заключение

Система обеспечивает:
- Полный цикл управления закупками
- Автоматические уведомления на каждом этапе
- Гибкую настройку временных интервалов
- Поддержку мультивалютности
- Интеграцию с Telegram для мгновенных уведомлений
- Детальное логирование и мониторинг

Вся система построена на принципах надежности, масштабируемости и простоты использования.