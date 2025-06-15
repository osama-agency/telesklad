import * as cron from 'node-cron';
import { ExchangeRateService } from '../services/exchange-rate.service';

// Запускаем задачу каждый день в 10:00
export const exchangeRateCron = cron.schedule(
  '0 10 * * *',
  async () => {
    console.log('Starting daily exchange rate update...');
    
    try {
      const result = await ExchangeRateService.updateTRYRate();
      
      if (result.success) {
        console.log(`Successfully updated TRY rate: ${result.rate} RUB`);
      } else {
        console.error(`Failed to update TRY rate: ${result.error}`);
      }
    } catch (error) {
      console.error('Error in exchange rate cron job:', error);
    }
  },
  {
    timezone: 'Europe/Moscow'
  }
);

// Останавливаем задачу сразу после создания
exchangeRateCron.stop();

// Функция для ручного запуска обновления курсов
export async function updateExchangeRatesManually() {
  console.log('Manually updating exchange rates...');
  return ExchangeRateService.updateTRYRate();
}

// Функция для запуска cron-задачи
export function startExchangeRateCron() {
  exchangeRateCron.start();
  console.log('Exchange rate cron job started');
}

// Функция для остановки cron-задачи
export function stopExchangeRateCron() {
  exchangeRateCron.stop();
  console.log('Exchange rate cron job stopped');
} 