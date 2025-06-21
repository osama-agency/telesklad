"use client";

import { useState } from "react";
import Link from "next/link";
import { Settings, Palette, Bell, Shield, Database, Globe } from "lucide-react";

const quickSettingsItems = [
  {
    name: "Системные настройки",
    href: "/pages/settings",
    icon: Settings,
    description: "Основные параметры"
  },
  {
    name: "Программа лояльности", 
    href: "/pages/settings",
    icon: Palette,
    description: "Бонусы и уровни"
  },
  {
    name: "Уведомления",
    href: "/pages/settings", 
    icon: Bell,
    description: "Настройки уведомлений"
  },
  {
    name: "Безопасность",
    href: "/pages/settings",
    icon: Shield, 
    description: "API и доступы"
  },
  {
    name: "Резервные копии",
    href: "/pages/settings",
    icon: Database,
    description: "Бэкапы данных"
  },
  {
    name: "Веб-приложение",
    href: "/pages/settings",
    icon: Globe,
    description: "Настройки webapp"
  }
];

export function QuickSettingsButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      {/* Кнопка настроек */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          p-2 rounded-xl transition-all duration-300 focus-ring
          ${isOpen 
            ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' 
            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
          }
        `}
        title="Быстрые настройки"
      >
        <Settings 
          size={20} 
          className={`transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`}
        />
      </button>

      {/* Выпадающее меню */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Меню */}
          <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
            {/* Заголовок */}
            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
              <h3 className="font-semibold text-gray-900 dark:text-white">Быстрые настройки</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Основные параметры системы</p>
            </div>

            {/* Элементы меню */}
            <div className="p-2">
              {quickSettingsItems.map((item) => {
                const Icon = item.icon;
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className="group flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-200"
                  >
                    <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 group-hover:bg-blue-500/10 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-all duration-200">
                      <Icon size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {item.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {item.description}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Футер */}
            <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
              <Link
                href="/pages/settings"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-2 px-3 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
              >
                <Settings size={14} />
                Все настройки
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
} 