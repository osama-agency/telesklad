import { ExchangeRateService } from '../exchange-rate.service';

describe('Purchase Integration', () => {
  describe('Purchase with currency conversion', () => {
    it('should correctly update average price after purchase in TRY', async () => {
      // Моделируем сценарий:
      // 1. Текущий остаток: 100 единиц со средней ценой 500 RUB
      // 2. Новая закупка: 50 единиц по 150 TRY
      // 3. Курс TRY: 3.2 RUB (с буфером 5% = 3.36 RUB)
      
      const currentStock = 100;
      const currentAvgPrice = 500; // RUB
      const newQuantity = 50;
      const priceInTry = 150;
      const tryRate = 3.2;
      const bufferPercent = 5;
      
      // Рассчитываем цену в рублях с буфером
      const rateWithBuffer = tryRate * (1 + bufferPercent / 100);
      const priceInRub = priceInTry * rateWithBuffer;
      
      // Рассчитываем новую среднюю цену
      const newAvgPrice = ExchangeRateService.calculateMovingAverage(
        currentStock,
        currentAvgPrice,
        newQuantity,
        priceInRub
      );
      
      // Ожидаемый результат:
      // priceInRub = 150 * 3.36 = 504 RUB
      // newAvg = (100 * 500 + 50 * 504) / 150 = (50000 + 25200) / 150 = 501.33
      
      expect(priceInRub).toBeCloseTo(504, 2);
      expect(newAvgPrice).toBeCloseTo(501.33, 2);
    });

    it('should handle multiple purchases with different currencies', async () => {
      // Начальное состояние: пустой склад
      let stock = 0;
      let avgPrice = 0;
      
      // Первая закупка: 100 единиц по 1000 RUB
      const purchase1 = {
        quantity: 100,
        pricePerUnit: 1000,
        currency: 'RUB'
      };
      
      avgPrice = ExchangeRateService.calculateMovingAverage(
        stock,
        avgPrice,
        purchase1.quantity,
        purchase1.pricePerUnit
      );
      stock += purchase1.quantity;
      
      expect(avgPrice).toBe(1000);
      expect(stock).toBe(100);
      
      // Вторая закупка: 200 единиц по 250 TRY (курс 3.2, буфер 5%)
      const purchase2 = {
        quantity: 200,
        pricePerUnit: 250,
        currency: 'TRY',
        rate: 3.2,
        buffer: 5
      };
      
      const priceInRub2 = purchase2.pricePerUnit * purchase2.rate * (1 + purchase2.buffer / 100);
      avgPrice = ExchangeRateService.calculateMovingAverage(
        stock,
        avgPrice,
        purchase2.quantity,
        priceInRub2
      );
      stock += purchase2.quantity;
      
      // priceInRub2 = 250 * 3.2 * 1.05 = 840 RUB
      // avgPrice = (100 * 1000 + 200 * 840) / 300 = (100000 + 168000) / 300 = 893.33
      
      expect(priceInRub2).toBe(840);
      expect(avgPrice).toBeCloseTo(893.33, 2);
      expect(stock).toBe(300);
      
      // Третья закупка: 100 единиц по 300 TRY (курс изменился на 3.5, буфер 5%)
      const purchase3 = {
        quantity: 100,
        pricePerUnit: 300,
        currency: 'TRY',
        rate: 3.5,
        buffer: 5
      };
      
      const priceInRub3 = purchase3.pricePerUnit * purchase3.rate * (1 + purchase3.buffer / 100);
      avgPrice = ExchangeRateService.calculateMovingAverage(
        stock,
        avgPrice,
        purchase3.quantity,
        priceInRub3
      );
      stock += purchase3.quantity;
      
      // priceInRub3 = 300 * 3.5 * 1.05 = 1102.5 RUB
      // avgPrice = (300 * 893.33 + 100 * 1102.5) / 400 = (268000 + 110250) / 400 = 945.625
      
      expect(priceInRub3).toBe(1102.5);
      expect(avgPrice).toBeCloseTo(945.625, 3);
      expect(stock).toBe(400);
    });

    it('should calculate profit correctly after sales', () => {
      // Средняя закупочная цена: 850 RUB
      // Продажа: 10 единиц по 1200 RUB каждая
      
      const avgPurchasePrice = 850;
      const saleQuantity = 10;
      const salePricePerUnit = 1200;
      
      const revenue = saleQuantity * salePricePerUnit;
      const cost = saleQuantity * avgPurchasePrice;
      const profit = revenue - cost;
      const profitMargin = (profit / revenue) * 100;
      
      expect(revenue).toBe(12000);
      expect(cost).toBe(8500);
      expect(profit).toBe(3500);
      expect(profitMargin).toBeCloseTo(29.17, 2);
    });
  });
}); 