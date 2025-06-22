import React, { useState } from 'react';

interface StatusButtonsProps {
  currentStatus: string;
  purchaseId: number;
  onStatusChange: (newStatus: string) => void;
  disabled?: boolean;
  onReceiveClick?: () => void; // Callback для кнопки оприходования
}

const StatusButtons: React.FC<StatusButtonsProps> = ({
  currentStatus,
  purchaseId,
  onStatusChange,
  disabled = false,
  onReceiveClick
}) => {
  const [loading, setLoading] = useState(false);

  // Определяем доступные статусы для каждого текущего статуса
  const getAvailableStatuses = (status: string): Array<{ key: string; label: string; color: string; icon: string; isReceiveAction?: boolean }> => {
    const statusFlow = {
      'draft': [
        { key: 'sent', label: 'Отправить в Телеграм', color: 'bg-gradient-to-r from-[#1A6DFF] to-[#00C5FF] text-white', icon: '📤' }
      ],
      'sent': [
        { key: 'paid', label: 'Оплачено', color: 'bg-gradient-to-r from-green-500 to-emerald-600 text-white', icon: '💰' },
        { key: 'draft', label: 'Вернуть в черновик', color: 'bg-gray-500 text-white', icon: '🗒️' }
      ],
      'sent_to_supplier': [
        { key: 'paid', label: 'Оплачено', color: 'bg-gradient-to-r from-green-500 to-emerald-600 text-white', icon: '💰' },
        { key: 'draft', label: 'Вернуть в черновик', color: 'bg-gray-500 text-white', icon: '🗒️' }
      ],
      'paid': [
        { key: 'in_transit', label: 'В пути', color: 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white', icon: '🛫' },
        { key: 'sent', label: 'Вернуть к отправке', color: 'bg-blue-500 text-white', icon: '📤' }
      ],
      'in_transit': [
        { key: 'received', label: 'Оприходовать', color: 'bg-gradient-to-r from-emerald-500 to-green-600 text-white', icon: '📦', isReceiveAction: true },
        { key: 'paid', label: 'Вернуть к оплаченному', color: 'bg-green-500 text-white', icon: '💰' }
      ],
      'received': [
        { key: 'in_transit', label: 'Вернуть в путь', color: 'bg-cyan-500 text-white', icon: '🛫' }
      ],
      'cancelled': [
        { key: 'draft', label: 'Восстановить', color: 'bg-gray-500 text-white', icon: '🔄' }
      ]
    };

    return statusFlow[status as keyof typeof statusFlow] || [];
  };

  const handleStatusChange = async (newStatus: string) => {
    setLoading(true);
    
    try {
      const response = await fetch(`/api/purchases/${purchaseId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus, sendNotifications: false }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update status');
      }

      onStatusChange(newStatus);
    } catch (error) {
      console.error('Error updating status:', error);
      // Здесь можно добавить toast уведомление об ошибке
    } finally {
      setLoading(false);
    }
  };

  const handleButtonClick = (statusOption: any) => {
    if (statusOption.isReceiveAction && onReceiveClick) {
      onReceiveClick();
    } else {
      handleStatusChange(statusOption.key);
    }
  };

  const availableStatuses = getAvailableStatuses(currentStatus);

  if (availableStatuses.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center space-x-2 flex-wrap gap-2">
      {availableStatuses.map((statusOption) => (
        <button
          key={statusOption.key}
          onClick={() => handleButtonClick(statusOption)}
          disabled={disabled || loading}
          className={`
            group relative overflow-hidden px-4 py-2 rounded-lg font-medium text-sm
            transition-all duration-300 hover:scale-105 hover:shadow-lg 
            focus:outline-none focus:ring-2 focus:ring-opacity-20
            disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
            ${statusOption.color}
          `}
        >
          {loading ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Обновление...</span>
            </div>
          ) : (
            <span className="relative z-10 flex items-center space-x-1">
              <span>{statusOption.icon}</span>
              <span>{statusOption.label}</span>
            </span>
          )}
          <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </button>
      ))}
    </div>
  );
};

export default StatusButtons; 