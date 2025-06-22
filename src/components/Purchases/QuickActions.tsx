'use client';

import React from 'react';

interface QuickActionsProps {
  onCreatePurchase?: () => void;
  onBulkActions?: () => void;
  onExport?: () => void;
  onImport?: () => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({
  onCreatePurchase,
  onBulkActions,
  onExport,
  onImport
}) => {
  const actions = [
    {
      id: 'create',
      label: 'Создать закупку',
      icon: '➕',
      description: 'Новая закупка товаров',
      color: 'bg-gradient-to-r from-[#1A6DFF] to-[#00C5FF] hover:scale-105',
      onClick: onCreatePurchase
    },
    {
      id: 'bulk',
      label: 'Массовые действия',
      icon: '⚡',
      description: 'Операции с несколькими закупками',
      color: 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 hover:scale-105',
      onClick: onBulkActions
    },
    {
      id: 'export',
      label: 'Экспорт',
      icon: '📊',
      description: 'Выгрузить данные',
      color: 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 hover:scale-105',
      onClick: onExport
    },
    {
      id: 'import',
      label: 'Импорт',
      icon: '📥',
      description: 'Загрузить из файла',
      color: 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 hover:scale-105',
      onClick: onImport
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center">
          <span className="text-white text-lg">⚡</span>
        </div>
        <div>
          <h3 className="font-semibold text-[#1E293B] dark:text-white">Быстрые действия</h3>
          <p className="text-sm text-[#64748B] dark:text-gray-400">Часто используемые операции</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={action.onClick}
            disabled={!action.onClick}
            className={`
              group relative overflow-hidden rounded-xl p-4 text-left transition-all duration-300
              ${action.color}
              ${action.onClick 
                ? 'transform cursor-pointer' 
                : 'opacity-50 cursor-not-allowed'
              }
              disabled:hover:scale-100 disabled:hover:shadow-none
            `}
          >
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{action.icon}</span>
                <h4 className="font-semibold text-white">{action.label}</h4>
              </div>
              <p className="text-sm text-white/80">{action.description}</p>
            </div>

            {/* Эффект при наведении */}
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Декоративные элементы */}
            <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-8 translate-x-8" />
            <div className="absolute bottom-0 left-0 w-12 h-12 bg-white/5 rounded-full translate-y-6 -translate-x-6" />
          </button>
        ))}
      </div>

      {/* Дополнительные быстрые фильтры */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <h4 className="font-medium text-[#1E293B] dark:text-white mb-3">Быстрые фильтры</h4>
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'Срочные', count: 3, color: 'red' },
            { label: 'Требуют оплаты', count: 5, color: 'amber' },
            { label: 'В пути', count: 2, color: 'blue' },
            { label: 'Готовы к получению', count: 1, color: 'green' }
          ].map((filter) => (
            <button
              key={filter.label}
              className="px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 bg-gray-50 dark:bg-gray-700 text-[#374151] dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:bg-white dark:hover:bg-gray-600 hover:border-[#1A6DFF]/30 dark:hover:border-[#1A6DFF]/30"
            >
              {filter.label}
              {filter.count > 0 && (
                <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-gray-200 dark:bg-gray-600 text-[#1E293B] dark:text-white">
                  {filter.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuickActions; 