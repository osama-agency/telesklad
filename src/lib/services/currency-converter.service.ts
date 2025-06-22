import { ExchangeRateService } from './exchange-rate.service';
import { CurrencyUtils } from '@/lib/currency-utils';
import { Currency } from '@/types/currency';
import { prisma } from '@/libs/prismaDb';

export class CurrencyConverterService {
  /**
   * Конвертация элемента закупки в рубли с приоритетом полей
   */
  static async convertPurchaseItemToRub(item: any): Promise<number> {
    try {
      // Получаем цену и валюту с правильным приоритетом
      const { price, currency } = CurrencyUtils.getItemPrice(item);
      
      if (currency === 'RUB') {
        return price;
      }
      
      // Конвертируем в рубли
      return await ExchangeRateService.convertToRub(price, currency);
    } catch (error) {
      console.warn('Failed to convert purchase item to RUB:', error);
      
      // Fallback: пробуем разные поля
      if (item.unitcostrub) {
        return CurrencyUtils.toNumber(item.unitcostrub);
      }
      
      if (item.costprice) {
        return CurrencyUtils.toNumber(item.costprice);
      }
      
      return 0;
    }
  }

  /**
   * Конвертация общей стоимости товара в закупке в рубли
   */
  static async convertPurchaseItemTotalToRub(item: any): Promise<number> {
    try {
      // Получаем общую стоимость и валюту
      const { total, currency } = CurrencyUtils.getItemTotal(item);
      
      if (currency === 'RUB') {
        return total;
      }
      
      // Конвертируем в рубли
      return await ExchangeRateService.convertToRub(total, currency);
    } catch (error) {
      console.warn('Failed to convert purchase item total to RUB:', error);
      
      // Fallback: пробуем вычислить через цену за единицу
      const unitPriceRub = await this.convertPurchaseItemToRub(item);
      const quantity = CurrencyUtils.toNumber(item.quantity);
      
      return unitPriceRub * quantity;
    }
  }

  /**
   * Конвертация общей суммы закупки в рубли
   */
  static async convertPurchaseTotalToRub(purchase: any): Promise<number> {
    try {
      // Если есть items, считаем по ним, используя prime_cost
      if (purchase.purchase_items && Array.isArray(purchase.purchase_items)) {
        let totalRub = 0;
        
        for (const item of purchase.purchase_items) {
          const productId = item.productid || item.products?.id;
          if (!productId) {
            console.warn(`Skipping item without product ID in purchase ${purchase.id}`);
            continue;
          }
          
          const product = await (prisma as any).products.findUnique({
            where: { id: BigInt(productId) },
            select: { prime_cost: true }
          });
          
          if (product && product.prime_cost) {
            const primeCost = CurrencyUtils.toNumber(product.prime_cost);
            const quantity = CurrencyUtils.toNumber(item.quantity);
            totalRub += primeCost * quantity;
          } else {
             // Fallback, если себестоимость не найдена
            const itemTotalRub = await this.convertPurchaseItemTotalToRub(item);
            totalRub += itemTotalRub;
            console.warn(`Product with ID ${productId} not found or has no prime_cost. Using fallback calculation.`);
          }
        }
        
        return totalRub;
      }
      
      // Fallback: используем totalamount из purchase
      if (purchase.totalamount) {
        // Предполагаем, что totalamount в рублях (как в большинстве случаев)
        return CurrencyUtils.toNumber(purchase.totalamount);
      }
      
      return 0;
    } catch (error) {
      console.warn('Failed to convert purchase total to RUB:', error);
      return CurrencyUtils.toNumber(purchase.totalamount || 0);
    }
  }

  /**
   * Получение отображаемой цены в обеих валютах
   */
  static async getDisplayPrice(
    amountRub: number, 
    showConverted: boolean = true
  ): Promise<{
    primary: string;    // "1 500 ₽"
    secondary?: string; // "(≈ 50.2 ₺)"
    full: string;       // "1 500 ₽ (≈ 50.2 ₺)"
  }> {
    return await CurrencyUtils.getDisplayPrice(amountRub, showConverted);
  }

  /**
   * Получение отображаемой цены товара с оптимизацией
   */
  static async getItemDisplayPrice(
    item: any,
    showConverted: boolean = true
  ): Promise<{
    unitPrice: {
      primary: string;
      secondary?: string;
      full: string;
    };
    totalPrice: {
      primary: string;
      secondary?: string;
      full: string;
    };
  }> {
    try {
      const [unitPriceRub, totalPriceRub] = await Promise.all([
        this.convertPurchaseItemToRub(item),
        this.convertPurchaseItemTotalToRub(item)
      ]);

      const [unitPriceDisplay, totalPriceDisplay] = await Promise.all([
        this.getDisplayPrice(unitPriceRub, showConverted),
        this.getDisplayPrice(totalPriceRub, showConverted)
      ]);

      return {
        unitPrice: unitPriceDisplay,
        totalPrice: totalPriceDisplay
      };
    } catch (error) {
      console.warn('Failed to get item display price:', error);
      
      // Fallback
      const fallbackPrice = { primary: '0 ₽', full: '0 ₽' };
      return {
        unitPrice: fallbackPrice,
        totalPrice: fallbackPrice
      };
    }
  }

  /**
   * Пакетная конвертация для списка закупок
   */
  static async convertPurchasesBatch(purchases: any[]): Promise<any[]> {
    try {
      const convertedPurchases = await Promise.all(
        purchases.map(async (purchase) => {
          try {
            // Конвертируем общую сумму
            const totalAmountRub = await this.convertPurchaseTotalToRub(purchase);
            
            // Конвертируем товары
            const items = purchase.purchase_items ? await Promise.all(
              purchase.purchase_items.map(async (item: any) => {
                const [costPriceRub, totalRub] = await Promise.all([
                  this.convertPurchaseItemToRub(item),
                  this.convertPurchaseItemTotalToRub(item)
                ]);

                return {
                  ...item,
                  id: item.id ? String(item.id) : null,
                  productId: item.productid ? String(item.productid) : null,
                  productName: item.productname || item.products?.name || 'Неизвестный товар',
                  primeCost: item.products?.prime_cost ? Number(item.products.prime_cost) : null,
                  quantity: CurrencyUtils.toNumber(item.quantity),
                  costPriceRub,
                  totalRub,
                  // Дополнительные поля для истории
                  originalCostPrice: item.costprice,
                  unitCostRub: item.unitcostrub ? Number(item.unitcostrub) : null,
                  unitCostTry: item.unitcosttry ? Number(item.unitcosttry) : null,
                  totalCostRub: item.totalcostrub ? Number(item.totalcostrub) : null,
                  totalCostTry: item.totalcosttry ? Number(item.totalcosttry) : null
                };
              })
            ) : [];

            // Получаем отображаемую цену
            const totalAmountDisplay = await this.getDisplayPrice(totalAmountRub);

            return {
              ...purchase,
              id: purchase.id ? String(purchase.id) : null,
              userid: purchase.userid ? String(purchase.userid) : null,
              totalAmountRub,
              totalAmountDisplay,
              items,
              // Дополнительные поля
              createdAt: purchase.createdat || purchase.created_at || new Date().toISOString(),
              updatedAt: purchase.updatedat || purchase.updated_at || new Date().toISOString(),
              status: purchase.status || 'draft',
              isUrgent: Boolean(purchase.isurgent || purchase.is_urgent || false),
              expenses: Number(purchase.expenses || 0),
              user: purchase.users ? {
                id: String(purchase.users.id),
                email: purchase.users.email,
                firstName: purchase.users.first_name,
                lastName: purchase.users.last_name
              } : null,
              // Поля для Telegram
              telegramMessageId: purchase.telegrammessageid ? String(purchase.telegrammessageid) : null,
              telegramChatId: purchase.telegramchatid ? String(purchase.telegramchatid) : null,
              supplierName: purchase.suppliername || null,
              supplierPhone: purchase.supplierphone || null,
              supplierAddress: purchase.supplieraddress || null,
              notes: purchase.notes || null,
              deliveryDate: purchase.deliverydate || null,
              deliveryTrackingNumber: purchase.deliverytrackingnumber || null,
              deliveryStatus: purchase.deliverystatus || null,
              deliveryCarrier: purchase.deliverycarrier || null,
              deliveryNotes: purchase.deliverynotes || null,
              paymentButtonClicks: Number(purchase.paymentbuttonclicks || 0),
              paidDate: purchase.paiddate || null,
              paidExchangeRate: purchase.paidexchangerate ? Number(purchase.paidexchangerate) : null
            };
          } catch (purchaseError) {
            console.warn(`Failed to convert purchase ${purchase.id}:`, purchaseError);
            
            // Возвращаем исходные данные с минимальной обработкой
            return {
              ...purchase,
              id: purchase.id ? String(purchase.id) : null,
              totalAmountRub: CurrencyUtils.toNumber(purchase.totalamount || 0),
              totalAmountDisplay: { 
                primary: `${CurrencyUtils.toNumber(purchase.totalamount || 0)} ₽`, 
                full: `${CurrencyUtils.toNumber(purchase.totalamount || 0)} ₽` 
              },
              items: purchase.purchase_items || []
            };
          }
        })
      );

      return convertedPurchases;
    } catch (error) {
      console.error('Failed to convert purchases batch:', error);
      return purchases; // Возвращаем исходные данные в случае ошибки
    }
  }

  /**
   * Получение курса валют для отображения
   */
  static async getCurrentRates(): Promise<{ [key in Currency]?: number }> {
    try {
      const tryRate = await ExchangeRateService.getLatestRate('TRY');
      
      return {
        RUB: 1, // Базовая валюта
        TRY: Number(tryRate.rateWithBuffer)
      };
    } catch (error) {
      console.warn('Failed to get current rates:', error);
      return {
        RUB: 1,
        TRY: 30 // Fallback курс
      };
    }
  }
}