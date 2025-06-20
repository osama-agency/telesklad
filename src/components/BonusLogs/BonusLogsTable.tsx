"use client";

import React, { useState, useEffect } from 'react';

interface BonusLog {
  id: string;
  user_id: string;
  user: {
    id: string;
    first_name: string;
    last_name: string;
    username: string;
    tg_id: string;
    display_name: string;
  };
  bonus_amount: number;
  reason: string;
  source_type: string;
  source_id: string;
  operation_type: 'earned' | 'spent';
  created_at: string;
  updated_at: string;
}

interface BonusLogsResponse {
  logs: BonusLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  stats: {
    total_operations: number;
    total_amount: number;
    earned: {
      operations: number;
      amount: number;
    };
    spent: {
      operations: number;
      amount: number;
    };
  };
}

export default function BonusLogsTable() {
  const [logs, setLogs] = useState<BonusLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    pages: 0
  });
  const [stats, setStats] = useState({
    total_operations: 0,
    total_amount: 0,
    earned: { operations: 0, amount: 0 },
    spent: { operations: 0, amount: 0 }
  });

  // Фильтры
  const [filters, setFilters] = useState({
    user_id: '',
    operation: 'all' // 'all', 'earned', 'spent'
  });

  const fetchLogs = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        operation: filters.operation
      });

      if (filters.user_id) {
        params.append('user_id', filters.user_id);
      }

      const response = await fetch(`/api/settings/bonus-logs?${params}`);
      if (!response.ok) throw new Error('Ошибка загрузки логов');

      const data: BonusLogsResponse = await response.json();
      setLogs(data.logs);
      setPagination(data.pagination);
      setStats(data.stats);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(1);
  }, [filters]);

  const handlePageChange = (newPage: number) => {
    fetchLogs(newPage);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAmount = (amount: number) => {
    return Math.abs(amount).toLocaleString('ru-RU');
  };

  const getOperationBadge = (operation: 'earned' | 'spent', amount: number) => {
    if (operation === 'earned') {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          ↗ +{formatAmount(amount)}
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          ↘ -{formatAmount(amount)}
        </span>
      );
    }
  };

  const getSourceTypeBadge = (sourceType: string) => {
    const colors = {
      'order': 'bg-blue-100 text-blue-800',
      'manual': 'bg-purple-100 text-purple-800',
      'bonus': 'bg-yellow-100 text-yellow-800',
      'refund': 'bg-orange-100 text-orange-800'
    };

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colors[sourceType as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
        {sourceType}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              📊
            </div>
            <div>
              <p className="text-sm text-gray-600">Всего операций</p>
              <p className="text-xl font-semibold">{stats.total_operations.toLocaleString('ru-RU')}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              ↗
            </div>
            <div>
              <p className="text-sm text-gray-600">Начислено</p>
              <p className="text-xl font-semibold text-green-600">+{formatAmount(stats.earned.amount)}</p>
              <p className="text-xs text-gray-500">{stats.earned.operations} операций</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
              ↘
            </div>
            <div>
              <p className="text-sm text-gray-600">Списано</p>
              <p className="text-xl font-semibold text-red-600">-{formatAmount(stats.spent.amount)}</p>
              <p className="text-xs text-gray-500">{stats.spent.operations} операций</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
              💰
            </div>
            <div>
              <p className="text-sm text-gray-600">Баланс</p>
              <p className={`text-xl font-semibold ${stats.total_amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stats.total_amount >= 0 ? '+' : ''}{formatAmount(stats.total_amount)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Фильтры и таблица */}
      <div className="bg-white rounded-lg border">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold mb-4">Логи бонусов</h3>
          
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="ID пользователя"
                value={filters.user_id}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilters(prev => ({ ...prev, user_id: e.target.value }))}
                className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={filters.operation}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilters(prev => ({ ...prev, operation: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Все операции</option>
              <option value="earned">Начисления</option>
              <option value="spent">Списания</option>
            </select>
          </div>
        </div>

        <div className="p-6">
          {/* Таблица */}
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-600">{error}</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Дата</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Пользователь</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Операция</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Сумма</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Источник</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Причина</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {formatDate(log.created_at)}
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium">{log.user.display_name}</p>
                            <p className="text-xs text-gray-500">ID: {log.user.tg_id}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {getOperationBadge(log.operation_type, log.bonus_amount)}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`font-medium ${log.bonus_amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {log.bonus_amount >= 0 ? '+' : ''}{formatAmount(log.bonus_amount)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {getSourceTypeBadge(log.source_type)}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {log.reason || 'Не указана'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Пагинация */}
              {pagination.pages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <p className="text-sm text-gray-600">
                    Показано {((pagination.page - 1) * pagination.limit) + 1}-{Math.min(pagination.page * pagination.limit, pagination.total)} из {pagination.total}
                  </p>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page <= 1}
                      className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      ←
                    </button>
                    <span className="text-sm">
                      {pagination.page} из {pagination.pages}
                    </span>
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page >= pagination.pages}
                      className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      →
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
} 