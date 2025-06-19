import React from 'react';
import OrderStatusBadge from './OrderStatusBadge';

const OrderStatusExample: React.FC = () => {
  // Примеры всех статусов
  const statusExamples = [
    'shipped',
    'cancelled', 
    'overdue',
    'processing',
    'unpaid',
    'completed',
    'delivered',
    'paid',
    'confirmed'
  ];

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">Статусы заказов</h2>
      <div className="grid grid-cols-3 gap-4">
        {statusExamples.map((status) => (
          <div key={status} className="flex items-center gap-2">
            <OrderStatusBadge status={status} />
            <span className="text-sm text-gray-500">({status})</span>
          </div>
        ))}
      </div>
      
      <div className="mt-6 text-sm text-gray-600">
        <p><strong>Учитываются как продажи:</strong> все статусы, кроме &quot;Не оплачен&quot; и &quot;Просрочен&quot;</p>
        <p><strong>Критерий продажи:</strong> поле paid_at !== null в базе данных</p>
      </div>
    </div>
  );
};

export default OrderStatusExample; 