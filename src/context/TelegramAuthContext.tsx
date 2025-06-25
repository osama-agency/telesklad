'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { logger } from '@/lib/logger';

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
          
          logger.debug('🔍 Telegram WebApp detected', {
            hasInitData: !!tg.initData,
            hasUser: !!tg.initDataUnsafe?.user,
            platform: tg.platform,
            version: tg.version
          }, 'TelegramAuth');
          
          // Инициализируем Telegram Web App
          tg.ready();
          tg.expand();
          tg.setHeaderColor('#FFFFFF');
          tg.setBackgroundColor('#f9f9f9');

          // Получаем initData
          const initData = tg.initData;
          
          if (initData && tg.initDataUnsafe?.user) {
            logger.info('🔐 Authenticating with Telegram initData', undefined, 'TelegramAuth');
            await login(initData);
          } else {
            logger.warn('⚠️ No Telegram initData available', undefined, 'TelegramAuth');
            // Для разработки можем использовать тестовые данные
            if (process.env.NODE_ENV === 'development') {
              logger.debug('🧪 Using test user for development', undefined, 'TelegramAuth');
              await checkTestUser();
            }
          }
        } else {
          logger.warn('⚠️ Telegram Web App not available', undefined, 'TelegramAuth');
          // Для разработки можем использовать тестовые данные
          if (process.env.NODE_ENV === 'development') {
            logger.debug('🧪 Using test user for development', undefined, 'TelegramAuth');
            await checkTestUser();
          }
        }
      } catch (error) {
        logger.error('❌ Auth initialization error', error, 'TelegramAuth');
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
          logger.debug('🧪 Test user authenticated', { tg_id: data.user.tg_id }, 'TelegramAuth');
        }
      }
    } catch (error) {
      logger.error('Test user check failed', error, 'TelegramAuth');
    }
  };

  // Вход через Telegram
  const login = async (initData: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      logger.info('🔐 Attempting Telegram authentication', undefined, 'TelegramAuth');
      
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
        logger.info('✅ User authenticated successfully', {
          id: data.user.id,
          tg_id: data.user.tg_id,
          name: `${data.user.first_name} ${data.user.last_name || ''}`.trim()
        }, 'TelegramAuth');
        return true;
      } else {
        logger.error('❌ Authentication failed', data.error, 'TelegramAuth');
        
        // Если пользователь не найден или заблокирован, показываем соответствующее сообщение
        if (data.error?.includes('not started') || data.error?.includes('banned')) {
          logger.warn('⚠️ User needs to start the bot or is banned', undefined, 'TelegramAuth');
        }
        
        return false;
      }
    } catch (error) {
      logger.error('❌ Login error', error, 'TelegramAuth');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Выход
  const logout = () => {
    setUser(null);
    logger.info('👋 User logged out', undefined, 'TelegramAuth');
  };

  // Обновление данных пользователя
  const refreshUser = async () => {
    if (!user?.tg_id) return;

    try {
      const response = await fetch(`/api/webapp/auth/telegram?tg_id=${user.tg_id}`);
      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        logger.debug('🔄 User data refreshed', undefined, 'TelegramAuth');
      }
    } catch (error) {
      logger.error('❌ Refresh user error', error, 'TelegramAuth');
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