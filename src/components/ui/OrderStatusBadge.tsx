import React from 'react';
import { getOrderStatusTranslation, getOrderStatusColor } from '../../utils/orderStatusTranslations';

interface OrderStatusBadgeProps {
  status: string;
  className?: string;
}

const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ status, className = '' }) => {
  const getStatusConfig = (status: string) => {
    const normalizedStatus = status.toLowerCase();
    const label = getOrderStatusTranslation(status);
    const baseColor = getOrderStatusColor(status);
    
    // Определяем цвет фона и текста на основе статуса
    let bgColorClass = '';
    let textColorClass = 'text-white';
    let icon = '';

    switch (normalizedStatus) {
      case 'shipped':
        bgColorClass = 'bg-[#2AC769]';
        icon = '📦';
        break;
      case 'cancelled':
        bgColorClass = 'bg-[#FF4B4B]';
        icon = '❌';
        break;
      case 'overdue':
        bgColorClass = 'bg-[#FFC732]';
        textColorClass = 'text-black';
        icon = '⏰';
        break;
      case 'processing':
        bgColorClass = 'bg-[#5AC8FA]';
        icon = '🔄';
        break;
      case 'unpaid':
        bgColorClass = 'bg-[#F5A623]';
        icon = '💳';
        break;
      case 'completed':
        bgColorClass = 'bg-green-600';
        icon = '✅';
        break;
      case 'delivered':
        bgColorClass = 'bg-blue-600';
        icon = '🚚';
        break;
      case 'paid':
        bgColorClass = 'bg-emerald-600';
        icon = '💰';
        break;
      case 'confirmed':
        bgColorClass = 'bg-purple-600';
        icon = '✔️';
        break;
      default:
        bgColorClass = 'bg-gray-500';
        icon = '❓';
        break;
    }

    return {
      label,
      color: `${bgColorClass} ${textColorClass}`,
      icon
    };
  };

  const config = getStatusConfig(status);

  return (
    <span 
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color} ${className}`}
    >
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </span>
  );
};

export default OrderStatusBadge; 