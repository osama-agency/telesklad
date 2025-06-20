'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface FormPersistenceOptions<T> {
  key: string;
  initialData?: Partial<T>;
  debounceMs?: number;
  onDataChange?: (data: T) => void;
}

/**
 * Хук для автоматического сохранения и восстановления данных формы
 * Реализует debouncing для оптимизации производительности
 */
export function useFormPersistence<T extends Record<string, any>>({
  key,
  initialData = {},
  debounceMs = 300,
  onDataChange
}: FormPersistenceOptions<T>) {
  const [formData, setFormData] = useState<T>(initialData as T);
  const [isLoaded, setIsLoaded] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const debounceTimerRef = useRef<NodeJS.Timeout>();
  const isInitialLoadRef = useRef(true);

  // Загрузка данных из localStorage при монтировании
  useEffect(() => {
    const loadPersistedData = () => {
      try {
        const saved = localStorage.getItem(key);
        if (saved) {
          const parsed = JSON.parse(saved);
          // Проверяем, что данные не пустые
          const hasData = Object.values(parsed).some(value => 
            value !== null && value !== undefined && value !== '' && value !== 0
          );
          
          if (hasData) {
            setFormData(prev => ({ ...prev, ...parsed }));
          }
        }
      } catch (error) {
        console.warn(`Failed to load persisted data for key "${key}":`, error);
      } finally {
        setIsLoaded(true);
        isInitialLoadRef.current = false;
      }
    };

    // Загружаем данные из localStorage только если нет initialData
    const hasInitialData = Object.values(initialData).some(value => 
      value !== null && value !== undefined && value !== '' && value !== 0
    );

    if (!hasInitialData) {
      loadPersistedData();
    } else {
      setIsLoaded(true);
      isInitialLoadRef.current = false;
    }
  }, [key, initialData]);

  // Синхронизация с initialData (когда загружается профиль пользователя)
  useEffect(() => {
    if (isLoaded && initialData && !isInitialLoadRef.current) {
      const hasInitialData = Object.values(initialData).some(value => 
        value !== null && value !== undefined && value !== '' && value !== 0
      );
      
      if (hasInitialData) {
        setFormData(prev => ({ ...prev, ...initialData }));
      }
    }
  }, [initialData, isLoaded]);

  // Debounced сохранение в localStorage
  const saveToStorage = useCallback((data: T) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    setSaveStatus('saving');

    debounceTimerRef.current = setTimeout(() => {
      try {
        localStorage.setItem(key, JSON.stringify(data));
        setSaveStatus('saved');
        
        // Убираем индикатор "saved" через 1 секунду
        setTimeout(() => setSaveStatus('idle'), 1000);
      } catch (error) {
        console.warn(`Failed to save data to localStorage for key "${key}":`, error);
        setSaveStatus('idle');
      }
    }, debounceMs);
  }, [key, debounceMs]);

  // Уведомление родительского компонента об изменениях
  useEffect(() => {
    if (isLoaded && onDataChange && !isInitialLoadRef.current) {
      onDataChange(formData);
    }
  }, [formData, onDataChange, isLoaded]);

  // Автоматическое сохранение при изменении данных
  useEffect(() => {
    if (isLoaded && !isInitialLoadRef.current) {
      saveToStorage(formData);
    }
  }, [formData, saveToStorage, isLoaded]);

  // Функция для обновления отдельного поля
  const updateField = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // Функция для обновления нескольких полей одновременно
  const updateFields = useCallback((updates: Partial<T>) => {
    setFormData(prev => ({
      ...prev,
      ...updates
    }));
  }, []);

  // Функция для сброса формы
  const resetForm = useCallback(() => {
    setFormData(initialData as T);
    localStorage.removeItem(key);
    setSaveStatus('idle');
  }, [key, initialData]);

  // Функция для проверки валидности формы
  const isValid = useCallback((requiredFields: (keyof T)[]) => {
    return requiredFields.every(field => {
      const value = formData[field];
      return value !== null && value !== undefined && value !== '' && 
             (typeof value !== 'number' || value > 0);
    });
  }, [formData]);

  // Cleanup при размонтировании
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return {
    formData,
    updateField,
    updateFields,
    resetForm,
    isValid,
    isLoaded,
    saveStatus
  };
}

export default useFormPersistence;
