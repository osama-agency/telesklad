import { useState, useEffect, useCallback } from 'react';
import { Currency } from '@/types/currency';

interface UseCurrencyRatesResult {
  data: number | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refetch: () => Promise<void>;
}

export const useCurrencyRates = (currency: 'TRY'): UseCurrencyRatesResult => {
  const [data, setData] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchRate = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Проверяем наличие API endpoint для курсов
      const response = await fetch(`/api/exchange-rates/latest?currency=${currency}`);
      
      if (!response.ok) {
        // Fallback: пробуем получить из сервиса
        console.warn(`Exchange rates API not available, using fallback for ${currency}`);
        throw new Error('Exchange rates API not available');
      }
      
      const result = await response.json();
      setData(Number(result.rate || result.rateWithBuffer));
      setLastUpdated(new Date());
    } catch (err) {
      console.warn(`Failed to fetch ${currency} rate:`, err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      
      // Fallback курсы
      const fallbackRates = {
        TRY: 30 // 1 лира ≈ 30 рублей (приблизительный курс)
      };
      
      setData(fallbackRates[currency]);
      setLastUpdated(new Date());
    } finally {
      setIsLoading(false);
    }
  }, [currency]);

  useEffect(() => {
    fetchRate();
    
    // Обновление каждые 30 минут
    const interval = setInterval(fetchRate, 30 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [fetchRate]);

  const refetch = useCallback(async () => {
    await fetchRate();
  }, [fetchRate]);

  return { 
    data, 
    isLoading, 
    error, 
    lastUpdated,
    refetch
  };
};

// Хук для получения всех курсов валют
interface UseAllCurrencyRatesResult {
  rates: { [key in Currency]?: number };
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refetch: () => Promise<void>;
}

export const useAllCurrencyRates = (): UseAllCurrencyRatesResult => {
  const [rates, setRates] = useState<{ [key in Currency]?: number }>({ RUB: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchAllRates = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Для TRY делаем запрос
      const tryResponse = await fetch('/api/exchange-rates/latest?currency=TRY');
      
      if (tryResponse.ok) {
        const tryResult = await tryResponse.json();
        setRates({
          RUB: 1, // Базовая валюта
          TRY: Number(tryResult.rate || tryResult.rateWithBuffer)
        });
      } else {
        // Fallback курсы
        setRates({
          RUB: 1,
          TRY: 30
        });
      }
      
      setLastUpdated(new Date());
    } catch (err) {
      console.warn('Failed to fetch all currency rates:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      
      // Fallback курсы
      setRates({
        RUB: 1,
        TRY: 30
      });
      setLastUpdated(new Date());
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllRates();
    
    // Обновление каждые 30 минут
    const interval = setInterval(fetchAllRates, 30 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [fetchAllRates]);

  const refetch = useCallback(async () => {
    await fetchAllRates();
  }, [fetchAllRates]);

  return {
    rates,
    isLoading,
    error,
    lastUpdated,
    refetch
  };
};

// Простой хук для быстрого получения курса TRY
export const useTRYRate = () => {
  const { data: rate, isLoading, error } = useCurrencyRates('TRY');
  
  return {
    tryRate: rate,
    isLoading,
    error,
    // Удобная функция для конвертации из рублей в лиры
    convertRubToTry: useCallback((amountRub: number) => {
      if (!rate) return null;
      return amountRub / rate;
    }, [rate]),
    // Удобная функция для конвертации из лир в рубли
    convertTryToRub: useCallback((amountTry: number) => {
      if (!rate) return null;
      return amountTry * rate;
    }, [rate])
  };
};