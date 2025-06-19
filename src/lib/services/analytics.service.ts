import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface AbcXyzAnalysis {
  productId: number;
  productName: string;
  revenue: number;
  salesCount: number;
  abc: 'A' | 'B' | 'C';
  xyz: 'X' | 'Y' | 'Z';
  coefficientOfVariation: number;
  revenueShare: number;
}

export interface AbcXyzMatrix {
  AX: number;
  AY: number;
  AZ: number;
  BX: number;
  BY: number;
  BZ: number;
  CX: number;
  CY: number;
  CZ: number;
}

export interface AbcXyzMatrixWithProducts {
  AX: { count: number; products: string[] };
  AY: { count: number; products: string[] };
  AZ: { count: number; products: string[] };
  BX: { count: number; products: string[] };
  BY: { count: number; products: string[] };
  BZ: { count: number; products: string[] };
  CX: { count: number; products: string[] };
  CY: { count: number; products: string[] };
  CZ: { count: number; products: string[] };
}

export class AnalyticsService {
  /**
   * Получить ABC/XYZ анализ товаров за период
   */
  static async getAbcXyz(
    from: Date, 
    to: Date
  ): Promise<{ products: AbcXyzAnalysis[]; matrix: AbcXyzMatrix; matrixWithProducts: AbcXyzMatrixWithProducts }> {
    try {
      // Получаем данные о продажах товаров за период
      const salesData = await prisma.order_items.groupBy({
        by: ['productid', 'name'],
        where: {
          orders: {
            orderdate: {
              gte: from,
              lte: to,
            },
            paidat: {
              not: null // только оплаченные заказы (paid_at !== null)
            }
          },
          productid: {
            not: null
          }
        },
        _sum: {
          total: true,
          quantity: true,
        },
        _count: {
          _all: true,
        },
      });

      if (salesData.length === 0) {
        return {
          products: [],
          matrix: {
            AX: 0, AY: 0, AZ: 0,
            BX: 0, BY: 0, BZ: 0,
            CX: 0, CY: 0, CZ: 0
          },
          matrixWithProducts: {
            AX: { count: 0, products: [] },
            AY: { count: 0, products: [] },
            AZ: { count: 0, products: [] },
            BX: { count: 0, products: [] },
            BY: { count: 0, products: [] },
            BZ: { count: 0, products: [] },
            CX: { count: 0, products: [] },
            CY: { count: 0, products: [] },
            CZ: { count: 0, products: [] }
          }
        };
      }

      // Получаем детальные данные продаж по дням для расчета коэффициента вариации
      const dailySalesPromises = salesData.map(async (item) => {
        const dailySales = await prisma.order_items.findMany({
          where: {
            productid: item.productid,
            orders: {
              orderdate: {
                gte: from,
                lte: to,
              },
              paidat: {
                not: null // только оплаченные заказы (paid_at !== null)
              }
            }
          },
          select: {
            quantity: true,
            orders: {
              select: {
                orderdate: true
              }
            }
          }
        });

        // Группируем по дням
        const dailyQuantities = this.groupSalesByDay(dailySales, from, to);
        const coefficientOfVariation = this.calculateCoefficientOfVariation(dailyQuantities);

        return {
          productId: parseInt(item.productid!),
          productName: item.name || 'Неизвестный товар',
          revenue: Number(item._sum?.total || 0),
          salesCount: item._sum?.quantity || 0,
          orderCount: item._count?._all || 0,
          coefficientOfVariation
        };
      });

      const productAnalysis = await Promise.all(dailySalesPromises);

      // Общая выручка
      const totalRevenue = productAnalysis.reduce((sum, p) => sum + p.revenue, 0);

      // Сортируем по выручке (убывание) для ABC анализа
      const sortedByRevenue = [...productAnalysis].sort((a, b) => b.revenue - a.revenue);

      // ABC анализ (по выручке)
      let cumulativeRevenue = 0;
      const abcAnalysis = sortedByRevenue.map((product) => {
        cumulativeRevenue += product.revenue;
        const revenueShare = (cumulativeRevenue / totalRevenue) * 100;
        
        let abc: 'A' | 'B' | 'C';
        if (revenueShare <= 80) {
          abc = 'A';
        } else if (revenueShare <= 95) {
          abc = 'B';
        } else {
          abc = 'C';
        }

        return {
          ...product,
          abc,
          revenueShare: (product.revenue / totalRevenue) * 100
        };
      });

      // XYZ анализ (по коэффициенту вариации)
      const result = abcAnalysis.map((product) => {
        let xyz: 'X' | 'Y' | 'Z';
        if (product.coefficientOfVariation <= 0.1) {
          xyz = 'X'; // стабильный спрос
        } else if (product.coefficientOfVariation <= 0.25) {
          xyz = 'Y'; // умеренная вариация
        } else {
          xyz = 'Z'; // высокая вариация
        }

        return {
          productId: product.productId,
          productName: product.productName,
          revenue: product.revenue,
          salesCount: product.salesCount,
          abc: product.abc,
          xyz,
          coefficientOfVariation: product.coefficientOfVariation,
          revenueShare: product.revenueShare
        };
      });

      // Строим матрицу для heat-map
      const matrix = this.buildAbcXyzMatrix(result);
      const matrixWithProducts = this.buildAbcXyzMatrixWithProducts(result);

      return {
        products: result,
        matrix,
        matrixWithProducts
      };

    } catch (error) {
      console.error('Error in ABC/XYZ analysis:', error);
      throw new Error('Failed to perform ABC/XYZ analysis');
    }
  }

  /**
   * Группировка продаж по дням
   */
  private static groupSalesByDay(
    sales: Array<{ quantity: number; orders: { orderdate: Date | null } }>,
    from: Date,
    to: Date
  ): number[] {
    const dayMap = new Map<string, number>();
    
    // Инициализируем все дни нулями
    const current = new Date(from);
    while (current <= to) {
      const key = current.toISOString().split('T')[0];
      dayMap.set(key, 0);
      current.setDate(current.getDate() + 1);
    }

    // Заполняем реальными данными
    sales.forEach(sale => {
      if (sale.orders.orderdate) {
        const day = sale.orders.orderdate.toISOString().split('T')[0];
        dayMap.set(day, (dayMap.get(day) || 0) + sale.quantity);
      }
    });

    return Array.from(dayMap.values());
  }

  /**
   * Расчет коэффициента вариации
   */
  private static calculateCoefficientOfVariation(values: number[]): number {
    if (values.length === 0) return 0;

    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    if (mean === 0) return 0;

    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const standardDeviation = Math.sqrt(variance);

    return standardDeviation / mean;
  }

  /**
   * Построение ABC/XYZ матрицы
   */
  private static buildAbcXyzMatrix(products: AbcXyzAnalysis[]): AbcXyzMatrix {
    const matrix: AbcXyzMatrix = {
      AX: 0, AY: 0, AZ: 0,
      BX: 0, BY: 0, BZ: 0,
      CX: 0, CY: 0, CZ: 0
    };

    products.forEach(product => {
      const key = `${product.abc}${product.xyz}` as keyof AbcXyzMatrix;
      matrix[key]++;
    });

    return matrix;
  }

  /**
   * Построение ABC/XYZ матрицы с названиями товаров
   */
  private static buildAbcXyzMatrixWithProducts(products: AbcXyzAnalysis[]): AbcXyzMatrixWithProducts {
    const matrix: AbcXyzMatrixWithProducts = {
      AX: { count: 0, products: [] },
      AY: { count: 0, products: [] },
      AZ: { count: 0, products: [] },
      BX: { count: 0, products: [] },
      BY: { count: 0, products: [] },
      BZ: { count: 0, products: [] },
      CX: { count: 0, products: [] },
      CY: { count: 0, products: [] },
      CZ: { count: 0, products: [] }
    };

    products.forEach(product => {
      const key = `${product.abc}${product.xyz}` as keyof AbcXyzMatrixWithProducts;
      matrix[key].count++;
      matrix[key].products.push(product.productName);
    });

    return matrix;
  }
} 