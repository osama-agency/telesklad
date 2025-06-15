import { Decimal } from '@prisma/client/runtime/library';

// Основные типы для Order и OrderItem
export interface Order {
  id: string;
  externalId: string;
  customerName: string | null;
  customerEmail: string | null;
  customerPhone: string | null;
  status: string;
  total: Decimal;
  currency: string;
  orderDate: Date;
  createdAt: Date;
  updatedAt: Date;
  bankCard: string | null;
  bonus: Decimal;
  customerCity: string | null;
  deliveryCost: Decimal;
  paidAt: Date | null;
  shippedAt: Date | null;
  customerAddress: string | null;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string | null;
  name: string;
  quantity: number;
  price: Decimal;
  total: Decimal;
  createdAt: Date;
  updatedAt: Date;
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
  status?: string;
  dateFrom?: Date;
  dateTo?: Date;
  customerCity?: string;
  minTotal?: number;
  maxTotal?: number;
  currency?: string;
  isPaid?: boolean;
  isShipped?: boolean;
}

// Формат для создания/обновления заказа
export interface OrderFormData {
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  status: string;
  total: number;
  currency?: string;
  orderDate: Date;
  bankCard?: string;
  bonus?: number;
  customerCity?: string;
  deliveryCost?: number;
  customerAddress?: string;
  items: OrderItemFormData[];
}

export interface OrderItemFormData {
  productId?: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
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