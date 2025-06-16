# 📦 Система отслеживания времени доставки

## 🎯 Описание

Система отслеживания времени доставки в Telesklad позволяет:
- **Отслеживать фактическое время доставки** от оформления заказа до получения товара
- **Вести статистику по поставщикам** со средним временем доставки
- **Прогнозировать сроки доставки** на основе исторических данных
- **Анализировать эффективность поставщиков** и выявлять просрочки

## 💱 Важно: Логика курса валют и доставки

### 🔄 **Курс лиры**:
- При **создании закупки** курс НЕ сохраняется
- Цена в лирах рассчитывается по **текущему курсу** для отображения
- При переходе в статус **"Оплачено"** курс лиры **фиксируется навсегда**
- Все дальнейшие расчеты используют зафиксированный курс

### 🚚 **Доставка**:
- При создании закупки доставка **НЕ учитывается**
- Стоимость доставки указывается **только при оприходовании**
- В поле "Дополнительные расходы на логистику" вводится фактическая стоимость доставки

## 🗄️ Структура базы данных

### Purchase (обновлена)
```sql
-- Новые поля для отслеживания времени доставки
orderDate         DateTime?      -- Дата оформления заказа (когда статус стал "sent")
receivedDate      DateTime?      -- Дата получения товара (когда статус стал "received") 
deliveryDays      Int?           -- Фактическое количество дней доставки
supplierDeliveryDays Int?        -- Среднее количество дней доставки от поставщика
```

### SupplierStats (новая таблица)
```sql
supplier                String   @unique     -- Название поставщика
totalPurchases          Int      @default(0) -- Общее количество закупок
completedPurchases      Int      @default(0) -- Количество завершенных закупок
avgDeliveryDays         Float    @default(20.0) -- Среднее количество дней доставки
totalDeliveryDays       Int      @default(0) -- Сумма всех дней доставки
minDeliveryDays         Int?     -- Минимальное количество дней доставки
maxDeliveryDays         Int?     -- Максимальное количество дней доставки
lastDeliveryDate        DateTime? -- Дата последней доставки
```

## 🔄 Процесс работы

### 1. Создание закупки (draft)
```typescript
// При создании закупки курс лиры НЕ сохраняется
// Цена в лирах рассчитывается по текущему курсу для отображения
const purchase = await createPurchase({
  items: cartItems,
  supplier: "Kalyon Company",
  // БЕЗ доставки - она учитывается только при оприходовании
});
```

### 2. Оплата закупки (paid)
```typescript
// При переходе в статус "paid" курс лиры ФИКСИРУЕТСЯ
await updatePurchaseStatus(id, 'paid');
// Автоматически сохраняется текущий курс лиры из базы
// exchangeRate = currentTRYRate
```

### 3. Оформление заказа (sent)
```typescript
// При изменении статуса на "sent" сохраняется orderDate
await updatePurchaseStatus(id, 'sent');
// Автоматически устанавливается orderDate = new Date()
```

### 4. Отслеживание времени в пути (in_transit)
```typescript
// В таблице отображается текущее время в пути
const daysInTransit = Math.ceil(
  (new Date().getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24)
);

// Цветовая индикация:
// 🟢 Зеленый: меньше ожидаемого срока
// 🟡 Желтый: близко к ожидаемому сроку  
// 🔴 Красный: просрочено
```

### 5. Оприходование товара (received)
```typescript
// Модальное окно с указанием фактических дней доставки И стоимости доставки
const receiveData = {
  deliveryDays: 18,              // Фактическое время доставки
  additionalExpenses: 1500,      // ДОСТАВКА учитывается ТОЛЬКО здесь
  notes: "Товар в хорошем состоянии"
};

await receivePurchase(purchaseId, receiveData);
```

### 6. Обновление статистики поставщика
```typescript
// Автоматически пересчитывается среднее время доставки
await SupplierStatsService.updateDeliveryStats(
  supplier,
  deliveryDays, 
  orderDate,
  receivedDate
);
```

## 🎨 UI компоненты

### Таблица закупок с колонкой "Время доставки"
```tsx
// Отображение времени доставки в зависимости от статуса
const getDeliveryInfo = (purchase: Purchase) => {
  switch (purchase.status) {
    case 'draft':
      return <span className="text-gray-400">—</span>;
    
    case 'in_transit':
      const daysInTransit = calculateDaysInTransit(purchase.orderDate);
      const expectedDays = getExpectedDays(purchase.supplier);
      
      if (daysInTransit > expectedDays + 3) {
        return (
          <div className="text-red-600">
            <span>{daysInTransit} дней</span>
            <span className="text-xs">Просрочено</span>
          </div>
        );
      }
      break;
    
    case 'received':
      return (
        <div className="text-green-600">
          <span>{purchase.deliveryDays} дней</span>
          <span className="text-xs">Доставлено</span>
        </div>
      );
  }
};
```

### Модальное окно оприходования
```tsx
<ReceivePurchaseModal
  isOpen={showReceiveModal}
  onClose={() => setShowReceiveModal(false)}
  purchaseId={purchase.id}
  purchaseName={getMainProduct(purchase.items)}
  onReceived={handleReceiveSuccess}
/>
```

## 🔌 API Endpoints

### POST `/api/purchases/{id}/receive`
Оприходование закупки с указанием времени доставки
```typescript
interface ReceivePurchaseRequest {
  deliveryDays: number;                    // Количество дней доставки (обязательно)
  receivedQuantities?: Record<number, number>; // Полученное количество по товарам
  additionalExpenses?: number;             // Дополнительные расходы на логистику
  notes?: string;                         // Примечания при получении
}
```

### GET `/api/suppliers/stats`
Получение статистики по всем поставщикам
```typescript
interface SupplierStatsResponse {
  supplier: string;
  avgDeliveryDays: number;
  totalPurchases: number;
  completedPurchases: number;
  completionRate: number;
  minDeliveryDays: number;
  maxDeliveryDays: number;
  lastDeliveryDate: Date;
}
```

## 📊 Аналитика и отчеты

### Статистика поставщиков
```typescript
// Топ-5 самых быстрых поставщиков
const fastestSuppliers = await SupplierStatsService.getAllSuppliersStats();
fastestSuppliers
  .sort((a, b) => a.avgDeliveryDays - b.avgDeliveryDays)
  .slice(0, 5);

// Поставщики с просрочками
const problematicSuppliers = fastestSuppliers.filter(
  s => s.avgDeliveryDays > 25
);
```

### Прогнозирование сроков
```typescript
// Ожидаемая дата поставки
const expectedDate = await SupplierStatsService.calculateExpectedDeliveryDate(
  supplier,
  orderDate
);

// Статус доставки (досрочно/в срок/просрочено)
const deliveryStatus = SupplierStatsService.getDeliveryStatus(
  orderDate,
  receivedDate,
  expectedDays
);
```

## 🚀 Использование

### 1. Запуск тестирования системы
```bash
npm run test:delivery
```

### 2. Создание закупки с поставщиком
```typescript
const purchase = await createPurchase({
  items: cartItems,
  supplier: "Kalyon Company",  // Указываем поставщика
  notes: "Заказ на февраль 2025"
});
```

### 3. Отправка заказа поставщику
```typescript
// При отправке автоматически сохраняется orderDate
await updatePurchaseStatus(purchase.id, 'sent');
```

### 4. Оприходование с указанием времени
```typescript
// Пользователь указывает фактическое время доставки
await receivePurchase(purchase.id, {
  deliveryDays: 15,  // Фактически доставили за 15 дней
  additionalExpenses: 2000,
  notes: "Все товары в отличном состоянии"
});
```

## 📈 Метрики

### KPI системы
- **Среднее время доставки по поставщикам** - основной показатель
- **Процент просроченных поставок** - % заказов доставленных позже ожидаемого
- **Точность прогнозов** - отклонение фактического времени от прогнозного
- **Количество досрочных поставок** - % заказов доставленных раньше срока

### Цветовая индикация
- 🟢 **Зеленый** - досрочно (на 2+ дня раньше)
- 🟡 **Желтый** - в срок (±2 дня от ожидаемого)
- 🔴 **Красный** - просрочено (на 3+ дня позже)

## 🔮 Планы развития

### Фаза 1 (Текущая)
- ✅ Базовое отслеживание времени доставки
- ✅ Модальное окно оприходования
- ✅ Колонка времени доставки в таблице
- ✅ API для оприходования

### Фаза 2 (После миграции)
- 📊 Полная статистика поставщиков
- 🎯 Автоматические прогнозы времени доставки  
- 📈 Аналитический дашборд
- 🔔 Уведомления о просрочках

### Фаза 3 (Будущее)
- 🗺️ Интеграция с картами и логистикой
- 📱 Push-уведомления о статусе доставки
- 🤖 ML-модели для прогнозирования
- 📊 Подробная аналитика по регионам

## 🛠️ Техническая реализация

### Миграция базы данных
```bash
npx prisma migrate dev --name add_delivery_tracking
npx prisma generate
```

### Обновление существующих закупок
```sql
-- Для существующих закупок со статусом "received" 
-- можно установить приблизительное время доставки
UPDATE purchases 
SET deliveryDays = 20, supplierDeliveryDays = 20
WHERE status = 'received' AND deliveryDays IS NULL;
```

### Конфигурация по умолчанию
```typescript
const DEFAULT_DELIVERY_DAYS = 20;  // По умолчанию 20 дней
const EARLY_THRESHOLD = -2;        // Досрочно если на 2+ дня раньше  
const LATE_THRESHOLD = 3;          // Просрочено если на 3+ дня позже
```

---

## 📞 Поддержка

По вопросам работы системы отслеживания времени доставки обращайтесь к документации API или используйте команду тестирования `npm run test:delivery` для проверки функционала. 