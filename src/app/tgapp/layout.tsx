"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import Script from "next/script";
import "@/styles/globals.css";
import "@/css/inter.css";
import "@/styles/telegram-adaptive-theme.scss";
import "./styles/tgapp.css";
import "./styles/catalog.css";
import "./styles/profile.css";
import "./styles/subscriptions.css";
import "./styles/telegram-ui-theme.css";
import { TelegramAuthProvider } from "@/context/TelegramAuthContext";
import { FavoritesProvider } from "@/context/FavoritesContext";
import { useTelegramTheme } from "./_components/useTelegramTheme";
import { useCartMainButton } from "./_components/useMainButton";
import Head from "next/head";

interface TgAppLayoutProps {
  children: React.ReactNode;
}

function TgAppLayoutInner({ children }: TgAppLayoutProps) {
  const pathname = usePathname();
  const { isDark, themeParams } = useTelegramTheme();
  
  // Управление MainButton для корзины
  useCartMainButton();

  // Инициализация Telegram WebApp SDK
  useEffect(() => {
    if (typeof window === "undefined") return;
    const tg = (window as any).Telegram?.WebApp as any | undefined;
    if (!tg) return;

    try {
      // Вызываем ready() как можно раньше
      tg.ready();
      tg.expand();
      
      // Устанавливаем цвета в зависимости от темы
      if (isDark) {
        tg.setHeaderColor(themeParams?.bg_color || "#1c1c1e");
        tg.setBackgroundColor(themeParams?.bg_color || "#1c1c1e");
      } else {
        tg.setHeaderColor(themeParams?.bg_color || "#FFFFFF");
        tg.setBackgroundColor(themeParams?.bg_color || "#F9FAFB");
      }
      
      // Виброотклик при смене роута
      tg.HapticFeedback?.selectionChanged();
      // Закрытие по свайпу вниз отключаем на iOS
      tg.disableClosingConfirmation?.();
      
      // Отключаем вертикальные свайпы для лучшего UX
      if (tg.disableVerticalSwipes) {
        tg.disableVerticalSwipes();
      }
      
      // Отключаем логи в продакшене для ускорения
      if (process.env.NODE_ENV === 'production') {
        console.log = () => {};
        console.warn = () => {};
      }
    } catch (e) {
      console.warn("Telegram SDK init error", e);
    }
  }, [pathname, isDark, themeParams]);

  // Управление темой body
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    // Добавляем/удаляем класс dark на body
    if (isDark) {
      document.body.classList.add('dark');
      document.body.setAttribute('data-theme', 'dark');
      document.documentElement.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
      document.body.setAttribute('data-theme', 'light');
      document.documentElement.classList.remove('dark');
    }
    
    // Устанавливаем стиль body для обеспечения полной высоты
    document.body.style.minHeight = '100vh';
    document.body.style.minHeight = '100dvh';
    document.documentElement.style.minHeight = '100vh';
    document.documentElement.style.minHeight = '100dvh';
  }, [isDark]);

  // Раннее вызов ready() еще до загрузки компонентов
  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).Telegram?.WebApp) {
      (window as any).Telegram.WebApp.ready();
    }
  }, []);

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </Head>
      {/* Telegram WebApp SDK */}
      <Script
        src="https://telegram.org/js/telegram-web-app.js"
        strategy="beforeInteractive"
        onLoad={() => {
          console.log('📱 Telegram WebApp script loaded');
          if (window.Telegram?.WebApp) {
            console.log('✅ Telegram WebApp available:', (window.Telegram.WebApp as any).version || 'unknown');
          } else {
            console.error('❌ Telegram WebApp not found after script load');
          }
        }}
        onError={(e) => {
          console.error('❌ Failed to load Telegram WebApp script:', e);
        }}
      />
      
      <div 
        className={`min-h-screen tg-theme-container ${isDark ? 'tg-dark dark tgui-dark' : 'tg-light tgui-light'}`}
        data-theme={isDark ? 'dark' : 'light'}
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        {children}
      </div>
    </>
  );
}

export default function TgAppLayout({ children }: TgAppLayoutProps) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </Head>
      <TelegramAuthProvider>
        <FavoritesProvider>
          <TgAppLayoutInner>{children}</TgAppLayoutInner>
        </FavoritesProvider>
      </TelegramAuthProvider>
    </>
  );
} 