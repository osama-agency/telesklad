import { Decimal } from '@prisma/client/runtime/library';

// Основные типы для Order и OrderItem
export interface Order {
  id: string;
  externalid: string | null;
  customername: string | null;
  customeremail: string | null;
  customerphone: string | null;
  status: number;
  total_amount: Decimal;
  currency: string;
  orderdate: Date | null;
  created_at: Date;
  updated_at: Date;
  bankcard: string | null;
  bonus: number;
  customercity: string | null;
  deliverycost: Decimal | null;
  paid_at: Date | null;
  shipped_at: Date | null;
  customeraddress: string | null;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: Decimal | null;
  created_at: Date;
  updated_at: Date;
}

// Типы для внешнего API (обновлено под реальную структуру)
export interface ExternalOrder {
  id: number;
  status: string;
  total_amount: string;
  bonus: number;
  bank_card?: string;
  delivery_cost: number;
  paid_at?: string | null;
  shipped_at?: string | null;
  created_at: string;
  user?: {
    id: number;
    city?: string;
    full_name?: string;
  };
  order_items?: ExternalOrderItem[];
}

export interface ExternalOrderItem {
  id?: string;
  product_id?: string;
  name: string;
  quantity: number | string;
  price: string | number;
  total: string | number;
}

// Статистика синхронизации
export interface SyncResult {
  ordersProcessed: number;
  ordersCreated: number;
  ordersUpdated: number;
  itemsProcessed: number;
  errors: string[];
  lastSyncAt: Date;
  duration: number; // в миллисекундах
}

// Статистика заказов
export interface OrderStats {
  totalOrders: number;
  totalRevenue: Decimal;
  newOrders: number;
  completedOrders: number;
  pendingOrders: number;
  averageOrderValue: Decimal;
}

// Фильтры для заказов
export interface OrderFilters {
  search?: string;
  status?: number;
  dateFrom?: Date;
  dateTo?: Date;
  customercity?: string;
  minTotal?: number;
  maxTotal?: number;
  currency?: string;
  isPaid?: boolean;
  isShipped?: boolean;
}

// Формат для создания/обновления заказа
export interface OrderFormData {
  customername?: string;
  customeremail?: string;
  customerphone?: string;
  status: number;
  total_amount: number;
  currency?: string;
  orderdate: Date;
  bankcard?: string;
  bonus?: number;
  customercity?: string;
  deliverycost?: number;
  customeraddress?: string;
  items: OrderItemFormData[];
}

export interface OrderItemFormData {
  product_id: string;
  quantity: number;
  price: number;
}

// Константы статусов заказов
export const ORDER_STATUSES = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
} as const;

export type OrderStatus = typeof ORDER_STATUSES[keyof typeof ORDER_STATUSES];

// Конфигурация синхронизации
export interface SyncConfig {
  apiUrl: string;
  apiToken: string;
  syncInterval: number; // в миллисекундах
  batchSize: number;
  retryAttempts: number;
  retryDelay: number; // в миллисекундах
} 