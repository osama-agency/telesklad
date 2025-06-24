// Переводы статусов заказов
export const orderStatusTranslations = {
  // Основные статусы согласно требованиям пользователя
  shipped: 'Отправлен',      // зелёный #2AC769
  cancelled: 'Отменён',      // красный #FF4B4B  
  overdue: 'Просрочен',      // жёлтый #FFC732
  processing: 'В обработке',  // синий #5AC8FA
  unpaid: 'Ожидает оплаты',      // оранжевый #F5A623
  
  // Дополнительные статусы
  completed: 'Завершён',
  delivered: 'Доставлен', 
  paid: 'Проверка оплаты',
  confirmed: 'Подтверждён',
  
  // Для обратной совместимости
  pending: 'Ожидает',
  refunded: 'Возвращён',
  failed: 'Неудачный'
} as const;

// Цвета для статусов
export const orderStatusColors = {
  shipped: '#2AC769',    // зелёный
  cancelled: '#FF4B4B',  // красный
  overdue: '#FFC732',    // жёлтый
  processing: '#5AC8FA', // синий
  unpaid: '#F5A623',     // оранжевый
  
  // Дополнительные цвета
  completed: '#10B981',   // emerald-500
  delivered: '#3B82F6',   // blue-500
  paid: '#059669',        // emerald-600
  confirmed: '#8B5CF6',   // purple-500
  
  pending: '#6B7280',     // gray-500
  refunded: '#F59E0B',    // amber-500
  failed: '#EF4444'       // red-500
} as const;

// Функция для получения перевода статуса
export const getOrderStatusTranslation = (status: string): string => {
  const key = status.toLowerCase() as keyof typeof orderStatusTranslations;
  return orderStatusTranslations[key] || status;
};

// Функция для получения цвета статуса
export const getOrderStatusColor = (status: string): string => {
  const key = status.toLowerCase() as keyof typeof orderStatusColors;
  return orderStatusColors[key] || '#6B7280'; // серый по умолчанию
};

// Список статусов, которые считаются "продажами" (оплаченными)
export const paidOrderStatuses = [
  'shipped',    // отправлен
  'cancelled',  // отменён (но может быть оплачен)
  'processing', // в обработке (но оплачен)
  'completed',  // завершён
  'delivered',  // доставлен
  'paid',       // проверка оплаты
  'confirmed'   // подтверждён
] as const;

// Список статусов, которые НЕ считаются продажами
export const unpaidOrderStatuses = [
  'unpaid',     // ожидает оплаты
  'overdue'     // просрочен
] as const; 