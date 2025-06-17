import { useState, useEffect } from 'react';
import { SyncResult } from '@/types/order';

interface SyncStatus {
  totalOrders: number;
  lastSyncAt: string | null;
  isReady: boolean;
}

const SyncManager = () => (
  <div className="p-4 bg-level-3 rounded-lg text-white">
    Синхронизация заказов с внешним API отключена. Теперь все работает только с локальной базой.
  </div>
);

export default SyncManager; 