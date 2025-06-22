"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Notification } from "../notification";
import { ThemeToggleSwitch } from "../theme-toggle";

const tabs = [
  {
    id: "products",
    name: "Товары",
    path: "/products",
    icon: "📦",
    description: "Управление товарами"
  },
  {
    id: "purchases",
    name: "Закупки",
    path: "/purchases",
    icon: "🚚",
    description: "Закупки и поставки"
  },
  {
    id: "orders",
    name: "Заказы",
    path: "/orders-analytics",
    icon: "🛒",
    description: "Аналитика заказов"
  },
  {
    id: "expenses",
    name: "Расходы",
    path: "/expenses-analytics",
    icon: "💰",
    description: "Учет расходов"
  },
  {
    id: "messages",
    name: "Чат",
    path: "/messages",
    icon: "💬",
    description: "Сообщения"
  },
  {
    id: "reviews",
    name: "Отзывы",
    path: "/reviews",
    icon: "⭐",
    description: "Отзывы клиентов"
  },
];

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const pathname = usePathname();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Menu Panel */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 30 
            }}
            className="fixed left-0 top-0 z-50 h-full w-80 max-w-[90vw] bg-white dark:bg-gray-900 shadow-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-[#1A6DFF] to-[#00C5FF] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">T</span>
                </div>
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  TeleSklad
                </span>
              </div>
              
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Закрыть меню"
              >
                <X size={20} className="text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto p-4">
              <div className="space-y-2">
                {tabs.map((tab, index) => {
                  const isActive = pathname === tab.path;
                  
                  return (
                    <motion.div
                      key={tab.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link
                        href={tab.path}
                        onClick={onClose}
                        className={cn(
                          "flex items-center gap-4 p-4 rounded-xl transition-all duration-200",
                          isActive
                            ? "bg-gradient-to-r from-[#1A6DFF] to-[#00C5FF] text-white shadow-lg"
                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                        )}
                      >
                        <span className="text-2xl">{tab.icon}</span>
                        <div className="flex-1">
                          <div className="font-medium">{tab.name}</div>
                          <div className={cn(
                            "text-xs",
                            isActive 
                              ? "text-white/80" 
                              : "text-gray-500 dark:text-gray-400"
                          )}>
                            {tab.description}
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </nav>

            {/* Footer Controls */}
            <div className="border-t border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Настройки
                </span>
                <div className="flex items-center gap-3">
                  <ThemeToggleSwitch />
                  <Notification />
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
} 