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
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400">
          ↗ +{formatAmount(amount)}
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-400">
          ↘ -{formatAmount(amount)}
        </span>
      );
    }
  };

  const getSourceTypeBadge = (sourceType: string) => {
    const colors = {
      'order': 'bg-blue-100 text-blue-800 dark:bg-blue-800/20 dark:text-blue-400',
      'manual': 'bg-purple-100 text-purple-800 dark:bg-purple-800/20 dark:text-purple-400',
      'bonus': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800/20 dark:text-yellow-400',
      'refund': 'bg-orange-100 text-orange-800 dark:bg-orange-800/20 dark:text-orange-400'
    };

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colors[sourceType as keyof typeof colors] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
        {sourceType}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-800/20 rounded-lg flex items-center justify-center">
              📊
            </div>
            <div>
              <p className="text-sm text-[#64748B] dark:text-gray-400">Всего операций</p>
              <p className="text-xl font-semibold text-[#1E293B] dark:text-white">{stats.total_operations.toLocaleString('ru-RU')}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-green-100 dark:bg-green-800/20 rounded-lg flex items-center justify-center">
              ↗
            </div>
            <div>
              <p className="text-sm text-[#64748B] dark:text-gray-400">Начислено</p>
              <p className="text-xl font-semibold text-green-600 dark:text-green-400">+{formatAmount(stats.earned.amount)}</p>
              <p className="text-xs text-[#64748B] dark:text-gray-400">{stats.earned.operations} операций</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-red-100 dark:bg-red-800/20 rounded-lg flex items-center justify-center">
              ↘
            </div>
            <div>
              <p className="text-sm text-[#64748B] dark:text-gray-400">Списано</p>
              <p className="text-xl font-semibold text-red-600 dark:text-red-400">-{formatAmount(stats.spent.amount)}</p>
              <p className="text-xs text-[#64748B] dark:text-gray-400">{stats.spent.operations} операций</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
              💰
            </div>
            <div>
              <p className="text-sm text-[#64748B] dark:text-gray-400">Баланс</p>
              <p className={`text-xl font-semibold ${stats.total_amount >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {stats.total_amount >= 0 ? '+' : ''}{formatAmount(stats.total_amount)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Фильтры и таблица */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-[#1E293B] dark:text-white">Логи бонусов</h3>
          
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="ID пользователя"
                value={filters.user_id}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilters(prev => ({ ...prev, user_id: e.target.value }))}
                className="w-full max-w-xs px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-[#1E293B] dark:text-white placeholder-[#64748B] dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20 focus:border-[#1A6DFF] dark:focus:border-[#1A6DFF] transition-all duration-300"
              />
            </div>
            <select
              value={filters.operation}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilters(prev => ({ ...prev, operation: e.target.value }))}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-[#1E293B] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20 focus:border-[#1A6DFF] dark:focus:border-[#1A6DFF] transition-all duration-300"
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
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1A6DFF]"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-600 dark:text-red-400">{error}</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 font-medium text-[#374151] dark:text-gray-300">Дата</th>
                      <th className="text-left py-3 px-4 font-medium text-[#374151] dark:text-gray-300">Пользователь</th>
                      <th className="text-left py-3 px-4 font-medium text-[#374151] dark:text-gray-300">Операция</th>
                      <th className="text-left py-3 px-4 font-medium text-[#374151] dark:text-gray-300">Сумма</th>
                      <th className="text-left py-3 px-4 font-medium text-[#374151] dark:text-gray-300">Источник</th>
                      <th className="text-left py-3 px-4 font-medium text-[#374151] dark:text-gray-300">Причина</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200">
                        <td className="py-3 px-4 text-sm text-[#64748B] dark:text-gray-400">
                          {formatDate(log.created_at)}
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium text-[#1E293B] dark:text-white">{log.user.display_name}</p>
                            <p className="text-xs text-[#64748B] dark:text-gray-400">ID: {log.user.tg_id}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {getOperationBadge(log.operation_type, log.bonus_amount)}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`font-medium ${log.bonus_amount >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {log.bonus_amount >= 0 ? '+' : ''}{formatAmount(log.bonus_amount)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {getSourceTypeBadge(log.source_type)}
                        </td>
                        <td className="py-3 px-4 text-sm text-[#64748B] dark:text-gray-400">
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
                  <p className="text-sm text-[#64748B] dark:text-gray-400">
                    Показано {((pagination.page - 1) * pagination.limit) + 1}-{Math.min(pagination.page * pagination.limit, pagination.total)} из {pagination.total}
                  </p>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page <= 1}
                      className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-[#1E293B] dark:text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-300"
                    >
                      ←
                    </button>
                    <span className="text-sm text-[#64748B] dark:text-gray-400">
                      {pagination.page} из {pagination.pages}
                    </span>
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page >= pagination.pages}
                      className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-[#1E293B] dark:text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-300"
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