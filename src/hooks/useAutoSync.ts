import { useEffect } from 'react';
import { useSession } from 'next-auth/react';

export function useAutoSync() {
  const { data: session, status } = useSession();

  // Отключено: авто-синхронизация больше не используется
  // useEffect(() => { ... }, [status, session]);

  return {
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading',
    syncStatus: null,
  };
} 