"use client";

import { useAutoSync } from '@/hooks/useAutoSync';

export function AutoSyncProvider({ children }: { children: React.ReactNode }) {
  // Запускаем автоматическую синхронизацию
  useAutoSync();

  return <>{children}</>;
} 