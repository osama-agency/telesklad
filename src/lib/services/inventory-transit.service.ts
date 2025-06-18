import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface TransitItem {
  productId: number;
  quantity: number;
  productName: string;
  purchaseId: number;
  status: string;
  createdAt: Date;
}

export interface TransitSummary {
  productId: number;
  productName: string;
  totalInTransit: number;
  stockQuantity: number;
  activePurchases: {
    purchaseId: number;
    quantity: number;
    status: string;
    createdAt: Date;
  }[];
}

export class InventoryTransitService {
  /**
   * Добавить товары в транзит при создании закупки
   */
  static async addItemsToTransit(purchaseId: number): Promise<void> {
    try {
      console.log(`📦 Adding items to transit for purchase #${purchaseId}`);

      // Получаем элементы закупки
      const purchaseItems = await (prisma as any).purchase_items.findMany({
        where: { purchaseid: purchaseId },
        include: {
          products: true
        }
      });

      if (!purchaseItems || purchaseItems.length === 0) {
        console.log(`⚠️ No items found for purchase #${purchaseId}`);
        return;
      }

      // Обновляем количество в транзите для каждого товара
      for (const item of purchaseItems) {
        const currentTransit = item.products.quantity_in_transit || 0;
        const newTransitQuantity = currentTransit + item.quantity;

        await (prisma as any).products.update({
          where: { id: item.productid },
          data: {
            quantity_in_transit: newTransitQuantity,
            updated_at: new Date()
          }
        });

        console.log(`✅ Product #${item.productid} (${item.productname}): +${item.quantity} in transit (total: ${newTransitQuantity})`);
      }

      console.log(`✅ Successfully added items to transit for purchase #${purchaseId}`);
    } catch (error) {
      console.error(`❌ Error adding items to transit for purchase #${purchaseId}:`, error);
      throw error;
    }
  }

  /**
   * Удалить товары из транзита при получении закупки
   */
  static async removeItemsFromTransit(purchaseId: number): Promise<void> {
    try {
      console.log(`📥 Removing items from transit for purchase #${purchaseId}`);

      // Получаем элементы закупки
      const purchaseItems = await (prisma as any).purchase_items.findMany({
        where: { purchaseid: purchaseId },
        include: {
          products: true
        }
      });

      if (!purchaseItems || purchaseItems.length === 0) {
        console.log(`⚠️ No items found for purchase #${purchaseId}`);
        return;
      }

      // Обновляем количество в транзите и на складе для каждого товара
      for (const item of purchaseItems) {
        const currentTransit = item.products.quantity_in_transit || 0;
        const currentStock = item.products.stock_quantity || 0;
        
        const newTransitQuantity = Math.max(0, currentTransit - item.quantity);
        const newStockQuantity = currentStock + item.quantity;

        await (prisma as any).products.update({
          where: { id: item.productid },
          data: {
            quantity_in_transit: newTransitQuantity,
            stock_quantity: newStockQuantity,
            updated_at: new Date()
          }
        });

        console.log(`✅ Product #${item.productid} (${item.productname}): -${item.quantity} from transit, +${item.quantity} to stock`);
        console.log(`   Transit: ${currentTransit} → ${newTransitQuantity}, Stock: ${currentStock} → ${newStockQuantity}`);
      }

      console.log(`✅ Successfully removed items from transit for purchase #${purchaseId}`);
    } catch (error) {
      console.error(`❌ Error removing items from transit for purchase #${purchaseId}:`, error);
      throw error;
    }
  }

  /**
   * Отменить товары в транзите при отмене закупки
   */
  static async cancelItemsInTransit(purchaseId: number): Promise<void> {
    try {
      console.log(`❌ Cancelling items in transit for purchase #${purchaseId}`);

      // Получаем элементы закупки
      const purchaseItems = await (prisma as any).purchase_items.findMany({
        where: { purchaseid: purchaseId },
        include: {
          products: true
        }
      });

      if (!purchaseItems || purchaseItems.length === 0) {
        console.log(`⚠️ No items found for purchase #${purchaseId}`);
        return;
      }

      // Уменьшаем количество в транзите для каждого товара
      for (const item of purchaseItems) {
        const currentTransit = item.products.quantity_in_transit || 0;
        const newTransitQuantity = Math.max(0, currentTransit - item.quantity);

        await (prisma as any).products.update({
          where: { id: item.productid },
          data: {
            quantity_in_transit: newTransitQuantity,
            updated_at: new Date()
          }
        });

        console.log(`✅ Product #${item.productid} (${item.productname}): -${item.quantity} from transit (cancelled)`);
        console.log(`   Transit: ${currentTransit} → ${newTransitQuantity}`);
      }

      console.log(`✅ Successfully cancelled items in transit for purchase #${purchaseId}`);
    } catch (error) {
      console.error(`❌ Error cancelling items in transit for purchase #${purchaseId}:`, error);
      throw error;
    }
  }

  /**
   * Получить сводку по товарам в транзите
   */
  static async getTransitSummary(): Promise<TransitSummary[]> {
    try {
      console.log(`📊 Getting transit summary`);

      // Получаем товары с количеством в транзите > 0
      const productsInTransit = await (prisma as any).products.findMany({
        where: {
          quantity_in_transit: {
            gt: 0
          }
        },
        select: {
          id: true,
          name: true,
          stock_quantity: true,
          quantity_in_transit: true
        }
      });

      const summary: TransitSummary[] = [];

      for (const product of productsInTransit) {
        // Получаем активные закупки для этого товара
        const activePurchases = await (prisma as any).purchase_items.findMany({
          where: {
            productid: product.id,
            purchases: {
              status: {
                in: ['sent', 'awaiting_payment', 'paid', 'shipped']
              }
            }
          },
          include: {
            purchases: {
              select: {
                id: true,
                status: true,
                createdat: true
              }
            }
          }
        });

        summary.push({
          productId: Number(product.id),
          productName: product.name || 'Unknown Product',
          totalInTransit: product.quantity_in_transit || 0,
          stockQuantity: product.stock_quantity || 0,
          activePurchases: activePurchases.map((item: any) => ({
            purchaseId: item.purchases.id,
            quantity: item.quantity,
            status: item.purchases.status,
            createdAt: item.purchases.createdat
          }))
        });
      }

      console.log(`✅ Found ${summary.length} products in transit`);
      return summary;
    } catch (error) {
      console.error(`❌ Error getting transit summary:`, error);
      throw error;
    }
  }

  /**
   * Получить детали товаров в транзите для конкретного товара
   */
  static async getProductTransitDetails(productId: number): Promise<TransitSummary | null> {
    try {
      console.log(`📊 Getting transit details for product #${productId}`);

      const product = await (prisma as any).products.findUnique({
        where: { id: BigInt(productId) },
        select: {
          id: true,
          name: true,
          stock_quantity: true,
          quantity_in_transit: true
        }
      });

      if (!product) {
        console.log(`⚠️ Product #${productId} not found`);
        return null;
      }

      // Получаем активные закупки для этого товара
      const activePurchases = await (prisma as any).purchase_items.findMany({
        where: {
          productid: BigInt(productId),
          purchases: {
            status: {
              in: ['sent', 'awaiting_payment', 'paid', 'shipped']
            }
          }
        },
        include: {
          purchases: {
            select: {
              id: true,
              status: true,
              createdat: true
            }
          }
        }
      });

      const details: TransitSummary = {
        productId: Number(product.id),
        productName: product.name || 'Unknown Product',
        totalInTransit: product.quantity_in_transit || 0,
        stockQuantity: product.stock_quantity || 0,
        activePurchases: activePurchases.map((item: any) => ({
          purchaseId: item.purchases.id,
          quantity: item.quantity,
          status: item.purchases.status,
          createdAt: item.purchases.createdat
        }))
      };

      console.log(`✅ Found transit details for product #${productId}: ${details.totalInTransit} in transit`);
      return details;
    } catch (error) {
      console.error(`❌ Error getting transit details for product #${productId}:`, error);
      throw error;
    }
  }

  /**
   * Синхронизировать количество в транзите (для исправления несоответствий)
   */
  static async syncTransitQuantities(): Promise<void> {
    try {
      console.log(`🔄 Syncing transit quantities`);

      // Получаем все товары
      const products = await (prisma as any).products.findMany({
        select: {
          id: true,
          name: true,
          quantity_in_transit: true
        }
      });

      let syncedCount = 0;

      for (const product of products) {
        // Подсчитываем реальное количество в активных закупках
        const activeItems = await (prisma as any).purchase_items.findMany({
          where: {
            productid: product.id,
            purchases: {
              status: {
                in: ['sent', 'awaiting_payment', 'paid', 'shipped']
              }
            }
          }
        });

        const actualTransitQuantity = activeItems.reduce((sum: number, item: any) => sum + item.quantity, 0);
        const currentTransitQuantity = product.quantity_in_transit || 0;

        if (actualTransitQuantity !== currentTransitQuantity) {
          await (prisma as any).products.update({
            where: { id: product.id },
            data: {
              quantity_in_transit: actualTransitQuantity,
              updated_at: new Date()
            }
          });

          console.log(`🔄 Synced product #${product.id} (${product.name}): ${currentTransitQuantity} → ${actualTransitQuantity}`);
          syncedCount++;
        }
      }

      console.log(`✅ Sync completed. Updated ${syncedCount} products`);
    } catch (error) {
      console.error(`❌ Error syncing transit quantities:`, error);
      throw error;
    }
  }
}

export default InventoryTransitService; 