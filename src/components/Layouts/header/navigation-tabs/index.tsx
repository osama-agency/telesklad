"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

const tabs = [
  {
    id: "products",
    name: "Товары",
    path: "/products",
    icon: "📦"
  },
  {
    id: "purchases",
    name: "Закупки",
    path: "/purchases",
    icon: "🚚"
  },
  {
    id: "orders",
    name: "Заказы",
    path: "/orders-analytics",
    icon: "🛒"
  },
  {
    id: "expenses",
    name: "Расходы",
    path: "/expenses-analytics",
    icon: "💰"
  },
  {
    id: "messages",
    name: "Чат",
    path: "/messages",
    icon: "💬"
  },
  {
    id: "reviews",
    name: "Отзывы",
    path: "/reviews",
    icon: "⭐"
  },
];

export function NavigationTabs() {
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
      {tabs.map((tab, index) => {
        const isActive = pathname === tab.path;
        
        return (
          <motion.div
            key={tab.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
            className="relative flex-shrink-0"
          >
            <Link
              href={tab.path}
              className={cn(
                "relative flex items-center gap-2 px-3 py-2 text-sm font-medium transition-all duration-300 whitespace-nowrap rounded-lg",
                isActive
                  ? "text-white bg-gradient-to-r from-[#1A6DFF] to-[#00C5FF] shadow-lg shadow-[#1A6DFF]/25"
                  : "text-[#64748B] dark:text-gray-400 hover:text-[#1A6DFF] dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700/50"
              )}
            >
              <span className="text-base">{tab.icon}</span>
              <span className="hidden lg:inline">{tab.name}</span>
              <span className="lg:hidden hidden sm:inline">{tab.name.split(' ')[0]}</span>
              
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