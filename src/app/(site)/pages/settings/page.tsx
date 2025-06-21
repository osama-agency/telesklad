"use client";

import { useState, useEffect } from "react";
import { Settings, Mail, Bell, Globe, Star, FileText, Package } from "lucide-react";
import BonusLogsTable from '@/components/BonusLogs/BonusLogsTable';
import StockLogsTable from '@/components/StockLogs/StockLogsTable';
import ManageFAQModal from '@/components/Modals/ManageFAQModal';

interface SettingsData {
  settings: Record<string, string>;
  loyaltyTiers: Array<{
    id: string;
    title: string;
    bonus_percentage: number;
    order_threshold: number;
    order_min_amount: number;
  }>;
  orderStats: {
    totalUsers: number;
    usersWithOrders: number;
    distribution: Array<{
      orderCount: number;
      userCount: number;
    }>;
  };
  notificationSettings?: {
    payment_reminder_first_hours: number;
    payment_reminder_final_hours: number;
    payment_auto_cancel_hours: number;
    review_request_days: number;
  };
}

interface SettingsComponentProps {
  data: SettingsData;
  onSave: (newSettings: Partial<SettingsData>) => Promise<void>;
  saving: boolean;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("system");
  const [settingsData, setSettingsData] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Загружаем настройки при монтировании
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      if (response.ok) {
        const data = await response.json();
        setSettingsData(data);
      }
    } catch (error) {
      console.error('Ошибка загрузки настроек:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (newSettings: Partial<SettingsData>) => {
    setSaving(true);
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSettings)
      });

      if (response.ok) {
        // Обновляем локальное состояние
        setSettingsData(prev => ({
          ...prev!,
          ...newSettings
        }));
        alert('Настройки успешно сохранены!');
      } else {
        alert('Ошибка сохранения настроек');
      }
    } catch (error) {
      console.error('Ошибка сохранения настроек:', error);
      alert('Ошибка сохранения настроек');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: "system", label: "Системные настройки", icon: Settings },
    { id: "loyalty", label: "Программа лояльности", icon: Star },
    { id: "bonus-logs", label: "Логи бонусов", icon: FileText },
    { id: "stock-logs", label: "Логи остатков", icon: Package },
    { id: "webapp", label: "WebApp Telegram", icon: Globe },
    { id: "telegram", label: "Бот Telegram", icon: Bell },
    { id: "notifications", label: "Уведомления", icon: Mail },
  ];

  const renderTabContent = () => {
    if (loading) {
      return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      );
    }

    if (!settingsData) {
      return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-gray-600">Ошибка загрузки настроек</p>
        </div>
      );
    }

    switch (activeTab) {
      case "system":
        return <SystemSettings data={settingsData} onSave={saveSettings} saving={saving} />;
      case "loyalty":
        return <LoyaltySettings data={settingsData} onSave={saveSettings} saving={saving} />;
      case "bonus-logs":
        return <BonusLogsTable />;
      case "stock-logs":
        return <StockLogsTable />;
      case "webapp":
        return <WebappSettings data={settingsData} onSave={saveSettings} saving={saving} />;
      case "telegram":
        return <TelegramSettings data={settingsData} onSave={saveSettings} saving={saving} />;
      case "notifications":
        return <NotificationSettings data={settingsData} onSave={saveSettings} saving={saving} />;
      default:
        return <SystemSettings data={settingsData} onSave={saveSettings} saving={saving} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1E293B] dark:text-white mb-2">Настройки</h1>
          <p className="text-[#64748B] dark:text-gray-400">Управление настройками системы и конфигурацией</p>
        </div>

        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-64 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 h-fit">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all duration-300 ${
                      activeTab === tab.id
                        ? "bg-gradient-to-r from-[#1A6DFF]/10 to-[#00C5FF]/10 text-[#1A6DFF] dark:text-[#00C5FF] border border-[#1A6DFF]/30 dark:border-[#00C5FF]/30"
                        : "text-[#374151] dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 hover:border-[#1A6DFF]/20 dark:hover:border-[#1A6DFF]/30"
                    }`}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
}

// Компонент системных настроек
function SystemSettings({ data, onSave, saving }: { 
  data: SettingsData; 
  onSave: (newSettings: Partial<SettingsData>) => Promise<void>; 
  saving: boolean; 
}) {
  const [formData, setFormData] = useState({
    shop_name: data.settings.shop_name || 'ТелеСклад',
    min_order_amount: data.settings.min_order_amount || '1000',
    delivery_price: data.settings.delivery_price || '500',
    maintenance_mode: data.settings.maintenance_mode === 'true',
    auto_update_stock: data.settings.auto_update_stock !== 'false'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const settings = {
      shop_name: formData.shop_name,
      min_order_amount: formData.min_order_amount,
      delivery_price: formData.delivery_price,
      maintenance_mode: formData.maintenance_mode.toString(),
      auto_update_stock: formData.auto_update_stock.toString()
    };

    await onSave({ settings });
  };
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-xl font-semibold text-[#1E293B] dark:text-white mb-6">Системные настройки</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-[#374151] dark:text-gray-300 mb-2">
            Название магазина
          </label>
          <input
            type="text"
            value={formData.shop_name}
            onChange={(e) => setFormData(prev => ({ ...prev, shop_name: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-[#1E293B] dark:text-white focus:border-[#1A6DFF] focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20 transition-all"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#374151] dark:text-gray-300 mb-2">
              Минимальная сумма заказа (₽)
            </label>
            <input
              type="number"
              value={formData.min_order_amount}
              onChange={(e) => setFormData(prev => ({ ...prev, min_order_amount: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-[#1E293B] dark:text-white focus:border-[#1A6DFF] focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#374151] dark:text-gray-300 mb-2">
              Стоимость доставки (₽)
            </label>
            <input
              type="number"
              value={formData.delivery_price}
              onChange={(e) => setFormData(prev => ({ ...prev, delivery_price: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-[#1E293B] dark:text-white focus:border-[#1A6DFF] focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20 transition-all"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-[#1E293B] dark:text-white">Режим технического обслуживания</h3>
              <p className="text-sm text-[#64748B] dark:text-gray-400">Временно закрыть доступ к веб-приложению</p>
            </div>
            <input
              type="checkbox"
              checked={formData.maintenance_mode}
              onChange={(e) => setFormData(prev => ({ ...prev, maintenance_mode: e.target.checked }))}
              className="w-4 h-4 text-[#1A6DFF] border-gray-300 dark:border-gray-600 rounded focus:ring-[#1A6DFF] dark:bg-gray-700"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-[#1E293B] dark:text-white">Автоматическое обновление остатков</h3>
              <p className="text-sm text-[#64748B] dark:text-gray-400">Синхронизация с внешними системами</p>
            </div>
            <input
              type="checkbox"
              checked={formData.auto_update_stock}
              onChange={(e) => setFormData(prev => ({ ...prev, auto_update_stock: e.target.checked }))}
              className="w-4 h-4 text-[#1A6DFF] border-gray-300 dark:border-gray-600 rounded focus:ring-[#1A6DFF] dark:bg-gray-700"
            />
          </div>
        </div>

        <button 
          type="submit"
          disabled={saving}
          className="bg-gradient-to-r from-[#1A6DFF] to-[#00C5FF] text-white px-6 py-2 rounded-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Сохранение...' : 'Сохранить настройки'}
        </button>
      </form>
    </div>
  );
}

// Компонент настроек программы лояльности
function LoyaltySettings({ data, onSave, saving }: SettingsComponentProps) {
  const [formData, setFormData] = useState({
    bonus_threshold: data.settings.bonus_threshold || '5000',
    tiers: data.loyaltyTiers.map(tier => ({
      ...tier,
      bonus_percentage: tier.bonus_percentage,
      order_threshold: tier.order_threshold
    }))
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const settings = {
      bonus_threshold: formData.bonus_threshold
    };

    await onSave({ 
      settings,
      loyaltyTiers: formData.tiers 
    });
  };

  const updateTier = (index: number, field: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      tiers: prev.tiers.map((tier, i) => 
        i === index ? { ...tier, [field]: value } : tier
      )
    }));
  };

  // Функция для получения количества пользователей в диапазоне
  const getUsersInRange = (minOrders: number, maxOrders?: number) => {
    return data.orderStats.distribution
      .filter(stat => {
        if (maxOrders !== undefined) {
          return stat.orderCount >= minOrders && stat.orderCount < maxOrders;
        }
        return stat.orderCount >= minOrders;
      })
      .reduce((sum, stat) => sum + stat.userCount, 0);
  };

  // Функция для пересчета уровней пользователей
  const handleRecalculateTiers = async () => {
    if (!confirm('Пересчитать уровни лояльности для всех пользователей? Это действие нельзя отменить.')) {
      return;
    }

    try {
      const response = await fetch('/api/settings/recalculate-tiers', {
        method: 'POST'
      });

      if (response.ok) {
        const result = await response.json();
        alert(result.message);
      } else {
        alert('Ошибка пересчета уровней');
      }
    } catch (error) {
      console.error('Ошибка пересчета уровней:', error);
      alert('Ошибка пересчета уровней');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-xl font-semibold text-[#1E293B] dark:text-white mb-6">Программа лояльности</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-[#374151] dark:text-gray-300 mb-2">
            Порог для начисления бонусов (₽)
          </label>
          <input
            type="number"
            value={formData.bonus_threshold}
            onChange={(e) => setFormData(prev => ({ ...prev, bonus_threshold: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-[#1E293B] dark:text-white focus:border-[#1A6DFF] focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20 transition-all"
          />
          <p className="text-sm text-[#64748B] dark:text-gray-400 mt-1">Минимальная сумма заказа для начисления бонусов</p>
        </div>

        {/* Статистика пользователей */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Статистика пользователей</h3>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-blue-700 dark:text-blue-300 font-medium">{data.orderStats.totalUsers}</div>
              <div className="text-blue-600 dark:text-blue-400">Всего пользователей</div>
            </div>
            <div>
              <div className="text-blue-700 dark:text-blue-300 font-medium">{data.orderStats.usersWithOrders}</div>
              <div className="text-blue-600 dark:text-blue-400">С заказами</div>
            </div>
            <div>
              <div className="text-blue-700 dark:text-blue-300 font-medium">{data.orderStats.totalUsers - data.orderStats.usersWithOrders}</div>
              <div className="text-blue-600 dark:text-blue-400">Без заказов</div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-medium text-[#1E293B] dark:text-white">Уровни лояльности</h3>
          
          {formData.tiers.map((tier, index) => {
            const nextTier = formData.tiers[index + 1];
            const usersInTier = getUsersInRange(
              tier.order_threshold, 
              nextTier ? nextTier.order_threshold : undefined
            );

            return (
              <div key={tier.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">{tier.title}</span>
                  <div className="text-sm text-gray-600">
                    {tier.order_threshold}+ заказов
                    <span className="ml-2 px-2 py-1 bg-gray-100 rounded text-xs">
                      {usersInTier} пользователей
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <label className="text-sm">Кэшбек:</label>
                    <input 
                      type="number" 
                      value={tier.bonus_percentage}
                      onChange={(e) => updateTier(index, 'bonus_percentage', parseInt(e.target.value))}
                      className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                    />
                    <span className="text-sm">%</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <label className="text-sm">От заказов:</label>
                    <input 
                      type="number" 
                      value={tier.order_threshold}
                      onChange={(e) => updateTier(index, 'order_threshold', parseInt(e.target.value))}
                      className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                    />
                  </div>
                </div>

                {usersInTier > 0 && (
                  <div className="mt-2 text-xs text-green-600">
                    ✓ {usersInTier} пользователей получат этот уровень
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex gap-3">
          <button 
            type="submit"
            disabled={saving}
            className="bg-gradient-to-r from-[#1A6DFF] to-[#00C5FF] text-white px-6 py-2 rounded-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Сохранение...' : 'Сохранить настройки'}
          </button>
          
          <button 
            type="button"
            onClick={handleRecalculateTiers}
            disabled={saving}
            className="bg-green-600 dark:bg-green-500 text-white px-6 py-2 rounded-lg hover:scale-105 hover:bg-green-700 dark:hover:bg-green-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Пересчитать уровни пользователей
          </button>
        </div>
      </form>
    </div>
  );
}

// Остальные компоненты - заглушки для демонстрации
function WebappSettings({ data, onSave, saving }: SettingsComponentProps) {
  const [showFAQModal, setShowFAQModal] = useState(false);
  const [faqStats, setFaqStats] = useState<{ total: number; lastUpdated: string | null }>({ total: 0, lastUpdated: null });
  const [settingsForm, setSettingsForm] = useState({
    tg_support: data.settings.tg_support || 'https://t.me/strattera_help',
    support_working_hours: data.settings.support_working_hours || 'Пн-Пт 9:00-18:00 МСК',
    support_response_time: data.settings.support_response_time || 'В течение 15 минут'
  });

  useEffect(() => {
    fetchFAQStats();
  }, []);

  useEffect(() => {
    setSettingsForm({
      tg_support: data.settings.tg_support || 'https://t.me/strattera_help',
      support_working_hours: data.settings.support_working_hours || 'Пн-Пт 9:00-18:00 МСК',
      support_response_time: data.settings.support_response_time || 'В течение 15 минут'
    });
  }, [data.settings]);

  const fetchFAQStats = async () => {
    try {
      const response = await fetch('/api/webapp/support');
      if (response.ok) {
        const data = await response.json();
        setFaqStats({
          total: data.faq_items?.length || 0,
          lastUpdated: new Date().toLocaleDateString('ru-RU')
        });
      }
    } catch (error) {
      console.error('Ошибка загрузки статистики FAQ:', error);
    }
  };

  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSave({ settings: settingsForm });
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const resetSettingsForm = () => {
    setSettingsForm({
      tg_support: data.settings.tg_support || 'https://t.me/strattera_help',
      support_working_hours: data.settings.support_working_hours || 'Пн-Пт 9:00-18:00 МСК',
      support_response_time: data.settings.support_response_time || 'В течение 15 минут'
    });
  };

  const handleFAQSave = () => {
    fetchFAQStats();
  };

  const initTestData = async () => {
    if (!confirm("Создать тестовые данные FAQ? Это действие доступно только если база данных пустая.")) {
      return;
    }

    try {
      const response = await fetch("/api/webapp/support/init-test-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });

      if (response.ok) {
        const result = await response.json();
        alert(result.message);
        fetchFAQStats();
      } else {
        const error = await response.json();
        alert(error.message || "Ошибка создания тестовых данных");
      }
    } catch (error) {
      console.error("Ошибка создания тестовых данных:", error);
      alert("Ошибка создания тестовых данных");
    }
  };

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-[#1E293B] dark:text-white mb-6">Настройки WebApp Telegram</h2>
        
        {/* FAQ Management Section */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-[#1E293B] dark:text-white mb-4">
            Управление FAQ поддержки
          </h3>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#64748B] dark:text-gray-400">
                  Всего записей FAQ: <span className="font-semibold text-[#1E293B] dark:text-white">{faqStats.total}</span>
                </p>
                {faqStats.lastUpdated && (
                  <p className="text-xs text-[#64748B] dark:text-gray-400 mt-1">
                    Последнее обновление: {faqStats.lastUpdated}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowFAQModal(true)}
                  className="bg-gradient-to-r from-[#1A6DFF] to-[#00C5FF] text-white px-4 py-2 rounded-lg hover:scale-105 transition-all duration-300 flex items-center gap-2"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/>
                  </svg>
                  Управлять FAQ
                </button>
                {faqStats.total === 0 && (
                  <button
                    onClick={initTestData}
                    className="bg-green-600 dark:bg-green-500 text-white px-3 py-2 rounded-lg hover:scale-105 hover:bg-green-700 dark:hover:bg-green-600 transition-all duration-300 text-sm"
                  >
                    Создать тестовые данные
                  </button>
                )}
              </div>
            </div>
          </div>
          {faqStats.total === 0 && (
            <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                💡 База данных FAQ пуста. Вы можете создать тестовые данные для демонстрации функциональности.
              </p>
            </div>
          )}
          <p className="text-sm text-[#64748B] dark:text-gray-400">
            Здесь вы можете управлять вопросами и ответами, которые отображаются на странице поддержки в WebApp Telegram.
          </p>
        </div>

        {/* General Settings Section */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-[#1E293B] dark:text-white mb-4">
            Общие настройки
          </h3>
          <form onSubmit={handleSettingsSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#374151] dark:text-gray-300 mb-2">
                Telegram поддержка
              </label>
              <input
                type="text"
                value={settingsForm.tg_support}
                onChange={(e) => setSettingsForm(prev => ({ ...prev, tg_support: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-[#1E293B] dark:text-white focus:border-[#1A6DFF] focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20 transition-all"
                placeholder="https://t.me/your_support_bot или @username"
              />
              <p className="text-xs text-[#64748B] dark:text-gray-400 mt-1">
                Введите полную ссылку (https://t.me/username) или username (@username). Изменение этого поля обновит ссылку &quot;Задать вопрос&quot; в WebApp
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#374151] dark:text-gray-300 mb-2">
                Часы работы поддержки
              </label>
              <input
                type="text"
                value={settingsForm.support_working_hours}
                onChange={(e) => setSettingsForm(prev => ({ ...prev, support_working_hours: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-[#1E293B] dark:text-white focus:border-[#1A6DFF] focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20 transition-all"
                placeholder="Пн-Пт 9:00-18:00 МСК"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#374151] dark:text-gray-300 mb-2">
                Время ответа
              </label>
              <input
                type="text"
                value={settingsForm.support_response_time}
                onChange={(e) => setSettingsForm(prev => ({ ...prev, support_response_time: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-[#1E293B] dark:text-white focus:border-[#1A6DFF] focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20 transition-all"
                placeholder="В течение 15 минут"
              />
            </div>
            
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="bg-gradient-to-r from-[#1A6DFF] to-[#00C5FF] text-white px-6 py-2 rounded-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Сохранение...' : 'Сохранить настройки'}
              </button>
              
              <button
                type="button"
                onClick={resetSettingsForm}
                disabled={saving}
                className="bg-gray-500 dark:bg-gray-600 text-white px-6 py-2 rounded-lg hover:scale-105 hover:bg-gray-600 dark:hover:bg-gray-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Сбросить
              </button>
            </div>
          </form>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <h4 className="font-medium text-blue-900 dark:text-blue-100">Информация</h4>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                Управление FAQ позволяет добавлять, редактировать и удалять вопросы-ответы, которые видят пользователи WebApp Telegram на странице поддержки.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Management Modal */}
      <ManageFAQModal
        isOpen={showFAQModal}
        onClose={() => setShowFAQModal(false)}
        onSave={handleFAQSave}
      />
    </>
  );
}

function TelegramSettings({ data, onSave, saving }: SettingsComponentProps) {
  const [formData, setFormData] = useState({
    telegram_bot_token: data.settings.telegram_bot_token || '',
    webapp_telegram_bot_token: data.settings.webapp_telegram_bot_token || ''
  });

  const [botStatus, setBotStatus] = useState<{
    telegram_bot: { valid: boolean; username?: string; loading: boolean };
    webapp_bot: { valid: boolean; username?: string; loading: boolean };
  }>({
    telegram_bot: { valid: false, loading: false },
    webapp_bot: { valid: false, loading: false }
  });

  useEffect(() => {
    getTokensStatus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const settings = {
      telegram_bot_token: formData.telegram_bot_token,
      webapp_telegram_bot_token: formData.webapp_telegram_bot_token
    };

    await onSave({ settings });
  };

  const testBotToken = async (type: 'telegram' | 'webapp') => {
    const token = type === 'telegram' ? formData.telegram_bot_token : formData.webapp_telegram_bot_token;
    
    if (!token) {
      alert('Введите токен бота для проверки');
      return;
    }

    setBotStatus(prev => ({
      ...prev,
      [`${type}_bot`]: { ...prev[`${type}_bot` as keyof typeof prev], loading: true }
    }));

    try {
      const response = await fetch(`https://api.telegram.org/bot${token}/getMe`);
      const result = await response.json();

      if (result.ok) {
        setBotStatus(prev => ({
          ...prev,
          [`${type}_bot`]: { 
            valid: true, 
            username: result.result.username, 
            loading: false 
          }
        }));
        alert(`✅ Бот @${result.result.username} работает корректно!`);
      } else {
        setBotStatus(prev => ({
          ...prev,
          [`${type}_bot`]: { valid: false, loading: false }
        }));
        alert(`❌ Ошибка: ${result.description || 'Неверный токен'}`);
      }
    } catch (error) {
      setBotStatus(prev => ({
        ...prev,
        [`${type}_bot`]: { valid: false, loading: false }
      }));
      alert('❌ Ошибка проверки токена. Проверьте подключение к интернету.');
    }
  };

  const getTokensStatus = async () => {
    try {
      console.log('🔍 Getting tokens status...');
      const response = await fetch('/api/telegram/tokens/status');
      
      if (response.ok) {
        const result = await response.json();
        console.log('📊 Tokens status:', result.data);
        
        setBotStatus({
          telegram_bot: {
            valid: result.data.telegram_bot.valid,
            username: result.data.telegram_bot.botInfo?.username,
            loading: false
          },
          webapp_bot: {
            valid: result.data.webapp_bot.valid,
            username: result.data.webapp_bot.botInfo?.username,
            loading: false
          }
        });
        
        return result.data;
      } else {
        console.error('❌ Failed to get tokens status');
        return null;
      }
    } catch (error) {
      console.error('❌ Error getting tokens status:', error);
      return null;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-xl font-semibold text-[#1E293B] dark:text-white mb-6">Бот Telegram</h2>
      
      {/* Описание системы ботов */}
      <div className="mb-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <h3 className="text-lg font-medium text-blue-900 dark:text-blue-100 mb-4">
          🤖 Архитектура системы Telegram ботов
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Основной бот */}
          <div className="bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-r from-[#1A6DFF] to-[#00C5FF] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">🛒</span>
              </div>
              <div>
                <h4 className="font-semibold text-[#1E293B] dark:text-white">Основной бот (Закупки)</h4>
                <p className="text-sm text-[#64748B] dark:text-gray-400">@teleskald_bot</p>
              </div>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <span className="text-green-600 dark:text-green-400">✅</span>
                <span className="text-[#374151] dark:text-gray-300">
                  <strong>Отправка закупок в группу:</strong> При нажатии &quot;Отправить поставщику&quot; отправляет детальную информацию о закупке в групповой чат закупщика с себестоимостью в ₺
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-600 dark:text-green-400">✅</span>
                <span className="text-[#374151] dark:text-gray-300">
                  <strong>Формат сообщения:</strong> Номер закупки, список товаров с артикулами и количеством, общая стоимость в ₺, статус &quot;sent_to_supplier&quot;
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-600 dark:text-green-400">✅</span>
                <span className="text-[#374151] dark:text-gray-300">
                  <strong>Только информационные сообщения:</strong> Без интерактивных кнопок, без callback обработки, только уведомления
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-600 dark:text-green-400">✅</span>
                <span className="text-[#374151] dark:text-gray-300">
                  <strong>Статусы закупок:</strong> draft → sent_to_supplier → awaiting_payment → paid → in_transit → received
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400">📍</span>
                <span className="text-[#374151] dark:text-gray-300">
                  <strong>Группа:</strong> {process.env.TELEGRAM_GROUP_CHAT_ID || '-4729817036'}
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-orange-600 dark:text-orange-400">🔧</span>
                <span className="text-[#374151] dark:text-gray-300">
                  <strong>Webhook:</strong> /api/telegram/webhook - обрабатывает только входящие сообщения, игнорирует callback_query
                </span>
              </div>
            </div>
          </div>

          {/* WebApp бот */}
          <div className="bg-white dark:bg-gray-800 border border-green-200 dark:border-green-700 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">📱</span>
              </div>
              <div>
                <h4 className="font-semibold text-[#1E293B] dark:text-white">WebApp бот (Клиенты)</h4>
                <p className="text-sm text-[#64748B] dark:text-gray-400">@strattera_test_bot</p>
              </div>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <span className="text-green-600 dark:text-green-400">✅</span>
                <span className="text-[#374151] dark:text-gray-300">
                  <strong>Полный цикл заказов:</strong> UNPAID → PAID → PROCESSING → SHIPPED → CANCELLED с интерактивными кнопками
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-600 dark:text-green-400">✅</span>
                <span className="text-[#374151] dark:text-gray-300">
                  <strong>Интерактивные функции:</strong> Кнопка &quot;Я оплатил&quot;, подтверждение админом, привязка трек-номеров, отмена заказов
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-600 dark:text-green-400">✅</span>
                <span className="text-[#374151] dark:text-gray-300">
                  <strong>CRON уведомления:</strong> Напоминания об оплате (48ч, 51ч), автоотмена (72ч), запросы отзывов (10 дней после доставки)
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-600 dark:text-green-400">✅</span>
                <span className="text-[#374151] dark:text-gray-300">
                  <strong>Система лояльности:</strong> Уведомления о бонусах, кэшбеке, повышении уровня, поступлении товаров
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-600 dark:text-green-400">✅</span>
                <span className="text-[#374151] dark:text-gray-300">
                  <strong>WebApp интерфейс:</strong> Полнофункциональное веб-приложение для клиентов (/src/app/webapp/) с каталогом, корзиной, заказами
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400">👥</span>
                <span className="text-[#374151] dark:text-gray-300">
                  <strong>Участники:</strong> Клиенты, Админ ({process.env.WEBAPP_ADMIN_CHAT_ID || '125861752'}), Курьер ({process.env.WEBAPP_COURIER_CHAT_ID || '7828956680'})
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-orange-600 dark:text-orange-400">🔧</span>
                <span className="text-[#374151] dark:text-gray-300">
                  <strong>Webhook:</strong> /api/webapp-telegram/webhook - полная обработка callback_query, команд, сообщений
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Детальное описание механизмов */}
        <div className="mt-6 space-y-4">
          <h4 className="font-medium text-blue-900 dark:text-blue-100">🔍 Механизмы работы системы:</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h5 className="font-medium text-[#1E293B] dark:text-white mb-2">📋 Закупки (Основной бот)</h5>
              <ul className="text-sm text-[#374151] dark:text-gray-300 space-y-1">
                <li>• <strong>Триггер:</strong> API /api/purchases/[id]/send-to-supplier</li>
                <li>• <strong>Сервис:</strong> TelegramBotService.sendPurchaseToSupplier()</li>
                <li>• <strong>Условие:</strong> Статус purchase = &quot;draft&quot;</li>
                <li>• <strong>Действие:</strong> Отправка в GROUP_CHAT_ID, смена статуса на &quot;sent_to_supplier&quot;</li>
                <li>• <strong>Формат:</strong> Детали товаров + общая стоимость в ₺</li>
              </ul>
            </div>

            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h5 className="font-medium text-[#1E293B] dark:text-white mb-2">🛍️ Заказы клиентов (WebApp бот)</h5>
              <ul className="text-sm text-[#374151] dark:text-gray-300 space-y-1">
                <li>• <strong>Создание:</strong> API /api/webapp/orders/create</li>
                <li>• <strong>Сервис:</strong> WebAppTelegramBotService</li>
                <li>• <strong>Уведомления:</strong> Клиенту, админу, курьеру</li>
                <li>• <strong>Интерактив:</strong> Кнопки &quot;Я оплатил&quot;, &quot;Подтвердить&quot;, &quot;Отменить&quot;</li>
                <li>• <strong>CRON:</strong> Напоминания, автоотмена, запросы отзывов</li>
              </ul>
            </div>

            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h5 className="font-medium text-[#1E293B] dark:text-white mb-2">⏰ CRON задачи</h5>
              <ul className="text-sm text-[#374151] dark:text-gray-300 space-y-1">
                <li>• <strong>Файл:</strong> /src/lib/cron/notification-cron.ts</li>
                <li>• <strong>API:</strong> /api/cron/run - запуск по расписанию</li>
                <li>• <strong>Типы:</strong> payment_reminder, auto_cancel, review_request</li>
                <li>• <strong>Логика:</strong> Проверка времени создания заказа + настройки таймингов</li>
                <li>• <strong>Повторы:</strong> Система retry при ошибках отправки</li>
              </ul>
            </div>

            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h5 className="font-medium text-[#1E293B] dark:text-white mb-2">🎯 Система лояльности</h5>
              <ul className="text-sm text-[#374151] dark:text-gray-300 space-y-1">
                <li>• <strong>Бонусы:</strong> Автоначисление при смене статуса на SHIPPED</li>
                <li>• <strong>Уровни:</strong> Автоповышение при достижении порогов</li>
                <li>• <strong>Кэшбек:</strong> Процент от суммы заказа</li>
                <li>• <strong>Уведомления:</strong> О начислениях, повышениях, поступлениях</li>
                <li>• <strong>API:</strong> /api/webapp/loyalty/* для управления</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Настройка токенов */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-[#1E293B] dark:text-white mb-4">
            🔑 Настройка токенов ботов
          </h3>
          
          <div className="space-y-6">
            {/* Основной бот для закупок */}
            <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-medium text-[#1E293B] dark:text-white">
                    🛒 Основной бот (закупки и админ)
                  </h4>
                  <p className="text-sm text-[#64748B] dark:text-gray-400">
                    Используется для уведомлений о закупках в групповой чат
                  </p>
                </div>
                {botStatus.telegram_bot.valid && (
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm">@{botStatus.telegram_bot.username}</span>
                  </div>
                )}
              </div>
              
              <div className="flex gap-3">
                <input
                  type="password"
                  value={formData.telegram_bot_token}
                  onChange={(e) => setFormData(prev => ({ ...prev, telegram_bot_token: e.target.value }))}
                  placeholder="123456789:ABCdefGHijklmnopQRStuVWXyz"
                  className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-[#1E293B] dark:text-white focus:border-[#1A6DFF] focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => testBotToken('telegram')}
                  disabled={botStatus.telegram_bot.loading || !formData.telegram_bot_token}
                  className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {botStatus.telegram_bot.loading ? '🔄' : '🧪 Тест'}
                </button>
              </div>
              
              <p className="text-xs text-[#64748B] dark:text-gray-400 mt-2">
                Получите токен у @BotFather в Telegram
              </p>
            </div>

            {/* WebApp бот для клиентов */}
            <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-medium text-[#1E293B] dark:text-white">
                    📱 WebApp бот (клиенты)
                  </h4>
                  <p className="text-sm text-[#64748B] dark:text-gray-400">
                    Используется для уведомлений клиентам, CRON задач и интерактивных функций
                  </p>
                </div>
                {botStatus.webapp_bot.valid && (
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm">@{botStatus.webapp_bot.username}</span>
                  </div>
                )}
              </div>
              
              <div className="flex gap-3">
                <input
                  type="password"
                  value={formData.webapp_telegram_bot_token}
                  onChange={(e) => setFormData(prev => ({ ...prev, webapp_telegram_bot_token: e.target.value }))}
                  placeholder="987654321:ZYXwvuTSrqponMLKjihgfEDcbA"
                  className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-[#1E293B] dark:text-white focus:border-[#1A6DFF] focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => testBotToken('webapp')}
                  disabled={botStatus.webapp_bot.loading || !formData.webapp_telegram_bot_token}
                  className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {botStatus.webapp_bot.loading ? '🔄' : '🧪 Тест'}
                </button>
              </div>
              
              <p className="text-xs text-[#64748B] dark:text-gray-400 mt-2">
                Этот бот должен поддерживать WebApp для работы с клиентами
              </p>
            </div>
          </div>

          {/* Предупреждение о безопасности */}
          <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <h4 className="font-medium text-orange-800 dark:text-orange-200">Безопасность</h4>
                <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                  Токены ботов хранятся в зашифрованном виде. Не передавайте их третьим лицам. При компрометации токена создайте нового бота у @BotFather.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Кнопки управления */}
        <div className="flex flex-wrap gap-3 pt-4">
          <button 
            type="submit"
            disabled={saving}
            className="bg-gradient-to-r from-[#1A6DFF] to-[#00C5FF] text-white px-6 py-2 rounded-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Сохранение...' : 'Сохранить токены'}
          </button>

          <button
            type="button"
            onClick={async () => {
              const status = await getTokensStatus();
              if (status) {
                const statusText = `📊 СТАТУС ТОКЕНОВ БОТОВ

🤖 Основной бот (закупки):
   Источник: ${status.telegram_bot.source === 'database' ? '🗄️ База данных' : status.telegram_bot.source === 'environment' ? '🌐 Переменные окружения' : '❌ Не найден'}
   Статус: ${status.telegram_bot.valid ? '✅ Действителен' : '❌ Недействителен'}
   ${status.telegram_bot.botInfo?.username ? `Бот: @${status.telegram_bot.botInfo.username}` : ''}

📱 WebApp бот (клиенты):
   Источник: ${status.webapp_bot.source === 'database' ? '🗄️ База данных' : status.webapp_bot.source === 'environment' ? '🌐 Переменные окружения' : '❌ Не найден'}
   Статус: ${status.webapp_bot.valid ? '✅ Действителен' : '❌ Недействителен'}
   ${status.webapp_bot.botInfo?.username ? `Бот: @${status.webapp_bot.botInfo.username}` : ''}`;
                
                alert(statusText);
              }
            }}
            disabled={saving}
            className="bg-indigo-600 dark:bg-indigo-500 text-white px-6 py-2 rounded-lg hover:scale-105 hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            🔍 Диагностика токенов
          </button>

          <button
            type="button"
            onClick={async () => {
              try {
                console.log('🧪 Running test notification: quick_test');
                const response = await fetch('/api/webapp/notifications/test', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ type: 'quick_test', test_data: {} })
                });

                const result = await response.json();
                console.log('📄 Response:', result);

                if (response.ok) {
                  alert(`✅ ${result.message}\n${result.details || ''}`);
                } else {
                  const errorDetails = result.details ? `\nДетали: ${result.details}` : '';
                  alert(`❌ Ошибка отправки тестового уведомления${errorDetails}`);
                  console.error('❌ Test notification failed:', result);
                }
              } catch (error) {
                console.error('❌ Ошибка тестового уведомления:', error);
                alert(`❌ Ошибка отправки тестового уведомления\nПроверьте консоль для деталей`);
              }
            }}
            disabled={saving}
            className="bg-green-600 dark:bg-green-500 text-white px-6 py-2 rounded-lg hover:scale-105 hover:bg-green-700 dark:hover:bg-green-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            🧪 Тестовые уведомления
          </button>

          <button
            type="button"
            onClick={async () => {
              try {
                const response = await fetch('/api/cron/init', { method: 'POST' });
                const result = await response.json();
                
                if (response.ok) {
                  alert(`✅ ${result.message}`);
                } else {
                  alert(`❌ Ошибка: ${result.error}`);
                }
              } catch (error) {
                alert('❌ Ошибка инициализации CRON задач');
                console.error('Error:', error);
              }
            }}
            disabled={saving}
            className="bg-purple-600 dark:bg-purple-500 text-white px-6 py-2 rounded-lg hover:scale-105 hover:bg-purple-700 dark:hover:bg-purple-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ⚙️ Запустить CRON задачи
          </button>
        </div>
      </form>

      {/* Техническая информация */}
      <div className="mt-8 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <h4 className="font-medium text-[#1E293B] dark:text-white mb-3">🔧 Техническая информация</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h5 className="font-medium text-[#374151] dark:text-gray-300 mb-2">Webhook URL&apos;ы:</h5>
            <ul className="space-y-1 text-[#64748B] dark:text-gray-400">
              <li>• Основной бот: <code>/api/telegram/webhook</code></li>
              <li>• WebApp бот: <code>/api/telegram/webapp-webhook</code></li>
            </ul>
          </div>
          <div>
            <h5 className="font-medium text-[#374151] dark:text-gray-300 mb-2">API эндпоинты:</h5>
            <ul className="space-y-1 text-[#64748B] dark:text-gray-400">
              <li>• Статус токенов: <code>/api/telegram/tokens/status</code></li>
              <li>• Заказы WebApp: <code>/api/webapp/orders</code></li>
              <li>• Уведомления: <code>/api/webapp/notifications</code></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function NotificationSettings({ data, onSave, saving }: SettingsComponentProps) {
  const [formData, setFormData] = useState({
    payment_reminder_first_hours: data.notificationSettings?.payment_reminder_first_hours || 48,
    payment_reminder_final_hours: data.notificationSettings?.payment_reminder_final_hours || 51,
    payment_auto_cancel_hours: data.notificationSettings?.payment_auto_cancel_hours || 72,
    review_request_days: data.notificationSettings?.review_request_days || 10,
    // Настройки включения/выключения типов уведомлений
    enable_payment_reminders: data.settings.enable_payment_reminders !== 'false',
    enable_bonus_notifications: data.settings.enable_bonus_notifications !== 'false',
    enable_restock_notifications: data.settings.enable_restock_notifications !== 'false',
    enable_tier_notifications: data.settings.enable_tier_notifications !== 'false',
    enable_review_requests: data.settings.enable_review_requests !== 'false'
  });

  const [stats, setStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  useEffect(() => {
    fetchNotificationStats();
  }, []);

  const fetchNotificationStats = async () => {
    setLoadingStats(true);
    try {
      const response = await fetch('/api/webapp/notifications?action=stats');
      if (response.ok) {
        const result = await response.json();
        setStats(result.data);
      }
    } catch (error) {
      console.error('Ошибка загрузки статистики уведомлений:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const settings = {
      // Таймеры уведомлений
      notification_payment_reminder_first_hours: formData.payment_reminder_first_hours.toString(),
      notification_payment_reminder_final_hours: formData.payment_reminder_final_hours.toString(), 
      notification_payment_auto_cancel_hours: formData.payment_auto_cancel_hours.toString(),
      notification_review_request_days: formData.review_request_days.toString(),
      // Включение/выключение типов
      enable_payment_reminders: formData.enable_payment_reminders.toString(),
      enable_bonus_notifications: formData.enable_bonus_notifications.toString(),
      enable_restock_notifications: formData.enable_restock_notifications.toString(),
      enable_tier_notifications: formData.enable_tier_notifications.toString(),
      enable_review_requests: formData.enable_review_requests.toString()
    };

    const notificationSettings = {
      payment_reminder_first_hours: formData.payment_reminder_first_hours,
      payment_reminder_final_hours: formData.payment_reminder_final_hours,
      payment_auto_cancel_hours: formData.payment_auto_cancel_hours,
      review_request_days: formData.review_request_days
    };

    await onSave({ settings, notificationSettings });
  };





  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-xl font-semibold text-[#1E293B] dark:text-white mb-6">Настройки уведомлений</h2>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Управление таймингом */}
        <div>
          <h3 className="text-lg font-medium text-[#1E293B] dark:text-white mb-4">
            ⏰ Тайминг уведомлений
          </h3>
          
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-[#374151] dark:text-gray-300 mb-2">
                Первое напоминание об оплате (часов)
              </label>
              <input
                type="number"
                min="1"
                max="168"
                value={formData.payment_reminder_first_hours}
                onChange={(e) => setFormData(prev => ({ ...prev, payment_reminder_first_hours: parseInt(e.target.value) || 48 }))}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-[#1E293B] dark:text-white focus:border-[#1A6DFF] focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20 transition-all"
              />
              <p className="text-xs text-[#64748B] dark:text-gray-400 mt-1">
                Через сколько часов после создания заказа отправить первое напоминание
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#374151] dark:text-gray-300 mb-2">
                Финальное напоминание об оплате (часов)
              </label>
              <input
                type="number"
                min="1"
                max="168"
                value={formData.payment_reminder_final_hours}
                onChange={(e) => setFormData(prev => ({ ...prev, payment_reminder_final_hours: parseInt(e.target.value) || 51 }))}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-[#1E293B] dark:text-white focus:border-[#1A6DFF] focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20 transition-all"
              />
              <p className="text-xs text-[#64748B] dark:text-gray-400 mt-1">
                Через сколько часов отправить последнее предупреждение перед отменой
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#374151] dark:text-gray-300 mb-2">
                Автоотмена заказа (часов)
              </label>
              <input
                type="number"
                min="1"
                max="168"
                value={formData.payment_auto_cancel_hours}
                onChange={(e) => setFormData(prev => ({ ...prev, payment_auto_cancel_hours: parseInt(e.target.value) || 72 }))}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-[#1E293B] dark:text-white focus:border-[#1A6DFF] focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20 transition-all"
              />
              <p className="text-xs text-[#64748B] dark:text-gray-400 mt-1">
                Через сколько часов автоматически отменять неоплаченный заказ
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#374151] dark:text-gray-300 mb-2">
                Запрос отзыва (дней после доставки)
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={formData.review_request_days}
                onChange={(e) => setFormData(prev => ({ ...prev, review_request_days: parseInt(e.target.value) || 10 }))}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-[#1E293B] dark:text-white focus:border-[#1A6DFF] focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20 transition-all"
              />
              <p className="text-xs text-[#64748B] dark:text-gray-400 mt-1">
                Через сколько дней после доставки просить оставить отзыв
              </p>
            </div>
          </div>

          {/* Предупреждения о настройках */}
          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <h4 className="font-medium text-yellow-800 dark:text-yellow-200">Важно</h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  Изменения таймингов повлияют только на новые заказы. Уже запланированные уведомления останутся без изменений.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Включение/выключение типов уведомлений */}
        <div>
          <h3 className="text-lg font-medium text-[#1E293B] dark:text-white mb-4">
            🔔 Типы уведомлений
          </h3>
          
          <div className="space-y-4">
            {[
              {
                key: 'enable_payment_reminders',
                title: 'Напоминания об оплате',
                description: 'Отправлять напоминания о неоплаченных заказах',
                icon: '💳'
              },
              {
                key: 'enable_bonus_notifications',
                title: 'Уведомления о бонусах',
                description: 'Сообщать о начислении бонусов и кэшбека',
                icon: '🎁'
              },
              {
                key: 'enable_restock_notifications',
                title: 'Уведомления о поступлении товаров',
                description: 'Уведомлять подписчиков о поступлении товара',
                icon: '📦'
              },
              {
                key: 'enable_tier_notifications',
                title: 'Уведомления о повышении уровня',
                description: 'Поздравлять с достижением нового уровня лояльности',
                icon: '🎖️'
              },
              {
                key: 'enable_review_requests',
                title: 'Запросы отзывов',
                description: 'Просить оставить отзыв после доставки',
                icon: '⭐'
              }
            ].map((notification) => (
              <div key={notification.key} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{notification.icon}</span>
                  <div>
                    <h4 className="font-medium text-[#1E293B] dark:text-white">
                      {notification.title}
                    </h4>
                    <p className="text-sm text-[#64748B] dark:text-gray-400">
                      {notification.description}
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={formData[notification.key as keyof typeof formData] as boolean}
                  onChange={(e) => setFormData(prev => ({ ...prev, [notification.key]: e.target.checked }))}
                  className="w-4 h-4 text-[#1A6DFF] border-gray-300 dark:border-gray-600 rounded focus:ring-[#1A6DFF] dark:bg-gray-700"
                />
              </div>
            ))}
          </div>
        </div>



        {/* Статистика */}
        {stats && (
          <div>
            <h3 className="text-lg font-medium text-[#1E293B] dark:text-white mb-4">
              📊 Статистика уведомлений
            </h3>
            
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                  {stats.totalJobs || 0}
                </div>
                <div className="text-sm text-blue-600 dark:text-blue-400">
                  Всего задач
                </div>
              </div>
              
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                  {stats.stats?.find((s: any) => s.status === 'executed')?._count || 0}
                </div>
                <div className="text-sm text-green-600 dark:text-green-400">
                  Выполнено
                </div>
              </div>
              
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                  {stats.stats?.find((s: any) => s.status === 'pending')?._count || 0}
                </div>
                <div className="text-sm text-yellow-600 dark:text-yellow-400">
                  В очереди
                </div>
              </div>
              
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="text-2xl font-bold text-red-700 dark:text-red-300">
                  {stats.stats?.find((s: any) => s.status === 'failed')?._count || 0}
                </div>
                <div className="text-sm text-red-600 dark:text-red-400">
                  Ошибок
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Кнопки управления */}
        <div className="flex flex-wrap gap-3 pt-4">
          <button 
            type="submit"
            disabled={saving}
            className="bg-gradient-to-r from-[#1A6DFF] to-[#00C5FF] text-white px-6 py-2 rounded-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Сохранение...' : 'Сохранить настройки'}
          </button>
        </div>
      </form>

      {/* Информационный блок */}
      <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div>
            <h4 className="font-medium text-blue-900 dark:text-blue-100">О системе уведомлений</h4>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
              Все уведомления отправляются автоматически через CRON задачи. Система использует два Telegram бота: основной для админских уведомлений и WebApp бот для клиентов. Поддерживаются повторные попытки при ошибках и ведется детальная статистика.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

 