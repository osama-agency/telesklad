"use client";

import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";

const tabs = [
  {
    id: "ai",
    label: "🧠 Умная аналитика",
    path: "/analytics/ai",
  },
  {
    id: "purchases",
    label: "📦 Закупки",
    path: "/analytics/purchases",
  },
  {
    id: "orders",
    label: "🛒 Заказы",
    path: "/analytics/orders",
  },
  {
    id: "expenses",
    label: "💸 Расходы",
    path: "/analytics/expenses",
  },
];

export default function AnalyticsTabs() {
  const pathname = usePathname();
  const router = useRouter();

  const handleTabClick = (path: string) => {
    router.push(path);
  };

  return (
    <div className="w-full mb-6">
      {/* Desktop Tabs */}
      <div className="hidden md:flex bg-white dark:bg-gray-dark rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-1.5">
        {tabs.map((tab) => {
          const isActive = pathname === tab.path;
          
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.path)}
              className={`
                relative flex-1 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200
                ${isActive
                  ? "text-white"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                }
              `}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-gradient-to-r from-[#1A6DFF] to-[#00C5FF] rounded-lg shadow-lg"
                  initial={false}
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 30,
                  }}
                />
              )}
              <span className="relative z-10">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Mobile Dropdown */}
      <div className="md:hidden">
        <select
          value={pathname}
          onChange={(e) => handleTabClick(e.target.value)}
          className="w-full rounded-lg border border-stroke bg-white dark:bg-gray-dark px-4 py-3 text-dark dark:text-white focus:border-primary dark:border-dark-3 dark:focus:border-primary outline-none"
        >
          {tabs.map((tab) => (
            <option key={tab.id} value={tab.path}>
              {tab.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
} 