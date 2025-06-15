import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { autoSyncService } from '@/lib/autoSync';

export function useAutoSync() {
  const { data: session, status } = useSession();

  useEffect(() => {
    // Запускаем автоматическую синхронизацию только если пользователь авторизован
    if (status === 'authenticated' && session?.user) {
      console.log('🔐 Пользователь авторизован, запускаем автоматическую синхронизацию');
      autoSyncService.startAutoSync();

      // Очистка при размонтировании или выходе из аккаунта
      return () => {
        autoSyncService.stopAutoSync();
      };
    } else if (status === 'unauthenticated') {
      console.log('🚪 Пользователь не авторизован, останавливаем синхронизацию');
      autoSyncService.stopAutoSync();
    }
  }, [status, session]);

  // Возвращаем статус синхронизации
  return {
    syncStatus: autoSyncService.getSyncStatus(),
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading'
  };
} 