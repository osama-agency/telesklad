"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface CustomerInfoPanelProps {
  userId: string | null;
  isVisible: boolean;
  onClose: () => void;
}

interface CustomerData {
  user: {
    id: string;
    tg_id: string;
    first_name: string | null;
    last_name: string | null;
    username: string | null;
    email: string;
    phone_number: string | null;
    photo_url: string | null;
    created_at: string;
    orders: Array<{
      id: string;
      total_amount: string;
      status: number;
      created_at: string;
      tracking_number: string | null;
      order_items: Array<{
        id: string;
        quantity: number;
        price: string | null;
        total: string | null;
        products: {
          id: string;
          name: string | null;
          price: string | null;
        };
      }>;
    }>;
    reviews: Array<{
      id: string;
      rating: number;
      content: string | null;
      created_at: string;
      products: {
        id: string;
        name: string | null;
      };
    }>;
  };
  stats: {
    totalOrders: number;
    totalSpent: string;
    avgOrderValue: string;
    orderStatuses: Array<{
      status: number;
      count: number;
    }>;
  };
}

const statusLabels: Record<number, { label: string; color: string }> = {
  0: { label: "Новый", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
  1: { label: "Подтвержден", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" },
  2: { label: "Проверка оплаты", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
  3: { label: "Отправлен", color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200" },
  4: { label: "Доставлен", color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200" },
  5: { label: "Отменен", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
};

export default function CustomerInfoPanel({ userId, isVisible, onClose }: CustomerInfoPanelProps) {
  const [customerData, setCustomerData] = useState<CustomerData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"info" | "orders" | "reviews">("info");

  useEffect(() => {
    if (userId && isVisible) {
      fetchCustomerData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, isVisible]);

  const fetchCustomerData = async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/users/${userId}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Неизвестная ошибка' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      setCustomerData(data);
    } catch (err) {
      console.error('Ошибка загрузки данных клиента:', err);
      setError(err instanceof Error ? err.message : 'Произошла ошибка при загрузке данных');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB'
    }).format(Number(amount));
  };

  const getCustomerName = () => {
    if (!customerData?.user) return 'Неизвестный пользователь';
    
    const { first_name, last_name, username } = customerData.user;
    if (first_name && last_name) {
      return `${first_name} ${last_name}`;
    }
    return username || `Пользователь ${customerData.user.tg_id}`;
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="fixed right-0 top-0 h-full w-96 bg-white dark:bg-gray-800 shadow-xl border-l border-gray-200 dark:border-gray-700 z-50 flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-[#1E293B] dark:text-white">
            Информация о клиенте
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {loading && (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#1A6DFF] border-t-transparent"></div>
            </div>
          )}

          {error && (
            <div className="p-4">
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                <button
                  onClick={fetchCustomerData}
                  className="mt-2 text-sm text-red-600 dark:text-red-400 underline hover:no-underline"
                >
                  Попробовать снова
                </button>
              </div>
            </div>
          )}

          {customerData && customerData.user && (
            <>
              {/* Customer Profile */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-[#1A6DFF] to-[#00C5FF] rounded-full flex items-center justify-center text-white font-semibold">
                    {getCustomerName().charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#1E293B] dark:text-white">
                      {getCustomerName()}
                    </h4>
                    <p className="text-sm text-[#64748B] dark:text-gray-400">
                      @{customerData.user.username || customerData.user.tg_id}
                    </p>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#F8FAFC] dark:bg-gray-700 rounded-lg p-3">
                    <div className="text-lg font-bold text-[#1A6DFF]">
                      {customerData.stats.totalOrders}
                    </div>
                    <div className="text-xs text-[#64748B] dark:text-gray-400">
                      Заказов
                    </div>
                  </div>
                  <div className="bg-[#F8FAFC] dark:bg-gray-700 rounded-lg p-3">
                    <div className="text-lg font-bold text-[#1A6DFF]">
                      {formatCurrency(customerData.stats.totalSpent)}
                    </div>
                    <div className="text-xs text-[#64748B] dark:text-gray-400">
                      Потрачено
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-gray-200 dark:border-gray-700">
                {[
                  { key: "info", label: "Инфо" },
                  { key: "orders", label: "Заказы" },
                  { key: "reviews", label: "Отзывы" },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as any)}
                    className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                      activeTab === tab.key
                        ? "text-[#1A6DFF] border-b-2 border-[#1A6DFF]"
                        : "text-[#64748B] dark:text-gray-400 hover:text-[#1E293B] dark:hover:text-white"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto no-scrollbar">
                {activeTab === "info" && (
                  <div className="p-4 space-y-4">
                    <div>
                      <label className="text-sm font-medium text-[#1E293B] dark:text-white">Email</label>
                      <p className="text-sm text-[#64748B] dark:text-gray-400">
                        {customerData.user.email || "Не указан"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-[#1E293B] dark:text-white">Телефон</label>
                      <p className="text-sm text-[#64748B] dark:text-gray-400">
                        {customerData.user.phone_number || "Не указан"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-[#1E293B] dark:text-white">Регистрация</label>
                      <p className="text-sm text-[#64748B] dark:text-gray-400">
                        {formatDate(customerData.user.created_at)}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-[#1E293B] dark:text-white">Средний чек</label>
                      <p className="text-sm text-[#64748B] dark:text-gray-400">
                        {formatCurrency(customerData.stats.avgOrderValue)}
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === "orders" && (
                  <div className="p-4 space-y-3">
                    {customerData.user.orders.length === 0 ? (
                      <p className="text-sm text-[#64748B] dark:text-gray-400 text-center py-8">
                        Заказов пока нет
                      </p>
                    ) : (
                      customerData.user.orders.map((order) => (
                        <div
                          key={order.id}
                          className="border border-gray-200 dark:border-gray-600 rounded-lg p-3 hover:border-[#1A6DFF]/30 transition-colors"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-[#1E293B] dark:text-white">
                              Заказ #{order.id}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              statusLabels[order.status]?.color || "bg-gray-100 text-gray-800"
                            }`}>
                              {statusLabels[order.status]?.label || "Неизвестно"}
                            </span>
                          </div>
                          <div className="text-sm text-[#64748B] dark:text-gray-400 mb-1">
                            {formatCurrency(order.total_amount)}
                          </div>
                          <div className="text-xs text-[#64748B] dark:text-gray-400">
                            {formatDate(order.created_at)}
                          </div>
                          {order.order_items.length > 0 && (
                            <div className="mt-2 text-xs text-[#64748B] dark:text-gray-400">
                              {order.order_items.length} товар(ов)
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}

                {activeTab === "reviews" && (
                  <div className="p-4 space-y-3">
                    {customerData.user.reviews.length === 0 ? (
                      <p className="text-sm text-[#64748B] dark:text-gray-400 text-center py-8">
                        Отзывов пока нет
                      </p>
                    ) : (
                      customerData.user.reviews.map((review) => (
                        <div
                          key={review.id}
                          className="border border-gray-200 dark:border-gray-600 rounded-lg p-3"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex items-center">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <svg
                                  key={star}
                                  className={`w-4 h-4 ${
                                    star <= review.rating 
                                      ? "text-yellow-400 fill-current" 
                                      : "text-gray-300"
                                  }`}
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                            <span className="text-xs text-[#64748B] dark:text-gray-400">
                              {formatDate(review.created_at)}
                            </span>
                          </div>
                          <p className="text-sm text-[#1E293B] dark:text-white mb-2">
                            {review.content}
                          </p>
                          <p className="text-xs text-[#64748B] dark:text-gray-400">
                            {review.products.name}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
} 