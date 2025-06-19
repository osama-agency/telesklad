"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

const tabs = [
  {
    id: "ai",
    name: "AI Аналитика",
    path: "/ai",
  },
  {
    id: "purchases",
    name: "Закупки",
    path: "/purchases-analytics",
  },
  {
    id: "orders",
    name: "Заказы",
    path: "/orders-analytics",
  },
  {
    id: "expenses",
    name: "Расходы",
    path: "/expenses-analytics",
  },
  {
    id: "messages",
    name: "Чат",
    path: "/messages",
  },
  {
    id: "reviews",
    name: "Отзывы",
    path: "/reviews",
  },
];

export default function AnalyticsTabs() {
  const pathname = usePathname();
  const activeIndex = tabs.findIndex(tab => tab.path === pathname);

  return (
    <div className="flex justify-center py-8 px-4">
      <div className="w-full max-w-4xl">
        <div className="relative flex border-b border-gray-200 dark:border-gray-700">
          {/* Табы */}
          {tabs.map((tab, index) => {
            const isActive = pathname === tab.path;
            
            return (
              <motion.div
                key={tab.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                className="relative flex-1"
              >
                <Link
                  href={tab.path}
                  className={cn(
                    "relative block px-4 py-4 text-sm font-medium transition-all duration-200 whitespace-nowrap text-center border-b-2 hover:text-[#1A6DFF] dark:hover:text-[#00C5FF]",
                    isActive
                      ? "text-[#1A6DFF] dark:text-[#00C5FF] border-[#1A6DFF] dark:border-[#00C5FF]"
                      : "text-[#64748B] dark:text-gray-400 border-transparent hover:border-gray-300 dark:hover:border-gray-600"
                  )}
                >
                  {tab.name}
                  
                  {/* Активный индикатор с анимацией */}
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-gradient-to-r from-[#1A6DFF] to-[#00C5FF] rounded-full"
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
      </div>
    </div>
  );
} 