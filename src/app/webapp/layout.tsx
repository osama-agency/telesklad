import { type PropsWithChildren } from "react";
import Link from "next/link";
import "@/styles/webapp.scss";
import { IconComponent } from "@/components/webapp/IconComponent";
import { CartSummary } from "./_components/CartSummary";

export default function WebappLayout({ children }: PropsWithChildren) {
  return (
    <div className="webapp-container">
      {/* Header точно как в Rails */}
      <header className="webapp-header">
        <div className="container-adaptive py-3">
          <div className="header-search">
            <input 
              type="search" 
              placeholder="Поиск товаров..." 
              className="block w-full pe-7 focus:border-none outline-none"
            />
            <button type="submit" className="block bg-transparent border-none">
              <IconComponent name="search" size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Main content - точно как в Rails с отступами */}
      <main className="container-adaptive">
        {children}
      </main>

      {/* Cart Summary - глобально для всех страниц */}
      <CartSummary />

      {/* Fixed bottom navigation - точно как в Rails */}
      <nav className="fixed-menu">
        <div className="menu-grid">
          <Link href="/webapp" className="menu-item active">
            <IconComponent name="catalog" size={20} />
            <span className="menu-text">Каталог</span>
          </Link>
          <Link href="/webapp/favorites" className="menu-item">
            <IconComponent name="unfavorite" size={20} />
            <span className="menu-text">Избранное</span>
          </Link>
          <Link href="/webapp/profile" className="menu-item">
            <IconComponent name="profile" size={20} />
            <span className="menu-text">Профиль</span>
          </Link>
          <Link href="/webapp/support" className="menu-item">
            <IconComponent name="support" size={20} />
            <span className="menu-text">Поддержка</span>
          </Link>
        </div>
      </nav>
    </div>
  );
} 