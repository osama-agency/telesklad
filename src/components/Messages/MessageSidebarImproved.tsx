"use client";

import { SearchIcon } from "@/assets/icons";
import { cn } from "@/lib/utils";
import { useMessagesContext } from "@/context/MessagesContext";
import { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import ClientStatusLegend from "./ClientStatusLegend";

interface MessageSidebarImprovedProps {
  selectedUserId: string | null;
  onUserSelect: (userId: string) => void;
  isMobile?: boolean;
}

export default function MessageSidebarImproved({ 
  selectedUserId, 
  onUserSelect, 
  isMobile = false 
}: MessageSidebarImprovedProps) {
  const { users, loading, searchQuery, setSearch } = useMessagesContext();
  const [localSearch, setLocalSearch] = useState(searchQuery);

  // Дебаунс поиска
  const debouncedSearch = useCallback((query: string) => {
    const timeoutId = setTimeout(() => {
      setSearch(query);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [setSearch]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalSearch(value);
    debouncedSearch(value);
  };

  // Фильтруем пользователей
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    return users.filter(user => {
      const searchLower = searchQuery.toLowerCase();
      const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim();
      return (
        user.tg_id?.toLowerCase().includes(searchLower) ||
        fullName.toLowerCase().includes(searchLower) ||
        user.username?.toLowerCase().includes(searchLower)
      );
    });
  }, [users, searchQuery]);

  // Сортируем пользователей по активности
  const sortedUsers = useMemo(() => {
    return [...filteredUsers].sort((a, b) => {
      // Сначала активные клиенты (с доставленными заказами)
      if (a.orderStats.clientStatus === 'active' && b.orderStats.clientStatus !== 'active') return -1;
      if (a.orderStats.clientStatus !== 'active' && b.orderStats.clientStatus === 'active') return 1;
      
      // Затем потенциальные клиенты (с заказами)
      if (a.orderStats.clientStatus === 'potential' && b.orderStats.clientStatus === 'new') return -1;
      if (a.orderStats.clientStatus === 'new' && b.orderStats.clientStatus === 'potential') return 1;
      
      // Затем онлайн пользователи
      if (a.isOnline && !b.isOnline) return -1;
      if (!a.isOnline && b.isOnline) return 1;
      
      // Затем по времени последнего сообщения
      return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime();
    });
  }, [filteredUsers]);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'сейчас';
    if (diffInMinutes < 60) return `${diffInMinutes}м`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}ч`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}д`;
    return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
  };

  const getStatusIndicator = (user: any) => {
    // Статус клиента (приоритет над онлайн статусом)
    const clientStatusColors = {
      active: 'bg-green-500', // Активный клиент
      potential: 'bg-yellow-500', // Потенциальный клиент
      new: 'bg-gray-400' // Новый клиент
    };
    
    if (user.isOnline) {
      return <span className="absolute bottom-0 right-0 size-3.5 rounded-full border-2 border-white dark:border-dark-2 bg-green-500" />;
    }
    if (user.isTyping) {
      return (
        <span className="absolute bottom-0 right-0 size-3.5 rounded-full border-2 border-white dark:border-dark-2 bg-blue-500">
          <span className="absolute inset-0 rounded-full bg-blue-500 animate-pulse" />
        </span>
      );
    }
    
    return (
      <span className={`absolute bottom-0 right-0 size-3.5 rounded-full border-2 border-white dark:border-dark-2 ${clientStatusColors[user.orderStats.clientStatus as keyof typeof clientStatusColors]}`} />
    );
  };

  const getClientName = (user: any) => {
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    if (user.first_name) {
      return user.first_name;
    }
    if (user.username) {
      return `@${user.username}`;
    }
    return `ID: ${user.tg_id}`;
  };

  const getClientStatusText = (user: any) => {
    const { orderStats } = user;
    if (orderStats.clientStatus === 'active') {
      return `${orderStats.deliveredOrders} заказов • ${formatCurrency(orderStats.totalSpent)}`;
    }
    if (orderStats.clientStatus === 'potential') {
      return `${orderStats.totalOrders} заказов в работе`;
    }
    return `${user.messageCount} сообщений`;
  };

  const formatCurrency = (amount: string) => {
    const num = Number(amount);
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}М ₽`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(0)}К ₽`;
    }
    return `${num} ₽`;
  };

  return (
    <>
      {/* Header */}
      <div className="sticky border-b border-gray-200 dark:border-gray-700 py-6 px-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[#1E293B] dark:text-white">
            {isMobile ? "Чаты" : "Диалоги Telegram"}
          </h3>
          <motion.span 
            key={filteredUsers.length}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-[#1A6DFF] to-[#00C5FF] text-xs font-medium text-white"
          >
            {filteredUsers.length}
          </motion.span>
        </div>
      </div>
      
      {/* Search */}
      <div className="px-6 py-4">
        <div className="relative">
          <input
            type="text"
            value={localSearch}
            onChange={handleSearchChange}
            className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 py-3 pl-4 pr-12 text-sm text-[#1E293B] dark:text-white outline-none transition-all focus:border-[#1A6DFF] focus:ring-2 focus:ring-[#1A6DFF]/20"
            placeholder={isMobile ? "Поиск..." : "Поиск по имени, ID или @username..."}
          />
          <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1A6DFF] transition-colors">
            <SearchIcon />
          </button>
        </div>
        
        {/* Легенда статусов */}
        <div className="mt-3 flex justify-center">
          <ClientStatusLegend />
        </div>
      </div>

      {/* Users List */}
              <div className="no-scrollbar flex-1 overflow-y-auto px-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#1A6DFF] border-t-transparent"></div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Загрузка диалогов...</p>
            </div>
          </div>
        ) : sortedUsers.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="text-sm text-[#64748B] dark:text-gray-400 mb-2">
              {searchQuery ? "Пользователи не найдены" : "Нет диалогов"}
            </p>
            {searchQuery && (
              <button 
                onClick={() => {
                  setLocalSearch('');
                  setSearch('');
                }}
                className="text-sm text-[#1A6DFF] hover:underline"
              >
                Очистить поиск
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2 pb-4">
            {sortedUsers.map((user, index) => (
              <motion.div
                key={user.tg_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => onUserSelect(user.tg_id!)}
                className={cn(
                  "flex cursor-pointer items-center rounded-xl p-3 transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700/50",
                  selectedUserId === user.tg_id && "bg-gradient-to-r from-[#1A6DFF]/10 to-[#00C5FF]/10 border border-[#1A6DFF]/20"
                )}
              >
                <div className="relative mr-4 flex-shrink-0">
                  <div className="size-12 rounded-full bg-gradient-to-r from-[#1A6DFF] to-[#00C5FF] flex items-center justify-center">
                    <span className="text-white font-medium text-sm">
                      {getClientName(user).charAt(0).toUpperCase()}
                    </span>
                  </div>
                  {getStatusIndicator(user)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h5 className="font-medium text-[#1E293B] dark:text-white truncate">
                      {getClientName(user)}
                    </h5>
                    <div className="text-xs text-[#64748B] dark:text-gray-400 flex-shrink-0 ml-2">
                      {formatTime(user.lastMessageAt)}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-[#64748B] dark:text-gray-400 truncate">
                      {getClientStatusText(user)}
                    </div>
                    
                    {user.isTyping && (
                      <div className="flex items-center gap-1 text-xs text-[#1A6DFF]">
                        <div className="flex gap-1">
                          <div className="w-1 h-1 bg-[#1A6DFF] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-1 h-1 bg-[#1A6DFF] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-1 h-1 bg-[#1A6DFF] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                        <span className="ml-1">печатает</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Дополнительная информация для активных клиентов */}
                  {user.orderStats.clientStatus === 'active' && (
                    <div className="mt-1 flex items-center gap-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        ⭐ VIP клиент
                      </span>
                    </div>
                  )}
                  
                  {user.orderStats.clientStatus === 'potential' && (
                    <div className="mt-1 flex items-center gap-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                        🔄 В работе
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </>
  );
} 