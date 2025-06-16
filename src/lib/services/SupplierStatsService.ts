import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class SupplierStatsService {
  
  /**
   * Получить среднее количество дней доставки для поставщика
   */
  static async getAvgDeliveryDays(supplier: string): Promise<number> {
    try {
      const stats = await prisma.supplierStats.findUnique({
        where: { supplier }
      });

      return stats?.avgDeliveryDays || 20.0; // По умолчанию 20 дней
    } catch (error) {
      console.error('Ошибка получения статистики поставщика:', error);
      return 20.0;
    }
  }

  /**
   * Обновить статистику поставщика при оприходовании товара
   */
  static async updateDeliveryStats(
    supplier: string, 
    deliveryDays: number,
    orderDate: Date,
    receivedDate: Date
  ): Promise<void> {
    try {
      await prisma.$transaction(async (tx) => {
        // Получаем текущую статистику или создаем новую
        const currentStats = await tx.supplierStats.upsert({
          where: { supplier },
          create: {
            supplier,
            totalPurchases: 1,
            completedPurchases: 1,
            avgDeliveryDays: deliveryDays,
            totalDeliveryDays: deliveryDays,
            minDeliveryDays: deliveryDays,
            maxDeliveryDays: deliveryDays,
            lastDeliveryDate: receivedDate,
          },
          update: {
            completedPurchases: {
              increment: 1
            },
            totalDeliveryDays: {
              increment: deliveryDays
            },
            lastDeliveryDate: receivedDate,
          }
        });

        // Пересчитываем среднее значение
        const newAvgDeliveryDays = 
          (currentStats.totalDeliveryDays + deliveryDays) / 
          (currentStats.completedPurchases + 1);

        // Обновляем статистику
        await tx.supplierStats.update({
          where: { supplier },
          data: {
            avgDeliveryDays: newAvgDeliveryDays,
            minDeliveryDays: currentStats.minDeliveryDays 
              ? Math.min(currentStats.minDeliveryDays, deliveryDays)
              : deliveryDays,
            maxDeliveryDays: currentStats.maxDeliveryDays
              ? Math.max(currentStats.maxDeliveryDays, deliveryDays)
              : deliveryDays,
          }
        });
      });

      console.log(`📊 Обновлена статистика поставщика ${supplier}: ${deliveryDays} дней доставки`);
    } catch (error) {
      console.error('Ошибка обновления статистики поставщика:', error);
    }
  }

  /**
   * Инкрементировать общее количество закупок
   */
  static async incrementTotalPurchases(supplier: string): Promise<void> {
    try {
      await prisma.supplierStats.upsert({
        where: { supplier },
        create: {
          supplier,
          totalPurchases: 1,
          completedPurchases: 0,
          avgDeliveryDays: 20.0,
        },
        update: {
          totalPurchases: {
            increment: 1
          }
        }
      });
    } catch (error) {
      console.error('Ошибка инкремента общих закупок:', error);
    }
  }

  /**
   * Получить статистику по всем поставщикам
   */
  static async getAllSuppliersStats() {
    try {
      const stats = await prisma.supplierStats.findMany({
        orderBy: {
          avgDeliveryDays: 'asc'
        }
      });

      return stats.map(stat => ({
        supplier: stat.supplier,
        avgDeliveryDays: Math.round(stat.avgDeliveryDays * 10) / 10,
        totalPurchases: stat.totalPurchases,
        completedPurchases: stat.completedPurchases,
        minDeliveryDays: stat.minDeliveryDays,
        maxDeliveryDays: stat.maxDeliveryDays,
        completionRate: stat.totalPurchases > 0 
          ? Math.round((stat.completedPurchases / stat.totalPurchases) * 100)
          : 0,
        lastDeliveryDate: stat.lastDeliveryDate,
      }));
    } catch (error) {
      console.error('Ошибка получения статистики поставщиков:', error);
      return [];
    }
  }

  /**
   * Рассчитать ожидаемую дату поставки
   */
  static async calculateExpectedDeliveryDate(
    supplier: string, 
    orderDate: Date
  ): Promise<Date> {
    const avgDays = await this.getAvgDeliveryDays(supplier);
    const expectedDate = new Date(orderDate);
    expectedDate.setDate(expectedDate.getDate() + Math.ceil(avgDays));
    return expectedDate;
  }

  /**
   * Получить статус доставки (в срок, просрочено, рано)
   */
  static getDeliveryStatus(
    orderDate: Date, 
    receivedDate: Date, 
    expectedDays: number
  ): {
    status: 'early' | 'ontime' | 'late';
    actualDays: number;
    deviation: number;
  } {
    const actualDays = Math.ceil(
      (receivedDate.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    const deviation = actualDays - expectedDays;
    
    let status: 'early' | 'ontime' | 'late';
    if (deviation <= -2) {
      status = 'early';
    } else if (deviation >= 3) {
      status = 'late';
    } else {
      status = 'ontime';
    }

    return {
      status,
      actualDays,
      deviation
    };
  }
} 