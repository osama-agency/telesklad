"use client";

import { useAutoSync } from '@/hooks/useAutoSync';

export function AutoSyncProvider({ children }: { children: React.ReactNode }) {
  // Авто-синхронизация отключена
  return <>{children}</>;
} 