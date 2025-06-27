"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Star, User, ShoppingBag } from "lucide-react";

const navItems = [
  { href: "/tgapp/catalog", icon: Home, label: "Каталог" },
  { href: "/tgapp/orders", icon: ShoppingBag, label: "Заказы" },
  { href: "/tgapp/favorites", icon: Star, label: "Избранное" },
  { href: "/tgapp/profile", icon: User, label: "Профиль" },
];

export default function BottomNavigation() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-sm flex justify-around py-2 max-w-[600px] mx-auto">
      {navItems.map(({ href, icon: Icon, label }) => {
        const active = pathname.startsWith(href);
        // Иконка избранного всегда серая, как профиль
        const iconColor = href === "/tgapp/favorites" 
          ? "text-gray-400" 
          : (active ? "text-green-600" : "text-gray-400");
        
        return (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center text-xs"
          >
            <Icon className={`w-5 h-5 ${iconColor}`} />
            <span className={active ? "text-green-600" : "text-gray-500"}>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
} 
