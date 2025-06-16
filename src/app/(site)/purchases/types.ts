export interface Product {
  id: number;
  name: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseItem {
  id: number;
  quantity: number;
  costPrice: number;
  total: number;
  purchaseId: number;
  productId: number;
  product: Product;
  createdAt: string;
  updatedAt: string;
}

export interface Purchase {
  id: number;
  createdAt: string;
  updatedAt: string;
  totalAmount: number;
  status: "draft" | "ordered" | "in_transit" | "received" | "cancelled";
  isUrgent: boolean;
  expenses?: number;
  userId: string;
  items: PurchaseItem[];
}

// Типы для черновиков и форм
export interface DraftPurchaseItem {
  id: string;
  productId: number;
  productName: string;
  quantity: number;
  costPrice: number;
  total: number;
}

export interface CreatePurchaseRequest {
  items: {
    quantity: number;
    costPrice: number;
    total: number;
    productId: number;
  }[];
  totalAmount: number;
  isUrgent: boolean;
  expenses?: number;
}

export interface UpdatePurchaseRequest extends Partial<CreatePurchaseRequest> {
  status?: "draft" | "ordered" | "in_transit" | "received" | "cancelled";
} 