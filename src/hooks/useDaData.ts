import { useState, useCallback, useRef } from 'react';

interface DaDataSuggestion {
  value: string;
  unrestricted_value: string;
  data: any;
}

interface DaDataResponse {
  suggestions: DaDataSuggestion[];
}

interface UseDaDataOptions {
  debounceMs?: number;
  minQueryLength?: number;
  maxSuggestions?: number;
}

interface UseDaDataReturn {
  suggestions: DaDataSuggestion[];
  isLoading: boolean;
  error: string | null;
  getSuggestions: (query: string, options?: any) => Promise<void>;
  clearSuggestions: () => void;
}

export function useDaDataAddress(options: UseDaDataOptions = {}): UseDaDataReturn {
  const {
    debounceMs = 300,
    minQueryLength = 2,
    maxSuggestions = 10
  } = options;

  const [suggestions, setSuggestions] = useState<DaDataSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<NodeJS.Timeout>();
  const abortControllerRef = useRef<AbortController>();

  const getSuggestions = useCallback(async (query: string, requestOptions?: any) => {
    // Очищаем предыдущий таймер
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Отменяем предыдущий запрос
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    if (!query || query.trim().length < minQueryLength) {
      setSuggestions([]);
      setError(null);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      try {
        setIsLoading(true);
        setError(null);

        abortControllerRef.current = new AbortController();

        const response = await fetch('/api/webapp/dadata/address', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: query.trim(),
            count: maxSuggestions,
            ...requestOptions
          }),
          signal: abortControllerRef.current.signal
        });

        if (!response.ok) {
          let errorData: any = { error: 'Unknown error' };
          try {
            errorData = await response.json();
          } catch (e) {
            // Игнорируем ошибку парсинга JSON
          }
          console.error('DaData API error:', response.status, errorData);
          throw new Error(errorData.error || 'Ошибка получения подсказок');
        }

        const data: DaDataResponse = await response.json();
        setSuggestions(data.suggestions || []);
        
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('DaData error:', err);
          setError(err.message || 'Ошибка получения подсказок адреса');
          setSuggestions([]);
        }
      } finally {
        setIsLoading(false);
      }
    }, debounceMs);
  }, [debounceMs, minQueryLength, maxSuggestions]);

  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
    setError(null);
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  return {
    suggestions,
    isLoading,
    error,
    getSuggestions,
    clearSuggestions
  };
}

export function useDaDataFIO(options: UseDaDataOptions = {}): UseDaDataReturn {
  const {
    debounceMs = 300,
    minQueryLength = 2,
    maxSuggestions = 10
  } = options;

  const [suggestions, setSuggestions] = useState<DaDataSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<NodeJS.Timeout>();
  const abortControllerRef = useRef<AbortController>();

  const getSuggestions = useCallback(async (query: string, requestOptions?: any) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    if (!query || query.trim().length < minQueryLength) {
      setSuggestions([]);
      setError(null);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      try {
        setIsLoading(true);
        setError(null);

        abortControllerRef.current = new AbortController();

        const response = await fetch('/api/webapp/dadata/fio', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: query.trim(),
            count: maxSuggestions,
            ...requestOptions
          }),
          signal: abortControllerRef.current.signal
        });

        if (!response.ok) {
          let errorData: any = { error: 'Unknown error' };
          try {
            errorData = await response.json();
          } catch (e) {
            // Игнорируем ошибку парсинга JSON
          }
          console.error('DaData API error:', response.status, errorData);
          throw new Error(errorData.error || 'Ошибка получения подсказок');
        }

        const data: DaDataResponse = await response.json();
        setSuggestions(data.suggestions || []);
        
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          setError('Ошибка получения подсказок ФИО');
          setSuggestions([]);
        }
      } finally {
        setIsLoading(false);
      }
    }, debounceMs);
  }, [debounceMs, minQueryLength, maxSuggestions]);

  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
    setError(null);
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  return {
    suggestions,
    isLoading,
    error,
    getSuggestions,
    clearSuggestions
  };
} 