import { prisma } from '@/libs/prismaDb';
import { Decimal } from '@prisma/client/runtime/library';

// const prisma = new PrismaClient(); // <--- REMOVED

interface CBRResponse {
  Date: string;
  PreviousDate: string;
  PreviousURL: string;
  Timestamp: string;
  Valute: {
    [key: string]: {
      ID: string;
      NumCode: string;
      CharCode: string;
      Nominal: number;
      Name: string;
      Value: number;
      Previous: number;
    };
  };
}

export class ExchangeRateService {
  /**
   * Получить курсы валют от ЦБ РФ
   */
  static async fetchCBRRates(): Promise<CBRResponse> {
    const response = await fetch('https://www.cbr-xml-daily.ru/daily_json.js');
    if (!response.ok) {
      throw new Error(`Failed to fetch CBR rates: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Обновить курс валюты в базе данных
   */
  static async updateExchangeRate(
    currency: string,
    rate: number,
    bufferPercent: number = 5.0,
    source: string = 'CBR'
  ) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Проверяем, есть ли уже запись на сегодня
    const existingRate = await prisma.exchange_rates.findUnique({
      where: {
        currency_effectiveDate: {
          currency,
          effectiveDate: today,
        },
      },
    });

    if (existingRate) {
      console.log(`Exchange rate for ${currency} already exists for ${today.toISOString()}`);
      return existingRate;
    }

    // Рассчитываем курс с буфером
    const rateWithBuffer = rate * (1 + bufferPercent / 100);

    // Создаем новую запись с уникальным ID
    const id = `${currency}_${today.toISOString().split('T')[0]}`;
    const newRate = await prisma.exchange_rates.create({
      data: {
        id,
        currency,
        rate: new Decimal(rate),
        rateWithBuffer: new Decimal(rateWithBuffer),
        bufferPercent: new Decimal(bufferPercent),
        source,
        effectiveDate: today,
      },
    });

    console.log(`Created exchange rate for ${currency}: ${rate} RUB (with buffer: ${rateWithBuffer})`);
    return newRate;
  }

  /**
   * Обновить курс TRY из данных ЦБ РФ
   */
  static async updateTRYRate() {
    try {
      const cbrData = await this.fetchCBRRates();
      
      if (!cbrData.Valute.TRY) {
        throw new Error('TRY rate not found in CBR response');
      }

      const tryData = cbrData.Valute.TRY;
      // Важно: Value показывает стоимость Nominal единиц валюты
      // Для TRY: Nominal = 10, значит Value = стоимость 10 лир
      // Нужно разделить на Nominal чтобы получить курс за 1 лиру
      const tryRate = tryData.Value / tryData.Nominal;
      
      console.log(`CBR TRY data: Value=${tryData.Value}, Nominal=${tryData.Nominal}, Rate per unit=${tryRate}`);
      
      await this.updateExchangeRate('TRY', tryRate);
      
      return { success: true, rate: tryRate };
    } catch (error) {
      console.error('Failed to update TRY rate:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Получить актуальный курс валюты с буфером
   */
  static async getLatestRate(currency: string) {
    const rate = await prisma.exchange_rates.findFirst({
      where: { currency },
      orderBy: { effectiveDate: 'desc' },
    });

    if (!rate) {
      throw new Error(`No exchange rate found for ${currency}`);
    }

    return rate;
  }

  /**
   * Получить курс валюты на конкретную дату
   */
  static async getRateForDate(currency: string, date: Date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const rate = await prisma.exchange_rates.findFirst({
      where: {
        currency,
        effectiveDate: {
          lte: startOfDay,
        },
      },
      orderBy: { effectiveDate: 'desc' },
    });

    if (!rate) {
      throw new Error(`No exchange rate found for ${currency} on or before ${date.toISOString()}`);
    }

    return rate;
  }

  /**
   * Рассчитать новую среднюю закупочную цену
   */
  static calculateMovingAverage(
    currentStock: number,
    currentAvgPrice: number,
    newQuantity: number,
    newPricePerUnit: number
  ): number {
    if (currentStock + newQuantity === 0) {
      return 0;
    }

    const totalValue = currentStock * currentAvgPrice + newQuantity * newPricePerUnit;
    return totalValue / (currentStock + newQuantity);
  }

  /**
   * Конвертировать цену из валюты в рубли
   */
  static async convertToRub(amount: number, currency: string, date?: Date): Promise<number> {
    if (currency === 'RUB') {
      return amount;
    }

    const rate = date 
      ? await this.getRateForDate(currency, date)
      : await this.getLatestRate(currency);

    return amount * Number(rate.rateWithBuffer);
  }

  /**
   * Конвертировать цену из рублей в валюту
   */
  static async convertFromRub(amount: number, currency: string, date?: Date): Promise<number> {
    if (currency === 'RUB') {
      return amount;
    }

    const rate = date 
      ? await this.getRateForDate(currency, date)
      : await this.getLatestRate(currency);

    return amount / Number(rate.rateWithBuffer);
  }
} 