import { Currency, CurrencyAmount } from '@/types/currency';
import { ExchangeRateService } from '@/lib/services/exchange-rate.service';

export class CurrencyUtils {
  /**
   * Форматирование валют с правильными символами
   */
  static formatCurrency(amount: number, currency: Currency): string {
    const formatters = {
      RUB: new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        currencyDisplay: 'symbol'
      }),
      TRY: new Intl.NumberFormat('tr-TR', {
        style: 'currency', 
        currency: 'TRY',
        currencyDisplay: 'symbol'
      })
    };

    return formatters[currency].format(amount);
  }

  /**
   * Простое форматирование с символом валюты
   */
  static formatAmount(amount: number, currency: Currency): string {
    const symbols = {
      RUB: '₽',
      TRY: '₺'
    };

    const formatted = amount.toLocaleString('ru-RU', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });

    return `${formatted} ${symbols[currency]}`;
  }

  /**
   * Определение валюты по контексту товара закупки
   */
  static detectCurrency(item: any): Currency {
    // Приоритет: TRY поля, затем RUB поля, затем fallback
    if (item.unitcosttry || item.totalcosttry) {
      return 'TRY';
    }
    
    if (item.unitcostrub || item.totalcostrub) {
      return 'RUB';
    }

    // По умолчанию считаем рубли
    return 'RUB';
  }

  /**
   * Получение цены товара в правильной валюте
   */
  static getItemPrice(item: any): { price: number; currency: Currency } {
    // Приоритет лирам
    if (item.unitcosttry) {
      return { price: Number(item.unitcosttry), currency: 'TRY' };
    }
    
    if (item.unitcostrub) {
      return { price: Number(item.unitcostrub), currency: 'RUB' };
    }
    
    // Fallback на costprice (предполагаем рубли)
    return { price: Number(item.costprice || 0), currency: 'RUB' };
  }

  /**
   * Получение общей стоимости товара в правильной валюте
   */
  static getItemTotal(item: any): { total: number; currency: Currency } {
    // Приоритет лирам
    if (item.totalcosttry) {
      return { total: Number(item.totalcosttry), currency: 'TRY' };
    }
    
    if (item.totalcostrub) {
      return { total: Number(item.totalcostrub), currency: 'RUB' };
    }
    
    // Fallback на total (предполагаем рубли)
    return { total: Number(item.total || 0), currency: 'RUB' };
  }

  /**
   * Создание CurrencyAmount объекта
   */
  static createAmount(value: number, currency: Currency): CurrencyAmount {
    return {
      value,
      currency,
      displayValue: this.formatAmount(value, currency)
    };
  }

  /**
   * Конвертация с актуальным курсом и создание CurrencyAmount
   */
  static async convertAmount(
    amount: number, 
    from: Currency, 
    to: Currency
  ): Promise<CurrencyAmount> {
    if (from === to) {
      return this.createAmount(amount, from);
    }

    let convertedValue: number;
    let rate: number;

    if (from === 'TRY' && to === 'RUB') {
      // Конвертация из лир в рубли
      const rateData = await ExchangeRateService.getLatestRate('TRY');
      rate = Number(rateData.rateWithBuffer);
      convertedValue = amount * rate;
    } else if (from === 'RUB' && to === 'TRY') {
      // Конвертация из рублей в лиры
      const rateData = await ExchangeRateService.getLatestRate('TRY');
      rate = Number(rateData.rateWithBuffer);
      convertedValue = amount / rate;
    } else {
      throw new Error(`Unsupported currency conversion: ${from} to ${to}`);
    }

    const primaryAmount = this.createAmount(amount, from);
    
    return {
      ...primaryAmount,
      convertedValue: {
        value: convertedValue,
        currency: to,
        rate,
        displayValue: this.formatAmount(convertedValue, to)
      }
    };
  }

  /**
   * Получение отображаемой цены в формате "Основная валюта (≈ Конвертированная)"
   * Теперь основная цена в лирах, конвертированная в рублях (как в Telegram)
   */
  static async getDisplayPrice(
    amountRub: number,
    showConverted: boolean = true
  ): Promise<{
    primary: string;    // "50.2 ₺"
    secondary?: string; // "(≈ 1 500 ₽)"
    full: string;       // "50.2 ₺ (≈ 1 500 ₽)"
  }> {
    try {
      // Конвертируем рубли в лиры для основного отображения
      const convertedAmount = await this.convertAmount(amountRub, 'RUB', 'TRY');
      const primary = convertedAmount.convertedValue?.displayValue || this.formatAmount(0, 'TRY');
      
      if (!showConverted) {
        return {
          primary,
          full: primary
        };
      }

      // Рубли показываем в скобочках
      const secondary = `(≈ ${this.formatAmount(amountRub, 'RUB')})`;
      
      return {
        primary,
        secondary,
        full: `${primary} ${secondary}`
      };
    } catch (error) {
      console.warn('Failed to convert currency for display:', error);
      // Fallback: показываем только рубли
      const primary = this.formatAmount(amountRub, 'RUB');
      return {
        primary,
        full: primary
      };
    }
  }

  /**
   * Безопасное получение числового значения
   */
  static toNumber(value: any): number {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  }

  /**
   * Проверка валидности валюты
   */
  static isValidCurrency(currency: string): currency is Currency {
    return currency === 'RUB' || currency === 'TRY';
  }
}