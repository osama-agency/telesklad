"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bot, Package, ClipboardList, ShoppingCart, DollarSign, MessageCircle, Star } from "lucide-react";
import { ComponentType } from "react";

interface Tab {
  name: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
}

const tabs: Tab[] = [
  { name: "AI Аналитика", href: "/ai", icon: Bot },
  { name: "Товары", href: "/products", icon: Package },
  { name: "Заказы", href: "/orders-analytics", icon: ClipboardList },
  { name: "Закупки", href: "/purchases", icon: ShoppingCart },
  { name: "Расходы", href: "/expenses-analytics", icon: DollarSign },
  { name: "Сообщения", href: "/messages", icon: MessageCircle },
  { name: "Отзывы", href: "/reviews", icon: Star },
];

export default function AnalyticsTabs() {
  const pathname = usePathname();

  return (
    <div className="bg-[#F8FAFC] dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <div className="mx-auto max-w-screen-xl xl:max-w-[90vw] 2xl:max-w-[95vw] px-4">
        <nav className="flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href;
            const IconComponent = tab.icon;
            return (
              <Link
                key={tab.name}
                href={tab.href}
                className={`
                  flex items-center gap-2 px-4 py-4 text-sm font-medium border-b-2 whitespace-nowrap transition-all duration-300
                  ${
                    isActive
                      ? "border-[#1A6DFF] text-[#1A6DFF]"
                      : "border-transparent text-[#64748B] dark:text-gray-400 hover:text-[#1A6DFF] hover:border-[#1A6DFF]/30"
                  }
                `}
              >
                <IconComponent className="h-5 w-5" />
                {tab.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
} 