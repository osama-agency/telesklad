// Демонстрация системы отслеживания времени доставки
// Работает без базы данных - показывает логику и интерфейс

interface Purchase {
  id: number;
  status: string;
  createdAt: Date;
  orderDate?: Date;
  receivedDate?: Date;
  deliveryDays?: number;
  supplier?: string;
  totalAmount: number;
  items: Array<{
    id: number;
    productName: string;
    quantity: number;
  }>;
}

// Имитация данных
const mockPurchases: Purchase[] = [
  {
    id: 1,
    status: 'draft',
    createdAt: new Date('2025-01-15'),
    totalAmount: 1500,
    items: [
      { id: 1, productName: 'Kalyon Универсальный очиститель', quantity: 10 }
    ]
  },
  {
    id: 2,
    status: 'in_transit',
    createdAt: new Date('2025-01-20'),
    orderDate: new Date('2025-01-21'),
    supplier: 'Kalyon Company',
    totalAmount: 3200,
    items: [
      { id: 2, productName: 'Kalyon Средство для посуды', quantity: 15 },
      { id: 3, productName: 'Kalyon Средство для стекол', quantity: 8 }
    ]
  },
  {
    id: 3,
    status: 'received',
    createdAt: new Date('2025-01-10'),
    orderDate: new Date('2025-01-11'),
    receivedDate: new Date('2025-01-28'),
    deliveryDays: 17,
    supplier: 'Turkish Supplier Ltd',
    totalAmount: 2800,
    items: [
      { id: 4, productName: 'Продукт A', quantity: 12 }
    ]
  }
];

function calculateDaysInTransit(orderDate: Date): number {
  const now = new Date();
  return Math.ceil((now.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24));
}

function getDeliveryStatus(
  orderDate: Date, 
  receivedDate: Date, 
  expectedDays: number = 20
): { status: string; deviation: number; color: string } {
  const actualDays = Math.ceil(
    (receivedDate.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  const deviation = actualDays - expectedDays;
  
  let status: string;
  let color: string;
  
  if (deviation <= -2) {
    status = 'Досрочно';
    color = '🟢';
  } else if (deviation >= 3) {
    status = 'Просрочено';
    color = '🔴';
  } else {
    status = 'В срок';
    color = '🟡';
  }

  return { status, deviation, color };
}

function getDeliveryInfo(purchase: Purchase): string {
  const expectedDays = 20; // По умолчанию

  switch (purchase.status) {
    case 'draft':
      return '—';
    
    case 'in_transit': {
      if (!purchase.orderDate) return 'Нет даты заказа';
      
      const daysInTransit = calculateDaysInTransit(purchase.orderDate);
      
      if (daysInTransit > expectedDays + 3) {
        return `🔴 ${daysInTransit} дней (Просрочено на ${daysInTransit - expectedDays} дн.)`;
      } else if (daysInTransit >= expectedDays - 2) {
        return `🟡 ${daysInTransit} дней (Ожидается ~${expectedDays} дн.)`;
      } else {
        return `🟢 ${daysInTransit} дней (Ожидается ~${expectedDays} дн.)`;
      }
    }
    
    case 'received': {
      if (!purchase.orderDate || !purchase.receivedDate) {
        return `🟢 ${purchase.deliveryDays || 'N/A'} дней (Доставлено)`;
      }
      
      const deliveryStatus = getDeliveryStatus(
        purchase.orderDate,
        purchase.receivedDate,
        expectedDays
      );
      
      return `${deliveryStatus.color} ${purchase.deliveryDays} дней (${deliveryStatus.status})`;
    }
    
    case 'cancelled':
      return 'Отменено';
    
    default:
      return '—';
  }
}

function demonstrateDeliveryTracking() {
  console.log('🚀 Демонстрация системы отслеживания времени доставки\n');

  console.log('📊 Таблица закупок с колонкой "Время доставки":');
  console.log('┌─────┬──────────────────────────────┬─────────────┬─────────────────────────────────┐');
  console.log('│ ID  │ Товары                       │ Статус      │ Время доставки                  │');
  console.log('├─────┼──────────────────────────────┼─────────────┼─────────────────────────────────┤');

  mockPurchases.forEach(purchase => {
    const mainProduct = purchase.items[0]?.productName || 'Нет товаров';
    const displayName = purchase.items.length > 1 
      ? `${mainProduct.substring(0, 20)}... +${purchase.items.length - 1} др.`
      : mainProduct.substring(0, 28);
    
    const statusText = {
      'draft': 'Черновик',
      'in_transit': 'В пути',
      'received': 'Получено',
      'cancelled': 'Отменено'
    }[purchase.status] || purchase.status;

    console.log(
      `│ ${purchase.id.toString().padEnd(3)} │ ${displayName.padEnd(28)} │ ${statusText.padEnd(11)} │ ${getDeliveryInfo(purchase).padEnd(31)} │`
    );
  });

  console.log('└─────┴──────────────────────────────┴─────────────┴─────────────────────────────────┘');

  console.log('\n🎯 Ключевые особенности системы:');
  console.log('   ✅ Автоматический расчет времени в пути');
  console.log('   ✅ Цветовая индикация: 🟢 досрочно, 🟡 в срок, 🔴 просрочено');
  console.log('   ✅ Сравнение с ожидаемым временем доставки (20 дней по умолчанию)');
  console.log('   ✅ Отображение отклонений от плана');

  console.log('\n📝 Процесс оприходования:');
  console.log('1. Пользователь нажимает "Оприходовать" для закупки со статусом "В пути"');
  console.log('2. Открывается модальное окно с полями:');
  console.log('   • Количество дней доставки (обязательно)');
  console.log('   • Дополнительные расходы на логистику');
  console.log('   • Примечания при получении');
  console.log('3. При сохранении:');
  console.log('   • Обновляется статус закупки на "Получено"');
  console.log('   • Увеличивается остаток товаров на складе');
  console.log('   • Сохраняется фактическое время доставки');
  console.log('   • Обновляется статистика поставщика (после миграции)');

  console.log('\n📊 API Endpoints:');
  console.log('POST /api/purchases/{id}/receive');
  console.log('  - Оприходование с указанием дней доставки');
  console.log('GET /api/suppliers/stats');
  console.log('  - Статистика времени доставки по поставщикам');

  console.log('\n🔧 Пример вызова API:');
  console.log(`
fetch('/api/purchases/123/receive', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    deliveryDays: 18,
    additionalExpenses: 1500,
    notes: "Товар в отличном состоянии"
  })
});`);

  console.log('\n🎉 Система готова к использованию!');
  console.log('📋 Для запуска приложения: npm run dev');
  console.log('🔧 Для применения миграции: npx prisma migrate dev');
}

// Запуск демонстрации
demonstrateDeliveryTracking(); 