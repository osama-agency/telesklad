"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { OrderEntity } from "@/hooks/useOrders";
import { ORDER_STATUSES } from "@/hooks/useOrders";
// Убираем flatpickr - будем использовать нативные HTML5 date inputs

interface EditOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedOrder: Partial<OrderEntity>) => void;
  order: OrderEntity | null;
}

export default function EditOrderModal({ isOpen, onClose, onSave, order }: EditOrderModalProps) {
  const [formData, setFormData] = useState<any>({});
  const [activeTab, setActiveTab] = useState<'order' | 'customer' | 'delivery'>('order');

  useEffect(() => {
    if (order) {
      console.log('🔍 EditOrderModal: Initializing form with order data:', order);
      console.log('🏙️ City data: customercity =', order.customercity, 'user.address =', order.user?.address);
      console.log('💰 Financial data:', {
        total_amount: order.total_amount,
        bonus: order.bonus,
        deliverycost: order.deliverycost
      });
      console.log('👤 User data (Rails structure):', {
        first_name: order.user?.first_name, // Имя
        last_name: order.user?.last_name,   // Отчество в Rails
        middle_name: order.user?.middle_name // Фамилия в Rails
      });
      console.log('📍 Address data:', {
        street: order.user?.street,
        home: order.user?.home,
        build: order.user?.build,
        apartment: order.user?.apartment,
        postal_code: order.user?.postal_code,
        full_address: order.customeraddress
      });
      
      const newFormData: any = {
        id: order.id,
        status: order.status,
        // Данные заказа
        total_amount: order.total_amount || 0,
        bonus: order.bonus || 0,
        deliverycost: order.deliverycost || 0,
        tracking_number: order.tracking_number || "",
        paid_at: order.paid_at,
        shipped_at: order.shipped_at,
        
        // Данные клиента - приоритет: user данные, fallback: order данные
        // В старом Rails: first_name=Имя, last_name=Отчество, middle_name пустое
        // Правильная структура: first_name=Имя, middle_name=Отчество, last_name=Фамилия
        first_name: (order.user?.first_name || order.customername?.split(' ')[0] || "").trim(),
        middle_name: (order.user?.last_name || order.customername?.split(' ')[2] || "").trim(), // отчество из last_name
        last_name: (order.user?.middle_name || order.customername?.split(' ')[1] || "").trim(), // фамилия из middle_name
        email: (order.user?.email || order.customeremail || "").trim(),
        phone_number: (order.user?.phone_number || order.customerphone || "").trim(),
        
        // Адрес доставки - город из customercity заказа, fallback на address пользователя
        city: (order.customercity || order.user?.address || "").trim(),
        street: (order.user?.street || "").trim(),
        home: (order.user?.home || "").trim(),
        build: (order.user?.build || "").trim(),
        apartment: (order.user?.apartment || "").trim(),
        postal_code: order.user?.postal_code || "",
      };
      
      // Автоматически генерируем полный адрес из компонентов
      newFormData.full_address = buildFullAddress(newFormData) || (order.customeraddress || "").trim();
      
      console.log('✅ EditOrderModal: Form data initialized:', newFormData);
      setFormData(newFormData);
    }
    // Убираем flatpickr инициализацию
  }, [order, isOpen]);

  // Функция для автоматического формирования полного адреса
  const buildFullAddress = (data: any) => {
    const parts = [];
    
    if (data.postal_code && data.postal_code !== 0) parts.push(data.postal_code);
    if (data.city) parts.push(data.city);
    if (data.street) parts.push(data.street);
    if (data.home) parts.push(data.home);
    if (data.build) parts.push(data.build);
    if (data.apartment) parts.push(data.apartment);
    
    return parts.join(' ');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    let updatedData;
    if (type === 'number') {
      const numericValue = value === '' ? 0 : parseFloat(value);
      updatedData = { ...formData, [name]: numericValue };
    } else {
      updatedData = { ...formData, [name]: value };
    }
    
    // Если изменяется любое поле адреса - автоматически обновляем полный адрес
    if (['postal_code', 'city', 'street', 'home', 'build', 'apartment'].includes(name)) {
      updatedData.full_address = buildFullAddress(updatedData);
    }
    
    setFormData(updatedData);
  };
  
  const handleDateChange = (name: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [name]: value ? new Date(value).toISOString() : null }));
  };

  const handleSave = () => {
    console.log('💾 EditOrderModal: Saving form data:', formData);
    
    // Преобразуем данные обратно в формат API
    const apiData = {
      ...formData,
      // Данные заказа
      customeremail: formData.email,
      customerphone: formData.phone_number,
      customername: `${formData.first_name} ${formData.last_name} ${formData.middle_name}`.trim(),
      customercity: formData.city,
      customeraddress: formData.full_address,
      
      // Данные пользователя для обновления профиля
      // Сохраняем в правильной структуре Rails: first_name=Имя, last_name=Отчество, middle_name=Фамилия
      first_name: formData.first_name,
      last_name: formData.middle_name, // отчество сохраняем в last_name
      middle_name: formData.last_name, // фамилию сохраняем в middle_name
      email: formData.email,
      phone_number: formData.phone_number,
      street: formData.street,
      home: formData.home,
      build: formData.build,
      apartment: formData.apartment,
      postal_code: formData.postal_code ? parseInt(formData.postal_code) : null,
    };
    
    console.log('📤 EditOrderModal: Sending API data:', apiData);
    onSave(apiData);
  };

  if (!order) return null;

  const getDataSource = (userValue: any, orderValue: any) => {
    if (userValue && orderValue && userValue !== orderValue) {
      return 'mixed';
    } else if (userValue) {
      return 'profile';
    } else if (orderValue) {
      return 'order';
    }
    return 'empty';
  };

  const DataSourceIndicator = ({ source }: { source: string }) => {
    const indicators = {
      profile: { color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300', text: 'Профиль', icon: '👤' },
      order: { color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300', text: 'Заказ', icon: '📦' },
      mixed: { color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300', text: 'Смешано', icon: '⚠️' },
      empty: { color: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400', text: 'Пусто', icon: '—' }
    };
    
    const indicator = indicators[source as keyof typeof indicators] || indicators.empty;
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${indicator.color}`}>
        <span>{indicator.icon}</span>
        {indicator.text}
      </span>
    );
  };

  const tabs = [
    { id: 'order', label: 'Заказ', icon: '📦' },
    { id: 'customer', label: 'Клиент', icon: '👤' },
    { id: 'delivery', label: 'Доставка', icon: '🚚' }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="relative w-full max-w-4xl rounded-xl bg-white dark:bg-gray-800 shadow-2xl border border-gray-200 dark:border-gray-700 max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Заголовок */}
            <div className="sticky top-0 bg-white dark:bg-gray-800 z-10 border-b border-gray-200 dark:border-gray-700">
              <div className="p-6 pb-0">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-[#1E293B] dark:text-white">
                      Редактирование заказа #{order.externalid || order.id}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Клиент: {order.user?.full_name || order.customername || 'Не указано'}
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>
              </div>
              
              {/* Табы */}
              <div className="flex border-b border-gray-200 dark:border-gray-700 px-6">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-[#1A6DFF] text-[#1A6DFF] dark:text-[#1A6DFF]'
                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    <span>{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Контент */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              {activeTab === 'order' && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
                      <span>📊</span>
                      Информация о заказе
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Статус заказа</label>
                        <select
                          name="status"
                          value={formData.status}
                          onChange={handleChange}
                          className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-[#1E293B] dark:text-white transition-all focus:border-[#1A6DFF] focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20"
                        >
                          {Object.entries(ORDER_STATUSES).map(([value, label]) => (
                            <option key={value} value={value}>{label}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Трек-номер</label>
                        <input
                          type="text"
                          name="tracking_number"
                          value={formData.tracking_number || ""}
                          onChange={handleChange}
                          className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-[#1E293B] dark:text-white transition-all focus:border-[#1A6DFF] focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20"
                          placeholder="Введите трек-номер"
                        />
                        {formData.tracking_number && (
                          <div className="mt-2">
                            <a 
                              href={formData.tracking_number.startsWith('@') 
                                ? formData.tracking_number.substring(1) 
                                : formData.tracking_number.startsWith('http') 
                                  ? formData.tracking_number 
                                  : `https://www.pochta.ru/tracking#${formData.tracking_number}`
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#1A6DFF] hover:text-[#00C5FF] text-xs break-all transition-colors flex items-center gap-1"
                            >
                              <span>🔗</span>
                              Отследить посылку
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                    <h4 className="font-semibold text-green-900 dark:text-green-100 mb-3 flex items-center gap-2">
                      <span>💰</span>
                      Финансовая информация
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Сумма заказа (₽)</label>
                        <input
                          type="number"
                          name="total_amount"
                          value={formData.total_amount || ""}
                          onChange={handleChange}
                          className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-[#1E293B] dark:text-white transition-all focus:border-[#1A6DFF] focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20"
                          placeholder="0"
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Бонусы (₽)</label>
                        <input
                          type="number"
                          name="bonus"
                          value={formData.bonus || ""}
                          onChange={handleChange}
                          className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-[#1E293B] dark:text-white transition-all focus:border-[#1A6DFF] focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20"
                          placeholder="0"
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Доставка (₽)</label>
                        <input
                          type="number"
                          name="deliverycost"
                          value={formData.deliverycost || ""}
                          onChange={handleChange}
                          className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-[#1E293B] dark:text-white transition-all focus:border-[#1A6DFF] focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20"
                          placeholder="0"
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                    <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-3 flex items-center gap-2">
                      <span>📅</span>
                      Важные даты
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Дата оплаты</label>
                        <div className="relative">
                          <input
                            type="date"
                            name="paid_at"
                            value={formData.paid_at ? new Date(formData.paid_at).toISOString().split('T')[0] : ''}
                            onChange={(e) => handleDateChange('paid_at', e.target.value)}
                            className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 pr-10 text-sm text-[#1E293B] dark:text-white transition-all focus:border-[#1A6DFF] focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20"
                          />
                          {formData.paid_at && (
                            <button
                              type="button"
                              onClick={() => handleDateChange('paid_at', '')}
                              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors"
                              title="Очистить дату"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Дата отправки</label>
                        <div className="relative">
                          <input
                            type="date"
                            name="shipped_at"
                            value={formData.shipped_at ? new Date(formData.shipped_at).toISOString().split('T')[0] : ''}
                            onChange={(e) => handleDateChange('shipped_at', e.target.value)}
                            className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 pr-10 text-sm text-[#1E293B] dark:text-white transition-all focus:border-[#1A6DFF] focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20"
                          />
                          {formData.shipped_at && (
                            <button
                              type="button"
                              onClick={() => handleDateChange('shipped_at', '')}
                              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors"
                              title="Очистить дату"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'customer' && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-amber-900 dark:text-amber-100 flex items-center gap-2">
                        <span>👤</span>
                        Персональные данные
                      </h4>
                      <DataSourceIndicator source={getDataSource(order.user?.first_name, order.customername)} />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Имя</label>
                        <input
                          type="text"
                          name="first_name"
                          value={formData.first_name || ""}
                          onChange={handleChange}
                          className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-[#1E293B] dark:text-white transition-all focus:border-[#1A6DFF] focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20"
                          placeholder="Введите имя"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Фамилия</label>
                        <input
                          type="text"
                          name="last_name"
                          value={formData.last_name || ""}
                          onChange={handleChange}
                          className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-[#1E293B] dark:text-white transition-all focus:border-[#1A6DFF] focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20"
                          placeholder="Введите фамилию"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Отчество</label>
                        <input
                          type="text"
                          name="middle_name"
                          value={formData.middle_name || ""}
                          onChange={handleChange}
                          className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-[#1E293B] dark:text-white transition-all focus:border-[#1A6DFF] focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20"
                          placeholder="Введите отчество"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-lg p-4 border border-cyan-200 dark:border-cyan-800">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-cyan-900 dark:text-cyan-100 flex items-center gap-2">
                        <span>📞</span>
                        Контактная информация
                      </h4>
                      <DataSourceIndicator source={getDataSource(order.user?.email, order.customeremail)} />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email || ""}
                          onChange={handleChange}
                          className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-[#1E293B] dark:text-white transition-all focus:border-[#1A6DFF] focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20"
                          placeholder="Введите email"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Телефон</label>
                        <input
                          type="text"
                          name="phone_number"
                          value={formData.phone_number || ""}
                          onChange={handleChange}
                          className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-[#1E293B] dark:text-white transition-all focus:border-[#1A6DFF] focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20"
                          placeholder="Введите телефон"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'delivery' && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-lg p-4 border border-emerald-200 dark:border-emerald-800">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-emerald-900 dark:text-emerald-100 flex items-center gap-2">
                        <span>🏠</span>
                        Адрес доставки
                      </h4>
                      <DataSourceIndicator source={getDataSource(order.user?.street, order.customeraddress)} />
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Город</label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city || ""}
                          onChange={handleChange}
                          className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-[#1E293B] dark:text-white transition-all focus:border-[#1A6DFF] focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20"
                          placeholder="Введите город"
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Улица</label>
                          <input
                            type="text"
                            name="street"
                            value={formData.street || ""}
                            onChange={handleChange}
                            className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-[#1E293B] dark:text-white transition-all focus:border-[#1A6DFF] focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20"
                            placeholder="Название улицы"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Дом</label>
                          <input
                            type="text"
                            name="home"
                            value={formData.home || ""}
                            onChange={handleChange}
                            className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-[#1E293B] dark:text-white transition-all focus:border-[#1A6DFF] focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20"
                            placeholder="№"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Корпус</label>
                          <input
                            type="text"
                            name="build"
                            value={formData.build || ""}
                            onChange={handleChange}
                            className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-[#1E293B] dark:text-white transition-all focus:border-[#1A6DFF] focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20"
                            placeholder="Корп."
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Квартира/Офис</label>
                          <input
                            type="text"
                            name="apartment"
                            value={formData.apartment || ""}
                            onChange={handleChange}
                            className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-[#1E293B] dark:text-white transition-all focus:border-[#1A6DFF] focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20"
                            placeholder="Номер квартиры или офиса"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Индекс</label>
                          <input
                            type="text"
                            name="postal_code"
                            value={formData.postal_code || ""}
                            onChange={handleChange}
                            className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-[#1E293B] dark:text-white transition-all focus:border-[#1A6DFF] focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20"
                            placeholder="Почтовый индекс"
                            pattern="[0-9]{6}"
                            maxLength={6}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Полный адрес 
                          <span className="text-xs text-gray-500 ml-2">(если поля выше не заполнены)</span>
                        </label>
                        <textarea
                          name="full_address"
                          value={formData.full_address || ""}
                          onChange={handleChange}
                          rows={2}
                          className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-[#1E293B] dark:text-white transition-all focus:border-[#1A6DFF] focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20"
                          placeholder="Введите полный адрес доставки"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
            
            {/* Кнопки действий */}
            <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-6">
              <div className="flex justify-end gap-3">
                <button
                  onClick={onClose}
                  className="px-6 py-3 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-medium"
                >
                  Отмена
                </button>
                <button
                  onClick={handleSave}
                  className="px-6 py-3 rounded-lg bg-gradient-to-r from-[#1A6DFF] to-[#00C5FF] text-white hover:scale-105 transition-all font-medium shadow-lg hover:shadow-xl"
                >
                  Сохранить изменения
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 