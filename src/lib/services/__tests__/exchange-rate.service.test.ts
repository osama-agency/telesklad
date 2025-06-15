import { ExchangeRateService } from '../exchange-rate.service';

describe('ExchangeRateService', () => {
  describe('calculateMovingAverage', () => {
    it('should calculate correct average for initial purchase', () => {
      const result = ExchangeRateService.calculateMovingAverage(
        0,    // currentStock
        0,    // currentAvgPrice
        100,  // newQuantity
        50    // newPricePerUnit
      );
      
      expect(result).toBe(50);
    });

    it('should calculate correct average for additional purchase', () => {
      const result = ExchangeRateService.calculateMovingAverage(
        100,  // currentStock
        50,   // currentAvgPrice
        50,   // newQuantity
        70    // newPricePerUnit
      );
      
      // (100 * 50 + 50 * 70) / (100 + 50) = (5000 + 3500) / 150 = 56.67
      expect(result).toBeCloseTo(56.67, 2);
    });

    it('should handle zero total quantity', () => {
      const result = ExchangeRateService.calculateMovingAverage(
        0,    // currentStock
        100,  // currentAvgPrice (ignored)
        0,    // newQuantity
        50    // newPricePerUnit
      );
      
      expect(result).toBe(0);
    });

    it('should calculate correct average with different prices', () => {
      const result = ExchangeRateService.calculateMovingAverage(
        200,  // currentStock
        100,  // currentAvgPrice
        100,  // newQuantity
        40    // newPricePerUnit (lower than current)
      );
      
      // (200 * 100 + 100 * 40) / (200 + 100) = (20000 + 4000) / 300 = 80
      expect(result).toBe(80);
    });

    it('should handle large quantities', () => {
      const result = ExchangeRateService.calculateMovingAverage(
        10000,  // currentStock
        75.5,   // currentAvgPrice
        5000,   // newQuantity
        82.3    // newPricePerUnit
      );
      
      // (10000 * 75.5 + 5000 * 82.3) / 15000 = (755000 + 411500) / 15000 = 77.77
      expect(result).toBeCloseTo(77.77, 2);
    });

    it('should handle decimal quantities and prices', () => {
      const result = ExchangeRateService.calculateMovingAverage(
        50.5,   // currentStock
        123.45, // currentAvgPrice
        25.25,  // newQuantity
        150.75  // newPricePerUnit
      );
      
      // (50.5 * 123.45 + 25.25 * 150.75) / (50.5 + 25.25) = (6234.225 + 3806.4375) / 75.75 = 132.55
      expect(result).toBeCloseTo(132.55, 2);
    });
  });
}); 