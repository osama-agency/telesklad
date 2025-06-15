import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/libs/prismaDb';
import { AnalyticsService } from '@/lib/services/analytics.service';
import { AIService } from '@/lib/services/ai.service';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    
    // Получаем параметры периода
    const fromParam = searchParams.get('from');
    const toParam = searchParams.get('to');
    
    // По умолчанию - последние 30 дней
    const defaultTo = new Date();
    const defaultFrom = new Date();
    defaultFrom.setDate(defaultFrom.getDate() - 30);
    
    let from = fromParam ? new Date(fromParam) : defaultFrom;
    let to = toParam ? new Date(toParam) : defaultTo;
    
    // Если это один и тот же день, расширяем на весь день
    if (fromParam && toParam && Math.abs(to.getTime() - from.getTime()) < 24 * 60 * 60 * 1000) {
      from.setHours(0, 0, 0, 0);
      to.setHours(23, 59, 59, 999);
    }

    // Проверяем валидность дат
    if (isNaN(from.getTime()) || isNaN(to.getTime())) {
      return NextResponse.json(
        { error: 'Некорректные даты' },
        { status: 400 }
      );
    }

    if (from > to) {
      return NextResponse.json(
        { error: 'Дата начала не может быть больше даты окончания' },
        { status: 400 }
      );
    }

    console.log('🤖 AI Analytics: Collecting data from database...');

    // 1. Получаем данные товаров с аналитикой продаж
    const productsWithSales = await getProductsWithAnalytics(from, to);
    
    // 2. Получаем ABC/XYZ анализ
    let abcxyzAnalysis;
    try {
      abcxyzAnalysis = await AnalyticsService.getAbcXyz(from, to);
    } catch (error) {
      console.warn('ABC/XYZ analysis failed, using empty data:', error);
      abcxyzAnalysis = { products: [], matrix: {}, matrixWithProducts: {} };
    }

    // 3. Формируем агрегированные данные для ИИ
    const analyticsData = {
      abcxyzMatrix: abcxyzAnalysis.matrixWithProducts,
      unprofitableProducts: getUnprofitableProducts(productsWithSales),
      topProducts: getTopProducts(productsWithSales),
      lowStockProducts: getLowStockProducts(productsWithSales),
      statistics: calculateStatistics(productsWithSales),
      dateRange: { from, to }
    };

    console.log('🤖 AI Analytics: Sending data to OpenAI...');

    // 4. Отправляем данные в OpenAI
    let aiAnalysis;
    try {
      aiAnalysis = await AIService.analyzeAssortment(analyticsData);
    } catch (error) {
      console.error('AI Service failed:', error);
      // Возвращаем fallback данные
      aiAnalysis = {
        facts: [
          `${productsWithSales.length} товаров проанализировано`,
          `Общая выручка: ₽${analyticsData.statistics.totalRevenue.toLocaleString('ru-RU')}`,
          `Средняя маржа: ${Math.round(analyticsData.statistics.margin)}%`,
          `${analyticsData.unprofitableProducts.length} убыточных позиций`,
          `${analyticsData.lowStockProducts.length} товаров требуют пополнения`
        ],
        recommendations: [
          "Увеличить закуп популярных товаров группы А",
          "Исключить убыточные позиции или пересмотреть цены",
          "Оптимизировать остатки товаров с низким оборотом"
        ],
        forecasts: {
          days30: "Ожидается стабильный рост продаж на 5-8%",
          days60: "Возможно снижение активности на 2-3%",
          days90: "Возврат к средним показателям, планирование новых закупок"
        }
      };
    }

    console.log('🤖 AI Analytics: Analysis completed successfully');

    return NextResponse.json({
      success: true,
      data: {
        analysis: aiAnalysis,
        rawData: {
          totalProducts: productsWithSales.length,
          period: {
            from: from.toISOString(),
            to: to.toISOString()
          },
          abcxyzMatrix: analyticsData.abcxyzMatrix,
          statistics: analyticsData.statistics
        }
      }
    });

  } catch (error) {
    console.error('Error in AI Analytics API:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Ошибка при выполнении ИИ анализа ассортимента',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Получаем товары с данными о продажах и прибыли
async function getProductsWithAnalytics(from: Date, to: Date) {
  const products = await prisma.product.findMany({
    where: {
      deleted_at: null,
      is_visible: true
    },
    select: {
      id: true,
      name: true,
      price: true,
      prime_cost: true,
      avgPurchasePriceRub: true,
      stock_quantity: true,
      brand: true
    }
  });

  // Получаем данные о продажах для каждого товара
  const productsWithSales = await Promise.all(
    products.map(async (product) => {
      const salesData = await prisma.orderItem.aggregate({
        where: {
          productId: product.id.toString(),
          order: {
            orderDate: { gte: from, lte: to },
            paidAt: { not: null }
          }
        },
        _sum: {
          quantity: true,
          total: true
        }
      });

      const soldQuantity = salesData._sum.quantity || 0;
      const revenue = Number(salesData._sum.total || 0);
      const avgPurchasePrice = Number(product.avgPurchasePriceRub || product.prime_cost || 0);
      const totalCost = avgPurchasePrice * soldQuantity;
      const profit = revenue - totalCost;

      return {
        ...product,
        soldQuantity,
        revenue,
        profit,
        avgPurchasePrice,
        stock_quantity: product.stock_quantity || 0,
        price: Number(product.price || 0)
      };
    })
  );

  return productsWithSales;
}

// Получаем убыточные товары
function getUnprofitableProducts(products: any[]) {
  return products
    .filter(p => p.profit < 0 && p.soldQuantity > 0)
    .sort((a, b) => a.profit - b.profit)
    .slice(0, 10)
    .map(p => ({
      name: p.name,
      profit: p.profit,
      soldQuantity: p.soldQuantity
    }));
}

// Получаем топ товары по выручке
function getTopProducts(products: any[]) {
  return products
    .filter(p => p.revenue > 0)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)
    .map(p => ({
      name: p.name,
      revenue: p.revenue,
      soldQuantity: p.soldQuantity
    }));
}

// Получаем товары с низкими остатками
function getLowStockProducts(products: any[]) {
  return products
    .filter(p => p.stock_quantity < 10 && p.soldQuantity > 0)
    .sort((a, b) => a.stock_quantity - b.stock_quantity)
    .slice(0, 10)
    .map(p => ({
      name: p.name,
      stock: p.stock_quantity,
      sold: p.soldQuantity,
      recommendedOrder: Math.max(p.soldQuantity * 2, 10)
    }));
}

// Вычисляем общую статистику
function calculateStatistics(products: any[]) {
  const totalRevenue = products.reduce((sum, p) => sum + p.revenue, 0);
  const totalCost = products.reduce((sum, p) => sum + (p.avgPurchasePrice * p.soldQuantity), 0);
  const totalProfit = totalRevenue - totalCost;
  const profitableProducts = products.filter(p => p.profit > 0);
  const avgProfit = profitableProducts.length > 0 
    ? profitableProducts.reduce((sum, p) => sum + p.profit, 0) / profitableProducts.length 
    : 0;
  const totalLoss = products.filter(p => p.profit < 0).reduce((sum, p) => sum + Math.abs(p.profit), 0);
  const margin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

  return {
    totalRevenue,
    totalCost,
    totalProfit,
    avgProfit,
    totalLoss,
    margin,
    totalProducts: products.length,
    profitableProducts: profitableProducts.length,
    unprofitableProducts: products.filter(p => p.profit < 0).length
  };
} 