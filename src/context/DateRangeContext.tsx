'use client';

import React, { createContext, useContext, useState, ReactNode, useMemo, useCallback } from 'react';

export interface DateRange {
  from: Date | null;
  to: Date | null;
}

interface DateRangeContextType {
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
  resetToDefault: () => void;
  formatDateRange: () => string;
  formatMobileDateRange: () => string;
}

const DateRangeContext = createContext<DateRangeContextType | undefined>(undefined);

// Функция для получения последних 30 дней по умолчанию
const getDefaultDateRange = (): DateRange => {
  const today = new Date();
  // Устанавливаем конец дня для сегодня
  today.setHours(23, 59, 59, 999);
  
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(today.getDate() - 30);
  // Устанавливаем начало дня для начальной даты
  thirtyDaysAgo.setHours(0, 0, 0, 0);
  
  return {
    from: thirtyDaysAgo,
    to: today,
  };
};

export function DateRangeProvider({ children }: { children: ReactNode }) {
  const [dateRange, setDateRange] = useState<DateRange>(getDefaultDateRange());

  const resetToDefault = useCallback(() => {
    setDateRange(getDefaultDateRange());
  }, []);

  const formatDateRange = useCallback(() => {
    if (!dateRange.from || !dateRange.to) {
      return 'Выберите период';
    }

    const formatDate = (date: Date) => {
      return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    };

    const fromStr = formatDate(dateRange.from);
    const toStr = formatDate(dateRange.to);

    // Если даты одинаковые
    if (fromStr === toStr) {
      return fromStr;
    }

    return `${fromStr} - ${toStr}`;
  }, [dateRange.from, dateRange.to]);

  const formatMobileDateRange = useCallback(() => {
    if (!dateRange.from || !dateRange.to) {
      return 'Период';
    }

    const monthNames = [
      'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
      'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
    ];

    const fromDay = dateRange.from.getDate().toString().padStart(2, '0');
    const toDay = dateRange.to.getDate().toString().padStart(2, '0');
    const fromMonth = dateRange.from.getMonth();
    const toMonth = dateRange.to.getMonth();
    const fromYear = dateRange.from.getFullYear();
    const toYear = dateRange.to.getFullYear();

    // Если даты одинаковые
    if (dateRange.from.toDateString() === dateRange.to.toDateString()) {
      return `${fromDay} ${monthNames[fromMonth]}`;
    }

    // Если тот же месяц и год
    if (fromMonth === toMonth && fromYear === toYear) {
      return `${fromDay}–${toDay} ${monthNames[fromMonth]}`;
    }

    // Если тот же год, но разные месяцы
    if (fromYear === toYear) {
      return `${fromDay} ${monthNames[fromMonth]} – ${toDay} ${monthNames[toMonth]}`;
    }

    // Разные годы
    return `${fromDay} ${monthNames[fromMonth]} ${fromYear} – ${toDay} ${monthNames[toMonth]} ${toYear}`;
  }, [dateRange.from, dateRange.to]);

  const contextValue = useMemo(() => ({
        dateRange,
        setDateRange,
        resetToDefault,
        formatDateRange,
        formatMobileDateRange,
  }), [dateRange, resetToDefault, formatDateRange, formatMobileDateRange]);

  return (
    <DateRangeContext.Provider value={contextValue}>
      {children}
    </DateRangeContext.Provider>
  );
}

export function useDateRange() {
  const context = useContext(DateRangeContext);
  if (context === undefined) {
    throw new Error('useDateRange must be used within a DateRangeProvider');
  }
  return context;
}

// Утилитарные функции для API
export const getDateRangeParams = (dateRange: DateRange) => {
  if (!dateRange.from || !dateRange.to) {
    return {};
  }

  return {
    from: dateRange.from.toISOString(),
    to: dateRange.to.toISOString(),
  };
};

export const isDateInRange = (date: Date, range: DateRange): boolean => {
  if (!range.from || !range.to) return true;
  
  const checkDate = new Date(date);
  const fromDate = new Date(range.from);
  const toDate = new Date(range.to);
  
  // Сбрасываем время для корректного сравнения дат
  checkDate.setHours(0, 0, 0, 0);
  fromDate.setHours(0, 0, 0, 0);
  toDate.setHours(23, 59, 59, 999);
  
  return checkDate >= fromDate && checkDate <= toDate;
}; 