import { startExchangeRateCron, updateExchangeRatesManually } from './exchange-rate-cron';

export async function initializeCronJobs() {
  console.log('Initializing cron jobs...');
  
  // Запускаем cron-задачу для обновления курсов валют
  startExchangeRateCron();
  
  // При первом запуске проверяем и обновляем курсы
  try {
    console.log('Checking exchange rates on startup...');
    await updateExchangeRatesManually();
  } catch (error) {
    console.error('Failed to update exchange rates on startup:', error);
  }
  
  console.log('Cron jobs initialized');
} 