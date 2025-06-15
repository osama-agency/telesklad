import { Decimal } from '@prisma/client/runtime/library';

export interface Product {
  id: number;
  name: string;
  description: string | null;
  price: Decimal | null;
  prime_cost: Decimal | null;
  avgPurchasePriceRub: Decimal | null;
  stock_quantity: number | null;
  soldQuantity?: number; // Количество проданных штук
  revenue?: number; // Общая выручка
  baseCost?: number; // Себестоимость
  expenseShare?: number; // Доля общих расходов
  deliveryCost?: number; // Стоимость доставки
  totalCosts?: number; // Общие расходы
  netProfitPerUnit?: number; // Чистая прибыль с 1 шт
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
  ancestry: string | null;
  weight: string | null;
  dosage_form: string | null;
  package_quantity: number | null;
  main_ingredient: string | null;
  brand: string | null;
  old_price: Decimal | null;
  is_visible: boolean;
}

export interface ProductFormData {
  name: string;
  description?: string;
  price?: number;
  stock_quantity?: number;
  ancestry?: string;
  weight?: string;
  dosage_form?: string;
  package_quantity?: number;
  main_ingredient?: string;
  brand?: string;
  old_price?: number;
  is_visible?: boolean;
}

export interface ProductStats {
  totalCount: number;
  visibleCount: number;
  hiddenCount: number;
  deletedCount: number;
}

export interface ProductFilters {
  search?: string;
  isVisible?: boolean;
  showDeleted?: boolean;
  brand?: string;
  dosageForm?: string;
  priceRange?: {
    min?: number;
    max?: number;
  };
}

// Типы для API синхронизации с внешним сервисом
export interface ExternalProduct {
  id: number;
  name: string;
  description: string | null;
  price: string | null;
  stock_quantity: number | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  ancestry: string | null;
  weight: string | null;
  dosage_form: string | null;
  package_quantity: number | null;
  main_ingredient: string | null;
  brand: string | null;
  old_price: string | null;
}

export interface SyncResult {
  syncedCount: number;
  errors: string[];
  lastSyncAt: Date;
} 