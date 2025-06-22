'use client';

import React from 'react';

interface StatusStep {
  key: string;
  label: string;
  icon: string;
  description: string;
  color: string;
}

interface PurchaseStatusFlowProps {
  currentStatus: string;
  onStatusClick?: (status: string) => void;
  isInteractive?: boolean;
}

const PurchaseStatusFlow: React.FC<PurchaseStatusFlowProps> = ({
  currentStatus,
  onStatusClick,
  isInteractive = false
}) => {
  const statusSteps: StatusStep[] = [
    {
      key: 'draft',
      label: 'Черновик',
      icon: '📝',
      description: 'Создание закупки',
      color: 'gray'
    },
    {
      key: 'sent',
      label: 'Отправлено',
      icon: '📤',
      description: 'Уведомление поставщику',
      color: 'blue'
    },
    {
      key: 'paid',
      label: 'Оплачено',
      icon: '💰',
      description: 'Подтверждение оплаты',
      color: 'emerald'
    },
    {
      key: 'in_transit',
      label: 'В пути',
      icon: '🚛',
      description: 'Доставка товаров',
      color: 'amber'
    },
    {
      key: 'received',
      label: 'Получено',
      icon: '✅',
      description: 'Оприходование',
      color: 'green'
    }
  ];

  const getCurrentStepIndex = () => {
    return statusSteps.findIndex(step => step.key === currentStatus);
  };

  const currentStepIndex = getCurrentStepIndex();

  const getStepStatus = (index: number) => {
    if (index < currentStepIndex) return 'completed';
    if (index === currentStepIndex) return 'current';
    return 'upcoming';
  };

  const getColorClasses = (step: StatusStep, status: 'completed' | 'current' | 'upcoming') => {
    const baseColors = {
      gray: {
        completed: 'bg-gray-500 text-white border-gray-500',
        current: 'bg-gray-600 dark:bg-gray-500 text-white border-gray-600 dark:border-gray-500 ring-4 ring-gray-200 dark:ring-gray-600',
        upcoming: 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-600'
      },
      blue: {
        completed: 'bg-[#1A6DFF] text-white border-[#1A6DFF]',
        current: 'bg-[#1A6DFF] text-white border-[#1A6DFF] ring-4 ring-[#1A6DFF]/20',
        upcoming: 'bg-blue-50 dark:bg-gray-700 text-blue-300 dark:text-gray-500 border-blue-200 dark:border-gray-600'
      },
      emerald: {
        completed: 'bg-emerald-500 text-white border-emerald-500',
        current: 'bg-emerald-600 dark:bg-emerald-500 text-white border-emerald-600 dark:border-emerald-500 ring-4 ring-emerald-200 dark:ring-emerald-600',
        upcoming: 'bg-emerald-50 dark:bg-gray-700 text-emerald-300 dark:text-gray-500 border-emerald-200 dark:border-gray-600'
      },
      amber: {
        completed: 'bg-amber-500 text-white border-amber-500',
        current: 'bg-amber-600 dark:bg-amber-500 text-white border-amber-600 dark:border-amber-500 ring-4 ring-amber-200 dark:ring-amber-600',
        upcoming: 'bg-amber-50 dark:bg-gray-700 text-amber-300 dark:text-gray-500 border-amber-200 dark:border-gray-600'
      },
      green: {
        completed: 'bg-green-500 text-white border-green-500',
        current: 'bg-green-600 dark:bg-green-500 text-white border-green-600 dark:border-green-500 ring-4 ring-green-200 dark:ring-green-600',
        upcoming: 'bg-green-50 dark:bg-gray-700 text-green-300 dark:text-gray-500 border-green-200 dark:border-gray-600'
      }
    };

    return baseColors[step.color as keyof typeof baseColors][status];
  };

  const getConnectorClasses = (index: number) => {
    if (index >= statusSteps.length - 1) return '';
    
    const isCompleted = index < currentStepIndex;
    return isCompleted 
      ? 'bg-gradient-to-r from-emerald-500 to-[#1A6DFF]' 
      : 'bg-gradient-to-r from-gray-200 dark:from-gray-700 to-gray-300 dark:to-gray-600';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-[#1E293B] dark:text-white mb-2">
          Процесс закупки
        </h3>
        <p className="text-sm text-[#64748B] dark:text-gray-400">
          Отслеживание этапов от создания до получения товаров
        </p>
      </div>

      <div className="relative">
        {/* Горизонтальная линия прогресса */}
        <div className="absolute top-8 left-8 right-8 h-1 bg-gray-200 dark:bg-gray-700 rounded-full">
          <div 
            className="h-full bg-gradient-to-r from-emerald-500 to-[#1A6DFF] rounded-full transition-all duration-500"
            style={{ 
              width: currentStepIndex >= 0 ? `${(currentStepIndex / (statusSteps.length - 1)) * 100}%` : '0%' 
            }}
          />
        </div>

        {/* Шаги */}
        <div className="flex justify-between relative">
          {statusSteps.map((step, index) => {
            const stepStatus = getStepStatus(index);
            const colorClasses = getColorClasses(step, stepStatus);
            const isClickable = isInteractive && onStatusClick;

            return (
              <div key={step.key} className="flex flex-col items-center">
                {/* Иконка шага */}
                <button
                  onClick={() => isClickable && onStatusClick(step.key)}
                  disabled={!isClickable}
                  className={`
                    w-16 h-16 rounded-full border-2 flex items-center justify-center text-xl font-medium
                    transition-all duration-300 relative z-10
                    ${colorClasses}
                    ${isClickable ? 'hover:scale-110 cursor-pointer' : 'cursor-default'}
                    ${stepStatus === 'current' ? 'animate-pulse' : ''}
                  `}
                >
                  {stepStatus === 'completed' ? '✓' : step.icon}
                </button>

                {/* Подпись */}
                <div className="mt-3 text-center">
                  <div className={`
                    text-sm font-medium
                    ${stepStatus === 'current' ? 'text-[#1E293B] dark:text-white' : 
                      stepStatus === 'completed' ? 'text-[#374151] dark:text-gray-300' : 'text-[#64748B] dark:text-gray-400'}
                  `}>
                    {step.label}
                  </div>
                  <div className={`
                    text-xs mt-1
                    ${stepStatus === 'current' ? 'text-[#64748B] dark:text-gray-400' : 
                      stepStatus === 'completed' ? 'text-[#64748B] dark:text-gray-400' : 'text-[#64748B] dark:text-gray-500'}
                  `}>
                    {step.description}
                  </div>
                </div>

                {/* Индикатор времени для текущего шага */}
                {stepStatus === 'current' && (
                  <div className="mt-2 flex items-center gap-1">
                    <div className="w-2 h-2 bg-[#1A6DFF] rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-[#1A6DFF]/70 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-[#1A6DFF]/40 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Дополнительная информация о текущем этапе */}
      {currentStepIndex >= 0 && currentStepIndex < statusSteps.length && (
        <div className="mt-6 p-4 bg-blue-50 dark:bg-gray-700 rounded-xl border border-blue-200 dark:border-gray-600">
          <div className="flex items-start gap-3">
            <div className="text-2xl">{statusSteps[currentStepIndex].icon}</div>
            <div>
              <h4 className="font-semibold text-[#1A6DFF] dark:text-[#1A6DFF] mb-1">
                Текущий этап: {statusSteps[currentStepIndex].label}
              </h4>
              <p className="text-sm text-[#1A6DFF] dark:text-[#1A6DFF]">
                {statusSteps[currentStepIndex].description}
              </p>
              
              {/* Следующий шаг */}
              {currentStepIndex < statusSteps.length - 1 && (
                <p className="text-xs text-[#1A6DFF]/70 dark:text-[#1A6DFF]/70 mt-2">
                  Следующий этап: {statusSteps[currentStepIndex + 1].label}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Статус "Отменено" */}
      {currentStatus === 'cancelled' && (
        <div className="mt-6 p-4 bg-red-50 dark:bg-gray-700 rounded-xl border border-red-200 dark:border-gray-600">
          <div className="flex items-center gap-3">
            <div className="text-2xl">❌</div>
            <div>
              <h4 className="font-semibold text-red-600 dark:text-red-400 mb-1">
                Закупка отменена
              </h4>
              <p className="text-sm text-red-600 dark:text-red-400">
                Процесс закупки был прерван
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseStatusFlow; 