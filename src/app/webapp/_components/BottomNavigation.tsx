"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { IconComponent } from "@/components/webapp/IconComponent";

export function BottomNavigation() {
  const pathname = usePathname();

  // Функция для определения активной страницы
  const isActive = (path: string) => {
    if (path === "/webapp") {
      // Каталог активен только на точном пути или если мы на странице товара
      return pathname === "/webapp" || pathname.startsWith("/webapp/products/");
    }
    return pathname.startsWith(path);
  };

  const menuItems = [
    {
      href: "/webapp",
      icon: "catalog",
      label: "Каталог"
    },
    {
      href: "/webapp/favorites",
      icon: "unfavorite",
      label: "Избранное"
    },
    {
      href: "/webapp/profile",
      icon: "profile", 
      label: "Профиль"
    },
    {
      href: "/webapp/support",
      icon: "support",
      label: "Поддержка"
    }
  ];

  return (
    <nav className="fixed-menu">
      <div className="menu-grid">
        {menuItems.map((item) => (
          <Link 
            key={item.href}
            href={item.href} 
            className={`menu-item ${isActive(item.href) ? 'active' : ''}`}
          >
            <IconComponent name={item.icon} size={20} />
            <span className="menu-text">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
} 