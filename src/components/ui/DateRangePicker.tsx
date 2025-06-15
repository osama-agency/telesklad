'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useDateRange, DateRange } from '@/context/DateRangeContext';

interface CalendarProps {
  selectedRange: DateRange;
  onDateSelect: (date: Date) => void;
  onClose: () => void;
}

const Calendar: React.FC<CalendarProps> = ({ selectedRange, onDateSelect, onClose }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectingFrom, setSelectingFrom] = useState(true);

  const monthNames = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];

  const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    
    // Начинаем с понедельника
    const dayOfWeek = (firstDay.getDay() + 6) % 7;
    startDate.setDate(firstDay.getDate() - dayOfWeek);

    const days = [];
    const endDate = new Date(lastDay);
    endDate.setDate(lastDay.getDate() + (6 - ((lastDay.getDay() + 6) % 7)));

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      days.push(new Date(d));
    }

    return days;
  };

  const isDateSelected = (date: Date) => {
    if (!selectedRange.from || !selectedRange.to) return false;
    const dateStr = date.toDateString();
    return dateStr === selectedRange.from.toDateString() || 
           dateStr === selectedRange.to.toDateString();
  };

  const isDateInRange = (date: Date) => {
    if (!selectedRange.from || !selectedRange.to) return false;
    return date >= selectedRange.from && date <= selectedRange.to;
  };

  const isToday = (date: Date) => {
    return date.toDateString() === new Date().toDateString();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentMonth.getMonth() && 
           date.getFullYear() === currentMonth.getFullYear();
  };

  const handleDateClick = (date: Date) => {
    onDateSelect(date);
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const days = getDaysInMonth(currentMonth);

  return (
    <div className="absolute top-full left-0 mt-2 bg-white dark:bg-[#1F2937] border border-[#E2E8F0] dark:border-muted/20 rounded-xl shadow-md z-50 p-4 min-w-80">
      {/* Заголовок календаря */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={goToPreviousMonth}
          className="p-2 rounded-md bg-muted hover:bg-muted/50 dark:bg-level-3 dark:hover:bg-level-3/50 transition-colors"
        >
          <svg className="w-4 h-4 text-muted-foreground dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <h3 className="text-lg font-semibold text-foreground dark:text-[#E2E8F0]">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>
        
        <button
          onClick={goToNextMonth}
          className="p-2 rounded-md bg-muted hover:bg-muted/50 dark:bg-level-3 dark:hover:bg-level-3/50 transition-colors"
        >
          <svg className="w-4 h-4 text-muted-foreground dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Дни недели */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map(day => (
          <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground dark:text-gray-400">
            {day}
          </div>
        ))}
      </div>

      {/* Дни месяца */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((date, index) => {
          const selected = isDateSelected(date);
          const inRange = isDateInRange(date);
          const today = isToday(date);
          const currentMonthDay = isCurrentMonth(date);

          return (
            <button
              key={index}
              onClick={() => handleDateClick(date)}
              className={`
                p-2 text-sm rounded-lg transition-all duration-150 hover:bg-muted/30 dark:hover:bg-level-3
                ${!currentMonthDay ? 'text-muted-foreground/50 dark:text-gray-600' : 'text-foreground dark:text-[#E2E8F0]'}
                ${selected ? 'bg-blue-100 dark:bg-[#3B82F6] text-accent dark:text-white font-semibold' : ''}
                ${inRange && !selected ? 'bg-blue-100/50 dark:bg-[#3B82F6]/20 text-accent dark:text-[#3B82F6]' : ''}
                ${today && !selected ? 'font-semibold ring-2 ring-accent/50 dark:ring-[#3B82F6]/50' : ''}
              `}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>

      {/* Быстрые фильтры */}
      <div className="mt-4 pt-4 border-t border-[#E2E8F0] dark:border-muted/20">
        <div className="flex gap-2 flex-wrap">
          <QuickDateButton 
            label="Сегодня" 
            onClick={() => {
              const today = new Date();
              onDateSelect(today);
              onDateSelect(today);
              onClose();
            }}
          />
          <QuickDateButton 
            label="7 дней" 
            onClick={() => {
              const today = new Date();
              const sevenDaysAgo = new Date(today);
              sevenDaysAgo.setDate(today.getDate() - 7);
              onDateSelect(sevenDaysAgo);
              onDateSelect(today);
              onClose();
            }}
          />
          <QuickDateButton 
            label="30 дней" 
            onClick={() => {
              const today = new Date();
              const thirtyDaysAgo = new Date(today);
              thirtyDaysAgo.setDate(today.getDate() - 30);
              onDateSelect(thirtyDaysAgo);
              onDateSelect(today);
              onClose();
            }}
          />
        </div>
      </div>
    </div>
  );
};

const QuickDateButton: React.FC<{ label: string; onClick: () => void }> = ({ label, onClick }) => (
  <button
    onClick={onClick}
    className="px-3 py-1 text-xs bg-muted hover:bg-accent/20 dark:bg-level-3 dark:hover:bg-primary/20 text-muted-foreground hover:text-accent dark:text-gray-300 dark:hover:text-white rounded-md transition-colors"
  >
    {label}
  </button>
);

export default function DateRangePicker() {
  const { dateRange, setDateRange, formatDateRange } = useDateRange();
  const [isOpen, setIsOpen] = useState(false);
  const [selectingFrom, setSelectingFrom] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleDateSelect = (date: Date) => {
    if (selectingFrom || !dateRange.from) {
      // Выбираем начальную дату
      setDateRange({ from: date, to: null });
      setSelectingFrom(false);
    } else {
      // Выбираем конечную дату
      if (date < dateRange.from) {
        // Если конечная дата раньше начальной, меняем местами
        setDateRange({ from: date, to: dateRange.from });
      } else {
        setDateRange({ from: dateRange.from, to: date });
      }
      setSelectingFrom(true);
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-2 px-3 py-2 bg-white dark:bg-level-2 border border-[#E2E8F0] dark:border-muted/20 
          rounded-lg text-sm text-foreground dark:text-white hover:bg-muted/10 dark:hover:bg-level-3 transition-colors
          focus:ring-gradient focus:border-transparent min-w-48
          ${isOpen ? 'ring-2 ring-accent/50 dark:ring-primary/50 border-accent/50 dark:border-primary/50' : ''}
        `}
      >
        <svg className="w-4 h-4 text-muted-foreground dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span className="flex-1 text-left">{formatDateRange()}</span>
        <svg 
          className={`w-4 h-4 text-muted-foreground dark:text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <Calendar
          selectedRange={dateRange}
          onDateSelect={handleDateSelect}
          onClose={() => setIsOpen(false)}
        />
      )}
    </div>
  );
} 