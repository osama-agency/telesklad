'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface TelegramUser {
  id: string;
  tg_id: string;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  email: string;
  bonus_balance: number;
  order_count: number;
  role: number;
  started: boolean;
  is_blocked: boolean;
}

interface TelegramAuthContextType {
  user: TelegramUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (initData: string) => Promise<boolean>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const TelegramAuthContext = createContext<TelegramAuthContextType | undefined>(undefined);

interface TelegramAuthProviderProps {
  children: ReactNode;
}

export function TelegramAuthProvider({ children }: TelegramAuthProviderProps) {
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user && !user.is_blocked && user.started;

  // Автоматическая аутентификация при загрузке
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Проверяем, есть ли Telegram Web App
        if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
          const tg = window.Telegram.WebApp;
          
          console.log('🔍 Telegram WebApp detected:', {
            initData: tg.initData,
            initDataUnsafe: tg.initDataUnsafe,
            platform: tg.platform,
            version: tg.version
          });
          
          // Инициализируем Telegram Web App
          tg.ready();
          tg.expand();
          tg.setHeaderColor('#FFFFFF');
          tg.setBackgroundColor('#f9f9f9');

          // Получаем initData
          const initData = tg.initData;
          
          if (initData && tg.initDataUnsafe?.user) {
            console.log('🔐 Authenticating with Telegram initData...');
            await login(initData);
          } else {
            console.warn('⚠️ No Telegram initData available');
            // Для разработки можем использовать тестовые данные
            if (process.env.NODE_ENV === 'development') {
              console.log('🧪 Using test user for development');
              await checkTestUser();
            }
          }
        } else {
          console.warn('⚠️ Telegram Web App not available');
          // Для разработки можем использовать тестовые данные
          if (process.env.NODE_ENV === 'development') {
            console.log('🧪 Using test user for development');
            await checkTestUser();
          }
        }
      } catch (error) {
        console.error('❌ Auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // Проверка тестового пользователя для разработки
  const checkTestUser = async () => {
    try {
      const response = await fetch('/api/webapp/auth/telegram?tg_id=9999');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUser(data.user);
          console.log('🧪 Test user authenticated:', data.user);
        }
      }
    } catch (error) {
      console.error('Test user check failed:', error);
    }
  };

  // Вход через Telegram
  const login = async (initData: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/webapp/auth/telegram', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ initData }),
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        console.log('✅ User authenticated:', data.user);
        return true;
      } else {
        console.error('❌ Authentication failed:', data.error);
        return false;
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Выход
  const logout = () => {
    setUser(null);
    console.log('👋 User logged out');
  };

  // Обновление данных пользователя
  const refreshUser = async () => {
    if (!user?.tg_id) return;

    try {
      const response = await fetch(`/api/webapp/auth/telegram?tg_id=${user.tg_id}`);
      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        console.log('🔄 User data refreshed');
      }
    } catch (error) {
      console.error('❌ Refresh user error:', error);
    }
  };

  const value: TelegramAuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    refreshUser,
  };

  return (
    <TelegramAuthContext.Provider value={value}>
      {children}
    </TelegramAuthContext.Provider>
  );
}

export function useTelegramAuth() {
  const context = useContext(TelegramAuthContext);
  if (context === undefined) {
    throw new Error("useTelegramAuth must be used within a TelegramAuthProvider");
  }
  return context;
} 