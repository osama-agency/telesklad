"use client";

import { motion } from "framer-motion";
import { useState } from "react";

export default function ClientStatusLegend() {
  const [isOpen, setIsOpen] = useState(false);

  const statuses = [
    {
      status: 'active',
      color: 'bg-green-500',
      label: 'VIP клиент',
      description: 'Клиенты с доставленными заказами',
      icon: '⭐'
    },
    {
      status: 'potential',
      color: 'bg-yellow-500',
      label: 'В работе',
      description: 'Клиенты с заказами в обработке',
      icon: '🔄'
    },
    {
      status: 'new',
      color: 'bg-gray-400',
      label: 'Новый клиент',
      description: 'Клиенты без заказов',
      icon: '👤'
    }
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-xs text-[#64748B] dark:text-gray-400 hover:text-[#1A6DFF] transition-colors"
        title="Легенда статусов"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Статусы
      </button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-50 p-4"
        >
          <h4 className="text-sm font-semibold text-[#1E293B] dark:text-white mb-3">
            Статусы клиентов
          </h4>
          
          <div className="space-y-3">
            {statuses.map((item) => (
              <div key={item.status} className="flex items-center gap-3">
                <div className="relative">
                  <div className={`w-4 h-4 rounded-full ${item.color}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs">{item.icon}</span>
                    <span className="text-sm font-medium text-[#1E293B] dark:text-white">
                      {item.label}
                    </span>
                  </div>
                  <p className="text-xs text-[#64748B] dark:text-gray-400">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-[#64748B] dark:text-gray-400">
              💡 Клиенты сортируются по статусу: сначала VIP, затем в работе, потом новые
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
} 