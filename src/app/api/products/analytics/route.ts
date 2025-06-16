import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/libs/prismaDb';

interface ProductAnalytics {
  id: string;
  name: string;
  brand: string;
  
  // ОСТАТКИ И ЗАПАСЫ
  currentStock: number;
  inTransitQuantity: number;
  totalAvailable: number;
  
  // СКОРОСТЬ ПРОДАЖ
  avgDailySales: number;
  daysUntilZero: number;
  stockStatus: 'critical' | 'low' | 'normal' | 'excess';
  
  // РЕКОМЕНДАЦИИ ПО ЗАКУПКАМ
  recommendedOrderQuantity: number;
  optimalStockLevel: number;
  
  // ФИНАНСОВЫЕ ПОКАЗАТЕЛИ
  avgPurchasePrice: number;
  avgpurchasepricetry: number;
  prime_cost: number;
  avgSalePrice: number;
  profitMargin: number;
  profitMarginBasic: number;
  deliveryCostPerUnit: number;
  allocatedExpensesPerUnit: number;
  profitPerUnit: number;
  totalRealProfit: number;
  roi: number;
  
  // ДИНАМИКА И ТРЕНДЫ
  salesTrend: 'growing' | 'stable' | 'declining';
  salesVariability: 'stable' | 'moderate' | 'volatile';
  seasonalityFactor: number;
  
  // ABC/XYZ КЛАССИФИКАЦИЯ
  abcClass: 'A' | 'B' | 'C';
  xyzClass: 'X' | 'Y' | 'Z';
  
  // ПОКАЗАТЕЛИ ОБОРАЧИВАЕМОСТИ
  inventoryTurnover: number;
  avgInventoryValue: number;
  daysInInventory: number;
}

// Функция расчета тренда продаж
function calculateSalesTrend(dailySales: number[]): 'growing' | 'stable' | 'declining' {
  if (dailySales.length < 7) return 'stable';
  
  const firstHalf = dailySales.slice(0, Math.floor(dailySales.length / 2));
  const secondHalf = dailySales.slice(Math.floor(dailySales.length / 2));
  
  const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
  
  const growthRate = (secondAvg - firstAvg) / firstAvg;
  
  if (growthRate > 0.1) return 'growing';
  if (growthRate < -0.1) return 'declining';
  return 'stable';
}

// Функция расчета коэффициента вариации для XYZ
function calculateCoefficientOfVariation(values: number[]): number {
  if (values.length < 2) return 0;
  
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (values.length - 1);
  const stdDev = Math.sqrt(variance);
  
  return mean > 0 ? (stdDev / mean) * 100 : 0;
}

// Функция определения статуса остатков
function getStockStatus(daysUntilZero: number): 'critical' | 'low' | 'normal' | 'excess' {
  if (daysUntilZero <= 7) return 'critical';
  if (daysUntilZero <= 14) return 'low';
  if (daysUntilZero <= 60) return 'normal';
  return 'excess';
}

// Функция расчета рекомендованного количества для заказа
function calculateRecommendedOrder(
  avgDailySales: number,
  currentStock: number,
  inTransit: number,
  leadTimeDays: number = 14,
  safetyStockDays: number = 7
): number {
  const totalAvailable = currentStock + inTransit;
  const demandDuringLeadTime = avgDailySales * leadTimeDays;
  const safetyStock = avgDailySales * safetyStockDays;
  const optimalStock = demandDuringLeadTime + safetyStock;
  
  const recommendedOrder = Math.max(0, optimalStock - totalAvailable);
  
  // Округляем до разумного количества (кратно 5 или 10)
  if (recommendedOrder < 10) return Math.ceil(recommendedOrder);
  if (recommendedOrder < 50) return Math.ceil(recommendedOrder / 5) * 5;
  return Math.ceil(recommendedOrder / 10) * 10;
}

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Products Analytics API: Starting advanced analytics...');
    
    // ВРЕМЕННО ОТКЛЮЧЕНА АВТОРИЗАЦИЯ
    // const session = await getServerSession();
    // if (!session?.user?.email) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const { searchParams } = new URL(request.url);
    const period = parseInt(searchParams.get('period') || '30');
    
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - period);
    
    console.log(`📊 Starting analytics for ${period} days from ${fromDate.toISOString()}`);

    // 1. Получаем общие расходы за период из таблицы expenses
    let totalExpenses = 0;
    try {
      const expensesData = await (prisma as any).expenses.findMany({
        where: {
          date: {
            gte: fromDate.toISOString().split('T')[0], // YYYY-MM-DD format
            lte: new Date().toISOString().split('T')[0]
          }
        },
        select: {
          amount: true
        }
      });
      
      totalExpenses = expensesData.reduce((sum: number, expense: any) => sum + Number(expense.amount), 0);
      console.log(`💰 Total expenses for period: ${totalExpenses}₽`);
    } catch (error) {
      console.log(`⚠️ Could not fetch expenses: ${error}`);
      totalExpenses = 0;
    }

    // 2. Получаем общее количество проданных товаров за период для распределения расходов
    let totalSoldItems = 0;
    try {
      const totalSalesData = await (prisma as any).order_items.findMany({
        where: {
          orders: {
            paid_at: {
              gte: fromDate,
              lte: new Date()
            }
          }
        },
        select: {
          quantity: true
        }
      });
      
      totalSoldItems = totalSalesData.reduce((sum: number, item: any) => sum + item.quantity, 0);
      console.log(`📦 Total sold items for period: ${totalSoldItems} units`);
    } catch (error) {
      console.log(`⚠️ Could not fetch total sales: ${error}`);
      totalSoldItems = 1; // Избегаем деления на ноль
    }

    // 3. Рассчитываем расход на единицу товара
    const expensePerUnit = totalSoldItems > 0 ? totalExpenses / totalSoldItems : 0;
    console.log(`📊 Expense per unit: ${expensePerUnit.toFixed(2)}₽`);

    // 4. Получаем товары для анализа
    const products = await (prisma as any).products.findMany({
      where: {
        deleted_at: null,
        is_visible: true,
        ancestry: {
          contains: '/'
        }
      },
      select: {
        id: true,
        name: true,
        brand: true,
        ancestry: true,
        stock_quantity: true,
        price: true,
        prime_cost: true,
        avgpurchasepricerub: true
      }
    });

    console.log(`📊 Found ${products.length} products to analyze`);

    // Параллельно обрабатываем каждый товар
    const analyticsPromises = products.map(async (product: any): Promise<ProductAnalytics> => {
      
      // 1. Получаем данные о продажах за период по paid_at (только оплаченные заказы)
      const salesData = await (prisma as any).order_items.findMany({
        where: {
          product_id: product.id,
          orders: {
            paid_at: {
              gte: fromDate,
              lte: new Date()
            }
          }
        },
        include: {
          orders: {
            select: {
              paid_at: true,
              total_amount: true
            }
          }
        }
      });
      
      // 2. Получаем количество товара в пути из закупок
      const inTransitData = await (prisma as any).purchase_items.findMany({
        where: {
          productid: product.id,
          purchases: {
            status: {
              in: ['pending', 'ordered', 'shipped']
            }
          }
        },
        select: {
          quantity: true
        }
      });
      
      const inTransitQuantity = inTransitData.reduce((sum: number, item: any) => sum + item.quantity, 0);

      // 3. Расчеты по продажам
      const totalSold = salesData.reduce((sum: number, item: any) => sum + item.quantity, 0);
      const totalRevenue = salesData.reduce((sum: number, item: any) => sum + Number(item.total || item.price * item.quantity), 0);
      const avgDailySales = totalSold / period;
      
      // 4. Группируем продажи по дням для анализа тренда
      const salesByDay: { [key: string]: number } = {};
      salesData.forEach((item: any) => {
        if (item.orders?.paid_at) {
          const date = new Date(item.orders.paid_at).toISOString().split('T')[0];
          salesByDay[date] = (salesByDay[date] || 0) + item.quantity;
        }
      });

      // Создаем массив ежедневных продаж
      const dailySalesArray: number[] = [];
      for (let i = 0; i < period; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        dailySalesArray.push(salesByDay[dateStr] || 0);
      }

      // 5. Расчет основных показателей
      const currentStock = product.stock_quantity || 0;
      const totalAvailable = currentStock + inTransitQuantity;
      const daysUntilZero = avgDailySales > 0 ? Math.round(totalAvailable / avgDailySales) : 999;
      
      // 6. Финансовые расчеты с учетом расходов на доставку И общих расходов
      const avgPurchasePrice = Number(product.avgpurchasepricerub || product.prime_cost || 0);
      const avgpurchasepricetry = 0; // Пока что нет данных
      const prime_cost = Number(product.prime_cost || 0);
      const avgSalePrice = Number(product.price || 0);
      
      // РАСХОДЫ НА ДОСТАВКУ: 350₽ за каждую отправленную штуку
      const deliveryCostPerUnit = 350;
      const totalDeliveryCosts = totalSold * deliveryCostPerUnit;
      
      // ОБЩИЕ РАСХОДЫ: распределяем пропорционально количеству проданных товаров
      const allocatedExpensesPerUnit = expensePerUnit;
      const totalAllocatedExpenses = totalSold * allocatedExpensesPerUnit;
      
      // МАРЖА БЕЗ УЧЕТА РАСХОДОВ (старая формула)
      const profitMarginBasic = avgSalePrice > 0 && avgPurchasePrice > 0 
        ? ((avgSalePrice - avgPurchasePrice) / avgSalePrice) * 100 
        : 0;
      
      // РЕАЛЬНАЯ МАРЖА С УЧЕТОМ ДОСТАВКИ И ОБЩИХ РАСХОДОВ (новая формула)
      const realProfitMargin = avgSalePrice > 0 && avgPurchasePrice > 0
        ? ((avgSalePrice - avgPurchasePrice - deliveryCostPerUnit - allocatedExpensesPerUnit) / avgSalePrice) * 100
        : 0;
      
      // ПРИБЫЛЬ НА ЕДИНИЦУ (после всех расходов)
      const profitPerUnit = avgSalePrice - avgPurchasePrice - deliveryCostPerUnit - allocatedExpensesPerUnit;
      const totalRealProfit = profitPerUnit * totalSold;
      
      const roi = avgPurchasePrice > 0 ? ((avgSalePrice - avgPurchasePrice) / avgPurchasePrice) * 100 : 0;

      // 7. Тренд и вариативность
      const salesTrend = calculateSalesTrend(dailySalesArray);
      const coefficientOfVariation = calculateCoefficientOfVariation(dailySalesArray);
      
      let salesVariability: 'stable' | 'moderate' | 'volatile' = 'stable';
      if (coefficientOfVariation > 100) salesVariability = 'volatile';
      else if (coefficientOfVariation > 50) salesVariability = 'moderate';

      // 8. ABC классификация (упрощенная - по выручке)
      let abcClass: 'A' | 'B' | 'C' = 'C';
      if (totalRevenue > 50000) abcClass = 'A';
      else if (totalRevenue > 10000) abcClass = 'B';

      // 9. XYZ классификация
      let xyzClass: 'X' | 'Y' | 'Z' = 'Z';
      if (coefficientOfVariation < 10) xyzClass = 'X';
      else if (coefficientOfVariation < 25) xyzClass = 'Y';

      // 10. Показатели оборачиваемости
      const avgInventoryValue = avgPurchasePrice * (currentStock + inTransitQuantity / 2);
      const inventoryTurnover = avgInventoryValue > 0 ? (avgPurchasePrice * totalSold) / avgInventoryValue : 0;
      const daysInInventory = inventoryTurnover > 0 ? 365 / inventoryTurnover : 365;

      // 11. Рекомендации
      const recommendedOrderQuantity = calculateRecommendedOrder(
        avgDailySales, 
        currentStock, 
        inTransitQuantity
      );
      const optimalStockLevel = Math.ceil(avgDailySales * 21); // 3 недели запаса

      return {
        id: product.id.toString(), // Преобразуем BigInt в строку
        name: product.name,
        brand: product.brand || 'Не указан',
        
        // ОСТАТКИ И ЗАПАСЫ
        currentStock,
        inTransitQuantity,
        totalAvailable,
        
        // СКОРОСТЬ ПРОДАЖ
        avgDailySales: Number(avgDailySales.toFixed(2)),
        daysUntilZero,
        stockStatus: getStockStatus(daysUntilZero),
        
        // РЕКОМЕНДАЦИИ ПО ЗАКУПКАМ
        recommendedOrderQuantity,
        optimalStockLevel,
        
        // ФИНАНСОВЫЕ ПОКАЗАТЕЛИ
        avgPurchasePrice,
        avgpurchasepricetry,
        prime_cost,
        avgSalePrice,
        profitMargin: Number(realProfitMargin.toFixed(2)),
        profitMarginBasic: Number(profitMarginBasic.toFixed(2)),
        deliveryCostPerUnit,
        allocatedExpensesPerUnit: Number(allocatedExpensesPerUnit.toFixed(2)),
        profitPerUnit: Number(profitPerUnit.toFixed(2)),
        totalRealProfit: Number(totalRealProfit.toFixed(2)),
        roi: Number(roi.toFixed(2)),
        
        // ДИНАМИКА И ТРЕНДЫ
        salesTrend,
        salesVariability,
        seasonalityFactor: Number((coefficientOfVariation / 100).toFixed(2)),
        
        // ABC/XYZ КЛАССИФИКАЦИЯ
        abcClass,
        xyzClass,
        
        // ПОКАЗАТЕЛИ ОБОРАЧИВАЕМОСТИ
        inventoryTurnover: Number(inventoryTurnover.toFixed(2)),
        avgInventoryValue: Number(avgInventoryValue.toFixed(2)),
        daysInInventory: Number(daysInInventory.toFixed(0))
      };
    });

    const analytics = await Promise.all(analyticsPromises);
    
    // Сортируем по критичности (критические остатки сначала)
    const sortedAnalytics = analytics.sort((a: any, b: any) => {
      const statusOrder: { [key: string]: number } = { critical: 0, low: 1, normal: 2, excess: 3 };
      return statusOrder[a.stockStatus] - statusOrder[b.stockStatus];
    });

    console.log(`📊 Analytics completed for ${analytics.length} products`);

    return NextResponse.json({
      success: true,
      data: {
        products: sortedAnalytics,
        summary: {
          totalProducts: analytics.length,
          criticalStock: analytics.filter(p => p.stockStatus === 'critical').length,
          lowStock: analytics.filter(p => p.stockStatus === 'low').length,
          needsReorder: analytics.filter(p => p.recommendedOrderQuantity > 0).length,
          avgProfitMargin: Number((analytics.reduce((sum, p) => sum + p.profitMargin, 0) / analytics.length).toFixed(2))
        },
        period: {
          days: period,
          from: fromDate.toISOString(),
          to: new Date().toISOString()
        }
      }
    });

  } catch (error) {
    console.error('❌ Products Analytics API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' }, 
      { status: 500 }
    );
  }
} 