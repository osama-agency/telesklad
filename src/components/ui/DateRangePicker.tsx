'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useDateRange, DateRange } from '@/context/DateRangeContext';

interface CalendarProps {
  selectedRange: DateRange;
  onDateSelect: (date: Date) => void;
  onClose: () => void;
  isMobile?: boolean;
  setDateRange?: (range: DateRange) => void;
}

const Calendar: React.FC<CalendarProps> = ({ selectedRange, onDateSelect, onClose, isMobile = false, setDateRange }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

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

  if (isMobile) {
    return (
      <div className="px-4">
        {/* Заголовок календаря */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={goToPreviousMonth}
            className="p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h3>
          
          <button
            onClick={goToNextMonth}
            className="p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Дни недели */}
        <div className="grid grid-cols-7 gap-1 mb-3">
          {weekDays.map(day => (
            <div key={day} className="p-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400">
              {day}
            </div>
          ))}
        </div>

        {/* Дни месяца - увеличенные для мобильных */}
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
                  p-2.5 text-base rounded-lg transition-all duration-150 min-h-[42px] font-medium
                  ${!currentMonthDay ? 'text-gray-400 dark:text-gray-600' : 'text-gray-900 dark:text-white'}
                  ${selected ? 'bg-blue-500 text-white font-semibold shadow-lg' : ''}
                  ${inRange && !selected ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : ''}
                  ${today && !selected ? 'font-semibold ring-2 ring-blue-500/30 bg-blue-50 dark:bg-blue-900/20' : ''}
                  ${!selected && !inRange && currentMonthDay ? 'hover:bg-gray-100 dark:hover:bg-gray-800' : ''}
                `}
              >
                {date.getDate()}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

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
        
        <h3 className="text-lg font-semibold text-gray-900 dark:text-[#E2E8F0]">
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
                ${!currentMonthDay ? 'text-muted-foreground/50 dark:text-gray-600' : 'text-gray-900 dark:text-[#E2E8F0]'}
                ${selected ? 'bg-blue-100 dark:bg-[#3B82F6] text-accent dark:text-white font-semibold' : ''}
                ${inRange && !selected ? 'bg-blue-100/50 dark:bg-[#3B82F6]/20 text-accent dark:text-[#3B82F6]' : ''}
                ${today && !selected ? 'font-semibold ring-2 ring-blue-500/50 dark:ring-[#3B82F6]/50' : ''}
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
              const newRange = { from: today, to: today };
              if (isMobile) {
                onDateSelect(today);
                onDateSelect(today);
              } else if (setDateRange) {
                setDateRange(newRange);
                onClose();
              }
            }}
          />
          <QuickDateButton 
            label="7 дней" 
            onClick={() => {
              const today = new Date();
              const sevenDaysAgo = new Date(today);
              sevenDaysAgo.setDate(today.getDate() - 7);
              const newRange = { from: sevenDaysAgo, to: today };
              if (isMobile) {
                onDateSelect(sevenDaysAgo);
                onDateSelect(today);
              } else if (setDateRange) {
                setDateRange(newRange);
                onClose();
              }
            }}
          />
          <QuickDateButton 
            label="30 дней" 
            onClick={() => {
              const today = new Date();
              const thirtyDaysAgo = new Date(today);
              thirtyDaysAgo.setDate(today.getDate() - 30);
              const newRange = { from: thirtyDaysAgo, to: today };
              if (isMobile) {
                onDateSelect(thirtyDaysAgo);
                onDateSelect(today);
              } else if (setDateRange) {
                setDateRange(newRange);
                onClose();
              }
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
    className="px-3 py-1 text-xs bg-muted hover:bg-blue-500/20 dark:bg-level-3 dark:hover:bg-primary/20 text-muted-foreground hover:text-blue-600 dark:text-gray-300 dark:hover:text-white rounded-md transition-colors"
  >
    {label}
  </button>
);

// Мобильный bottom-sheet компонент
const MobileDatePicker: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  selectedRange: DateRange;
  onDateSelect: (date: Date) => void;
  onApply: () => void;
  onCancel: () => void;
  formatMobileDateRange: () => string;
}> = ({ isOpen, onClose, selectedRange, onDateSelect, onApply, onCancel, formatMobileDateRange }) => {
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartY(e.touches[0].clientY);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const y = e.touches[0].clientY;
    const diff = y - startY;
    if (diff > 0) {
      setCurrentY(diff);
    }
  };

  const handleTouchEnd = () => {
    if (currentY > 100) {
      onClose();
    }
    setCurrentY(0);
    setIsDragging(false);
  };

  const quickPresets = [
    {
      label: 'Сегодня',
      icon: '📅',
      onClick: () => {
        const today = new Date();
        onDateSelect(today);
        onDateSelect(today);
      }
    },
    {
      label: '7 дней',
      icon: '📊',
      onClick: () => {
        const today = new Date();
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 7);
        onDateSelect(sevenDaysAgo);
        onDateSelect(today);
      }
    },
    {
      label: '30 дней',
      icon: '📈',
      onClick: () => {
        const today = new Date();
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 30);
        onDateSelect(thirtyDaysAgo);
        onDateSelect(today);
      }
    }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Bottom Sheet */}
      <div 
        className="relative w-full bg-white dark:bg-gray-900 rounded-t-3xl shadow-2xl overflow-hidden"
        style={{ 
          height: 'calc(100vh - 40px)',
          maxHeight: '92vh',
          transform: `translateY(${currentY}px)`,
          transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full opacity-60" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200/80 dark:border-gray-700/80">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <span className="text-base">📅</span>
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                Выбор периода
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                {formatMobileDateRange()}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center justify-center"
          >
            <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-5 py-4">
            <Calendar
              selectedRange={selectedRange}
              onDateSelect={onDateSelect}
              onClose={onClose}
              isMobile={true}
            />
          </div>

          {/* Quick Presets */}
          <div className="px-5 mt-4 mb-4">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3">
              Быстрый выбор
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {quickPresets.map((preset, index) => (
                <button
                  key={index}
                  onClick={preset.onClick}
                  className="flex flex-col items-center justify-center p-3 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span className="text-lg mb-1">{preset.icon}</span>
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    {preset.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-5 pb-6 border-t border-gray-200/80 dark:border-gray-700/80 bg-white dark:bg-gray-900">
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 py-3.5 px-4 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 text-base"
            >
              Отмена
            </button>
            <button
              onClick={onApply}
              className="flex-1 py-3.5 px-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl text-base active:scale-[0.98]"
            >
              Применить
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function DateRangePicker() {
  const { dateRange, setDateRange, formatDateRange, formatMobileDateRange } = useDateRange();
  const [isOpen, setIsOpen] = useState(false);
  const [selectingFrom, setSelectingFrom] = useState(true);
  const [tempDateRange, setTempDateRange] = useState<DateRange>(dateRange);
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen && !isMobile) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, isMobile]);

  useEffect(() => {
    setTempDateRange(dateRange);
  }, [dateRange, isOpen]);

  const handleDateSelect = (date: Date) => {
    if (selectingFrom || !tempDateRange.from) {
      // Выбираем начальную дату
      setTempDateRange({ from: date, to: null });
      setSelectingFrom(false);
    } else {
      // Выбираем конечную дату
      const newRange = date < tempDateRange.from 
        ? { from: date, to: tempDateRange.from }
        : { from: tempDateRange.from, to: date };
      
      setTempDateRange(newRange);
      setSelectingFrom(true);
      
      // Для desktop версии сразу применяем изменения и закрываем календарь
      if (!isMobile) {
        setDateRange(newRange);
        setIsOpen(false);
      }
    }
  };

  const handleApply = () => {
    setDateRange(tempDateRange);
    setIsOpen(false);
  };

  const handleCancel = () => {
    setTempDateRange(dateRange);
    setIsOpen(false);
  };

  const handleOpen = () => {
    setTempDateRange(dateRange);
    setIsOpen(true);
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={handleOpen}
        className={`
          flex items-center gap-2 px-2 py-2 bg-white dark:bg-level-2 border border-[#E2E8F0] dark:border-muted/20 
          rounded-lg text-sm text-gray-900 dark:text-white hover:bg-muted/10 dark:hover:bg-level-3 transition-colors
          focus:ring-gradient focus:border-transparent
          ${isOpen ? 'ring-2 ring-blue-500/50 dark:ring-primary/50 border-blue-500/50 dark:border-primary/50' : ''}
          sm:px-3 sm:min-w-48
        `}
      >
        <svg className="w-4 h-4 text-muted-foreground dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span className="flex-1 text-left">
          <span className="hidden sm:inline">{formatDateRange()}</span>
          <span className="sm:hidden">{formatMobileDateRange()}</span>
        </span>
        <svg 
          className={`w-4 h-4 text-muted-foreground dark:text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Desktop Calendar */}
      {isOpen && !isMobile && (
        <Calendar
          selectedRange={tempDateRange}
          onDateSelect={handleDateSelect}
          onClose={() => setIsOpen(false)}
          setDateRange={setDateRange}
        />
      )}

      {/* Mobile Bottom Sheet */}
      <MobileDatePicker
        isOpen={isOpen && isMobile}
        onClose={handleCancel}
        selectedRange={tempDateRange}
        onDateSelect={handleDateSelect}
        onApply={handleApply}
        onCancel={handleCancel}
        formatMobileDateRange={() => {
          if (!tempDateRange.from || !tempDateRange.to) {
            return 'Выберите даты';
          }
          
          const monthNames = [
            'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
            'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
          ];

          const fromDay = tempDateRange.from.getDate().toString().padStart(2, '0');
          const toDay = tempDateRange.to.getDate().toString().padStart(2, '0');
          const fromMonth = tempDateRange.from.getMonth();
          const toMonth = tempDateRange.to.getMonth();
          const fromYear = tempDateRange.from.getFullYear();
          const toYear = tempDateRange.to.getFullYear();

          // Если даты одинаковые
          if (tempDateRange.from.toDateString() === tempDateRange.to.toDateString()) {
            return `${fromDay} ${monthNames[fromMonth]} ${fromYear}`;
          }

          // Если тот же месяц и год
          if (fromMonth === toMonth && fromYear === toYear) {
            return `${fromDay} – ${toDay} ${monthNames[fromMonth]} ${fromYear}`;
          }

          // Если тот же год, но разные месяцы
          if (fromYear === toYear) {
            return `${fromDay} ${monthNames[fromMonth]} – ${toDay} ${monthNames[toMonth]} ${fromYear}`;
          }

          // Разные годы
          return `${fromDay} ${monthNames[fromMonth]} ${fromYear} – ${toDay} ${monthNames[toMonth]} ${toYear}`;
        }}
      />
    </div>
  );
} 