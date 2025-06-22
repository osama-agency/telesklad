import { ExchangeRateService } from './exchange-rate.service';
import { Decimal } from '@prisma/client/runtime/library';

export interface PurchaseAmounts {
  // Стоимость в лирах (если закупка в TRY)
  tryAmount?: {
    value: number;
    formatted: string;
  };
  // Рублевая стоимость на момент создания
  rubCreationAmount?: {
    value: number;
    formatted: string;
    rate: number;
  };
  // Рублевая стоимость на момент оплаты (если оплачена)
  rubPaymentAmount?: {
    value: number;
    formatted: string;
    rate: number;
  };
  // Основная валюта (для отображения)
  primaryCurrency: 'TRY' | 'RUB';
}

export interface PurchaseCalculationData {
  totalCostTry?: number | Decimal;
  exchangeRate?: number | Decimal;
  paidExchangeRate?: number | Decimal;
  totalAmount?: number;
  status: string;
  paidDate?: Date | string;
}

export class PurchaseCalculationService {
  /**
   * Форматирует число в валютном формате
   */
  static formatCurrency(amount: number, currency: 'TRY' | 'RUB'): string {
    const symbol = currency === 'TRY' ? '₺' : '₽';
    
    // Округляем до целых для отображения
    const roundedAmount = Math.round(amount);
    
    // Форматируем с пробелами между разрядами
    const formatted = new Intl.NumberFormat('ru-RU', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(roundedAmount);
    
    return `${formatted} ${symbol}`;
  }

  /**
   * Форматирует приблизительную сумму в рублях
   */
  static formatApproximate(amount: number): string {
    return `≈ ${this.formatCurrency(amount, 'RUB')}`;
  }

  /**
   * Рассчитывает все валютные суммы для закупки
   */
  static calculatePurchaseAmounts(data: PurchaseCalculationData): PurchaseAmounts {
    const result: PurchaseAmounts = {
      primaryCurrency: 'RUB'
    };

    // Если есть данные о TRY
    if (data.totalCostTry && data.exchangeRate) {
      const tryAmount = Number(data.totalCostTry);
      const creationRate = Number(data.exchangeRate);

      result.primaryCurrency = 'TRY';
      
      // Стоимость в лирах
      result.tryAmount = {
        value: tryAmount,
        formatted: this.formatCurrency(tryAmount, 'TRY')
      };

      // Рублевая стоимость на момент создания
      const rubCreationValue = tryAmount * creationRate;
      result.rubCreationAmount = {
        value: rubCreationValue,
        formatted: this.formatApproximate(rubCreationValue),
        rate: creationRate
      };

      // Рублевая стоимость на момент оплаты (если оплачена)
      if (data.status === 'paid' && data.paidExchangeRate) {
        const paymentRate = Number(data.paidExchangeRate);
        const rubPaymentValue = tryAmount * paymentRate;
        
        result.rubPaymentAmount = {
          value: rubPaymentValue,
          formatted: this.formatApproximate(rubPaymentValue),
          rate: paymentRate
        };
      }
    } else {
      // Закупка в рублях или без валютных данных
      result.primaryCurrency = 'RUB';
      
      if (data.totalAmount) {
        result.rubCreationAmount = {
          value: data.totalAmount,
          formatted: this.formatCurrency(data.totalAmount, 'RUB'),
          rate: 1
        };
      }
    }

    return result;
  }

  /**
   * Создает строку отображения для закупки в формате требований
   * Формат: "13 000 ₺", "≈ 27 000 ₽" (создание), "≈ 28 600 ₽" (оплата если есть)
   */
  static getDisplayString(data: PurchaseCalculationData): string {
    const amounts = this.calculatePurchaseAmounts(data);
    const parts: string[] = [];

    // Основная валюта (лиры или рубли)
    if (amounts.tryAmount) {
      parts.push(amounts.tryAmount.formatted);
    } else if (amounts.rubCreationAmount) {
      parts.push(amounts.rubCreationAmount.formatted);
      return parts.join(', '); // Для рублевых закупок возвращаем только основную сумму
    }

    // Рублевая сумма на момент создания
    if (amounts.rubCreationAmount && amounts.tryAmount) {
      parts.push(amounts.rubCreationAmount.formatted);
    }

    // Рублевая сумма на момент оплаты (если есть)
    if (amounts.rubPaymentAmount) {
      parts.push(`${amounts.rubPaymentAmount.formatted} (оплата)`);
    }

    return parts.join(', ');
  }

  /**
   * Получает структурированные данные для компонента отображения
   */
  static getStructuredAmounts(data: PurchaseCalculationData): {
    primary: { amount: number; currency: 'TRY' | 'RUB'; formatted: string };
    creation?: { amount: number; rate: number; formatted: string };
    payment?: { amount: number; rate: number; formatted: string };
  } {
    const amounts = this.calculatePurchaseAmounts(data);
    
    const result: any = {};

    // Основная валюта
    if (amounts.tryAmount) {
      result.primary = {
        amount: amounts.tryAmount.value,
        currency: 'TRY' as const,
        formatted: amounts.tryAmount.formatted
      };
    } else if (amounts.rubCreationAmount) {
      result.primary = {
        amount: amounts.rubCreationAmount.value,
        currency: 'RUB' as const,
        formatted: amounts.rubCreationAmount.formatted
      };
    }

    // Рублевая сумма на момент создания (только для TRY)
    if (amounts.rubCreationAmount && amounts.tryAmount) {
      result.creation = {
        amount: amounts.rubCreationAmount.value,
        rate: amounts.rubCreationAmount.rate,
        formatted: amounts.rubCreationAmount.formatted
      };
    }

    // Рублевая сумма на момент оплаты
    if (amounts.rubPaymentAmount) {
      result.payment = {
        amount: amounts.rubPaymentAmount.value,
        rate: amounts.rubPaymentAmount.rate,
        formatted: amounts.rubPaymentAmount.formatted
      };
    }

    return result;
  }

  /**
   * Рассчитывает разность между курсами создания и оплаты
   */
  static calculateRateDifference(data: PurchaseCalculationData): {
    hasRate: boolean;
    creationRate?: number;
    paymentRate?: number;
    difference?: number;
    differencePercent?: number;
    isPositive?: boolean;
  } {
    if (!data.exchangeRate || !data.paidExchangeRate || !data.totalCostTry) {
      return { hasRate: false };
    }

    const creationRate = Number(data.exchangeRate);
    const paymentRate = Number(data.paidExchangeRate);
    const difference = paymentRate - creationRate;
    const differencePercent = (difference / creationRate) * 100;

    return {
      hasRate: true,
      creationRate,
      paymentRate,
      difference,
      differencePercent,
      isPositive: difference > 0
    };
  }

  /**
   * Получает текстовое описание изменения курса
   */
  static getRateChangeDescription(data: PurchaseCalculationData): string | null {
    const rateDiff = this.calculateRateDifference(data);
    
    if (!rateDiff.hasRate) {
      return null;
    }

    const percent = Math.abs(rateDiff.differencePercent!).toFixed(1);
    const direction = rateDiff.isPositive ? 'вырос' : 'упал';
    
    return `Курс ${direction} на ${percent}% с момента создания`;
  }
}