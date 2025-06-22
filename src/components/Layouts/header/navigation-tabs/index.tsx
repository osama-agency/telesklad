"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useHeaderResponsive } from "@/hooks/useHeaderResponsive";

const tabs = [
  {
    id: "products",
    name: "Товары",
    shortName: "Товары",
    compactName: "Товары",
    path: "/products",
    icon: "📦"
  },
  {
    id: "purchases",
    name: "Закупки",
    shortName: "Закупки", 
    compactName: "Закупки",
    path: "/purchases",
    icon: "🚚"
  },
  {
    id: "orders",
    name: "Заказы",
    shortName: "Заказы",
    compactName: "Заказы",
    path: "/orders-analytics",
    icon: "🛒"
  },
  {
    id: "expenses",
    name: "Расходы",
    shortName: "Расходы",
    compactName: "Расходы",
    path: "/expenses-analytics",
    icon: "💰"
  },
  {
    id: "messages",
    name: "Чат",
    shortName: "Чат",
    compactName: "Чат",
    path: "/messages",
    icon: "💬"
  },
  {
    id: "reviews",
    name: "Отзывы",
    shortName: "Отзывы",
    compactName: "Отзывы",
    path: "/reviews",
    icon: "⭐"
  },
];

export function NavigationTabs() {
  const pathname = usePathname();
  const { 
    isSmallDesktop, 
    isMediumDesktop, 
    isLargeDesktop,
    width
  } = useHeaderResponsive();

  // Определяем какую версию показывать
  const showIconOnly = width < 1024;
  const showCompact = width >= 1024 && width < 1200;
  const showShort = width >= 1200 && width < 1440;
  const showFull = width >= 1440;

  return (
    <div className={`flex items-center overflow-x-auto no-scrollbar transition-all duration-300 ${
      isSmallDesktop ? 'gap-0.5' : 'gap-1'
    }`}>
      {tabs.map((tab, index) => {
        const isActive = pathname === tab.path;
        
        return (
          <motion.div
            key={tab.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.03, duration: 0.2 }}
            className="relative flex-shrink-0"
          >
            <Link
              href={tab.path}
              className={cn(
                "relative flex items-center gap-2 text-sm font-medium transition-all duration-300 whitespace-nowrap rounded-lg",
                
                // Динамический padding в зависимости от размера экрана
                isSmallDesktop ? "px-2 py-1.5" : "px-3 py-2",
                
                // Стили для активного состояния
                isActive
                  ? "text-white bg-gradient-to-r from-[#1A6DFF] to-[#00C5FF] shadow-lg shadow-[#1A6DFF]/25"
                  : "text-[#64748B] dark:text-gray-400 hover:text-[#1A6DFF] dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700/50"
              )}
              title={tab.name} // Всегда показываем полное название в tooltip
            >
              <span className={`${isSmallDesktop ? 'text-sm' : 'text-base'} transition-all duration-300`}>
                {tab.icon}
              </span>
              
              {/* Адаптивное отображение текста */}
              {showFull && (
                <span className="transition-all duration-300">{tab.name}</span>
              )}
              
              {showShort && !showFull && (
                <span className="transition-all duration-300">{tab.shortName}</span>
              )}
              
              {showCompact && !showShort && !showFull && (
                <span className={`transition-all duration-300 ${
                  isSmallDesktop ? 'text-xs' : 'text-sm'
                }`}>
                  {tab.compactName}
                </span>
              )}
              
              {/* Только иконка для очень маленьких экранов */}
              {showIconOnly && (
                <span className="sr-only">{tab.name}</span>
              )}
              
              {/* Активный индикатор с анимацией */}
              {isActive && (
                <motion.div
                  layoutId="activeHeaderTab"
                  className="absolute inset-0 rounded-lg border-2 border-white/20"
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 30
                  }}
                />
              )}
            </Link>
          </motion.div>
        );
      })}

    </div>
  );
} 