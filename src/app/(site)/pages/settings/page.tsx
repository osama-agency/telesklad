"use client";

import { useState, useEffect } from "react";
import { Settings, Database, Mail, Bell, Shield, Globe, Star, CreditCard, FileText, Package } from "lucide-react";
import BonusLogsTable from '@/components/BonusLogs/BonusLogsTable';
import StockLogsTable from '@/components/StockLogs/StockLogsTable';

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
    { id: "webapp", label: "Веб-приложение", icon: Globe },
    { id: "telegram", label: "Telegram интеграция", icon: Bell },
    { id: "notifications", label: "Уведомления", icon: Mail },
    { id: "exchange", label: "Валютные курсы", icon: CreditCard },
    { id: "backup", label: "Резервное копирование", icon: Database },
    { id: "api", label: "API настройки", icon: Shield },
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
      case "exchange":
        return <ExchangeSettings data={settingsData} onSave={saveSettings} saving={saving} />;
      case "backup":
        return <BackupSettings data={settingsData} onSave={saveSettings} saving={saving} />;
      case "api":
        return <ApiSettings data={settingsData} onSave={saveSettings} saving={saving} />;
      default:
        return <SystemSettings data={settingsData} onSave={saveSettings} saving={saving} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Настройки</h1>
          <p className="text-gray-600">Управление настройками системы и конфигурацией</p>
        </div>

        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-64 bg-white rounded-lg shadow-sm border border-gray-200 p-6 h-fit">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : "text-gray-700 hover:bg-gray-50"
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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Системные настройки</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Название магазина
          </label>
          <input
            type="text"
            value={formData.shop_name}
            onChange={(e) => setFormData(prev => ({ ...prev, shop_name: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Минимальная сумма заказа (₽)
            </label>
            <input
              type="number"
              value={formData.min_order_amount}
              onChange={(e) => setFormData(prev => ({ ...prev, min_order_amount: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Стоимость доставки (₽)
            </label>
            <input
              type="number"
              value={formData.delivery_price}
              onChange={(e) => setFormData(prev => ({ ...prev, delivery_price: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">Режим технического обслуживания</h3>
              <p className="text-sm text-gray-600">Временно закрыть доступ к веб-приложению</p>
            </div>
            <input
              type="checkbox"
              checked={formData.maintenance_mode}
              onChange={(e) => setFormData(prev => ({ ...prev, maintenance_mode: e.target.checked }))}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">Автоматическое обновление остатков</h3>
              <p className="text-sm text-gray-600">Синхронизация с внешними системами</p>
            </div>
            <input
              type="checkbox"
              checked={formData.auto_update_stock}
              onChange={(e) => setFormData(prev => ({ ...prev, auto_update_stock: e.target.checked }))}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
          </div>
        </div>

        <button 
          type="submit"
          disabled={saving}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Программа лояльности</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Порог для начисления бонусов (₽)
          </label>
          <input
            type="number"
            value={formData.bonus_threshold}
            onChange={(e) => setFormData(prev => ({ ...prev, bonus_threshold: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="text-sm text-gray-500 mt-1">Минимальная сумма заказа для начисления бонусов</p>
        </div>

        {/* Статистика пользователей */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">Статистика пользователей</h3>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-blue-700 font-medium">{data.orderStats.totalUsers}</div>
              <div className="text-blue-600">Всего пользователей</div>
            </div>
            <div>
              <div className="text-blue-700 font-medium">{data.orderStats.usersWithOrders}</div>
              <div className="text-blue-600">С заказами</div>
            </div>
            <div>
              <div className="text-blue-700 font-medium">{data.orderStats.totalUsers - data.orderStats.usersWithOrders}</div>
              <div className="text-blue-600">Без заказов</div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-medium text-gray-900">Уровни лояльности</h3>
          
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
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
          >
            {saving ? 'Сохранение...' : 'Сохранить настройки'}
          </button>
          
          <button 
            type="button"
            onClick={handleRecalculateTiers}
            disabled={saving}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400"
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
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Настройки веб-приложения</h2>
      <p className="text-gray-600">Функциональность будет добавлена в следующих версиях.</p>
    </div>
  );
}

function TelegramSettings({ data, onSave, saving }: SettingsComponentProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Telegram интеграция</h2>
      <p className="text-gray-600">Функциональность будет добавлена в следующих версиях.</p>
    </div>
  );
}

function NotificationSettings({ data, onSave, saving }: SettingsComponentProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Настройки уведомлений</h2>
      <p className="text-gray-600">Функциональность будет добавлена в следующих версиях.</p>
    </div>
  );
}

function ExchangeSettings({ data, onSave, saving }: SettingsComponentProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Валютные курсы</h2>
      <p className="text-gray-600">Функциональность будет добавлена в следующих версиях.</p>
    </div>
  );
}

function BackupSettings({ data, onSave, saving }: SettingsComponentProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Резервное копирование</h2>
      <p className="text-gray-600">Функциональность будет добавлена в следующих версиях.</p>
    </div>
  );
}

function ApiSettings({ data, onSave, saving }: SettingsComponentProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">API настройки</h2>
      <p className="text-gray-600">Функциональность будет добавлена в следующих версиях.</p>
    </div>
  );
} 