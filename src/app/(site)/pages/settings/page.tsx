"use client";

import { useState, useEffect } from "react";
import { Settings, Mail, Bell, Globe, Star, FileText, Package, User, Check, Info, AlertTriangle } from "lucide-react";
import BonusLogsTable from '@/components/BonusLogs/BonusLogsTable';
import StockLogsTable from '@/components/StockLogs/StockLogsTable';
import ManageFAQModal from '@/components/Modals/ManageFAQModal';
import PageSkeleton from '@/components/common/PageSkeleton';
import { useToast, ToastContainer } from '@/components/ui/toastNotification';

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
  const { toasts, success, error: showError, removeToast } = useToast();

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
        success(
          'Настройки сохранены!',
          'Все изменения успешно применены и вступили в силу'
        );
      } else {
        showError(
          'Ошибка сохранения',
          'Не удалось сохранить настройки. Попробуйте еще раз'
        );
      }
    } catch (err) {
      console.error('Ошибка сохранения настроек:', err);
      showError(
        'Ошибка соединения',
        'Проверьте подключение к интернету и попробуйте снова'
      );
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: "system", label: "Системные настройки", icon: Settings },
    { id: "user", label: "Пользователь", icon: User },
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
      case "user":
        return <UserSettings data={settingsData} onSave={saveSettings} saving={saving} />;
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

  // Показываем полноценный скелетон страницы во время загрузки
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <PageSkeleton 
            title={true}
            breadcrumbs={false}
            tabs={8}
            cards={0}
            table={false}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Улучшенный Header */}
        <div className="mb-8 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 backdrop-blur-xl bg-opacity-80">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-[#1A6DFF] to-[#00C5FF] text-transparent bg-clip-text mb-2">
                Настройки
              </h1>
              <p className="text-[#64748B] dark:text-gray-400 max-w-2xl">
                Управление настройками системы и конфигурацией. Здесь вы можете настроить все аспекты работы платформы.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-[#1A6DFF]/10 to-[#00C5FF]/10 flex items-center justify-center">
                <Settings className="h-6 w-6 text-[#1A6DFF] dark:text-[#00C5FF]" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Улучшенный Sidebar */}
          <div className="lg:w-72 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 h-fit backdrop-blur-xl bg-opacity-80">
            <nav className="space-y-1.5">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-300 group relative ${
                      isActive
                        ? "bg-gradient-to-r from-[#1A6DFF] to-[#00C5FF] text-white shadow-lg shadow-blue-500/20"
                        : "text-[#374151] dark:text-gray-300 hover:bg-gradient-to-r hover:from-[#1A6DFF]/5 hover:to-[#00C5FF]/5"
                    }`}
                  >
                    <Icon size={20} className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                    <span className="font-medium">{tab.label}</span>
                    {isActive && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Улучшенный Content */}
          <div className="flex-1 min-w-0">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 backdrop-blur-xl bg-opacity-80 transition-all duration-300">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>
      
      {/* Toast Container */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}

// Улучшенный компонент системных настроек
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <label className="block">
            <span className="text-[#1E293B] dark:text-white font-medium">Название магазина</span>
            <input
              type="text"
              value={formData.shop_name}
              onChange={(e) => setFormData(prev => ({ ...prev, shop_name: e.target.value }))}
              className="mt-1 block w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-[#1E293B] dark:text-white focus:border-[#1A6DFF] focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20 transition-all duration-300"
              placeholder="Введите название магазина"
            />
          </label>

          <label className="block">
            <span className="text-[#1E293B] dark:text-white font-medium">Минимальная сумма заказа</span>
            <div className="mt-1 relative">
              <input
                type="number"
                value={formData.min_order_amount}
                onChange={(e) => setFormData(prev => ({ ...prev, min_order_amount: e.target.value }))}
                className="block w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 pl-4 pr-12 py-3 text-[#1E293B] dark:text-white focus:border-[#1A6DFF] focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20 transition-all duration-300"
                placeholder="1000"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#64748B] dark:text-gray-400">₽</span>
            </div>
          </label>
        </div>

        <div className="space-y-4">
          <label className="block">
            <span className="text-[#1E293B] dark:text-white font-medium">Стоимость доставки</span>
            <div className="mt-1 relative">
              <input
                type="number"
                value={formData.delivery_price}
                onChange={(e) => setFormData(prev => ({ ...prev, delivery_price: e.target.value }))}
                className="block w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 pl-4 pr-12 py-3 text-[#1E293B] dark:text-white focus:border-[#1A6DFF] focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20 transition-all duration-300"
                placeholder="500"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#64748B] dark:text-gray-400">₽</span>
            </div>
          </label>

          <div className="space-y-3">
            <label className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-[#1A6DFF]/30 transition-all duration-300 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.maintenance_mode}
                onChange={(e) => setFormData(prev => ({ ...prev, maintenance_mode: e.target.checked }))}
                className="rounded-lg border-gray-300 text-[#1A6DFF] focus:ring-[#1A6DFF]/20 transition-all duration-300"
              />
              <div>
                <span className="block text-[#1E293B] dark:text-white font-medium">Режим обслуживания</span>
                <span className="text-sm text-[#64748B] dark:text-gray-400">Сайт будет недоступен для пользователей</span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-[#1A6DFF]/30 transition-all duration-300 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.auto_update_stock}
                onChange={(e) => setFormData(prev => ({ ...prev, auto_update_stock: e.target.checked }))}
                className="rounded-lg border-gray-300 text-[#1A6DFF] focus:ring-[#1A6DFF]/20 transition-all duration-300"
              />
              <div>
                <span className="block text-[#1E293B] dark:text-white font-medium">Автообновление остатков</span>
                <span className="text-sm text-[#64748B] dark:text-gray-400">Автоматическая синхронизация с поставщиками</span>
              </div>
            </label>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#1A6DFF] to-[#00C5FF] text-white font-medium hover:shadow-lg hover:shadow-blue-500/20 focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Сохранение...' : 'Сохранить изменения'}
        </button>
      </div>
    </form>
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
  const { success, error: showError } = useToast();

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
        success('Пересчет завершен!', result.message);
      } else {
        showError('Ошибка пересчета', 'Не удалось пересчитать уровни лояльности');
      }
    } catch (error) {
      console.error('Ошибка пересчета уровней:', error);
      showError('Ошибка соединения', 'Проверьте подключение к интернету');
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
  const { success, error: showError } = useToast();

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
        success('Тестовые данные созданы!', result.message);
        fetchFAQStats();
      } else {
        const error = await response.json();
        showError('Ошибка создания', error.message || "Не удалось создать тестовые данные");
      }
    } catch (error) {
      console.error("Ошибка создания тестовых данных:", error);
      showError('Ошибка соединения', 'Проверьте подключение к интернету');
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
                  <Check className="h-4 w-4" />
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
  const [activeTab, setActiveTab] = useState<'tokens' | 'chats' | 'templates' | 'buttons' | 'webhook'>('tokens');
  const [templates, setTemplates] = useState<Array<{ key: string; template: string; description?: string }>>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [botStatus, setBotStatus] = useState<any>(null);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [botSettings, setBotSettings] = useState<any>(null);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const { success, error: showError } = useToast();

  // Состояния для разных разделов
  const [tokenSettings, setTokenSettings] = useState({
    client_bot_token: '',
    admin_bot_token: ''
  });
  
  const [chatSettings, setChatSettings] = useState({
    admin_chat_id: '',
    courier_tg_id: ''
  });
  
  const [buttonSettings, setButtonSettings] = useState({
    bot_btn_title: '',
    group_btn_title: '',
    support_btn_title: '',
    tg_group: '',
    tg_support: ''
  });
  
  const [webhookSettings, setWebhookSettings] = useState({
    webhook_url: '',
    webhook_secret: '',
    webhook_max_connections: 40,
    grammy_enabled: true
  });
  
  const [mediaSettings, setMediaSettings] = useState({
    first_video_id: ''
  });

  useEffect(() => {
    loadBotSettings();
    loadTemplates();
  }, []);

  const loadBotSettings = async () => {
    try {
      const response = await fetch('/api/telegram/bot-settings');
      if (response.ok) {
        const result = await response.json();
        const settings = result.settings;
        setBotSettings(settings);
        
        // Устанавливаем значения для всех разделов
        setTokenSettings({
          client_bot_token: settings.client_bot_token || '',
          admin_bot_token: settings.admin_bot_token || ''
        });
        
        setChatSettings({
          admin_chat_id: settings.admin_chat_id || '125861752',
          courier_tg_id: settings.courier_tg_id || '7690550402'
        });
        
        setButtonSettings({
          bot_btn_title: settings.bot_btn_title || 'Каталог',
          group_btn_title: settings.group_btn_title || 'Перейти в СДВГ-чат',
          support_btn_title: settings.support_btn_title || 'Задать вопрос',
          tg_group: settings.tg_group || '',
          tg_support: settings.tg_support || ''
        });
        
        setWebhookSettings({
          webhook_url: settings.webhook_url || '',
          webhook_secret: settings.webhook_secret || '',
          webhook_max_connections: settings.webhook_max_connections || 40,
          grammy_enabled: settings.grammy_enabled !== false
        });
        
        setMediaSettings({
          first_video_id: settings.first_video_id || ''
        });
      }
    } catch (error) {
      console.error('Ошибка загрузки настроек бота:', error);
    } finally {
      setLoadingSettings(false);
    }
  };

  const loadTemplates = async () => {
    try {
      const response = await fetch('/api/telegram/templates');
      if (response.ok) {
        const data = await response.json();
        setTemplates(data.templates || []);
      }
    } catch (error) {
      console.error('Ошибка загрузки шаблонов:', error);
    } finally {
      setLoadingTemplates(false);
    }
  };

  const loadBotStatus = async () => {
    setLoadingStatus(true);
    try {
      const response = await fetch('/api/telegram/bot-status');
      if (response.ok) {
        const result = await response.json();
        setBotStatus(result.bots);
      }
    } catch (error) {
      console.error('Ошибка загрузки статуса ботов:', error);
    } finally {
      setLoadingStatus(false);
    }
  };

  const handleTemplateChange = (key: string, value: string) => {
    setTemplates(prev => prev.map(t => 
      t.key === key ? { ...t, template: value } : t
    ));
  };

  const saveSection = async (section: string, sectionData: any) => {
    try {
      const response = await fetch('/api/telegram/bot-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section, data: sectionData })
      });
      
      if (response.ok) {
        success('Настройки сохранены!', `Настройки ${section} успешно обновлены`);
        // Перезагружаем настройки
        await loadBotSettings();
      } else {
        const error = await response.json();
        showError('Ошибка сохранения', error.error || 'Не удалось сохранить настройки');
      }
    } catch (error) {
      showError('Ошибка соединения', 'Проверьте подключение к интернету');
    }
  };

  const saveTemplates = async () => {
    try {
      const response = await fetch('/api/telegram/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templates })
      });
      
      if (response.ok) {
        success('Шаблоны сохранены!', 'Все шаблоны сообщений успешно обновлены');
      } else {
        showError('Ошибка сохранения', 'Не удалось сохранить шаблоны сообщений');
      }
    } catch (error) {
      showError('Ошибка соединения', 'Проверьте подключение к интернету');
    }
  };

  if (loadingSettings) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="grid grid-cols-5 gap-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-10 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-[#1E293B] dark:text-white">🤖 Настройки Telegram Ботов</h2>
        <div className="flex gap-2">
          <button
            onClick={loadBotStatus}
            disabled={loadingStatus}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-all disabled:opacity-50 text-sm"
          >
            {loadingStatus ? 'Проверка...' : '🔄 Проверить статус'}
          </button>
        </div>
      </div>
      
      {/* Переключатель вкладок */}
      <div className="flex flex-wrap border-b border-gray-200 dark:border-gray-600 mb-6 gap-1">
        {[
          { id: 'tokens', label: '🔑 Токены ботов', icon: '🔑' },
          { id: 'chats', label: '👥 ID чатов', icon: '👥' },
          { id: 'buttons', label: '🔘 Кнопки и ссылки', icon: '🔘' },
          { id: 'templates', label: '📝 Шаблоны сообщений', icon: '📝' },
          { id: 'webhook', label: '🌐 Webhook', icon: '🌐' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors rounded-t-lg ${
              activeTab === tab.id
                ? 'border-[#1A6DFF] text-[#1A6DFF] dark:text-[#00C5FF] bg-blue-50 dark:bg-blue-900/20'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Статус ботов */}
      {botStatus && (
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Клиентский бот */}
          <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-[#1E293B] dark:text-white">📱 Клиентский бот</h3>
              <span className={`px-2 py-1 rounded-full text-xs ${
                botStatus.client?.status === 'active' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                  : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
              }`}>
                {botStatus.client?.status === 'active' ? '🟢 Активен' : '🔴 Ошибка'}
              </span>
            </div>
            {botStatus.client?.bot ? (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p>@{botStatus.client.bot.username}</p>
                <p>{botStatus.client.bot.first_name}</p>
              </div>
            ) : (
              <p className="text-sm text-red-600 dark:text-red-400">{botStatus.client?.error}</p>
            )}
          </div>
          
          {/* Админский бот */}
          <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-[#1E293B] dark:text-white">👑 Админский бот</h3>
              <span className={`px-2 py-1 rounded-full text-xs ${
                botStatus.admin?.status === 'active' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                  : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
              }`}>
                {botStatus.admin?.status === 'active' ? '🟢 Активен' : '🔴 Ошибка'}
              </span>
            </div>
            {botStatus.admin?.bot ? (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p>@{botStatus.admin.bot.username}</p>
                <p>{botStatus.admin.bot.first_name}</p>
              </div>
            ) : (
              <p className="text-sm text-red-600 dark:text-red-400">{botStatus.admin?.error}</p>
            )}
          </div>
        </div>
      )}

      {/* Контент вкладок */}
      {activeTab === 'tokens' && (
        <div className="space-y-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">🔑 Токены Telegram ботов</h3>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Настройте токены для клиентского и админского ботов. Получите токены у @BotFather в Telegram.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#374151] dark:text-gray-300 mb-2">
                📱 Токен клиентского бота (@strattera_test_bot)
              </label>
              <input
                type="password"
                value={tokenSettings.client_bot_token}
                onChange={(e) => setTokenSettings(prev => ({ ...prev, client_bot_token: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-[#1E293B] dark:text-white focus:border-[#1A6DFF] focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20 transition-all"
                placeholder="7754514670:AAF..."
              />
              <p className="text-xs text-gray-500 mt-1">Используется для уведомлений клиентов</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#374151] dark:text-gray-300 mb-2">
                👑 Токен админского бота (@telesklad_bot)
              </label>
              <input
                type="password"
                value={tokenSettings.admin_bot_token}
                onChange={(e) => setTokenSettings(prev => ({ ...prev, admin_bot_token: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-[#1E293B] dark:text-white focus:border-[#1A6DFF] focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20 transition-all"
                placeholder="7612206140:AAH..."
              />
              <p className="text-xs text-gray-500 mt-1">Используется для админских и курьерских уведомлений</p>
            </div>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <span className="text-yellow-600 dark:text-yellow-400">⚠️</span>
              <div>
                <h4 className="font-medium text-yellow-800 dark:text-yellow-200">Безопасность</h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  Токены хранятся в зашифрованном виде. Никогда не передавайте их третьим лицам.
                  При изменении токенов потребуется перенастройка webhook'ов.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => saveSection('tokens', tokenSettings)}
            disabled={saving}
            className="bg-gradient-to-r from-[#1A6DFF] to-[#00C5FF] text-white px-6 py-2 rounded-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Сохранение...' : 'Сохранить токены'}
          </button>
        </div>
      )}

      {activeTab === 'chats' && (
        <div className="space-y-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">👥 ID чатов для уведомлений</h3>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Укажите ID чатов для отправки уведомлений. Для получения ID чата отправьте сообщение @userinfobot
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-[#374151] dark:text-gray-300 mb-2">
                👑 ID админа (Эльдар)
              </label>
              <input
                type="text"
                value={chatSettings.admin_chat_id}
                onChange={(e) => setChatSettings(prev => ({ ...prev, admin_chat_id: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-[#1E293B] dark:text-white focus:border-[#1A6DFF] focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20 transition-all"
                placeholder="125861752"
              />
              <p className="text-xs text-gray-500 mt-1">Получает уведомления о проверке оплат</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#374151] dark:text-gray-300 mb-2">
                🚚 ID курьера
              </label>
              <input
                type="text"
                value={chatSettings.courier_tg_id}
                onChange={(e) => setChatSettings(prev => ({ ...prev, courier_tg_id: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-[#1E293B] dark:text-white focus:border-[#1A6DFF] focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20 transition-all"
                placeholder="7690550402"
              />
              <p className="text-xs text-gray-500 mt-1">Получает уведомления о заказах для отправки</p>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h4 className="font-medium text-[#1E293B] dark:text-white mb-2">💡 Как получить ID чата:</h4>
            <ul className="text-sm text-[#64748B] dark:text-gray-400 space-y-1">
              <li>• Для личного чата: отправьте любое сообщение @userinfobot</li>
              <li>• ID пользователя всегда положительное число (например: 125861752)</li>
              <li>• Проверьте правильность ID перед сохранением</li>
            </ul>
          </div>

          <button
            onClick={() => saveSection('chats', chatSettings)}
            disabled={saving}
            className="bg-gradient-to-r from-[#1A6DFF] to-[#00C5FF] text-white px-6 py-2 rounded-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Сохранение...' : 'Сохранить ID чатов'}
          </button>
        </div>
      )}

      {activeTab === 'buttons' && (
        <div className="space-y-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">🔘 Кнопки и ссылки</h3>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Настройте тексты кнопок и ссылки для приветственного сообщения и уведомлений.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium text-[#1E293B] dark:text-white">📝 Тексты кнопок</h4>
              
              <div>
                <label className="block text-sm font-medium text-[#374151] dark:text-gray-300 mb-2">
                  🛒 Кнопка каталога
                </label>
                <input
                  type="text"
                  value={buttonSettings.bot_btn_title}
                  onChange={(e) => setButtonSettings(prev => ({ ...prev, bot_btn_title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-[#1E293B] dark:text-white focus:border-[#1A6DFF] focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20 transition-all"
                  placeholder="Каталог"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#374151] dark:text-gray-300 mb-2">
                  💬 Кнопка группы
                </label>
                <input
                  type="text"
                  value={buttonSettings.group_btn_title}
                  onChange={(e) => setButtonSettings(prev => ({ ...prev, group_btn_title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-[#1E293B] dark:text-white focus:border-[#1A6DFF] focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20 transition-all"
                  placeholder="Перейти в СДВГ-чат"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#374151] dark:text-gray-300 mb-2">
                  ❓ Кнопка поддержки
                </label>
                <input
                  type="text"
                  value={buttonSettings.support_btn_title}
                  onChange={(e) => setButtonSettings(prev => ({ ...prev, support_btn_title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-[#1E293B] dark:text-white focus:border-[#1A6DFF] focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20 transition-all"
                  placeholder="Задать вопрос"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-[#1E293B] dark:text-white">🔗 Ссылки</h4>
              
              <div>
                <label className="block text-sm font-medium text-[#374151] dark:text-gray-300 mb-2">
                  💬 Ссылка на группу
                </label>
                <input
                  type="url"
                  value={buttonSettings.tg_group}
                  onChange={(e) => setButtonSettings(prev => ({ ...prev, tg_group: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-[#1E293B] dark:text-white focus:border-[#1A6DFF] focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20 transition-all"
                  placeholder="https://t.me/+2rTVT8IxtFozNDY0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#374151] dark:text-gray-300 mb-2">
                  ❓ Ссылка на поддержку
                </label>
                <input
                  type="url"
                  value={buttonSettings.tg_support}
                  onChange={(e) => setButtonSettings(prev => ({ ...prev, tg_support: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-[#1E293B] dark:text-white focus:border-[#1A6DFF] focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20 transition-all"
                  placeholder="https://t.me/strattera_help"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#374151] dark:text-gray-300 mb-2">
                  📹 ID приветственного видео
                </label>
                <input
                  type="text"
                  value={mediaSettings.first_video_id}
                  onChange={(e) => setMediaSettings(prev => ({ ...prev, first_video_id: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-[#1E293B] dark:text-white focus:border-[#1A6DFF] focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20 transition-all"
                  placeholder="BAACAgIAAxkBAAIBhGhcEQABGPrLRuy1bX2kSTyY1JDtzgAC..."
                />
                <p className="text-xs text-gray-500 mt-1">Отправьте видео боту, скопируйте file_id</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => saveSection('buttons', buttonSettings)}
              disabled={saving}
              className="bg-gradient-to-r from-[#1A6DFF] to-[#00C5FF] text-white px-6 py-2 rounded-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Сохранение...' : 'Сохранить кнопки'}
            </button>
            
            <button
              onClick={() => saveSection('media', mediaSettings)}
              disabled={saving}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Сохранение...' : 'Сохранить видео'}
            </button>
          </div>
        </div>
      )}

      {activeTab === 'templates' && (
        <div className="space-y-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">📝 Шаблоны сообщений</h3>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Настройте тексты уведомлений для клиентов, админа и курьера. Используйте переменные: %{'{order}'}, %{'{price}'}, %{'{items}'}, %{'{fio}'}, %{'{address}'}, %{'{phone}'}, %{'{card}'}, %{'{track}'}
            </p>
          </div>

          {loadingTemplates ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-2 border-[#1A6DFF] border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-2 text-gray-500">Загрузка шаблонов...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {templates.map((template) => (
                <div key={template.key} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-[#1E293B] dark:text-white">{template.key}</h4>
                    {template.description && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">{template.description}</span>
                    )}
                  </div>
                  <textarea
                    value={template.template}
                    onChange={(e) => handleTemplateChange(template.key, e.target.value)}
                    className="w-full h-24 px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-[#1E293B] dark:text-white focus:border-[#1A6DFF] focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20 transition-all resize-none"
                    placeholder="Введите текст шаблона..."
                  />
                </div>
              ))}
              
              <button
                onClick={saveTemplates}
                disabled={saving}
                className="bg-gradient-to-r from-[#1A6DFF] to-[#00C5FF] text-white px-6 py-2 rounded-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Сохранение...' : 'Сохранить шаблоны'}
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'webhook' && (
        <div className="space-y-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">🌐 Настройки Webhook</h3>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Настройте webhook'и для получения обновлений от Telegram. Grammy система управляет webhook'ами автоматически.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#374151] dark:text-gray-300 mb-2">
                🌐 URL для webhook'ов
              </label>
              <input
                type="url"
                value={webhookSettings.webhook_url}
                onChange={(e) => setWebhookSettings(prev => ({ ...prev, webhook_url: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-[#1E293B] dark:text-white focus:border-[#1A6DFF] focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20 transition-all"
                placeholder="https://strattera.ngrok.app/api/telegram/grammy/webhook"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#374151] dark:text-gray-300 mb-2">
                🔐 Секретный токен webhook'а
              </label>
              <input
                type="password"
                value={webhookSettings.webhook_secret}
                onChange={(e) => setWebhookSettings(prev => ({ ...prev, webhook_secret: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-[#1E293B] dark:text-white focus:border-[#1A6DFF] focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20 transition-all"
                placeholder="Введите секретный токен..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#374151] dark:text-gray-300 mb-2">
                🔗 Максимальное количество соединений
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={webhookSettings.webhook_max_connections}
                onChange={(e) => setWebhookSettings(prev => ({ ...prev, webhook_max_connections: parseInt(e.target.value) || 40 }))}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-[#1E293B] dark:text-white focus:border-[#1A6DFF] focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20 transition-all"
              />
            </div>

            <div className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
              <input
                type="checkbox"
                checked={webhookSettings.grammy_enabled}
                onChange={(e) => setWebhookSettings(prev => ({ ...prev, grammy_enabled: e.target.checked }))}
                className="w-4 h-4 text-[#1A6DFF] border-gray-300 dark:border-gray-600 rounded focus:ring-[#1A6DFF] dark:bg-gray-700"
              />
              <div>
                <span className="block font-medium text-[#1E293B] dark:text-white">🚀 Включить Grammy систему</span>
                <span className="text-sm text-[#64748B] dark:text-gray-400">Использовать современную Grammy библиотеку вместо старого подхода</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => saveSection('webhook', webhookSettings)}
            disabled={saving}
            className="bg-gradient-to-r from-[#1A6DFF] to-[#00C5FF] text-white px-6 py-2 rounded-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Сохранение...' : 'Сохранить настройки webhook'}
          </button>
        </div>
      )}
      
      {/* Информация об архитектуре */}
      <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="bg-blue-100 dark:bg-blue-900/50 rounded-lg p-3">
            <span className="text-3xl">🤖</span>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">Архитектура Telegram ботов</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                <h4 className="font-medium text-[#1E293B] dark:text-white mb-2">📱 Клиенты</h4>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>Development:</span>
                    <span className="font-mono text-blue-600">@strattera_test_bot</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Production:</span>
                    <span className="font-mono text-blue-600">@strattera_test_bot</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Всегда одинаковый</p>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                <h4 className="font-medium text-[#1E293B] dark:text-white mb-2">👑 Админ</h4>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>Development:</span>
                    <span className="font-mono text-blue-600">@telesklad_bot</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Production:</span>
                    <span className="font-mono text-blue-600">@telesklad_bot</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Всегда одинаковый</p>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                <h4 className="font-medium text-[#1E293B] dark:text-white mb-2">🚚 Курьер</h4>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>Development:</span>
                    <span className="font-mono text-blue-600">@telesklad_bot</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Production:</span>
                    <span className="font-mono text-blue-600">@telesklad_bot</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Всегда одинаковый</p>
                </div>
              </div>
            </div>
            
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <span className="text-yellow-600 dark:text-yellow-400">💡</span>
                <div>
                  <h5 className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">Ключевая особенность архитектуры</h5>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    Клиенты <strong>ВСЕГДА</strong> получают уведомления в @strattera_test_bot независимо от режима (dev/prod).
                    @telesklad_bot используется только для админа и курьера. Это обеспечивает четкое разделение ролей.
                  </p>
                </div>
              </div>
            </div>
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

// Компонент настроек пользователя
function UserSettings({ data, onSave, saving }: SettingsComponentProps) {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [passwordChanging, setPasswordChanging] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const { success, error: showError } = useToast();
  const [avatarLoading, setAvatarLoading] = useState(false);

  // Проверяем, что пользователь - администратор go@osama.agency
  useEffect(() => {
    checkAdminAccess();
    loadCurrentAvatar();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const response = await fetch('/api/user/check-admin');
      if (!response.ok) {
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Ошибка проверки доступа:', error);
      window.location.href = '/';
    }
  };

  const loadCurrentAvatar = async () => {
    try {
      const response = await fetch('/api/user/get-user');
      if (response.ok) {
        const userData = await response.json();
        if (userData.image) {
          setAvatarPreview(userData.image.startsWith('http') ? userData.image : `${process.env.NEXT_PUBLIC_IMAGE_URL || ''}${userData.image}`);
        }
      }
    } catch (error) {
      console.error('Ошибка загрузки аватара:', error);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      showError('Ошибка валидации', 'Пароли не совпадают');
      return;
    }

    if (formData.newPassword.length < 8) {
      showError('Ошибка валидации', 'Пароль должен содержать минимум 8 символов');
      return;
    }

    setPasswordChanging(true);
    
    try {
      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          password: formData.newPassword
        })
      });

      if (response.ok) {
        success('Пароль изменен!', 'Новый пароль успешно установлен');
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        const errorText = await response.text();
        showError('Ошибка изменения пароля', errorText);
      }
    } catch (error) {
      console.error('Ошибка смены пароля:', error);
      showError('Ошибка соединения', 'Не удалось изменить пароль');
    } finally {
      setPasswordChanging(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB
        showError('Файл слишком большой', 'Размер файла не должен превышать 5MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        showError('Неверный тип файла', 'Можно загружать только изображения');
        return;
      }

      setAvatarFile(file);
      setAvatarLoading(true);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) return;

    setAvatarUploading(true);
    
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('avatar', avatarFile);

      const response = await fetch('/api/user/upload-avatar', {
        method: 'POST',
        body: formDataUpload
      });

      if (response.ok) {
        const result = await response.json();
        success('Аватар обновлен!', 'Изображение профиля успешно изменено');
        setAvatarFile(null);
        // Обновляем превью с новым URL
        setAvatarPreview(result.avatarUrl);
        // Перезагружаем страницу для обновления аватара в хедере
        window.location.reload();
      } else {
        const errorText = await response.text();
        showError('Ошибка загрузки', errorText);
      }
    } catch (error) {
      console.error('Ошибка загрузки аватара:', error);
      showError('Ошибка соединения', 'Не удалось загрузить аватар');
    } finally {
      setAvatarUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Смена пароля */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-[#1E293B] dark:text-white mb-6">Смена пароля</h2>
        
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#374151] dark:text-gray-300 mb-2">
              Текущий пароль
            </label>
            <input
              type="password"
              value={formData.currentPassword}
              onChange={(e) => setFormData(prev => ({ ...prev, currentPassword: e.target.value }))}
              required
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-[#1E293B] dark:text-white focus:border-[#1A6DFF] focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#374151] dark:text-gray-300 mb-2">
              Новый пароль
            </label>
            <input
              type="password"
              value={formData.newPassword}
              onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
              required
              minLength={8}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-[#1E293B] dark:text-white focus:border-[#1A6DFF] focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20 transition-all"
            />
            <p className="text-sm text-[#64748B] dark:text-gray-400 mt-1">Минимум 8 символов</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#374151] dark:text-gray-300 mb-2">
              Подтвердите новый пароль
            </label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
              required
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-[#1E293B] dark:text-white focus:border-[#1A6DFF] focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20 transition-all"
            />
          </div>

          <button 
            type="submit"
            disabled={passwordChanging}
            className="bg-gradient-to-r from-[#1A6DFF] to-[#00C5FF] text-white px-6 py-2 rounded-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {passwordChanging ? 'Изменение...' : 'Изменить пароль'}
          </button>
        </form>
      </div>

      {/* Загрузка аватара */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-[#1E293B] dark:text-white mb-6">Аватар</h2>
        
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
              {avatarLoading && (
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse"></div>
              )}
              {avatarPreview ? (
                <img 
                  src={avatarPreview} 
                  alt="Аватар" 
                  className={`w-full h-full object-cover transition-opacity duration-200 ${avatarLoading ? 'opacity-0' : 'opacity-100'}`}
                  onLoad={() => setAvatarLoading(false)}
                  onError={() => setAvatarLoading(false)}
                />
              ) : (
                <User size={24} className="text-gray-400" />
              )}
            </div>
            
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
                id="avatar-upload"
              />
              <label
                htmlFor="avatar-upload"
                className="cursor-pointer bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
              >
                Выбрать файл
              </label>
              <p className="text-sm text-[#64748B] dark:text-gray-400 mt-1">
                PNG, JPG, GIF до 5MB
              </p>
            </div>
          </div>

          {avatarFile && (
            <div className="flex gap-3">
              <button
                onClick={handleAvatarUpload}
                disabled={avatarUploading}
                className="bg-gradient-to-r from-[#1A6DFF] to-[#00C5FF] text-white px-6 py-2 rounded-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {avatarUploading ? 'Загрузка...' : 'Загрузить аватар'}
              </button>
              
              <button
                onClick={() => {
                  setAvatarFile(null);
                  setAvatarPreview('');
                }}
                className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-all"
              >
                Отмена
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Информация о безопасности */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5">
            ⚠️
          </div>
          <div>
            <h3 className="font-medium text-yellow-800 dark:text-yellow-200">Безопасность</h3>
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
              Доступ к этому разделу имеет только администратор go@osama.agency. 
              Все изменения логируются в системе безопасности.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

 