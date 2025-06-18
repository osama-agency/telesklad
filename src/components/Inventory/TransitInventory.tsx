'use client';

import React, { useState, useEffect } from 'react';
import { LoadingButton } from '@/components/ui/button';

interface TransitSummary {
  productId: number;
  productName: string;
  totalInTransit: number;
  stockQuantity: number;
  activePurchases: {
    purchaseId: number;
    quantity: number;
    status: string;
    createdAt: string;
  }[];
}

interface TransitInventoryProps {
  className?: string;
}

const statusTranslations: Record<string, string> = {
  'draft': 'Черновик',
  'sent': 'Отправлено',
  'awaiting_payment': 'Ожидает оплату',
  'paid': 'Оплачено',
  'shipped': 'Отправлено в карго',
  'received': 'Получено',
  'cancelled': 'Отменено'
};

const statusColors: Record<string, string> = {
  'draft': 'bg-gray-100 text-gray-800',
  'sent': 'bg-blue-100 text-blue-800',
  'awaiting_payment': 'bg-yellow-100 text-yellow-800',
  'paid': 'bg-green-100 text-green-800',
  'shipped': 'bg-purple-100 text-purple-800',
  'received': 'bg-green-100 text-green-800',
  'cancelled': 'bg-red-100 text-red-800'
};

export default function TransitInventory({ className }: TransitInventoryProps) {
  const [transitData, setTransitData] = useState<TransitSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTransitData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/inventory/transit');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      if (result.success) {
        setTransitData(result.data);
      } else {
        throw new Error(result.error || 'Failed to fetch transit data');
      }
    } catch (err) {
      console.error('Error fetching transit data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const syncTransitQuantities = async () => {
    try {
      setSyncing(true);
      setError(null);
      
      const response = await fetch('/api/inventory/transit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'sync' }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      if (result.success) {
        // Обновляем данные после синхронизации
        await fetchTransitData();
      } else {
        throw new Error(result.error || 'Failed to sync transit data');
      }
    } catch (err) {
      console.error('Error syncing transit data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    fetchTransitData();
  }, []);

  const totalItemsInTransit = transitData.reduce((sum, item) => sum + item.totalInTransit, 0);
  const totalProductsInTransit = transitData.length;

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Загрузка данных о товарах в пути...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              📦
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Товаров в пути</p>
              <p className="text-2xl font-bold text-gray-900">{totalProductsInTransit}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
              🚛
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Общее количество</p>
              <p className="text-2xl font-bold text-gray-900">{totalItemsInTransit}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Синхронизация</p>
            <p className="text-xs text-gray-500">Обновить данные</p>
          </div>
          <LoadingButton
            onClick={syncTransitQuantities}
            isLoading={syncing}
            variant="outline"
            size="sm"
          >
            {syncing ? 'Синхронизация...' : '🔄'}
          </LoadingButton>
        </div>
      </div>

      {/* Ошибки */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-red-600">⚠️</span>
            <span className="ml-2 text-red-800">{error}</span>
            <LoadingButton
              onClick={fetchTransitData}
              variant="outline"
              size="sm"
              className="ml-auto"
            >
              Повторить
            </LoadingButton>
          </div>
        </div>
      )}

      {/* Основная таблица */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            🚛 Товары в пути
          </h3>
        </div>
        <div className="p-6">
          {transitData.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">📦</div>
              <p className="text-gray-600">Нет товаров в пути</p>
              <p className="text-sm text-gray-500">
                Товары появятся здесь после отправки закупок поставщикам
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Товар</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">В пути</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">На складе</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Активные закупки</th>
                  </tr>
                </thead>
                <tbody>
                  {transitData.map((item) => (
                    <tr key={item.productId} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-gray-900">{item.productName}</p>
                          <p className="text-sm text-gray-500">ID: {item.productId}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          {item.totalInTransit} шт.
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-gray-700">{item.stockQuantity} шт.</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          {item.activePurchases.map((purchase) => (
                            <div key={purchase.purchaseId} className="flex items-center space-x-2">
                              <span className="text-sm text-gray-600">
                                #{purchase.purchaseId}: {purchase.quantity} шт.
                              </span>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusColors[purchase.status] || 'bg-gray-100 text-gray-800'}`}>
                                {statusTranslations[purchase.status] || purchase.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 