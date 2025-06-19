import { type PropsWithChildren } from "react";
import Link from "next/link";
import "@/styles/webapp.scss";
import { IconComponent } from "@/components/webapp/IconComponent";

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

      {/* Fixed bottom navigation - точно как в Rails */}
      <nav className="fixed-menu">
        <div className="container-adaptive">
          <ul>
            <li>
              <Link href="/webapp" className="active">
                <IconComponent name="catalog" size={24} />
                Каталог
              </Link>
            </li>
            <li>
              <Link href="/webapp/favorites">
                <IconComponent name="unfavorite" size={24} />
                Избранное
              </Link>
            </li>
            <li>
              <Link href="/webapp/profile">
                <IconComponent name="profile" size={24} />
                Профиль
              </Link>
            </li>
            <li>
              <Link href="/webapp/support">
                <IconComponent name="support" size={24} />
                Поддержка
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </div>
  );
} 