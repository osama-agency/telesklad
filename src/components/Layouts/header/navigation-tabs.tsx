"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigationTabs = [
  { name: "Главная", href: "/", icon: "🏠" },
  { name: "AI Аналитика", href: "/ai", icon: "🤖" },
  { name: "Товары", href: "/products", icon: "📦" },
  { name: "Заказы", href: "/orders-analytics", icon: "📋" },
  { name: "Закупки", href: "/purchases-analytics", icon: "🛒" },
  { name: "Расходы", href: "/expenses-analytics", icon: "💰" },
  { name: "Сообщения", href: "/messages", icon: "💬" },
  { name: "Отзывы", href: "/reviews", icon: "⭐" },
];

export function NavigationTabs() {
  const pathname = usePathname();

  return (
    <nav className="hidden lg:flex items-center space-x-6">
      {navigationTabs.map((tab) => {
        const isActive = pathname === tab.href;
        return (
          <Link
            key={tab.name}
            href={tab.href}
            className={`
              flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-300
              ${
                isActive
                  ? "bg-[#1A6DFF]/10 text-[#1A6DFF] dark:bg-[#1A6DFF]/20"
                  : "text-[#64748B] dark:text-gray-400 hover:text-[#1A6DFF] hover:bg-[#1A6DFF]/5"
              }
            `}
          >
            <span className="text-base">{tab.icon}</span>
            {tab.name}
          </Link>
        );
      })}
    </nav>
  );
} 