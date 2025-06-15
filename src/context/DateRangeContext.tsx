'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface DateRange {
  from: Date | null;
  to: Date | null;
}

interface DateRangeContextType {
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
  resetToDefault: () => void;
  formatDateRange: () => string;
}

const DateRangeContext = createContext<DateRangeContextType | undefined>(undefined);

// Функция для получения последних 7 дней по умолчанию
const getDefaultDateRange = (): DateRange => {
  const today = new Date();
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 7);
  
  return {
    from: sevenDaysAgo,
    to: today,
  };
};

export function DateRangeProvider({ children }: { children: ReactNode }) {
  const [dateRange, setDateRange] = useState<DateRange>(getDefaultDateRange());

  const resetToDefault = () => {
    setDateRange(getDefaultDateRange());
  };

  const formatDateRange = () => {
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
  };

  return (
    <DateRangeContext.Provider
      value={{
        dateRange,
        setDateRange,
        resetToDefault,
        formatDateRange,
      }}
    >
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