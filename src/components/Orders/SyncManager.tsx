import { useState, useEffect } from 'react';
import { SyncResult } from '@/types/order';

interface SyncStatus {
  totalOrders: number;
  lastSyncAt: string | null;
  isReady: boolean;
}

const SyncManager = () => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [lastSyncResult, setLastSyncResult] = useState<SyncResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Получение статуса синхронизации
  const fetchSyncStatus = async () => {
    try {
      const response = await fetch('/api/orders/sync');
      if (response.ok) {
        const data = await response.json();
        setSyncStatus(data);
      }
    } catch (err) {
      console.error('Error fetching sync status:', err);
    }
  };

  // Запуск синхронизации
  const handleSync = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/orders/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: SyncResult = await response.json();
      setLastSyncResult(result);
      
      // Обновляем статус после синхронизации
      await fetchSyncStatus();

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка синхронизации');
    } finally {
      setIsLoading(false);
    }
  };

  // Загрузка статуса при монтировании
  useEffect(() => {
    fetchSyncStatus();
  }, []);

  // Форматирование даты
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Никогда';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  // Форматирование длительности
  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}мс`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}с`;
    return `${(ms / 60000).toFixed(1)}мин`;
  };

  return (
    <div className="bg-level-2 rounded-2xl p-6 border border-muted/20">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white">Синхронизация заказов</h3>
          <p className="text-sm text-gray-400 mt-1">
            Автоматическая синхронизация с внешним API каждые 5 минут
          </p>
        </div>
        
        <button
          onClick={handleSync}
          disabled={isLoading}
          className={`
            px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200
            ${isLoading 
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
              : 'bg-primary text-white hover:bg-primary/90 active:scale-95'
            }
          `}
        >
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
              <span>Синхронизация...</span>
            </div>
          ) : (
            'Синхронизировать'
          )}
        </button>
      </div>

      {/* Статус синхронизации */}
      {syncStatus && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-level-3 rounded-lg p-4">
            <div className="text-2xl font-bold text-white mb-1">
              {syncStatus.totalOrders.toLocaleString('ru-RU')}
            </div>
            <div className="text-sm text-gray-400">Всего заказов</div>
          </div>
          
          <div className="bg-level-3 rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-1">Последняя синхронизация</div>
            <div className="text-sm font-medium text-white">
              {formatDate(syncStatus.lastSyncAt)}
            </div>
          </div>
          
          <div className="bg-level-3 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${syncStatus.isReady ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <div className="text-sm font-medium text-white">
                {syncStatus.isReady ? 'Готов' : 'Не готов'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Результат последней синхронизации */}
      {lastSyncResult && (
        <div className="bg-level-3 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-white mb-3">Результат последней синхронизации</h4>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <div className="text-xl font-bold text-blue-400">{lastSyncResult.ordersProcessed}</div>
              <div className="text-xs text-gray-400">Обработано</div>
            </div>
            <div>
              <div className="text-xl font-bold text-green-400">{lastSyncResult.ordersCreated}</div>
              <div className="text-xs text-gray-400">Создано</div>
            </div>
            <div>
              <div className="text-xl font-bold text-yellow-400">{lastSyncResult.ordersUpdated}</div>
              <div className="text-xs text-gray-400">Обновлено</div>
            </div>
            <div>
              <div className="text-xl font-bold text-purple-400">{lastSyncResult.itemsProcessed}</div>
              <div className="text-xs text-gray-400">Товаров</div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-400">
              Длительность: {formatDuration(lastSyncResult.duration)}
            </div>
            <div className="text-xs text-gray-400">
              {formatDate(lastSyncResult.lastSyncAt.toString())}
            </div>
          </div>

          {/* Ошибки синхронизации */}
          {lastSyncResult.errors.length > 0 && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <div className="text-sm font-medium text-red-400 mb-2">
                Ошибки ({lastSyncResult.errors.length})
              </div>
              <div className="space-y-1">
                {lastSyncResult.errors.slice(0, 3).map((error, index) => (
                  <div key={index} className="text-xs text-red-300">
                    {error}
                  </div>
                ))}
                {lastSyncResult.errors.length > 3 && (
                  <div className="text-xs text-red-400">
                    ... и ещё {lastSyncResult.errors.length - 3} ошибок
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Ошибка синхронизации */}
      {error && (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <div className="text-sm font-medium text-red-400 mb-1">Ошибка синхронизации</div>
          <div className="text-xs text-red-300">{error}</div>
        </div>
      )}

      {/* Информация о автоматической синхронизации */}
      <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <div className="flex items-start space-x-3">
          <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium text-blue-400 mb-1">
              Автоматическая синхронизация
            </div>
            <div className="text-xs text-blue-300">
              Заказы автоматически синхронизируются каждые 5 минут. 
              Если заказ с таким externalId уже существует — он обновляется, 
              если нет — создается новый. Удаления заказов не происходит.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SyncManager; 